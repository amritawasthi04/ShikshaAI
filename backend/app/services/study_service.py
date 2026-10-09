"""Study Plan, Spaced Repetition, and Notification service."""
from datetime import datetime, timezone
import logging
import uuid
from typing import Any, Dict, List, Optional
from motor.motor_asyncio import AsyncIOMotorDatabase
from app.core.schemas.api import CreateStudyPlanRequest
from app.db.models.base import utc_now
from app.db.models.core import NotificationModel, ReviewItemModel, StudyPlanModel
from app.db.repositories.base import BaseMongoRepository
from app.db.repositories.core import StudyPlanRepository

logger = logging.getLogger("pathai.services.study")


class StudyService:
    def __init__(self, core_db: AsyncIOMotorDatabase) -> None:
        self.study_repo = StudyPlanRepository(core_db)
        self.notif_repo = BaseMongoRepository(core_db, "notifications", NotificationModel)

    async def get_active_plan(self, learner_id: str) -> Optional[StudyPlanModel]:
        return await self.study_repo.get_active_plan(learner_id)

    async def save_plan(self, learner_id: str, req: CreateStudyPlanRequest) -> StudyPlanModel:
        existing = await self.get_active_plan(learner_id)
        plan_id = existing.plan_id if existing else f"plan_{uuid.uuid4().hex[:8]}"

        plan = StudyPlanModel(
            plan_id=plan_id,
            learner_id=learner_id,
            availability_hours=req.availability_hours,
            tasks=req.tasks,
            status="active",
        )
        await self.study_repo.plans.update_one(
            {"learner_id": learner_id, "status": "active"},
            plan.model_dump(),
            upsert=True,
        )
        return plan

    async def get_due_reviews(self, learner_id: str) -> List[ReviewItemModel]:
        now = datetime.now(timezone.utc)
        return await self.study_repo.get_due_reviews(learner_id, due_before=now)

    async def complete_review(self, learner_id: str, item_id: str) -> bool:
        return await self.study_repo.mark_review_completed(item_id, learner_id)

    async def get_notifications(self, learner_id: str) -> List[NotificationModel]:
        return await self.notif_repo.find_many(
            {"learner_id": learner_id},
            sort=[("created_at", -1)],
            limit=50,
        )

    async def mark_notification_read(self, learner_id: str, notification_id: str) -> bool:
        return await self.notif_repo.update_one(
            {"notification_id": notification_id, "learner_id": learner_id},
            {"is_read": True},
        )
