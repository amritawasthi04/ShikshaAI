import { DetailedLessonModule } from "./types";

export const fullstackModules: Record<string, DetailedLessonModule> = {
  // Phase 1.1: HTTP/3, TLS & Browser Render Tree Mechanics
  "http3_tls_browser_render_tree": {
    topicId: "fs_1_1",
    title: "HTTP/3, TLS & Browser Render Tree Mechanics",
    subtitle: "Explore QUIC request pipelines, TLS 1.3 handshake, and critical rendering path optimization.",
    domain: "Full-Stack Web Engineering",
    phaseName: "Foundation",
    duration: "30m",
    type: "concept",
    keyObjectives: [
      "Understand QUIC and UDP-based multiplexing solving Head-of-Line blocking in HTTP/3.",
      "Analyze the 1-RTT and 0-RTT TLS 1.3 cryptographic key exchange.",
      "Trace the Critical Rendering Path: DOM + CSSOM ➔ Render Tree ➔ Layout (Reflow) ➔ Paint.",
      "Identify layout shifts and paint bottlenecks using DevTools Performance profiling.",
    ],
    deepDive: {
      overview:
        "Modern web performance begins at the transport layer and ends on the browser compositor thread. While HTTP/2 multiplexed streams over a single TCP connection, packet loss caused TCP Head-of-Line (HoL) blocking across all streams. HTTP/3 replaces TCP with QUIC over UDP, providing independent stream packet recovery and 0-RTT handshakes.",
      mentalModel:
        "Think of HTTP/1.1 as a single-lane highway where cars wait in line. HTTP/2 created a train with multiple cars, but if one wheel slipped, the entire train stopped. HTTP/3 is a fleet of independent flying drones over UDP: if one drone drops, the others continue uninterrupted.",
      coreConcepts: [
        {
          title: "Critical Rendering Path Pipeline",
          description:
            "HTML parses into the DOM tree while CSS parses into the CSSOM. Together they form the Render Tree containing only visible nodes. The layout stage computes exact geometric coordinates, followed by painting pixels into layers composited by the GPU.",
          highlight: "Avoid mutating geometric styles (width, top, margin) during animations; animate transform and opacity.",
        },
      ],
      pitfalls: [
        "Triggering Forced Synchronous Layout: Reading element.offsetHeight immediately after writing element.style.width forces the browser to recalculate layout synchronously in JS.",
      ],
      realWorldApplications:
        "High-scale edge CDNs (Cloudflare, Fastly), real-time financial trading dashboards, and sub-100ms e-commerce landing pages.",
    },
    codeBlueprint: {
      language: "typescript",
      languageBadge: "TypeScript • Web Performance API",
      filename: "criticalRenderingMetrics.ts",
      code: `/**
 * Observes Core Web Vitals and Critical Rendering Path milestones
 * using the modern PerformanceObserver API.
 */
export function registerCriticalRenderingObserver() {
  if (typeof window === "undefined" || !("PerformanceObserver" in window)) {
    return;
  }

  // 1. Observe Largest Contentful Paint (LCP)
  const lcpObserver = new PerformanceObserver((entryList) => {
    const entries = entryList.getEntries();
    const lastEntry = entries[entries.length - 1];
    console.log(\`[CWV] LCP: \${lastEntry.startTime.toFixed(2)}ms\`, lastEntry);
  });
  lcpObserver.observe({ type: "largest-contentful-paint", buffered: true });

  // 2. Measure Server Network Timing (DNS, TLS, TTFB)
  const navObserver = new PerformanceObserver((entryList) => {
    const [nav] = entryList.getEntriesByType("navigation") as PerformanceNavigationTiming[];
    if (nav) {
      console.log({
        protocol: nav.nextHopProtocol, // e.g. "h3" for HTTP/3
        dnsLookup: nav.domainLookupEnd - nav.domainLookupStart,
        tlsHandshake: nav.connectEnd - nav.secureConnectionStart,
        timeToFirstByte: nav.responseStart - nav.requestStart,
        domInteractive: nav.domInteractive,
      });
    }
  });
  navObserver.observe({ type: "navigation", buffered: true });
}`,
      explanation:
        "Registers browser PerformanceObservers to inspect navigation timing, TLS handshake duration, and LCP render metrics.",
    },
    quizQuestions: [
      {
        question: "How does HTTP/3 overcome Head-of-Line blocking compared to HTTP/2?",
        options: [
          "It uses QUIC over UDP, allowing independent packet loss recovery per stream without halting unrelated streams.",
          "It compresses HTTP headers with gzip instead of HPACK.",
          "It forces all assets to load via server-sent events.",
          "It removes TLS encryption entirely.",
        ],
        correctIndex: 0,
        explanation:
          "Because QUIC streams are managed independently over UDP, packet loss on Stream A never delays packets on Stream B.",
      },
    ],
    resources: [
      {
        title: "MDN Web Docs: Critical Rendering Path",
        url: "https://developer.mozilla.org/en-US/docs/Web/Performance/Critical_rendering_path",
        type: "documentation",
        description: "Official guide to DOM, CSSOM, Render Tree, and layout pipelines.",
      },
      {
        title: "Cloudflare: What is HTTP/3 and QUIC?",
        url: "https://www.cloudflare.com/learning/performance/what-is-http3/",
        type: "article",
        description: "Deep dive on 0-RTT handshakes and UDP stream multiplexing.",
      },
    ],
  },

  // Phase 1.2: Modern TypeScript Generics & Type Narrowing
  "typescript_generics_type_narrowing": {
    topicId: "fs_1_2",
    title: "Modern TypeScript Generics & Type Narrowing",
    subtitle: "Master strict utility types, discriminated unions, template literals, and type guards.",
    domain: "Full-Stack Web Engineering",
    phaseName: "Foundation",
    duration: "45m",
    type: "exercise",
    keyObjectives: [
      "Construct advanced generic constraints with conditional types (T extends U ? X : Y).",
      "Model domain state transitions safely with Discriminated Unions and exhaustiveness checking.",
      "Write custom type predicates (is) and assertion functions.",
      "Leverage infer keywords to unpack deeply nested asynchronous payloads.",
    ],
    deepDive: {
      overview:
        "TypeScript is not just static typing—it is a turing-complete type system. Production software achieves resilience by representing domain constraints directly in the type graph, eliminating entire classes of runtime null errors and unhandled state transitions.",
      mentalModel:
        "Think of types as physical slots on a coin sorting machine. Generics are adjustable templates that fit coins of any diameter while retaining exact millimeter dimensions, preventing pennies from being processed as quarters.",
      coreConcepts: [
        {
          title: "Discriminated Unions & Exhaustiveness",
          description:
            "A discriminated union assigns a shared literal discriminator property (e.g. status: 'loading' | 'success' | 'error') across multiple interfaces. Using never in a switch default block guarantees compile-time exhaustiveness checking.",
          highlight: "Never use any or loose optional fields when a union of discrete states accurately describes reality.",
        },
      ],
      pitfalls: [
        "Relying on type assertions (as Type) to silence compiler warnings instead of validating runtime schema boundaries.",
      ],
      realWorldApplications:
        "Used across state machines (XState), API response contracts (tRPC, Zod), and scalable component libraries.",
    },
    codeBlueprint: {
      language: "typescript",
      languageBadge: "TypeScript 5.x",
      filename: "resultTypeNarrowing.ts",
      code: `/**
 * Robust Result Pattern with Discriminated Union and Exhaustive Guard
 */
export type Result<T, E = Error> =
  | { readonly success: true; readonly data: T }
  | { readonly success: false; readonly error: E };

export function assertUnreachable(x: never): never {
  throw new Error(\`Unhandled state discriminator: \${JSON.stringify(x)}\`);
}

export function handleOperationResult<T>(result: Result<T>): string {
  // TypeScript narrows type based on result.success
  if (result.success) {
    return \`Data processed: \${JSON.stringify(result.data)}\`;
  } else {
    return \`Error encountered: \${result.error.message}\`;
  }
}

// Unpack Async Return Type with Conditional Generics
export type UnwrapPromise<T> = T extends Promise<infer U> ? U : T;`,
      explanation: "Defines a strictly typed functional Result monad pattern with type narrowing and exhaustiveness checking.",
    },
    quizQuestions: [
      {
        question: "What is the primary benefit of a discriminated union in TypeScript?",
        options: [
          "It allows the compiler to narrow down object properties automatically based on a shared literal discriminant field.",
          "It compiles down to smaller JavaScript bundle size.",
          "It converts objects into binary WebAssembly buffers.",
          "It allows circular references without memory leaks.",
        ],
        correctIndex: 0,
        explanation:
          "By checking the discriminant property, TypeScript knows the exact type of the object and provides strict autocomplete.",
      },
    ],
    resources: [
      {
        title: "TypeScript Handbook: Narrowing & Generics",
        url: "https://www.typescriptlang.org/docs/handbook/2/narrowing.html",
        type: "documentation",
        description: "Official guide to type predicates, equality narrowing, and discriminated unions.",
      },
    ],
  },

  // Phase 1.3: App Router Directory Structure & Server Components
  "app_router_server_components": {
    topicId: "fs_1_3",
    title: "App Router Directory Structure & Server Components",
    subtitle: "React Server Components (RSC) wire formats, streaming suspense, and layout boundaries.",
    domain: "Full-Stack Web Engineering",
    phaseName: "Foundation",
    duration: "40m",
    type: "concept",
    keyObjectives: [
      "Understand the React Server Component (RSC) boundary and flight serialization wire protocol.",
      "Distinguish Server Components (zero client JS) from Client Components ('use client').",
      "Structure layout hierarchies with nested routes, template.tsx, and loading.tsx streaming.",
      "Safely pass server promises and serialized props across component boundaries.",
    ],
    deepDive: {
      overview:
        "Next.js App Router fundamentally shifts React from a client-rendered SPA framework into a unified server-first paradigm. React Server Components execute exclusively on the server, streaming a lightweight virtual DOM JSON wire format to the browser with zero client JavaScript bundle overhead.",
      mentalModel:
        "Think of Server Components as an industrial prep kitchen. Large ingredients (databases, heavy markdown parsers, API secrets) stay in the kitchen. Only the finished plated meal (HTML and lightweight interactive widgets) gets delivered to the customer table.",
      coreConcepts: [
        {
          title: "The 'use client' Directive",
          description:
            "'use client' does not mean 'runs only on the client'—it marks the boundary between the server-only module graph and the client bundle that undergoes browser hydration and stateful interactivity.",
          highlight: "Server components can import client components, but client components cannot import server components directly.",
        },
      ],
      pitfalls: [
        "Placing 'use client' at the top of root layouts or pages unnecessarily, losing streaming and server-side data fetching benefits.",
      ],
      realWorldApplications:
        "Modern production platforms like Vercel, Stripe, GitHub, and Shopify use RSC to achieve near-instant initial page loads.",
    },
    codeBlueprint: {
      language: "typescript",
      languageBadge: "Next.js App Router • RSC",
      filename: "app/dashboard/page.tsx",
      code: `import { Suspense } from "react";

// Server Component (Executes on Server, Zero Client Bundle)
async function MetricCard({ title, fetchFn }: { title: string; fetchFn: () => Promise<number> }) {
  const value = await fetchFn();
  return (
    <div className="p-4 rounded-lg border border-[#D8C8BA] bg-[#F6F1E9]">
      <p className="text-xs uppercase text-[#292827]/60 font-semibold">{title}</p>
      <p className="text-2xl font-bold text-[#54252C]">{value}</p>
    </div>
  );
}

export default async function DashboardPage() {
  return (
    <main className="p-8 max-w-5xl mx-auto space-y-6">
      <h1 className="text-2xl font-serif font-bold text-[#292827]">Engineering Telemetry</h1>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Streaming Suspense boundary renders skeleton while async component resolves */}
        <Suspense fallback={<div className="h-24 bg-[#D8C8BA]/30 animate-pulse rounded-lg" />}>
          <MetricCard title="Active Learners" fetchFn={async () => 1420} />
        </Suspense>
      </div>
    </main>
  );
}`,
      explanation: "Demonstrates asynchronous Server Component data fetching with React Suspense streaming fallback.",
    },
    quizQuestions: [
      {
        question: "What payload do React Server Components send to the browser?",
        options: [
          "A compact JSON-based virtual DOM flight stream, not raw component JavaScript.",
          "Complete minified JavaScript bundle for hydration.",
          "Only raw HTML with no React capability.",
          "A WebAssembly binary file.",
        ],
        correctIndex: 0,
        explanation:
          "RSCs stream a serialized React Flight format that the client reconciler merges with the DOM with zero bundle cost.",
      },
    ],
    resources: [
      {
        title: "Next.js Official Documentation: Server Components",
        url: "https://nextjs.org/docs/app/building-your-application/rendering/server-components",
        type: "documentation",
        description: "Comprehensive guide to RSC lifecycles, benefits, and patterns.",
      },
    ],
  },

  // Phase 3.1: Server Actions Deep Dive & Security Model
  "server_actions_security_model": {
    topicId: "fs_3_1",
    title: "Server Actions Deep Dive & Security Model",
    subtitle: "Protect against CSRF, validate server payloads with Zod, and manage revalidation tags.",
    domain: "Full-Stack Web Engineering",
    phaseName: "Advanced Topics",
    duration: "45m",
    type: "concept",
    keyObjectives: [
      "Understand Server Actions as POST RPC endpoints with automated CSRF token verification.",
      "Validate untrusted client payloads using schema libraries (Zod) on the server boundary.",
      "Manage cache invalidation using revalidatePath and revalidateTag.",
      "Implement optimistic updates and pending state with useActionState and useTransition.",
    ],
    deepDive: {
      overview:
        "Server Actions enable direct server mutations invoked seamlessly from client components or progressive enhancement HTML forms. Under the hood, Next.js generates cryptographic action IDs and executes encrypted POST requests with Host and Origin header verification.",
      mentalModel:
        "Think of a Server Action as a bank teller window. The client presents a deposit slip (form data). The teller validates your identity and account rules on the secure server side before updating the database ledger, then hands back an updated balance receipt.",
      coreConcepts: [
        {
          title: "Progressive Enhancement & Security",
          description:
            "Server Actions work even if client JavaScript fails to load or is disabled. However, because they are public POST endpoints, you must authenticate sessions and validate input schemas inside the action body.",
          highlight: "Never trust client-supplied user IDs; retrieve learner identity strictly from verified server session cookies.",
        },
      ],
      pitfalls: [
        "Forgetting to validate input schemas, assuming client-side form validation is sufficient protection.",
      ],
      realWorldApplications:
        "Production form mutations, checkout flows, user profile settings, and authenticated document uploads.",
    },
    codeBlueprint: {
      language: "typescript",
      languageBadge: "TypeScript • Next.js Server Action",
      filename: "actions/updateMilestone.ts",
      code: `"use server";

import { revalidatePath } from "next/cache";

interface ActionResult {
  success: boolean;
  message: string;
}

export async function markMilestoneCompleteAction(
  prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const milestoneId = formData.get("milestoneId") as string;

  // 1. Validate payload boundaries
  if (!milestoneId || typeof milestoneId !== "string") {
    return { success: false, message: "Invalid milestone identifier" };
  }

  // 2. Perform authenticated backend mutation
  console.log(\`[Server Mutation] Completing milestone: \${milestoneId}\`);

  // 3. Purge stale cache for learning path page
  revalidatePath("/learning-path");

  return { success: true, message: \`Milestone \${milestoneId} verified.\` };
}`,
      explanation: "Type-safe Next.js Server Action with input validation, cache revalidation, and standard return contracts.",
    },
    quizQuestions: [
      {
        question: "Why must input validation always occur inside a Server Action even if the client form validates with Zod?",
        options: [
          "Because any user or bot can bypass the frontend UI and send arbitrary POST requests directly to the server endpoint.",
          "Because Next.js strips client Zod schemas during compilation.",
          "Server Actions cannot read client types.",
          "To speed up database transactions.",
        ],
        correctIndex: 0,
        explanation:
          "The browser is an untrusted environment. Server actions are exposed HTTP endpoints and must perform server-side validation.",
      },
    ],
    resources: [
      {
        title: "Next.js Documentation: Server Actions and Mutations",
        url: "https://nextjs.org/docs/app/building-your-application/data-mutation/server-actions-and-mutations",
        type: "documentation",
        description: "Official guide to Server Action conventions, security, and revalidation.",
      },
    ],
  },

  // Phase 4.1: PostgreSQL Schema Design & Prisma ORM
  "postgresql_schema_prisma_orm": {
    topicId: "fs_4_1",
    title: "PostgreSQL Schema Design & Prisma ORM",
    subtitle: "Model 1-to-many and many-to-many relations with foreign keys, indexes, and migrations.",
    domain: "Full-Stack Web Engineering",
    phaseName: "Practice & Projects",
    duration: "45m",
    type: "concept",
    keyObjectives: [
      "Design normalized relational schemas respecting 1NF, 2NF, and 3NF database forms.",
      "Define foreign key constraints with ON DELETE CASCADE and referential integrity.",
      "Create high-performance multi-column B-Tree composite indexes for frequent query paths.",
      "Execute safe zero-downtime database migrations with Prisma migrate and Prisma Client.",
    ],
    deepDive: {
      overview:
        "A well-architected database schema is the bedrock of application scalability. Relational databases like PostgreSQL enforce strict ACID guarantees. Prisma ORM bridges TypeScript types with database schemas, generating type-safe query builders.",
      mentalModel:
        "Think of a relational schema as an architectural blueprint for a skyscraper. Foreign keys are the steel bolts holding floors together. Without indexes, a query scans every floor from basement to roof; with indexes, an express elevator takes you directly to the exact office.",
      coreConcepts: [
        {
          title: "Referential Integrity & Cascades",
          description:
            "Foreign keys guarantee that a child row cannot point to a non-existent parent row. Setting onDelete: Cascade automatically purges orphaned records when parent entities are deleted.",
          highlight: "Always index foreign key columns to avoid full table scans during JOIN operations.",
        },
      ],
      pitfalls: [
        "N+1 Query Problem: Executing a separate query inside a loop for each child entity instead of using Prisma include or SQL JOIN.",
      ],
      realWorldApplications:
        "Enterprise SaaS user accounts, subscription billing ledgers, and e-commerce inventory management.",
    },
    codeBlueprint: {
      language: "typescript",
      languageBadge: "Prisma Schema • TypeScript",
      filename: "prisma/schema.prisma",
      code: `datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model Learner {
  id        String     @id @default(uuid())
  email     String     @unique
  name      String
  createdAt DateTime   @default(now())
  roadmaps  Roadmap[]
  sessions  StudySession[]

  @@index([email])
}

model Roadmap {
  id         String     @id @default(cuid())
  learnerId  String
  learner    Learner    @relation(fields: [learnerId], references: [id], onDelete: Cascade)
  title      String
  progress   Int        @default(0)
  milestones Milestone[]

  @@index([learnerId])
}

model Milestone {
  id        String   @id @default(cuid())
  roadmapId String
  roadmap   Roadmap  @relation(fields: [roadmapId], references: [id], onDelete: Cascade)
  title     String
  completed Boolean  @default(false)
  updatedAt DateTime @updatedAt

  @@index([roadmapId, completed])
}`,
      explanation: "Production Prisma schema defining relations, cascade rules, and optimized composite indexes.",
    },
    quizQuestions: [
      {
        question: "What is the primary risk of missing an index on a foreign key column in PostgreSQL?",
        options: [
          "Cascading deletes and JOIN operations will perform full sequential table scans, severely degrading query performance as tables grow.",
          "PostgreSQL will refuse to start the database engine.",
          "Foreign keys cannot be created without unique indexes.",
          "Data will be corrupted during power outages.",
        ],
        correctIndex: 0,
        explanation:
          "PostgreSQL does not automatically index foreign key columns. Without an explicit index, every parent delete triggers a full sequential scan on the child table.",
      },
    ],
    resources: [
      {
        title: "Prisma Documentation: Relations and Indexes",
        url: "https://www.prisma.io/docs/concepts/components/prisma-schema/relations",
        type: "documentation",
        description: "Official guide to 1-to-many, many-to-many, and cascade behaviors.",
      },
    ],
  },
};
