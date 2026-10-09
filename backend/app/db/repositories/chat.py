"""Repository for pathai_chat collections managing conversations, sequence numbers, and summaries."""
import logging
from typing import Any, Dict, List, Optional
from motor.motor_asyncio import AsyncIOMotorDatabase
from app.db.models.base import utc_now
from app.db.models.chat import (
    ChatMessageModel,
    CitationModel,
    ConversationModel,
    ConversationRunRefModel,
    SummaryModel,
)
from app.db.repositories.base import BaseMongoRepository

logger = logging.getLogger("pathai.db.repositories.chat")


class ChatRepository:
    """Manages conversations, ordered messages, summaries, and citations."""

    def __init__(self, db: AsyncIOMotorDatabase) -> None:
        self.conversations = BaseMongoRepository(db, "conversations", ConversationModel)
        self.messages = BaseMongoRepository(db, "messages", ChatMessageModel)
        self.summaries = BaseMongoRepository(db, "summaries", SummaryModel)
        self.citations = BaseMongoRepository(db, "citations", CitationModel)
        self.run_refs = BaseMongoRepository(db, "conversation_run_refs", ConversationRunRefModel)

    async def create_conversation(self, convo: ConversationModel) -> ConversationModel:
        return await self.conversations.insert(convo)

    async def get_conversation(self, conversation_id: str, learner_id: str) -> Optional[ConversationModel]:
        return await self.conversations.find_one({"conversation_id": conversation_id, "learner_id": learner_id})

    async def list_conversations(self, learner_id: str, limit: int = 20, skip: int = 0) -> List[ConversationModel]:
        return await self.conversations.find_many(
            {"learner_id": learner_id, "is_active": True},
            sort=[("updated_at", -1)],
            limit=limit,
            skip=skip,
        )

    async def get_next_sequence_number(self, conversation_id: str) -> int:
        """Find the next sequence number for messages in this conversation."""
        last_msg = await self.messages.find_many(
            {"conversation_id": conversation_id},
            sort=[("sequence_number", -1)],
            limit=1,
        )
        if not last_msg:
            return 1
        return last_msg[0].sequence_number + 1

    async def append_message(self, message: ChatMessageModel) -> ChatMessageModel:
        """Append a message, guaranteeing sequence order and touch conversation timestamp."""
        # Check idempotency
        existing = await self.messages.find_one({"message_id": message.message_id})
        if existing:
            return existing

        # Ensure valid sequence
        if not message.sequence_number or message.sequence_number <= 0:
            message.sequence_number = await self.get_next_sequence_number(message.conversation_id)

        await self.messages.insert(message)
        await self.conversations.update_one(
            {"conversation_id": message.conversation_id},
            {"updated_at": utc_now()},
        )
        return message

    async def get_messages(
        self,
        conversation_id: str,
        limit: int = 50,
        before_sequence: Optional[int] = None,
    ) -> List[ChatMessageModel]:
        """Fetch messages within a conversation ordered by sequence."""
        query: Dict[str, Any] = {"conversation_id": conversation_id}
        if before_sequence is not None:
            query["sequence_number"] = {"$lt": before_sequence}

        return await self.messages.find_many(
            query,
            sort=[("sequence_number", 1)],
            limit=limit,
        )

    async def save_summary(self, summary: SummaryModel) -> SummaryModel:
        return await self.summaries.insert(summary)

    async def get_latest_summary(self, conversation_id: str) -> Optional[SummaryModel]:
        res = await self.summaries.find_many(
            {"conversation_id": conversation_id},
            sort=[("created_at", -1)],
            limit=1,
        )
        return res[0] if res else None

    async def save_citation(self, citation: CitationModel) -> CitationModel:
        return await self.citations.insert(citation)

    async def link_run_ref(self, ref: ConversationRunRefModel) -> ConversationRunRefModel:
        return await self.run_refs.insert(ref)
