import { ExploreResource } from "@/types/roadmap";

export const exploreResourcesData: ExploreResource[] = [
  // 1. LEARNING PATHS
  {
    id: "path-fullstack",
    title: "Full-Stack Web Engineering Track",
    description: "Modern TypeScript, Next.js App Router, Tailwind CSS, Server Actions, PostgreSQL, and production cloud deployment.",
    category: "Learning Paths",
    difficulty: "Intermediate",
    duration: "12 Weeks",
    resourceType: "path",
    tags: ["React", "Next.js", "TypeScript", "PostgreSQL", "Tailwind CSS"],
    objectives: [
      "Master React Server Components (RSC) and Next.js App Router architecture.",
      "Build secure type-safe Server Actions and mutate backend database state.",
      "Model relational PostgreSQL schemas and run zero-downtime Prisma migrations.",
      "Deploy scalable production applications with automated CI/CD pipelines.",
    ],
    prerequisites: ["JavaScript Fundamentals", "Basic HTML5 & CSS3"],
    externalUrl: "https://nextjs.org/docs",
    targetRoles: ["Full-Stack Web Developer", "Frontend Engineer", "Web Developer"],
    skillFocus: ["JavaScript", "TypeScript", "React", "Next.js", "PostgreSQL", "Tailwind CSS"],
    codePreview: `// Full-Stack Next.js 16 Server Action Example
'use server';

import { revalidatePath } from 'next/cache';

export async function updateProfile(formData: FormData) {
  const name = formData.get('name') as string;
  // Database mutation pipeline
  await db.user.update({ where: { id: session.userId }, data: { name } });
  revalidatePath('/dashboard');
}`,
  },
  {
    id: "path-dsa",
    title: "Data Structures & Algorithmic Patterns",
    description: "Core computer science problem solving, asymptotic bounds, trees, graphs, dynamic programming, and complexity optimization.",
    category: "Learning Paths",
    difficulty: "Intermediate",
    duration: "8 Weeks",
    resourceType: "path",
    tags: ["Algorithms", "Data Structures", "LeetCode", "Python", "C++"],
    objectives: [
      "Analyze time and space complexity using Big-O, Big-Omega, and amortized bounds.",
      "Master two-pointer, sliding window, monotonic stacks, and binary search patterns.",
      "Traverse trees and graphs using DFS, BFS, and Dijkstra shortest path algorithms.",
      "Solve complex 1D and 2D dynamic programming optimization problems.",
    ],
    prerequisites: ["Basic Programming Syntax in any language"],
    externalUrl: "https://leetcode.com",
    targetRoles: ["Software Engineer", "Data Structures Specialist", "Backend Engineer"],
    skillFocus: ["Algorithms", "Data Structures", "Python", "C++"],
    codePreview: `// Optimal Sliding Window Maximum Pattern
function maxSubArrayLen(nums: number[], k: number): number {
  let left = 0, currentSum = 0, maxLen = 0;
  for (let right = 0; right < nums.length; right++) {
    currentSum += nums[right];
    while (currentSum > k && left <= right) {
      currentSum -= nums[left++];
    }
    maxLen = Math.max(maxLen, right - left + 1);
  }
  return maxLen;
}`,
  },
  {
    id: "path-aiml",
    title: "Machine Learning & AI Engineering Track",
    description: "Linear algebra, statistical modeling, neural networks, PyTorch tensors, LLM fine-tuning, and production model serving.",
    category: "Learning Paths",
    difficulty: "Advanced",
    duration: "16 Weeks",
    resourceType: "path",
    tags: ["Python", "PyTorch", "NumPy", "Transformers", "MLOps"],
    objectives: [
      "Understand matrix multiplications, gradient descent, and computational graphs.",
      "Build and train multi-layer neural networks and CNNs using PyTorch Autograd.",
      "Fine-tune open-weights LLMs using LoRA parameter-efficient techniques.",
      "Serve high-throughput low-latency inference pipelines with FastAPI and Docker.",
    ],
    prerequisites: ["Python Syntax", "Basic Calculus & Linear Algebra"],
    externalUrl: "https://pytorch.org/tutorials",
    targetRoles: ["Machine Learning Engineer", "AI Researcher", "Data Scientist"],
    skillFocus: ["Python", "Machine Learning", "PyTorch", "NumPy"],
    codePreview: `import torch
import torch.nn as nn

class TransformerAttentionBlock(nn.Module):
    def __init__(self, embed_dim, num_heads):
        super().__init__()
        self.mha = nn.MultiheadAttention(embed_dim, num_heads, batch_first=True)
        self.norm = nn.LayerNorm(embed_dim)
        
    def forward(self, x):
        attn_out, _ = self.mha(x, x, x)
        return self.norm(x + attn_out)`,
  },
  {
    id: "path-cloud-devops",
    title: "Cloud Native Architecture & SRE",
    description: "Docker multi-stage builds, Kubernetes orchestration, AWS primitives, Terraform IaC, and Prometheus observability.",
    category: "Learning Paths",
    difficulty: "Intermediate",
    duration: "10 Weeks",
    resourceType: "path",
    tags: ["Docker", "Kubernetes", "AWS", "Terraform", "CI/CD"],
    objectives: [
      "Construct minimal non-root Docker images with multi-stage layer caching.",
      "Deploy self-healing declarative Kubernetes workloads with Ingress and TLS.",
      "Provision reproducible multi-AZ cloud infrastructure using Terraform modules.",
      "Monitor P99 latency and system reliability with Prometheus and Grafana dashboards.",
    ],
    prerequisites: ["Linux / Bash Basics", "Networking Fundamentals"],
    externalUrl: "https://kubernetes.io/docs",
    targetRoles: ["Cloud Architect", "DevOps Engineer", "Site Reliability Engineer"],
    skillFocus: ["Docker", "Kubernetes", "AWS", "Linux", "CI/CD"],
    codePreview: `# Declarative Kubernetes Production Deployment
apiVersion: apps/v1
kind: Deployment
metadata:
  name: api-service
spec:
  replicas: 3
  selector:
    matchLabels:
      app: api
  template:
    metadata:
      labels:
        app: api
    spec:
      containers:
      - name: web
        image: shiksha/api:v1.2.0
        resources:
          limits: { cpu: "500m", memory: "512Mi" }`,
  },

  // 2. TECHNOLOGIES
  {
    id: "tech-nextjs16",
    title: "Next.js App Router & Server Components",
    description: "Deep dive into React Server Components (RSC) wire formats, streaming suspense, parallel routing, and partial prerendering (PPR).",
    category: "Technologies",
    difficulty: "Intermediate",
    duration: "15 Hours",
    resourceType: "technology",
    tags: ["Next.js", "React", "Server Components", "Streaming"],
    objectives: [
      "Understand zero-bundle-size React Server Component mechanics.",
      "Implement parallel and intercepting modal routes.",
      "Configure Incremental Static Regeneration (ISR) and on-demand cache tags.",
    ],
    prerequisites: ["React Fundamentals", "ES6 JavaScript"],
    externalUrl: "https://nextjs.org/docs/app",
    targetRoles: ["Full-Stack Web Developer", "Frontend Engineer"],
    skillFocus: ["Next.js", "React", "TypeScript"],
    codePreview: `// Streaming Suspense Boundary Pattern
import { Suspense } from 'react';
import { AnalyticsChart } from './AnalyticsChart';

export default function DashboardSection() {
  return (
    <Suspense fallback={<ChartSkeleton />}>
      <AnalyticsChart />
    </Suspense>
  );
}`,
  },
  {
    id: "tech-postgresql",
    title: "PostgreSQL Internals & Query Tuning",
    description: "Master Write-Ahead Logging (WAL), B-Tree indexes, composite index design, transaction isolation levels, and EXPLAIN ANALYZE.",
    category: "Technologies",
    difficulty: "Advanced",
    duration: "18 Hours",
    resourceType: "technology",
    tags: ["PostgreSQL", "SQL", "Database Design", "Indexing"],
    objectives: [
      "Diagnose slow queries using EXPLAIN (ANALYZE, BUFFERS).",
      "Design covering composite indexes for multi-column search queries.",
      "Manage PostgreSQL connection pooling with PgBouncer.",
    ],
    prerequisites: ["Basic SQL SELECT/INSERT queries"],
    externalUrl: "https://www.postgresql.org/docs",
    targetRoles: ["Backend Systems Architect", "Database Administrator", "Full-Stack Engineer"],
    skillFocus: ["PostgreSQL", "SQL", "Database Design"],
    codePreview: `-- Composite Index Optimization for Multi-tenant Query
CREATE INDEX idx_workspace_created 
ON audit_logs (workspace_id, created_at DESC)
INCLUDE (action_type, user_id);

EXPLAIN ANALYZE 
SELECT action_type, user_id FROM audit_logs 
WHERE workspace_id = 'ws_987' 
ORDER BY created_at DESC LIMIT 20;`,
  },
  {
    id: "tech-typescript",
    title: "Advanced TypeScript Generics & Type Systems",
    description: "Conditional types, template literal types, mapped types, discriminated unions, and writing bulletproof type-safe libraries.",
    category: "Technologies",
    difficulty: "Advanced",
    duration: "12 Hours",
    resourceType: "technology",
    tags: ["TypeScript", "Generics", "Type Safety", "JavaScript"],
    objectives: [
      "Construct recursive mapped types and custom utility generic definitions.",
      "Enforce exhaustive switch statement type checking with never assertions.",
      "Build schema-driven form inference systems.",
    ],
    prerequisites: ["Basic TypeScript Syntax"],
    externalUrl: "https://www.typescriptlang.org/docs",
    targetRoles: ["Senior Frontend Engineer", "Full-Stack Developer"],
    skillFocus: ["TypeScript", "JavaScript"],
    codePreview: `// Deep Immutable Readonly Utility Type
type DeepImmutable<T> = T extends Function | boolean | number | string | null | undefined
  ? T
  : T extends Array<infer U>
  ? ReadonlyArray<DeepImmutable<U>>
  : { readonly [K in keyof T]: DeepImmutable<T[K]> };`,
  },

  // 3. TUTORIALS
  {
    id: "tut-server-actions",
    title: "Server Actions with Optimistic UI & Zod Validation",
    description: "Step-by-step tutorial on building accessible forms that update immediately with React useOptimistic and roll back cleanly on errors.",
    category: "Tutorials",
    difficulty: "Intermediate",
    duration: "45 Mins",
    resourceType: "tutorial",
    tags: ["Next.js", "Server Actions", "Zod", "Optimistic UI"],
    objectives: [
      "Parse and validate server form mutations with Zod schemas.",
      "Implement instant zero-latency UI updates with useOptimistic hook.",
      "Display accessible server action error messages to screen readers.",
    ],
    prerequisites: ["React Form State", "Next.js App Router"],
    externalUrl: "https://react.dev/reference/react/useOptimistic",
    targetRoles: ["Full-Stack Web Developer", "Frontend Engineer"],
    skillFocus: ["React", "Next.js", "TypeScript"],
    codePreview: `'use client';
import { useOptimistic } from 'react';

export function CommentList({ comments, onAddComment }) {
  const [optimisticList, addOptimistic] = useOptimistic(
    comments,
    (state, newComment) => [...state, { ...newComment, pending: true }]
  );
  return (...);
}`,
  },
  {
    id: "tut-monotonic-stack",
    title: "Monotonic Stack Pattern for Linear Time Problems",
    description: "Master the Monotonic Stack technique to solve Next Greater Element, Daily Temperatures, and Largest Rectangle in Histogram in O(N).",
    category: "Tutorials",
    difficulty: "Intermediate",
    duration: "40 Mins",
    resourceType: "tutorial",
    tags: ["DSA", "LeetCode", "Stack", "Problem Solving"],
    objectives: [
      "Understand when to use strictly increasing vs strictly decreasing stacks.",
      "Solve next greater element queries in single pass O(N) time.",
      "Apply histogram rectangle calculation with stack boundaries.",
    ],
    prerequisites: ["Basic Stack operations (push/pop)"],
    externalUrl: "https://leetcode.com/tag/monotonic-stack",
    targetRoles: ["Software Engineer", "DSA Specialist"],
    skillFocus: ["Algorithms", "Data Structures"],
    codePreview: `function dailyTemperatures(temperatures: number[]): number[] {
  const n = temperatures.length;
  const res = new Array(n).fill(0);
  const stack: number[] = []; // Stores indices
  
  for (let i = 0; i < n; i++) {
    while (stack.length && temperatures[i] > temperatures[stack[stack.length - 1]]) {
      const prevIdx = stack.pop()!;
      res[prevIdx] = i - prevIdx;
    }
    stack.push(i);
  }
  return res;
}`,
  },
  {
    id: "tut-framer-motion",
    title: "Orchestrating Micro-Animations with Framer Motion",
    description: "Create elegant editorial layout transitions, staggered list entrances, layout animations, and respect user reduced-motion preferences.",
    category: "Tutorials",
    difficulty: "Beginner",
    duration: "35 Mins",
    resourceType: "tutorial",
    tags: ["Framer Motion", "React", "CSS", "Animations"],
    objectives: [
      "Coordinate parent-child staggered staggerChildren transitions.",
      "Implement layoutId shared element morphing transitions.",
      "Support prefers-reduced-motion accessibility settings.",
    ],
    prerequisites: ["React Components"],
    externalUrl: "https://www.framer.com/motion",
    targetRoles: ["Frontend Engineer", "UI/UX Developer"],
    skillFocus: ["React", "Tailwind CSS", "Framer Motion"],
    codePreview: `import { motion } from 'framer-motion';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 }
  }
};`,
  },

  // 4. PROJECTS
  {
    id: "proj-saas-workspace",
    title: "Multi-Tenant SaaS Workspace & Permissions API",
    description: "Production project building multi-tenant organization workspaces, RBAC roles (Owner, Member, Guest), audit logs, and JWT cookie auth.",
    category: "Projects",
    difficulty: "Advanced",
    duration: "15 Hours",
    resourceType: "project",
    tags: ["Full-Stack", "RBAC", "PostgreSQL", "Next.js", "Auth"],
    objectives: [
      "Implement multi-tenant data isolation with foreign-key schema scoping.",
      "Enforce role-based access control (RBAC) middleware in Server Actions.",
      "Build immutable audit log pipelines with automated export fixtures.",
    ],
    prerequisites: ["Next.js App Router", "PostgreSQL Basics"],
    externalUrl: "https://github.com",
    targetRoles: ["Full-Stack Web Developer", "Backend Engineer"],
    skillFocus: ["Next.js", "PostgreSQL", "TypeScript", "REST APIs"],
    codePreview: `// Multi-Tenant Isolation Middleware Verification
export async function assertTenantAccess(userId: string, workspaceId: string, requiredRole: Role) {
  const membership = await db.workspaceMember.findUnique({
    where: { userId_workspaceId: { userId, workspaceId } }
  });
  if (!membership || !hasSufficientRole(membership.role, requiredRole)) {
    throw new ForbiddenError("Insufficient workspace permissions.");
  }
  return membership;
}`,
  },
  {
    id: "proj-realtime-broker",
    title: "Distributed Message Broker & WebSockets Service",
    description: "Build an event-driven pub/sub messaging architecture with Redis streams, WebSocket clients, and at-least-once message delivery guarantees.",
    category: "Projects",
    difficulty: "Advanced",
    duration: "18 Hours",
    resourceType: "project",
    tags: ["Redis", "WebSockets", "Node.js", "Distributed Systems"],
    objectives: [
      "Implement Redis Pub/Sub channels with channel multiplexing.",
      "Handle WebSocket heartbeats, reconnection backoffs, and message ACKs.",
      "Benchmark throughput and message delivery latencies under load.",
    ],
    prerequisites: ["Node.js Event Loop", "Basic Networking"],
    externalUrl: "https://redis.io/docs",
    targetRoles: ["Backend Systems Architect", "Distributed Systems Engineer"],
    skillFocus: ["Node.js", "Redis", "REST APIs"],
    codePreview: `import { createClient } from 'redis';

const pub = createClient({ url: process.env.REDIS_URL });
const sub = pub.duplicate();

await pub.connect();
await sub.connect();

await sub.subscribe('workspace:events', (message) => {
  broadcastToConnectedClients(JSON.parse(message));
});`,
  },
];
