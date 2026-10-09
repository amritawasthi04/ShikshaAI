import { NextRequest, NextResponse } from "next/server";

interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

interface UserContext {
  targetGoal?: string;
  experienceLevel?: string;
  knownSkills?: string[];
}

const CANDIDATE_GEMINI_MODELS = [
  "gemini-3.5-flash-lite",
  "gemini-flash-lite-latest",
  "gemini-3.1-flash-lite",
  "gemini-flash-latest",
];

/**
 * Format conversation history into valid Gemini REST API contents:
 * - Alternating user / model turns
 * - Must begin with a 'user' turn
 * - Consecutive messages of same role merged
 */
function buildGeminiContents(messages: ChatMessage[]) {
  const filtered = messages.filter((m) => m.content && m.content.trim().length > 0);
  const geminiContents: Array<{ role: "user" | "model"; parts: Array<{ text: string }> }> = [];

  let hasStarted = false;

  for (const m of filtered) {
    const role: "user" | "model" = m.role === "assistant" ? "model" : "user";

    if (!hasStarted) {
      if (role === "user") {
        hasStarted = true;
        geminiContents.push({ role: "user", parts: [{ text: m.content.trim() }] });
      }
    } else {
      const last = geminiContents[geminiContents.length - 1];
      if (last && last.role === role) {
        last.parts[0].text += `\n\n${m.content.trim()}`;
      } else {
        geminiContents.push({ role, parts: [{ text: m.content.trim() }] });
      }
    }
  }

  // Fallback: If no valid sequence could be constructed, take the last message as user query
  if (geminiContents.length === 0 && filtered.length > 0) {
    geminiContents.push({
      role: "user",
      parts: [{ text: filtered[filtered.length - 1].content.trim() }],
    });
  }

  return geminiContents;
}

/**
 * Comprehensive Pedagogical Knowledge Fallback for Offline / Degraded Mode
 * Answers user queries across CS topics, algorithms, languages, frameworks, system design, and debugging.
 */
function generateEducationalFallbackReply(userPrompt: string, userContext?: UserContext): string {
  const q = userPrompt.toLowerCase();
  const goal = userContext?.targetGoal || "Software Engineering";
  const exp = userContext?.experienceLevel || "Intermediate";

  // 1. Quicksort or Sorting Algorithms
  if (q.includes("quicksort") || q.includes("quick sort")) {
    return `### ⚡ Quicksort: Divide-and-Conquer Sorting

**Quicksort** is one of the most efficient sorting algorithms. It operates by selecting a **pivot element** and partitioning the array around it.

#### 1. How It Works
1. **Choose a Pivot:** Pick an element from the array (e.g., first, last, or random).
2. **Partition:** Rearrange elements so that all elements smaller than the pivot are on its left, and all greater elements are on its right.
3. **Recurse:** Recursively apply the above steps to the left and right sub-arrays.

\`\`\`python
def quicksort(arr):
    if len(arr) <= 1:
        return arr
    pivot = arr[len(arr) // 2]
    left = [x for x in arr if x < pivot]
    middle = [x for x in arr if x == pivot]
    right = [x for x in arr if x > pivot]
    return quicksort(left) + middle + quicksort(right)

# Example execution:
print(quicksort([38, 27, 43, 3, 9, 82, 10]))
# Output: [3, 9, 10, 27, 38, 43, 82]
\`\`\`

#### 2. Complexity Analysis
- **Average Time Complexity:** $O(n \\log n)$
- **Worst-Case Time Complexity:** $O(n^2)$ (occurs when pivot is repeatedly the smallest or largest element)
- **Space Complexity:** $O(\\log n)$ due to recursive stack frames.

> [!TIP]
> **Production Best Practice:** To avoid $O(n^2)$ worst cases, real-world implementations use **randomized pivots** or **median-of-three** heuristics.

Would you like to analyze an in-place partition implementation with pointer swapping?`;
  }

  // 2. Binary Search or Searching
  if (q.includes("binary search") || q.includes("binarysearch")) {
    return `### 🔍 Binary Search: $O(\\log n)$ Divide-and-Conquer

**Binary Search** is an optimal search algorithm for **sorted collections**. It cuts the search interval in half with each iteration.

#### Python Implementation
\`\`\`python
def binary_search(arr, target):
    left, right = 0, len(arr) - 1

    while left <= right:
        mid = left + (right - left) // 2  # Prevents integer overflow
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1

    return -1  # Target not found
\`\`\`

#### Key Takeaways
- **Precondition:** The input array must be sorted.
- **Time Complexity:** $O(\\log n)$
- **Space Complexity:** $O(1)$ iterative, $O(\\log n)$ recursive.

Would you like to see how to find the first or last occurrence of duplicate items?`;
  }

  // 3. Trees, Graphs & BST
  if (q.includes("binary tree") || q.includes("bst") || q.includes("graph") || q.includes("tree")) {
    return `### 🌳 Binary Search Trees (BST) & Hierarchical Data

A **Binary Search Tree** is a node-based binary tree data structure with the following invariant:
- The **left subtree** of a node contains only nodes with keys lesser than the node's key.
- The **right subtree** of a node contains only nodes with keys greater than the node's key.
- Both subtrees must also be binary search trees.

\`\`\`typescript
class TreeNode<T> {
  value: T;
  left: TreeNode<T> | null = null;
  right: TreeNode<T> | null = null;

  constructor(value: T) {
    this.value = value;
  }
}

// In-order traversal produces sorted output
function inOrderTraversal<T>(root: TreeNode<T> | null, result: T[] = []): T[] {
  if (!root) return result;
  inOrderTraversal(root.left, result);
  result.push(root.value);
  inOrderTraversal(root.right, result);
  return result;
}
\`\`\`

#### Performance Characteristics
- **Search / Insert / Delete (Balanced):** $O(\\log n)$
- **Search / Insert / Delete (Degenerate):** $O(n)$ (resembles a linked list)
- **Self-Balancing Trees:** AVL trees and Red-Black trees ensure height stays $O(\\log n)$.

Ready to explore tree balancing rotations or graph traversal (BFS / DFS)?`;
  }

  // 4. React, Next.js & Frontend State
  if (q.includes("react") || q.includes("next.js") || q.includes("component") || q.includes("hook") || q.includes("state")) {
    return `### ⚛️ Modern React & Next.js Architecture

In modern React 19 and Next.js App Router, applications distinguish between **Server Components** and **Client Components**:

1. **Server Components (Default):**
   - Execute strictly on the server during request time or build time.
   - Zero impact on client JavaScript bundle size.
   - Can directly read from databases, file systems, and internal microservices.

2. **Client Components (\`'use client'\`):**
   - Hydrated in the browser to enable interactivity, DOM listeners, and browser APIs (\`localStorage\`, \`navigator\`).
   - Use standard React hooks: \`useState\`, \`useEffect\`, \`useMemo\`, \`useCallback\`.

\`\`\`tsx
"use client";

import React, { useState, useEffect } from "react";

export function StudyTracker({ topic }: { topic: string }) {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(timer); // Crucial cleanup preventing memory leaks
  }, []);

  return (
    <div className="p-4 rounded-lg border border-[#D8C8BA] bg-[#F6F1E9]">
      <h3 className="font-semibold text-sm text-[#292827]">Active Topic: {topic}</h3>
      <p className="text-xs text-[#54252C] font-mono mt-1">Study Duration: {seconds}s</p>
    </div>
  );
}
\`\`\`

> [!TIP]
> Keep the client boundary as deep in your component tree as possible to maximize server rendering benefits.

Would you like to explore server actions, state synchronization, or custom hook design?`;
  }

  // 5. Docker, DevOps & Cloud
  if (q.includes("docker") || q.includes("kubernetes") || q.includes("devops") || q.includes("container")) {
    return `### 🐳 Containerization & Docker Foundations

**Docker** packages applications alongside their complete runtime dependencies into lightweight, isolated units called containers.

#### 1. Core Concepts
- **Image:** A read-only template built from instructions in a \`Dockerfile\`.
- **Container:** A runnable, isolated instance of an image.
- **Volume:** Persistent storage decoupled from the container lifecycle.

#### Example Production Multi-Stage Dockerfile
\`\`\`dockerfile
# Stage 1: Build dependencies
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Minimal Production Runtime
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
RUN npm ci --only=production
USER node
EXPOSE 3000
CMD ["npm", "start"]
\`\`\`

> [!TIP]
> **Multi-Stage Builds** dramatically reduce production image footprints and prevent dev tools from leaking into deployment.

Would you like to explore Docker Compose networking or Kubernetes pods?`;
  }

  // 6. Databases, SQL & Storage
  if (q.includes("database") || q.includes("sql") || q.includes("postgres") || q.includes("mongodb") || q.includes("redis")) {
    return `### 🗄️ Database Architecture: Relational vs Document Stores

Choosing between relational (PostgreSQL) and document (MongoDB) databases depends on data integrity versus schema flexibility:

| Dimension | PostgreSQL (RDBMS) | MongoDB (NoSQL) | Redis (In-Memory) |
| :--- | :--- | :--- | :--- |
| **Data Model** | Tables, Rows, Foreign Keys | JSON-like BSON Documents | Key-Value, Hashes, Lists |
| **Integrity** | Strict ACID Transactions | Tunable Consistency | Single-threaded in-memory |
| **Use Case** | Financial, relational core data | Catalogs, polymorphic payloads | Session caches, rate limiters |

#### High-Performance Indexing Query
\`\`\`sql
-- Create composite B-Tree index for filtered range queries
CREATE INDEX idx_learner_progress ON study_sessions (learner_id, created_at DESC);

-- Fast execution utilizing index scan
SELECT lesson_id, SUM(active_seconds) as total_time
FROM study_sessions
WHERE learner_id = 'usr_102' AND created_at >= NOW() - INTERVAL '30 days'
GROUP BY lesson_id;
\`\`\`

Would you like to discuss normalization strategies or caching patterns like Cache-Aside?`;
  }

  // 7. Study Planning & Roadmaps
  if (q.includes("plan") || q.includes("study") || q.includes("roadmap") || q.includes("curriculum")) {
    return `### 📅 Structured Mastery Blueprint

Calibrated for your **${goal}** path (${exp} level):

| Phase | Milestone Objective | Core Competencies | Study Hours |
| :--- | :--- | :--- | :--- |
| **Week 1** | **Foundations & Core Syntax** | Language idioms, types, and runtime environment | 8 - 10 hrs |
| **Week 2** | **Data Structures & Design** | Optimal memory structures and component architecture | 10 - 12 hrs |
| **Week 3** | **APIs & Database Persistence** | REST/RPC endpoints, transactions, and indexing | 10 - 12 hrs |
| **Week 4** | **Testing & Capstone Deploy** | Integration testing, CI/CD, and production polish | 12 - 14 hrs |

> [!TIP]
> **Consistent Cadence:** 45 minutes of daily focused coding builds deeper neuromuscular memory than 8 hours crammed in a single weekend.

Would you like to adjust this schedule or focus on specific technical milestones?`;
  }

  // 8. Quizzes & Checkpoints
  if (q.includes("quiz") || q.includes("test me") || q.includes("question")) {
    return `### 🧠 Knowledge Check: Conceptual Challenge

Let's test your understanding of core software engineering:

**Question:** What is the primary difference between synchronous and asynchronous execution in single-threaded runtimes like JavaScript?

- **A)** Synchronous execution runs on multiple CPU cores in parallel.
- **B)** Asynchronous execution delegates I/O operations to the system kernel/event loop, keeping the main call stack non-blocking.
- **C)** Asynchronous execution converts functions into bytecode ahead of time.
- **D)** Synchronous code cannot return primitive data types.

Reply with your answer (**A, B, C, or D**) and I'll break down the result!`;
  }

  if (q === "b" || q.includes("b)")) {
    return `### ✅ Correct! Excellent Insight!

**Option B is correct.** In single-threaded runtimes like Node.js and browser JavaScript, asynchronous operations (network requests, timer callbacks, disk I/O) are offloaded to background worker threads or OS kernel APIs.

When an operation completes, its callback is enqueued onto the **Task Queue / Microtask Queue**, and executed once the main call stack empties.

Ready for another challenge, or would you like to explore the Event Loop phases?`;
  }

  // 9. Generic Detailed Pedagogical Fallback
  return `### 🎓 Shiksha AI Assistant

I'm here to help you accelerate your mastery on the **${goal}** track (${exp} level).

Here are practical ways I can support your learning:
- **Concept Explanations:** Ask me to break down any algorithm, data structure, or architectural pattern in plain language.
- **Code Generation & Review:** Ask me to write or debug code in TypeScript, Python, Go, C++, Rust, or SQL.
- **Milestone Planning:** Ask for a personalized study schedule tailored to your weekly availability.
- **Interactive Quizzing:** Test your readiness with targeted checkpoint questions.

To get started, tell me what specific topic or question you'd like to explore!`;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages, userContext } = body as {
      messages: ChatMessage[];
      userContext?: UserContext;
    };

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "Invalid request: messages array is required." },
        { status: 400 }
      );
    }

    const lastMessage = messages[messages.length - 1];
    const userPrompt = lastMessage.content?.trim() || "";

    if (!userPrompt) {
      return NextResponse.json(
        { error: "Message content cannot be empty." },
        { status: 400 }
      );
    }

    const backendUrl = process.env.BACKEND_URL || "http://127.0.0.1:8000";
    const learnerId = req.headers.get("x-learner-id") || "usr_student_1";

    // 1. First attempt: FastAPI Backend Teacher Brain (Elara Agentic Engine)
    try {
      const convoRes = await fetch(`${backendUrl}/api/v1/conversations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Learner-Id": learnerId,
        },
        body: JSON.stringify({
          title: `Tutoring: ${userContext?.targetGoal || "General Track"}`,
        }),
        signal: AbortSignal.timeout(4000),
      });

      if (convoRes.ok) {
        const convoData = await convoRes.json();
        const convoId = convoData.conversation_id;

        const msgRes = await fetch(
          `${backendUrl}/api/v1/conversations/${convoId}/messages`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-Learner-Id": learnerId,
            },
            body: JSON.stringify({ content: userPrompt }),
            signal: AbortSignal.timeout(12000),
          }
        );

        if (msgRes.ok) {
          const msgData = await msgRes.json();
          if (msgData.content && msgData.content.trim()) {
            return NextResponse.json({
              reply: msgData.content,
              provider: "Teacher Brain (Elara Agentic Engine)",
              isLiveAI: true,
              conversationId: convoId,
            });
          }
        }
      }
    } catch {
      // Backend not running or timeout; seamlessly continue to direct Gemini live gateway
    }

    // 2. Direct Google Gemini Live Model Gateway
    const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

    if (geminiKey) {
      const geminiContents = buildGeminiContents(messages);

      const systemInstructionText = [
        "You are Shiksha Bot, an expert, encouraging, and patient pedagogical AI tutor and engineering companion for ShikshaAI.",
        `The student's target learning path is: ${userContext?.targetGoal || "Software Engineering"} (${userContext?.experienceLevel || "Intermediate"} level).`,
        userContext?.knownSkills && userContext.knownSkills.length > 0
          ? `Their current skills include: ${userContext.knownSkills.join(", ")}.`
          : "",
        "Always answer the student's question completely, accurately, and thoroughly.",
        "Provide clear conceptual explanations with intuitive analogies, structured markdown headers, bullet points, and clean, copyable code snippets with comments.",
        "If the user asks for code, provide clean, idiomatic code with explanations.",
        "Keep the tone encouraging, empathetic, and intellectually curious.",
      ]
        .filter(Boolean)
        .join(" ");

      // Try candidate models with seamless failover
      for (const model of CANDIDATE_GEMINI_MODELS) {
        try {
          const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey}`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                contents: geminiContents,
                systemInstruction: {
                  parts: [{ text: systemInstructionText }],
                },
                generationConfig: {
                  temperature: 0.4,
                  maxOutputTokens: 2048,
                },
              }),
              signal: AbortSignal.timeout(10000),
            }
          );

          if (response.ok) {
            const data = await response.json();
            const text =
              data?.candidates?.[0]?.content?.parts?.[0]?.text ||
              data?.candidates?.[0]?.content?.parts?.[1]?.text;

            if (text && text.trim()) {
              return NextResponse.json({
                reply: text.trim(),
                provider: `Google Gemini (${model})`,
                isLiveAI: true,
              });
            }
          }
        } catch {
          // Model failed or timed out; try next candidate model
          continue;
        }
      }
    }

    // 3. Resilient Dynamic Knowledge Fallback
    const fallbackReply = generateEducationalFallbackReply(userPrompt, userContext);
    return NextResponse.json({
      reply: fallbackReply,
      provider: "Shiksha AI Knowledge Engine",
      isLiveAI: false,
    });
  } catch (error) {
    console.error("Error in Shiksha Bot API route:", error);
    return NextResponse.json(
      {
        reply:
          "### 🎓 Shiksha AI Assistant\n\nI am ready to help you with your learning path! What specific topic or code challenge would you like to explore?",
        provider: "Shiksha AI Engine",
        isLiveAI: false,
      },
      { status: 200 }
    );
  }
}
