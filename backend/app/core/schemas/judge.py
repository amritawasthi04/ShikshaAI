"""Judge LLM review contracts and verdict evaluation schemas."""
from enum import Enum
from typing import List, Optional
from pydantic import Field
from app.core.schemas.base import BaseSchema, AuditableSchema


class JudgeVerdict(str, Enum):
    ACCEPT = "accept"
    REVISE = "revise"
    INSUFFICIENT_EVIDENCE = "insufficient_evidence"


class IssueSeverity(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    BLOCKER = "blocker"


class JudgeIssue(BaseSchema):
    """Specific flaw detected by the Judge LLM."""
    category: str = Field(..., description="E.g. hallucination, pedagogical_flaw, difficulty_mismatch, schema_violation")
    severity: IssueSeverity = Field(default=IssueSeverity.MEDIUM)
    description: str = Field(..., description="Concrete description of what is lacking or contradictory")
    correction: str = Field(..., description="Actionable instruction for the worker to fix the output")


class JudgeReview(AuditableSchema):
    """Structured evaluation returned by the Judge LLM reviewing a candidate worker result."""
    review_id: str = Field(..., description="Unique ID for this evaluation record")
    task_id: str = Field(..., description="ID of the task reviewed")
    verdict: JudgeVerdict = Field(..., description="Advisory verdict: accept, revise, or insufficient_evidence")
    objective_covered: bool = Field(..., description="Whether the worker fully satisfied the assigned objective")
    grounded_in_evidence: bool = Field(..., description="Whether claims are substantiated by cited records")
    appropriate_difficulty: bool = Field(..., description="Whether difficulty matches demonstrated learner state")
    issues: List[JudgeIssue] = Field(default_factory=list, description="List of issues identified")
    required_corrections: List[str] = Field(default_factory=list, description="Step-by-step corrections needed if revising")
    correction_cycle: int = Field(default=0, ge=0, le=1, description="Bounded correction loop counter (max 1 cycle)")
