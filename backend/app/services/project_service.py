"""Project and Learner Progress service managing real-world milestones and verified mastery."""
import logging
import uuid
from typing import Any, Dict, List, Optional
from motor.motor_asyncio import AsyncIOMotorDatabase
from app.core.schemas.api import CreateProjectRequest, SubmitProjectRequest
from app.db.models.core import ProjectModel, SubmissionModel
from app.db.repositories.core import ProjectRepository, SkillRepository

logger = logging.getLogger("pathai.services.project")


class ProjectService:
    def __init__(self, core_db: AsyncIOMotorDatabase) -> None:
        self.project_repo = ProjectRepository(core_db)
        self.skill_repo = SkillRepository(core_db)

    async def get_project(self, project_id: str) -> Optional[ProjectModel]:
        return await self.project_repo.get_project(project_id)

    async def create_project(self, req: CreateProjectRequest) -> ProjectModel:
        project = ProjectModel(
            project_id=req.project_id,
            title=req.title,
            brief=req.brief,
            requirements=req.requirements,
            skill_ids=req.skill_ids,
        )
        await self.project_repo.projects.insert(project)
        return project

    async def submit_project(
        self,
        learner_id: str,
        project_id: str,
        req: SubmitProjectRequest,
    ) -> SubmissionModel:
        project = await self.get_project(project_id)
        if not project:
            raise ValueError(f"Project {project_id} not found")

        submission_id = f"sub_{uuid.uuid4().hex[:8]}"
        submission = SubmissionModel(
            submission_id=submission_id,
            learner_id=learner_id,
            project_id=project_id,
            revision=1,
            repository_url=req.repository_url,
            artifact_keys=req.artifact_keys,
            status="submitted",
        )
        return await self.project_repo.save_submission(submission)

    async def get_learner_progress(self, learner_id: str) -> Dict[str, Any]:
        """Aggregate evidence-based learner mastery (verified assessments vs unassessed)."""
        learner_skills = await self.skill_repo.learner_skills.find_many(
            {"learner_id": learner_id},
            limit=100,
        )
        verified_evidence = await self.skill_repo.evidence.find_many(
            {"learner_id": learner_id, "verification_state": "verified"},
            limit=500,
        )

        skills_data = [
            {
                "skill_id": ls.skill_id,
                "mastery_score": ls.mastery_score,
                "confidence_score": ls.confidence_score,
                "state_version": ls.state_version,
                "last_assessed_at": ls.last_assessed_at.isoformat() if ls.last_assessed_at else None,
            }
            for ls in learner_skills
        ]

        overall_mastery = (
            round(sum(s["mastery_score"] for s in skills_data) / len(skills_data), 2)
            if skills_data
            else 0.0
        )

        return {
            "learner_id": learner_id,
            "overall_mastery": overall_mastery,
            "total_assessed_skills": len(skills_data),
            "total_verified_evidence": len(verified_evidence),
            "skills": skills_data,
        }
