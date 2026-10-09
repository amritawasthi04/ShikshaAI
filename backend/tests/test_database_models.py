"""Tests for all database domain and chat models."""
from datetime import datetime, timezone
import pytest
from app.db.models.base import MongoBaseModel, utc_now
from app.db.models.chat import (
    ChatMessageModel,
    CitationModel,
    ConversationModel,
    ConversationRunRefModel,
    SummaryModel,
)
from app.db.models.core import (
    AssessmentModel,
    AssessmentRubricModel,
    AttemptModel,
    DocumentModel,
    DocumentPassageModel,
    GoalModel,
    JudgeReviewModel,
    LearnerModel,
    LearnerSkillModel,
    LessonProgressModel,
    LessonVersionModel,
    NotificationModel,
    OutboxEventModel,
    PreferenceModel,
    ProjectModel,
    ProposalModel,
    ReviewItemModel,
    RoadmapModel,
    RoadmapVersionModel,
    RunModel,
    SandboxExecutionModel,
    SkillEvidenceModel,
    SkillModel,
    StudyPlanModel,
    StudySessionModel,
    SubmissionModel,
    TaskModel,
)


def test_learner_model_serialization():
    learner = LearnerModel(
        learner_id="lrn_001",
        auth_subject="auth0|123456",
        display_name="Amrit Awasthi",
        timezone="Asia/Kolkata",
    )
    doc = learner.to_mongo_doc()
    assert doc["learner_id"] == "lrn_001"
    assert doc["auth_subject"] == "auth0|123456"
    assert isinstance(doc["created_at"], datetime)


def test_skill_evidence_model_bounds():
    ev = SkillEvidenceModel(
        evidence_id="ev_101",
        learner_id="lrn_001",
        skill_id="skill_python_basics",
        source_type="assessment",
        source_id="att_99",
        score=95.5,
        dedupe_key="att_99_q1",
    )
    assert ev.score == 95.5
    assert ev.verification_state == "verified"


def test_assessment_rubric_isolated_model():
    rubric = AssessmentRubricModel(
        rubric_id="rub_01",
        assessment_id="asm_01",
        scoring_criteria={"rubric": "exact_code_check"},
        answer_keys={"q1": "def solve(): return True"},
        min_pass_score=80.0,
        restricted_access=True,
    )
    assert rubric.restricted_access is True
    assert "q1" in rubric.answer_keys


def test_proposal_model_diff_payload():
    prop = ProposalModel(
        proposal_id="prop_01",
        learner_id="lrn_001",
        kind="roadmap_change",
        base_version=1,
        proposed_version=2,
        rationale="Pacing acceleration",
        diff_payload={"add_milestone": "Graph Algorithms"},
    )
    assert prop.status == "proposed"
    assert prop.base_version == 1
    assert prop.proposed_version == 2


def test_chat_message_model():
    msg = ChatMessageModel(
        message_id="msg_001",
        conversation_id="conv_001",
        sequence_number=1,
        role="user",
        content="Hello Elara, how does binary search work?",
    )
    assert msg.sequence_number == 1
    assert msg.role == "user"


def test_outbox_event_model():
    outbox = OutboxEventModel(
        event_id="evt_001",
        aggregate_type="roadmap",
        aggregate_id="rd_001",
        event_type="roadmap_version_accepted",
        payload={"version": 2},
    )
    assert outbox.delivery_state == "pending"
    assert outbox.retry_count == 0
