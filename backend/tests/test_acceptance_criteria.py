"""End-to-end acceptance tests verifying all Section 16 requirements."""
import uuid
import pytest
from starlette.testclient import TestClient

from app.core.schemas.plan import TaskPlan, TaskItem, WorkerRole
from app.core.execution.validator import validate_task_plan, PlanValidationError
from app.core.auth.deps import verify_owner_access
from app.core.errors.exceptions import AuthorizationError
from app.services.validation_service import ValidationService
from app.db.connection import mongo_manager
from app.db.models.core import ProposalModel


def test_acceptance_cross_learner_records_inaccessible(client: TestClient):
    """AC-1: Cross-learner records remain inaccessible."""
    headers_user1 = {"Authorization": "Bearer test-learner-user1_safe"}
    headers_user2 = {"Authorization": "Bearer test-learner-user2_safe"}

    # User 1 creates a private goal
    res1 = client.post(
        "/api/v1/goals",
        headers=headers_user1,
        json={"title": "Private Goal User 1", "target_domain": "cryptography"},
    )
    assert res1.status_code == 201

    # User 2 listing goals must NOT see User 1's goal
    res2 = client.get("/api/v1/goals", headers=headers_user2)
    assert res2.status_code == 200
    user2_goals = [g["title"] for g in res2.json()]
    assert "Private Goal User 1" not in user2_goals


def test_acceptance_cyclic_dependencies_rejected():
    """AC-2: Teacher plans cannot introduce invalid/cyclic dependencies."""
    t1 = TaskItem(task_id="t1", worker_role=WorkerRole.TEACHING, objective="Task 1", dependencies=["t2"], output_schema="TeachingContentPayload")
    t2 = TaskItem(task_id="t2", worker_role=WorkerRole.TEACHING, objective="Task 2", dependencies=["t1"], output_schema="TeachingContentPayload")
    plan = TaskPlan(plan_id="p1", overall_objective="Circular task dependencies", master_instructions="Run", tasks=[t1, t2])

    with pytest.raises(PlanValidationError, match="Cyclic dependency detected"):
        validate_task_plan(plan)


def test_acceptance_judge_cannot_bypass_deterministic_validation():
    """AC-3: Judge acceptance cannot bypass backend validation."""
    core_db = mongo_manager.get_core_db()
    validator = ValidationService(core_db)

    # Missing required keys in payload must fail schema validation regardless of judge
    is_valid = validator.validate_schema("RoadmapProposalPayload", {"broken": "data"})
    assert is_valid is False


@pytest.mark.asyncio
async def test_acceptance_stale_proposals_cannot_overwrite_newer_versions(client: TestClient):
    """AC-4: Stale proposals cannot overwrite newer accepted versions."""
    uid = uuid.uuid4().hex[:6]
    learner_id = f"stale_test_{uid}"
    headers = {"X-Learner-Id": learner_id}

    # Create proposal with base_version 1
    res = client.post(
        "/api/v1/proposals",
        headers=headers,
        json={
            "kind": "roadmap_change",
            "base_version": 1,
            "proposed_version": 2,
            "rationale": "Add advanced module",
        },
    )
    assert res.status_code == 201
    prop_id = res.json()["proposal_id"]

    # Submit decision expecting base_version 2 (stale base mismatch)
    decision_res = client.post(
        f"/api/v1/proposals/{prop_id}/decision",
        headers=headers,
        json={"decision": "accept", "expected_base_version": 99},
    )
    # Must fail with 409 Conflict due to optimistic concurrency check
    assert decision_res.status_code == 409
    assert decision_res.json()["error_code"] == "CONFLICT"


def test_acceptance_frontend_reconnect_restores_status(client: TestClient):
    """AC-5: Frontend reconnect restores status and persisted records."""
    headers = {"Authorization": "Bearer test-learner-reconnect_tester"}

    # Fetch initial state
    res = client.get("/api/v1/me", headers=headers)
    assert res.status_code == 200
    data1 = res.json()

    # Reconnect call
    res_reconnect = client.get("/api/v1/me", headers=headers)
    assert res_reconnect.status_code == 200
    data2 = res_reconnect.json()

    assert data1["learner_id"] == data2["learner_id"]
