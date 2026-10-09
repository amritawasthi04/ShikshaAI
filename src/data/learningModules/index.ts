import { DetailedLessonModule } from "./types";
import { aimlModules } from "./aimlModules";
import { fullstackModules } from "./fullstackModules";
import { dsaModules } from "./dsaModules";
import { backendModules } from "./backendModules";
import { cloudModules } from "./cloudModules";
import { mobileModules } from "./mobileModules";
import { synthesizeLessonModule } from "./synthesizer";
import { RoadmapLesson, RoadmapPhase } from "@/types/roadmap";

export * from "./types";
export { synthesizeLessonModule };

// Unified dictionary of all curated modules
const allCuratedModules: Record<string, DetailedLessonModule> = {
  ...aimlModules,
  ...fullstackModules,
  ...dsaModules,
  ...backendModules,
  ...cloudModules,
  ...mobileModules,
};

/**
 * Resolves a comprehensive, authoritative learning module for any lesson.
 * Guarantees zero generic boilerplate across all roadmaps and elective milestones.
 */
export function getDetailedLessonModule(
  lesson: RoadmapLesson | null,
  phase?: RoadmapPhase | null
): DetailedLessonModule {
  if (!lesson) {
    return synthesizeLessonModule(
      {
        id: "placeholder",
        title: "Curriculum Milestone",
        description: "Select a lesson to begin learning.",
        duration: "30m",
        type: "concept",
        completed: false,
        status: "current",
      },
      phase
    );
  }

  const titleLower = (lesson.title || "").toLowerCase();
  const descLower = (lesson.description || "").toLowerCase();
  const combined = `${titleLower} ${descLower}`;

  // 1. Direct key match:
  const normalizedKey = titleLower.replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
  if (allCuratedModules[normalizedKey]) {
    return enrichWithLessonOverrides(allCuratedModules[normalizedKey], lesson, phase);
  }

  // 2. High-precision semantic & keyword matchers:
  // Matrix Multiplications & Eigenvectors (Highlighted in User Screenshots)
  if (combined.includes("matrix") || combined.includes("eigenvector") || combined.includes("eigenvalues") || combined.includes("vector space")) {
    return enrichWithLessonOverrides(aimlModules["matrix_multiplications_eigenvectors"], lesson, phase);
  }

  // NumPy Vectorized Operations & Broadcasting
  if (combined.includes("numpy") || (combined.includes("vectorized") && combined.includes("broadcasting"))) {
    return enrichWithLessonOverrides(aimlModules["numpy_vectorized_operations_broadcasting"], lesson, phase);
  }

  // Data Cleaning & Pandas Feature Engineering
  if (combined.includes("pandas") || combined.includes("feature engineering") || combined.includes("data cleaning")) {
    return enrichWithLessonOverrides(aimlModules["data_cleaning_feature_engineering_pandas"], lesson, phase);
  }

  // Gradient Descent & Optimization
  if (combined.includes("gradient descent") || combined.includes("cost function") || combined.includes("adamw")) {
    return enrichWithLessonOverrides(aimlModules["gradient_descent_optimization_cost_functions"], lesson, phase);
  }

  // Transformer & Multi-Head Attention
  if (combined.includes("transformer") || combined.includes("multi-head") || combined.includes("self-attention")) {
    return enrichWithLessonOverrides(aimlModules["transformer_architecture_multihead_attention"], lesson, phase);
  }

  // HTTP/3, TLS & Render Tree
  if (combined.includes("http/3") || combined.includes("render tree") || combined.includes("tls") || combined.includes("quic")) {
    return enrichWithLessonOverrides(fullstackModules["http3_tls_browser_render_tree"], lesson, phase);
  }

  // TypeScript Generics
  if (combined.includes("generics") || (combined.includes("typescript") && combined.includes("narrowing"))) {
    return enrichWithLessonOverrides(fullstackModules["typescript_generics_type_narrowing"], lesson, phase);
  }

  // App Router & Server Components
  if (combined.includes("app router") || combined.includes("server component") || combined.includes("rsc")) {
    return enrichWithLessonOverrides(fullstackModules["app_router_server_components"], lesson, phase);
  }

  // Server Actions
  if (combined.includes("server action") || combined.includes("mutation pipeline")) {
    return enrichWithLessonOverrides(fullstackModules["server_actions_security_model"], lesson, phase);
  }

  // PostgreSQL Schema Design & Prisma
  if (combined.includes("prisma") || (combined.includes("postgresql") && combined.includes("schema"))) {
    return enrichWithLessonOverrides(fullstackModules["postgresql_schema_prisma_orm"], lesson, phase);
  }

  // Big-O & Complexity
  if (combined.includes("big-o") || combined.includes("asymptotic") || combined.includes("complexity")) {
    return enrichWithLessonOverrides(dsaModules["big_o_asymptotic_bounds"], lesson, phase);
  }

  // Two-Pointer & Sliding Window
  if (combined.includes("two-pointer") || combined.includes("sliding window")) {
    return enrichWithLessonOverrides(dsaModules["two_pointer_sliding_window"], lesson, phase);
  }

  // Graph BFS/DFS
  if (combined.includes("graph") && (combined.includes("bfs") || combined.includes("dfs") || combined.includes("cycle"))) {
    return enrichWithLessonOverrides(dsaModules["graph_representations_bfs_dfs"], lesson, phase);
  }

  // Event Loop & Async I/O
  if (combined.includes("event loop") || combined.includes("async io") || combined.includes("libuv")) {
    return enrichWithLessonOverrides(backendModules["event_loop_async_io"], lesson, phase);
  }

  // Transaction Isolation
  if (combined.includes("isolation level") || combined.includes("serializable") || combined.includes("dirty read")) {
    return enrichWithLessonOverrides(backendModules["transaction_isolation_levels"], lesson, phase);
  }

  // Redis Caching & Stampede
  if (combined.includes("redis") || combined.includes("cache stampede") || combined.includes("cache invalidation")) {
    return enrichWithLessonOverrides(backendModules["redis_cache_invalidation_stampede"], lesson, phase);
  }

  // Linux Systemd & Daemons
  if (combined.includes("systemd") || combined.includes("daemon") || combined.includes("linux file")) {
    return enrichWithLessonOverrides(cloudModules["linux_systemd_daemons"], lesson, phase);
  }

  // Docker Multi-stage & Caching
  if (combined.includes("docker") || combined.includes("containerization") || combined.includes("multistage")) {
    return enrichWithLessonOverrides(cloudModules["docker_multistage_caching"], lesson, phase);
  }

  // React Native Yoga
  if (combined.includes("yoga") || combined.includes("react native") || combined.includes("mobile layout")) {
    return enrichWithLessonOverrides(mobileModules["react_native_yoga_engine"], lesson, phase);
  }

  // 3. Fallback to intelligent dynamic synthesis for any custom/unmatched milestone
  return synthesizeLessonModule(lesson, phase);
}

function enrichWithLessonOverrides(
  module: DetailedLessonModule,
  lesson: RoadmapLesson,
  phase?: RoadmapPhase | null
): DetailedLessonModule {
  return {
    ...module,
    title: lesson.title || module.title,
    subtitle: lesson.description || module.subtitle,
    duration: lesson.duration || module.duration,
    type: lesson.type || module.type,
    phaseName: phase?.phaseName || module.phaseName,
    keyObjectives:
      lesson.keyObjectives && lesson.keyObjectives.length > 0
        ? lesson.keyObjectives
        : module.keyObjectives,
    codeBlueprint: {
      ...module.codeBlueprint,
      code: lesson.codeSnippet || module.codeBlueprint.code,
    },
    resources:
      lesson.resources && lesson.resources.length > 0
        ? [
            ...lesson.resources.map((r) => ({
              title: r.title,
              url: r.url || module.resources[0]?.url || "https://developer.mozilla.org",
              type: r.type,
              description: `Authoritative reference for ${lesson.title}`,
              sourceLabel: "Curated Reference",
            })),
            ...module.resources.filter((mr) => !lesson.resources?.some((lr) => lr.title === mr.title)),
          ]
        : module.resources,
  };
}
