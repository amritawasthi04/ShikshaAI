"""Chat models for MongoDB pathai_chat collections."""
from datetime import datetime
from typing import Any, Dict, List, Optional
from pydantic import Field
from app.db.models.base import MongoBaseModel, utc_now


class ConversationModel(MongoBaseModel):
    conversation_id: str
    learner_id: str
    goal_id: Optional[str] = None
    title: str = "Learning Session with Elara"
    is_active: bool = True


class CitationModel(MongoBaseModel):
    citation_id: str
    message_id: str
    passage_id: str
    document_id: str
    source_title: str
    page_or_section: Optional[str] = None
    snippet: str


class ChatMessageModel(MongoBaseModel):
    message_id: str
    conversation_id: str
    sequence_number: int = Field(default=0, ge=0)
    role: str  # user, assistant, system
    content: str
    run_id: Optional[str] = None
    citations: List[Dict[str, Any]] = Field(default_factory=list)
    metadata: Dict[str, Any] = Field(default_factory=dict)


class SummaryModel(MongoBaseModel):
    summary_id: str
    conversation_id: str
    text: str
    through_message_id: str
    source_message_ids: List[str] = Field(default_factory=list)


class ConversationRunRefModel(MongoBaseModel):
    ref_id: str
    conversation_id: str
    message_id: Optional[str] = None
    run_id: str
    task_ids: List[str] = Field(default_factory=list)
