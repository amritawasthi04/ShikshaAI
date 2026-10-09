import { NextRequest, NextResponse } from "next/server";

interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages, userContext } = body as {
      messages: ChatMessage[];
      userContext?: {
        targetGoal?: string;
        experienceLevel?: string;
        knownSkills?: string[];
      };
    };

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "Invalid request: messages array is required." },
        { status: 400 }
      );
    }

    const lastMessage = messages[messages.length - 1];
    const userPrompt = lastMessage.content.trim();
    const userPromptLower = userPrompt.toLowerCase();

    const backendUrl = process.env.BACKEND_URL || "http://127.0.0.1:8000";
    const learnerId = req.headers.get("x-learner-id") || "usr_student_1";

    // 1. Try FastAPI Backend Teacher Brain (Elara Agentic Engine)
    try {
      const convoTitle = `Tutoring: ${userContext?.targetGoal || "General"}`;
      // Create conversation on backend datastore
      const convoRes = await fetch(`${backendUrl}/api/v1/conversations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Learner-Id": learnerId,
        },
        body: JSON.stringify({ title: convoTitle }),
        signal: AbortSignal.timeout(6000),
      });

      if (convoRes.ok) {
        const convoData = await convoRes.json();
        const convoId = convoData.conversation_id;

        // Post message to Teacher Brain
        const msgRes = await fetch(
          `${backendUrl}/api/v1/conversations/${convoId}/messages`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-Learner-Id": learnerId,
            },
            body: JSON.stringify({ content: userPrompt }),
            signal: AbortSignal.timeout(15000),
          }
        );

        if (msgRes.ok) {
          const msgData = await msgRes.json();
          if (msgData.content) {
            return NextResponse.json({
              reply: msgData.content,
              provider: "Teacher Brain (Elara Agentic Engine)",
              isLiveAI: true,
              conversationId: convoId,
            });
          }
        }
      }
    } catch (backendError) {
      console.warn("Backend Teacher Brain connection deferred, falling back to direct LLM:", backendError);
    }

    // 2. Direct Google Gemini Model Gateway
    const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
    if (geminiKey) {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: messages.map((m) => ({
                role: m.role === "assistant" ? "model" : "user",
                parts: [{ text: m.content }],
              })),
              systemInstruction: {
                parts: [
                  {
                    text: `You are Shiksha Bot, an expert, patient, and inspiring pedagogical AI tutor for ShikshaAI. The student's current learning goal is ${userContext?.targetGoal || "Software Engineering"} (${userContext?.experienceLevel || "Intermediate"} level). Prior skills include: ${(userContext?.knownSkills || []).join(", ") || "General foundations"}. Provide structured, clear, and inspiring responses using markdown, bullet points, and code snippets where appropriate.`,
                  },
                ],
              },
            }),
            signal: AbortSignal.timeout(12000),
          }
        );

        const data = await response.json();
        const aiText =
          data?.candidates?.[0]?.content?.parts?.[0]?.text ||
          data?.candidates?.[0]?.content?.parts?.[0]?.text;

        if (aiText) {
          return NextResponse.json({
            reply: aiText,
            provider: "Gemini 1.5 Flash (Direct)",
            isLiveAI: true,
          });
        }
      } catch (err) {
        console.error("Gemini API direct call failed:", err);
      }
    }

    // 3. Contextual Educational Knowledge Engine (Offline Demo Fallback)
    let responseText = "";

    if (userPromptLower.includes("simple words") || userPromptLower.includes("explain")) {
      responseText = `### 💡 Concept Breakdown in Simple Terms

Let's break down this concept using a real-world analogy:

1. **The Big Picture:** Imagine an application like a restaurant. 
   - **Frontend (UI):** The dining room, menu design, and aesthetic presentation.
   - **Backend (Server):** The kitchen where orders are prepared and processed.
   - **Database:** The pantry where ingredients and recipes are permanently stored.

2. **Core Mechanics:**
   - When a user interacts with a button, an **event** is dispatched.
   - A **state change** triggers a reactive re-render so the interface stays synchronized.
   - **Data fetching** occurs asynchronously using promises, preventing the UI from freezing.

\`\`\`typescript
// Clean Reactive State Pattern
const [data, setData] = useState<Resource | null>(null);

async function loadMilestone() {
  const result = await fetchResource();
  setData(result);
}
\`\`\`

Would you like me to walk through a specific code example or quiz you on this topic?`;
    } else if (userPromptLower.includes("study plan") || userPromptLower.includes("plan")) {
      responseText = `### 📅 Structured 4-Week Mastery Plan

Here is a recommended study roadmap calibrated for your **${userContext?.targetGoal || "Full-Stack Web Engineering"}** path:

| Week | Focus Area | Core Milestone | Estimated Hours |
| :--- | :--- | :--- | :--- |
| **Week 1** | **Foundations & Architecture** | Component composition, TypeScript interfaces | 8 - 10 hrs |
| **Week 2** | **State & Lifecycle** | Reactive stores, side-effect management | 10 - 12 hrs |
| **Week 3** | **API & Backend Integration** | RESTful routing, error boundaries, auth tokens | 10 - 12 hrs |
| **Week 4** | **Production & Capstone** | End-to-end testing, responsive polish, deployment | 12 - 14 hrs |

> [!TIP]
> **Daily Momentum Tip:** Dedicate 45 uninterrupted minutes daily to maintain your study streak rather than cramming on weekends.

Shall we customize the hours or add specific technology modules?`;
    } else if (userPromptLower.includes("recommend") || userPromptLower.includes("resource")) {
      responseText = `### 📚 Curated Learning Resources & Blueprints

Based on your active track (**${userContext?.targetGoal || "Full-Stack Engineering"}**), here are high-impact resources:

1. **Interactive Blueprints:**
   - [Next.js App Router Architecture Guide](https://nextjs.org/docs) — Server vs Client Component boundaries.
   - [TypeScript Handbook](https://www.typescriptlang.org/docs/) — Generics, union types, and strict mode.
2. **Hands-On Exercises:**
   - Building resilient custom hooks with automatic memory cleanup.
   - Designing responsive card layouts with CSS Grid and Tailwind tokens.
3. **Capstone Projects:**
   - Full-stack stateful analytics dashboard with persistent local storage.

You can also explore and add these directly to your roadmap via the **Explore** page!`;
    } else if (userPromptLower.includes("quiz") || userPromptLower.includes("test")) {
      responseText = `### 🧠 Quick Knowledge Check

Let's test your understanding with a practical checkpoint question:

**Question:** In modern React 19 / Next.js applications, what is the primary benefit of Server Components?

- **A)** They allow using \`useState\` directly on the server without client JS.
- **B)** They execute exclusively on the server, reducing client bundle size and enabling direct database access.
- **C)** They automatically convert CSS styles into JavaScript objects.
- **D)** They replace browser localStorage with server-side cookies.

Reply with your answer (**A, B, C, or D**) and I'll provide instant feedback with a breakdown!`;
    } else if (userPromptLower === "b" || userPromptLower.includes("b)")) {
      responseText = `### ✅ Correct! Outstanding Job!

**Option B is correct.** Server Components execute entirely on the server. Their code and dependencies are never shipped to the client bundle, which drastically improves First Contentful Paint (FCP) and Time to Interactive (TTI).

**Key Takeaway:**
- Use **Server Components** for data fetching, static rendering, and heavy dependencies.
- Use **Client Components** (\`"use client"\`) when you need interactivity, browser APIs (\`localStorage\`), or React hooks (\`useState\`, \`useEffect\`).

Ready for another question or would you like to explore a specific coding pattern?`;
    } else {
      responseText = `### 🎓 Shiksha Bot Assistant

I'm here to help you accelerate your learning on the **${userContext?.targetGoal || "Software Engineering"}** track!

Here are some ways we can work together:
- **Concept Deep-Dives:** Ask me to explain any technology, algorithm, or architecture pattern.
- **Code Reviews & Debugging:** Paste code snippets to identify bottlenecks or edge cases.
- **Curriculum Planning:** Create custom weekly study milestones tailored to your schedule.
- **Interactive Quizzes:** Test your readiness with practical checkpoint evaluations.

What would you like to explore next?`;
    }

    return NextResponse.json({
      reply: responseText,
      provider: "Shiksha AI Knowledge Engine (Demo Mode)",
      isLiveAI: false,
      note: "Live multi-turn LLM generation enabled via Teacher Brain & Google Gemini API.",
    });
  } catch (error) {
    console.error("Error in Shiksha Bot API route:", error);
    return NextResponse.json(
      { error: "Internal server error while generating response." },
      { status: 500 }
    );
  }
}
