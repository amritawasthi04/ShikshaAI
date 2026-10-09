import { NextRequest, NextResponse } from "next/server";
import { PathBuilderState, GeneratedRoadmap } from "@/types/roadmap";
import { generatePersonalizedRoadmap } from "@/services/roadmapGenerator";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { state, roadmap } = body as {
      state?: PathBuilderState;
      roadmap?: GeneratedRoadmap;
    };

    const backendUrl = process.env.BACKEND_URL || "http://127.0.0.1:8000";
    const learnerId = req.headers.get("x-learner-id") || "usr_student_1";

    let generated: GeneratedRoadmap;
    if (roadmap) {
      generated = roadmap;
    } else if (state) {
      generated = generatePersonalizedRoadmap(state);
    } else {
      return NextResponse.json({ error: "Missing state or roadmap payload" }, { status: 400 });
    }

    // Persist to FastAPI Backend & MongoDB Atlas
    try {
      const milestoneItems = generated.phases.flatMap((phase) =>
        phase.lessons.map((lesson) => ({
          id: lesson.id,
          title: lesson.title,
          category: phase.phaseName,
          prerequisites: [],
          status: lesson.status,
          is_completed: lesson.completed,
        }))
      );

      const topicGuess = (generated.targetRole || generated.title || "python").toLowerCase();
      let canonicalTopic: string | undefined = undefined;
      if (topicGuess.includes("python")) canonicalTopic = "python";
      else if (topicGuess.includes("ai") || topicGuess.includes("machine")) canonicalTopic = "ai";

      const createRes = await fetch(`${backendUrl}/api/v1/roadmaps`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Learner-Id": learnerId,
        },
        body: JSON.stringify({
          goal_id: `goal_${generated.id}`,
          canonical_topic: canonicalTopic,
          milestones: milestoneItems,
          rationale: `Personalized roadmap generated for ${generated.targetRole} (${generated.experienceLevel} level).`,
        }),
        signal: AbortSignal.timeout(6000),
      });

      if (createRes.ok) {
        const createdData = await createRes.json();
        generated.id = createdData.roadmap_id || generated.id;
      }
    } catch (backendErr) {
      console.warn("Backend roadmap sync deferred:", backendErr);
    }

    return NextResponse.json({
      success: true,
      roadmap: generated,
    });
  } catch (error) {
    console.error("Error in roadmap API route:", error);
    return NextResponse.json(
      { error: "Internal server error while processing roadmap" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const backendUrl = process.env.BACKEND_URL || "http://127.0.0.1:8000";
    const learnerId = req.headers.get("x-learner-id") || "usr_student_1";

    const res = await fetch(`${backendUrl}/api/v1/roadmaps/active`, {
      method: "GET",
      headers: {
        "X-Learner-Id": learnerId,
      },
      signal: AbortSignal.timeout(5000),
    });

    if (res.ok) {
      const data = await res.json();
      return NextResponse.json({ activeRoadmap: data });
    }

    return NextResponse.json({ activeRoadmap: null });
  } catch {
    return NextResponse.json({ activeRoadmap: null });
  }
}
