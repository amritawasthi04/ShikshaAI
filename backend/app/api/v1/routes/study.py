"""Study plans, active reviews, and notification endpoints."""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from app.api.deps import get_current_learner_id, get_study_service
from app.core.schemas.api import CreateStudyPlanRequest
from app.db.models.core import NotificationModel, ReviewItemModel, StudyPlanModel
from app.services.study_service import StudyService

router = APIRouter(tags=["Study Plans & Reviews"])


@router.get("/study-plans", response_model=Optional[StudyPlanModel])
async def get_active_study_plan(
    learner_id: str = Depends(get_current_learner_id),
    service: StudyService = Depends(get_study_service),
):
    """Fetch active study schedule and task allocations."""
    return await service.get_active_plan(learner_id)


@router.post("/study-plans", response_model=StudyPlanModel, status_code=status.HTTP_201_CREATED)
async def create_or_update_study_plan(
    req: CreateStudyPlanRequest,
    learner_id: str = Depends(get_current_learner_id),
    service: StudyService = Depends(get_study_service),
):
    """Save updated study plan."""
    return await service.save_plan(learner_id, req)


@router.get("/reviews/due", response_model=List[ReviewItemModel])
async def get_due_spaced_reviews(
    learner_id: str = Depends(get_current_learner_id),
    service: StudyService = Depends(get_study_service),
):
    """Fetch spaced repetition review items due for practice."""
    return await service.get_due_reviews(learner_id)


@router.post("/reviews/{item_id}/complete")
async def complete_review_item(
    item_id: str,
    learner_id: str = Depends(get_current_learner_id),
    service: StudyService = Depends(get_study_service),
):
    """Mark a review item as completed."""
    ok = await service.complete_review(learner_id, item_id)
    if not ok:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Review item not found")
    return {"status": "completed", "item_id": item_id}


@router.get("/notifications", response_model=List[NotificationModel])
async def list_notifications(
    learner_id: str = Depends(get_current_learner_id),
    service: StudyService = Depends(get_study_service),
):
    """List notifications for current learner."""
    return await service.get_notifications(learner_id)


@router.patch("/notifications/{notification_id}/read")
async def mark_notification_as_read(
    notification_id: str,
    learner_id: str = Depends(get_current_learner_id),
    service: StudyService = Depends(get_study_service),
):
    """Mark notification read."""
    ok = await service.mark_notification_read(learner_id, notification_id)
    if not ok:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Notification not found")
    return {"status": "read", "notification_id": notification_id}
