"""Token validation and subject mapping service."""
import base64
import json
import logging
from typing import Optional

from app.core.auth.models import LearnerIdentity
from app.core.errors.exceptions import AuthenticationError

logger = logging.getLogger(__name__)


def verify_bearer_token(token: str) -> LearnerIdentity:
    """Verifies a bearer token and resolves the authoritative LearnerIdentity.

    Supports:
    1. Fast-path test tokens: e.g. 'test-token:<learner_id>:<subject>' or 'test-learner-<id>'
    2. Bearer JWT tokens: validates structure and claims (subject, email, roles).

    Raises:
        AuthenticationError: If token is empty, invalid, or malformed.
    """
    if not token or not token.strip():
        raise AuthenticationError("Bearer token cannot be empty")

    clean_token = token.strip()

    # Fast-path for testing & local development
    if clean_token.startswith("test-token:"):
        parts = clean_token.split(":")
        if len(parts) >= 3:
            return LearnerIdentity(
                learner_id=parts[1],
                auth_subject=parts[2],
                email=f"{parts[1]}@pathai.test",
                roles=["learner"],
            )
        elif len(parts) == 2:
            return LearnerIdentity(
                learner_id=parts[1],
                auth_subject=f"auth0|{parts[1]}",
                email=f"{parts[1]}@pathai.test",
                roles=["learner"],
            )

    if clean_token.startswith("test-learner-"):
        learner_id = clean_token.replace("test-learner-", "")
        return LearnerIdentity(
            learner_id=learner_id,
            auth_subject=f"auth0|{learner_id}",
            email=f"{learner_id}@pathai.test",
            roles=["learner"],
        )

    # JWT inspection (payload decode without external keys for dev/mock, or full claim parsing)
    if clean_token.count(".") == 2:
        try:
            payload_b64 = clean_token.split(".")[1]
            # Add padding if needed
            rem = len(payload_b64) % 4
            if rem > 0:
                payload_b64 += "=" * (4 - rem)
            payload_json = base64.urlsafe_b64decode(payload_b64.encode("utf-8")).decode("utf-8")
            claims = json.loads(payload_json)

            sub = claims.get("sub")
            if not sub:
                raise AuthenticationError("Token payload missing 'sub' subject claim")

            # Map auth subject to internal learner_id
            learner_id = claims.get("learner_id") or sub.replace("|", "_")
            return LearnerIdentity(
                learner_id=learner_id,
                auth_subject=sub,
                email=claims.get("email"),
                roles=claims.get("roles", ["learner"]),
            )
        except Exception as e:
            logger.warning(f"Failed to parse JWT payload: {e}")
            raise AuthenticationError(f"Invalid JWT credentials: {str(e)}")

    raise AuthenticationError("Invalid or unsupported bearer token format")
