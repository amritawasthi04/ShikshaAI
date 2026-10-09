"""Tests for Phase 1 Foundation: identity, error handling, and request lifecycle."""
import uuid
import pytest
from starlette.testclient import TestClient

from app.core.auth.token import verify_bearer_token
from app.core.auth.models import LearnerIdentity
from app.core.errors.exceptions import (
    AuthenticationError,
    AuthorizationError,
    NotFoundError,
    PolicyViolationError,
)
from app.core.auth.deps import verify_owner_access


def test_token_verification_success():
    identity = verify_bearer_token("test-token:learner_42:auth0|sub42")
    assert identity.learner_id == "learner_42"
    assert identity.auth_subject == "auth0|sub42"
    assert identity.roles == ["learner"]


def test_token_verification_test_learner_prefix():
    identity = verify_bearer_token("test-learner-amrit")
    assert identity.learner_id == "amrit"
    assert identity.auth_subject == "auth0|amrit"


def test_token_verification_empty_or_malformed_fails():
    with pytest.raises(AuthenticationError, match="cannot be empty"):
        verify_bearer_token("")

    with pytest.raises(AuthenticationError, match="Invalid or unsupported"):
        verify_bearer_token("unsupported-token-format")


def test_owner_access_enforcement():
    caller = LearnerIdentity(learner_id="learner_alice", auth_subject="sub1", roles=["learner"])
    # Same learner succeeds
    verify_owner_access("learner_alice", caller)

    # Different learner raises AuthorizationError
    with pytest.raises(AuthorizationError, match="Forbidden"):
        verify_owner_access("learner_bob", caller)


def test_request_lifecycle_tracing_headers(client: TestClient):
    """Verifies RequestContextMiddleware injects X-Request-Id and execution duration."""
    response = client.get("/api/v1/healthz")
    assert response.status_code == 200
    assert "X-Request-Id" in response.headers
    assert "X-Response-Time-Ms" in response.headers


def test_request_lifecycle_preserves_client_request_id(client: TestClient):
    """Verifies that an incoming X-Request-Id header is preserved across the lifecycle."""
    custom_id = "req_custom_trace_9999"
    response = client.get("/api/v1/healthz", headers={"X-Request-Id": custom_id})
    assert response.status_code == 200
    assert response.headers["X-Request-Id"] == custom_id


def test_invalid_bearer_scheme_returns_sanitized_401(client: TestClient):
    """Verifies missing Bearer prefix returns structured public ErrorResponse."""
    response = client.get("/api/v1/me", headers={"Authorization": "Basic 12345"})
    assert response.status_code == 401
    data = response.json()
    assert data["error_code"] == "UNAUTHORIZED"
    assert data["retryable"] is False
    assert "request_id" in data
    assert "Bearer scheme" in data["message"]


def test_root_phase1_status(client: TestClient):
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["phase"] == "Phase 1 - Foundation"


def test_authenticated_me_preferences_goals(client: TestClient):
    """Verifies /me, /preferences, and /goals work with authenticated learner scope."""
    headers = {"Authorization": "Bearer test-learner-phase1_tester"}

    # 1. /me
    me_resp = client.get("/api/v1/me", headers=headers)
    assert me_resp.status_code == 200
    me_data = me_resp.json()
    assert me_data["learner_id"] == "phase1_tester"

    # 2. Update preferences
    pref_payload = {
        "learning_style": "interactive_practice",
        "weekly_availability_hours": 12.0,
        "voice_enabled": True,
    }
    put_pref = client.put("/api/v1/preferences", json=pref_payload, headers=headers)
    assert put_pref.status_code == 200
    assert put_pref.json()["learning_style"] == "interactive_practice"

    # 3. Read preferences back
    get_pref = client.get("/api/v1/preferences", headers=headers)
    assert get_pref.status_code == 200
    assert get_pref.json()["learning_style"] == "interactive_practice"
    assert get_pref.json()["weekly_availability_hours"] == 12.0

    # 4. Create goal
    goal_payload = {
        "title": "Master Distributed Agent Systems",
        "target_domain": "artificial_intelligence",
        "target_mastery_level": "advanced",
    }
    create_goal = client.post("/api/v1/goals", json=goal_payload, headers=headers)
    assert create_goal.status_code == 201
    goal_data = create_goal.json()
    assert goal_data["learner_id"] == "phase1_tester"
    assert goal_data["title"] == goal_payload["title"]
    assert goal_data["target_domain"] == "artificial_intelligence"

    # 5. List goals
    list_goals = client.get("/api/v1/goals", headers=headers)
    assert list_goals.status_code == 200
    assert len(list_goals.json()) >= 1
    assert any(g["title"] == goal_payload["title"] for g in list_goals.json())
