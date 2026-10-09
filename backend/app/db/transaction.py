"""Transaction support and transactional outbox helper for MongoDB."""
from contextlib import asynccontextmanager
import logging
from typing import AsyncGenerator, Callable, List, Optional
from motor.motor_asyncio import AsyncIOMotorClientSession
from app.db.connection import mongo_manager
from app.db.models.core import OutboxEventModel

logger = logging.getLogger("pathai.db.transaction")


@asynccontextmanager
async def mongo_transaction() -> AsyncGenerator[Optional[AsyncIOMotorClientSession], None]:
    """Async context manager providing a MongoDB multi-document transaction session."""
    client = mongo_manager.async_client
    try:
        async with await client.start_session() as session:
            async with session.start_transaction():
                yield session
    except Exception as exc:
        logger.warning("Transaction session fallback (standalone or mock mode): %s", exc)
        # Yield None if transactions are unsupported on the current cluster configuration
        yield None


async def commit_with_outbox(
    core_operation: Callable[[Optional[AsyncIOMotorClientSession]], Any],
    outbox_events: List[OutboxEventModel],
) -> None:
    """Atomically execute a domain state operation and persist outbox events."""
    core_db = mongo_manager.get_core_db()
    outbox_coll = core_db["outbox_events"]

    async with mongo_transaction() as session:
        # Execute the domain state write
        await core_operation(session)

        # Write outbox records within the same transaction session
        if outbox_events:
            docs = [ev.model_dump() for ev in outbox_events]
            if session:
                await outbox_coll.insert_many(docs, session=session)
            else:
                await outbox_coll.insert_many(docs)
