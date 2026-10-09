"""Phase 7: Database operations for exports, data integrity verification, and monitoring."""
import logging
from typing import Any, Dict, List, Optional
from motor.motor_asyncio import AsyncIOMotorDatabase
from app.db.chroma_client import chroma_manager
from app.db.connection import mongo_manager

logger = logging.getLogger("pathai.db.operations")


class DatabaseOperations:
    """Operations toolkit for maintainability: data integrity audits, compliance exports, and telemetry."""

    @staticmethod
    async def export_learner_bundle(learner_id: str) -> Dict[str, Any]:
        """Generate a complete portable export bundle of all learner records across core and chat datastores."""
        core_db = mongo_manager.get_core_db()
        chat_db = mongo_manager.get_chat_db()

        # Core collections to export
        collections = [
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
            "documents",
            "study_plans",
            "review_items",
        ]

        core_bundle: Dict[str, List[Dict[str, Any]]] = {}
        for coll_name in collections:
            docs = await core_db[coll_name].find({"learner_id": learner_id}, {"_id": 0}).to_list(None)
            core_bundle[coll_name] = docs

        # Chat export
        convos = await chat_db["conversations"].find({"learner_id": learner_id}, {"_id": 0}).to_list(None)
        convo_ids = [c["conversation_id"] for c in convos]

        messages = []
        summaries = []
        if convo_ids:
            messages = await chat_db["messages"].find(
                {"conversation_id": {"$in": convo_ids}}, {"_id": 0}
            ).sort("sequence_number", 1).to_list(None)
            summaries = await chat_db["summaries"].find(
                {"conversation_id": {"$in": convo_ids}}, {"_id": 0}
            ).to_list(None)

        return {
            "learner_id": learner_id,
            "core_data": core_bundle,
            "chat_data": {
                "conversations": convos,
                "messages": messages,
                "summaries": summaries,
            },
        }

    @staticmethod
    async def verify_data_integrity() -> Dict[str, Any]:
        """Perform cross-collection integrity verification across MongoDB and Chroma."""
        core_db = mongo_manager.get_core_db()
        chat_db = mongo_manager.get_chat_db()

        issues: List[str] = []

        # 1. Check for orphaned document passages
        doc_ids = set([d["document_id"] async for d in core_db["documents"].find({}, {"document_id": 1})])
        async for passage in core_db["document_passages"].find({}, {"passage_id": 1, "document_id": 1}):
            if passage["document_id"] not in doc_ids:
                issues.append(f"Orphaned passage '{passage['passage_id']}' references missing document '{passage['document_id']}'")

        # 2. Check for orphaned messages
        convo_ids = set([c["conversation_id"] async for c in chat_db["conversations"].find({}, {"conversation_id": 1})])
        async for msg in chat_db["messages"].find({}, {"message_id": 1, "conversation_id": 1}):
            if msg["conversation_id"] not in convo_ids:
                issues.append(f"Orphaned message '{msg['message_id']}' references missing conversation '{msg['conversation_id']}'")

        # 3. Check Chroma Cloud accessibility
        chroma_status = chroma_manager.ping()
        if chroma_status.get("status") != "ok":
            issues.append(f"Chroma Cloud connectivity degraded: {chroma_status.get('error')}")

        return {
            "status": "healthy" if not issues else "issues_found",
            "issue_count": len(issues),
            "issues": issues[:20],  # return first 20 if any
        }

    @staticmethod
    async def collect_telemetry() -> Dict[str, Any]:
        """Collect live latency and document volume telemetry across all application stores."""
        mongo_ping = await mongo_manager.ping()
        chroma_ping = chroma_manager.ping()

        core_db = mongo_manager.get_core_db()
        chat_db = mongo_manager.get_chat_db()

        core_doc_count = sum([await core_db[c].count_documents({}) for c in await core_db.list_collection_names()])
        chat_doc_count = sum([await chat_db[c].count_documents({}) for c in await chat_db.list_collection_names()])

        return {
            "timestamp": mongo_ping.get("timestamp"),
            "mongodb_latency_ms": mongo_ping.get("latency_ms"),
            "chroma_latency_ms": chroma_ping.get("latency_ms"),
            "total_core_records": core_doc_count,
            "total_chat_records": chat_doc_count,
            "chroma_collections": chroma_ping.get("collection_count", 0),
        }
