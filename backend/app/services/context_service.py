"""Learner context service aggregating authoritative records, verified mastery, and retrieval context."""
import logging
from typing import Any, Dict, List, Optional
from motor.motor_asyncio import AsyncIOMotorDatabase
from app.db.repositories.chat import ChatRepository
from app.db.repositories.core import (
    GoalModel,
    LearnerRepository,
    LessonRepository,
    RoadmapRepository,
    SkillRepository,
)
from app.services.retrieval_service import RetrievalService

logger = logging.getLogger("pathai.services.context")


class ContextService:
    """Loads authoritative learner profile, active goals, verified skills, and bounded chat history."""

    def __init__(self, core_db: AsyncIOMotorDatabase, chat_db: AsyncIOMotorDatabase) -> None:
        self.learner_repo = LearnerRepository(core_db)
        self.skill_repo = SkillRepository(core_db)
        self.roadmap_repo = RoadmapRepository(core_db)
        self.lesson_repo = LessonRepository(core_db)
        self.chat_repo = ChatRepository(chat_db)
        self.retrieval_service = RetrievalService(core_db)

    async def get_learner_context(
        self,
        learner_id: str,
        conversation_id: Optional[str] = None,
        query: Optional[str] = None,
        history_limit: int = 5,
    ) -> Dict[str, Any]:
        """Assembles a bounded, privacy-scoped learner context snapshot."""
        # 1. Profile and preferences
        learner = await self.learner_repo.get_by_id(learner_id)
        prefs = await self.learner_repo.get_preferences(learner_id)
        goals = await self.learner_repo.get_active_goals(learner_id)

        # 2. Roadmap and current milestone
        active_roadmap = await self.roadmap_repo.get_active_roadmap(learner_id)
        active_milestone = None
        if active_roadmap:
            version = await self.roadmap_repo.get_version(active_roadmap.roadmap_id, active_roadmap.active_version)
            if version and version.milestones:
                # First uncompleted milestone
                for m in version.milestones:
                    if not m.get("is_completed", False):
                        active_milestone = m
                        break

        # 3. Evidence-based skill mastery (distinguishing verified mastery from engagement)
        learner_skills = await self.skill_repo.learner_skills.find_many(
            {"learner_id": learner_id},
            limit=20,
        )
        verified_evidence = await self.skill_repo.evidence.find_many(
            {"learner_id": learner_id, "verification_state": "verified"},
            limit=20,
        )

        verified_skills_data = [
            {
                "skill_id": s.skill_id,
                "mastery_score": s.mastery_score,
                "confidence_score": s.confidence_score,
            }
            for s in learner_skills
        ]

        # 4. Bounded conversation history and latest summary
        recent_messages: List[Dict[str, Any]] = []
        summary_text: Optional[str] = None

        if conversation_id:
            msgs = await self.chat_repo.get_messages(conversation_id, limit=history_limit)
            recent_messages = [
                {
                    "sequence_number": m.sequence_number,
                    "role": m.role,
                    "content": m.content,
                }
                for m in msgs
            ]
            summary = await self.chat_repo.get_latest_summary(conversation_id)
            if summary:
                summary_text = summary.text

        # 5. Verified knowledge citations
        verified_passages: List[Dict[str, Any]] = []
        if query:
            verified_passages = await self.retrieval_service.search_and_verify(
                learner_id=learner_id,
                query=query,
                limit=3,
                include_public=True,
            )

        citations = self.retrieval_service.to_citations(verified_passages)

        return {
            "learner_id": learner_id,
            "display_name": learner.display_name if learner else "Learner",
            "preferences": prefs.model_dump() if prefs else {},
            "active_goals": [{"goal_id": g.goal_id, "title": g.title, "domain": g.target_domain} for g in goals],
            "active_roadmap": {
                "roadmap_id": active_roadmap.roadmap_id if active_roadmap else None,
                "active_version": active_roadmap.active_version if active_roadmap else None,
                "current_milestone": active_milestone,
            } if active_roadmap else None,
            "verified_skills": verified_skills_data,
            "verified_evidence_count": len(verified_evidence),
            "recent_chat_history": recent_messages,
            "conversation_summary": summary_text,
            "verified_passages": verified_passages,
            "citations": citations,
        }
