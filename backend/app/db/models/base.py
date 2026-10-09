"""Base database model with datetime and ID conventions."""
from datetime import datetime, timezone
from typing import Any, Dict
from pydantic import BaseModel, ConfigDict, Field


def utc_now() -> datetime:
    """Return current timestamp in UTC timezone."""
    return datetime.now(timezone.utc)


class MongoBaseModel(BaseModel):
    """Base model for all MongoDB persisted entities."""
    model_config = ConfigDict(
        populate_by_name=True,
        validate_assignment=True,
        str_strip_whitespace=True,
        arbitrary_types_allowed=True,
        extra="allow",
    )

    created_at: datetime = Field(default_factory=utc_now)
    updated_at: datetime = Field(default_factory=utc_now)

    def to_mongo_doc(self) -> Dict[str, Any]:
        """Convert model to BSON-compatible dict for MongoDB insertion."""
        doc = self.model_dump(by_alias=True)
        # Ensure created_at and updated_at are datetime objects
        if isinstance(doc.get("created_at"), str):
            doc["created_at"] = datetime.fromisoformat(doc["created_at"])
        if isinstance(doc.get("updated_at"), str):
            doc["updated_at"] = datetime.fromisoformat(doc["updated_at"])
        return doc
