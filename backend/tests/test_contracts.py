"""Tests for Pydantic contracts and strict schema validation."""
from datetime import datetime, timezone
import pytest
from pydantic import ValidationError

from app.core.schemas.plan import TaskPlan, TaskItem, WorkerRole
from app.core.schemas.worker import (
    WorkerInstruction,
    WorkerResult,
    WorkerResultStatus,
    TeachingContentPayload,
    AssessmentDesignPayload,
    AssessmentQuestion,
)
from app.core.schemas.judge import (
    JudgeReview,
    JudgeVerdict,
    JudgeIssue,
    IssueSeverity,
)
from app.core.schemas.domain import (
    LearnerProfile,
    SkillEvidence,
    VerificationState,
    Roadmap,
    RoadmapMilestone,
    Proposal,
    ProposalStatus,
)


def test_task_plan_valid():
    task = TaskItem(
        task_id="t1",
        worker_role=WorkerRole.TEACHING,
        objective="Explain recursion with base cases",
        dependencies=[],
        requested_tools=["fetch_lesson"],
        output_schema="TeachingContentPayload",
    )
    plan = TaskPlan(
        plan_id="plan_101",
        overall_objective="Master recursive problem solving",
        master_instructions="Use step-by-step trace examples",
        tasks=[task],
    )
    assert plan.plan_id == "plan_101"
    assert len(plan.tasks) == 1
    assert plan.tasks[0].worker_role == WorkerRole.TEACHING


def test_task_plan_duplicate_task_id_rejected():
    task1 = TaskItem(
        task_id="dup_1",
        worker_role=WorkerRole.TEACHING,
        objective="Explain recursion part 1",
        dependencies=[],
        requested_tools=[],
        output_schema="TeachingContentPayload",
    )
    task2 = TaskItem(
        task_id="dup_1",
        worker_role=WorkerRole.CURRICULUM,
        objective="Explain recursion part 2",
        dependencies=[],
        requested_tools=[],
        output_schema="RoadmapProposalPayload",
    )
    with pytest.raises(ValidationError, match="Duplicate task_id detected"):
        TaskPlan(
            plan_id="plan_invalid",
            overall_objective="Recursion mastery",
            master_instructions="None",
            tasks=[task1, task2],
        )


def test_judge_review_contract():
    issue = JudgeIssue(
        category="unsupported_claim",
        severity=IssueSeverity.HIGH,
        description="Claimed O(1) space complexity without tail recursion optimization",
        correction="Clarify call stack memory usage of O(N)",
    )
    review = JudgeReview(
        review_id="rev_001",
        task_id="t1",
        verdict=JudgeVerdict.REVISE,
        objective_covered=True,
        grounded_in_evidence=False,
        appropriate_difficulty=True,
        issues=[issue],
        required_corrections=["Fix space complexity claim"],
        correction_cycle=1,
    )
    assert review.verdict == JudgeVerdict.REVISE
    assert len(review.issues) == 1
    assert review.issues[0].severity == IssueSeverity.HIGH


def test_domain_schemas_contract():
    profile = LearnerProfile(
        learner_id="usr_123",
        auth_subject="auth0|98765",
        display_name="Aarav Sharma",
        timezone="Asia/Kolkata",
    )
    assert profile.display_name == "Aarav Sharma"

    evidence = SkillEvidence(
        evidence_id="ev_001",
        learner_id="usr_123",
        skill_id="python.recursion",
        source_type="assessment",
        source_id="att_999",
        score=92.5,
        verification_state=VerificationState.VERIFIED,
        observed_at=datetime.now(timezone.utc),
        dedupe_key="att_999:python.recursion",
    )
    assert evidence.score == 92.5
    assert evidence.verification_state == VerificationState.VERIFIED
