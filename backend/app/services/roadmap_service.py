"""Roadmap and Lesson service managing curriculum journeys and study progress."""
import logging
import uuid
from typing import Any, Dict, List, Optional
from motor.motor_asyncio import AsyncIOMotorDatabase
from app.core.schemas.api import CreateRoadmapRequest
from app.db.models.core import (
    LessonProgressModel,
    LessonVersionModel,
    RoadmapModel,
    RoadmapVersionModel,
    StudySessionModel,
)
from app.db.repositories.core import LessonRepository, RoadmapRepository

logger = logging.getLogger("pathai.services.roadmap")


class RoadmapService:
    def __init__(self, core_db: AsyncIOMotorDatabase) -> None:
        self.roadmap_repo = RoadmapRepository(core_db)
        self.lesson_repo = LessonRepository(core_db)

    async def get_active_roadmap(self, learner_id: str) -> Optional[RoadmapModel]:
        return await self.roadmap_repo.get_active_roadmap(learner_id)

    async def create_roadmap(self, learner_id: str, req: CreateRoadmapRequest) -> RoadmapModel:
        roadmap_id = f"rdm_{uuid.uuid4().hex[:8]}"
        roadmap = RoadmapModel(
            roadmap_id=roadmap_id,
            learner_id=learner_id,
            goal_id=req.goal_id,
            active_version=1,
            status="active",
            is_active=True,
        )
        await self.roadmap_repo.roadmaps.insert(roadmap)

        # Create initial roadmap version 1
        initial_version = RoadmapVersionModel(
            roadmap_version_id=f"rdmv_{uuid.uuid4().hex[:8]}",
            roadmap_id=roadmap_id,
            learner_id=learner_id,
            version=1,
            milestones=req.milestones,
            rationale=req.rationale or "Initial customized curriculum plan",
            is_accepted=True,
        )
        await self.roadmap_repo.save_version(initial_version)
        return roadmap

    async def get_version(self, roadmap_id: str, version: int) -> Optional[RoadmapVersionModel]:
        return await self.roadmap_repo.get_version(roadmap_id, version)

    async def activate_version(self, learner_id: str, roadmap_id: str, version: int) -> bool:
        return await self.roadmap_repo.activate_version(learner_id, roadmap_id, version)

    async def get_lesson(self, lesson_id: str, version: int = 1) -> Optional[LessonVersionModel]:
        return await self.lesson_repo.get_lesson_version(lesson_id, version)

    async def get_lesson_progress(self, learner_id: str, lesson_id: str) -> Optional[LessonProgressModel]:
        return await self.lesson_repo.get_progress(learner_id, lesson_id)

    async def update_lesson_progress(self, learner_id: str, lesson_id: str, status: str) -> None:
        await self.lesson_repo.update_progress(learner_id, lesson_id, status)

    async def record_study_session(
        self,
        learner_id: str,
        lesson_id: Optional[str],
        active_seconds: int,
        measurement_source: str = "browser_heartbeat",
    ) -> StudySessionModel:
        session = StudySessionModel(
            session_id=f"sess_{uuid.uuid4().hex[:8]}",
            learner_id=learner_id,
            lesson_id=lesson_id,
            active_seconds=active_seconds,
            measurement_source=measurement_source,
        )
        return await self.lesson_repo.record_session(session)
