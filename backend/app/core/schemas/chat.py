"""Chat models corresponding to conversation storage in pathai_chat."""
from enum import Enum
from typing import List, Optional
from pydantic import Field
from app.core.schemas.base import BaseSchema, AuditableSchema


class MessageRole(str, Enum):
    USER = "user"
    ASSISTANT = "assistant"
    SYSTEM = "system"


class Citation(BaseSchema):
    passage_id: str
    document_id: str
    source_title: str
    page_or_section: Optional[str] = None
    snippet: str


class ChatMessage(AuditableSchema):
    message_id: str
    conversation_id: str
    sequence_number: int = Field(..., ge=1)
    role: MessageRole
    content: str
    run_id: Optional[str] = None
    citations: List[Citation] = Field(default_factory=list)


class Conversation(AuditableSchema):
    conversation_id: str
    learner_id: str
    goal_id: Optional[str] = None
    title: str = "Learning Session with Elara"
    is_active: bool = True
