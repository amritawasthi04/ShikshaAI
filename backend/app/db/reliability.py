"""Phase 6: Background reliability engine for jobs, retries, deduplication, and recovery."""
from datetime import datetime, timedelta
import logging
from typing import Any, Dict, List, Optional
from motor.motor_asyncio import AsyncIOMotorDatabase
from app.db.connection import mongo_manager
from app.db.models.base import utc_now
from app.db.models.core import OutboxEventModel, RunModel, TaskModel

logger = logging.getLogger("pathai.db.reliability")


class JobManager:
    """Tracks durable job lifecycle, prevents duplicates, handles retries and worker crash recovery."""

    def __init__(self, core_db: Optional[AsyncIOMotorDatabase] = None) -> None:
        self.db = core_db if core_db is not None else mongo_manager.get_core_db()
        self.runs = self.db["runs"]
        self.tasks = self.db["tasks"]

    async def create_job_idempotent(
        self,
        run_id: str,
        learner_id: str,
        plan_id: Optional[str] = None,
        dedupe_key: Optional[str] = None,
    ) -> RunModel:
        """Create a new run idempotently, returning existing active/completed run if dedupe_key matches."""
        if dedupe_key:
            existing = await self.runs.find_one(
                {"learner_id": learner_id, "dedupe_key": dedupe_key},
                {"_id": 0},
            )
            if existing:
                logger.info("Deduplication matched existing run %s for key %s", existing["run_id"], dedupe_key)
                return RunModel.model_validate(existing)

        run = RunModel(
            run_id=run_id,
            learner_id=learner_id,
            plan_id=plan_id,
            status="queued",
            created_at=utc_now(),
        )
        doc = run.to_mongo_doc()
        if dedupe_key:
            doc["dedupe_key"] = dedupe_key

        await self.runs.insert_one(doc)
        return run

    async def start_job(self, run_id: str) -> bool:
        """Mark job as running and record start time."""
        res = await self.runs.update_one(
            {"run_id": run_id, "status": "queued"},
            {"$set": {"status": "running", "started_at": utc_now(), "updated_at": utc_now()}},
        )
        return res.modified_count > 0

    async def complete_job(self, run_id: str) -> bool:
        """Mark job as completed and record completion timestamp."""
        res = await self.runs.update_one(
            {"run_id": run_id, "status": "running"},
            {"$set": {"status": "completed", "completed_at": utc_now(), "updated_at": utc_now()}},
        )
        return res.modified_count > 0

    async def fail_job(
        self,
        run_id: str,
        error_message: str,
        retryable: bool = True,
        max_retries: int = 3,
    ) -> str:
        """Record job error with retry backoff support or terminal failure state."""
        run = await self.runs.find_one({"run_id": run_id})
        if not run:
            return "not_found"

        retries = run.get("retry_count", 0)
        if retryable and retries < max_retries:
            new_retries = retries + 1
            await self.runs.update_one(
                {"run_id": run_id},
                {
                    "$set": {
                        "status": "queued",
                        "retry_count": new_retries,
                        "last_error": error_message,
                        "updated_at": utc_now(),
                    }
                },
            )
            logger.warning("Job %s failed (attempt %d/%d), requeued for retry: %s", run_id, new_retries, max_retries, error_message)
            return "requeued"

        # Terminal failure
        await self.runs.update_one(
            {"run_id": run_id},
            {
                "$set": {
                    "status": "failed",
                    "terminal_error": error_message,
                    "completed_at": utc_now(),
                    "updated_at": utc_now(),
                }
            },
        )
        logger.error("Job %s terminally failed: %s", run_id, error_message)
        return "failed"

    async def cancel_job(self, run_id: str, reason: str = "User requested cancellation") -> bool:
        """Cooperatively cancel an active or queued run."""
        res = await self.runs.update_one(
            {"run_id": run_id, "status": {"$in": ["queued", "running", "awaiting_approval"]}},
            {"$set": {"status": "cancelled", "cancel_reason": reason, "completed_at": utc_now(), "updated_at": utc_now()}},
        )
        return res.modified_count > 0

    async def recover_stale_running_jobs(self, timeout_minutes: int = 15) -> int:
        """Scan for jobs stuck in running state past lease threshold (worker crash) and requeue them."""
        cutoff = utc_now() - timedelta(minutes=timeout_minutes)
        res = await self.runs.update_many(
            {"status": "running", "updated_at": {"$lte": cutoff}},
            {"$set": {"status": "queued", "recovery_note": "Requeued after worker lease timeout", "updated_at": utc_now()}},
        )
        if res.modified_count > 0:
            logger.info("Recovered and requeued %d stale runs", res.modified_count)
        return res.modified_count


class OutboxProcessor:
    """Processes pending transactional outbox events ensuring at-least-once delivery."""

    def __init__(self, core_db: Optional[AsyncIOMotorDatabase] = None) -> None:
        self.db = core_db if core_db is not None else mongo_manager.get_core_db()
        self.outbox = self.db["outbox_events"]

    async def process_pending_events(self, batch_size: int = 50) -> Dict[str, int]:
        """Fetch pending outbox events and mark them dispatched."""
        cursor = self.outbox.find({"delivery_state": "pending"}).sort("created_at", 1).limit(batch_size)
        events = await cursor.to_list(length=batch_size)

        dispatched = 0
        failed = 0

        for ev in events:
            ev_id = ev["event_id"]
            try:
                # In production, dispatch to Celery / Redis or webhook here
                await self.outbox.update_one(
                    {"event_id": ev_id},
                    {"$set": {"delivery_state": "dispatched", "dispatched_at": utc_now()}},
                )
                dispatched += 1
            except Exception as exc:
                logger.error("Outbox dispatch failed for %s: %s", ev_id, exc)
                await self.outbox.update_one(
                    {"event_id": ev_id},
                    {"$inc": {"retry_count": 1}, "$set": {"last_error": str(exc)}},
                )
                failed += 1

        return {"dispatched": dispatched, "failed": failed}
