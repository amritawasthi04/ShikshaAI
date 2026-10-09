"""Domain models corresponding to authoritative records in pathai_core."""
from enum import Enum
from typing import Any, Dict, List, Optional
from datetime import datetime
from pydantic import Field
from app.core.schemas.base import BaseSchema, AuditableSchema


class VerificationState(str, Enum):
    VERIFIED = "verified"
    TENTATIVE = "tentative"
    SELF_REPORTED = "self_reported"
    UNVERIFIED = "unverified"


class ProposalStatus(str, Enum):
    PROPOSED = "proposed"
    ACCEPTED = "accepted"
    REJECTED = "rejected"
    SUPERSEDED = "superseded"


class LearnerProfile(AuditableSchema):
    learner_id: str
    auth_subject: str
    display_name: str
    timezone: str = "UTC"
    preferred_language: str = "en"
    learning_style: Optional[str] = None
    weekly_availability_hours: float = 5.0


class SkillEvidence(AuditableSchema):
    evidence_id: str
    learner_id: str
    skill_id: str
    source_type: str  # assessment, project, session
    source_id: str
    score: float = Field(..., ge=0.0, le=100.0)
    misconceptions: List[str] = Field(default_factory=list)
    verification_state: VerificationState = VerificationState.VERIFIED
    observed_at: datetime
    dedupe_key: str


class RoadmapMilestone(BaseSchema):
    milestone_id: str
    title: str
    description: str
    skill_ids: List[str] = Field(default_factory=list)
    prerequisite_milestone_ids: List[str] = Field(default_factory=list)
    is_completed: bool = False
    node_id: Optional[str] = None
    parent_id: Optional[str] = None
    prerequisites: List[str] = Field(default_factory=list)
    category: Optional[str] = None
    status: str = "not_started"
    external_ref: Optional[str] = None
    resources: List[Dict[str, str]] = Field(default_factory=list)
    estimated_hours: float = 2.0


class Roadmap(AuditableSchema):
    roadmap_id: str
    learner_id: str
    goal_id: str
    version: int = 1
    is_active: bool = True
    canonical_topic: Optional[str] = None
    canonical_ref: Optional[str] = None
    milestones: List[RoadmapMilestone] = Field(default_factory=list)



class Proposal(AuditableSchema):
    proposal_id: str
    learner_id: str
    kind: str  # roadmap_change, schedule_shift
    base_version: int
    proposed_version: int
    rationale: str
    diff_payload: Dict[str, Any]
    status: ProposalStatus = ProposalStatus.PROPOSED
    decided_at: Optional[datetime] = None
