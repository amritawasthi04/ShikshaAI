import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, profile, data } = body;

    const backendUrl = process.env.BACKEND_URL || "http://127.0.0.1:8000";
    const learnerId = profile?.id || data?.id || req.headers.get("x-learner-id") || "usr_student_1";

    try {
      if (action === "signup" || action === "update_profile") {
        const displayName = profile?.fullName || data?.fullName || "Learner";
        const email = profile?.email || data?.email || "";
        const targetGoal = profile?.learningPreferences?.targetGoal || "Software Engineering";
        const weeklyHours = profile?.learningPreferences?.weeklyTargetHours || 10;
        const learningStyle = profile?.learningPreferences?.learningStyle || "balanced";

        // 1. Sync learner profile to MongoDB Atlas
        await fetch(`${backendUrl}/api/v1/me`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "X-Learner-Id": learnerId,
          },
          body: JSON.stringify({
            display_name: displayName,
            timezone: "UTC",
          }),
          signal: AbortSignal.timeout(4000),
        });

        // 2. Sync learner preferences to MongoDB Atlas
        await fetch(`${backendUrl}/api/v1/preferences`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "X-Learner-Id": learnerId,
          },
          body: JSON.stringify({
            learning_style: learningStyle,
            weekly_availability_hours: weeklyHours,
            preferred_pace: profile?.learningPreferences?.studyPace || "recommended",
          }),
          signal: AbortSignal.timeout(4000),
        });

        // 3. Establish active goal in MongoDB Atlas
        if (targetGoal) {
          await fetch(`${backendUrl}/api/v1/goals`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-Learner-Id": learnerId,
            },
            body: JSON.stringify({
              title: targetGoal,
              target_domain: "software_engineering",
              target_mastery_level: "proficient",
            }),
            signal: AbortSignal.timeout(4000),
          });
        }
      }
    } catch (backendErr) {
      console.warn("Backend learner synchronization deferred:", backendErr);
    }

    return NextResponse.json({
      success: true,
      learnerId,
      action,
    });
  } catch (error) {
    console.error("Error in auth API route:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const backendUrl = process.env.BACKEND_URL || "http://127.0.0.1:8000";
    const learnerId =
      req.nextUrl.searchParams.get("learnerId") ||
      req.headers.get("x-learner-id") ||
      "usr_student_1";

    let profile: any = null;
    let preferences: any = null;
    let goals: any[] = [];

    try {
      const [pRes, prefRes, gRes] = await Promise.allSettled([
        fetch(`${backendUrl}/api/v1/me`, {
          headers: { "X-Learner-Id": learnerId },
          signal: AbortSignal.timeout(3500),
        }),
        fetch(`${backendUrl}/api/v1/preferences`, {
          headers: { "X-Learner-Id": learnerId },
          signal: AbortSignal.timeout(3500),
        }),
        fetch(`${backendUrl}/api/v1/goals`, {
          headers: { "X-Learner-Id": learnerId },
          signal: AbortSignal.timeout(3500),
        }),
      ]);

      if (pRes.status === "fulfilled" && pRes.value.ok) {
        profile = await pRes.value.json();
      }
      if (prefRes.status === "fulfilled" && prefRes.value.ok) {
        preferences = await prefRes.value.json();
      }
      if (gRes.status === "fulfilled" && gRes.value.ok) {
        goals = await gRes.value.json();
      }
    } catch (backendErr) {
      console.warn("Backend auth fetch error:", backendErr);
    }

    return NextResponse.json({
      success: true,
      learnerId,
      profile,
      preferences,
      goals,
    });
  } catch (error) {
    console.error("Error in auth GET handler:", error);
    return NextResponse.json(
      { error: "Failed to fetch user auth state" },
      { status: 500 }
    );
  }
}
