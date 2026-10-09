"""Proposals and decision endpoints enforcing atomic version concurrency."""
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from app.api.deps import get_current_learner_id, get_proposal_service
from app.core.schemas.api import CreateProposalRequest, ProposalDecisionRequest
from app.db.models.core import ProposalModel
from app.services.proposal_service import ProposalService

router = APIRouter(prefix="/proposals", tags=["Proposals & Adaptation"])


@router.get("", response_model=List[ProposalModel])
async def list_pending_proposals(
    learner_id: str = Depends(get_current_learner_id),
    service: ProposalService = Depends(get_proposal_service),
):
    """List pending adaptation proposals awaiting learner approval."""
    return await service.list_proposals(learner_id)


@router.post("", response_model=ProposalModel, status_code=status.HTTP_201_CREATED)
async def create_adaptation_proposal(
    req: CreateProposalRequest,
    learner_id: str = Depends(get_current_learner_id),
    service: ProposalService = Depends(get_proposal_service),
):
    """Propose a major roadmap or schedule adaptation."""
    return await service.create_proposal(learner_id, req)


from app.core.errors.exceptions import ConflictError, PathAIException


@router.post("/{proposal_id}/decision")
async def decide_proposal(
    proposal_id: str,
    req: ProposalDecisionRequest,
    learner_id: str = Depends(get_current_learner_id),
    service: ProposalService = Depends(get_proposal_service),
):
    """Accept or reject an adaptation proposal with atomic concurrency protection against stale base versions."""
    res = await service.decide_proposal(
        learner_id=learner_id,
        proposal_id=proposal_id,
        decision=req.decision,
        expected_base_version=req.expected_base_version,
    )
    if not res.get("success"):
        if res.get("status") == "conflict":
            raise ConflictError(res.get("error", "Optimistic concurrency conflict"))
        raise PathAIException(message="Could not process proposal decision", status_code=400, error_code="BAD_REQUEST")
    return res
