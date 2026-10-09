import {
  PathBuilderState,
  GeneratedRoadmap,
  RoadmapPhase,
  RoadmapLesson,
} from "@/types/roadmap";
import { getDetailedLessonModule } from "@/data/learningModules";

/**
 * Deterministic rules-based roadmap generator.
 * Tailors curriculum phases, milestones, lessons, and prerequisites
 * based on user goals, experience level, known skills, and learning style.
 */
export function generatePersonalizedRoadmap(state: PathBuilderState): GeneratedRoadmap {
  const goalLower = (state.goal || state.targetRole || "").toLowerCase();
  const level = state.experienceLevel || "intermediate";
  const known = (state.knownSkills || []).map((s) => s.toLowerCase());
  const isBeginner = level === "beginner" || state.isCompleteBeginner;
  const isAdvanced = level === "advanced";
  const learningStyle = state.learningStyle || "balanced";

  const skippedTopics: string[] = [];

  // Determine domain archetype
  let domain: "fullstack" | "dsa" | "aiml" | "cloud" | "mobile" | "backend" | "general" = "general";
  if (goalLower.includes("full") || goalLower.includes("web") || goalLower.includes("react") || goalLower.includes("next")) {
    domain = "fullstack";
  } else if (goalLower.includes("dsa") || goalLower.includes("algorithm") || goalLower.includes("data structure") || goalLower.includes("interview")) {
    domain = "dsa";
  } else if (goalLower.includes("machine") || goalLower.includes("ai") || goalLower.includes("ml") || goalLower.includes("data scientist")) {
    domain = "aiml";
  } else if (goalLower.includes("cloud") || goalLower.includes("devops") || goalLower.includes("kubernetes") || goalLower.includes("aws")) {
    domain = "cloud";
  } else if (goalLower.includes("mobile") || goalLower.includes("ios") || goalLower.includes("android") || goalLower.includes("native")) {
    domain = "mobile";
  } else if (goalLower.includes("backend") || goalLower.includes("database") || goalLower.includes("system design") || goalLower.includes("api")) {
    domain = "backend";
  }

  // Generate 5 Ordered Phases based on Domain & Inputs
  const phases: RoadmapPhase[] = buildDomainPhases(domain, state, isBeginner, isAdvanced, known, skippedTopics, learningStyle);

  // Automatically enrich every milestone with domain-specific pedagogical detail
  for (const phase of phases) {
    for (const lesson of phase.lessons) {
      const detailed = getDetailedLessonModule(lesson, phase);
      lesson.keyObjectives = detailed.keyObjectives;
      lesson.codeSnippet = detailed.codeBlueprint.code;
      lesson.resources = detailed.resources.map((r) => ({
        title: r.title,
        url: r.url,
        type: r.type,
      }));
    }
  }

  // Recalculate completions, current lesson and locked statuses
  let totalLessons = 0;
  let completedLessons = 0;
  let foundCurrent = false;
  let currentLesson: RoadmapLesson | null = null;
  let currentPhase: RoadmapPhase | null = null;

  for (const phase of phases) {
    let phaseCompleted = 0;
    for (const lesson of phase.lessons) {
      totalLessons++;
      if (lesson.completed) {
        completedLessons++;
        phaseCompleted++;
        lesson.status = "completed";
      } else if (!foundCurrent) {
        lesson.status = "current";
        lesson.completed = false;
        foundCurrent = true;
        currentLesson = lesson;
        currentPhase = phase;
      } else {
        lesson.status = phase.status === "completed" ? "upcoming" : "locked";
        lesson.completed = false;
      }
    }

    phase.lessonsCount = phase.lessons.length;
    phase.completedLessons = phaseCompleted;

    if (phaseCompleted === phase.lessons.length && phase.lessons.length > 0) {
      phase.status = "completed";
    } else if (phaseCompleted > 0 || (currentPhase && currentPhase.id === phase.id)) {
      phase.status = "in-progress";
      if (!currentPhase) currentPhase = phase;
    } else {
      phase.status = "locked";
    }
  }

  const progressPercent = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  return {
    id: "rdm_" + (state.goal || "track").toLowerCase().replace(/[^a-z0-9]/g, "_"),
    title: state.goal || state.targetRole || "Personalized Engineering Roadmap",
    targetRole: state.targetRole || state.goal || "Software Engineer",
    experienceLevel: state.experienceLevel || "Intermediate",
    weeklyPace: state.weeklyPace || "Recommended",
    targetDuration: state.targetDuration || "3 Months",
    learningStyle: state.learningStyle || "Balanced",
    knownSkills: state.knownSkills || [],
    skippedTopics,
    createdAt: "2026-10-09T00:00:00.000Z",
    phases,
    totalLessons,
    completedLessons,
    progressPercent,
    currentLesson,
    currentPhase: currentPhase || phases[0],
  };
}

function buildDomainPhases(
  domain: string,
  state: PathBuilderState,
  isBeginner: boolean,
  isAdvanced: boolean,
  known: string[],
  skipped: string[],
  learningStyle: string
): RoadmapPhase[] {
  switch (domain) {
    case "dsa":
      return buildDSAPhases(isBeginner, isAdvanced, known, skipped);
    case "aiml":
      return buildAIMLPhases(isBeginner, isAdvanced, known, skipped);
    case "cloud":
      return buildCloudPhases(isBeginner, isAdvanced, known, skipped);
    case "mobile":
      return buildMobilePhases(isBeginner, isAdvanced, known, skipped);
    case "backend":
      return buildBackendPhases(isBeginner, isAdvanced, known, skipped);
    case "fullstack":
    default:
      return buildFullStackPhases(isBeginner, isAdvanced, known, skipped, learningStyle);
  }
}

// -------------------------------------------------------------
// 1. FULL-STACK WEB ENGINEERING BLUEPRINT
// -------------------------------------------------------------
function buildFullStackPhases(
  isBeginner: boolean,
  isAdvanced: boolean,
  known: string[],
  skipped: string[],
  learningStyle: string
): RoadmapPhase[] {
  const hasJS = known.includes("javascript") || known.includes("typescript");
  const hasReact = known.includes("react") || known.includes("next.js");
  const hasSQL = known.includes("sql") || known.includes("postgresql");

  if (hasJS) skipped.push("JavaScript Basics & ES6 Syntax");
  if (hasReact && isAdvanced) skipped.push("React JSX & Component Props");
  if (hasSQL) skipped.push("Basic SQL SELECT & INSERT Queries");

  return [
    {
      id: 1,
      phaseNumber: 1,
      phaseName: "Foundation",
      title: "Phase 1: Web Protocols & Architecture",
      description: "HTTP/HTTPS lifecycle, DOM mechanics, modern runtime compilation, and TypeScript foundations.",
      status: (hasJS && isAdvanced) ? "completed" : "completed",
      lessonsCount: 4,
      completedLessons: (hasJS || isAdvanced) ? 4 : 2,
      lessons: [
        {
          id: "1.1",
          title: "HTTP/3, TLS & Browser Render Tree Mechanics",
          description: "Explore request pipelines, DNS resolution, and critical rendering path optimization.",
          duration: "30m",
          type: "concept",
          completed: true,
          status: "completed",
        },
        {
          id: "1.2",
          title: "Modern TypeScript Generics & Type Narrowing",
          description: "Master strict utility types, discriminated unions, and compiler options.",
          duration: "45m",
          type: "exercise",
          completed: true,
          status: "completed",
        },
        {
          id: "1.3",
          title: "App Router Directory Structure & Server Components",
          description: "Understand React Server Component (RSC) wire formats and layout boundaries.",
          duration: "40m",
          type: "concept",
          completed: isAdvanced || hasJS,
          status: isAdvanced || hasJS ? "completed" : "current",
        },
        {
          id: "1.4",
          title: "Foundations Checkpoint: Type-Safe Request Handling",
          description: "Hands-on verification quiz on type safety and component boundaries.",
          duration: "25m",
          type: "quiz",
          completed: isAdvanced || hasJS,
          status: isAdvanced || hasJS ? "completed" : "upcoming",
        },
      ],
    },
    {
      id: 2,
      phaseNumber: 2,
      phaseName: "Core Skills",
      title: "Phase 2: Component State & Design Systems",
      description: "Atomic design tokens, Tailwind CSS styling systems, form actions, and client state orchestration.",
      status: isAdvanced ? "completed" : "in-progress",
      lessonsCount: 4,
      completedLessons: isAdvanced ? 4 : 2,
      lessons: [
        {
          id: "2.1",
          title: "Design Tokens & Tailwind CSS Architecture",
          description: "Configure consistent theme palettes, CSS variables, and fluid typography tokens.",
          duration: "35m",
          type: "concept",
          completed: isAdvanced || known.includes("tailwind css"),
          status: isAdvanced || known.includes("tailwind css") ? "completed" : "current",
        },
        {
          id: "2.2",
          title: "Complex Form State Management & Validation",
          description: "Implement accessible inputs, live validation schemas, and password masking.",
          duration: "50m",
          type: "exercise",
          completed: isAdvanced,
          status: isAdvanced ? "completed" : "upcoming",
        },
        {
          id: "2.3",
          title: "Micro-Animations with Framer Motion & GSAP",
          description: "Orchestrate layout transitions, staggered reveals, and reduced-motion fallbacks.",
          duration: "40m",
          type: "exercise",
          completed: false,
          status: "upcoming",
        },
        {
          id: "2.4",
          title: "Core Skills Assessment: Interactive Auth Card",
          description: "Build an accessible, animated authentication system matching design specs.",
          duration: "35m",
          type: "quiz",
          completed: false,
          status: "upcoming",
        },
      ],
    },
    {
      id: 3,
      phaseNumber: 3,
      phaseName: "Advanced Topics",
      title: "Phase 3: Server Actions & Full-Stack Data Flow",
      description: "Mutating data with server functions, optimistic UI updates, and backend API integration.",
      status: "locked",
      lessonsCount: 4,
      completedLessons: 0,
      lessons: [
        {
          id: "3.1",
          title: "Server Actions Deep Dive & Security Model",
          description: "Protect against CSRF, validate server payloads, and manage revalidation tags.",
          duration: "45m",
          type: "concept",
          completed: false,
          status: "locked",
        },
        {
          id: "3.2",
          title: "Optimistic UI with React useOptimistic",
          description: "Provide zero-latency feedback for mutations before server responses settle.",
          duration: "50m",
          type: "exercise",
          completed: false,
          status: "locked",
        },
        {
          id: "3.3",
          title: "Data Caching & Partial Prerendering (PPR)",
          description: "Fine-tune edge caching headers, incremental static generation, and suspense streams.",
          duration: "40m",
          type: "concept",
          completed: false,
          status: "locked",
        },
        {
          id: "3.4",
          title: "Advanced Assessment: Full-Stack Mutation Pipeline",
          description: "Construct a real-time reactive data pipeline with error rollback.",
          duration: "40m",
          type: "quiz",
          completed: false,
          status: "locked",
        },
      ],
    },
    {
      id: 4,
      phaseNumber: 4,
      phaseName: "Practice & Projects",
      title: "Phase 4: Database Integration & Real-World Modules",
      description: "Relational modeling with PostgreSQL, Prisma schema design, and production querying.",
      status: "locked",
      lessonsCount: 4,
      completedLessons: 0,
      lessons: [
        {
          id: "4.1",
          title: "PostgreSQL Schema Design & Prisma ORM",
          description: "Model 1-to-many and many-to-many relations with foreign keys and migrations.",
          duration: "45m",
          type: "concept",
          completed: false,
          status: "locked",
        },
        {
          id: "4.2",
          title: "Database Indexing & Query Performance",
          description: "Analyze query execution plans, B-tree indexes, and connection pool sizing.",
          duration: "40m",
          type: "exercise",
          completed: false,
          status: "locked",
        },
        {
          id: "4.3",
          title: "End-to-End API Integration & Authentication",
          description: "JWT sessions, HTTP-only secure cookies, and role-based access control.",
          duration: "55m",
          type: "project",
          completed: false,
          status: "locked",
        },
        {
          id: "4.4",
          title: "Practice Milestone: Multi-Tenant Workspace API",
          description: "Complete full CRUD backend test suite with automated seed fixtures.",
          duration: "45m",
          type: "quiz",
          completed: false,
          status: "locked",
        },
      ],
    },
    {
      id: 5,
      phaseNumber: 5,
      phaseName: "Capstone & Production",
      title: "Phase 5: Capstone Deployment & Performance Tuning",
      description: "Edge network deployment, bundle optimization, CI/CD pipelines, and monitoring.",
      status: "locked",
      lessonsCount: 3,
      completedLessons: 0,
      lessons: [
        {
          id: "5.1",
          title: "Core Web Vitals & Bundle Analyzer Audits",
          description: "Eliminate layout shifts, optimize LCP/INP, and dynamic chunk imports.",
          duration: "40m",
          type: "exercise",
          completed: false,
          status: "locked",
        },
        {
          id: "5.2",
          title: "CI/CD Pipeline with GitHub Actions & Vercel",
          description: "Automate linting, type checks, integration tests, and preview deployments.",
          duration: "45m",
          type: "exercise",
          completed: false,
          status: "locked",
        },
        {
          id: "5.3",
          title: "Production Capstone Project Evaluation",
          description: "Deploy a production-ready application and receive automated rubric grading.",
          duration: "60m",
          type: "project",
          completed: false,
          status: "locked",
        },
      ],
    },
  ];
}

// -------------------------------------------------------------
// 2. DATA STRUCTURES & ALGORITHMS BLUEPRINT
// -------------------------------------------------------------
function buildDSAPhases(
  isBeginner: boolean,
  isAdvanced: boolean,
  known: string[],
  skipped: string[]
): RoadmapPhase[] {
  return [
    {
      id: 1,
      phaseNumber: 1,
      phaseName: "Foundation",
      title: "Phase 1: Asymptotic Complexity & Basic Structures",
      description: "Big-O notation, space-time tradeoffs, dynamic arrays, strings, and hash maps.",
      status: "completed",
      lessonsCount: 4,
      completedLessons: 3,
      lessons: [
        { id: "1.1", title: "Big-O, Big-Omega & Asymptotic Bounds", description: "Analyze worst-case and amortized time complexity.", duration: "30m", type: "concept", completed: true, status: "completed" },
        { id: "1.2", title: "Two-Pointer & Sliding Window Techniques", description: "Array traversal optimization patterns.", duration: "45m", type: "exercise", completed: true, status: "completed" },
        { id: "1.3", title: "Hash Tables & Collision Resolution", description: "Chaining, open addressing, and load factor mechanics.", duration: "40m", type: "exercise", completed: true, status: "completed" },
        { id: "1.4", title: "Foundation Assessment: Array Algorithms", description: "Solve 3 timed algorithm challenges.", duration: "30m", type: "quiz", completed: false, status: "current" },
      ],
    },
    {
      id: 2,
      phaseNumber: 2,
      phaseName: "Core Skills",
      title: "Phase 2: Linked Lists, Stacks & Queues",
      description: "Memory layout, monotonic stacks, recursion call-stacks, and deque applications.",
      status: "locked",
      lessonsCount: 4,
      completedLessons: 0,
      lessons: [
        { id: "2.1", title: "Singly and Doubly Linked List Inversion", description: "Pointer manipulation and cycle detection.", duration: "35m", type: "exercise", completed: false, status: "locked" },
        { id: "2.2", title: "Monotonic Stack for Next Greater Element", description: "Optimal linear time stack applications.", duration: "40m", type: "exercise", completed: false, status: "locked" },
        { id: "2.3", title: "Priority Queues & Binary Heaps", description: "Heapify algorithm and K-th largest element extraction.", duration: "45m", type: "concept", completed: false, status: "locked" },
        { id: "2.4", title: "Core Skills Quiz: Linear Data Structures", description: "Practical LeetCode pattern validation.", duration: "30m", type: "quiz", completed: false, status: "locked" },
      ],
    },
    {
      id: 3,
      phaseNumber: 3,
      phaseName: "Advanced Topics",
      title: "Phase 3: Trees, Binary Search & Tries",
      description: "Tree traversals (DFS/BFS), Binary Search Trees, AVL balance, and Trie prefixes.",
      status: "locked",
      lessonsCount: 4,
      completedLessons: 0,
      lessons: [
        { id: "3.1", title: "Binary Tree Traversals (Inorder, Preorder, Postorder)", description: "Recursive vs iterative stack implementations.", duration: "40m", type: "exercise", completed: false, status: "locked" },
        { id: "3.2", title: "Binary Search on Answer Space", description: "Modified binary search for optimization problems.", duration: "45m", type: "exercise", completed: false, status: "locked" },
        { id: "3.3", title: "Trie (Prefix Tree) Implementation", description: "Autocomplete and prefix lookup optimization.", duration: "40m", type: "concept", completed: false, status: "locked" },
        { id: "3.4", title: "Tree Algorithms Assessment", description: "Tree path sum and lowest common ancestor problems.", duration: "35m", type: "quiz", completed: false, status: "locked" },
      ],
    },
    {
      id: 4,
      phaseNumber: 4,
      phaseName: "Practice & Projects",
      title: "Phase 4: Graphs & Dynamic Programming",
      description: "Dijkstra, Topological Sort, Memoization, and Tabulation matrices.",
      status: "locked",
      lessonsCount: 4,
      completedLessons: 0,
      lessons: [
        { id: "4.1", title: "Graph Representations & BFS/DFS", description: "Adjacency list, connected components, and cycle detection.", duration: "45m", type: "concept", completed: false, status: "locked" },
        { id: "4.2", title: "Shortest Path (Dijkstra) & Minimum Spanning Tree", description: "Greedy graph algorithms and priority queue integration.", duration: "50m", type: "exercise", completed: false, status: "locked" },
        { id: "4.3", title: "1D & 2D Dynamic Programming Patterns", description: "Knapsack, Longest Common Subsequence, and Grid DP.", duration: "60m", type: "exercise", completed: false, status: "locked" },
        { id: "4.4", title: "Comprehensive DP & Graph Milestone", description: "Hard-tier algorithmic evaluation.", duration: "45m", type: "quiz", completed: false, status: "locked" },
      ],
    },
    {
      id: 5,
      phaseNumber: 5,
      phaseName: "Capstone & Production",
      title: "Phase 5: Technical Interview Simulation & Capstone",
      description: "Timed FAANG mock evaluations, trade-off explanations, and code review.",
      status: "locked",
      lessonsCount: 3,
      completedLessons: 0,
      lessons: [
        { id: "5.1", title: "Live Whiteboard Simulation: System Tradeoffs", description: "Explain time/space tradeoffs under realistic constraints.", duration: "45m", type: "exercise", completed: false, status: "locked" },
        { id: "5.2", title: "Timed 4-Problem Coding Assessment", description: "Simulated interview environment with edge case testing.", duration: "60m", type: "quiz", completed: false, status: "locked" },
        { id: "5.3", title: "DSA Mastery Certificate Evaluation", description: "Final verification and benchmark score calculation.", duration: "40m", type: "project", completed: false, status: "locked" },
      ],
    },
  ];
}

// -------------------------------------------------------------
// 3. MACHINE LEARNING & AI BLUEPRINT
// -------------------------------------------------------------
function buildAIMLPhases(
  isBeginner: boolean,
  isAdvanced: boolean,
  known: string[],
  skipped: string[]
): RoadmapPhase[] {
  return [
    {
      id: 1,
      phaseNumber: 1,
      phaseName: "Foundation",
      title: "Phase 1: Mathematical Foundations & Python for Data",
      description: "Linear algebra, matrix operations, NumPy, Pandas, and vectorization.",
      status: "completed",
      lessonsCount: 4,
      completedLessons: 3,
      lessons: [
        { id: "1.1", title: "Matrix Multiplications & Eigenvectors", description: "Geometric intuition of vector spaces and PCA.", duration: "40m", type: "concept", completed: true, status: "completed" },
        { id: "1.2", title: "NumPy Vectorized Operations & Broadcasting", description: "Eliminate Python loops with C-backed tensors.", duration: "45m", type: "exercise", completed: true, status: "completed" },
        { id: "1.3", title: "Data Cleaning & Feature Engineering with Pandas", description: "Handle missing values, encoding, and scaling.", duration: "40m", type: "exercise", completed: true, status: "completed" },
        { id: "1.4", title: "Foundation Quiz: Linear Algebra in Python", description: "Vector calculus and matrix math validation.", duration: "30m", type: "quiz", completed: false, status: "current" },
      ],
    },
    {
      id: 2,
      phaseNumber: 2,
      phaseName: "Core Skills",
      title: "Phase 2: Supervised & Unsupervised Learning",
      description: "Linear/Logistic Regression, Decision Trees, Random Forests, and Gradient Boosting.",
      status: "locked",
      lessonsCount: 4,
      completedLessons: 0,
      lessons: [
        { id: "2.1", title: "Gradient Descent Optimization & Cost Functions", description: "Batch, stochastic, and mini-batch convergence.", duration: "45m", type: "concept", completed: false, status: "locked" },
        { id: "2.2", title: "Ensemble Methods: XGBoost & LightGBM", description: "Tree boosting algorithms and hyperparameter tuning.", duration: "50m", type: "exercise", completed: false, status: "locked" },
        { id: "2.3", title: "Model Validation: ROC-AUC, F1-Score & Cross-Validation", description: "Detect overfitting with bias-variance decomposition.", duration: "40m", type: "exercise", completed: false, status: "locked" },
        { id: "2.4", title: "Classical ML Practical Project", description: "Build an end-to-end predictive pipeline.", duration: "45m", type: "project", completed: false, status: "locked" },
      ],
    },
    {
      id: 3,
      phaseNumber: 3,
      phaseName: "Advanced Topics",
      title: "Phase 3: Deep Learning & PyTorch Architectures",
      description: "Multi-layer perceptrons, backpropagation, CNNs, and Transformer self-attention.",
      status: "locked",
      lessonsCount: 4,
      completedLessons: 0,
      lessons: [
        { id: "3.1", title: "PyTorch Autograd & Computational Graphs", description: "Custom tensor operations and backward pass gradients.", duration: "45m", type: "concept", completed: false, status: "locked" },
        { id: "3.2", title: "Convolutional Neural Networks & Image Filters", description: "Kernels, pooling layers, and transfer learning with ResNet.", duration: "50m", type: "exercise", completed: false, status: "locked" },
        { id: "3.3", title: "Transformer Architecture & Multi-Head Attention", description: "QKV matrices, positional encoding, and self-attention.", duration: "55m", type: "concept", completed: false, status: "locked" },
        { id: "3.4", title: "Deep Learning Evaluation Quiz", description: "Validate network architectures and loss curves.", duration: "35m", type: "quiz", completed: false, status: "locked" },
      ],
    },
    {
      id: 4,
      phaseNumber: 4,
      phaseName: "Practice & Projects",
      title: "Phase 4: LLM Fine-Tuning & MLOps Pipelines",
      description: "LoRA parameter-efficient fine-tuning, embeddings, and vector databases.",
      status: "locked",
      lessonsCount: 3,
      completedLessons: 0,
      lessons: [
        { id: "4.1", title: "LoRA & QLoRA Fine-Tuning Workflows", description: "Adapt open-weights models with PEFT techniques.", duration: "50m", type: "exercise", completed: false, status: "locked" },
        { id: "4.2", title: "Vector Embeddings & Retrieval Augmented Generation", description: "Cosine similarity search and chunking strategies.", duration: "45m", type: "exercise", completed: false, status: "locked" },
        { id: "4.3", title: "Model Quantization & TensorRT Inference", description: "GGUF/AWQ precision reduction for fast latency.", duration: "45m", type: "project", completed: false, status: "locked" },
      ],
    },
    {
      id: 5,
      phaseNumber: 5,
      phaseName: "Capstone & Production",
      title: "Phase 5: Production Model Deployment & Monitoring",
      description: "FastAPI serving, Docker deployment, latency benchmarking, and data drift monitoring.",
      status: "locked",
      lessonsCount: 3,
      completedLessons: 0,
      lessons: [
        { id: "5.1", title: "High-Throughput FastAPI Model Serving", description: "Asynchronous worker pools and batch inference.", duration: "45m", type: "exercise", completed: false, status: "locked" },
        { id: "5.2", title: "Model Monitoring & Drift Detection", description: "Track input distribution shifts and latency percentiles.", duration: "40m", type: "exercise", completed: false, status: "locked" },
        { id: "5.3", title: "AI/ML Production Capstone Evaluation", description: "Deploy a production-grade inference service with telemetry.", duration: "60m", type: "project", completed: false, status: "locked" },
      ],
    },
  ];
}

// -------------------------------------------------------------
// 4. CLOUD ARCHITECTURE & DEVOPS BLUEPRINT
// -------------------------------------------------------------
function buildCloudPhases(
  isBeginner: boolean,
  isAdvanced: boolean,
  known: string[],
  skipped: string[]
): RoadmapPhase[] {
  return [
    {
      id: 1,
      phaseNumber: 1,
      phaseName: "Foundation",
      title: "Phase 1: Linux Internals, Networking & Bash",
      description: "POSIX permissions, process management, TCP/IP, and shell scripting.",
      status: "completed",
      lessonsCount: 3,
      completedLessons: 3,
      lessons: [
        { id: "1.1", title: "Linux File Systems, Systemd & Daemons", description: "System monitoring and process lifecycles.", duration: "35m", type: "concept", completed: true, status: "completed" },
        { id: "1.2", title: "TCP/IP, DNS, Subnets & CIDR Blocks", description: "Routing tables, gateways, and packet flow.", duration: "45m", type: "exercise", completed: true, status: "completed" },
        { id: "1.3", title: "Automated Bash Scripting & Cron Jobs", description: "Idempotent shell scripting for ops workflows.", duration: "40m", type: "exercise", completed: true, status: "completed" },
      ],
    },
    {
      id: 2,
      phaseNumber: 2,
      phaseName: "Core Skills",
      title: "Phase 2: Docker & Container Orchestration",
      description: "Multi-stage Dockerfiles, image caching, and container security.",
      status: "in-progress",
      lessonsCount: 4,
      completedLessons: 1,
      lessons: [
        { id: "2.1", title: "Multi-Stage Dockerfiles & Layer Caching", description: "Minimize container size and vulnerability surface.", duration: "40m", type: "concept", completed: true, status: "completed" },
        { id: "2.2", title: "Docker Compose for Multi-Service Environments", description: "Network bridges, volume persistence, and environment isolation.", duration: "45m", type: "exercise", completed: false, status: "current" },
        { id: "2.3", title: "Container Security & Non-Root Execution", description: "Scan CVE vulnerabilities with Trivy.", duration: "35m", type: "exercise", completed: false, status: "upcoming" },
        { id: "2.4", title: "Containerization Practical Assessment", description: "Containerize a multi-tier microservice architecture.", duration: "30m", type: "quiz", completed: false, status: "upcoming" },
      ],
    },
    {
      id: 3,
      phaseNumber: 3,
      phaseName: "Advanced Topics",
      title: "Phase 3: Kubernetes Clusters & Ingress",
      description: "Pods, Deployments, Services, ConfigMaps, Secrets, and Ingress Controllers.",
      status: "locked",
      lessonsCount: 4,
      completedLessons: 0,
      lessons: [
        { id: "3.1", title: "Kubernetes Architecture (Control Plane vs Worker Nodes)", description: "etcd, kube-apiserver, kubelet, and scheduling.", duration: "45m", type: "concept", completed: false, status: "locked" },
        { id: "3.2", title: "Declarative Manifests & Kustomize", description: "Manage environment overlays (dev/stage/prod).", duration: "40m", type: "exercise", completed: false, status: "locked" },
        { id: "3.3", title: "Ingress-NGINX & TLS Cert-Manager", description: "Route external web traffic with auto Let's Encrypt certificates.", duration: "45m", type: "exercise", completed: false, status: "locked" },
        { id: "3.4", title: "Kubernetes Operational Assessment", description: "Debug broken pods and roll back failed deployments.", duration: "35m", type: "quiz", completed: false, status: "locked" },
      ],
    },
    {
      id: 4,
      phaseNumber: 4,
      phaseName: "Practice & Projects",
      title: "Phase 4: Infrastructure as Code (Terraform) & AWS",
      description: "VPC, IAM roles, ECS, RDS, S3, and Terraform state management.",
      status: "locked",
      lessonsCount: 3,
      completedLessons: 0,
      lessons: [
        { id: "4.1", title: "Terraform Providers, Modules & Remote State", description: "Manage S3 state locking with DynamoDB.", duration: "50m", type: "concept", completed: false, status: "locked" },
        { id: "4.2", title: "AWS Multi-AZ VPC & Secure Bastion Hosts", description: "Public/Private subnets and NAT gateways.", duration: "50m", type: "project", completed: false, status: "locked" },
        { id: "4.3", title: "Serverless Deployments with AWS Lambda & SQS", description: "Event-driven asynchronous cloud architecture.", duration: "45m", type: "exercise", completed: false, status: "locked" },
      ],
    },
    {
      id: 5,
      phaseNumber: 5,
      phaseName: "Capstone & Production",
      title: "Phase 5: Production CI/CD & Site Reliability (SRE)",
      description: "GitHub Actions, Prometheus metrics, Grafana dashboards, and zero-downtime releases.",
      status: "locked",
      lessonsCount: 3,
      completedLessons: 0,
      lessons: [
        { id: "5.1", title: "GitHub Actions Matrix Builds & Deployment Roles", description: "Secure OIDC authentication with AWS without stored secrets.", duration: "45m", type: "exercise", completed: false, status: "locked" },
        { id: "5.2", title: "Prometheus Monitoring & Grafana Alerting", description: "Measure P99 latency, error rates, and CPU throttles.", duration: "40m", type: "exercise", completed: false, status: "locked" },
        { id: "5.3", title: "Production SRE Capstone Certification", description: "Deploy a complete zero-downtime cluster with observability.", duration: "60m", type: "project", completed: false, status: "locked" },
      ],
    },
  ];
}

// -------------------------------------------------------------
// 5. MOBILE APP DEVELOPMENT BLUEPRINT
// -------------------------------------------------------------
function buildMobilePhases(
  isBeginner: boolean,
  isAdvanced: boolean,
  known: string[],
  skipped: string[]
): RoadmapPhase[] {
  return [
    {
      id: 1,
      phaseNumber: 1,
      phaseName: "Foundation",
      title: "Phase 1: React Native & Mobile Layout Engine",
      description: "Flexbox layout for iOS/Android, View primitives, Touchables, and StyleSheet.",
      status: "completed",
      lessonsCount: 3,
      completedLessons: 2,
      lessons: [
        { id: "1.1", title: "React Native Yoga Layout Engine", description: "Adaptive Flexbox for different device screen aspect ratios.", duration: "35m", type: "concept", completed: true, status: "completed" },
        { id: "1.2", title: "Expo Framework & Universal App Setup", description: "Expo Router, file-based routing, and hot reloading.", duration: "40m", type: "exercise", completed: true, status: "completed" },
        { id: "1.3", title: "Mobile UI Assessment: Responsive Screen", description: "Build a pixel-perfect cross-platform mobile screen.", duration: "30m", type: "quiz", completed: false, status: "current" },
      ],
    },
    {
      id: 2,
      phaseNumber: 2,
      phaseName: "Core Skills",
      title: "Phase 2: Navigation & Mobile State Systems",
      description: "React Navigation, Stack/Tab navigators, gesture handling, and animations.",
      status: "locked",
      lessonsCount: 4,
      completedLessons: 0,
      lessons: [
        { id: "2.1", title: "Stack, Native Tabs & Drawer Navigators", description: "Seamless screen transitions and deep linking.", duration: "40m", type: "concept", completed: false, status: "locked" },
        { id: "2.2", title: "React Native Reanimated 3 & Gesture Handler", description: "60fps UI animations running on the UI thread.", duration: "50m", type: "exercise", completed: false, status: "locked" },
        { id: "2.3", title: "Offline Storage with MMKV & WatermelonDB", description: "High-performance local key-value storage.", duration: "45m", type: "exercise", completed: false, status: "locked" },
        { id: "2.4", title: "Core Navigation Assessment", description: "Implement complex nested multi-tab navigation.", duration: "35m", type: "quiz", completed: false, status: "locked" },
      ],
    },
    {
      id: 3,
      phaseNumber: 3,
      phaseName: "Advanced Topics",
      title: "Phase 3: Device Hardware & Native Integrations",
      description: "Camera, Location GPS, Push Notifications, and Biometrics (FaceID/Fingerprint).",
      status: "locked",
      lessonsCount: 3,
      completedLessons: 0,
      lessons: [
        { id: "3.1", title: "Secure Biometric Auth & Keychain Storage", description: "Store JWT tokens safely inside native hardware enclaves.", duration: "40m", type: "exercise", completed: false, status: "locked" },
        { id: "3.2", title: "Push Notifications with Expo & APNs/FCM", description: "Background message triggers and badge handling.", duration: "45m", type: "concept", completed: false, status: "locked" },
        { id: "3.3", title: "Hardware APIs: Camera & Geolocation Streams", description: "Capture photos and subscribe to location changes.", duration: "45m", type: "project", completed: false, status: "locked" },
      ],
    },
    {
      id: 4,
      phaseNumber: 4,
      phaseName: "Practice & Projects",
      title: "Phase 4: Offline-First Synchronization & APIs",
      description: "Optimistic background sync, conflict resolution, and WebSocket real-time updates.",
      status: "locked",
      lessonsCount: 3,
      completedLessons: 0,
      lessons: [
        { id: "4.1", title: "Optimistic Mutation Queues for Flaky Networks", description: "Queue offline writes and sync upon reconnection.", duration: "45m", type: "exercise", completed: false, status: "locked" },
        { id: "4.2", title: "Mobile Performance Profiling with Flipper", description: "Identify JS bridge bottlenecks and memory leaks.", duration: "40m", type: "exercise", completed: false, status: "locked" },
        { id: "4.3", title: "Practice Project: Offline-First Tracker", description: "Complete mobile app test suite with end-to-end sync.", duration: "55m", type: "project", completed: false, status: "locked" },
      ],
    },
    {
      id: 5,
      phaseNumber: 5,
      phaseName: "Capstone & Production",
      title: "Phase 5: App Store / Play Store Release & EAS",
      description: "EAS Build, code signing certificates, TestFlight beta distribution, and OTA updates.",
      status: "locked",
      lessonsCount: 3,
      completedLessons: 0,
      lessons: [
        { id: "5.1", title: "EAS Cloud Build & iOS Provisioning Profiles", description: "Automate app bundle signing without macOS dependency.", duration: "40m", type: "concept", completed: false, status: "locked" },
        { id: "5.2", title: "Over-the-Air (OTA) Updates & Rollbacks", description: "Push critical JS fixes directly to users instantly.", duration: "35m", type: "exercise", completed: false, status: "locked" },
        { id: "5.3", title: "Final Mobile App Capstone Release", description: "Publish app binary to internal test track.", duration: "60m", type: "project", completed: false, status: "locked" },
      ],
    },
  ];
}

// -------------------------------------------------------------
// 6. BACKEND SYSTEMS & DATABASE ARCHITECT
// -------------------------------------------------------------
function buildBackendPhases(
  isBeginner: boolean,
  isAdvanced: boolean,
  known: string[],
  skipped: string[]
): RoadmapPhase[] {
  return [
    {
      id: 1,
      phaseNumber: 1,
      phaseName: "Foundation",
      title: "Phase 1: Backend Architecture & Concurrent Runtimes",
      description: "Event loops, thread pools, socket buffers, and non-blocking I/O.",
      status: "completed",
      lessonsCount: 3,
      completedLessons: 3,
      lessons: [
        { id: "1.1", title: "Event Loop Mechanics & Asynchronous I/O", description: "Libuv, epoll, and concurrency models.", duration: "35m", type: "concept", completed: true, status: "completed" },
        { id: "1.2", title: "RESTful API Standards & Idempotency Keys", description: "Status codes, headers, and idempotent PUT/DELETE semantics.", duration: "40m", type: "exercise", completed: true, status: "completed" },
        { id: "1.3", title: "Backend Architecture Checkpoint", description: "Validate concurrent request handling.", duration: "30m", type: "quiz", completed: true, status: "completed" },
      ],
    },
    {
      id: 2,
      phaseNumber: 2,
      phaseName: "Core Skills",
      title: "Phase 2: Relational Databases & Query Optimization",
      description: "ACID transactions, isolation levels, B-tree indexes, and PostgreSQL tuning.",
      status: "in-progress",
      lessonsCount: 4,
      completedLessons: 1,
      lessons: [
        { id: "2.1", title: "PostgreSQL Storage Engine & WAL Logs", description: "Write-Ahead Logging, checkpoints, and crash recovery.", duration: "45m", type: "concept", completed: true, status: "completed" },
        { id: "2.2", title: "Transaction Isolation Levels (Read Committed to Serializable)", description: "Dirty reads, non-repeatable reads, and phantom reads.", duration: "45m", type: "exercise", completed: false, status: "current" },
        { id: "2.3", title: "Query Explain Plans & Composite Index Design", description: "Sequential scans vs index scans and cost estimations.", duration: "50m", type: "exercise", completed: false, status: "upcoming" },
        { id: "2.4", title: "Database Performance Assessment", description: "Optimize 5 slow queries with proper indexing.", duration: "35m", type: "quiz", completed: false, status: "upcoming" },
      ],
    },
    {
      id: 3,
      phaseNumber: 3,
      phaseName: "Advanced Topics",
      title: "Phase 3: Distributed Caching & Message Brokers",
      description: "Redis in-memory caching, Cache-Aside patterns, RabbitMQ, and Apache Kafka streams.",
      status: "locked",
      lessonsCount: 4,
      completedLessons: 0,
      lessons: [
        { id: "3.1", title: "Redis Cache Invalidation & Stampede Mitigation", description: "TTL jitter, mutex locks, and distributed caching.", duration: "40m", type: "concept", completed: false, status: "locked" },
        { id: "3.2", title: "Event-Driven Messaging with RabbitMQ/Kafka", description: "Consumer groups, partition keys, and at-least-once delivery.", duration: "50m", type: "exercise", completed: false, status: "locked" },
        { id: "3.3", title: "Rate Limiting Algorithms (Token Bucket & Leaky Bucket)", description: "Protect APIs against DDOS and resource exhaustion.", duration: "40m", type: "exercise", completed: false, status: "locked" },
        { id: "3.4", title: "Distributed Systems Quiz", description: "Evaluate caching consistency and queue semantics.", duration: "35m", type: "quiz", completed: false, status: "locked" },
      ],
    },
    {
      id: 4,
      phaseNumber: 4,
      phaseName: "Practice & Projects",
      title: "Phase 4: Scalable Microservices & gRPC",
      description: "Protocol Buffers, gRPC unary/streaming, distributed tracing, and service discovery.",
      status: "locked",
      lessonsCount: 3,
      completedLessons: 0,
      lessons: [
        { id: "4.1", title: "gRPC & Protocol Buffers for Low-Latency RPC", description: "Binary serialization vs JSON benchmarks.", duration: "45m", type: "concept", completed: false, status: "locked" },
        { id: "4.2", title: "Distributed Tracing with OpenTelemetry", description: "Trace IDs, spans, and latency bottleneck pinpointing.", duration: "45m", type: "exercise", completed: false, status: "locked" },
        { id: "4.3", title: "Backend Scalability Project: Order Processing Engine", description: "Build an idempotent financial ledger with distributed locks.", duration: "60m", type: "project", completed: false, status: "locked" },
      ],
    },
    {
      id: 5,
      phaseNumber: 5,
      phaseName: "Capstone & Production",
      title: "Phase 5: High-Availability Architecture Capstone",
      description: "Database replication, read replicas, sharding, failover, and chaos engineering.",
      status: "locked",
      lessonsCount: 3,
      completedLessons: 0,
      lessons: [
        { id: "5.1", title: "Database Sharding & Consistent Hashing", description: "Partitioning datasets across multiple database clusters.", duration: "50m", type: "concept", completed: false, status: "locked" },
        { id: "5.2", title: "Chaos Engineering & Automated Failover Drills", description: "Simulate network partitions and test circuit breakers.", duration: "45m", type: "exercise", completed: false, status: "locked" },
        { id: "5.3", title: "Backend Systems Architect Final Capstone", description: "Design and benchmark a 100k req/sec distributed system.", duration: "60m", type: "project", completed: false, status: "locked" },
      ],
    },
  ];
}
