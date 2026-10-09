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
    const userPrompt = lastMessage.content.trim().toLowerCase();

    // Check for configured AI keys securely on the server
    const geminiKey = process.env.GEMINI_API_KEY;
    const openAIKey = process.env.OPENAI_API_KEY;

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
                    text: `You are Shiksha Bot, an expert, patient, and engaging AI tutor for ShikshaAI. The student's current learning goal is ${userContext?.targetGoal || "Software Engineering"} (${userContext?.experienceLevel || "Intermediate"} level). Provide structured, clear, and inspiring responses using markdown, bullet points, and code snippets where appropriate.`,
                  },
                ],
              },
            }),
          }
        );

        const data = await response.json();
        const aiText =
          data?.candidates?.[0]?.content?.parts?.[0]?.text ||
          "I received your message! How else can I assist your learning journey?";

        return NextResponse.json({
          reply: aiText,
          provider: "Gemini 1.5 Flash",
          isLiveAI: true,
        });
      } catch (err) {
        console.error("Gemini API call failed, falling back to contextual demo:", err);
      }
    }

    if (openAIKey) {
      try {
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${openAIKey}`,
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [
              {
                role: "system",
                content: `You are Shiksha Bot, the AI tutor for ShikshaAI. Provide helpful, encouraging, and structured educational guidance for a student targeting ${userContext?.targetGoal || "Software Engineering"}.`,
              },
              ...messages,
            ],
          }),
        });

        const data = await response.json();
        const aiText = data?.choices?.[0]?.message?.content;
        if (aiText) {
          return NextResponse.json({
            reply: aiText,
            provider: "OpenAI GPT-4o-mini",
            isLiveAI: true,
          });
        }
      } catch (err) {
        console.error("OpenAI API call failed, falling back to contextual demo:", err);
      }
    }

    // Honest Contextual Demo Mode when no live API keys are provided
    let responseText = "";

    if (userPrompt.includes("simple words") || userPrompt.includes("explain")) {
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
    } else if (userPrompt.includes("study plan") || userPrompt.includes("plan")) {
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
    } else if (userPrompt.includes("recommend") || userPrompt.includes("resource")) {
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
    } else if (userPrompt.includes("quiz") || userPrompt.includes("test")) {
      responseText = `### 🧠 Quick Knowledge Check

Let's test your understanding with a practical checkpoint question:

**Question:** In modern React 19 / Next.js applications, what is the primary benefit of Server Components?

- **A)** They allow using \`useState\` directly on the server without client JS.
- **B)** They execute exclusively on the server, reducing client bundle size and enabling direct database access.
- **C)** They automatically convert CSS styles into JavaScript objects.
- **D)** They replace browser localStorage with server-side cookies.

Reply with your answer (**A, B, C, or D**) and I'll provide instant feedback with a breakdown!`;
    } else if (userPrompt === "b" || userPrompt.includes("b)")) {
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
      note: "To enable live multi-turn LLM generation, set GEMINI_API_KEY in your .env.local file.",
    });
  } catch (error) {
    console.error("Error in Shiksha Bot API route:", error);
    return NextResponse.json(
      { error: "Internal server error while generating response." },
      { status: 500 }
    );
  }
}
