"""Tests for health and readiness probes."""
from starlette.testclient import TestClient


def test_healthz_endpoint(client: TestClient):
    response = client.get("/api/v1/healthz")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "alive"
    assert "PathAI" in data["app"]


def test_readyz_endpoint_scaffold_returns_503(client: TestClient):
    """Verifies that Phase 0 scaffold intentionally returns 503 until live connections are bound."""
    response = client.get("/api/v1/readyz")
    assert response.status_code == 503
    data = response.json()
    assert data["status"] == "not_ready"
    assert "Phase 0" in data["phase"]


def test_root_endpoint(client: TestClient):
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["phase"] == "Phase 0 - Scaffold"
