"""Master DatabaseManager orchestrating MongoDB Atlas and Chroma Cloud lifecycle and operations."""
import logging
from typing import Any, Dict
from app.config import settings
from app.db.chroma_client import chroma_manager
from app.db.connection import mongo_manager
from app.db.coordinator import CrossStoreCoordinator
from app.db.indexes import IndexManager
from app.db.migrate_to_chroma import migrate_mongo_to_chroma
from app.db.operations import DatabaseOperations
from app.db.seeds import seed_skills

logger = logging.getLogger("pathai.db.manager")


class DatabaseManager:
    """Master orchestrator for MongoDB Atlas (core & chat) and Chroma Cloud."""

    @classmethod
    async def init_all(cls) -> Dict[str, Any]:
        """Initialize all databases, collections, declarative indexes, and Chroma schemas."""
        logger.info("Initializing PathAI / Shiksha databases...")

        # 1. Connect and verify MongoDB Atlas
        mongo_ping = await mongo_manager.ping()
        if mongo_ping.get("status") != "ok":
            logger.error("MongoDB Atlas connection issue: %s", mongo_ping)

        # 2. Synchronize all declarative indexes across pathai_core and pathai_chat
        index_report = await IndexManager.sync_all_indexes()

        # 3. Connect and initialize Chroma Cloud public knowledge collection
        chroma_ping = chroma_manager.ping()
        public_coll = None
        if chroma_ping.get("status") == "ok":
            public_coll = chroma_manager.get_public_collection()
            logger.info("Chroma Cloud public collection initialized: %s", public_coll.name)

        return {
            "mongodb_status": mongo_ping,
            "indexes_synchronized": {
                "core_collections": len(index_report["pathai_core"]),
                "chat_collections": len(index_report["pathai_chat"]),
            },
            "chroma_status": chroma_ping,
            "public_collection": public_coll.name if public_coll else None,
        }

    @classmethod
    async def check_health(cls) -> Dict[str, Any]:
        """Perform comprehensive health check on MongoDB Atlas and Chroma Cloud."""
        mongo_res = await mongo_manager.ping()
        chroma_res = chroma_manager.ping()

        is_healthy = (mongo_res.get("status") == "ok") and (chroma_res.get("status") == "ok")

        return {
            "status": "healthy" if is_healthy else "degraded",
            "mongodb": mongo_res,
            "chroma_cloud": chroma_res,
        }

    @classmethod
    async def seed(cls) -> Dict[str, Any]:
        """Seed baseline skills and taxonomy data into pathai_core."""
        count = await seed_skills()
        return {"skills_seeded": count}

    @classmethod
    async def migrate_to_chroma(cls) -> Dict[str, Any]:
        """Copy and embed existing MongoDB passages into Chroma Cloud."""
        return await migrate_mongo_to_chroma()

    @classmethod
    async def get_stats(cls) -> Dict[str, Any]:
        """Fetch document counts and collection statistics across MongoDB and Chroma Cloud."""
        core_db = mongo_manager.get_core_db()
        chat_db = mongo_manager.get_chat_db()

        core_stats: Dict[str, int] = {}
        for coll_name in await core_db.list_collection_names():
            core_stats[coll_name] = await core_db[coll_name].count_documents({})

        chat_stats: Dict[str, int] = {}
        for coll_name in await chat_db.list_collection_names():
            chat_stats[coll_name] = await chat_db[coll_name].count_documents({})

        chroma_colls = []
        try:
            chroma_colls = [c.name for c in chroma_manager.client.list_collections()]
        except Exception:
            pass

        return {
            "pathai_core_collections": core_stats,
            "pathai_chat_collections": chat_stats,
            "chroma_collections": chroma_colls,
        }

    @classmethod
    async def audit(cls) -> Dict[str, Any]:
        """Perform cross-collection data integrity verification."""
        return await DatabaseOperations.verify_data_integrity()

    @classmethod
    async def telemetry(cls) -> Dict[str, Any]:
        """Collect live datastore latency and volume telemetry."""
        return await DatabaseOperations.collect_telemetry()

    @classmethod
    async def export_learner(cls, learner_id: str) -> Dict[str, Any]:
        """Export comprehensive compliance bundle for a learner."""
        return await DatabaseOperations.export_learner_bundle(learner_id)

    @classmethod
    async def create_backup(cls) -> Dict[str, Any]:
        """Create a complete JSON backup snapshot."""
        return await DatabaseOperations.create_backup()

    @classmethod
    async def restore_backup(cls, backup_data: Dict[str, Any]) -> Dict[str, int]:
        """Restore datastores from backup data."""
        return await DatabaseOperations.restore_backup(backup_data)

    @classmethod
    async def delete_learner(cls, learner_id: str) -> Dict[str, Any]:
        """Permanently cascade delete all learner records across Atlas and Chroma."""
        return await CrossStoreCoordinator.delete_learner_complete(learner_id)

