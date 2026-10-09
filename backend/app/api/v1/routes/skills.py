"""Skills and dynamic category taxonomy endpoints."""
from typing import Dict, List, Optional
from fastapi import APIRouter, Query, status
from app.core.curriculum.skill_taxonomy import (
    DOMAIN_TAXONOMIES,
    get_skill_categories_for_preferences,
)
from app.core.schemas.skills import (
    SkillCategoriesRequest,
    SkillCategoriesResponse,
)

router = APIRouter(prefix="/skills", tags=["Skills & Categorization"])


@router.get("/categories", response_model=SkillCategoriesResponse)
async def get_skill_categories(
    goal: Optional[str] = Query(None, description="Learner's learning goal or project topic"),
    target_role: Optional[str] = Query(None, description="Target career role or track"),
    experience_level: Optional[str] = Query("intermediate", description="beginner, intermediate, or advanced"),
    background: Optional[str] = Query(None, description="Educational or engineering background"),
):
    """Dynamically categorizes available skills based on learner goals and preferences.

    Updates categories dynamically when learner changes their goal, role, or background.
    """
    res = get_skill_categories_for_preferences(
        goal=goal or "",
        target_role=target_role or "",
        experience_level=experience_level or "intermediate",
        background=background or "",
    )
    return res


@router.post("/categories", response_model=SkillCategoriesResponse)
async def post_skill_categories(
    req: SkillCategoriesRequest,
):
    """POST endpoint to retrieve dynamically categorized skills for given preferences."""
    res = get_skill_categories_for_preferences(
        goal=req.goal or "",
        target_role=req.target_role or "",
        experience_level=req.experience_level or "intermediate",
        background=req.background or "",
    )
    return res


@router.get("/taxonomies")
async def list_available_taxonomies():
    """List all supported domain taxonomies with descriptions and categories."""
    return [
        {
            "domain_id": dt.domain_id,
            "title": dt.title,
            "description": dt.description,
            "category_count": len(dt.categories),
            "categories": [c.name for c in dt.categories],
        }
        for dt in DOMAIN_TAXONOMIES.values()
    ]
