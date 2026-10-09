"""API v1 router aggregating all modular endpoints."""
from fastapi import APIRouter
from app.api.v1.routes import (
    assessments,
    chat,
    documents,
    health,
    learners,
    projects,
    proposals,
    roadmaps,
    runs,
    skills,
    study,
)

api_v1_router = APIRouter()

# Core health probes
api_v1_router.include_router(health.router)

# Learner identity, preferences & goals
api_v1_router.include_router(learners.router)

# Skills & dynamic categorization based on preferences
api_v1_router.include_router(skills.router)

# Chat & Teacher Brain (Elara) orchestration
api_v1_router.include_router(chat.router)

# Curriculum Roadmaps & Lesson progress
api_v1_router.include_router(roadmaps.router)

# Public assessments & isolated rubric attempts
api_v1_router.include_router(assessments.router)

# Project milestones, code submissions & progress
api_v1_router.include_router(projects.router)

# Documents, authoritative passages & hybrid search
api_v1_router.include_router(documents.router)

# Study plans, reviews & notifications
api_v1_router.include_router(study.router)

# Adaptation proposals with atomic concurrency
api_v1_router.include_router(proposals.router)

# Execution runs and task tracking
api_v1_router.include_router(runs.router)

