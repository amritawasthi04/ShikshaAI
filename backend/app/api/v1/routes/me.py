"""Foundation identity, preferences, and goals routes conforming to Section 12."""
from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Depends, status
from pydantic import Field

from app.core.schemas.base import BaseSchema, AuditableSchema, utc_now
from app.core.auth.deps import get_current_learner
from app.core.auth.models import LearnerIdentity

router = APIRouter(tags=["Learner Profile & Goals"])


class PreferencesSchema(BaseSchema):
    timezone: str = Field(default="UTC")
    preferred_language: str = Field(default="en")
    learning_style: Optional[str] = Field(default=None)
    weekly_availability_hours: float = Field(default=5.0, ge=1.0, le=40.0)


class GoalCreateSchema(BaseSchema):
    title: str = Field(..., min_length=3, max_length=150)
    description: str = Field(..., min_length=10)
    target_date: Optional[str] = None
    priority: str = Field(default="primary")


class GoalResponseSchema(AuditableSchema):
    goal_id: str
    learner_id: str
    title: str
    description: str
    target_date: Optional[str] = None
    priority: str
    is_active: bool = True


# In-memory stores for Foundation layer before MongoDB persistence is bound
_PREFERENCES_STORE: Dict[str, PreferencesSchema] = {}
_GOALS_STORE: Dict[str, List[GoalResponseSchema]] = {}


@router.get("/me")
async def get_my_identity(learner: LearnerIdentity = Depends(get_current_learner)):
    """Returns the authenticated learner's identity and account metadata."""
    prefs = _PREFERENCES_STORE.get(learner.learner_id, PreferencesSchema())
    return {
        "learner_id": learner.learner_id,
        "auth_subject": learner.auth_subject,
        "email": learner.email,
        "roles": learner.roles,
        "preferences": prefs.model_dump(),
    }


@router.get("/preferences", response_model=PreferencesSchema)
async def get_preferences(learner: LearnerIdentity = Depends(get_current_learner)):
    """Retrieves authenticated learner preferences."""
    return _PREFERENCES_STORE.get(learner.learner_id, PreferencesSchema())


@router.put("/preferences", response_model=PreferencesSchema)
async def update_preferences(
    payload: PreferencesSchema,
    learner: LearnerIdentity = Depends(get_current_learner),
):
    """Updates preferences strictly for the authenticated learner."""
    _PREFERENCES_STORE[learner.learner_id] = payload
    return payload


@router.get("/goals", response_model=List[GoalResponseSchema])
async def list_goals(learner: LearnerIdentity = Depends(get_current_learner)):
    """Lists learning goals strictly owned by the authenticated learner."""
    return _GOALS_STORE.get(learner.learner_id, [])


@router.post("/goals", response_model=GoalResponseSchema, status_code=status.HTTP_201_CREATED)
async def create_goal(
    payload: GoalCreateSchema,
    learner: LearnerIdentity = Depends(get_current_learner),
):
    """Creates a new learning goal scoped to the authenticated learner."""
    import uuid

    goal_id = f"goal_{uuid.uuid4().hex[:12]}"
    new_goal = GoalResponseSchema(
        goal_id=goal_id,
        learner_id=learner.learner_id,
        title=payload.title,
        description=payload.description,
        target_date=payload.target_date,
        priority=payload.priority,
        is_active=True,
    )
    if learner.learner_id not in _GOALS_STORE:
        _GOALS_STORE[learner.learner_id] = []
    _GOALS_STORE[learner.learner_id].append(new_goal)
    return new_goal
