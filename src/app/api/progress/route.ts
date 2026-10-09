import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { lessonId, completed } = body as {
      lessonId: string;
      completed: boolean;
    };

    if (!lessonId) {
      return NextResponse.json({ error: "lessonId is required" }, { status: 400 });
    }

    const backendUrl = process.env.BACKEND_URL || "http://127.0.0.1:8000";
    const learnerId = req.headers.get("x-learner-id") || "usr_student_1";
    const progressStatus = completed ? "completed" : "in_progress";

    try {
      // 1. Update lesson progress in FastAPI / MongoDB Atlas
      await fetch(`${backendUrl}/api/v1/lessons/${lessonId}/progress`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Learner-Id": learnerId,
        },
        body: JSON.stringify({ status: progressStatus }),
        signal: AbortSignal.timeout(4000),
      });

      // 2. If completed, record study session
      if (completed) {
        await fetch(`${backendUrl}/api/v1/lessons/${lessonId}/sessions`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Learner-Id": learnerId,
          },
          body: JSON.stringify({
            active_seconds: 1800,
            measurement_source: "web_frontend",
          }),
          signal: AbortSignal.timeout(4000),
        });
      }
    } catch (err) {
      console.warn("Backend progress sync deferred:", err);
    }

    return NextResponse.json({
      success: true,
      lessonId,
      status: progressStatus,
    });
  } catch (error) {
    console.error("Error in progress API route:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
