"""Chat and Teacher Brain (Elara) orchestration service."""
import asyncio
import json
import logging
import uuid
from typing import Any, AsyncGenerator, Dict, List, Optional
from motor.motor_asyncio import AsyncIOMotorDatabase
from app.config import settings
from app.core.execution.validator import validate_task_plan
from app.core.llm.gateway import gateway
from app.core.prompts.teacher import TEACHER_SYSTEM_PROMPT
from app.core.schemas.api import TeacherChatResponse
from app.core.schemas.chat import Citation, MessageRole
from app.core.schemas.plan import TaskItem, TaskPlan, WorkerRole
from app.db.models.chat import ChatMessageModel, ConversationModel
from app.db.repositories.chat import ChatRepository
from app.services.context_service import ContextService
from app.services.execution_service import ExecutionService

logger = logging.getLogger("pathai.services.chat")


class ChatService:
    def __init__(self, core_db: AsyncIOMotorDatabase, chat_db: AsyncIOMotorDatabase) -> None:
        self.chat_repo = ChatRepository(chat_db)
        self.context_service = ContextService(core_db, chat_db)
        self.execution_service = ExecutionService(core_db)

    async def create_conversation(
        self,
        learner_id: str,
        title: Optional[str] = None,
        goal_id: Optional[str] = None,
    ) -> ConversationModel:
        convo_id = f"cnv_{uuid.uuid4().hex[:8]}"
        convo = ConversationModel(
            conversation_id=convo_id,
            learner_id=learner_id,
            goal_id=goal_id,
            title=title or "Learning Session with Elara",
            is_active=True,
        )
        return await self.chat_repo.create_conversation(convo)

    async def list_conversations(self, learner_id: str, limit: int = 20, skip: int = 0) -> List[ConversationModel]:
        return await self.chat_repo.list_conversations(learner_id, limit=limit, skip=skip)

    async def get_conversation(self, learner_id: str, conversation_id: str) -> Optional[ConversationModel]:
        return await self.chat_repo.get_conversation(conversation_id, learner_id)

    async def get_messages(
        self,
        conversation_id: str,
        limit: int = 50,
        before_sequence: Optional[int] = None,
    ) -> List[ChatMessageModel]:
        return await self.chat_repo.get_messages(conversation_id, limit=limit, before_sequence=before_sequence)

    async def send_message(
        self,
        learner_id: str,
        conversation_id: str,
        content: str,
        role: MessageRole = MessageRole.USER,
        idempotency_key: Optional[str] = None,
    ) -> TeacherChatResponse:
        convo = await self.chat_repo.get_conversation(conversation_id, learner_id)
        if not convo:
            raise ValueError(f"Conversation {conversation_id} not found for this learner")

        # 1. Check idempotency if key provided
        if idempotency_key:
            existing = await self.chat_repo.messages.find_one(
                {"conversation_id": conversation_id, "metadata.idempotency_key": idempotency_key}
            )
            if existing:
                # Find corresponding assistant message following it
                asst_reply = await self.chat_repo.messages.find_one(
                    {"conversation_id": conversation_id, "sequence_number": existing.sequence_number + 1}
                )
                if asst_reply:
                    return TeacherChatResponse(
                        message_id=asst_reply.message_id,
                        conversation_id=conversation_id,
                        sequence_number=asst_reply.sequence_number,
                        role=MessageRole.ASSISTANT,
                        content=asst_reply.content,
                        citations=[Citation(**c) for c in asst_reply.citations],
                        run_id=asst_reply.run_id,
                    )

        # 2. Append user message
        msg_meta = {"idempotency_key": idempotency_key} if idempotency_key else {}
        user_msg = ChatMessageModel(
            message_id=f"msg_{uuid.uuid4().hex[:8]}",
            conversation_id=conversation_id,
            sequence_number=0,  # Auto-increments monotonically
            role=role.value,
            content=content,
            metadata=msg_meta,
        )
        await self.chat_repo.append_message(user_msg)

        # 3. Gather comprehensive learner context snapshot
        context = await self.context_service.get_learner_context(
            learner_id=learner_id,
            conversation_id=conversation_id,
            query=content,
        )

        # 4. Consult Teacher Brain (Elara)
        assistant_content = ""
        task_plan: Optional[TaskPlan] = None
        run_id: Optional[str] = None

        if gateway.is_available:
            try:
                prompt = (
                    f"Learner Context Snapshot:\n{json.dumps(context, default=str)}\n\n"
                    f"Learner message: {content}\n\n"
                    f"Respond as Elara, the empathetic and structured Teacher Brain."
                )
                assistant_content = await gateway.generate_text(
                    prompt=prompt,
                    system_instruction=TEACHER_SYSTEM_PROMPT,
                    model=settings.TEACHER_MODEL,
                )
            except Exception as e:
                logger.warning("Teacher model gateway failed: %s", e)
                assistant_content = self._generate_fallback_response(content, context)
        else:
            assistant_content = self._generate_fallback_response(content, context)

        # 5. Check if task planning is warranted (e.g. curriculum, assessment, deep breakdown)
        lower_content = content.lower()
        if any(keyword in lower_content for keyword in ["syllabus", "curriculum", "create plan", "roadmap", "quiz me"]):
            plan_task = TaskItem(
                task_id="task_1",
                worker_role=WorkerRole.CURRICULUM if "syllabus" in lower_content or "roadmap" in lower_content else WorkerRole.ASSESSMENT_DESIGN,
                objective=f"Plan specialized materials for: {content[:100]}",
                dependencies=[],
                requested_tools=["fetch_profile"],
                output_schema="RoadmapProposalPayload" if "syllabus" in lower_content or "roadmap" in lower_content else "AssessmentDesignPayload",
            )
            task_plan = TaskPlan(
                plan_id=f"plan_{uuid.uuid4().hex[:8]}",
                overall_objective=f"Adaptive plan for: {content[:80]}",
                master_instructions="Design structured scaffold for learner progression.",
                tasks=[plan_task],
            )
            # Execute plan through ExecutionService (workers, tools, judge review, and deterministic validation)
            run = await self.execution_service.execute_plan(task_plan, learner_id, context)
            run_id = run.run_id

        # 6. Append assistant message
        citations_list = context.get("citations", [])
        asst_msg = ChatMessageModel(
            message_id=f"msg_{uuid.uuid4().hex[:8]}",
            conversation_id=conversation_id,
            sequence_number=0,  # Auto-increments monotonically
            role=MessageRole.ASSISTANT.value,
            content=assistant_content,
            run_id=run_id,
            citations=[c.model_dump() for c in citations_list],
        )
        saved_asst_msg = await self.chat_repo.append_message(asst_msg)

        return TeacherChatResponse(
            message_id=saved_asst_msg.message_id,
            conversation_id=conversation_id,
            sequence_number=saved_asst_msg.sequence_number,
            role=MessageRole.ASSISTANT,
            content=assistant_content,
            citations=citations_list,
            task_plan=task_plan,
            run_id=run_id,
        )

    def _generate_fallback_response(self, query: str, context: Dict[str, Any]) -> str:
        """Deterministic pedagogical fallback response when live LLM gateway is offline."""
        goals = context.get("active_goals", [])
        goal_titles = [g["title"] if isinstance(g, dict) else str(g) for g in goals]
        goal_mention = f" towards your goal in {goal_titles[0]}" if goal_titles else ""
        return (
            f"Hello! I am Elara, your teacher brain. I'm actively guiding your learning journey{goal_mention}. "
            f"Regarding '{query}': let's break this concept down into clear, manageable steps. "
            f"Would you like to explore an illustrative example, review foundational prerequisites, or test your understanding with a quick exercise?"
        )

    async def stream_chat_events(
        self,
        learner_id: str,
        conversation_id: str,
        content: str,
    ) -> AsyncGenerator[str, None]:
        """Server-Sent Events generator yielding streaming events."""
        yield f"data: {json.dumps({'type': 'status', 'stage': 'retrieving_context'})}\n\n"
        await asyncio.sleep(0.01)

        res = await self.send_message(learner_id, conversation_id, content)

        # Stream chunks of assistant response
        words = res.content.split(" ")
        for i in range(0, len(words), 3):
            chunk = " ".join(words[i : i + 3]) + " "
            yield f"data: {json.dumps({'type': 'text_delta', 'delta': chunk})}\n\n"
            await asyncio.sleep(0.01)

        # Stream citations if any
        for c in res.citations:
            yield f"data: {json.dumps({'type': 'citation', 'citation': c.model_dump()})}\n\n"

        yield f"data: {json.dumps({'type': 'completed', 'message_id': res.message_id, 'sequence_number': res.sequence_number})}\n\n"
