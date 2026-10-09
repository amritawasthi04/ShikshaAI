"""Tests for Background Reliability (Phase 6) and Database Operations (Phase 7)."""
import uuid
from datetime import timedelta
import pytest
from app.db.connection import mongo_manager
from app.db.models.base import utc_now
from app.db.models.core import OutboxEventModel
from app.db.operations import DatabaseOperations
from app.db.reliability import JobManager, OutboxProcessor


@pytest.mark.asyncio
async def test_job_manager_idempotency_and_lifecycle():
    uid = uuid.uuid4().hex[:8]
    core_db = mongo_manager.get_core_db()
    jm = JobManager(core_db)

    run_id = f"run_{uid}"
    learner_id = f"lrn_job_{uid}"
    dedupe_key = f"dispatch_goal_setup_{uid}"

    try:
        # 1. Create job idempotently
        job1 = await jm.create_job_idempotent(run_id, learner_id, dedupe_key=dedupe_key)
        assert job1.run_id == run_id
        assert job1.status == "queued"

        # 2. Duplicate call with same dedupe_key must return original run
        duplicate_run_id = f"run_duplicate_{uid}"
        job2 = await jm.create_job_idempotent(duplicate_run_id, learner_id, dedupe_key=dedupe_key)
        assert job2.run_id == run_id  # Kept original!

        # 3. Transition to running
        started = await jm.start_job(run_id)
        assert started is True

        # 4. Failure and retry backoff
        retry_res = await jm.fail_job(run_id, error_message="Network glitch", retryable=True, max_retries=2)
        assert retry_res == "requeued"

        # Fetch updated run
        run_doc = await core_db["runs"].find_one({"run_id": run_id})
        assert run_doc["status"] == "queued"
        assert run_doc["retry_count"] == 1

        # 5. Recovery of stale running jobs
        await core_db["runs"].update_one(
            {"run_id": run_id},
            {"$set": {"status": "running", "updated_at": utc_now() - timedelta(minutes=30)}},
        )
        recovered_count = await jm.recover_stale_running_jobs(timeout_minutes=15)
        assert recovered_count >= 1

        recovered_doc = await core_db["runs"].find_one({"run_id": run_id})
        assert recovered_doc["status"] == "queued"
    finally:
        await core_db["runs"].delete_many({"learner_id": learner_id})


@pytest.mark.asyncio
async def test_outbox_processing_pipeline():
    uid = uuid.uuid4().hex[:8]
    core_db = mongo_manager.get_core_db()
    processor = OutboxProcessor(core_db)

    event_id = f"evt_{uid}"
    ev = OutboxEventModel(
        event_id=event_id,
        aggregate_type="assessment",
        aggregate_id=f"att_{uid}",
        event_type="assessment_graded",
        payload={"score": 90},
        delivery_state="pending",
    )
    await core_db["outbox_events"].insert_one(ev.model_dump())

    try:
        report = await processor.process_pending_events(batch_size=10)
        assert report["dispatched"] >= 1

        # Check dispatched status in database
        saved_ev = await core_db["outbox_events"].find_one({"event_id": event_id})
        assert saved_ev["delivery_state"] == "dispatched"
        assert saved_ev["dispatched_at"] is not None
    finally:
        await core_db["outbox_events"].delete_one({"event_id": event_id})


@pytest.mark.asyncio
async def test_database_operations_and_exports():
    uid = uuid.uuid4().hex[:8]
    learner_id = f"lrn_export_{uid}"
    core_db = mongo_manager.get_core_db()

    # Insert sample profile and goal
    await core_db["learners"].insert_one({
        "learner_id": learner_id,
        "auth_subject": f"auth_{uid}",
        "display_name": "Test Student",
    })
    await core_db["goals"].insert_one({
        "goal_id": f"goal_{uid}",
        "learner_id": learner_id,
        "title": "Master Python",
        "is_active": True,
    })

    try:
        # Export bundle
        bundle = await DatabaseOperations.export_learner_bundle(learner_id)
        assert bundle["learner_id"] == learner_id
        assert len(bundle["core_data"]["learners"]) == 1
        assert len(bundle["core_data"]["goals"]) == 1

        # Integrity verification
        integrity = await DatabaseOperations.verify_data_integrity()
        assert integrity["status"] in ("healthy", "issues_found")

        # Telemetry
        telemetry = await DatabaseOperations.collect_telemetry()
        assert "mongodb_latency_ms" in telemetry
        assert "total_core_records" in telemetry
    finally:
        await core_db["learners"].delete_one({"learner_id": learner_id})
        await core_db["goals"].delete_one({"goal_id": f"goal_{uid}"})
