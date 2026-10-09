"""Authentication and learner identity models."""
from typing import List, Optional
from pydantic import Field
from app.core.schemas.base import BaseSchema


class LearnerIdentity(BaseSchema):
    """Authoritative learner identity extracted from verified credentials."""
    learner_id: str = Field(..., description="Internal authoritative learner identifier")
    auth_subject: str = Field(..., description="External authentication provider subject (sub)")
    email: Optional[str] = Field(default=None, description="Learner email address if present in claims")
    roles: List[str] = Field(default_factory=lambda: ["learner"], description="Role assignments")

    @property
    def is_admin(self) -> bool:
        return "admin" in self.roles
