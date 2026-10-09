"""Dependency injection utilities for authentication and context scoping."""
from typing import Optional
from fastapi import Header, HTTPException, status


async def get_current_learner_id(
    authorization: Optional[str] = Header(None, alias="Authorization"),
    x_learner_id: Optional[str] = Header(None, alias="X-Learner-Id"),
) -> str:
    """Extracts authenticated learner ID.

    In production/Phase 1+, this parses and verifies the OIDC bearer token.
    For Phase 0 scaffold testing, accepts X-Learner-Id or test bearer.
    """
    if x_learner_id:
        return x_learner_id

    if authorization and authorization.startswith("Bearer "):
        token = authorization.split(" ")[1]
        if token.startswith("test-learner-"):
            return token.replace("test-learner-", "")
        return "learner_default_001"

    # Default fallback for testing scaffold endpoints
    return "learner_default_001"
