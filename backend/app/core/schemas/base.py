"""Base schema and shared configuration for all domain contracts."""
from datetime import datetime, timezone
from typing import Annotated
from pydantic import BaseModel, ConfigDict, Field


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


class BaseSchema(BaseModel):
    """Strict base model forbidding extra undefined attributes."""
    model_config = ConfigDict(
        extra="forbid",
        populate_by_name=True,
        validate_assignment=True,
        str_strip_whitespace=True,
    )


class AuditableSchema(BaseSchema):
    """Base schema including created and updated UTC timestamps."""
    created_at: datetime = Field(default_factory=utc_now)
    updated_at: datetime = Field(default_factory=utc_now)
