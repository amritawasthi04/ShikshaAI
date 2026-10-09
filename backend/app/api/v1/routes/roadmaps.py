"""Roadmap and Lesson progress endpoints."""
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from app.api.deps import get_current_learner_id, get_roadmap_service
from app.core.schemas.api import CreateRoadmapRequest, RecordStudySessionRequest, UpdateProgressRequest
from app.db.models.core import (
    LessonProgressModel,
    LessonVersionModel,
    RoadmapModel,
    RoadmapVersionModel,
    StudySessionModel,
)
from app.services.roadmap_service import RoadmapService

router = APIRouter(tags=["Roadmaps & Lessons"])


@router.get("/roadmaps", response_model=Optional[RoadmapModel])
async def get_active_roadmap(
    learner_id: str = Depends(get_current_learner_id),
    service: RoadmapService = Depends(get_roadmap_service),
):
    """Fetch active roadmap for current learner."""
    return await service.get_active_roadmap(learner_id)


@router.post("/roadmaps", response_model=RoadmapModel, status_code=status.HTTP_201_CREATED)
async def create_roadmap(
    req: CreateRoadmapRequest,
    learner_id: str = Depends(get_current_learner_id),
    service: RoadmapService = Depends(get_roadmap_service),
):
    """Create a new roadmap."""
    return await service.create_roadmap(learner_id, req)


@router.get("/roadmaps/{roadmap_id}/versions/{version}", response_model=RoadmapVersionModel)
async def get_roadmap_version(
    roadmap_id: str,
    version: int,
    service: RoadmapService = Depends(get_roadmap_service),
):
    """Get a specific roadmap version with milestone DAG."""
    ver = await service.get_version(roadmap_id, version)
    if not ver:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Roadmap version not found")
    return ver


@router.post("/roadmaps/{roadmap_id}/versions/{version}/activate")
async def activate_roadmap_version(
    roadmap_id: str,
    version: int,
    learner_id: str = Depends(get_current_learner_id),
    service: RoadmapService = Depends(get_roadmap_service),
):
    """Activate a specific version on learner's roadmap."""
    ok = await service.activate_version(learner_id, roadmap_id, version)
    if not ok:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Roadmap not found or activation failed")
    return {"status": "activated", "roadmap_id": roadmap_id, "active_version": version}


@router.get("/lessons/{lesson_id}", response_model=LessonVersionModel)
async def get_lesson(
    lesson_id: str,
    version: int = Query(1, ge=1),
    service: RoadmapService = Depends(get_roadmap_service),
):
    """Get lesson content blocks and exercises."""
    lesson = await service.get_lesson(lesson_id, version)
    if not lesson:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lesson not found")
    return lesson


@router.get("/lessons/{lesson_id}/progress", response_model=Optional[LessonProgressModel])
async def get_lesson_progress(
    lesson_id: str,
    learner_id: str = Depends(get_current_learner_id),
    service: RoadmapService = Depends(get_roadmap_service),
):
    """Get current learner's completion status for a lesson."""
    return await service.get_lesson_progress(learner_id, lesson_id)


@router.post("/lessons/{lesson_id}/progress")
async def update_lesson_progress(
    lesson_id: str,
    req: UpdateProgressRequest,
    learner_id: str = Depends(get_current_learner_id),
    service: RoadmapService = Depends(get_roadmap_service),
):
    """Update participation / completion status for a lesson."""
    await service.update_lesson_progress(learner_id, lesson_id, req.status)
    return {"status": "updated", "lesson_id": lesson_id, "progress_status": req.status}


@router.post("/lessons/{lesson_id}/sessions", response_model=StudySessionModel, status_code=status.HTTP_201_CREATED)
async def record_study_session(
    lesson_id: str,
    req: RecordStudySessionRequest,
    learner_id: str = Depends(get_current_learner_id),
    service: RoadmapService = Depends(get_roadmap_service),
):
    """Log an active study session or heartbeat."""
    return await service.record_study_session(
        learner_id=learner_id,
        lesson_id=lesson_id,
        active_seconds=req.active_seconds,
        measurement_source=req.measurement_source,
    )
