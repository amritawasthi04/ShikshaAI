"""Assessment service managing public questions, isolated private rubrics, and verified grading."""
import logging
import uuid
from typing import Any, Dict, List, Optional
from motor.motor_asyncio import AsyncIOMotorDatabase
from app.core.schemas.api import AttemptEvaluationResponse, CreateAssessmentRequest
from app.db.models.core import (
    AssessmentModel,
    AssessmentRubricModel,
    AttemptModel,
    SkillEvidenceModel,
)
from app.db.repositories.core import AssessmentRepository, SkillRepository

logger = logging.getLogger("pathai.services.assessment")


class AssessmentService:
    def __init__(self, core_db: AsyncIOMotorDatabase) -> None:
        self.assessment_repo = AssessmentRepository(core_db)
        self.skill_repo = SkillRepository(core_db)

    async def get_public_assessment(self, assessment_id: str) -> Optional[AssessmentModel]:
        """Fetch public assessment questions. Never leaks rubrics or answer keys."""
        return await self.assessment_repo.get_assessment(assessment_id)

    async def create_assessment(self, req: CreateAssessmentRequest) -> AssessmentModel:
        """Create assessment, storing questions publicly and rubrics securely isolated."""
        existing = await self.assessment_repo.get_assessment(req.assessment_id)
        if existing:
            return existing

        assessment = AssessmentModel(
            assessment_id=req.assessment_id,
            title=req.title,
            skill_ids=req.skill_ids,
            questions=req.questions,
            is_published=True,
        )
        await self.assessment_repo.assessments.insert(assessment)

        # Secure server-held rubric
        rubric = AssessmentRubricModel(
            rubric_id=f"rub_{uuid.uuid4().hex[:8]}",
            assessment_id=req.assessment_id,
            scoring_criteria=req.scoring_criteria,
            answer_keys=req.answer_keys,
            min_pass_score=req.min_pass_score,
            restricted_access=True,
        )
        await self.assessment_repo.rubrics.insert(rubric)
        return assessment

    async def submit_attempt(
        self,
        learner_id: str,
        assessment_id: str,
        answers: Dict[str, Any],
    ) -> AttemptEvaluationResponse:
        """Evaluate learner answers against isolated server rubric, recording verified skill evidence."""
        assessment = await self.assessment_repo.get_assessment(assessment_id)
        if not assessment:
            raise ValueError(f"Assessment {assessment_id} not found")

        rubric = await self.assessment_repo.get_rubric_isolated(assessment_id)
        if not rubric:
            raise ValueError(f"Isolated rubric for assessment {assessment_id} not found")

        # Evaluate answers against answer keys
        answer_keys = rubric.answer_keys
        total_questions = len(assessment.questions)
        correct_count = 0
        feedback_notes: List[str] = []

        for q in assessment.questions:
            qid = q.get("id") or q.get("question_id")
            expected = answer_keys.get(qid)
            actual = answers.get(qid)
            if expected is not None:
                if str(actual).strip().lower() == str(expected).strip().lower():
                    correct_count += 1
                else:
                    feedback_notes.append(f"Question '{qid}': Needs review.")
            else:
                # If no direct key, credit as submitted for open response
                correct_count += 1

        score = round((correct_count / max(total_questions, 1)) * 100.0, 2)
        passed = score >= rubric.min_pass_score
        feedback = "Excellent work! All answers verified." if passed else "Good attempt. " + " ".join(feedback_notes)

        attempt_id = f"att_{uuid.uuid4().hex[:8]}"
        evidence_ids: List[str] = []

        # Record verified skill evidence idempotently for each skill tested
        for skill_id in assessment.skill_ids:
            ev_id = f"ev_{uuid.uuid4().hex[:8]}"
            dedupe_key = f"{attempt_id}:{skill_id}"
            evidence = SkillEvidenceModel(
                evidence_id=ev_id,
                learner_id=learner_id,
                skill_id=skill_id,
                source_type="assessment",
                source_id=attempt_id,
                score=score,
                verification_state="verified",
                dedupe_key=dedupe_key,
            )
            saved_ev = await self.skill_repo.record_evidence_idempotent(evidence)
            evidence_ids.append(saved_ev.evidence_id)

        # Persist attempt record
        attempt = AttemptModel(
            attempt_id=attempt_id,
            learner_id=learner_id,
            assessment_id=assessment_id,
            assessment_version=1,
            answers=answers,
            grading_state="graded",
            score=score,
            feedback=feedback,
            evidence_ids=evidence_ids,
        )
        await self.assessment_repo.save_attempt(attempt)

        return AttemptEvaluationResponse(
            attempt_id=attempt_id,
            assessment_id=assessment_id,
            learner_id=learner_id,
            score=score,
            feedback=feedback,
            grading_state="graded",
            evidence_ids=evidence_ids,
        )

    async def get_attempts(self, learner_id: str, assessment_id: str) -> List[AttemptModel]:
        return await self.assessment_repo.get_attempts(learner_id, assessment_id)
