"""Canonical skill taxonomies and dynamic categorization engine for PathAI."""
import re
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class SkillCategory(BaseModel):
    id: str
    name: str
    icon: str
    description: str
    skills: List[str]
    recommended_for: List[str] = Field(default_factory=list)  # beginner, intermediate, advanced


class DomainTaxonomy(BaseModel):
    domain_id: str
    title: str
    description: str
    categories: List[SkillCategory]


# Comprehensive taxonomy definitions across major software engineering domains
DOMAIN_TAXONOMIES: Dict[str, DomainTaxonomy] = {
    "fullstack": DomainTaxonomy(
        domain_id="fullstack",
        title="Full-Stack Web Development",
        description="Comprehensive web engineering spanning interactive client UIs, resilient server runtimes, databases, and deployment.",
        categories=[
            SkillCategory(
                id="frontend_ui",
                name="Frontend & UI Frameworks",
                icon="layout",
                description="Modern component libraries, reactive state, and client rendering.",
                skills=["React", "Next.js", "TypeScript", "JavaScript", "HTML5 & CSS3", "Tailwind CSS", "Vue.js", "Svelte"],
                recommended_for=["beginner", "intermediate", "advanced"],
            ),
            SkillCategory(
                id="backend_apis",
                name="Backend & API Architecture",
                icon="server",
                description="Server-side logic, routing, REST/GraphQL standards, and microservices.",
                skills=["Node.js", "Express", "REST APIs", "GraphQL", "FastAPI", "NestJS", "WebSockets"],
                recommended_for=["intermediate", "advanced"],
            ),
            SkillCategory(
                id="databases_storage",
                name="Databases & Caching",
                icon="database",
                description="Relational and document storage, in-memory caches, and query tuning.",
                skills=["PostgreSQL", "MongoDB", "Redis", "Prisma ORM", "MySQL", "SQLite", "Supabase"],
                recommended_for=["intermediate", "advanced"],
            ),
            SkillCategory(
                id="devops_tooling",
                name="DevOps, Git & Tooling",
                icon="terminal",
                description="Version control, container virtualization, and cloud delivery pipelines.",
                skills=["Git & GitHub", "Docker", "CI/CD Pipelines", "AWS", "Vercel", "Linux / Bash", "Postman"],
                recommended_for=["beginner", "intermediate", "advanced"],
            ),
        ],
    ),
    "ai_ml": DomainTaxonomy(
        domain_id="ai_ml",
        title="Machine Learning & AI Engineering",
        description="From mathematical foundations and scientific compute to deep neural nets, LLMs, and production MLOps.",
        categories=[
            SkillCategory(
                id="math_languages",
                name="Core Languages & Math",
                icon="cpu",
                description="Vector calculus, linear algebra, Python scientific computing, and statistical inference.",
                skills=["Python", "NumPy", "Linear Algebra", "Calculus & Statistics", "R", "Jupyter Notebooks"],
                recommended_for=["beginner", "intermediate", "advanced"],
            ),
            SkillCategory(
                id="data_processing",
                name="Data Engineering & Analysis",
                icon="database",
                description="Data cleaning, high-performance tabular computation, and visual exploration.",
                skills=["Pandas", "Polars", "SQL / BigQuery", "Matplotlib & Seaborn", "Feature Engineering", "Data Cleaning"],
                recommended_for=["beginner", "intermediate"],
            ),
            SkillCategory(
                id="ml_frameworks",
                name="Machine Learning & Deep Learning",
                icon="brain",
                description="Supervised/unsupervised algorithms, deep neural architectures, and model training.",
                skills=["PyTorch", "Scikit-Learn", "TensorFlow", "Keras", "OpenCV", "XGBoost", "Deep Learning"],
                recommended_for=["intermediate", "advanced"],
            ),
            SkillCategory(
                id="genai_llms",
                name="LLMs & Generative AI",
                icon="sparkles",
                description="Transformer models, prompt engineering, agentic loops, RAG, and vector search.",
                skills=["Hugging Face", "LangChain", "LlamaIndex", "Vector DBs (Chroma/Pinecone)", "Gemini / OpenAI APIs", "Prompt Engineering"],
                recommended_for=["intermediate", "advanced"],
            ),
            SkillCategory(
                id="mlops_infrastructure",
                name="MLOps & Model Deployment",
                icon="cloud",
                description="Model registries, GPU acceleration, Dockerized inference, and experiment tracking.",
                skills=["Docker", "MLflow", "Weights & Biases", "CUDA / GPU Optimization", "FastAPI Serving", "Triton Server"],
                recommended_for=["advanced"],
            ),
        ],
    ),
    "cloud_devops": DomainTaxonomy(
        domain_id="cloud_devops",
        title="Cloud Architecture & DevOps Engineering",
        description="Automated infrastructure, container orchestration, reliable deployment pipelines, and observability.",
        categories=[
            SkillCategory(
                id="os_scripting",
                name="Linux, OS & Scripting",
                icon="terminal",
                description="UNIX fundamentals, process management, shell scripting, and automation.",
                skills=["Linux / Bash", "Shell Scripting", "Python for DevOps", "Networking (DNS/TCP/HTTP)", "SSH & Security"],
                recommended_for=["beginner", "intermediate", "advanced"],
            ),
            SkillCategory(
                id="containers_orchestration",
                name="Containers & Orchestration",
                icon="layers",
                description="Container packaging, clusters, declarative manifests, and service meshes.",
                skills=["Docker", "Kubernetes", "Helm", "Docker Compose", "Containerd", "Istio"],
                recommended_for=["intermediate", "advanced"],
            ),
            SkillCategory(
                id="cloud_providers",
                name="Cloud Platforms",
                icon="cloud",
                description="Managed computing, IAM security, VPC networks, and managed databases.",
                skills=["AWS (EC2, S3, IAM)", "Google Cloud (GCP)", "Microsoft Azure", "Cloudflare", "Serverless"],
                recommended_for=["intermediate", "advanced"],
            ),
            SkillCategory(
                id="iac_automation",
                name="Infrastructure as Code (IaC)",
                icon="code",
                description="Reproducible infrastructure definitions, state management, and configuration drift.",
                skills=["Terraform", "Ansible", "Pulumi", "AWS CloudFormation"],
                recommended_for=["intermediate", "advanced"],
            ),
            SkillCategory(
                id="cicd_observability",
                name="CI/CD & Observability",
                icon="activity",
                description="Automated verification, telemetry, log aggregation, and real-time alerting.",
                skills=["GitHub Actions", "GitLab CI", "Prometheus & Grafana", "ELK / OpenSearch", "ArgoCD", "Datadog"],
                recommended_for=["intermediate", "advanced"],
            ),
        ],
    ),
    "dsa": DomainTaxonomy(
        domain_id="dsa",
        title="Data Structures & Algorithms Specialist",
        description="Core computing foundations, optimal memory layout, algorithmic paradigms, and interview mastery.",
        categories=[
            SkillCategory(
                id="dsa_languages",
                name="Core Languages",
                icon="code",
                description="Systems and general-purpose languages optimized for memory control and fast execution.",
                skills=["C++", "Java", "Python", "Go", "C", "Rust"],
                recommended_for=["beginner", "intermediate", "advanced"],
            ),
            SkillCategory(
                id="linear_structures",
                name="Linear Data Structures",
                icon="layers",
                description="Contiguous arrays, linked nodes, LIFO/FIFO buffers, and hash lookup mechanisms.",
                skills=["Arrays & Strings", "Linked Lists", "Stacks & Queues", "Hash Tables & HashMaps", "Matrix Traversal"],
                recommended_for=["beginner", "intermediate"],
            ),
            SkillCategory(
                id="trees_graphs",
                name="Hierarchical & Graph Structures",
                icon="git-branch",
                description="Tree traversals, binary search trees, priority heaps, and directed/undirected graphs.",
                skills=["Binary Trees", "Binary Search Trees (BST)", "Heaps & Priority Queues", "Graphs (Adjacency List)", "Trie (Prefix Trees)", "Union-Find (DSU)"],
                recommended_for=["intermediate", "advanced"],
            ),
            SkillCategory(
                id="algorithmic_paradigms",
                name="Algorithmic Patterns & Paradigms",
                icon="cpu",
                description="Fundamental problem-solving techniques for optimization and search spaces.",
                skills=["Two Pointers", "Sliding Window", "Binary Search", "Breadth-First Search (BFS)", "Depth-First Search (DFS)", "Dynamic Programming (DP)", "Greedy Algorithms", "Backtracking"],
                recommended_for=["intermediate", "advanced"],
            ),
            SkillCategory(
                id="complexity_internals",
                name="Complexity & Bit Manipulation",
                icon="zap",
                description="Rigorous algorithmic analysis, bitwise masks, and space-time optimization.",
                skills=["Big-O Time & Space Analysis", "Bit Manipulation", "Divide and Conquer", "Recursion & Call Stack Internals"],
                recommended_for=["beginner", "intermediate", "advanced"],
            ),
        ],
    ),
    "mobile": DomainTaxonomy(
        domain_id="mobile",
        title="Mobile App Developer (iOS / Android)",
        description="Responsive touch interfaces, native mobile hardware integrations, offline synchronization, and store distribution.",
        categories=[
            SkillCategory(
                id="mobile_frameworks",
                name="Mobile Frameworks & SDKs",
                icon="smartphone",
                description="Cross-platform runtimes and official platform SDKs for iOS and Android.",
                skills=["React Native", "Flutter", "Swift & SwiftUI", "Kotlin & Jetpack Compose", "TypeScript", "Dart"],
                recommended_for=["beginner", "intermediate", "advanced"],
            ),
            SkillCategory(
                id="mobile_architecture",
                name="State & Mobile Architecture",
                icon="layers",
                description="Predictable state synchronization, dependency injection, and clean architecture.",
                skills=["Redux Toolkit", "Zustand", "Provider / Riverpod", "MVVM Architecture", "Navigation & Deep Linking"],
                recommended_for=["intermediate", "advanced"],
            ),
            SkillCategory(
                id="mobile_storage_network",
                name="Offline Storage & APIs",
                icon="database",
                description="Local on-device persistence, background synchronization, and network caching.",
                skills=["SQLite", "AsyncStorage", "Realm", "REST APIs", "GraphQL", "Firebase / Supabase"],
                recommended_for=["beginner", "intermediate"],
            ),
            SkillCategory(
                id="device_tooling",
                name="Device APIs & App Publishing",
                icon="terminal",
                description="Hardware access (camera, geolocation, push notifications) and release pipelines.",
                skills=["Xcode & CocoaPods", "Android Studio & Gradle", "Push Notifications", "Geolocation & Camera APIs", "App Store & Google Play Deploy", "Fastlane"],
                recommended_for=["intermediate", "advanced"],
            ),
        ],
    ),
    "backend_db": DomainTaxonomy(
        domain_id="backend_db",
        title="Backend Systems & Database Architect",
        description="High-throughput concurrent services, distributed storage, resilient RPC protocols, and caching.",
        categories=[
            SkillCategory(
                id="backend_runtimes",
                name="Core Languages & Runtimes",
                icon="server",
                description="Concurrency models, type safety, memory safety, and thread pools.",
                skills=["Go (Golang)", "Python", "Java", "Node.js", "Rust", "C# (.NET)"],
                recommended_for=["beginner", "intermediate", "advanced"],
            ),
            SkillCategory(
                id="storage_engines",
                name="Databases & Storage Engines",
                icon="database",
                description="ACID transactions, B-tree indexes, LSM trees, document modeling, and key-value caches.",
                skills=["PostgreSQL", "MySQL", "Redis", "MongoDB", "Apache Cassandra", "DynamoDB", "Database Indexing & Query Plans"],
                recommended_for=["intermediate", "advanced"],
            ),
            SkillCategory(
                id="system_design",
                name="Distributed Systems & Messaging",
                icon="git-branch",
                description="Asynchronous events, microservice boundaries, consensus, and rate limiting.",
                skills=["Microservices Architecture", "RESTful APIs", "gRPC & Protocol Buffers", "Apache Kafka", "RabbitMQ", "WebSockets"],
                recommended_for=["intermediate", "advanced"],
            ),
            SkillCategory(
                id="scalability_security",
                name="Scalability, Caching & Auth",
                icon="shield",
                description="Horizontal scaling, partitioning, identity delegation, and fault tolerance.",
                skills=["Docker & Kubernetes", "Database Sharding & Replication", "Caching Strategies (Cache-Aside)", "OAuth2 & JWT", "Load Balancing (Nginx)", "Rate Limiting"],
                recommended_for=["advanced"],
            ),
        ],
    ),
    "cybersecurity": DomainTaxonomy(
        domain_id="cybersecurity",
        title="Cybersecurity & Information Security",
        description="Defensive architecture, network penetration analysis, identity security, and threat mitigation.",
        categories=[
            SkillCategory(
                id="security_foundations",
                name="OS & Networking Foundations",
                icon="terminal",
                description="Packet routing, socket inspection, UNIX permission systems, and system calls.",
                skills=["Linux / Bash", "TCP/IP & Network Protocols", "Wireshark & Packet Analysis", "Python Scripting", "Active Directory"],
                recommended_for=["beginner", "intermediate"],
            ),
            SkillCategory(
                id="app_sec",
                name="Application Security & Web Attacks",
                icon="shield",
                description="Vulnerability discovery, input sanitation, session integrity, and secure coding.",
                skills=["OWASP Top 10", "Burp Suite", "Web Security (XSS, CSRF, SQLi)", "API Security & JWT", "Cryptography & PKI"],
                recommended_for=["intermediate", "advanced"],
            ),
            SkillCategory(
                id="defensive_ops",
                name="Defensive Ops, SIEM & Cloud Security",
                icon="activity",
                description="Log analysis, intrusion detection, cloud posture management, and compliance.",
                skills=["SIEM (Splunk, Elastic)", "SOC Analysis", "Incident Response", "AWS Security", "Docker & Container Hardening"],
                recommended_for=["intermediate", "advanced"],
            ),
        ],
    ),
}


def resolve_domain(
    goal: str = "",
    target_role: str = "",
    background: Optional[str] = None,
) -> str:
    """Intelligently detects domain taxonomy ID from goal, role, and background."""
    text = f"{goal} {target_role} {background or ''}".lower()

    # Rule-based scoring
    scores: Dict[str, int] = {k: 0 for k in DOMAIN_TAXONOMIES.keys()}

    # Keywords for ai_ml
    ai_keywords = ["ai", "machine learning", "ml", "deep learning", "neural", "data science", "llm", "genai", "pytorch", "model", "python data"]
    for kw in ai_keywords:
        if re.search(r"\b" + re.escape(kw) + r"\b", text):
            scores["ai_ml"] += 3

    # Keywords for cloud_devops
    devops_keywords = ["devops", "cloud", "aws", "docker", "kubernetes", "k8s", "terraform", "sre", "ci/cd", "infrastructure", "pipeline"]
    for kw in devops_keywords:
        if re.search(r"\b" + re.escape(kw) + r"\b", text):
            scores["cloud_devops"] += 3

    # Keywords for dsa
    dsa_keywords = [
        "dsa",
        "data structures",
        "algorithms",
        "algorithmic",
        "leetcode",
        "competitive",
        "problem solving",
        "coding interview",
        "interview questions",
        "interview",
        "binary tree",
        "dynamic programming",
        "graph theory",
    ]
    for kw in dsa_keywords:
        if re.search(r"\b" + re.escape(kw) + r"\b", text):
            scores["dsa"] += 3

    # Keywords for mobile
    mobile_keywords = ["mobile", "ios", "android", "flutter", "react native", "swift", "kotlin", "app developer"]
    for kw in mobile_keywords:
        if re.search(r"\b" + re.escape(kw) + r"\b", text):
            scores["mobile"] += 3

    # Keywords for backend_db
    backend_keywords = ["backend", "database", "sql", "postgres", "distributed", "system design", "microservice", "architect", "kafka", "grpc", "high-throughput"]
    for kw in backend_keywords:
        if re.search(r"\b" + re.escape(kw) + r"\b", text):
            scores["backend_db"] += 3

    # Keywords for cybersecurity
    sec_keywords = ["security", "cyber", "infosec", "penetration", "hacking", "ethical hack", "soc", "owasp"]
    for kw in sec_keywords:
        if re.search(r"\b" + re.escape(kw) + r"\b", text):
            scores["cybersecurity"] += 3

    # Keywords for fullstack
    fullstack_keywords = ["fullstack", "full-stack", "web", "frontend", "front-end", "react", "next.js", "nextjs", "javascript", "typescript", "ui", "tailwind"]
    for kw in fullstack_keywords:
        if re.search(r"\b" + re.escape(kw) + r"\b", text):
            scores["fullstack"] += 3

    best_domain = max(scores, key=lambda k: scores[k])
    if scores[best_domain] > 0:
        return best_domain

    # Fallback default: fullstack
    return "fullstack"


def get_skill_categories_for_preferences(
    goal: str = "",
    target_role: str = "",
    experience_level: str = "intermediate",
    background: str = "",
) -> Dict[str, Any]:
    """Generates dynamically organized skill categories tailored to learner preferences.

    Adapts the taxonomy according to:
    - Domain inferred from goal / role / background
    - Experience level (beginner, intermediate, advanced)
    - Custom keywords provided in the inputs
    """
    domain_id = resolve_domain(goal, target_role, background)
    taxonomy = DOMAIN_TAXONOMIES.get(domain_id, DOMAIN_TAXONOMIES["fullstack"])

    exp_normalized = (experience_level or "intermediate").lower()
    if exp_normalized not in ["beginner", "intermediate", "advanced"]:
        exp_normalized = "intermediate"

    categories_payload = []
    all_skills_flat = []
    recommended_skills = []

    for cat in taxonomy.categories:
        # Determine recommended subset for this category based on experience
        rec_for_level = [
            s for s in cat.skills
            if not cat.recommended_for or exp_normalized in cat.recommended_for
        ]
        recommended_skills.extend(rec_for_level[:4])

        categories_payload.append({
            "id": cat.id,
            "name": cat.name,
            "icon": cat.icon,
            "description": cat.description,
            "skills": cat.skills,
            "recommended": rec_for_level,
        })
        all_skills_flat.extend(cat.skills)

    # Return structured payload
    return {
        "domain_id": taxonomy.domain_id,
        "domain_title": taxonomy.title,
        "description": taxonomy.description,
        "target_role": target_role or taxonomy.title,
        "experience_level": exp_normalized,
        "categories": categories_payload,
        "all_skills": sorted(list(set(all_skills_flat))),
        "recommended_skills": sorted(list(set(recommended_skills))),
    }
