"""Proposal service enforcing atomic concurrency checks for roadmap and schedule adaptations."""
import logging
import uuid
from typing import Any, Dict, List, Optional
from motor.motor_asyncio import AsyncIOMotorDatabase
from app.core.schemas.api import CreateProposalRequest
from app.db.models.base import utc_now
from app.db.models.core import ProposalModel
from app.db.repositories.core import ProposalRepository, RoadmapRepository

logger = logging.getLogger("pathai.services.proposal")


class ProposalService:
    def __init__(self, core_db: AsyncIOMotorDatabase) -> None:
        self.prop_repo = ProposalRepository(core_db)
        self.roadmap_repo = RoadmapRepository(core_db)

    async def list_proposals(self, learner_id: str) -> List[ProposalModel]:
        return await self.prop_repo.get_pending_proposals(learner_id)

    async def create_proposal(self, learner_id: str, req: CreateProposalRequest) -> ProposalModel:
        proposal = ProposalModel(
            proposal_id=f"prop_{uuid.uuid4().hex[:8]}",
            learner_id=learner_id,
            kind=req.kind,
            base_version=req.base_version,
            proposed_version=req.proposed_version,
            rationale=req.rationale,
            diff_payload=req.diff_payload,
            status="proposed",
        )
        return await self.prop_repo.create_proposal(proposal)

    async def decide_proposal(
        self,
        learner_id: str,
        proposal_id: str,
        decision: str,
        expected_base_version: int,
    ) -> Dict[str, Any]:
        """Decide proposal atomically ensuring base_version has not drifted."""
        if decision.lower() == "accept":
            accepted = await self.prop_repo.accept_proposal_atomic(
                learner_id=learner_id,
                proposal_id=proposal_id,
                expected_base_version=expected_base_version,
            )
            if not accepted:
                return {
                    "success": False,
                    "error": "Conflict: Proposal is stale or already decided.",
                    "status": "conflict",
                }

            # If it's a roadmap change, update active roadmap version
            proposal = await self.prop_repo.proposals.find_one({"proposal_id": proposal_id})
            if proposal and proposal.kind == "roadmap_change":
                active_roadmap = await self.roadmap_repo.get_active_roadmap(learner_id)
                if active_roadmap:
                    await self.roadmap_repo.activate_version(
                        learner_id=learner_id,
                        roadmap_id=active_roadmap.roadmap_id,
                        version_num=proposal.proposed_version,
                    )

            return {
                "success": True,
                "proposal_id": proposal_id,
                "status": "accepted",
                "message": "Proposal accepted and changes applied.",
            }

        elif decision.lower() == "reject":
            res = await self.prop_repo.proposals.update_one(
                {"proposal_id": proposal_id, "learner_id": learner_id, "status": "proposed"},
                {"status": "rejected", "decided_at": utc_now()},
            )
            return {
                "success": res,
                "proposal_id": proposal_id,
                "status": "rejected",
                "message": "Proposal rejected.",
            }
        else:
            raise ValueError(f"Invalid decision: {decision}. Must be 'accept' or 'reject'.")
