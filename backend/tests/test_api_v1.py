"""Comprehensive integration tests for all API v1 endpoints."""
import uuid
import pytest
from starlette.testclient import TestClient


def test_learner_profile_and_preferences(client: TestClient):
    uid = uuid.uuid4().hex[:6]
    learner_id = f"test_learner_api_{uid}"
    headers = {"X-Learner-Id": learner_id}

    # 1. GET /me (auto-creates if non-existent)
    res = client.get("/api/v1/me", headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert data["learner_id"] == learner_id

    # 2. PUT /me
    res = client.put(
        "/api/v1/me",
        headers=headers,
        json={"display_name": "Priya Sharma", "timezone": "Asia/Kolkata"},
    )
    assert res.status_code == 200
    assert res.json()["display_name"] == "Priya Sharma"
    assert res.json()["timezone"] == "Asia/Kolkata"

    # 3. GET & PUT /preferences
    res = client.get("/api/v1/preferences", headers=headers)
    assert res.status_code == 200

    res = client.put(
        "/api/v1/preferences",
        headers=headers,
        json={"learning_style": "visual_diagrams", "weekly_availability_hours": 10.0},
    )
    assert res.status_code == 200
    assert res.json()["learning_style"] == "visual_diagrams"
    assert res.json()["weekly_availability_hours"] == 10.0

    # 4. POST & GET /goals
    res = client.post(
        "/api/v1/goals",
        headers=headers,
        json={"title": "Master Distributed Systems", "target_domain": "computer_science"},
    )
    assert res.status_code == 201
    goal_id = res.json()["goal_id"]

    res = client.get("/api/v1/goals", headers=headers)
    assert res.status_code == 200
    goals = res.json()
    assert any(g["goal_id"] == goal_id for g in goals)


def test_conversations_and_teacher_brain(client: TestClient):
    uid = uuid.uuid4().hex[:6]
    learner_id = f"test_learner_chat_{uid}"
    headers = {"X-Learner-Id": learner_id}

    # 1. Create conversation
    res = client.post(
        "/api/v1/conversations",
        headers=headers,
        json={"title": "Algorithms with Elara"},
    )
    assert res.status_code == 201
    convo_id = res.json()["conversation_id"]

    # 2. List conversations
    res = client.get("/api/v1/conversations", headers=headers)
    assert res.status_code == 200
    assert len(res.json()) >= 1

    # 3. Send message to Teacher Brain
    res = client.post(
        f"/api/v1/conversations/{convo_id}/messages",
        headers=headers,
        json={"content": "Can you explain recursion simply?"},
    )
    assert res.status_code == 200
    asst_data = res.json()
    assert asst_data["conversation_id"] == convo_id
    assert asst_data["role"] == "assistant"
    assert "Elara" in asst_data["content"] or len(asst_data["content"]) > 10
    assert asst_data["sequence_number"] == 2  # User msg was 1, assistant is 2

    # 4. Message history
    res = client.get(f"/api/v1/conversations/{convo_id}/messages", headers=headers)
    assert res.status_code == 200
    messages = res.json()
    assert len(messages) == 2
    assert messages[0]["sequence_number"] == 1
    assert messages[1]["sequence_number"] == 2

    # 5. Teacher Brain Task Plan generation when requesting roadmap/curriculum
    res = client.post(
        f"/api/v1/conversations/{convo_id}/messages",
        headers=headers,
        json={"content": "Please create a curriculum syllabus for dynamic programming"},
    )
    assert res.status_code == 200
    plan_data = res.json()
    assert plan_data["task_plan"] is not None
    assert len(plan_data["task_plan"]["tasks"]) >= 1


def test_roadmaps_and_lessons(client: TestClient):
    uid = uuid.uuid4().hex[:6]
    learner_id = f"test_learner_rdm_{uid}"
    headers = {"X-Learner-Id": learner_id}

    # 1. Create roadmap
    res = client.post(
        "/api/v1/roadmaps",
        headers=headers,
        json={
            "goal_id": f"goal_test_{uid}",
            "milestones": [
                {"id": "m1", "title": "Variables & Control Flow", "prerequisites": []},
                {"id": "m2", "title": "Functions & Scopes", "prerequisites": ["m1"]},
            ],
            "rationale": "Foundational Python roadmap",
        },
    )
    assert res.status_code == 201
    roadmap_id = res.json()["roadmap_id"]

    # 2. Fetch active roadmap
    res = client.get("/api/v1/roadmaps", headers=headers)
    assert res.status_code == 200
    assert res.json()["roadmap_id"] == roadmap_id

    # 3. Fetch version
    res = client.get(f"/api/v1/roadmaps/{roadmap_id}/versions/1", headers=headers)
    assert res.status_code == 200
    assert len(res.json()["milestones"]) == 2

    # 4. Lesson progress
    lesson_id = f"les_py_{uid}"
    res = client.post(
        f"/api/v1/lessons/{lesson_id}/progress",
        headers=headers,
        json={"status": "completed"},
    )
    assert res.status_code == 200
    assert res.json()["progress_status"] == "completed"

    # 5. Study session recording
    res = client.post(
        f"/api/v1/lessons/{lesson_id}/sessions",
        headers=headers,
        json={"active_seconds": 1800, "measurement_source": "browser_heartbeat"},
    )
    assert res.status_code == 201
    assert res.json()["active_seconds"] == 1800


def test_assessments_isolated_rubric_and_grading(client: TestClient):
    uid = uuid.uuid4().hex[:6]
    learner_id = f"test_learner_asm_{uid}"
    headers = {"X-Learner-Id": learner_id}
    asm_id = f"asm_quiz_{uid}"

    # 1. Create assessment with hidden rubric
    res = client.post(
        "/api/v1/assessments",
        headers=headers,
        json={
            "assessment_id": asm_id,
            "title": "Python Control Flow Quiz",
            "skill_ids": [f"skill_py_{uid}"],
            "questions": [
                {"id": "q1", "prompt": "What does a break statement do in a loop?"},
                {"id": "q2", "prompt": "What does continue do?"},
            ],
            "scoring_criteria": {"accuracy": "100%"},
            "answer_keys": {
                "q1": "exits loop",
                "q2": "skips current iteration",
            },
            "min_pass_score": 50.0,
        },
    )
    assert res.status_code == 201

    # 2. Fetch public assessment -> Rubric and answer keys MUST NOT BE LEAKED!
    res = client.get(f"/api/v1/assessments/{asm_id}")
    assert res.status_code == 200
    public_data = res.json()
    assert len(public_data["questions"]) == 2
    assert "answer_keys" not in public_data
    assert "scoring_criteria" not in public_data

    # 3. Submit attempt
    res = client.post(
        f"/api/v1/assessments/{asm_id}/attempts",
        headers=headers,
        json={"answers": {"q1": "exits loop", "q2": "skips current iteration"}},
    )
    assert res.status_code == 200
    eval_data = res.json()
    assert eval_data["score"] == 100.0
    assert eval_data["grading_state"] == "graded"
    assert len(eval_data["evidence_ids"]) == 1

    # 4. Verify evidence resulted in updated mastery progress
    res = client.get("/api/v1/progress", headers=headers)
    assert res.status_code == 200
    prog = res.json()
    assert prog["total_verified_evidence"] >= 1
    assert any(s["skill_id"] == f"skill_py_{uid}" for s in prog["skills"])


def test_documents_and_knowledge_search(client: TestClient):
    uid = uuid.uuid4().hex[:6]
    learner_id = f"test_learner_doc_{uid}"
    headers = {"X-Learner-Id": learner_id}

    # 1. Register document
    res = client.post(
        "/api/v1/documents",
        headers=headers,
        json={
            "filename": f"async_guide_{uid}.txt",
            "mime_type": "text/plain",
            "content_text": f"Asyncio unique text for {uid} using an event loop to schedule cooperative tasks.",
            "is_public": False,
            "skill_tags": ["python", "asyncio"],
        },
    )
    assert res.status_code == 201
    doc_id = res.json()["document_id"]

    # 2. List documents
    res = client.get("/api/v1/documents", headers=headers)
    assert res.status_code == 200
    assert any(d["document_id"] == doc_id for d in res.json())

    # 3. Fetch passages
    res = client.get(f"/api/v1/documents/{doc_id}/passages", headers=headers)
    assert res.status_code == 200
    assert len(res.json()) >= 1

    # 4. Search passages
    res = client.post(
        "/api/v1/documents/search",
        headers=headers,
        json={"query": "event loop", "limit": 5},
    )
    assert res.status_code == 200
    results = res.json()
    assert len(results) >= 1
    assert "event loop" in results[0]["content_text"].lower()


def test_proposals_atomic_concurrency_conflict(client: TestClient):
    uid = uuid.uuid4().hex[:6]
    learner_id = f"test_learner_prop_{uid}"
    headers = {"X-Learner-Id": learner_id}

    # 1. Create proposal based on version 1
    res = client.post(
        "/api/v1/proposals",
        headers=headers,
        json={
            "kind": "roadmap_change",
            "base_version": 1,
            "proposed_version": 2,
            "rationale": "Add Fast-API project milestone",
            "diff_payload": {"milestone": "fastapi"},
        },
    )
    assert res.status_code == 201
    prop_id = res.json()["proposal_id"]

    # 2. Attempt to decide with stale expected_base_version (e.g. 99 instead of 1)
    res = client.post(
        f"/api/v1/proposals/{prop_id}/decision",
        headers=headers,
        json={"decision": "accept", "expected_base_version": 99},
    )
    assert res.status_code == 409  # Conflict!

    # 3. Accept with correct base_version 1
    res = client.post(
        f"/api/v1/proposals/{prop_id}/decision",
        headers=headers,
        json={"decision": "accept", "expected_base_version": 1},
    )
    assert res.status_code == 200
    assert res.json()["status"] == "accepted"


def test_study_plans_and_notifications(client: TestClient):
    uid = uuid.uuid4().hex[:6]
    learner_id = f"test_learner_study_{uid}"
    headers = {"X-Learner-Id": learner_id}

    # 1. Create study plan
    res = client.post(
        "/api/v1/study-plans",
        headers=headers,
        json={
            "availability_hours": 8.0,
            "tasks": [{"day": "Monday", "task": "Recursion review"}],
        },
    )
    assert res.status_code == 201

    # 2. Fetch active study plan
    res = client.get("/api/v1/study-plans", headers=headers)
    assert res.status_code == 200
    assert res.json()["availability_hours"] == 8.0

    # 3. Fetch due reviews
    res = client.get("/api/v1/reviews/due", headers=headers)
    assert res.status_code == 200
    assert isinstance(res.json(), list)

    # 4. Fetch notifications
    res = client.get("/api/v1/notifications", headers=headers)
    assert res.status_code == 200
    assert isinstance(res.json(), list)
