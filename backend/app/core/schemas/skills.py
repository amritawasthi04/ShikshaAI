"""Schemas for skill taxonomy, dynamic categorization, and suggestions."""
from typing import List, Optional
from pydantic import Field
from app.core.schemas.base import BaseSchema


class SkillCategoryItem(BaseSchema):
    id: str
    name: str
    icon: str
    description: str
    skills: List[str]
    recommended: List[str] = Field(default_factory=list)


class SkillCategoriesResponse(BaseSchema):
    domain_id: str
    domain_title: str
    description: str
    target_role: str
    experience_level: str
    categories: List[SkillCategoryItem]
    all_skills: List[str]
    recommended_skills: List[str]


class SkillCategoriesRequest(BaseSchema):
    goal: Optional[str] = ""
    target_role: Optional[str] = ""
    experience_level: Optional[str] = "intermediate"
    background: Optional[str] = ""
