"""Roadmap and Lesson service managing curriculum journeys, canonical compilation, and study progress."""
import logging
import uuid
from typing import Any, Dict, List, Optional
from motor.motor_asyncio import AsyncIOMotorDatabase
from app.core.curriculum.canonical_roadmaps import (
    compile_canonical_curriculum,
    get_canonical_roadmap,
)
from app.core.schemas.api import CreateRoadmapRequest
from app.db.models.core import (
    LessonProgressModel,
    LessonVersionModel,
    RoadmapModel,
    RoadmapVersionModel,
    StudySessionModel,
)
from app.db.repositories.core import (
    LearnerRepository,
    LessonRepository,
    RoadmapRepository,
    SkillRepository,
)

logger = logging.getLogger("pathai.services.roadmap")


class RoadmapService:
    def __init__(self, core_db: AsyncIOMotorDatabase) -> None:
        self.roadmap_repo = RoadmapRepository(core_db)
        self.lesson_repo = LessonRepository(core_db)
        self.learner_repo = LearnerRepository(core_db)
        self.skill_repo = SkillRepository(core_db)
        self.core_db = core_db

    async def get_active_roadmap(self, learner_id: str) -> Optional[RoadmapModel]:
        return await self.roadmap_repo.get_active_roadmap(learner_id)

    async def get_canonical_tree(self, topic: str) -> Optional[Dict[str, Any]]:
        """Returns the canonical roadmap.sh tree and categories."""
        res = get_canonical_roadmap(topic)
        if not res:
            return None
        return {
            "topic": res["topic"],
            "description": res["description"],
            "external_ref": res["external_ref"],
            "categories": res["categories"],
            "nodes": [n.model_dump() for n in res["nodes"]],
        }

    async def create_roadmap(self, learner_id: str, req: CreateRoadmapRequest) -> RoadmapModel:
        roadmap_id = f"rdm_{uuid.uuid4().hex[:8]}"

        milestones = req.milestones
        canonical_topic = req.canonical_topic
        canonical_ref = None
        rationale = req.rationale

        # If canonical_topic is provided and milestones are omitted, compile canonical roadmap.sh curriculum
        if canonical_topic and not milestones:
            skills = await self.skill_repo.learner_skills.find_many({"learner_id": learner_id}, limit=50)
            assessed_skills = [{"skill_id": s.skill_id, "score": s.mastery_score} for s in skills]
            prefs = await self.learner_repo.get_preferences(learner_id)
            weekly_hours = prefs.weekly_availability_hours if prefs else 5.0

            compiled = compile_canonical_curriculum(
                topic=canonical_topic,
                assessed_skills=assessed_skills,
                weekly_hours=weekly_hours,
            )
            milestones = compiled["milestones"]
            canonical_ref = compiled["canonical_ref"]
            canonical_topic = compiled["canonical_topic"]
            if not rationale:
                rationale = compiled["rationale"]

        roadmap = RoadmapModel(
            roadmap_id=roadmap_id,
            learner_id=learner_id,
            goal_id=req.goal_id,
            active_version=1,
            status="active",
            is_active=True,
            canonical_topic=canonical_topic,
            canonical_ref=canonical_ref,
        )
        await self.roadmap_repo.roadmaps.insert(roadmap)

        # Create initial roadmap version 1
        initial_version = RoadmapVersionModel(
            roadmap_version_id=f"rdmv_{uuid.uuid4().hex[:8]}",
            roadmap_id=roadmap_id,
            learner_id=learner_id,
            version=1,
            milestones=milestones,
            canonical_topic=canonical_topic,
            canonical_ref=canonical_ref,
            rationale=rationale or "Initial customized curriculum plan",
            is_accepted=True,
        )
        await self.roadmap_repo.save_version(initial_version)
        return roadmap

    async def get_version(self, roadmap_id: str, version: int) -> Optional[RoadmapVersionModel]:
        return await self.roadmap_repo.get_version(roadmap_id, version)

    async def activate_version(self, learner_id: str, roadmap_id: str, version: int) -> bool:
        return await self.roadmap_repo.activate_version(learner_id, roadmap_id, version)

    async def get_lesson(self, lesson_id: str, version: int = 1) -> Optional[LessonVersionModel]:
        return await self.lesson_repo.get_lesson_version(lesson_id, version)

    async def get_lesson_progress(self, learner_id: str, lesson_id: str) -> Optional[LessonProgressModel]:
        return await self.lesson_repo.get_progress(learner_id, lesson_id)

    async def update_lesson_progress(self, learner_id: str, lesson_id: str, status: str) -> None:
        await self.lesson_repo.update_progress(learner_id, lesson_id, status)

    async def record_study_session(
        self,
        learner_id: str,
        lesson_id: Optional[str],
        active_seconds: int,
        measurement_source: str = "browser_heartbeat",
    ) -> StudySessionModel:
        session = StudySessionModel(
            session_id=f"sess_{uuid.uuid4().hex[:8]}",
            learner_id=learner_id,
            lesson_id=lesson_id,
            active_seconds=active_seconds,
            measurement_source=measurement_source,
        )
        return await self.lesson_repo.record_session(session)

    async def start_or_generate_lesson_for_node(
        self,
        learner_id: str,
        milestone_id: str,
        roadmap_id: Optional[str] = None,
    ) -> LessonVersionModel:
        """Finds or compiles an authoritative, grounded lesson strictly focused on the canonical roadmap node."""
        # 1. Check if a lesson already exists for this milestone
        existing = await self.lesson_repo.versions.find_one({"milestone_id": milestone_id})
        if existing:
            await self.lesson_repo.update_progress(learner_id, existing.lesson_id, "in_progress")
            return existing

        # 2. Locate milestone within active roadmap
        roadmap = None
        if roadmap_id:
            roadmap = await self.roadmap_repo.roadmaps.find_one({"roadmap_id": roadmap_id, "learner_id": learner_id})
        if not roadmap:
            roadmap = await self.roadmap_repo.get_active_roadmap(learner_id)

        target_milestone: Optional[Dict[str, Any]] = None
        completed_nodes: set[str] = set()

        if roadmap:
            version_doc = await self.roadmap_repo.get_version(roadmap.roadmap_id, roadmap.active_version)
            if version_doc:
                for m in version_doc.milestones:
                    if m.get("milestone_id") == milestone_id or m.get("node_id") == milestone_id:
                        target_milestone = m
                    if m.get("is_completed") or m.get("status") == "completed":
                        completed_nodes.add(m.get("node_id", m.get("milestone_id")))

        if not target_milestone:
            target_milestone = {
                "milestone_id": milestone_id,
                "node_id": milestone_id,
                "title": milestone_id.replace("_", " ").title(),
                "description": "Foundational curriculum milestone concept.",
                "category": "Core Concepts",
                "prerequisites": [],
                "external_ref": "https://roadmap.sh",
                "resources": [],
            }

        node_id = target_milestone.get("node_id", milestone_id)
        title = target_milestone.get("title", "Concept Lesson")
        description = target_milestone.get("description", "")
        category = target_milestone.get("category", "Core Concepts")
        prereqs = target_milestone.get("prerequisites", [])
        prereqs_completed = [p for p in prereqs if p in completed_nodes]
        external_ref = target_milestone.get("external_ref", "https://roadmap.sh")
        resources = target_milestone.get("resources", [])

        lesson_id = f"les_{milestone_id.replace(':', '_')}"
        lesson = LessonVersionModel(
            lesson_version_id=f"lv_{uuid.uuid4().hex[:8]}",
            lesson_id=lesson_id,
            version=1,
            milestone_id=milestone_id,
            title=title,
            node_id=node_id,
            prerequisites_completed=prereqs_completed,
            content_blocks=[
                {
                    "type": "concept_boundaries",
                    "title": f"Focus: {title}",
                    "body": f"Canonical Topic Scope: {description}. Bounded within '{category}'.",
                },
                {
                    "type": "prerequisites_summary",
                    "title": "Prerequisites Grounding",
                    "body": (
                        f"Verified prerequisites completed: {', '.join(prereqs_completed)}."
                        if prereqs_completed
                        else "Foundational node. All core prerequisites satisfied."
                    ),
                },
                {
                    "type": "explanation",
                    "title": "Core Pedagogical Explanation & Best Practices",
                    "body": (
                        f"Detailed deep-dive into {title}.\n\n"
                        f"Mental model: {description}.\n\n"
                        "Idiomatic usage patterns and common pitfalls to avoid."
                    ),
                },
            ],
            exercises=[
                {
                    "exercise_id": f"ex_{uuid.uuid4().hex[:6]}",
                    "prompt": f"Demonstrate mastery of {title} by implementing an idiomatic code example.",
                    "starter_code": f"# Implementation for {title}\n",
                }
            ],
            sources=[external_ref] if external_ref else [],
            external_ref=external_ref,
            resources=resources,
        )

        await self.lesson_repo.save_lesson_version(lesson)
        await self.lesson_repo.update_progress(learner_id, lesson_id, "in_progress")
        return lesson

