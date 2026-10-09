import asyncio
import logging
import time
from typing import Any, Dict, Optional
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from pymongo import MongoClient
from app.config import settings

logger = logging.getLogger("pathai.db.connection")


class MongoManager:
    """Manages MongoDB connections for the application."""

    def __init__(self) -> None:
        self._async_client: Optional[AsyncIOMotorClient] = None
        self._sync_client: Optional[MongoClient] = None
        self._mock_core_db: Optional[Any] = None
        self._mock_chat_db: Optional[Any] = None

    @property
    def async_client(self) -> AsyncIOMotorClient:
        if self._async_client is not None:
            client_loop = getattr(self._async_client, "_io_loop", None)
            is_closed = False
            if client_loop is not None:
                try:
                    is_closed = client_loop.is_closed()
                except Exception:
                    is_closed = True

            current_loop = None
            try:
                current_loop = asyncio.get_running_loop()
            except RuntimeError:
                pass

            loop_mismatch = (current_loop is not None and client_loop is not None and client_loop != current_loop)

            if is_closed or loop_mismatch:
                try:
                    self._async_client.close()
                except Exception:
                    pass
                self._async_client = None

        if self._async_client is None:
            self.connect()
        return self._async_client

    @property
    def sync_client(self) -> MongoClient:
        if self._sync_client is None:
            self._sync_client = MongoClient(
                settings.MONGODB_URI,
                maxPoolSize=settings.MONGODB_MAX_POOL_SIZE,
                minPoolSize=settings.MONGODB_MIN_POOL_SIZE,
                serverSelectionTimeoutMS=settings.MONGODB_TIMEOUT_MS,
            )
        return self._sync_client

    def connect(self) -> None:
        """Initialize connection to MongoDB."""
        if self._async_client is not None:
            return

        logger.info("Connecting to MongoDB at %s", settings.MONGODB_URI)
        self._async_client = AsyncIOMotorClient(
            settings.MONGODB_URI,
            maxPoolSize=settings.MONGODB_MAX_POOL_SIZE,
            minPoolSize=settings.MONGODB_MIN_POOL_SIZE,
            serverSelectionTimeoutMS=settings.MONGODB_TIMEOUT_MS,
        )

    def close(self) -> None:
        """Close all connections."""
        if self._async_client is not None:
            self._async_client.close()
            self._async_client = None
            logger.info("Closed async MongoDB connection")
        if self._sync_client is not None:
            self._sync_client.close()
            self._sync_client = None
            logger.info("Closed sync MongoDB connection")

    def get_core_db(self) -> AsyncIOMotorDatabase:
        """Return reference to pathai_core database."""
        if self._mock_core_db is not None:
            return self._mock_core_db
        return self.async_client[settings.MONGODB_CORE_DB]

    def get_chat_db(self) -> AsyncIOMotorDatabase:
        """Return reference to pathai_chat database."""
        if self._mock_chat_db is not None:
            return self._mock_chat_db
        return self.async_client[settings.MONGODB_CHAT_DB]

    def set_mock_databases(self, core_db: Any, chat_db: Any) -> None:
        """Inject mock databases for unit and integration testing."""
        self._mock_core_db = core_db
        self._mock_chat_db = chat_db

    def reset_mocks(self) -> None:
        """Clear injected mock databases."""
        self._mock_core_db = None
        self._mock_chat_db = None

    async def ping(self) -> Dict[str, Any]:
        """Perform ping command to verify server responsiveness."""
        if self._mock_core_db is not None:
            return {"status": "ok", "latency_ms": 0.0, "mock": True}

        start = time.perf_counter()
        try:
            client = self.async_client
            res = await client.admin.command("ping")
            latency_ms = (time.perf_counter() - start) * 1000.0
            return {
                "status": "ok" if res.get("ok") == 1.0 else "degraded",
                "latency_ms": round(latency_ms, 2),
                "server": settings.MONGODB_URI,
            }
        except Exception as exc:
            return {
                "status": "error",
                "error": str(exc),
                "server": settings.MONGODB_URI,
            }


# Global singleton instance
mongo_manager = MongoManager()


async def get_core_db() -> AsyncIOMotorDatabase:
    """Dependency / accessor for pathai_core."""
    return mongo_manager.get_core_db()


async def get_chat_db() -> AsyncIOMotorDatabase:
    """Dependency / accessor for pathai_chat."""
    return mongo_manager.get_chat_db()
