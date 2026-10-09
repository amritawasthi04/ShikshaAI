"""Tests for skills taxonomy and dynamic categorization endpoints."""
import pytest
from app.core.curriculum.skill_taxonomy import (
    DOMAIN_TAXONOMIES,
    get_skill_categories_for_preferences,
    resolve_domain,
)


def test_resolve_domain_mapping():
    assert resolve_domain("Become an AI engineer", "ML Researcher") == "ai_ml"
    assert resolve_domain("Learn Docker and Kubernetes", "DevOps Engineer") == "cloud_devops"
    assert resolve_domain("Master LeetCode and graph theory", "DSA Specialist") == "dsa"
    assert resolve_domain("Build iOS and Android apps with React Native", "Mobile Developer") == "mobile"
    assert resolve_domain("High-throughput microservices and SQL", "Backend Architect") == "backend_db"
    assert resolve_domain("Ethical hacking and network defense", "Security Analyst") == "cybersecurity"
    assert resolve_domain("Build modern web apps with React and Next.js", "Fullstack Developer") == "fullstack"


def test_skill_categories_dynamic_adaptation():
    # Test AI / ML intermediate
    ai_res = get_skill_categories_for_preferences(
        goal="Build LLM applications",
        target_role="AI Engineer",
        experience_level="intermediate",
    )
    assert ai_res["domain_id"] == "ai_ml"
    category_names = [c["name"] for c in ai_res["categories"]]
    assert "LLMs & Generative AI" in category_names
    assert "Machine Learning & Deep Learning" in category_names
    assert "PyTorch" in ai_res["all_skills"]
    assert "LangChain" in ai_res["all_skills"]

    # Test DSA beginner
    dsa_res = get_skill_categories_for_preferences(
        goal="Solve coding interview questions",
        target_role="Software Engineer",
        experience_level="beginner",
    )
    assert dsa_res["domain_id"] == "dsa"
    assert any(c["name"] == "Linear Data Structures" for c in dsa_res["categories"])
    assert "Arrays & Strings" in dsa_res["all_skills"]


def test_skills_api_endpoints(client):
    # Test GET endpoint
    res_get = client.get(
        "/api/v1/skills/categories",
        params={
            "goal": "Cloud Infrastructure",
            "target_role": "DevOps Engineer",
            "experience_level": "intermediate",
        },
    )
    assert res_get.status_code == 200
    data = res_get.json()
    assert data["domain_id"] == "cloud_devops"
    assert len(data["categories"]) >= 3
    assert any("Docker" in c["skills"] for c in data["categories"])

    # Test POST endpoint
    res_post = client.post(
        "/api/v1/skills/categories",
        json={
            "goal": "Build mobile applications",
            "target_role": "Mobile Developer (iOS / Android)",
            "experience_level": "beginner",
        },
    )
    assert res_post.status_code == 200
    post_data = res_post.json()
    assert post_data["domain_id"] == "mobile"
    assert any("Flutter" in c["skills"] for c in post_data["categories"])

    # Test Taxonomies list
    res_tax = client.get("/api/v1/skills/taxonomies")
    assert res_tax.status_code == 200
    taxonomies = res_tax.json()
    assert len(taxonomies) >= 5
    assert any(t["domain_id"] == "fullstack" for t in taxonomies)
