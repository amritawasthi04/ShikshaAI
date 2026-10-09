"""Declarative index specifications and index synchronization engine."""
import logging
from typing import Any, Dict, List, Tuple
from pymongo import ASCENDING, DESCENDING, IndexModel
from motor.motor_asyncio import AsyncIOMotorDatabase
from app.db.connection import mongo_manager

logger = logging.getLogger("pathai.db.indexes")

# Index definitions for pathai_core collections
CORE_INDEXES: Dict[str, List[IndexModel]] = {
    "learners": [
        IndexModel([("learner_id", ASCENDING)], unique=True, name="uniq_learner_id"),
        IndexModel([("auth_subject", ASCENDING)], unique=True, name="uniq_auth_subject"),
    ],
    "preferences": [
        IndexModel([("learner_id", ASCENDING)], unique=True, name="uniq_learner_pref"),
    ],
    "goals": [
        IndexModel([("goal_id", ASCENDING)], unique=True, name="uniq_goal_id"),
        IndexModel([("learner_id", ASCENDING), ("is_active", ASCENDING)], name="idx_learner_goals"),
    ],
    "skills": [
        IndexModel([("skill_id", ASCENDING)], unique=True, name="uniq_skill_id"),
        IndexModel([("domain", ASCENDING), ("taxonomy_level", ASCENDING)], name="idx_skill_domain_level"),
    ],
    "learner_skills": [
        IndexModel([("learner_id", ASCENDING), ("skill_id", ASCENDING)], unique=True, name="uniq_learner_skill"),
        IndexModel([("learner_id", ASCENDING), ("state_version", ASCENDING)], name="idx_learner_skill_version"),
    ],
    "skill_evidence": [
        IndexModel([("learner_id", ASCENDING), ("dedupe_key", ASCENDING)], unique=True, name="uniq_learner_evidence_dedupe"),
        IndexModel([("learner_id", ASCENDING), ("skill_id", ASCENDING), ("observed_at", DESCENDING)], name="idx_learner_skill_evidence_timeline"),
        IndexModel([("verification_state", ASCENDING)], name="idx_evidence_verification_state"),
    ],
    "roadmaps": [
        IndexModel([("roadmap_id", ASCENDING)], unique=True, name="uniq_roadmap_id"),
        IndexModel([("learner_id", ASCENDING), ("is_active", ASCENDING)], name="idx_learner_active_roadmap"),
        IndexModel([("goal_id", ASCENDING)], name="idx_roadmap_goal"),
    ],
    "roadmap_versions": [
        IndexModel([("roadmap_id", ASCENDING), ("version", ASCENDING)], unique=True, name="uniq_roadmap_version"),
        IndexModel([("learner_id", ASCENDING)], name="idx_roadmap_ver_learner"),
    ],
    "lesson_versions": [
        IndexModel([("lesson_id", ASCENDING), ("version", ASCENDING)], unique=True, name="uniq_lesson_version"),
        IndexModel([("milestone_id", ASCENDING)], name="idx_lesson_milestone"),
    ],
    "lesson_progress": [
        IndexModel([("learner_id", ASCENDING), ("lesson_id", ASCENDING)], unique=True, name="uniq_learner_lesson_progress"),
        IndexModel([("learner_id", ASCENDING), ("status", ASCENDING)], name="idx_learner_lesson_status"),
    ],
    "study_sessions": [
        IndexModel([("session_id", ASCENDING)], unique=True, name="uniq_session_id"),
        IndexModel([("learner_id", ASCENDING), ("started_at", DESCENDING)], name="idx_learner_sessions_timeline"),
        IndexModel([("lesson_id", ASCENDING)], name="idx_session_lesson"),
    ],
    "assessments": [
        IndexModel([("assessment_id", ASCENDING)], unique=True, name="uniq_assessment_id"),
        IndexModel([("skill_ids", ASCENDING)], name="idx_assessment_skills"),
    ],
    "assessment_rubrics": [
        IndexModel([("rubric_id", ASCENDING)], unique=True, name="uniq_rubric_id"),
        IndexModel([("assessment_id", ASCENDING)], unique=True, name="uniq_rubric_assessment"),
    ],
    "attempts": [
        IndexModel([("attempt_id", ASCENDING)], unique=True, name="uniq_attempt_id"),
        IndexModel([("learner_id", ASCENDING), ("assessment_id", ASCENDING)], name="idx_learner_assessment_attempts"),
        IndexModel([("grading_state", ASCENDING)], name="idx_attempt_grading_state"),
    ],
    "projects": [
        IndexModel([("project_id", ASCENDING)], unique=True, name="uniq_project_id"),
    ],
    "submissions": [
        IndexModel([("submission_id", ASCENDING)], unique=True, name="uniq_submission_id"),
        IndexModel([("learner_id", ASCENDING), ("project_id", ASCENDING)], name="idx_learner_project_submissions"),
    ],
    "sandbox_executions": [
        IndexModel([("execution_id", ASCENDING)], unique=True, name="uniq_sandbox_exec_id"),
        IndexModel([("submission_id", ASCENDING)], name="idx_sandbox_submission"),
        IndexModel([("run_id", ASCENDING)], name="idx_sandbox_run"),
    ],
    "documents": [
        IndexModel([("document_id", ASCENDING)], unique=True, name="uniq_document_id"),
        IndexModel([("learner_id", ASCENDING), ("content_hash", ASCENDING)], unique=True, name="uniq_learner_doc_hash"),
        IndexModel([("learner_id", ASCENDING), ("created_at", DESCENDING)], name="idx_learner_documents"),
    ],
    "document_passages": [
        IndexModel([("passage_id", ASCENDING)], unique=True, name="uniq_passage_id"),
        IndexModel([("document_id", ASCENDING), ("passage_index", ASCENDING)], unique=True, name="uniq_doc_passage_idx"),
        IndexModel([("learner_id", ASCENDING)], name="idx_passage_learner"),
    ],
    "study_plans": [
        IndexModel([("plan_id", ASCENDING)], unique=True, name="uniq_study_plan_id"),
        IndexModel([("learner_id", ASCENDING), ("status", ASCENDING)], name="idx_learner_study_plans"),
    ],
    "review_items": [
        IndexModel([("item_id", ASCENDING)], unique=True, name="uniq_review_item_id"),
        IndexModel([("learner_id", ASCENDING), ("due_at", ASCENDING), ("status", ASCENDING)], name="idx_learner_due_reviews"),
    ],
    "proposals": [
        IndexModel([("proposal_id", ASCENDING)], unique=True, name="uniq_proposal_id"),
        IndexModel([("learner_id", ASCENDING), ("status", ASCENDING)], name="idx_learner_proposals"),
        IndexModel([("learner_id", ASCENDING), ("kind", ASCENDING), ("base_version", ASCENDING)], name="idx_proposal_concurrency_check"),
    ],
    "notifications": [
        IndexModel([("notification_id", ASCENDING)], unique=True, name="uniq_notification_id"),
        IndexModel([("learner_id", ASCENDING), ("is_read", ASCENDING)], name="idx_learner_notifications"),
        IndexModel([("dedupe_key", ASCENDING)], unique=True, sparse=True, name="uniq_notification_dedupe"),
    ],
    "runs": [
        IndexModel([("run_id", ASCENDING)], unique=True, name="uniq_run_id"),
        IndexModel([("learner_id", ASCENDING), ("status", ASCENDING)], name="idx_learner_runs"),
    ],
    "tasks": [
        IndexModel([("task_id", ASCENDING)], unique=True, name="uniq_task_id"),
        IndexModel([("run_id", ASCENDING), ("status", ASCENDING)], name="idx_run_tasks"),
    ],
    "judge_reviews": [
        IndexModel([("review_id", ASCENDING)], unique=True, name="uniq_judge_review_id"),
        IndexModel([("task_id", ASCENDING)], name="idx_review_task"),
        IndexModel([("run_id", ASCENDING)], name="idx_review_run"),
    ],
    "outbox_events": [
        IndexModel([("event_id", ASCENDING)], unique=True, name="uniq_outbox_event_id"),
        IndexModel([("delivery_state", ASCENDING), ("created_at", ASCENDING)], name="idx_outbox_pending_dispatch"),
    ],
}

# Index definitions for pathai_chat collections
CHAT_INDEXES: Dict[str, List[IndexModel]] = {
    "conversations": [
        IndexModel([("conversation_id", ASCENDING)], unique=True, name="uniq_conversation_id"),
        IndexModel([("learner_id", ASCENDING), ("is_active", ASCENDING)], name="idx_learner_active_convos"),
        IndexModel([("updated_at", DESCENDING)], name="idx_convo_last_active"),
    ],
    "messages": [
        IndexModel([("message_id", ASCENDING)], unique=True, name="uniq_message_id"),
        IndexModel([("conversation_id", ASCENDING), ("sequence_number", ASCENDING)], unique=True, name="uniq_convo_sequence"),
        IndexModel([("conversation_id", ASCENDING), ("created_at", ASCENDING)], name="idx_convo_message_history"),
        IndexModel([("run_id", ASCENDING)], name="idx_message_run"),
    ],
    "summaries": [
        IndexModel([("summary_id", ASCENDING)], unique=True, name="uniq_summary_id"),
        IndexModel([("conversation_id", ASCENDING), ("through_message_id", ASCENDING)], name="idx_convo_summary"),
    ],
    "citations": [
        IndexModel([("citation_id", ASCENDING)], unique=True, name="uniq_citation_id"),
        IndexModel([("message_id", ASCENDING)], name="idx_citation_message"),
        IndexModel([("passage_id", ASCENDING)], name="idx_citation_passage"),
    ],
    "conversation_run_refs": [
        IndexModel([("ref_id", ASCENDING)], unique=True, name="uniq_convo_run_ref"),
        IndexModel([("conversation_id", ASCENDING), ("run_id", ASCENDING)], name="idx_convo_run"),
    ],
}


class IndexManager:
    """Manages the creation and verification of database indexes across all collections."""

    @staticmethod
    async def create_indexes_for_db(
        db: AsyncIOMotorDatabase,
        spec: Dict[str, List[IndexModel]],
    ) -> Dict[str, List[str]]:
        """Create declarative indexes on a target database and return created index names."""
        results: Dict[str, List[str]] = {}
        for coll_name, index_models in spec.items():
            coll = db[coll_name]
            try:
                created = await coll.create_indexes(index_models)
                results[coll_name] = created
                logger.info("Synchronized %d indexes on %s.%s", len(created), db.name, coll_name)
            except Exception as exc:
                logger.error("Error creating indexes on %s.%s: %s", db.name, coll_name, exc)
                results[coll_name] = [f"ERROR: {exc}"]
        return results

    @classmethod
    async def sync_all_indexes(cls) -> Dict[str, Dict[str, List[str]]]:
        """Synchronize all declarative indexes across pathai_core and pathai_chat."""
        core_db = mongo_manager.get_core_db()
        chat_db = mongo_manager.get_chat_db()

        logger.info("Beginning index synchronization for pathai_core and pathai_chat")
        core_res = await cls.create_indexes_for_db(core_db, CORE_INDEXES)
        chat_res = await cls.create_indexes_for_db(chat_db, CHAT_INDEXES)

        return {
            "pathai_core": core_res,
            "pathai_chat": chat_res,
        }
