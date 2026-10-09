"""Controlled backend tools service enforcing least-privilege role boundaries and argument validation."""
import logging
from typing import Any, Dict, Optional
from motor.motor_asyncio import AsyncIOMotorDatabase
from app.core.execution.policy import FORBIDDEN_TOOLS, is_tool_allowed_for_role
from app.core.schemas.plan import ToolGroup, WorkerRole
from app.db.repositories.core import (
    AssessmentRepository,
    LearnerRepository,
    LessonRepository,
    RoadmapRepository,
    SkillRepository,
)
from app.services.retrieval_service import RetrievalService

logger = logging.getLogger("pathai.services.tool")


# Mapping of registered tool names to their operational ToolGroup
TOOL_GROUP_MAPPING: Dict[str, ToolGroup] = {
    "get_learner_context": ToolGroup.LEARNER_RECORDS,
    "get_active_roadmap": ToolGroup.LEARNER_RECORDS,
    "search_knowledge": ToolGroup.KNOWLEDGE,
    "get_lesson_context": ToolGroup.LEARNER_RECORDS,
    "get_evaluation_context": ToolGroup.ASSESSMENT,
    "fetch_profile": ToolGroup.LEARNER_RECORDS,
    "fetch_lesson": ToolGroup.LEARNER_RECORDS,
}


class ToolService:
    """Executes authorized backend operations for specialist worker LLMs with least-privilege checks."""

    def __init__(self, core_db: AsyncIOMotorDatabase) -> None:
        self.learner_repo = LearnerRepository(core_db)
        self.skill_repo = SkillRepository(core_db)
        self.roadmap_repo = RoadmapRepository(core_db)
        self.lesson_repo = LessonRepository(core_db)
        self.assessment_repo = AssessmentRepository(core_db)
        self.retrieval_service = RetrievalService(core_db)

    async def execute_tool(
        self,
        worker_role: WorkerRole,
        tool_name: str,
        learner_id: str,
        arguments: Dict[str, Any],
    ) -> Dict[str, Any]:
        """Validates permissions and executes the requested named tool."""
        # 1. Check for strictly forbidden tools
        if tool_name in FORBIDDEN_TOOLS:
            logger.error("Security violation: Worker %s attempted forbidden tool %s", worker_role, tool_name)
            raise PermissionError(f"Tool '{tool_name}' is strictly forbidden by backend security policy.")

        # 2. Check tool group permission grant for worker role
        tool_group = TOOL_GROUP_MAPPING.get(tool_name)
        if not tool_group:
            raise ValueError(f"Unknown or unregistered tool '{tool_name}'")

        if not is_tool_allowed_for_role(worker_role, tool_name, tool_group):
            logger.warning("Access denied: Worker %s does not have access to tool %s (%s)", worker_role, tool_name, tool_group)
            raise PermissionError(f"Worker role '{worker_role.value}' is not permitted to use tool '{tool_name}'.")

        # 3. Execute approved tool
        if tool_name in ("get_learner_context", "fetch_profile"):
            return await self._get_learner_context(learner_id)
        elif tool_name == "get_active_roadmap":
            return await self._get_active_roadmap(learner_id)
        elif tool_name == "search_knowledge":
            query = arguments.get("query", "")
            return await self._search_knowledge(learner_id, query)
        elif tool_name in ("get_lesson_context", "fetch_lesson"):
            lesson_id = arguments.get("lesson_id", "")
            return await self._get_lesson_context(learner_id, lesson_id)
        elif tool_name == "get_evaluation_context":
            assessment_id = arguments.get("assessment_id", "")
            return await self._get_evaluation_context(learner_id, assessment_id)
        else:
            raise ValueError(f"Unhandled tool implementation '{tool_name}'")

    async def _get_learner_context(self, learner_id: str) -> Dict[str, Any]:
        """Fetch a bounded learner profile and progress summary."""
        learner = await self.learner_repo.get_by_id(learner_id)
        prefs = await self.learner_repo.get_preferences(learner_id)
        goals = await self.learner_repo.get_active_goals(learner_id)
        skills = await self.skill_repo.learner_skills.find_many({"learner_id": learner_id}, limit=10)

        return {
            "learner_id": learner_id,
            "display_name": learner.display_name if learner else "Learner",
            "preferences": prefs.model_dump() if prefs else {},
            "goals": [g.title for g in goals],
            "assessed_skills": [
                {"skill_id": s.skill_id, "mastery_score": s.mastery_score}
                for s in skills
            ],
        }

    async def _get_active_roadmap(self, learner_id: str) -> Dict[str, Any]:
        """Return the accepted roadmap version."""
        roadmap = await self.roadmap_repo.get_active_roadmap(learner_id)
        if not roadmap:
            return {"roadmap_found": False}
        version = await self.roadmap_repo.get_version(roadmap.roadmap_id, roadmap.active_version)
        return {
            "roadmap_found": True,
            "roadmap_id": roadmap.roadmap_id,
            "active_version": roadmap.active_version,
            "milestones": version.milestones if version else [],
        }

    async def _search_knowledge(self, learner_id: str, query: str) -> Dict[str, Any]:
        """Search Chroma, verify sources in MongoDB, return cited excerpts."""
        passages = await self.retrieval_service.search_and_verify(
            learner_id=learner_id,
            query=query,
            limit=3,
            include_public=True,
        )
        return {"passages": passages}

    async def _get_lesson_context(self, learner_id: str, lesson_id: str) -> Dict[str, Any]:
        """Load the relevant lesson and progress."""
        lesson = await self.lesson_repo.get_lesson_version(lesson_id)
        progress = await self.lesson_repo.get_progress(learner_id, lesson_id)
        return {
            "lesson_id": lesson_id,
            "title": lesson.title if lesson else "Untitled Lesson",
            "content_blocks": lesson.content_blocks if lesson else [],
            "status": progress.status if progress else "not_started",
        }

    async def _get_evaluation_context(self, learner_id: str, assessment_id: str) -> Dict[str, Any]:
        """Load the submission and restricted rubric for an authorized evaluator."""
        rubric = await self.assessment_repo.get_rubric_isolated(assessment_id)
        if not rubric:
            return {"error": f"Rubric for {assessment_id} not found"}
        return {
            "assessment_id": assessment_id,
            "scoring_criteria": rubric.scoring_criteria,
            "answer_keys": rubric.answer_keys,
            "min_pass_score": rubric.min_pass_score,
        }
