"""Request and response schemas for API v1 endpoints."""
from datetime import datetime
from typing import Any, Dict, List, Optional
from pydantic import Field
from app.core.schemas.base import BaseSchema
from app.core.schemas.chat import Citation, MessageRole
from app.core.schemas.plan import TaskPlan


# --- Learner DTOs ---
class LearnerProfileUpdate(BaseSchema):
    display_name: Optional[str] = None
    timezone: Optional[str] = None
    preferred_language: Optional[str] = None


class PreferenceUpdate(BaseSchema):
    learning_style: Optional[str] = None
    weekly_availability_hours: Optional[float] = None
    notification_email: Optional[bool] = None
    voice_enabled: Optional[bool] = None
    theme: Optional[str] = None


class CreateGoalRequest(BaseSchema):
    title: str = Field(..., min_length=3)
    target_domain: str = Field(..., min_length=2)
    target_mastery_level: str = "intermediate"
    target_completion_date: Optional[datetime] = None


# --- Chat & Teacher Brain DTOs ---
class CreateConversationRequest(BaseSchema):
    title: Optional[str] = "Learning Session with Elara"
    goal_id: Optional[str] = None


class SendMessageRequest(BaseSchema):
    content: str = Field(..., min_length=1)
    role: MessageRole = MessageRole.USER
    idempotency_key: Optional[str] = None


class TeacherChatResponse(BaseSchema):
    message_id: str
    conversation_id: str
    sequence_number: int
    role: MessageRole = MessageRole.ASSISTANT
    content: str
    citations: List[Citation] = Field(default_factory=list)
    task_plan: Optional[TaskPlan] = None
    run_id: Optional[str] = None


# --- Roadmaps & Lessons DTOs ---
class CreateRoadmapRequest(BaseSchema):
    goal_id: str
    milestones: List[Dict[str, Any]] = Field(default_factory=list)
    rationale: str = ""


class UpdateProgressRequest(BaseSchema):
    status: str = Field(..., description="not_started, in_progress, completed, mastered")


class RecordStudySessionRequest(BaseSchema):
    lesson_id: Optional[str] = None
    active_seconds: int = Field(..., ge=0)
    measurement_source: str = "browser_heartbeat"


# --- Assessments & Submissions DTOs ---
class CreateAssessmentRequest(BaseSchema):
    assessment_id: str
    title: str
    skill_ids: List[str] = Field(default_factory=list)
    questions: List[Dict[str, Any]] = Field(..., min_length=1)
    scoring_criteria: Dict[str, Any] = Field(default_factory=dict)
    answer_keys: Dict[str, Any] = Field(default_factory=dict)
    min_pass_score: float = 70.0


class SubmitAttemptRequest(BaseSchema):
    answers: Dict[str, Any] = Field(..., description="Learner question responses")


class AttemptEvaluationResponse(BaseSchema):
    attempt_id: str
    assessment_id: str
    learner_id: str
    score: float
    feedback: str
    grading_state: str
    evidence_ids: List[str] = Field(default_factory=list)


# --- Projects & Submissions DTOs ---
class CreateProjectRequest(BaseSchema):
    project_id: str
    title: str
    brief: str
    requirements: List[str] = Field(default_factory=list)
    skill_ids: List[str] = Field(default_factory=list)


class SubmitProjectRequest(BaseSchema):
    repository_url: Optional[str] = None
    artifact_keys: List[str] = Field(default_factory=list)


# --- Documents & Knowledge DTOs ---
class RegisterDocumentRequest(BaseSchema):
    filename: str
    mime_type: str = "text/plain"
    content_text: str = Field(..., min_length=1)
    is_public: bool = False
    skill_tags: List[str] = Field(default_factory=list)


class SearchPassagesRequest(BaseSchema):
    query: str = Field(..., min_length=2)
    limit: int = Field(default=10, ge=1, le=50)
    include_public: bool = True
    skill_tags: Optional[List[str]] = None


# --- Study Plans, Reviews, Proposals ---
class CreateStudyPlanRequest(BaseSchema):
    availability_hours: float = 5.0
    tasks: List[Dict[str, Any]] = Field(default_factory=list)


class CreateProposalRequest(BaseSchema):
    kind: str  # roadmap_change, schedule_shift
    base_version: int
    proposed_version: int
    rationale: str
    diff_payload: Dict[str, Any] = Field(default_factory=dict)


class ProposalDecisionRequest(BaseSchema):
    decision: str = Field(..., description="'accept' or 'reject'")
    expected_base_version: int = Field(..., description="Expected active base version to guard against stale updates")
