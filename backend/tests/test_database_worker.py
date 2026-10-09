"""Integration tests for Database Worker role enforcement, verification, and progressive understanding."""
import uuid
import pytest
from app.core.schemas.plan import WorkerRole
from app.db.connection import mongo_manager
from app.db.models.core import AssessmentModel, AssessmentRubricModel, DocumentModel, DocumentPassageModel
from app.db.worker import DatabaseWorker, DatabaseWorkerPermissionError


@pytest.mark.asyncio
async def test_database_worker_role_permission_enforcement():
    uid = uuid.uuid4().hex[:8]
    learner_id = f"lrn_worker_{uid}"
    asm_id = f"asm_worker_{uid}"

    core_db = mongo_manager.get_core_db()

    # Create assessment with private rubric
    await core_db["assessments"].insert_one({
        "assessment_id": asm_id,
        "title": "Algorithms Check",
        "skill_ids": ["skill_binary_search"],
        "questions": [{"id": "q1", "text": "What is binary search?"}],
    })
    await core_db["assessment_rubrics"].insert_one({
        "rubric_id": f"rub_{uid}",
        "assessment_id": asm_id,
        "scoring_criteria": {"rubric": "exact"},
        "answer_keys": {"q1": "logarithmic divide and conquer"},
        "min_pass_score": 75.0,
        "restricted_access": True,
    })

    try:
        # Teaching worker: Attempting to access private rubrics must be rejected
        teaching_worker = DatabaseWorker(learner_id=learner_id, role=WorkerRole.TEACHING)
        with pytest.raises(DatabaseWorkerPermissionError):
            await teaching_worker.get_assessment_rubric_isolated(asm_id)

        # Assessment evaluation worker: Accessing private rubrics must succeed
        eval_worker = DatabaseWorker(learner_id=learner_id, role=WorkerRole.ASSESSMENT_EVALUATION)
        rubric = await eval_worker.get_assessment_rubric_isolated(asm_id)
        assert rubric.answer_keys["q1"] == "logarithmic divide and conquer"
    finally:
        await core_db["assessments"].delete_one({"assessment_id": asm_id})
        await core_db["assessment_rubrics"].delete_one({"assessment_id": asm_id})


@pytest.mark.asyncio
async def test_activity_vs_understanding_separation():
    uid = uuid.uuid4().hex[:8]
    learner_id = f"lrn_prog_{uid}"
    skill_id = "skill_python_basics"
    lesson_id = f"lesson_{uid}"
    asm_id = f"asm_{uid}"
    attempt_id = f"att_{uid}"

    core_db = mongo_manager.get_core_db()
    teaching_worker = DatabaseWorker(learner_id=learner_id, role=WorkerRole.TEACHING)
    eval_worker = DatabaseWorker(learner_id=learner_id, role=WorkerRole.ASSESSMENT_EVALUATION)

    try:
        # 1. Record Activity (Completing a lesson via Teaching Worker)
        # Note: Completing a lesson must NOT alter skill mastery!
        await teaching_worker.record_lesson_activity(
            lesson_id=lesson_id,
            status="completed",
            active_seconds=900,  # 15 minutes
        )

        overview_after_activity = await teaching_worker.get_learner_progress_overview()
        assert overview_after_activity["activity"]["total_lessons_tracked"] == 1
        assert overview_after_activity["activity"]["total_study_time_seconds"] == 900
        # Understanding skills should still be 0 (no evaluated assessment yet)
        assert len(overview_after_activity["understanding"]["mastered_skills"]) == 0

        # 2. Record Understanding (A validated assessment result via Evaluator Worker)
        eval_result = await eval_worker.save_evaluated_assessment(
            assessment_id=asm_id,
            attempt_id=attempt_id,
            score=95.0,
            answers={"q1": "list comprehension syntax"},
            feedback="Mastered comprehension syntax cleanly.",
            skill_evaluations=[
                {
                    "skill_id": skill_id,
                    "score": 95.0,
                    "misconceptions": [],
                }
            ],
        )
        assert eval_result["overall_score"] == 95.0

        # Verify that understanding updated
        overview_after_eval = await teaching_worker.get_learner_progress_overview()
        assert len(overview_after_eval["understanding"]["mastered_skills"]) == 1
        skill_entry = overview_after_eval["understanding"]["mastered_skills"][0]
        assert skill_entry["skill_id"] == skill_id
        assert skill_entry["mastery_score"] == 95.0
    finally:
        await core_db["lesson_progress"].delete_many({"learner_id": learner_id})
        await core_db["study_sessions"].delete_many({"learner_id": learner_id})
        await core_db["attempts"].delete_many({"learner_id": learner_id})
        await core_db["skill_evidence"].delete_many({"learner_id": learner_id})
        await core_db["learner_skills"].delete_many({"learner_id": learner_id})


@pytest.mark.asyncio
async def test_chroma_to_mongodb_source_verification():
    """Verifies that Chroma retrieval verifies the underlying passage and ownership in MongoDB."""
    uid = uuid.uuid4().hex[:8]
    learner_id = f"lrn_verify_{uid}"
    doc_id = f"doc_{uid}"
    passage_id = f"pass_{uid}"

    core_db = mongo_manager.get_core_db()
    from app.db.chroma_client import chroma_manager

    # 1. Authoritative MongoDB Document & Passage record
    await core_db["documents"].insert_one({
        "document_id": doc_id,
        "learner_id": learner_id,
        "filename": "AlgorithmDesignManual.pdf",
        "storage_key": f"docs/{doc_id}.pdf",
        "content_hash": f"hash_{uid}",
        "extraction_quality": 1.0,
        "is_public": False,
    })
    await core_db["document_passages"].insert_one({
        "passage_id": passage_id,
        "document_id": doc_id,
        "learner_id": learner_id,
        "passage_index": 0,
        "page_number": 42,
        "section_title": "Divide and Conquer",
        "content_text": "Binary search algorithm divides the search interval in half repeatedly.",
        "is_public": False,
        "extraction_quality": 0.95,
        "skill_tags": ["Algorithms"],
    })

    # 2. Index into Chroma Cloud sharded learner collection
    learner_coll = chroma_manager.get_learner_collection(learner_id)
    learner_coll.upsert(
        ids=[passage_id],
        documents=["Binary search algorithm divides the search interval in half repeatedly."],
        metadatas=[{"document_id": doc_id, "chunk_index": 0, "learner_id": learner_id, "is_public": False}],
    )

    try:
        worker = DatabaseWorker(learner_id=learner_id, role=WorkerRole.TEACHING)
        verified_passages = await worker.retrieve_verified_knowledge(
            query="How does binary search divide intervals?",
            limit=3,
            include_public=False,
        )

        assert len(verified_passages) >= 1
        match = verified_passages[0]
        assert match["passage_id"] == passage_id
        assert match["source_title"] == "AlgorithmDesignManual.pdf"
        assert match["page_number"] == 42
        assert match["section_title"] == "Divide and Conquer"
    finally:
        await core_db["documents"].delete_one({"document_id": doc_id})
        await core_db["document_passages"].delete_one({"passage_id": passage_id})
        chroma_manager.delete_learner_collection(learner_id)
