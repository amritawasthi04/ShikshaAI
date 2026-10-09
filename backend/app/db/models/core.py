"""Authoritative domain models for MongoDB pathai_core collections."""
from datetime import datetime
from typing import Any, Dict, List, Optional
from pydantic import Field
from app.db.models.base import MongoBaseModel, utc_now


# 1. Learners, Preferences, Goals
class LearnerModel(MongoBaseModel):
    learner_id: str
    auth_subject: str
    display_name: str
    email: Optional[str] = None
    timezone: str = "UTC"
    preferred_language: str = "en"
    is_active: bool = True


class PreferenceModel(MongoBaseModel):
    preference_id: str
    learner_id: str
    learning_style: Optional[str] = "active_practice"
    weekly_availability_hours: float = 5.0
    notification_email: bool = True
    voice_enabled: bool = False
    theme: str = "system"


class GoalModel(MongoBaseModel):
    goal_id: str
    learner_id: str
    title: str
    target_domain: str
    target_mastery_level: str = "intermediate"
    target_completion_date: Optional[datetime] = None
    is_active: bool = True


# 2. Skills, Learner Skills, Skill Evidence
class SkillModel(MongoBaseModel):
    skill_id: str
    title: str
    domain: str
    description: str
    prerequisite_skill_ids: List[str] = Field(default_factory=list)
    taxonomy_level: int = 1


class LearnerSkillModel(MongoBaseModel):
    learner_skill_id: str
    learner_id: str
    skill_id: str
    mastery_score: float = Field(0.0, ge=0.0, le=100.0)
    confidence_score: float = Field(0.0, ge=0.0, le=1.0)
    state_version: int = 1
    last_assessed_at: Optional[datetime] = None


class SkillEvidenceModel(MongoBaseModel):
    evidence_id: str
    learner_id: str
    skill_id: str
    source_type: str  # assessment, project, session, historical
    source_id: str
    score: float = Field(..., ge=0.0, le=100.0)
    misconceptions: List[str] = Field(default_factory=list)
    verification_state: str = "verified"  # verified, tentative, self_reported, unverified
    observed_at: datetime = Field(default_factory=utc_now)
    dedupe_key: str


# 3. Roadmaps & Roadmap Versions
class RoadmapMilestoneModel(MongoBaseModel):
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


class RoadmapModel(MongoBaseModel):
    roadmap_id: str
    learner_id: str
    goal_id: str
    active_version: int = 1
    status: str = "active"  # proposed, active, completed, archived
    is_active: bool = True
    canonical_topic: Optional[str] = None
    canonical_ref: Optional[str] = None


class RoadmapVersionModel(MongoBaseModel):
    roadmap_version_id: str
    roadmap_id: str
    learner_id: str
    version: int = 1
    milestones: List[Dict[str, Any]] = Field(default_factory=list)
    canonical_topic: Optional[str] = None
    canonical_ref: Optional[str] = None
    rationale: str = ""
    is_accepted: bool = False


# 4. Lessons, Progress & Study Sessions
class LessonVersionModel(MongoBaseModel):
    lesson_version_id: str
    lesson_id: str
    version: int = 1
    milestone_id: str
    title: str
    node_id: Optional[str] = None
    prerequisites_completed: List[str] = Field(default_factory=list)
    content_blocks: List[Dict[str, Any]] = Field(default_factory=list)
    exercises: List[Dict[str, Any]] = Field(default_factory=list)
    sources: List[str] = Field(default_factory=list)
    external_ref: Optional[str] = None
    resources: List[Dict[str, str]] = Field(default_factory=list)


class LessonProgressModel(MongoBaseModel):
    progress_id: str = Field(default_factory=lambda: f"prog_{uuid.uuid4().hex[:12]}")
    learner_id: str
    lesson_id: str
    active_version: int = 1
    status: str = "not_started"  # not_started, in_progress, completed, mastered
    completed_at: Optional[datetime] = None


class StudySessionModel(MongoBaseModel):
    session_id: str
    learner_id: str
    lesson_id: Optional[str] = None
    active_seconds: int = 0
    measurement_source: str = "browser_heartbeat"
    started_at: datetime = Field(default_factory=utc_now)
    ended_at: Optional[datetime] = None


# 5. Assessments, Private Rubrics & Attempts
class AssessmentModel(MongoBaseModel):
    assessment_id: str
    title: str
    skill_ids: List[str] = Field(default_factory=list)
    questions: List[Dict[str, Any]] = Field(default_factory=list)  # Public questions only
    is_published: bool = True


class AssessmentRubricModel(MongoBaseModel):
    """Restricted collection storing hidden answer keys and grading criteria."""
    rubric_id: str
    assessment_id: str
    scoring_criteria: Dict[str, Any] = Field(default_factory=dict)
    answer_keys: Dict[str, Any] = Field(default_factory=dict)
    min_pass_score: float = 70.0
    restricted_access: bool = True


class AttemptModel(MongoBaseModel):
    attempt_id: str
    learner_id: str
    assessment_id: str
    assessment_version: int = 1
    answers: Dict[str, Any] = Field(default_factory=dict)
    grading_state: str = "pending"  # pending, graded, flagged
    score: Optional[float] = None
    feedback: Optional[str] = None
    evidence_ids: List[str] = Field(default_factory=list)


# 6. Projects, Submissions & Sandboxes
class ProjectModel(MongoBaseModel):
    project_id: str
    title: str
    brief: str
    requirements: List[str] = Field(default_factory=list)
    skill_ids: List[str] = Field(default_factory=list)


class SubmissionModel(MongoBaseModel):
    submission_id: str
    learner_id: str
    project_id: str
    revision: int = 1
    repository_url: Optional[str] = None
    artifact_keys: List[str] = Field(default_factory=list)
    rubric_feedback: Optional[Dict[str, Any]] = None
    status: str = "submitted"  # submitted, under_review, approved, needs_revision


class SandboxExecutionModel(MongoBaseModel):
    execution_id: str
    submission_id: Optional[str] = None
    run_id: Optional[str] = None
    learner_id: str
    runtime: str = "python3.12"
    limits: Dict[str, Any] = Field(default_factory=dict)
    exit_code: Optional[int] = None
    stdout: Optional[str] = None
    stderr: Optional[str] = None
    status: str = "pending"  # pending, running, success, failed, timed_out


# 7. Documents & Passages
class DocumentModel(MongoBaseModel):
    document_id: str
    learner_id: str
    filename: str
    storage_key: str
    content_hash: str
    mime_type: str = "application/pdf"
    file_size_bytes: int = 0
    extraction_quality: Optional[float] = None
    status: str = "uploaded"  # uploaded, extracting, indexed, failed


class DocumentPassageModel(MongoBaseModel):
    passage_id: str
    document_id: str
    learner_id: str
    passage_index: int
    page_number: Optional[int] = None
    section_title: Optional[str] = None
    content_text: str
    is_public: bool = False
    skill_tags: List[str] = Field(default_factory=list)
    extraction_quality: float = 1.0


# 8. Study Plans & Review Items
class StudyPlanModel(MongoBaseModel):
    plan_id: str
    learner_id: str
    availability_hours: float = 5.0
    tasks: List[Dict[str, Any]] = Field(default_factory=list)
    status: str = "active"  # proposed, active, completed


class ReviewItemModel(MongoBaseModel):
    item_id: str
    learner_id: str
    skill_id: str
    source_type: str
    source_id: str
    due_at: datetime
    status: str = "pending"  # pending, completed, skipped
    interval_days: int = 3


# 9. Proposals
class ProposalModel(MongoBaseModel):
    proposal_id: str
    learner_id: str
    kind: str  # roadmap_change, schedule_shift
    base_version: int
    proposed_version: int
    rationale: str
    diff_payload: Dict[str, Any] = Field(default_factory=dict)
    status: str = "proposed"  # proposed, accepted, rejected, superseded
    decided_at: Optional[datetime] = None


# 10. Notifications
class NotificationModel(MongoBaseModel):
    notification_id: str
    learner_id: str
    type: str
    payload: Dict[str, Any] = Field(default_factory=dict)
    scheduled_for: Optional[datetime] = None
    is_read: bool = False
    dedupe_key: Optional[str] = None


# 11. Runs, Tasks & Judge Reviews
class RunModel(MongoBaseModel):
    run_id: str
    learner_id: str
    plan_id: Optional[str] = None
    status: str = "queued"  # queued, running, awaiting_approval, completed, failed, cancelled
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None


class TaskModel(MongoBaseModel):
    task_id: str
    run_id: str
    worker_role: str
    objective: str
    status: str = "pending"  # pending, running, completed, failed
    output: Optional[Dict[str, Any]] = None
    error: Optional[str] = None


class JudgeReviewModel(MongoBaseModel):
    review_id: str
    task_id: str
    run_id: str
    verdict: str  # accept, revise, insufficient_evidence
    issues: List[Dict[str, Any]] = Field(default_factory=list)
    required_corrections: List[str] = Field(default_factory=list)
    correction_cycle: int = 1


# 12. Transactional Outbox Events
class OutboxEventModel(MongoBaseModel):
    event_id: str
    aggregate_type: str
    aggregate_id: str
    event_type: str
    payload: Dict[str, Any] = Field(default_factory=dict)
    delivery_state: str = "pending"  # pending, dispatched, failed
    retry_count: int = 0
    dispatched_at: Optional[datetime] = None
