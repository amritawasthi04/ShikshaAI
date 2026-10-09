"""Baseline taxonomy seeds for skills, domains, and roadmap templates."""
import logging
from typing import List
from app.db.connection import mongo_manager
from app.db.models.core import SkillModel

logger = logging.getLogger("pathai.db.seeds")

INITIAL_SKILLS: List[SkillModel] = [
    SkillModel(
        skill_id="skill_python_basics",
        title="Python Syntax & Data Structures",
        domain="Computer Science",
        description="Core language syntax, lists, dicts, tuples, comprehensions, and functions.",
        prerequisite_skill_ids=[],
        taxonomy_level=1,
    ),
    SkillModel(
        skill_id="skill_recursion",
        title="Recursion & Call Stack",
        domain="Algorithms",
        description="Recursive decomposition, base cases, call frame allocation, and recursion trees.",
        prerequisite_skill_ids=["skill_python_basics"],
        taxonomy_level=2,
    ),
    SkillModel(
        skill_id="skill_big_o",
        title="Asymptotic Time & Space Complexity",
        domain="Algorithms",
        description="Big-O, Big-Theta, Big-Omega analysis, worst-case and amortized complexity.",
        prerequisite_skill_ids=["skill_python_basics"],
        taxonomy_level=2,
    ),
    SkillModel(
        skill_id="skill_binary_search",
        title="Binary Search & Divide-and-Conquer",
        domain="Algorithms",
        description="Logarithmic search in sorted arrays, boundary predicates, invariant maintenance.",
        prerequisite_skill_ids=["skill_recursion", "skill_big_o"],
        taxonomy_level=3,
    ),
    SkillModel(
        skill_id="skill_rest_api",
        title="RESTful API Design & FastAPI",
        domain="Web Development",
        description="HTTP verbs, status codes, OpenAPI schemas, routing, and Pydantic validation.",
        prerequisite_skill_ids=["skill_python_basics"],
        taxonomy_level=2,
    ),
    SkillModel(
        skill_id="skill_vector_search",
        title="Vector Search & Hybrid Embeddings",
        domain="Artificial Intelligence",
        description="Dense vector similarity, sparse lexical matching (SPLADE), RRF ranking, and chunking.",
        prerequisite_skill_ids=["skill_python_basics"],
        taxonomy_level=3,
    ),
]


async def seed_skills() -> int:
    """Seed baseline skill taxonomy into pathai_core."""
    core_db = mongo_manager.get_core_db()
    skills_coll = core_db["skills"]
    inserted = 0

    for skill in INITIAL_SKILLS:
        exists = await skills_coll.find_one({"skill_id": skill.skill_id})
        if not exists:
            await skills_coll.insert_one(skill.to_mongo_doc())
            inserted += 1

    logger.info("Seeded %d initial skills into pathai_core", inserted)
    return inserted
