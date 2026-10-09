"""Tests for health and readiness probes."""
from starlette.testclient import TestClient
from app.config import settings


def test_healthz_endpoint(client: TestClient):
    response = client.get("/api/v1/healthz")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "alive"
    assert "PathAI" in data["app"]


def test_readyz_endpoint_scaffold_returns_503(client: TestClient, monkeypatch):
    """Verifies readiness behavior when unready vs ready."""
    monkeypatch.setattr(settings, "IS_READY", False)
    response = client.get("/api/v1/readyz")
    assert response.status_code == 503
    data = response.json()
    assert data["status"] == "not_ready"
    assert "Phase 0" in data["phase"]

    monkeypatch.setattr(settings, "IS_READY", True)
    response_ready = client.get("/api/v1/readyz")
    assert response_ready.status_code == 200
    assert response_ready.json()["status"] == "ready"


def test_root_endpoint(client: TestClient):
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert "Phase" in data["phase"]
