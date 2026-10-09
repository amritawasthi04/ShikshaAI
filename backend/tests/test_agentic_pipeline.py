"""Tests for the agentic execution pipeline, context service, tool service, and validation service."""
import uuid
import pytest
from motor.motor_asyncio import AsyncIOMotorDatabase
from app.core.schemas.plan import TaskItem, TaskPlan, WorkerRole
from app.core.schemas.worker import RoadmapProposalPayload
from app.db.connection import mongo_manager
from app.services.context_service import ContextService
from app.services.execution_service import ExecutionService
from app.services.retrieval_service import RetrievalService
from app.services.tool_service import ToolService
from app.services.validation_service import ValidationService
from starlette.testclient import TestClient


@pytest.mark.asyncio
async def test_tool_service_least_privilege_and_security():
    core_db = mongo_manager.get_core_db()
    tool_service = ToolService(core_db)
    learner_id = f"test_learner_tool_{uuid.uuid4().hex[:6]}"

    # 1. Permitted tool execution for authorized role
    res = await tool_service.execute_tool(
        worker_role=WorkerRole.CURRICULUM,
        tool_name="get_learner_context",
        learner_id=learner_id,
        arguments={},
    )
    assert "learner_id" in res
    assert res["learner_id"] == learner_id

    # 2. Least privilege violation: TEACHING role attempting to access restricted evaluator rubric
    with pytest.raises(PermissionError, match="not permitted to use tool"):
        await tool_service.execute_tool(
            worker_role=WorkerRole.TEACHING,
            tool_name="get_evaluation_context",
            learner_id=learner_id,
            arguments={"assessment_id": "asm_123"},
        )

    # 3. Strictly forbidden tool attempt: any role attempting drop_collection or arbitrary query
    with pytest.raises(PermissionError, match="strictly forbidden"):
        await tool_service.execute_tool(
            worker_role=WorkerRole.CURRICULUM,
            tool_name="drop_collection",
            learner_id=learner_id,
            arguments={},
        )


@pytest.mark.asyncio
async def test_validation_service_rules():
    core_db = mongo_manager.get_core_db()
    val_service = ValidationService(core_db)

    # 1. Schema check
    valid_payload = {
        "goal_id": "goal_1",
        "version": 1,
        "phases": [{"phase": 1}],
        "prerequisites": [],
        "rationale": "Valid plan",
    }
    assert val_service.validate_schema("RoadmapProposalPayload", valid_payload) is True

    invalid_payload = {"invalid_field": True}  # Missing required goal_id, version, phases, etc.
    assert val_service.validate_schema("RoadmapProposalPayload", invalid_payload) is False

    # 2. Score bounds check
    assert val_service.validate_score_bounds(85.5) is True
    assert val_service.validate_score_bounds(0.0) is True
    assert val_service.validate_score_bounds(100.0) is True
    assert val_service.validate_score_bounds(-1.0) is False
    assert val_service.validate_score_bounds(105.0) is False

    # 3. Bounded correction cycle check (strictly max 1 cycle)
    assert val_service.can_attempt_revision(0) is True
    assert val_service.can_attempt_revision(1) is False
    assert val_service.can_attempt_revision(2) is False


@pytest.mark.asyncio
async def test_execution_service_full_pipeline():
    core_db = mongo_manager.get_core_db()
    exec_service = ExecutionService(core_db)
    learner_id = f"test_learner_exec_{uuid.uuid4().hex[:6]}"

    uid = uuid.uuid4().hex[:6]
    t1_id = f"t1_{uid}"
    t2_id = f"t2_{uid}"

    # Construct DAG plan: Task 1 (Curriculum) -> Task 2 (Assessment Design depends on Task 1)
    t1 = TaskItem(
        task_id=t1_id,
        worker_role=WorkerRole.CURRICULUM,
        objective="Design curriculum for Graph Algorithms",
        dependencies=[],
        requested_tools=["get_learner_context"],
        output_schema="RoadmapProposalPayload",
    )
    t2 = TaskItem(
        task_id=t2_id,
        worker_role=WorkerRole.ASSESSMENT_DESIGN,
        objective="Create comprehension quiz for Graph Algorithms",
        dependencies=[t1_id],
        requested_tools=["get_learner_context"],
        output_schema="AssessmentDesignPayload",
    )
    plan = TaskPlan(
        plan_id=f"plan_{uuid.uuid4().hex[:8]}",
        overall_objective="Master Graph Algorithms with verified milestones",
        master_instructions="Ensure prerequisites and hidden rubrics are well-defined.",
        tasks=[t1, t2],
    )

    context_snapshot = {"active_goals": ["Graph Algorithms"]}

    # Execute full pipeline: plan validation -> worker execution -> tools -> judge review -> deterministic validation -> persistence
    run = await exec_service.execute_plan(plan, learner_id, context_snapshot)
    assert run.status == "completed"
    assert run.completed_at is not None

    # Verify run details
    details = await exec_service.get_run_details(run.run_id)
    assert details is not None
    assert len(details["tasks"]) == 2
    assert len(details["judge_reviews"]) == 2
    assert all(t["status"] == "completed" for t in details["tasks"])


def test_chat_idempotency_protection(client: TestClient):
    uid = uuid.uuid4().hex[:6]
    learner_id = f"test_learner_idemp_{uid}"
    headers = {"X-Learner-Id": learner_id}

    # 1. Create conversation
    res = client.post("/api/v1/conversations", headers=headers, json={"title": "Idempotency Test"})
    assert res.status_code == 201
    convo_id = res.json()["conversation_id"]

    idempotency_key = f"idemp_key_{uid}"
    msg_headers = {**headers, "X-Idempotency-Key": idempotency_key}

    # 2. First send
    res1 = client.post(
        f"/api/v1/conversations/{convo_id}/messages",
        headers=msg_headers,
        json={"content": "What is Big O notation?"},
    )
    assert res1.status_code == 200
    data1 = res1.json()

    # 3. Duplicate send with identical idempotency key
    res2 = client.post(
        f"/api/v1/conversations/{convo_id}/messages",
        headers=msg_headers,
        json={"content": "What is Big O notation?"},
    )
    assert res2.status_code == 200
    data2 = res2.json()

    # Must return identical message without creating duplicate messages or advancing sequence numbers
    assert data1["message_id"] == data2["message_id"]
    assert data1["sequence_number"] == data2["sequence_number"]

    # Verify total messages in history is exactly 2 (1 user + 1 assistant), NOT 4!
    history_res = client.get(f"/api/v1/conversations/{convo_id}/messages", headers=headers)
    assert history_res.status_code == 200
    messages = history_res.json()
    assert len(messages) == 2
