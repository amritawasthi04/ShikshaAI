"""Assessment and Attempt evaluation endpoints."""
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from app.api.deps import get_assessment_service, get_current_learner_id
from app.core.schemas.api import AttemptEvaluationResponse, CreateAssessmentRequest, SubmitAttemptRequest
from app.db.models.core import AssessmentModel, AttemptModel
from app.services.assessment_service import AssessmentService

router = APIRouter(tags=["Assessments & Attempts"])


@router.get("/assessments/{assessment_id}", response_model=AssessmentModel)
async def get_assessment_questions(
    assessment_id: str,
    service: AssessmentService = Depends(get_assessment_service),
):
    """Retrieve public questions for an assessment. Strictly isolates private rubrics and answer keys."""
    asm = await service.get_public_assessment(assessment_id)
    if not asm:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Assessment not found")
    return asm


@router.post("/assessments", response_model=AssessmentModel, status_code=status.HTTP_201_CREATED)
async def create_assessment(
    req: CreateAssessmentRequest,
    service: AssessmentService = Depends(get_assessment_service),
):
    """Register an assessment and securely isolate its private scoring rubric."""
    return await service.create_assessment(req)


@router.post("/assessments/{assessment_id}/attempts", response_model=AttemptEvaluationResponse)
async def submit_assessment_attempt(
    assessment_id: str,
    req: SubmitAttemptRequest,
    learner_id: str = Depends(get_current_learner_id),
    service: AssessmentService = Depends(get_assessment_service),
):
    """Submit learner answers for grading against isolated rubric, recording verified mastery evidence."""
    try:
        return await service.submit_attempt(
            learner_id=learner_id,
            assessment_id=assessment_id,
            answers=req.answers,
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.get("/assessments/{assessment_id}/attempts", response_model=List[AttemptModel])
async def list_assessment_attempts(
    assessment_id: str,
    learner_id: str = Depends(get_current_learner_id),
    service: AssessmentService = Depends(get_assessment_service),
):
    """List attempts for this assessment submitted by the current learner."""
    return await service.get_attempts(learner_id, assessment_id)
