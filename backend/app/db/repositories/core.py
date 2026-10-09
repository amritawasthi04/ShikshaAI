"""Repositories for pathai_core collections implementing business logic and safety checks."""
from datetime import datetime
import logging
from typing import Any, Dict, List, Optional
from motor.motor_asyncio import AsyncIOMotorDatabase
from pymongo import DESCENDING
from app.db.models.base import utc_now
from app.db.models.core import (
    AssessmentModel,
    AssessmentRubricModel,
    AttemptModel,
    DocumentModel,
    DocumentPassageModel,
    GoalModel,
    JudgeReviewModel,
    LearnerModel,
    LearnerSkillModel,
    LessonProgressModel,
    LessonVersionModel,
    NotificationModel,
    OutboxEventModel,
    PreferenceModel,
    ProjectModel,
    ProposalModel,
    ReviewItemModel,
    RoadmapModel,
    RoadmapVersionModel,
    RunModel,
    SandboxExecutionModel,
    SkillEvidenceModel,
    SkillModel,
    StudyPlanModel,
    StudySessionModel,
    SubmissionModel,
    TaskModel,
)
from app.db.repositories.base import BaseMongoRepository

logger = logging.getLogger("pathai.db.repositories.core")


# 1. Learners, Preferences & Goals
class LearnerRepository:
    def __init__(self, db: AsyncIOMotorDatabase) -> None:
        self.learners = BaseMongoRepository(db, "learners", LearnerModel)
        self.preferences = BaseMongoRepository(db, "preferences", PreferenceModel)
        self.goals = BaseMongoRepository(db, "goals", GoalModel)

    async def get_by_id(self, learner_id: str) -> Optional[LearnerModel]:
        return await self.learners.find_one({"learner_id": learner_id})

    async def get_by_auth_subject(self, auth_subject: str) -> Optional[LearnerModel]:
        return await self.learners.find_one({"auth_subject": auth_subject})

    async def create_or_get(self, learner: LearnerModel) -> LearnerModel:
        existing = await self.get_by_auth_subject(learner.auth_subject)
        if existing:
            return existing
        return await self.learners.insert(learner)

    async def get_preferences(self, learner_id: str) -> Optional[PreferenceModel]:
        return await self.preferences.find_one({"learner_id": learner_id})

    async def save_preferences(self, prefs: PreferenceModel) -> PreferenceModel:
        await self.preferences.update_one(
            {"learner_id": prefs.learner_id},
            prefs.model_dump(),
            upsert=True,
        )
        return prefs

    async def get_active_goals(self, learner_id: str) -> List[GoalModel]:
        return await self.goals.find_many({"learner_id": learner_id, "is_active": True})

    async def add_goal(self, goal: GoalModel) -> GoalModel:
        return await self.goals.insert(goal)


# 2. Skills, Learner Mastery & Evidence
class SkillRepository:
    def __init__(self, db: AsyncIOMotorDatabase) -> None:
        self.skills = BaseMongoRepository(db, "skills", SkillModel)
        self.learner_skills = BaseMongoRepository(db, "learner_skills", LearnerSkillModel)
        self.evidence = BaseMongoRepository(db, "skill_evidence", SkillEvidenceModel)

    async def get_skill(self, skill_id: str) -> Optional[SkillModel]:
        return await self.skills.find_one({"skill_id": skill_id})

    async def list_skills(self, domain: Optional[str] = None) -> List[SkillModel]:
        query = {"domain": domain} if domain else {}
        return await self.skills.find_many(query, limit=100)

    async def get_learner_skill(self, learner_id: str, skill_id: str) -> Optional[LearnerSkillModel]:
        return await self.learner_skills.find_one({"learner_id": learner_id, "skill_id": skill_id})

    async def record_evidence_idempotent(self, ev: SkillEvidenceModel) -> SkillEvidenceModel:
        """Idempotently persist evidence deduplicating by learner_id and dedupe_key."""
        existing = await self.evidence.find_one({"learner_id": ev.learner_id, "dedupe_key": ev.dedupe_key})
        if existing:
            return existing

        await self.evidence.insert(ev)
        # Trigger mastery recomputation if verified
        if ev.verification_state == "verified":
            await self.recompute_mastery(ev.learner_id, ev.skill_id)
        return ev

    async def recompute_mastery(self, learner_id: str, skill_id: str) -> float:
        """Calculate verified score average and update learner skill state version."""
        verified_ev = await self.evidence.find_many(
            {"learner_id": learner_id, "skill_id": skill_id, "verification_state": "verified"},
            sort=[("observed_at", -1)],
            limit=20,
        )
        if not verified_ev:
            return 0.0

        scores = [e.score for e in verified_ev]
        avg_score = round(sum(scores) / len(scores), 2)

        existing = await self.get_learner_skill(learner_id, skill_id)
        new_version = (existing.state_version + 1) if existing else 1

        skill_record = LearnerSkillModel(
            learner_skill_id=f"ls_{learner_id}_{skill_id}",
            learner_id=learner_id,
            skill_id=skill_id,
            mastery_score=avg_score,
            confidence_score=min(1.0, round(len(verified_ev) * 0.25, 2)),
            state_version=new_version,
            last_assessed_at=utc_now(),
        )
        await self.learner_skills.update_one(
            {"learner_id": learner_id, "skill_id": skill_id},
            skill_record.model_dump(),
            upsert=True,
        )
        return avg_score


# 3. Roadmaps & Versions
class RoadmapRepository:
    def __init__(self, db: AsyncIOMotorDatabase) -> None:
        self.roadmaps = BaseMongoRepository(db, "roadmaps", RoadmapModel)
        self.versions = BaseMongoRepository(db, "roadmap_versions", RoadmapVersionModel)

    async def get_active_roadmap(self, learner_id: str) -> Optional[RoadmapModel]:
        return await self.roadmaps.find_one({"learner_id": learner_id, "is_active": True})

    async def get_version(self, roadmap_id: str, version: int) -> Optional[RoadmapVersionModel]:
        return await self.versions.find_one({"roadmap_id": roadmap_id, "version": version})

    async def save_version(self, version: RoadmapVersionModel) -> RoadmapVersionModel:
        await self.versions.insert(version)
        return version

    async def activate_version(self, learner_id: str, roadmap_id: str, version_num: int) -> bool:
        """Activate a specific version on the learner roadmap."""
        return await self.roadmaps.update_one(
            {"roadmap_id": roadmap_id, "learner_id": learner_id},
            {"active_version": version_num, "status": "active", "is_active": True},
        )


# 4. Lessons, Progress & Sessions
class LessonRepository:
    def __init__(self, db: AsyncIOMotorDatabase) -> None:
        self.versions = BaseMongoRepository(db, "lesson_versions", LessonVersionModel)
        self.progress = BaseMongoRepository(db, "lesson_progress", LessonProgressModel)
        self.sessions = BaseMongoRepository(db, "study_sessions", StudySessionModel)

    async def get_lesson_version(self, lesson_id: str, version: int = 1) -> Optional[LessonVersionModel]:
        return await self.versions.find_one({"lesson_id": lesson_id, "version": version})

    async def get_progress(self, learner_id: str, lesson_id: str) -> Optional[LessonProgressModel]:
        return await self.progress.find_one({"learner_id": learner_id, "lesson_id": lesson_id})

    async def update_progress(self, learner_id: str, lesson_id: str, status: str) -> None:
        completed_at = utc_now() if status in ("completed", "mastered") else None
        fields = {
            "status": status,
            "progress_id": f"prog_{learner_id}_{lesson_id}",
        }
        if completed_at:
            fields["completed_at"] = completed_at
        await self.progress.update_one(
            {"learner_id": learner_id, "lesson_id": lesson_id},
            fields,
            upsert=True,
        )

    async def record_session(self, session: StudySessionModel) -> StudySessionModel:
        return await self.sessions.insert(session)


# 5. Assessments, Private Rubrics & Attempts
class AssessmentRepository:
    def __init__(self, db: AsyncIOMotorDatabase) -> None:
        self.assessments = BaseMongoRepository(db, "assessments", AssessmentModel)
        self.rubrics = BaseMongoRepository(db, "assessment_rubrics", AssessmentRubricModel)
        self.attempts = BaseMongoRepository(db, "attempts", AttemptModel)

    async def get_assessment(self, assessment_id: str) -> Optional[AssessmentModel]:
        """Fetch public assessment questions. Never leaks rubrics."""
        return await self.assessments.find_one({"assessment_id": assessment_id})

    async def get_rubric_isolated(self, assessment_id: str) -> Optional[AssessmentRubricModel]:
        """Fetch scoring criteria and answer keys. Restricted strictly to evaluator workers."""
        return await self.rubrics.find_one({"assessment_id": assessment_id})

    async def save_attempt(self, attempt: AttemptModel) -> AttemptModel:
        return await self.attempts.insert(attempt)

    async def get_attempts(self, learner_id: str, assessment_id: str) -> List[AttemptModel]:
        return await self.attempts.find_many(
            {"learner_id": learner_id, "assessment_id": assessment_id},
            sort=[("created_at", -1)],
        )


# 6. Projects, Submissions & Sandboxes
class ProjectRepository:
    def __init__(self, db: AsyncIOMotorDatabase) -> None:
        self.projects = BaseMongoRepository(db, "projects", ProjectModel)
        self.submissions = BaseMongoRepository(db, "submissions", SubmissionModel)
        self.sandboxes = BaseMongoRepository(db, "sandbox_executions", SandboxExecutionModel)

    async def get_project(self, project_id: str) -> Optional[ProjectModel]:
        return await self.projects.find_one({"project_id": project_id})

    async def save_submission(self, sub: SubmissionModel) -> SubmissionModel:
        return await self.submissions.insert(sub)

    async def record_sandbox_execution(self, exec_rec: SandboxExecutionModel) -> SandboxExecutionModel:
        return await self.sandboxes.insert(exec_rec)


# 7. Documents & Authoritative Passages
class DocumentRepository:
    def __init__(self, db: AsyncIOMotorDatabase) -> None:
        self.documents = BaseMongoRepository(db, "documents", DocumentModel)
        self.passages = BaseMongoRepository(db, "document_passages", DocumentPassageModel)

    async def register_document(self, doc: DocumentModel) -> DocumentModel:
        return await self.documents.insert(doc)

    async def get_document(self, document_id: str) -> Optional[DocumentModel]:
        return await self.documents.find_one({"document_id": document_id})

    async def get_by_content_hash(self, learner_id: str, content_hash: str) -> Optional[DocumentModel]:
        return await self.documents.find_one({"learner_id": learner_id, "content_hash": content_hash})

    async def save_passages(self, passages: List[DocumentPassageModel]) -> List[DocumentPassageModel]:
        return await self.passages.insert_many(passages)

    async def get_passages_by_document(self, document_id: str) -> List[DocumentPassageModel]:
        return await self.passages.find_many(
            {"document_id": document_id},
            sort=[("passage_index", 1)],
            limit=500,
        )


# 8. Study Plans & Review Items
class StudyPlanRepository:
    def __init__(self, db: AsyncIOMotorDatabase) -> None:
        self.plans = BaseMongoRepository(db, "study_plans", StudyPlanModel)
        self.review_items = BaseMongoRepository(db, "review_items", ReviewItemModel)

    async def get_active_plan(self, learner_id: str) -> Optional[StudyPlanModel]:
        return await self.plans.find_one({"learner_id": learner_id, "status": "active"})

    async def get_due_reviews(self, learner_id: str, due_before: datetime) -> List[ReviewItemModel]:
        return await self.review_items.find_many(
            {"learner_id": learner_id, "status": "pending", "due_at": {"$lte": due_before}},
            sort=[("due_at", 1)],
        )

    async def mark_review_completed(self, item_id: str, learner_id: str) -> bool:
        return await self.review_items.update_one(
            {"item_id": item_id, "learner_id": learner_id},
            {"status": "completed"},
        )


# 9. Proposals (Atomic concurrency check)
class ProposalRepository:
    def __init__(self, db: AsyncIOMotorDatabase) -> None:
        self.proposals = BaseMongoRepository(db, "proposals", ProposalModel)

    async def create_proposal(self, prop: ProposalModel) -> ProposalModel:
        return await self.proposals.insert(prop)

    async def get_pending_proposals(self, learner_id: str) -> List[ProposalModel]:
        return await self.proposals.find_many({"learner_id": learner_id, "status": "proposed"})

    async def accept_proposal_atomic(
        self,
        learner_id: str,
        proposal_id: str,
        expected_base_version: int,
    ) -> bool:
        """Accept a proposal ensuring its base version has not been superseded."""
        prop = await self.proposals.find_one({"proposal_id": proposal_id, "learner_id": learner_id})
        if not prop:
            return False
        if prop.base_version != expected_base_version:
            logger.warning(
                "Stale proposal %s: expected base %d but active is %d",
                proposal_id,
                prop.base_version,
                expected_base_version,
            )
            return False

        return await self.proposals.update_one(
            {"proposal_id": proposal_id, "status": "proposed"},
            {"status": "accepted", "decided_at": utc_now()},
        )


# 10. Execution & Outbox
class ExecutionRepository:
    def __init__(self, db: AsyncIOMotorDatabase) -> None:
        self.runs = BaseMongoRepository(db, "runs", RunModel)
        self.tasks = BaseMongoRepository(db, "tasks", TaskModel)
        self.reviews = BaseMongoRepository(db, "judge_reviews", JudgeReviewModel)
        self.outbox = BaseMongoRepository(db, "outbox_events", OutboxEventModel)

    async def create_run(self, run: RunModel) -> RunModel:
        return await self.runs.insert(run)

    async def update_run_status(self, run_id: str, status: str) -> bool:
        return await self.runs.update_one({"run_id": run_id}, {"status": status})

    async def create_task(self, task: TaskModel) -> TaskModel:
        await self.tasks.update_one(
            {"task_id": task.task_id},
            task.model_dump(),
            upsert=True,
        )
        return task

    async def save_judge_review(self, review: JudgeReviewModel) -> JudgeReviewModel:
        return await self.reviews.insert(review)

    async def create_outbox_event(self, event: OutboxEventModel) -> OutboxEventModel:
        return await self.outbox.insert(event)

    async def fetch_pending_outbox_events(self, limit: int = 50) -> List[OutboxEventModel]:
        return await self.outbox.find_many(
            {"delivery_state": "pending"},
            sort=[("created_at", 1)],
            limit=limit,
        )

    async def mark_outbox_dispatched(self, event_id: str) -> bool:
        return await self.outbox.update_one(
            {"event_id": event_id},
            {"delivery_state": "dispatched", "dispatched_at": utc_now()},
        )
