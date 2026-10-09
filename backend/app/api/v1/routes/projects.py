"""Project submissions and verified learner progress endpoints."""
from typing import Any, Dict, List
from fastapi import APIRouter, Depends, HTTPException, status
from app.api.deps import get_current_learner_id, get_project_service
from app.core.schemas.api import CreateProjectRequest, SubmitProjectRequest
from app.db.models.core import ProjectModel, SubmissionModel
from app.services.project_service import ProjectService

router = APIRouter(tags=["Projects & Progress"])


@router.get("/projects/{project_id}", response_model=ProjectModel)
async def get_project(
    project_id: str,
    service: ProjectService = Depends(get_project_service),
):
    """Retrieve project specifications and requirements."""
    project = await service.get_project(project_id)
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
    return project


@router.post("/projects", response_model=ProjectModel, status_code=status.HTTP_201_CREATED)
async def create_project(
    req: CreateProjectRequest,
    service: ProjectService = Depends(get_project_service),
):
    """Create a new project brief."""
    return await service.create_project(req)


@router.post("/projects/{project_id}/submissions", response_model=SubmissionModel, status_code=status.HTTP_201_CREATED)
async def submit_project(
    project_id: str,
    req: SubmitProjectRequest,
    learner_id: str = Depends(get_current_learner_id),
    service: ProjectService = Depends(get_project_service),
):
    """Submit milestone code/repository for review."""
    try:
        return await service.submit_project(learner_id, project_id, req)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.get("/progress")
async def get_learner_mastery_progress(
    learner_id: str = Depends(get_current_learner_id),
    service: ProjectService = Depends(get_project_service),
):
    """Fetch verified evidence-based mastery progress across all assessed skills."""
    return await service.get_learner_progress(learner_id)
