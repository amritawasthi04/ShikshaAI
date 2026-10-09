"""Vector payload and query models for Qdrant passage collection."""
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class PassageVectorPayload(BaseModel):
    """Payload stored alongside vector embeddings in Qdrant."""
    passage_id: str
    document_id: str
    learner_id: str
    version_id: int = 1
    page_or_section: Optional[str] = None
    language: str = "en"
    skill_tags: List[str] = Field(default_factory=list)
    embedding_model: str = "text-embedding-3-small"
    embedding_version: str = "v1"
    is_public: bool = False
    content_text: str

    def to_qdrant_payload(self) -> Dict[str, Any]:
        return self.model_dump()


class VectorSearchFilter(BaseModel):
    """Filter parameters for authorized vector retrieval."""
    learner_id: str
    include_public: bool = True
    document_ids: Optional[List[str]] = None
    skill_tags: Optional[List[str]] = None
    language: Optional[str] = None


class VectorSearchResult(BaseModel):
    """Result returned from Qdrant similarity search."""
    passage_id: str
    score: float
    document_id: str
    learner_id: str
    page_or_section: Optional[str] = None
    content_text: str
    skill_tags: List[str] = Field(default_factory=list)
    is_public: bool = False
