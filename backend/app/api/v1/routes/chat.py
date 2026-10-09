"""Chat and Teacher Brain tutoring endpoints."""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.responses import StreamingResponse
from app.api.deps import get_chat_service, get_current_learner_id
from app.core.schemas.api import CreateConversationRequest, SendMessageRequest, TeacherChatResponse
from app.db.models.chat import ChatMessageModel, ConversationModel
from app.services.chat_service import ChatService

router = APIRouter(prefix="/conversations", tags=["Chat & Teacher Brain"])


@router.post("", response_model=ConversationModel, status_code=status.HTTP_201_CREATED)
async def create_conversation(
    req: CreateConversationRequest,
    learner_id: str = Depends(get_current_learner_id),
    service: ChatService = Depends(get_chat_service),
):
    """Start a new tutoring conversation."""
    return await service.create_conversation(learner_id, title=req.title, goal_id=req.goal_id)


@router.get("", response_model=List[ConversationModel])
async def list_conversations(
    limit: int = Query(20, ge=1, le=100),
    skip: int = Query(0, ge=0),
    learner_id: str = Depends(get_current_learner_id),
    service: ChatService = Depends(get_chat_service),
):
    """List conversations for current learner."""
    return await service.list_conversations(learner_id, limit=limit, skip=skip)


@router.get("/{conversation_id}", response_model=ConversationModel)
async def get_conversation(
    conversation_id: str,
    learner_id: str = Depends(get_current_learner_id),
    service: ChatService = Depends(get_chat_service),
):
    """Get single conversation metadata."""
    convo = await service.get_conversation(learner_id, conversation_id)
    if not convo:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Conversation not found")
    return convo


@router.get("/{conversation_id}/messages", response_model=List[ChatMessageModel])
async def get_messages(
    conversation_id: str,
    limit: int = Query(50, ge=1, le=200),
    before_sequence: Optional[int] = Query(None, ge=1),
    learner_id: str = Depends(get_current_learner_id),
    service: ChatService = Depends(get_chat_service),
):
    """Get message history ordered by sequence number."""
    convo = await service.get_conversation(learner_id, conversation_id)
    if not convo:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Conversation not found")
    return await service.get_messages(conversation_id, limit=limit, before_sequence=before_sequence)


@router.post("/{conversation_id}/messages", response_model=TeacherChatResponse)
async def send_message_to_teacher(
    conversation_id: str,
    req: SendMessageRequest,
    learner_id: str = Depends(get_current_learner_id),
    service: ChatService = Depends(get_chat_service),
):
    """Send message to Teacher Brain (Elara) and receive grounded pedagogical response."""
    try:
        return await service.send_message(
            learner_id=learner_id,
            conversation_id=conversation_id,
            content=req.content,
            role=req.role,
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.get("/{conversation_id}/messages/stream")
async def stream_chat_from_teacher(
    conversation_id: str,
    q: str = Query(..., min_length=1, description="Learner prompt"),
    learner_id: str = Depends(get_current_learner_id),
    service: ChatService = Depends(get_chat_service),
):
    """Stream real-time tokens and events from Teacher Brain via Server-Sent Events (SSE)."""
    convo = await service.get_conversation(learner_id, conversation_id)
    if not convo:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Conversation not found")

    return StreamingResponse(
        service.stream_chat_events(learner_id, conversation_id, q),
        media_type="text/event-stream",
    )
