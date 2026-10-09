"""Cross-store consistency and deletion coordinator across MongoDB and Chroma Cloud."""
import logging
from typing import Any, Dict, Optional
from app.db.chroma_client import chroma_manager
from app.db.connection import mongo_manager

logger = logging.getLogger("pathai.db.coordinator")


class CrossStoreCoordinator:
    """Coordinates lifecycle, deletion, and reconciliation across pathai_core, pathai_chat, and Chroma."""

    @staticmethod
    async def delete_learner_complete(learner_id: str) -> Dict[str, Any]:
        """Cascade deletion of all learner records across all datastores with full audit reporting."""
        core_db = mongo_manager.get_core_db()
        chat_db = mongo_manager.get_chat_db()

        deletion_report: Dict[str, Any] = {
            "learner_id": learner_id,
            "core_records_deleted": {},
            "chat_records_deleted": {},
            "chroma_collection_deleted": False,
        }

        # 1. Delete from pathai_core collections
        core_collections = [
            "learners",
            "preferences",
            "goals",
            "learner_skills",
            "skill_evidence",
            "roadmaps",
            "roadmap_versions",
            "lesson_progress",
            "study_sessions",
            "attempts",
            "submissions",
            "sandbox_executions",
            "documents",
            "document_passages",
            "study_plans",
            "review_items",
            "proposals",
            "notifications",
            "runs",
        ]
        for coll_name in core_collections:
            res = await core_db[coll_name].delete_many({"learner_id": learner_id})
            deletion_report["core_records_deleted"][coll_name] = res.deleted_count

        # 2. Delete conversations and messages from pathai_chat
        convos = await chat_db["conversations"].find({"learner_id": learner_id}, {"conversation_id": 1}).to_list(None)
        convo_ids = [c["conversation_id"] for c in convos]

        if convo_ids:
            msg_res = await chat_db["messages"].delete_many({"conversation_id": {"$in": convo_ids}})
            sum_res = await chat_db["summaries"].delete_many({"conversation_id": {"$in": convo_ids}})
            ref_res = await chat_db["conversation_run_refs"].delete_many({"conversation_id": {"$in": convo_ids}})
            deletion_report["chat_records_deleted"]["messages"] = msg_res.deleted_count
            deletion_report["chat_records_deleted"]["summaries"] = sum_res.deleted_count
            deletion_report["chat_records_deleted"]["conversation_run_refs"] = ref_res.deleted_count

        convo_res = await chat_db["conversations"].delete_many({"learner_id": learner_id})
        deletion_report["chat_records_deleted"]["conversations"] = convo_res.deleted_count

        # 3. Purge vector data from Chroma Cloud
        try:
            chroma_manager.delete_learner_collection(learner_id)
            deletion_report["chroma_collection_deleted"] = True
        except Exception as exc:
            logger.error("Error purging Chroma collection for learner %s: %s", learner_id, exc)
            deletion_report["chroma_collection_error"] = str(exc)

        logger.info("Complete cross-store deletion finished for learner %s: %s", learner_id, deletion_report)
        return deletion_report

    @staticmethod
    async def delete_document_complete(learner_id: str, document_id: str) -> Dict[str, Any]:
        """Delete document, authoritative passages, and corresponding Chroma Cloud vectors."""
        core_db = mongo_manager.get_core_db()

        doc_res = await core_db["documents"].delete_one({"document_id": document_id, "learner_id": learner_id})
        passages_res = await core_db["document_passages"].delete_many({"document_id": document_id, "learner_id": learner_id})

        # Remove from Chroma Cloud
        try:
            chroma_manager.delete_document(document_id=document_id, learner_id=learner_id)
            chroma_deleted = True
        except Exception as exc:
            logger.error("Error deleting document vectors for %s: %s", document_id, exc)
            chroma_deleted = False

        return {
            "document_id": document_id,
            "document_deleted": doc_res.deleted_count > 0,
            "passages_deleted": passages_res.deleted_count,
            "chroma_vectors_deleted": chroma_deleted,
        }
