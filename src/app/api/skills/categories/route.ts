import { NextRequest, NextResponse } from "next/server";

export interface SkillCategoryItem {
  id: string;
  name: string;
  icon: string;
  description: string;
  skills: string[];
  recommended: string[];
}

export interface SkillCategoriesResponse {
  domain_id: string;
  domain_title: string;
  description: string;
  target_role: string;
  experience_level: string;
  categories: SkillCategoryItem[];
  all_skills: string[];
  recommended_skills: string[];
}

// Resilient Edge / Fallback taxonomies for instantaneous responsiveness
const FALLBACK_TAXONOMIES: Record<string, {
  domain_id: string;
  domain_title: string;
  description: string;
  categories: SkillCategoryItem[];
}> = {
  fullstack: {
    domain_id: "fullstack",
    domain_title: "Full-Stack Web Development",
    description: "Modern component interfaces, server-side APIs, database systems, and deployment workflows.",
    categories: [
      {
        id: "frontend_ui",
        name: "Frontend & UI Frameworks",
        icon: "layout",
        description: "Modern component libraries, reactive state, and client rendering.",
        skills: ["React", "Next.js", "TypeScript", "JavaScript", "HTML5 & CSS3", "Tailwind CSS", "Vue.js", "Svelte"],
        recommended: ["React", "Next.js", "TypeScript", "Tailwind CSS"],
      },
      {
        id: "backend_apis",
        name: "Backend & API Architecture",
        icon: "server",
        description: "Server-side logic, routing, REST/GraphQL standards, and microservices.",
        skills: ["Node.js", "Express", "REST APIs", "GraphQL", "FastAPI", "NestJS", "WebSockets"],
        recommended: ["Node.js", "REST APIs", "FastAPI"],
      },
      {
        id: "databases_storage",
        name: "Databases & Caching",
        icon: "database",
        description: "Relational and document storage, in-memory caches, and query tuning.",
        skills: ["PostgreSQL", "MongoDB", "Redis", "Prisma ORM", "MySQL", "SQLite", "Supabase"],
        recommended: ["PostgreSQL", "MongoDB", "Redis"],
      },
      {
        id: "devops_tooling",
        name: "DevOps, Git & Tooling",
        icon: "terminal",
        description: "Version control, container virtualization, and cloud delivery pipelines.",
        skills: ["Git & GitHub", "Docker", "CI/CD Pipelines", "AWS", "Vercel", "Linux / Bash", "Postman"],
        recommended: ["Git & GitHub", "Docker", "AWS"],
      },
    ],
  },
  ai_ml: {
    domain_id: "ai_ml",
    domain_title: "Machine Learning & AI Engineering",
    description: "From mathematical foundations and scientific compute to deep neural nets, LLMs, and production MLOps.",
    categories: [
      {
        id: "math_languages",
        name: "Core Languages & Math",
        icon: "cpu",
        description: "Vector calculus, linear algebra, Python scientific computing, and statistical inference.",
        skills: ["Python", "NumPy", "Linear Algebra", "Calculus & Statistics", "R", "Jupyter Notebooks"],
        recommended: ["Python", "NumPy", "Linear Algebra"],
      },
      {
        id: "data_processing",
        name: "Data Engineering & Analysis",
        icon: "database",
        description: "Data cleaning, high-performance tabular computation, and visual exploration.",
        skills: ["Pandas", "Polars", "SQL / BigQuery", "Matplotlib & Seaborn", "Feature Engineering", "Data Cleaning"],
        recommended: ["Pandas", "SQL / BigQuery", "Matplotlib & Seaborn"],
      },
      {
        id: "ml_frameworks",
        name: "Machine Learning & Deep Learning",
        icon: "brain",
        description: "Supervised/unsupervised algorithms, deep neural architectures, and model training.",
        skills: ["PyTorch", "Scikit-Learn", "TensorFlow", "Keras", "OpenCV", "XGBoost", "Deep Learning"],
        recommended: ["PyTorch", "Scikit-Learn", "TensorFlow"],
      },
      {
        id: "genai_llms",
        name: "LLMs & Generative AI",
        icon: "sparkles",
        description: "Transformer models, prompt engineering, agentic loops, RAG, and vector search.",
        skills: ["Hugging Face", "LangChain", "LlamaIndex", "Vector DBs (Chroma/Pinecone)", "Gemini / OpenAI APIs", "Prompt Engineering"],
        recommended: ["Hugging Face", "LangChain", "Vector DBs (Chroma/Pinecone)"],
      },
      {
        id: "mlops_infrastructure",
        name: "MLOps & Model Deployment",
        icon: "cloud",
        description: "Model registries, GPU acceleration, Dockerized inference, and experiment tracking.",
        skills: ["Docker", "MLflow", "Weights & Biases", "CUDA / GPU Optimization", "FastAPI Serving", "Triton Server"],
        recommended: ["Docker", "MLflow", "FastAPI Serving"],
      },
    ],
  },
  cloud_devops: {
    domain_id: "cloud_devops",
    domain_title: "Cloud Architecture & DevOps Engineering",
    description: "Automated infrastructure, container orchestration, reliable deployment pipelines, and observability.",
    categories: [
      {
        id: "os_scripting",
        name: "Linux, OS & Scripting",
        icon: "terminal",
        description: "UNIX fundamentals, process management, shell scripting, and automation.",
        skills: ["Linux / Bash", "Shell Scripting", "Python for DevOps", "Networking (DNS/TCP/HTTP)", "SSH & Security"],
        recommended: ["Linux / Bash", "Shell Scripting", "Networking (DNS/TCP/HTTP)"],
      },
      {
        id: "containers_orchestration",
        name: "Containers & Orchestration",
        icon: "layers",
        description: "Container packaging, clusters, declarative manifests, and service meshes.",
        skills: ["Docker", "Kubernetes", "Helm", "Docker Compose", "Containerd", "Istio"],
        recommended: ["Docker", "Kubernetes", "Helm"],
      },
      {
        id: "cloud_providers",
        name: "Cloud Platforms",
        icon: "cloud",
        description: "Managed computing, IAM security, VPC networks, and managed databases.",
        skills: ["AWS (EC2, S3, IAM)", "Google Cloud (GCP)", "Microsoft Azure", "Cloudflare", "Serverless"],
        recommended: ["AWS (EC2, S3, IAM)", "Google Cloud (GCP)"],
      },
      {
        id: "iac_automation",
        name: "Infrastructure as Code (IaC)",
        icon: "code",
        description: "Reproducible infrastructure definitions, state management, and configuration drift.",
        skills: ["Terraform", "Ansible", "Pulumi", "AWS CloudFormation"],
        recommended: ["Terraform", "Ansible"],
      },
      {
        id: "cicd_observability",
        name: "CI/CD & Observability",
        icon: "activity",
        description: "Automated verification, telemetry, log aggregation, and real-time alerting.",
        skills: ["GitHub Actions", "GitLab CI", "Prometheus & Grafana", "ELK / OpenSearch", "ArgoCD", "Datadog"],
        recommended: ["GitHub Actions", "Prometheus & Grafana"],
      },
    ],
  },
  dsa: {
    domain_id: "dsa",
    domain_title: "Data Structures & Algorithms Specialist",
    description: "Core computing foundations, optimal memory layout, algorithmic paradigms, and interview mastery.",
    categories: [
      {
        id: "dsa_languages",
        name: "Core Languages",
        icon: "code",
        description: "Systems and general-purpose languages optimized for memory control and fast execution.",
        skills: ["C++", "Java", "Python", "Go", "C", "Rust"],
        recommended: ["C++", "Java", "Python"],
      },
      {
        id: "linear_structures",
        name: "Linear Data Structures",
        icon: "layers",
        description: "Contiguous arrays, linked nodes, LIFO/FIFO buffers, and hash lookup mechanisms.",
        skills: ["Arrays & Strings", "Linked Lists", "Stacks & Queues", "Hash Tables & HashMaps", "Matrix Traversal"],
        recommended: ["Arrays & Strings", "Linked Lists", "Stacks & Queues", "Hash Tables & HashMaps"],
      },
      {
        id: "trees_graphs",
        name: "Hierarchical & Graph Structures",
        icon: "git-branch",
        description: "Tree traversals, binary search trees, priority heaps, and directed/undirected graphs.",
        skills: ["Binary Trees", "Binary Search Trees (BST)", "Heaps & Priority Queues", "Graphs (Adjacency List)", "Trie (Prefix Trees)", "Union-Find (DSU)"],
        recommended: ["Binary Trees", "Binary Search Trees (BST)", "Heaps & Priority Queues", "Graphs (Adjacency List)"],
      },
      {
        id: "algorithmic_paradigms",
        name: "Algorithmic Patterns & Paradigms",
        icon: "cpu",
        description: "Fundamental problem-solving techniques for optimization and search spaces.",
        skills: ["Two Pointers", "Sliding Window", "Binary Search", "Breadth-First Search (BFS)", "Depth-First Search (DFS)", "Dynamic Programming (DP)", "Greedy Algorithms", "Backtracking"],
        recommended: ["Two Pointers", "Sliding Window", "Binary Search", "Dynamic Programming (DP)"],
      },
      {
        id: "complexity_internals",
        name: "Complexity & Bit Manipulation",
        icon: "zap",
        description: "Rigorous algorithmic analysis, bitwise masks, and space-time optimization.",
        skills: ["Big-O Time & Space Analysis", "Bit Manipulation", "Divide and Conquer", "Recursion & Call Stack Internals"],
        recommended: ["Big-O Time & Space Analysis", "Recursion & Call Stack Internals"],
      },
    ],
  },
  mobile: {
    domain_id: "mobile",
    domain_title: "Mobile App Developer (iOS / Android)",
    description: "Responsive touch interfaces, native mobile hardware integrations, offline synchronization, and store distribution.",
    categories: [
      {
        id: "mobile_frameworks",
        name: "Mobile Frameworks & SDKs",
        icon: "smartphone",
        description: "Cross-platform runtimes and official platform SDKs for iOS and Android.",
        skills: ["React Native", "Flutter", "Swift & SwiftUI", "Kotlin & Jetpack Compose", "TypeScript", "Dart"],
        recommended: ["React Native", "Flutter", "Swift & SwiftUI"],
      },
      {
        id: "mobile_architecture",
        name: "State & Mobile Architecture",
        icon: "layers",
        description: "Predictable state synchronization, dependency injection, and clean architecture.",
        skills: ["Redux Toolkit", "Zustand", "Provider / Riverpod", "MVVM Architecture", "Navigation & Deep Linking"],
        recommended: ["Redux Toolkit", "Zustand", "MVVM Architecture"],
      },
      {
        id: "mobile_storage_network",
        name: "Offline Storage & APIs",
        icon: "database",
        description: "Local on-device persistence, background synchronization, and network caching.",
        skills: ["SQLite", "AsyncStorage", "Realm", "REST APIs", "GraphQL", "Firebase / Supabase"],
        recommended: ["SQLite", "Firebase / Supabase", "REST APIs"],
      },
      {
        id: "device_tooling",
        name: "Device APIs & App Publishing",
        icon: "terminal",
        description: "Hardware access (camera, geolocation, push notifications) and release pipelines.",
        skills: ["Xcode & CocoaPods", "Android Studio & Gradle", "Push Notifications", "Geolocation & Camera APIs", "App Store & Google Play Deploy", "Fastlane"],
        recommended: ["Push Notifications", "Xcode & CocoaPods", "Android Studio & Gradle"],
      },
    ],
  },
  backend_db: {
    domain_id: "backend_db",
    domain_title: "Backend Systems & Database Architect",
    description: "High-throughput concurrent services, distributed storage, resilient RPC protocols, and caching.",
    categories: [
      {
        id: "backend_runtimes",
        name: "Core Languages & Runtimes",
        icon: "server",
        description: "Concurrency models, type safety, memory safety, and thread pools.",
        skills: ["Go (Golang)", "Python", "Java", "Node.js", "Rust", "C# (.NET)"],
        recommended: ["Go (Golang)", "Python", "Node.js"],
      },
      {
        id: "storage_engines",
        name: "Databases & Storage Engines",
        icon: "database",
        description: "ACID transactions, B-tree indexes, LSM trees, document modeling, and key-value caches.",
        skills: ["PostgreSQL", "MySQL", "Redis", "MongoDB", "Apache Cassandra", "DynamoDB", "Database Indexing & Query Plans"],
        recommended: ["PostgreSQL", "Redis", "MongoDB"],
      },
      {
        id: "system_design",
        name: "Distributed Systems & Messaging",
        icon: "git-branch",
        description: "Asynchronous events, microservice boundaries, consensus, and rate limiting.",
        skills: ["Microservices Architecture", "RESTful APIs", "gRPC & Protocol Buffers", "Apache Kafka", "RabbitMQ", "WebSockets"],
        recommended: ["Microservices Architecture", "gRPC & Protocol Buffers", "Apache Kafka"],
      },
      {
        id: "scalability_security",
        name: "Scalability, Caching & Auth",
        icon: "shield",
        description: "Horizontal scaling, partitioning, identity delegation, and fault tolerance.",
        skills: ["Docker & Kubernetes", "Database Sharding & Replication", "Caching Strategies (Cache-Aside)", "OAuth2 & JWT", "Load Balancing (Nginx)", "Rate Limiting"],
        recommended: ["Caching Strategies (Cache-Aside)", "Docker & Kubernetes", "OAuth2 & JWT"],
      },
    ],
  },
  cybersecurity: {
    domain_id: "cybersecurity",
    domain_title: "Cybersecurity & Information Security",
    description: "Defensive architecture, network penetration analysis, identity security, and threat mitigation.",
    categories: [
      {
        id: "security_foundations",
        name: "OS & Networking Foundations",
        icon: "terminal",
        description: "Packet routing, socket inspection, UNIX permission systems, and system calls.",
        skills: ["Linux / Bash", "TCP/IP & Network Protocols", "Wireshark & Packet Analysis", "Python Scripting", "Active Directory"],
        recommended: ["Linux / Bash", "TCP/IP & Network Protocols", "Wireshark & Packet Analysis"],
      },
      {
        id: "app_sec",
        name: "Application Security & Web Attacks",
        icon: "shield",
        description: "Vulnerability discovery, input sanitation, session integrity, and secure coding.",
        skills: ["OWASP Top 10", "Burp Suite", "Web Security (XSS, CSRF, SQLi)", "API Security & JWT", "Cryptography & PKI"],
        recommended: ["OWASP Top 10", "Burp Suite", "Web Security (XSS, CSRF, SQLi)"],
      },
      {
        id: "defensive_ops",
        name: "Defensive Ops, SIEM & Cloud Security",
        icon: "activity",
        description: "Log analysis, intrusion detection, cloud posture management, and compliance.",
        skills: ["SIEM (Splunk, Elastic)", "SOC Analysis", "Incident Response", "AWS Security", "Docker & Container Hardening"],
        recommended: ["SIEM (Splunk, Elastic)", "SOC Analysis", "Docker & Container Hardening"],
      },
    ],
  },
};

function resolveFallbackDomain(goal: string, targetRole: string, background?: string): string {
  const text = `${goal} ${targetRole} ${background || ""}`.toLowerCase();
  if (/ai|machine learning|ml|deep learning|neural|data science|llm|genai|pytorch|model/.test(text)) {
    return "ai_ml";
  }
  if (/devops|cloud|aws|docker|kubernetes|k8s|terraform|sre|ci\/cd|infrastructure/.test(text)) {
    return "cloud_devops";
  }
  if (/dsa|data structures|algorithms|algorithmic|leetcode|competitive|interview|graph/.test(text)) {
    return "dsa";
  }
  if (/mobile|ios|android|flutter|react native|swift|kotlin/.test(text)) {
    return "mobile";
  }
  if (/backend|database|sql|postgres|distributed|system design|microservice|kafka/.test(text)) {
    return "backend_db";
  }
  if (/security|cyber|infosec|penetration|hacking|owasp/.test(text)) {
    return "cybersecurity";
  }
  return "fullstack";
}

function getFallbackPayload(
  goal: string,
  targetRole: string,
  experienceLevel: string = "intermediate",
  background: string = ""
): SkillCategoriesResponse {
  const domainKey = resolveFallbackDomain(goal, targetRole, background);
  const tax = FALLBACK_TAXONOMIES[domainKey] || FALLBACK_TAXONOMIES["fullstack"];

  const allSkills = Array.from(new Set(tax.categories.flatMap((c) => c.skills))).sort();
  const recommendedSkills = Array.from(new Set(tax.categories.flatMap((c) => c.recommended))).sort();

  return {
    domain_id: tax.domain_id,
    domain_title: tax.domain_title,
    description: tax.description,
    target_role: targetRole || tax.domain_title,
    experience_level: experienceLevel,
    categories: tax.categories,
    all_skills: allSkills,
    recommended_skills: recommendedSkills,
  };
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const goal = searchParams.get("goal") || "";
  const targetRole = searchParams.get("targetRole") || searchParams.get("target_role") || "";
  const experienceLevel = searchParams.get("experienceLevel") || searchParams.get("experience_level") || "intermediate";
  const background = searchParams.get("background") || "";

  const backendUrl = process.env.BACKEND_URL || "http://127.0.0.1:8000";

  try {
    const query = new URLSearchParams({
      goal,
      target_role: targetRole,
      experience_level: experienceLevel,
      background,
    }).toString();

    const res = await fetch(`${backendUrl}/api/v1/skills/categories?${query}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      signal: AbortSignal.timeout(3500),
    });

    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }
  } catch (err) {
    // Backend offline/timeout - fallback gracefully
    console.warn("Skill categories fallback invoked:", err);
  }

  // Graceful fallback to client taxonomy
  return NextResponse.json(getFallbackPayload(goal, targetRole, experienceLevel, background));
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      goal = "",
      targetRole = "",
      target_role = "",
      experienceLevel = "intermediate",
      experience_level = "intermediate",
      background = "",
    } = body;

    const role = targetRole || target_role || "";
    const level = experienceLevel || experience_level || "intermediate";
    const backendUrl = process.env.BACKEND_URL || "http://127.0.0.1:8000";

    try {
      const res = await fetch(`${backendUrl}/api/v1/skills/categories`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          goal,
          target_role: role,
          experience_level: level,
          background,
        }),
        signal: AbortSignal.timeout(3500),
      });

      if (res.ok) {
        const data = await res.json();
        return NextResponse.json(data);
      }
    } catch (err) {
      console.warn("Skill categories POST fallback invoked:", err);
    }

    return NextResponse.json(getFallbackPayload(goal, role, level, background));
  } catch (err) {
    console.error("Error in skill categories route:", err);
    return NextResponse.json(getFallbackPayload("", "", "intermediate", ""));
  }
}
