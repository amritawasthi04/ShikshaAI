"""Learner service managing profile, preferences, and goals."""
import logging
import uuid
from typing import List, Optional
from motor.motor_asyncio import AsyncIOMotorDatabase
from app.core.schemas.api import CreateGoalRequest, LearnerProfileUpdate, PreferenceUpdate
from app.db.models.core import GoalModel, LearnerModel, PreferenceModel
from app.db.repositories.core import LearnerRepository

logger = logging.getLogger("pathai.services.learner")


class LearnerService:
    def __init__(self, core_db: AsyncIOMotorDatabase) -> None:
        self.repo = LearnerRepository(core_db)

    async def get_or_create_learner(self, learner_id: str, auth_subject: Optional[str] = None) -> LearnerModel:
        learner = await self.repo.get_by_id(learner_id)
        if learner:
            return learner

        new_learner = LearnerModel(
            learner_id=learner_id,
            auth_subject=auth_subject or f"auth0|{learner_id}",
            display_name=f"Learner {learner_id[:8]}",
            timezone="UTC",
            preferred_language="en",
        )
        return await self.repo.create_or_get(new_learner)

    async def get_profile(self, learner_id: str) -> LearnerModel:
        return await self.get_or_create_learner(learner_id)

    async def update_profile(self, learner_id: str, update: LearnerProfileUpdate) -> LearnerModel:
        learner = await self.get_or_create_learner(learner_id)
        update_data = update.model_dump(exclude_unset=True)
        if update_data:
            for k, v in update_data.items():
                setattr(learner, k, v)
            await self.repo.learners.update_one(
                {"learner_id": learner_id},
                {"$set": update_data},
            )
        return learner

    async def get_preferences(self, learner_id: str) -> PreferenceModel:
        prefs = await self.repo.get_preferences(learner_id)
        if prefs:
            return prefs
        # Initialize default preferences
        default_prefs = PreferenceModel(
            preference_id=f"pref_{uuid.uuid4().hex[:8]}",
            learner_id=learner_id,
        )
        return await self.repo.save_preferences(default_prefs)

    async def update_preferences(self, learner_id: str, update: PreferenceUpdate) -> PreferenceModel:
        prefs = await self.get_preferences(learner_id)
        update_data = update.model_dump(exclude_unset=True)
        for k, v in update_data.items():
            setattr(prefs, k, v)
        return await self.repo.save_preferences(prefs)

    async def get_goals(self, learner_id: str) -> List[GoalModel]:
        return await self.repo.get_active_goals(learner_id)

    async def create_goal(self, learner_id: str, req: CreateGoalRequest) -> GoalModel:
        goal = GoalModel(
            goal_id=f"goal_{uuid.uuid4().hex[:8]}",
            learner_id=learner_id,
            title=req.title,
            target_domain=req.target_domain,
            target_mastery_level=req.target_mastery_level,
            target_completion_date=req.target_completion_date,
            is_active=True,
        )
        return await self.repo.add_goal(goal)
