"""Application errors and exception handling package."""
from app.core.errors.models import ErrorResponse, ErrorDetail
from app.core.errors.exceptions import (
    PathAIException,
    AuthenticationError,
    AuthorizationError,
    NotFoundError,
    ConflictError,
    PolicyViolationError,
    ServiceUnavailableError,
)
from app.core.errors.handlers import register_error_handlers

__all__ = [
    "ErrorResponse",
    "ErrorDetail",
    "PathAIException",
    "AuthenticationError",
    "AuthorizationError",
    "NotFoundError",
    "ConflictError",
    "PolicyViolationError",
    "ServiceUnavailableError",
    "register_error_handlers",
]
