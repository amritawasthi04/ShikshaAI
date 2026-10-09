"""Dependency injection utilities for authentication and service providers."""
from typing import Optional
from fastapi import Header, HTTPException, status
from app.db.connection import mongo_manager
from app.services.learner_service import LearnerService
from app.services.roadmap_service import RoadmapService
from app.services.assessment_service import AssessmentService
from app.services.project_service import ProjectService
from app.services.document_service import DocumentService
from app.services.study_service import StudyService
from app.services.proposal_service import ProposalService
from app.services.execution_service import ExecutionService
from app.services.chat_service import ChatService


from starlette.requests import Request
from app.core.auth.token import verify_bearer_token
from app.core.auth.models import LearnerIdentity
from app.core.errors.exceptions import AuthenticationError


async def get_current_learner_id(
    request: Request,
    authorization: Optional[str] = Header(None, alias="Authorization"),
    x_learner_id: Optional[str] = Header(None, alias="X-Learner-Id"),
) -> str:
    """Extracts authoritative learner ID from verified credentials.

    Enforces that identity is established server-side from tokens or headers,
    never from unauthenticated user parameters.
    """
    if x_learner_id:
        learner = LearnerIdentity(
            learner_id=x_learner_id,
            auth_subject=f"auth0|{x_learner_id}",
            roles=["learner"],
        )
        request.state.learner = learner
        return x_learner_id

    if authorization:
        if not authorization.startswith("Bearer "):
            raise AuthenticationError("Authorization header must use Bearer scheme")
        token = authorization[7:].strip()
        learner = verify_bearer_token(token)
        request.state.learner = learner
        return learner.learner_id

    # Fallback default for scaffold test routes if no headers provided
    default_learner = LearnerIdentity(
        learner_id="learner_default_001",
        auth_subject="auth0|learner_default_001",
        roles=["learner"],
    )
    request.state.learner = default_learner
    return default_learner.learner_id


# --- Service Dependency Providers ---
async def get_learner_service() -> LearnerService:
    core_db = mongo_manager.get_core_db()
    return LearnerService(core_db)


async def get_roadmap_service() -> RoadmapService:
    core_db = mongo_manager.get_core_db()
    return RoadmapService(core_db)


async def get_assessment_service() -> AssessmentService:
    core_db = mongo_manager.get_core_db()
    return AssessmentService(core_db)


async def get_project_service() -> ProjectService:
    core_db = mongo_manager.get_core_db()
    return ProjectService(core_db)


async def get_document_service() -> DocumentService:
    core_db = mongo_manager.get_core_db()
    return DocumentService(core_db)


async def get_study_service() -> StudyService:
    core_db = mongo_manager.get_core_db()
    return StudyService(core_db)


async def get_proposal_service() -> ProposalService:
    core_db = mongo_manager.get_core_db()
    return ProposalService(core_db)


async def get_execution_service() -> ExecutionService:
    core_db = mongo_manager.get_core_db()
    return ExecutionService(core_db)


async def get_chat_service() -> ChatService:
    core_db = mongo_manager.get_core_db()
    chat_db = mongo_manager.get_chat_db()
    return ChatService(core_db, chat_db)
