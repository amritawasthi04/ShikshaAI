"""Database Worker executing controlled reads and writes for Teacher Brain and specialist agents."""
from datetime import datetime
import logging
from typing import Any, Dict, List, Optional
from motor.motor_asyncio import AsyncIOMotorDatabase
from app.core.execution.policy import is_tool_allowed_for_role
from app.core.schemas.plan import ToolGroup, WorkerRole
from app.db.chroma_client import chroma_manager
from app.db.connection import mongo_manager
from app.db.models.base import utc_now
from app.db.models.chat import ChatMessageModel, CitationModel, ConversationModel, SummaryModel
from app.db.models.core import (
    AssessmentModel,
    AssessmentRubricModel,
    AttemptModel,
    DocumentModel,
    DocumentPassageModel,
    GoalModel,
    LearnerModel,
    LearnerSkillModel,
    LessonProgressModel,
    LessonVersionModel,
    PreferenceModel,
    ProposalModel,
    RoadmapModel,
    RoadmapVersionModel,
    SkillEvidenceModel,
    StudySessionModel,
)
from app.db.repositories.chat import ChatRepository
from app.db.repositories.core import (
    AssessmentRepository,
    DocumentRepository,
    LearnerRepository,
    LessonRepository,
    ProposalRepository,
    RoadmapRepository,
    SkillRepository,
)

logger = logging.getLogger("pathai.db.worker")


class DatabaseWorkerPermissionError(PermissionError):
    """Raised when a worker role requests a tool outside its authorized scope."""
    pass


class DatabaseWorker:
    """The controlled data gateway executing authorized operations requested by agentic models."""

    def __init__(
        self,
        learner_id: str,
        role: WorkerRole,
        core_db: Optional[AsyncIOMotorDatabase] = None,
        chat_db: Optional[AsyncIOMotorDatabase] = None,
    ) -> None:
        self.learner_id = learner_id
        self.role = role
        self.core_db = core_db if core_db is not None else mongo_manager.get_core_db()
        self.chat_db = chat_db if chat_db is not None else mongo_manager.get_chat_db()

        # Initialize domain repositories
        self.learner_repo = LearnerRepository(self.core_db)
        self.skill_repo = SkillRepository(self.core_db)
        self.roadmap_repo = RoadmapRepository(self.core_db)
        self.lesson_repo = LessonRepository(self.core_db)
        self.assessment_repo = AssessmentRepository(self.core_db)
        self.document_repo = DocumentRepository(self.core_db)
        self.proposal_repo = ProposalRepository(self.core_db)
        self.chat_repo = ChatRepository(self.chat_db)

    def _verify_tool_permission(self, tool_name: str, tool_group: ToolGroup) -> None:
        """Enforce role-based access control and principle of least privilege."""
        if not is_tool_allowed_for_role(self.role, tool_name, tool_group):
            raise DatabaseWorkerPermissionError(
                f"Worker role '{self.role.value}' is not authorized to use tool '{tool_name}' "
                f"in tool group '{tool_group.value}'."
            )

    # =========================================================================
    # Phase 2: Learner Records (ToolGroup.LEARNER_RECORDS)
    # =========================================================================

    async def get_learner_context(self) -> Dict[str, Any]:
        """Fetch learner profile, preferences, active goals, and current roadmap status."""
        self._verify_tool_permission("get_learner_context", ToolGroup.LEARNER_RECORDS)

        profile = await self.learner_repo.get_by_id(self.learner_id)
        prefs = await self.learner_repo.get_preferences(self.learner_id)
        goals = await self.learner_repo.get_active_goals(self.learner_id)
        roadmap = await self.roadmap_repo.get_active_roadmap(self.learner_id)

        return {
            "learner_id": self.learner_id,
            "profile": profile.model_dump() if profile else None,
            "preferences": prefs.model_dump() if prefs else None,
            "active_goals": [g.model_dump() for g in goals],
            "active_roadmap": roadmap.model_dump() if roadmap else None,
        }

    async def get_learner_progress_overview(self) -> Dict[str, Any]:
        """Fetch distinct Activity metrics and Understanding evidence.

        Activity: lessons opened, completed, study time.
        Understanding: evaluated assessments, verified skills, identified misconceptions.
        """
        self._verify_tool_permission("get_learner_progress_overview", ToolGroup.LEARNER_RECORDS)

        # 1. Activity data
        progress_records = await self.lesson_repo.progress.find_many({"learner_id": self.learner_id})
        sessions = await self.lesson_repo.sessions.find_many({"learner_id": self.learner_id}, limit=100)
        total_study_seconds = sum(s.active_seconds for s in sessions)
        completed_lessons = [p.lesson_id for p in progress_records if p.status in ("completed", "mastered")]

        # 2. Understanding data
        skills = await self.skill_repo.learner_skills.find_many({"learner_id": self.learner_id})
        recent_evidence = await self.skill_repo.evidence.find_many(
            {"learner_id": self.learner_id, "verification_state": "verified"},
            sort=[("observed_at", -1)],
            limit=20,
        )

        misconceptions = []
        for ev in recent_evidence:
            misconceptions.extend(ev.misconceptions)

        return {
            "learner_id": self.learner_id,
            "activity": {
                "total_lessons_tracked": len(progress_records),
                "completed_lessons": completed_lessons,
                "total_study_time_seconds": total_study_seconds,
                "total_sessions": len(sessions),
            },
            "understanding": {
                "mastered_skills": [
                    {"skill_id": s.skill_id, "mastery_score": s.mastery_score, "confidence": s.confidence_score}
                    for s in skills
                ],
                "recent_verified_evidence_count": len(recent_evidence),
                "active_misconceptions": list(set(misconceptions)),
            },
        }

    # =========================================================================
    # Phase 3: Chat History
    # =========================================================================

    async def get_recent_conversation_history(
        self,
        conversation_id: str,
        limit: int = 20,
    ) -> Dict[str, Any]:
        """Fetch ordered recent messages and latest source-linked summary for context."""
        summary = await self.chat_repo.get_latest_summary(conversation_id)
        messages = await self.chat_repo.get_messages(conversation_id, limit=limit)

        return {
            "conversation_id": conversation_id,
            "summary": summary.text if summary else None,
            "messages": [m.model_dump() for m in messages],
        }

    # =========================================================================
    # Phase 4: Knowledge Retrieval with MongoDB Source Verification
    # =========================================================================

    async def retrieve_verified_knowledge(
        self,
        query: str,
        limit: int = 5,
        include_public: bool = True,
    ) -> List[Dict[str, Any]]:
        """Search Chroma Cloud, then strictly verify source document and access in MongoDB."""
        self._verify_tool_permission("retrieve_verified_knowledge", ToolGroup.KNOWLEDGE)

        # 1. Search Chroma Cloud using Hybrid Search (RRF) and GroupBy chunk deduplication
        raw_results = chroma_manager.search_hybrid(
            query=query,
            learner_id=self.learner_id,
            limit=limit * 2,  # Query extra candidates to account for potential unverified drops
            include_public=include_public,
            deduplicate_documents=True,
        )

        verified_passages: List[Dict[str, Any]] = []

        # 2. Architectural Step: Verify source and access in MongoDB (pathai_core)
        for cand in raw_results:
            # Query authoritative MongoDB passage record
            passage_doc = await self.document_repo.passages.find_one({"passage_id": cand.passage_id})
            if not passage_doc:
                # If passage was purged or not present in authoritative MongoDB store, discard
                continue

            # Verify ownership: must belong to this learner or be marked public
            if not passage_doc.is_public and passage_doc.learner_id != self.learner_id:
                logger.warning(
                    "Access denied to passage %s: owned by %s, requested by %s",
                    cand.passage_id,
                    passage_doc.learner_id,
                    self.learner_id,
                )
                continue

            # Verify extraction quality threshold (unreliable passages excluded from tutoring)
            if passage_doc.extraction_quality < 0.65:
                continue

            # Fetch parent document metadata for authoritative source citation
            parent_doc = await self.document_repo.get_document(passage_doc.document_id)
            source_title = parent_doc.filename if parent_doc else "Learning Material"

            verified_passages.append({
                "passage_id": passage_doc.passage_id,
                "document_id": passage_doc.document_id,
                "source_title": source_title,
                "page_number": passage_doc.page_number,
                "section_title": passage_doc.section_title,
                "snippet": passage_doc.content_text,
                "skill_tags": passage_doc.skill_tags,
                "relevance_score": cand.score,
                "is_public": passage_doc.is_public,
            })

            if len(verified_passages) >= limit:
                break

        return verified_passages

    # =========================================================================
    # Phase 5: Assessments & Progressive Understanding
    # =========================================================================

    async def get_assessment_questions(self, assessment_id: str) -> Optional[AssessmentModel]:
        """Fetch public assessment questions. Never leaks scoring rubrics or answers."""
        self._verify_tool_permission("get_assessment_questions", ToolGroup.ASSESSMENT)
        return await self.assessment_repo.get_assessment(assessment_id)

    async def get_assessment_rubric_isolated(self, assessment_id: str) -> AssessmentRubricModel:
        """Fetch private scoring criteria and answer keys. Restricted strictly to EVALUATION worker."""
        self._verify_tool_permission("get_assessment_rubric_isolated", ToolGroup.ASSESSMENT)

        # Enforce role boundary: Only ASSESSMENT_EVALUATION role may read private rubrics
        if self.role != WorkerRole.ASSESSMENT_EVALUATION:
            raise DatabaseWorkerPermissionError(
                f"Access to private assessment rubrics is strictly restricted to "
                f"'{WorkerRole.ASSESSMENT_EVALUATION.value}' workers. "
                f"Role '{self.role.value}' was rejected."
            )

        rubric = await self.assessment_repo.get_rubric_isolated(assessment_id)
        if not rubric:
            raise ValueError(f"No private rubric found for assessment '{assessment_id}'")
        return rubric

    async def record_lesson_activity(
        self,
        lesson_id: str,
        status: str,
        active_seconds: int = 0,
    ) -> None:
        """Record participation/activity only (lesson progress and study session).

        Notice: Participation does NOT change skill mastery or understanding evidence.
        """
        # Learner records permission
        self._verify_tool_permission("record_lesson_activity", ToolGroup.LEARNER_RECORDS)

        await self.lesson_repo.update_progress(
            learner_id=self.learner_id,
            lesson_id=lesson_id,
            status=status,
        )

        if active_seconds > 0:
            session = StudySessionModel(
                session_id=f"sess_{self.learner_id}_{int(utc_now().timestamp())}",
                learner_id=self.learner_id,
                lesson_id=lesson_id,
                active_seconds=active_seconds,
                measurement_source="worker_interaction",
                started_at=utc_now(),
            )
            await self.lesson_repo.record_session(session)

    async def save_evaluated_assessment(
        self,
        assessment_id: str,
        attempt_id: str,
        score: float,
        answers: Dict[str, Any],
        feedback: str,
        skill_evaluations: List[Dict[str, Any]],
    ) -> Dict[str, Any]:
        """Record verified understanding evidence from a graded assessment and update mastery."""
        self._verify_tool_permission("save_evaluated_assessment", ToolGroup.ASSESSMENT)

        if self.role != WorkerRole.ASSESSMENT_EVALUATION:
            raise DatabaseWorkerPermissionError(
                f"Only '{WorkerRole.ASSESSMENT_EVALUATION.value}' may persist evaluated assessments."
            )

        evidence_ids = []
        updated_skills = []

        # 1. Persist verified evidence items for each assessed skill
        for se in skill_evaluations:
            skill_id = se["skill_id"]
            skill_score = float(se.get("score", score))
            misconceptions = se.get("misconceptions", [])
            dedupe_key = f"attempt_{attempt_id}_{skill_id}"

            ev = SkillEvidenceModel(
                evidence_id=f"ev_{attempt_id}_{skill_id}",
                learner_id=self.learner_id,
                skill_id=skill_id,
                source_type="assessment",
                source_id=attempt_id,
                score=skill_score,
                misconceptions=misconceptions,
                verification_state="verified",
                observed_at=utc_now(),
                dedupe_key=dedupe_key,
            )
            saved_ev = await self.skill_repo.record_evidence_idempotent(ev)
            evidence_ids.append(saved_ev.evidence_id)

            # Recompute mastery score for the evaluated skill
            new_mastery = await self.skill_repo.recompute_mastery(self.learner_id, skill_id)
            updated_skills.append({"skill_id": skill_id, "new_mastery": new_mastery})

        # 2. Persist attempt record
        attempt = AttemptModel(
            attempt_id=attempt_id,
            learner_id=self.learner_id,
            assessment_id=assessment_id,
            assessment_version=1,
            answers=answers,
            grading_state="graded",
            score=score,
            feedback=feedback,
            evidence_ids=evidence_ids,
        )
        await self.assessment_repo.save_attempt(attempt)

        return {
            "attempt_id": attempt_id,
            "overall_score": score,
            "evidence_count": len(evidence_ids),
            "updated_skills": updated_skills,
        }

    # =========================================================================
    # Phase 2 & 5: Roadmap Proposals (ToolGroup.PROPOSALS)
    # =========================================================================

    async def propose_roadmap_change(
        self,
        proposal_id: str,
        kind: str,
        base_version: int,
        proposed_version: int,
        rationale: str,
        diff_payload: Dict[str, Any],
    ) -> ProposalModel:
        """Submit a proposal for roadmap adaptation. Major changes require learner acceptance."""
        self._verify_tool_permission("propose_roadmap_change", ToolGroup.PROPOSALS)

        proposal = ProposalModel(
            proposal_id=proposal_id,
            learner_id=self.learner_id,
            kind=kind,
            base_version=base_version,
            proposed_version=proposed_version,
            rationale=rationale,
            diff_payload=diff_payload,
            status="proposed",
        )
        return await self.proposal_repo.create_proposal(proposal)
