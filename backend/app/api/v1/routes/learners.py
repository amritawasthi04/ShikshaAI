"""Learner identity, preferences, and goals endpoints."""
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from app.api.deps import get_current_learner_id, get_learner_service
from app.core.schemas.api import CreateGoalRequest, LearnerProfileUpdate, PreferenceUpdate
from app.db.models.core import GoalModel, LearnerModel, PreferenceModel
from app.services.learner_service import LearnerService

router = APIRouter(tags=["Learners"])


@router.get("/me", response_model=LearnerModel)
async def get_my_profile(
    learner_id: str = Depends(get_current_learner_id),
    service: LearnerService = Depends(get_learner_service),
):
    """Retrieve current learner profile."""
    return await service.get_profile(learner_id)


@router.put("/me", response_model=LearnerModel)
async def update_my_profile(
    update: LearnerProfileUpdate,
    learner_id: str = Depends(get_current_learner_id),
    service: LearnerService = Depends(get_learner_service),
):
    """Update profile attributes for current learner."""
    return await service.update_profile(learner_id, update)


@router.get("/preferences", response_model=PreferenceModel)
async def get_my_preferences(
    learner_id: str = Depends(get_current_learner_id),
    service: LearnerService = Depends(get_learner_service),
):
    """Retrieve learner preferences."""
    return await service.get_preferences(learner_id)


@router.put("/preferences", response_model=PreferenceModel)
async def update_my_preferences(
    update: PreferenceUpdate,
    learner_id: str = Depends(get_current_learner_id),
    service: LearnerService = Depends(get_learner_service),
):
    """Update learner preferences."""
    return await service.update_preferences(learner_id, update)


@router.get("/goals", response_model=List[GoalModel])
async def get_active_goals(
    learner_id: str = Depends(get_current_learner_id),
    service: LearnerService = Depends(get_learner_service),
):
    """List active learning goals for current learner."""
    return await service.get_goals(learner_id)


@router.post("/goals", response_model=GoalModel, status_code=status.HTTP_201_CREATED)
async def create_learning_goal(
    req: CreateGoalRequest,
    learner_id: str = Depends(get_current_learner_id),
    service: LearnerService = Depends(get_learner_service),
):
    """Establish a new goal."""
    return await service.create_goal(learner_id, req)
