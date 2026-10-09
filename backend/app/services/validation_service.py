"""Deterministic backend validation service for worker outputs and judge reviews."""
import logging
from typing import Any, Dict, List, Optional
from motor.motor_asyncio import AsyncIOMotorDatabase
from app.core.schemas.worker import (
    AdaptationProposalPayload,
    AssessmentDesignPayload,
    AssessmentEvaluationPayload,
    CodeCoachPayload,
    RoadmapProposalPayload,
    TeachingContentPayload,
)

logger = logging.getLogger("pathai.services.validation")

SCHEMA_VALIDATORS = {
    "RoadmapProposalPayload": RoadmapProposalPayload,
    "TeachingContentPayload": TeachingContentPayload,
    "AssessmentDesignPayload": AssessmentDesignPayload,
    "AssessmentEvaluationPayload": AssessmentEvaluationPayload,
    "CodeCoachPayload": CodeCoachPayload,
    "AdaptationProposalPayload": AdaptationProposalPayload,
}


class ValidationService:
    """Enforces deterministic backend rules before any candidate result is permitted to persist."""

    def __init__(self, core_db: AsyncIOMotorDatabase) -> None:
        self.core_db = core_db

    def validate_schema(self, schema_name: str, payload: Dict[str, Any]) -> bool:
        """Validate payload adheres strictly to required domain Pydantic schema."""
        model_cls = SCHEMA_VALIDATORS.get(schema_name)
        if not model_cls:
            logger.warning("No schema validator registered for %s; bypassing strict schema check", schema_name)
            return True

        try:
            model_cls.model_validate(payload)
            return True
        except Exception as e:
            logger.error("Deterministic schema validation failed for %s: %s", schema_name, e)
            return False

    def validate_score_bounds(self, score: Optional[float]) -> bool:
        """Validate numeric score is bounded within 0.0 to 100.0."""
        if score is None:
            return True
        return 0.0 <= score <= 100.0

    async def validate_evidence_references(self, evidence_refs: List[str]) -> bool:
        """Verify cited passages or records actually exist in the database."""
        if not evidence_refs:
            return True

        for ref_id in evidence_refs:
            passage = await self.core_db["document_passages"].find_one({"passage_id": ref_id})
            if not passage:
                # Check document
                doc = await self.core_db["documents"].find_one({"document_id": ref_id})
                if not doc:
                    logger.warning("Cited evidence reference '%s' could not be resolved in database", ref_id)
                    return False
        return True

    def can_attempt_revision(self, correction_cycle: int) -> bool:
        """Enforces bounded correction loop constraint (strictly max 1 cycle)."""
        return correction_cycle < 1
