"""Unit and integration tests for database repositories and coordinator."""
import pytest
import pytest_asyncio
from app.db.connection import mongo_manager
from app.db.models.chat import ChatMessageModel, ConversationModel
from app.db.models.core import (
    AssessmentModel,
    AssessmentRubricModel,
    LearnerModel,
    ProposalModel,
    SkillEvidenceModel,
    SkillModel,
)
from app.db.repositories.chat import ChatRepository
from app.db.repositories.core import (
    AssessmentRepository,
    LearnerRepository,
    ProposalRepository,
    SkillRepository,
)
from app.db.coordinator import CrossStoreCoordinator


@pytest.mark.asyncio
async def test_skill_evidence_deduplication_and_mastery():
    core_db = mongo_manager.get_core_db()
    skill_repo = SkillRepository(core_db)

    test_learner = "test_learner_skill_01"
    test_skill = "skill_python_basics"
    dedupe_key = "exam_1_question_3"

    ev1 = SkillEvidenceModel(
        evidence_id="ev_test_1",
        learner_id=test_learner,
        skill_id=test_skill,
        source_type="assessment",
        source_id="attempt_01",
        score=90.0,
        dedupe_key=dedupe_key,
        verification_state="verified",
    )

    # First insertion should save
    res1 = await skill_repo.record_evidence_idempotent(ev1)
    assert res1.score == 90.0

    # Duplicate insertion with same dedupe_key should be idempotent
    ev2 = SkillEvidenceModel(
        evidence_id="ev_test_2_duplicate",
        learner_id=test_learner,
        skill_id=test_skill,
        source_type="assessment",
        source_id="attempt_01",
        score=50.0,  # Different score
        dedupe_key=dedupe_key,
        verification_state="verified",
    )
    res2 = await skill_repo.record_evidence_idempotent(ev2)
    # Must preserve original score from existing record
    assert res2.score == 90.0

    # Verify learner mastery score was updated
    learner_skill = await skill_repo.get_learner_skill(test_learner, test_skill)
    assert learner_skill is not None
    assert learner_skill.mastery_score == 90.0

    # Cleanup
    await core_db["skill_evidence"].delete_many({"learner_id": test_learner})
    await core_db["learner_skills"].delete_many({"learner_id": test_learner})


@pytest.mark.asyncio
async def test_assessment_isolated_rubric_access():
    core_db = mongo_manager.get_core_db()
    asm_repo = AssessmentRepository(core_db)

    asm_id = "asm_unit_test_01"
    asm = AssessmentModel(
        assessment_id=asm_id,
        title="Python Basics Quiz",
        skill_ids=["skill_python_basics"],
        questions=[{"id": "q1", "prompt": "What is a list comprehension?"}],
    )
    rubric = AssessmentRubricModel(
        rubric_id="rub_unit_01",
        assessment_id=asm_id,
        scoring_criteria={"accuracy": "100%"},
        answer_keys={"q1": "[x for x in iterable]"},
        min_pass_score=75.0,
        restricted_access=True,
    )

    await asm_repo.assessments.insert(asm)
    await asm_repo.rubrics.insert(rubric)

    # Public method returns questions without rubrics
    public_asm = await asm_repo.get_assessment(asm_id)
    assert public_asm is not None
    assert len(public_asm.questions) == 1
    assert not hasattr(public_asm, "answer_keys")

    # Isolated method returns secure rubric
    isolated_rub = await asm_repo.get_rubric_isolated(asm_id)
    assert isolated_rub is not None
    assert isolated_rub.answer_keys["q1"] == "[x for x in iterable]"

    # Cleanup
    await asm_repo.assessments.delete_one({"assessment_id": asm_id})
    await asm_repo.rubrics.delete_one({"rubric_id": "rub_unit_01"})


@pytest.mark.asyncio
async def test_proposal_concurrency_conflict_protection():
    core_db = mongo_manager.get_core_db()
    prop_repo = ProposalRepository(core_db)

    learner_id = "test_learner_prop_01"
    prop_id = "prop_conflict_01"

    proposal = ProposalModel(
        proposal_id=prop_id,
        learner_id=learner_id,
        kind="roadmap_change",
        base_version=2,  # Prepared on top of version 2
        proposed_version=3,
        rationale="Add graph algorithms milestone",
        diff_payload={"milestone": "graphs"},
    )
    await prop_repo.create_proposal(proposal)

    # Case 1: Active version has moved to 3, so expected_base is 3 != proposal base (2)
    conflict_res = await prop_repo.accept_proposal_atomic(
        learner_id=learner_id,
        proposal_id=prop_id,
        expected_base_version=3,  # Stale!
    )
    assert conflict_res is False

    # Case 2: Expected base matches proposal base (2)
    success_res = await prop_repo.accept_proposal_atomic(
        learner_id=learner_id,
        proposal_id=prop_id,
        expected_base_version=2,  # Matches!
    )
    assert success_res is True

    # Cleanup
    await core_db["proposals"].delete_one({"proposal_id": prop_id})


@pytest.mark.asyncio
async def test_chat_repository_sequence_auto_increment():
    import uuid
    chat_db = mongo_manager.get_chat_db()
    chat_repo = ChatRepository(chat_db)

    uid = uuid.uuid4().hex[:8]
    convo_id = f"test_convo_seq_{uid}"
    learner_id = f"test_learner_chat_{uid}"

    # Pre-clean any stale fixture if needed
    await chat_db["conversations"].delete_many({"conversation_id": {"$in": [convo_id, "test_convo_seq_01"]}})
    await chat_db["messages"].delete_many({"conversation_id": {"$in": [convo_id, "test_convo_seq_01"]}})

    try:
        convo = ConversationModel(conversation_id=convo_id, learner_id=learner_id)
        await chat_repo.create_conversation(convo)

        # Append message 1 without explicit sequence
        msg1 = ChatMessageModel(
            message_id=f"msg_test_1_{uid}",
            conversation_id=convo_id,
            sequence_number=0,  # Trigger auto-increment
            role="user",
            content="First question",
        )
        saved1 = await chat_repo.append_message(msg1)
        assert saved1.sequence_number == 1

        # Append message 2
        msg2 = ChatMessageModel(
            message_id=f"msg_test_2_{uid}",
            conversation_id=convo_id,
            sequence_number=0,
            role="assistant",
            content="First answer",
        )
        saved2 = await chat_repo.append_message(msg2)
        assert saved2.sequence_number == 2

        # Fetch history
        history = await chat_repo.get_messages(convo_id)
        assert len(history) == 2
        assert history[0].sequence_number == 1
        assert history[1].sequence_number == 2
    finally:
        await chat_db["conversations"].delete_one({"conversation_id": convo_id})
        await chat_db["messages"].delete_many({"conversation_id": convo_id})
