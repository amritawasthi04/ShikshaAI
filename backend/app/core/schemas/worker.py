"""Worker instruction, execution result, and domain-specific worker payload contracts."""
from enum import Enum
from typing import Any, Dict, List, Optional
from pydantic import Field
from app.core.schemas.base import BaseSchema, AuditableSchema
from app.core.schemas.plan import WorkerRole


class WorkerResultStatus(str, Enum):
    SUCCESS = "success"
    FAILURE = "failure"
    BLOCKED = "blocked"
    INSUFFICIENT_CONTEXT = "insufficient_context"


class WorkerInstruction(BaseSchema):
    """Execution context dispatched to an authorized worker."""
    task_id: str
    worker_role: WorkerRole
    objective: str
    master_instructions: str
    context_snapshot: Dict[str, Any] = Field(default_factory=dict)
    evidence_refs: List[str] = Field(default_factory=list)
    allowed_tools: List[str] = Field(default_factory=list)
    output_schema: str


class WorkerResult(AuditableSchema):
    """Standardized response returned by any specialist worker."""
    task_id: str
    worker_role: WorkerRole
    status: WorkerResultStatus
    task_data: Dict[str, Any] = Field(..., description="Structured payload adhering to output_schema")
    evidence_references: List[str] = Field(default_factory=list, description="IDs of documents or records cited")
    limitations: List[str] = Field(default_factory=list, description="Known caveats, missing info, or assumptions")
    proposed_actions: List[str] = Field(default_factory=list, description="Follow-up recommendations")


# Domain-specific payload models for validation
class RoadmapProposalPayload(BaseSchema):
    goal_id: str
    version: int
    phases: List[Dict[str, Any]]
    prerequisites: List[str] = Field(default_factory=list)
    rationale: str


class TeachingContentPayload(BaseSchema):
    topic: str
    explanation: str
    examples: List[str] = Field(default_factory=list)
    practice_prompts: List[str] = Field(default_factory=list)
    check_for_understanding: str


class AssessmentQuestion(BaseSchema):
    question_id: str
    prompt: str
    question_type: str  # multiple_choice, open_answer, code
    options: Optional[List[str]] = None


class AssessmentDesignPayload(BaseSchema):
    assessment_id: str
    skill_ids: List[str]
    public_questions: List[AssessmentQuestion]
    private_rubric_id: str  # Held strictly on server, never sent to learner


class AssessmentEvaluationPayload(BaseSchema):
    attempt_id: str
    skill_evaluations: List[Dict[str, Any]]
    score: float = Field(..., ge=0.0, le=100.0)
    feedback: str
    mastery_demonstrated: bool


class CodeCoachPayload(BaseSchema):
    code_critique: str
    execution_verified: bool = Field(default=False)
    sandbox_run_id: Optional[str] = None
    improvements: List[str] = Field(default_factory=list)


class AdaptationProposalPayload(BaseSchema):
    learner_id: str
    remediation_needed: bool
    affected_skills: List[str]
    proposed_adjustments: List[str]
    evidence_summary: str
