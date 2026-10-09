"""FastAPI dependencies for identity resolution and ownership authorization."""
from typing import Optional
from fastapi import Header, Depends, Request

from app.core.auth.models import LearnerIdentity
from app.core.auth.token import verify_bearer_token
from app.core.errors.exceptions import AuthenticationError, AuthorizationError


async def get_current_learner(
    request: Request,
    authorization: Optional[str] = Header(None, alias="Authorization"),
) -> LearnerIdentity:
    """Extracts and verifies the caller's authoritative learner identity.

    Raises:
        AuthenticationError: If Authorization header is missing, invalid, or malformed.
    """
    if not authorization:
        raise AuthenticationError("Authorization header is required")

    if not authorization.startswith("Bearer "):
        raise AuthenticationError("Authorization header must use Bearer scheme")

    token = authorization[7:].strip()
    learner = verify_bearer_token(token)

    # Attach identity to request state for downstream logging/handlers
    request.state.learner = learner
    return learner


def verify_owner_access(resource_owner_id: str, current_learner: LearnerIdentity) -> None:
    """Enforces owner isolation, forbidding cross-learner access."""
    if resource_owner_id != current_learner.learner_id and not current_learner.is_admin:
        raise AuthorizationError(
            f"Forbidden: You do not have permission to access records belonging to '{resource_owner_id}'"
        )
