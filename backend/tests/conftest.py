"""Pytest configuration and test fixtures."""
import sys
from pathlib import Path
import pytest
from starlette.testclient import TestClient

# Ensure backend directory is in sys.path
backend_dir = Path(__file__).resolve().parent.parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from app.main import app


@pytest.fixture
def client():
    with TestClient(app) as test_client:
        yield test_client
