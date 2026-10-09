"""Canonical Roadmap.sh datasets and compiler engine."""
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class RoadmapResource(BaseModel):
    title: str
    url: str


class CanonicalNode(BaseModel):
    node_id: str
    title: str
    description: str
    category: str
    parent_id: Optional[str] = None
    prerequisites: List[str] = Field(default_factory=list)
    external_ref: Optional[str] = None
    resources: List[RoadmapResource] = Field(default_factory=list)
    is_optional: bool = False


# Canonical Roadmap definitions matching roadmap.sh structure
CANONICAL_ROADMAPS: Dict[str, Dict[str, Any]] = {
    "python": {
        "topic": "Python Developer",
        "description": "Step by step guide to becoming a Python developer based on roadmap.sh/python",
        "external_ref": "https://roadmap.sh/python",
        "categories": [
            "Language Basics",
            "Data Structures & Algorithms",
            "Object-Oriented Programming",
            "Advanced Python",
            "Ecosystem & Tooling",
            "Frameworks & APIs",
        ],
        "nodes": [
            CanonicalNode(
                node_id="python:basics:variables",
                title="Variables & Data Types",
                description="Understand integers, floats, strings, booleans, and dynamic typing.",
                category="Language Basics",
                prerequisites=[],
                external_ref="https://roadmap.sh/python#variables",
                resources=[
                    RoadmapResource(title="Python Official Tutorial", url="https://docs.python.org/3/tutorial/introduction.html"),
                ],
            ),
            CanonicalNode(
                node_id="python:basics:control_flow",
                title="Control Flow & Conditionals",
                description="Master if/elif/else conditions, match-case, and comparison operators.",
                category="Language Basics",
                prerequisites=["python:basics:variables"],
                external_ref="https://roadmap.sh/python#control-flow",
                resources=[
                    RoadmapResource(title="Control Flow Tools", url="https://docs.python.org/3/tutorial/controlflow.html"),
                ],
            ),
            CanonicalNode(
                node_id="python:basics:loops",
                title="Loops & Iterations",
                description="for loops, while loops, range(), enumerate(), zip(), break, and continue.",
                category="Language Basics",
                prerequisites=["python:basics:control_flow"],
                external_ref="https://roadmap.sh/python#loops",
                resources=[
                    RoadmapResource(title="Python Iteration Docs", url="https://docs.python.org/3/tutorial/controlflow.html#for-statements"),
                ],
            ),
            CanonicalNode(
                node_id="python:basics:functions",
                title="Functions & Scopes",
                description="Function definitions, arguments (*args, **kwargs), return values, and LEGB scope.",
                category="Language Basics",
                prerequisites=["python:basics:loops"],
                external_ref="https://roadmap.sh/python#functions",
                resources=[
                    RoadmapResource(title="Defining Functions", url="https://docs.python.org/3/tutorial/controlflow.html#defining-functions"),
                ],
            ),
            CanonicalNode(
                node_id="python:dsa:builtins",
                title="Built-in Collections",
                description="Lists, Tuples, Sets, and Dictionaries with time complexity trade-offs.",
                category="Data Structures & Algorithms",
                prerequisites=["python:basics:functions"],
                external_ref="https://roadmap.sh/python#data-structures",
                resources=[
                    RoadmapResource(title="Data Structures", url="https://docs.python.org/3/tutorial/datastructures.html"),
                ],
            ),
            CanonicalNode(
                node_id="python:dsa:comprehensions",
                title="Comprehensions & Generators",
                description="List, dict, and set comprehensions alongside memory-efficient generator expressions.",
                category="Data Structures & Algorithms",
                prerequisites=["python:dsa:builtins"],
                external_ref="https://roadmap.sh/python#comprehensions",
                resources=[
                    RoadmapResource(title="List Comprehensions", url="https://docs.python.org/3/tutorial/datastructures.html#list-comprehensions"),
                ],
            ),
            CanonicalNode(
                node_id="python:oop:classes",
                title="Classes, Objects & Attributes",
                description="Object-oriented foundations: classes, __init__, instance vs class attributes, self.",
                category="Object-Oriented Programming",
                prerequisites=["python:dsa:comprehensions"],
                external_ref="https://roadmap.sh/python#oop",
                resources=[
                    RoadmapResource(title="Python Classes", url="https://docs.python.org/3/tutorial/classes.html"),
                ],
            ),
            CanonicalNode(
                node_id="python:oop:inheritance",
                title="Inheritance & Polymorphism",
                description="Subclasses, super(), method resolution order (MRO), and abstract base classes (abc).",
                category="Object-Oriented Programming",
                prerequisites=["python:oop:classes"],
                external_ref="https://roadmap.sh/python#inheritance",
                resources=[
                    RoadmapResource(title="Inheritance Guide", url="https://docs.python.org/3/tutorial/classes.html#inheritance"),
                ],
            ),
            CanonicalNode(
                node_id="python:adv:decorators",
                title="Decorators & First-Class Functions",
                description="Higher-order functions, closures, functools.wraps, and parameterized decorators.",
                category="Advanced Python",
                prerequisites=["python:oop:inheritance"],
                external_ref="https://roadmap.sh/python#decorators",
                resources=[
                    RoadmapResource(title="Primer on Python Decorators", url="https://realpython.com/primer-on-python-decorators/"),
                ],
            ),
            CanonicalNode(
                node_id="python:adv:asyncio",
                title="Concurrency & Asynchronous I/O",
                description="async/await syntax, event loops, tasks, coroutines, and thread safety.",
                category="Advanced Python",
                prerequisites=["python:adv:decorators"],
                external_ref="https://roadmap.sh/python#asyncio",
                resources=[
                    RoadmapResource(title="AsyncIO Documentation", url="https://docs.python.org/3/library/asyncio.html"),
                ],
            ),
            CanonicalNode(
                node_id="python:tooling:packaging",
                title="Package Management & Virtual Envs",
                description="venv, pip, poetry, pyproject.toml, and dependency isolation.",
                category="Ecosystem & Tooling",
                prerequisites=["python:basics:functions"],
                external_ref="https://roadmap.sh/python#package-managers",
                resources=[
                    RoadmapResource(title="Packaging Python Projects", url="https://packaging.python.org/"),
                ],
            ),
            CanonicalNode(
                node_id="python:frameworks:fastapi",
                title="FastAPI & REST APIs",
                description="Modern async APIs with type hinting, Pydantic validation, and OpenAPI documentation.",
                category="Frameworks & APIs",
                prerequisites=["python:adv:asyncio", "python:tooling:packaging"],
                external_ref="https://roadmap.sh/backend#fastapi",
                resources=[
                    RoadmapResource(title="FastAPI Documentation", url="https://fastapi.tiangolo.com/"),
                ],
            ),
        ],
    },
    "ai": {
        "topic": "AI & Agentic Systems Engineer",
        "description": "Step by step guide to mastering Modern AI & Agentic Systems based on roadmap.sh/ai-data-scientist",
        "external_ref": "https://roadmap.sh/ai-data-scientist",
        "categories": [
            "Mathematics & Foundations",
            "Data Science Stack",
            "Machine Learning",
            "Deep Learning & Transformers",
            "LLMs & Multi-Agent Architecture",
        ],
        "nodes": [
            CanonicalNode(
                node_id="ai:foundations:linear_algebra",
                title="Linear Algebra & Matrix Operations",
                description="Vectors, matrices, dot products, eigenvalues, eigenvectors, and dimensionality reduction.",
                category="Mathematics & Foundations",
                prerequisites=[],
                external_ref="https://roadmap.sh/ai-data-scientist#linear-algebra",
                resources=[RoadmapResource(title="Essence of Linear Algebra", url="https://www.3blue1brown.com/topics/linear-algebra")],
            ),
            CanonicalNode(
                node_id="ai:stack:numpy_pandas",
                title="NumPy & Pandas Data Manipulation",
                description="N-dimensional arrays, vectorization, DataFrames, indexing, cleaning, and aggregation.",
                category="Data Science Stack",
                prerequisites=["ai:foundations:linear_algebra"],
                external_ref="https://roadmap.sh/ai-data-scientist#numpy",
                resources=[RoadmapResource(title="NumPy Quickstart", url="https://numpy.org/doc/stable/user/quickstart.html")],
            ),
            CanonicalNode(
                node_id="ai:ml:supervised",
                title="Supervised Learning & Evaluation",
                description="Regression, classification, loss functions, cross-validation, and metrics (F1, ROC-AUC).",
                category="Machine Learning",
                prerequisites=["ai:stack:numpy_pandas"],
                external_ref="https://roadmap.sh/ai-data-scientist#supervised-learning",
                resources=[RoadmapResource(title="Scikit-Learn Guide", url="https://scikit-learn.org/stable/supervised_learning.html")],
            ),
            CanonicalNode(
                node_id="ai:dl:transformers",
                title="Neural Networks & Transformers",
                description="Backpropagation, attention mechanisms (Self-Attention, Multi-Head), and transformer encoders/decoders.",
                category="Deep Learning & Transformers",
                prerequisites=["ai:ml:supervised"],
                external_ref="https://roadmap.sh/ai-data-scientist#transformers",
                resources=[RoadmapResource(title="Attention Is All You Need", url="https://arxiv.org/abs/1706.03762")],
            ),
            CanonicalNode(
                node_id="ai:agents:orchestration",
                title="Multi-Agent Systems & Teacher Brain DAGs",
                description="Decomposition, task planning (TaskPlan), role specialization, and Judge-in-the-loop validation.",
                category="LLMs & Multi-Agent Architecture",
                prerequisites=["ai:dl:transformers"],
                external_ref="https://roadmap.sh/ai-data-scientist#llms",
                resources=[RoadmapResource(title="Building Effective Agents", url="https://www.anthropic.com/research/building-effective-agents")],
            ),
        ],
    },
    "fullstack": {
        "topic": "Full-Stack Web Developer",
        "description": "Step by step guide to modern full-stack web engineering based on roadmap.sh/full-stack",
        "external_ref": "https://roadmap.sh/full-stack",
        "categories": [
            "Frontend Foundations",
            "Modern Frameworks & React",
            "Backend APIs & Serverless",
            "Databases & ORMs",
            "Production, CI/CD & Security",
        ],
        "nodes": [
            CanonicalNode(
                node_id="fullstack:frontend:html_css_ts",
                title="HTML5, Modern CSS & TypeScript Essentials",
                description="Semantic markup, CSS Grid & Flexbox, strict TypeScript typing and interfaces.",
                category="Frontend Foundations",
                prerequisites=[],
                external_ref="https://roadmap.sh/frontend",
                resources=[RoadmapResource(title="MDN Web Docs", url="https://developer.mozilla.org")],
            ),
            CanonicalNode(
                node_id="fullstack:frameworks:react_next",
                title="React 19 & Next.js App Router Architecture",
                description="Server vs Client components, streaming with Suspense, actions, and optimistic UI.",
                category="Modern Frameworks & React",
                prerequisites=["fullstack:frontend:html_css_ts"],
                external_ref="https://nextjs.org/docs",
                resources=[RoadmapResource(title="Next.js App Router Docs", url="https://nextjs.org/docs")],
            ),
            CanonicalNode(
                node_id="fullstack:backend:rest_serverless",
                title="RESTful APIs, Authentication & Fast Middleware",
                description="JWT tokens, session stores, Route Handlers, request validation, and rate limiting.",
                category="Backend APIs & Serverless",
                prerequisites=["fullstack:frameworks:react_next"],
                external_ref="https://roadmap.sh/backend",
                resources=[RoadmapResource(title="Web API Design Best Practices", url="https://restfulapi.net")],
            ),
            CanonicalNode(
                node_id="fullstack:db:sql_nosql",
                title="PostgreSQL, MongoDB & Data Modeling",
                description="Relational modeling, indexing strategies, ACID guarantees, and caching with Redis.",
                category="Databases & ORMs",
                prerequisites=["fullstack:backend:rest_serverless"],
                external_ref="https://roadmap.sh/postgresql-dba",
                resources=[RoadmapResource(title="PostgreSQL Documentation", url="https://www.postgresql.org/docs/")],
            ),
            CanonicalNode(
                node_id="fullstack:devops:production",
                title="Production Deployment, Docker & Monitoring",
                description="Containerization, CI/CD automated test suites, Edge CDN delivery, and OpenTelemetry.",
                category="Production, CI/CD & Security",
                prerequisites=["fullstack:db:sql_nosql"],
                external_ref="https://roadmap.sh/devops",
                resources=[RoadmapResource(title="Docker & Cloud Deployment", url="https://docs.docker.com")],
            ),
        ],
    },
    "dsa": {
        "topic": "Data Structures & Algorithms",
        "description": "Comprehensive guide to algorithmic problem solving and interview mastery based on roadmap.sh/datastructures-and-algorithms",
        "external_ref": "https://roadmap.sh/datastructures-and-algorithms",
        "categories": [
            "Linear Structures",
            "Trees & Graphs",
            "Sorting & Searching",
            "Dynamic Programming",
            "Advanced Graph Algorithms",
        ],
        "nodes": [
            CanonicalNode(
                node_id="dsa:linear:arrays_linked_lists",
                title="Arrays, Strings & Linked Lists",
                description="Two-pointer technique, sliding window patterns, and fast & slow pointer cycle detection.",
                category="Linear Structures",
                prerequisites=[],
                external_ref="https://roadmap.sh/datastructures-and-algorithms",
                resources=[RoadmapResource(title="Sliding Window Patterns", url="https://leetcode.com/explore")],
            ),
            CanonicalNode(
                node_id="dsa:trees:bst_traversals",
                title="Binary Trees, BSTs & Traversals",
                description="Inorder, Preorder, Postorder, Level-order BFS, and tree height balance checks.",
                category="Trees & Graphs",
                prerequisites=["dsa:linear:arrays_linked_lists"],
                external_ref="https://roadmap.sh/datastructures-and-algorithms",
                resources=[RoadmapResource(title="Tree Algorithms", url="https://cp-algorithms.com")],
            ),
            CanonicalNode(
                node_id="dsa:dp:memoization_tabulation",
                title="Dynamic Programming (Memoization & Tabulation)",
                description="Subproblem decomposition, state transitions, 0/1 Knapsack, and Longest Common Subsequence.",
                category="Dynamic Programming",
                prerequisites=["dsa:trees:bst_traversals"],
                external_ref="https://roadmap.sh/datastructures-and-algorithms",
                resources=[RoadmapResource(title="Dynamic Programming Guide", url="https://cp-algorithms.com/dynamic_programming")],
            ),
        ],
    },
}


def get_canonical_roadmap(topic: str) -> Optional[Dict[str, Any]]:
    """Returns canonical roadmap data for a known topic, normalizing aliases."""
    normalized = topic.lower().strip()
    if any(k in normalized for k in ["fullstack", "web", "react", "next", "frontend"]):
        return CANONICAL_ROADMAPS["fullstack"]
    if any(k in normalized for k in ["dsa", "algorithm", "data structure"]):
        return CANONICAL_ROADMAPS["dsa"]
    if any(k in normalized for k in ["ai", "machine learning", "agent", "data science"]):
        return CANONICAL_ROADMAPS["ai"]
    if "python" in normalized:
        return CANONICAL_ROADMAPS["python"]
    # Fallback to fullstack or python depending on keywords
    return CANONICAL_ROADMAPS.get("fullstack", CANONICAL_ROADMAPS["python"])


def compile_canonical_curriculum(
    topic: str = "python",
    assessed_skills: Optional[List[Dict[str, Any]]] = None,
    weekly_hours: float = 5.0,
    learner_background: Optional[str] = None,
) -> Dict[str, Any]:
    """Compiles an adaptive personalized curriculum from canonical roadmap.sh DAG.

    1. Ingests canonical roadmap.sh nodes and prerequisite DAG edges.
    2. Compares against learner diagnostic skills: marks known nodes as completed.
    3. Factors in weekly availability to estimate durations and schedule phases.
    4. Formats milestones matching PathAI RoadmapMilestoneModel schema.
    """
    canonical = get_canonical_roadmap(topic)
    if not canonical:
        canonical = CANONICAL_ROADMAPS["python"]

    assessed_map: Dict[str, float] = {}
    if assessed_skills:
        for s in assessed_skills:
            skill_id = str(s.get("skill_id", "")).lower()
            score = float(s.get("mastery_score", s.get("score", 0.0)))
            assessed_map[skill_id] = score

    nodes: List[CanonicalNode] = canonical["nodes"]
    milestones: List[Dict[str, Any]] = []
    completed_node_ids: set[str] = set()

    # Pass 1: Identify completed nodes based on learner diagnostic skills
    for node in nodes:
        node_key = node.node_id.lower()
        title_words = [w.lower() for w in node.title.split() if len(w) > 3]

        is_mastered = False
        for s_id, score in assessed_map.items():
            if score >= 70.0 and (s_id in node_key or any(tw in s_id for tw in title_words)):
                is_mastered = True
                break

        if is_mastered:
            completed_node_ids.add(node.node_id)

    # Pass 2: Compile milestone items with prerequisite tracking and pace adjustments
    for idx, node in enumerate(nodes):
        is_completed = node.node_id in completed_node_ids
        prereqs_met = all(p in completed_node_ids for p in node.prerequisites)
        status = "completed" if is_completed else ("in_progress" if prereqs_met and idx == 0 else "not_started")

        base_hours = 3.0 if node.category in ["Advanced Python", "Deep Learning & Transformers", "LLMs & Multi-Agent Architecture"] else 2.0
        pace_multiplier = 1.0 if weekly_hours >= 5.0 else 1.2
        est_hours = round(base_hours * pace_multiplier, 1)

        milestones.append({
            "milestone_id": f"ms_{node.node_id.replace(':', '_')}",
            "node_id": node.node_id,
            "parent_id": node.parent_id,
            "title": node.title,
            "description": node.description,
            "category": node.category,
            "prerequisites": node.prerequisites,
            "prerequisite_milestone_ids": [f"ms_{p.replace(':', '_')}" for p in node.prerequisites],
            "is_completed": is_completed,
            "status": status,
            "external_ref": node.external_ref,
            "resources": [{"title": r.title, "url": r.url} for r in node.resources],
            "estimated_hours": est_hours,
        })

    # Group milestones into sequential phases
    categories = canonical["categories"]
    phases: List[Dict[str, Any]] = []
    for cat_idx, cat in enumerate(categories, start=1):
        cat_milestones = [m for m in milestones if m["category"] == cat]
        if cat_milestones:
            phases.append({
                "phase": cat_idx,
                "category": cat,
                "topic": f"{cat} Foundation",
                "milestones": cat_milestones,
            })

    return {
        "canonical_topic": canonical["topic"],
        "canonical_ref": canonical["external_ref"],
        "categories": categories,
        "milestones": milestones,
        "nodes": milestones,
        "phases": phases,
        "prerequisites": [],
        "rationale": f"Curriculum compiled from canonical roadmap.sh ({canonical['topic']}) adapted to {weekly_hours}h/week availability.",
    }

