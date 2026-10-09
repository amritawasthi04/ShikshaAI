import { NextRequest, NextResponse } from "next/server";
import { PHASE_QUESTION_BANKS, generateDynamicPhaseQuestions } from "@/services/assessmentQuestionBank";
import { AssessmentQuestion } from "@/types/assessment";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { phaseNumber, phaseTitle, lessonTitles } = body as {
      roadmapId?: string;
      phaseId?: number;
      phaseNumber?: number;
      phaseTitle?: string;
      lessonTitles?: string[];
    };

    const phaseNum = phaseNumber || 1;
    const title = phaseTitle || `Phase ${phaseNum}`;
    const lessons = Array.isArray(lessonTitles) ? lessonTitles : [];

    // Retrieve the question bank for this phase
    const key = `fullstack_${phaseNum}`;
    let questionPool = PHASE_QUESTION_BANKS[key];

    if (!questionPool || questionPool.length < 10) {
      questionPool = generateDynamicPhaseQuestions(phaseNum, title, lessons);
    }

    // Strip out correct answers and explanations before sending to client for security
    const clientSafeQuestions: AssessmentQuestion[] = questionPool.slice(0, 10).map((q) => ({
      id: q.id,
      question: q.question,
      options: q.options,
      category: q.category,
      difficulty: q.difficulty,
      codeSnippet: q.codeSnippet,
    }));

    return NextResponse.json({
      success: true,
      totalQuestions: clientSafeQuestions.length,
      passingPercentage: 70,
      questions: clientSafeQuestions,
    });
  } catch (error) {
    console.error("Failed to load assessment questions:", error);
    return NextResponse.json(
      { success: false, error: "Failed to generate assessment questions" },
      { status: 500 }
    );
  }
}
