"""Tests for Background Reliability (Phase 6) and Database Operations (Phase 7)."""
import uuid
from datetime import timedelta
import pytest
from app.core.schemas.plan import WorkerRole
from app.db.connection import mongo_manager
from app.db.models.base import utc_now
from app.db.models.core import NotificationModel, OutboxEventModel, ProjectModel
from app.db.operations import DatabaseOperations
from app.db.reliability import JobManager, OutboxProcessor
from app.db.repositories.core import NotificationRepository, ProjectRepository
from app.db.worker import DatabaseWorker


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


@pytest.mark.asyncio
async def test_notifications_and_deduplication():
    uid = uuid.uuid4().hex[:8]
    learner_id = f"lrn_notif_{uid}"
    core_db = mongo_manager.get_core_db()
    notif_repo = NotificationRepository(core_db)

    dedupe_key = f"daily_reminder_{uid}"
    n1 = NotificationModel(
        notification_id=f"notif_1_{uid}",
        learner_id=learner_id,
        type="study_reminder",
        payload={"message": "Time to practice binary trees!"},
        dedupe_key=dedupe_key,
    )

    try:
        saved1 = await notif_repo.create_notification(n1)
        assert saved1.notification_id == f"notif_1_{uid}"

        # Duplicate attempt with identical dedupe_key must be safely deduplicated
        n2 = NotificationModel(
            notification_id=f"notif_2_{uid}",
            learner_id=learner_id,
            type="study_reminder",
            payload={"message": "Time to practice binary trees!"},
            dedupe_key=dedupe_key,
        )
        saved2 = await notif_repo.create_notification(n2)
        assert saved2.notification_id == f"notif_1_{uid}"

        unread = await notif_repo.get_notifications(learner_id, unread_only=True)
        assert len(unread) == 1

        # Mark read
        marked = await notif_repo.mark_as_read(saved1.notification_id, learner_id)
        assert marked is True

        unread_after = await notif_repo.get_notifications(learner_id, unread_only=True)
        assert len(unread_after) == 0
    finally:
        await core_db["notifications"].delete_many({"learner_id": learner_id})


@pytest.mark.asyncio
async def test_project_and_sandbox_workflow():
    uid = uuid.uuid4().hex[:8]
    learner_id = f"lrn_proj_{uid}"
    project_id = f"proj_{uid}"
    sub_id = f"sub_{uid}"
    exec_id = f"exec_{uid}"
    skill_id = "skill_graph_traversal"

    core_db = mongo_manager.get_core_db()
    mentor_worker = DatabaseWorker(learner_id=learner_id, role=WorkerRole.PROJECT_MENTOR)
    code_worker = DatabaseWorker(learner_id=learner_id, role=WorkerRole.CODE_COACH)

    # 1. Create project brief
    await core_db["projects"].insert_one({
        "project_id": project_id,
        "title": "Build a Graph Path Finder",
        "brief": "Implement BFS and Dijkstra algorithms.",
        "requirements": ["BFS traversal", "Shortest path output"],
        "skill_ids": [skill_id],
    })

    try:
        # 2. Mentor reads project brief
        proj = await mentor_worker.get_project_details(project_id)
        assert proj is not None
        assert proj.title == "Build a Graph Path Finder"

        # 3. Code coach records sandbox execution result
        exec_record = await code_worker.record_sandbox_execution(
            execution_id=exec_id,
            submission_id=sub_id,
            runtime="python3.12",
            limits={"timeout_seconds": 10, "memory_mb": 256},
            exit_code=0,
            stdout="All 5 unit tests passed.",
            stderr="",
            status="success",
        )
        assert exec_record.exit_code == 0
        assert exec_record.status == "success"

        # 4. Project mentor evaluates submission and records verified skill evidence
        eval_result = await mentor_worker.evaluate_project_submission(
            submission_id=sub_id,
            project_id=project_id,
            status="approved",
            rubric_feedback={"correctness": "Excellent Dijkstra implementation"},
            skill_evaluations=[{"skill_id": skill_id, "score": 92.0, "misconceptions": []}],
        )
        assert eval_result["status"] == "approved"
        assert eval_result["evidence_count"] == 1

        # Check evidence was recorded
        evidence = await core_db["skill_evidence"].find_one({"source_id": sub_id})
        assert evidence is not None
        assert evidence["score"] == 92.0
    finally:
        await core_db["projects"].delete_one({"project_id": project_id})
        await core_db["submissions"].delete_one({"submission_id": sub_id})
        await core_db["sandbox_executions"].delete_one({"execution_id": exec_id})
        await core_db["skill_evidence"].delete_many({"learner_id": learner_id})
        await core_db["learner_skills"].delete_many({"learner_id": learner_id})


@pytest.mark.asyncio
async def test_backup_and_restore_operations():
    # Verify backup creation snapshot
    backup = await DatabaseOperations.create_backup()
    assert "version" in backup
    assert "core" in backup
    assert "chat" in backup
    assert isinstance(backup["core"], dict)

    # Verify performance metrics inspection
    perf = await DatabaseOperations.get_performance_metrics()
    assert "collections" in perf
    assert len(perf["collections"]) >= 1

