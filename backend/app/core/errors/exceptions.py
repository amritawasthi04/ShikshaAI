"""Domain and application exception hierarchy for PathAI."""
from typing import List, Optional
from app.core.errors.models import ErrorDetail


class PathAIException(Exception):
    """Base exception for all controlled PathAI errors."""

    def __init__(
        self,
        message: str,
        status_code: int = 500,
        error_code: str = "INTERNAL_ERROR",
        retryable: bool = False,
        details: Optional[List[ErrorDetail]] = None,
    ):
        super().__init__(message)
        self.message = message
        self.status_code = status_code
        self.error_code = error_code
        self.retryable = retryable
        self.details = details or []


class AuthenticationError(PathAIException):
    """Raised when authentication credentials are missing, malformed, or expired."""

    def __init__(self, message: str = "Authentication required"):
        super().__init__(
            message=message,
            status_code=401,
            error_code="UNAUTHORIZED",
            retryable=False,
        )


class AuthorizationError(PathAIException):
    """Raised when an authenticated learner tries to access cross-learner or forbidden resources."""

    def __init__(self, message: str = "Access to requested resource is forbidden"):
        super().__init__(
            message=message,
            status_code=403,
            error_code="FORBIDDEN",
            retryable=False,
        )


class NotFoundError(PathAIException):
    """Raised when an authoritative resource does not exist."""

    def __init__(self, resource: str, identifier: str):
        super().__init__(
            message=f"{resource} '{identifier}' not found",
            status_code=404,
            error_code="RESOURCE_NOT_FOUND",
            retryable=False,
        )


class ConflictError(PathAIException):
    """Raised on version collisions, duplicate submissions, or state conflicts."""

    def __init__(self, message: str):
        super().__init__(
            message=message,
            status_code=409,
            error_code="CONFLICT",
            retryable=False,
        )


class PolicyViolationError(PathAIException):
    """Raised when a task plan or tool execution violates security policy."""

    def __init__(self, message: str):
        super().__init__(
            message=message,
            status_code=403,
            error_code="POLICY_VIOLATION",
            retryable=False,
        )


class ServiceUnavailableError(PathAIException):
    """Raised when downstream services or models are temporarily unreachable."""

    def __init__(self, message: str = "Service temporarily unavailable"):
        super().__init__(
            message=message,
            status_code=503,
            error_code="SERVICE_UNAVAILABLE",
            retryable=True,
        )
