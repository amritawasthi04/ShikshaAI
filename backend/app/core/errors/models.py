"""Standardized public error schemas conforming to Section 12."""
from typing import Any, Dict, List, Optional
from pydantic import Field
from app.core.schemas.base import BaseSchema


class ErrorDetail(BaseSchema):
    field: Optional[str] = None
    issue: str


class ErrorResponse(BaseSchema):
    """Safe, sanitized public error payload.

    Omit internal provider payloads, database connection strings, and stack traces.
    """
    error_code: str = Field(..., description="Machine-readable error classification")
    message: str = Field(..., description="Human-readable safe explanation")
    retryable: bool = Field(default=False, description="Whether the client can retry the request")
    request_id: str = Field(..., description="Unique request tracing identifier")
    details: Optional[List[ErrorDetail]] = Field(default=None, description="Detailed field-level issues if any")
