"""Tests for roadmap.sh canonical backbone integration, compiler, and grounded lessons."""
import uuid
import pytest
from starlette.testclient import TestClient
from app.core.curriculum.canonical_roadmaps import (
    compile_canonical_curriculum,
    get_canonical_roadmap,
)
from app.core.schemas.plan import WorkerRole
from app.services.tool_service import ToolService
from app.db.connection import mongo_manager



def test_get_canonical_roadmap_retrieval():
    py_tree = get_canonical_roadmap("python")
    assert py_tree is not None
    assert py_tree["topic"] == "Python Developer"
    assert "Language Basics" in py_tree["categories"]
    assert len(py_tree["nodes"]) >= 10
    assert py_tree["external_ref"] == "https://roadmap.sh/python"

    ai_tree = get_canonical_roadmap("ai")
    assert ai_tree is not None
    assert "Transformers" in [c for cat in ai_tree["categories"] for c in cat.split()]
    assert len(ai_tree["nodes"]) >= 4


def test_compile_canonical_curriculum_marks_diagnostic_skills():
    # Diagnostic skills test: learner already mastered variables and loops
    assessed_skills = [
        {"skill_id": "python:basics:variables", "score": 95.0},
        {"skill_id": "python:basics:loops", "score": 85.0},
        {"skill_id": "python:basics:functions", "score": 40.0},  # Below 70% threshold
    ]

    compiled = compile_canonical_curriculum(
        topic="python",
        assessed_skills=assessed_skills,
        weekly_hours=8.0,
    )

    assert compiled["canonical_topic"] == "Python Developer"
    assert len(compiled["milestones"]) >= 10
    assert len(compiled["phases"]) >= 4

    # Variables & Loops must be marked completed
    milestones_by_node = {m["node_id"]: m for m in compiled["milestones"]}
    assert milestones_by_node["python:basics:variables"]["is_completed"] is True
    assert milestones_by_node["python:basics:variables"]["status"] == "completed"
    assert milestones_by_node["python:basics:loops"]["is_completed"] is True

    # Functions must remain not completed
    assert milestones_by_node["python:basics:functions"]["is_completed"] is False
    assert milestones_by_node["python:basics:functions"]["status"] != "completed"


@pytest.mark.asyncio
async def test_fetch_canonical_roadmap_tool_least_privilege():
    core_db = mongo_manager.get_core_db()
    tool_service = ToolService(core_db)

    # 1. Permitted under CURRICULUM
    res = await tool_service.execute_tool(
        worker_role=WorkerRole.CURRICULUM,
        tool_name="fetch_canonical_roadmap",
        learner_id="test_learner_tools",
        arguments={"topic": "python"},
    )
    assert "nodes" in res
    assert res["topic"] == "Python Developer"
    assert len(res["nodes"]) > 0

    # 2. Denied under non-permitted role CODE_COACH
    with pytest.raises(PermissionError):
        await tool_service.execute_tool(
            worker_role=WorkerRole.CODE_COACH,
            tool_name="fetch_canonical_roadmap",
            learner_id="test_learner_tools",
            arguments={"topic": "python"},
        )


def test_canonical_roadmap_endpoints_and_grounded_lesson(client: TestClient):
    uid = uuid.uuid4().hex[:6]
    learner_id = f"test_learner_canon_{uid}"
    headers = {"X-Learner-Id": learner_id}

    # 1. GET /roadmaps/canonical/python
    res = client.get("/api/v1/roadmaps/canonical/python", headers=headers)
    assert res.status_code == 200
    canon = res.json()
    assert canon["topic"] == "Python Developer"
    assert "categories" in canon
    assert len(canon["nodes"]) >= 10

    # 2. POST /roadmaps with canonical_topic
    goal_res = client.post(
        "/api/v1/goals",
        headers=headers,
        json={"title": "Become a Python Engineer", "target_domain": "python"},
    )
    assert goal_res.status_code == 201
    goal_id = goal_res.json()["goal_id"]

    roadmap_res = client.post(
        "/api/v1/roadmaps",
        headers=headers,
        json={"goal_id": goal_id, "canonical_topic": "python"},
    )
    assert roadmap_res.status_code == 201
    rdm = roadmap_res.json()
    assert rdm["canonical_topic"] == "Python Developer"

    # 3. Fetch version with compiled nodes
    ver_res = client.get(f"/api/v1/roadmaps/{rdm['roadmap_id']}/versions/1", headers=headers)
    assert ver_res.status_code == 200
    ver_data = ver_res.json()
    milestones = ver_data["milestones"]
    assert len(milestones) >= 10
    target_node = milestones[0]
    target_milestone_id = target_node["milestone_id"]

    # 4. POST /roadmaps/milestones/{milestone_id}/lesson - Grounded lesson generation
    lesson_res = client.post(
        f"/api/v1/roadmaps/milestones/{target_milestone_id}/lesson?roadmap_id={rdm['roadmap_id']}",
        headers=headers,
    )
    assert lesson_res.status_code == 200
    lesson_data = lesson_res.json()
    assert lesson_data["milestone_id"] == target_milestone_id
    assert lesson_data["title"] == target_node["title"]
    assert len(lesson_data["content_blocks"]) >= 3
    assert any(b["type"] == "concept_boundaries" for b in lesson_data["content_blocks"])
    assert lesson_data["external_ref"] is not None
    assert len(lesson_data["resources"]) >= 1
