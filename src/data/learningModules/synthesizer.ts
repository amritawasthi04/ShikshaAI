import { DetailedLessonModule, LessonResource, QuizQuestion } from "./types";
import { RoadmapLesson, RoadmapPhase } from "@/types/roadmap";

/**
 * Intelligent topic synthesizer that constructs domain-accurate,
 * pedagogical learning modules for any arbitrary curriculum milestone.
 */
export function synthesizeLessonModule(
  lesson: RoadmapLesson,
  phase?: RoadmapPhase | null
): DetailedLessonModule {
  const title = lesson.title || "Core Technical Milestone";
  const desc = lesson.description || "Foundational engineering competency and architecture patterns.";
  const titleLower = title.toLowerCase();
  const descLower = desc.toLowerCase();
  const combined = `${titleLower} ${descLower}`;

  // 1. Detect technical domain & programming language
  let language = "typescript";
  let languageBadge = "TypeScript 5.x • Modern";
  let filename = "moduleImplementation.ts";
  let domain = "Software Engineering";

  if (
    combined.includes("python") ||
    combined.includes("machine") ||
    combined.includes("matrix") ||
    combined.includes("eigen") ||
    combined.includes("numpy") ||
    combined.includes("pandas") ||
    combined.includes("pytorch") ||
    combined.includes("tensorflow") ||
    combined.includes("data") ||
    combined.includes("ai") ||
    combined.includes("ml") ||
    combined.includes("algorithm") ||
    combined.includes("model")
  ) {
    language = "python";
    languageBadge = "Python 3.12 • Scientific / AI";
    filename = `${toSnakeCase(title)}.py`;
    domain = "Machine Learning & AI";
  } else if (
    combined.includes("sql") ||
    combined.includes("postgres") ||
    combined.includes("database") ||
    combined.includes("schema") ||
    combined.includes("migration")
  ) {
    language = "sql";
    languageBadge = "PostgreSQL 16 • Relational SQL";
    filename = `${toSnakeCase(title)}.sql`;
    domain = "Database Systems & Storage";
  } else if (
    combined.includes("docker") ||
    combined.includes("container")
  ) {
    language = "dockerfile";
    languageBadge = "Dockerfile • Containerization";
    filename = "Dockerfile";
    domain = "Cloud Architecture & DevOps";
  } else if (
    combined.includes("kubernetes") ||
    combined.includes("k8s") ||
    combined.includes("yaml") ||
    combined.includes("manifest") ||
    combined.includes("github actions")
  ) {
    language = "yaml";
    languageBadge = "YAML • Declarative Manifest";
    filename = "deployment.yaml";
    domain = "Cloud Architecture & DevOps";
  } else if (
    combined.includes("bash") ||
    combined.includes("shell") ||
    combined.includes("linux") ||
    combined.includes("script")
  ) {
    language = "bash";
    languageBadge = "Bash / POSIX Shell";
    filename = `${toSnakeCase(title)}.sh`;
    domain = "Systems & DevOps";
  } else if (
    combined.includes("react native") ||
    combined.includes("mobile") ||
    combined.includes("ios") ||
    combined.includes("android") ||
    combined.includes("expo")
  ) {
    language = "typescript";
    languageBadge = "TypeScript • React Native / Expo";
    filename = `${toPascalCase(title)}.tsx`;
    domain = "Mobile App Development";
  } else if (
    combined.includes("react") ||
    combined.includes("next.js") ||
    combined.includes("css") ||
    combined.includes("tailwind") ||
    combined.includes("frontend") ||
    combined.includes("ui")
  ) {
    language = "typescript";
    languageBadge = "TypeScript • React & Next.js";
    filename = `${toPascalCase(title)}.tsx`;
    domain = "Full-Stack Web Engineering";
  } else if (
    combined.includes("tree") ||
    combined.includes("graph") ||
    combined.includes("heap") ||
    combined.includes("dsa") ||
    combined.includes("search") ||
    combined.includes("dynamic programming")
  ) {
    language = "python";
    languageBadge = "Python 3.12 • DSA";
    filename = `${toSnakeCase(title)}.py`;
    domain = "Data Structures & Algorithms";
  }

  // 2. Synthesize Tailored Learning Objectives
  const keyObjectives = lesson.keyObjectives && lesson.keyObjectives.length > 0
    ? lesson.keyObjectives
    : [
        `Understand the core architectural mechanics and foundational theory behind ${title}.`,
        `Implement idiomatic, production-grade logic for ${title} with strict validation and error handling.`,
        `Analyze algorithmic complexity, operational tradeoffs, and memory efficiency under scale.`,
        `Identify and mitigate common security vulnerabilities, anti-patterns, and edge cases.`,
      ];

  // 3. Synthesize Code Blueprint
  const codeBlueprint = {
    language,
    languageBadge,
    filename,
    code: lesson.codeSnippet || generateDomainCodeSample(title, desc, language),
    explanation: `This blueprint demonstrates the recommended production pattern for ${title}. It emphasizes strict input boundaries, error propagation, and resource efficiency.`,
    architectureFlow: `Client / Trigger ──► Validation & Boundary Check ──► Core ${title} Engine ──► Verified Result`,
  };

  // 4. Synthesize Deep Dive
  const deepDive = {
    overview: `This milestone centers on ${title}. ${desc} In production architectures, mastering this competency allows software engineers to design scalable systems that withstand real-world traffic, concurrency, and edge conditions without failure.`,
    mentalModel: `Think of ${title} as an essential specialized tool in an engineer's toolkit. Rather than relying on trial and error, understanding the underlying protocol and data flow allows you to predict system behavior before writing code.`,
    coreConcepts: [
      {
        title: `Architecture Principles of ${title}`,
        description: `Deconstructs how ${title} interacts with surrounding system components, network buffers, and state lifecycles.`,
        highlight: `Ensure clean separation of concerns and deterministic failure modes.`,
      },
      {
        title: `Production Optimization & Throughput`,
        description: `Techniques to maximize compute efficiency, eliminate memory leaks, and optimize latency characteristics.`,
        highlight: `Measure before optimizing: benchmark critical execution paths under realistic load.`,
      },
    ],
    pitfalls: [
      `Neglecting edge cases and malformed inputs at external system boundaries.`,
      `Over-engineering abstractions before identifying concrete usage patterns and performance bottlenecks.`,
      `Failing to implement proper observability, telemetry, and structured error logging.`,
    ],
    realWorldApplications: `Widely implemented by technology leaders to scale distributed services, ensure reliable data persistence, and guarantee seamless user experiences.`,
  };

  // 5. Synthesize Curated Resources
  const resources: LessonResource[] =
    lesson.resources && lesson.resources.length > 0
      ? lesson.resources.map((r) => ({
          title: r.title,
          url: r.url || getTargetUrlForDomain(domain, title),
          type: r.type,
          description: `Authoritative engineering reference for ${title}.`,
          sourceLabel: getSourceLabelForUrl(r.url || ""),
        }))
      : [
          {
            title: `Official Documentation & Specifications: ${title}`,
            url: getTargetUrlForDomain(domain, title),
            type: "documentation",
            description: `Authoritative RFCs, API references, and architecture guides.`,
            sourceLabel: "Official Docs",
          },
          {
            title: `Production Reference Implementation & Sandboxes`,
            url: "https://github.com",
            type: "repository",
            description: `Open-source repositories demonstrating verified patterns and test suites.`,
            sourceLabel: "GitHub",
          },
          {
            title: `Engineering Best Practices & System Design Patterns`,
            url: "https://web.dev",
            type: "article",
            description: `Deep-dive guide detailing real-world industry tradeoffs and benchmarks.`,
            sourceLabel: "Engineering Guide",
          },
        ];

  // 6. Synthesize Interactive Quiz Questions
  const quizQuestions: QuizQuestion[] = [
    {
      question: `What is the primary design objective when implementing ${title}?`,
      options: [
        `Ensuring predictable behavior, high throughput, and strict boundary validation.`,
        `Maximizing line count in source code files.`,
        `Bypassing error handling to accelerate synchronous execution.`,
        `Hardcoding configuration constants directly into function scopes.`,
      ],
      correctIndex: 0,
      explanation:
        "Production systems prioritize predictability, type-safety, resilience, and maintainability under varying workloads.",
    },
    {
      question: `Which operational pitfall is most critical to avoid when working with ${title}?`,
      options: [
        `Failing to sanitize untrusted inputs and ignoring unexpected edge cases.`,
        `Writing comprehensive automated test coverage.`,
        `Using clear, expressive variable naming conventions.`,
        `Measuring latency metrics using telemetry instrumentation.`,
      ],
      correctIndex: 0,
      explanation:
        "Unsanitized inputs and unhandled edge cases are the leading causes of security exploits and runtime panics in production.",
    },
  ];

  return {
    topicId: lesson.id || "gen_topic",
    title,
    subtitle: desc,
    domain,
    phaseName: phase?.phaseName || "Core Skills",
    duration: lesson.duration || "40m",
    type: lesson.type || "concept",
    keyObjectives,
    deepDive,
    codeBlueprint,
    quizQuestions,
    resources,
    practicalChallenge: {
      prompt: `Implement a verified reference pattern for ${title} that satisfies input validation and error handling contracts.`,
      starterHint: `Review the code blueprint above and structure your solution with modular helper functions.`,
      expectedOutput: `Zero unhandled exceptions and full test coverage for boundary inputs.`,
    },
  };
}

function toSnakeCase(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 30);
}

function toPascalCase(str: string): string {
  return str
    .replace(/(?:^\w|[A-Z]|\b\w)/g, (word) => word.toUpperCase())
    .replace(/\s+/g, "")
    .replace(/[^a-zA-Z0-9]/g, "")
    .slice(0, 30) || "Component";
}

function generateDomainCodeSample(title: string, desc: string, language: string): string {
  if (language === "python") {
    return `# Technical Implementation for: ${title}
# Context: ${desc}
from typing import Any, Optional

def execute_${toSnakeCase(title)}_pipeline(input_data: dict[str, Any]) -> dict[str, Any]:
    """
    Executes validated pipeline logic for ${title}.
    """
    # 1. Validate boundary conditions
    if not input_data:
        raise ValueError("Input data payload cannot be empty")
        
    # 2. Process domain operations
    transformed = {k: v for k, v in input_data.items() if v is not None}
    
    # 3. Return verified result
    return {
        "status": "success",
        "processed_items": len(transformed),
        "data": transformed
    }

if __name__ == "__main__":
    result = execute_${toSnakeCase(title)}_pipeline({"topic": "${title}", "active": True})
    print(f"Pipeline output: {result}")`;
  }

  if (language === "sql") {
    return `-- Production Database Blueprint for: ${title}
-- Context: ${desc}

CREATE TABLE IF NOT EXISTS ${toSnakeCase(title)}_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_name VARCHAR(255) NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Optimize query performance with composite index
CREATE INDEX IF NOT EXISTS idx_${toSnakeCase(title)}_active 
ON ${toSnakeCase(title)}_records (entity_name, is_active);`;
  }

  if (language === "dockerfile") {
    return `# Production Container Blueprint for: ${title}
FROM node:20-alpine AS base
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
USER node
EXPOSE 3000
CMD ["node", "server.js"]`;
  }

  if (language === "bash") {
    return `#!/usr/bin/env bash
# Automated Operations Workflow for: ${title}
set -euo pipefail

echo "[Shiksha Ops] Initializing: ${title}..."

# Verify prerequisite binaries
command -v curl >/dev/null 2>&1 || { echo "curl is required"; exit 1; }

echo "[Shiksha Ops] Completed ${title} verification successfully."`;
  }

  // Default TypeScript
  return `/**
 * Architecture Blueprint for: ${title}
 * Context: ${desc}
 */
export interface ${toPascalCase(title)}Config {
  id: string;
  enabled: boolean;
  options?: Record<string, unknown>;
}

export async function process${toPascalCase(title)}(
  config: ${toPascalCase(title)}Config
): Promise<{ success: boolean; timestamp: string }> {
  if (!config.id) {
    throw new Error("Missing required config identifier");
  }

  console.log(\`[Shiksha System] Executing: \${config.id}\`);
  
  return {
    success: true,
    timestamp: new Date().toISOString(),
  };
}`;
}

function getTargetUrlForDomain(domain: string, title: string): string {
  const lower = title.toLowerCase();
  if (lower.includes("matrix") || lower.includes("eigen") || lower.includes("numpy")) {
    return "https://numpy.org/doc/stable/reference/routines.linalg.html";
  }
  if (lower.includes("pandas")) {
    return "https://pandas.pydata.org/docs/";
  }
  if (lower.includes("pytorch")) {
    return "https://pytorch.org/docs/stable/index.html";
  }
  if (lower.includes("docker")) {
    return "https://docs.docker.com";
  }
  if (lower.includes("kubernetes")) {
    return "https://kubernetes.io/docs/home/";
  }
  if (lower.includes("postgres") || lower.includes("sql")) {
    return "https://www.postgresql.org/docs/";
  }
  if (lower.includes("next") || lower.includes("react")) {
    return "https://nextjs.org/docs";
  }
  return "https://developer.mozilla.org";
}

function getSourceLabelForUrl(url: string): string {
  if (url.includes("numpy")) return "NumPy Docs";
  if (url.includes("pytorch")) return "PyTorch Docs";
  if (url.includes("youtube") || url.includes("3blue1brown")) return "3Blue1Brown";
  if (url.includes("postgresql")) return "PostgreSQL Docs";
  if (url.includes("nextjs")) return "Next.js Docs";
  if (url.includes("docker")) return "Docker Docs";
  if (url.includes("kubernetes")) return "Kubernetes Docs";
  if (url.includes("github")) return "GitHub";
  if (url.includes("leetcode")) return "LeetCode";
  return "Official Reference";
}
