import { NextRequest, NextResponse } from "next/server";
import { PHASE_QUESTION_BANKS, generateDynamicPhaseQuestions } from "@/services/assessmentQuestionBank";
import {
  AssessmentSubmissionItem,
  AssessmentResultItem,
  AssessmentAttempt,
} from "@/types/assessment";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      roadmapId,
      phaseId,
      phaseNumber,
      phaseName,
      phaseTitle,
      lessonTitles,
      answers,
      timeSpentSeconds,
      userId,
      attemptNumber,
    } = body as {
      roadmapId: string;
      phaseId: number;
      phaseNumber?: number;
      phaseName: string;
      phaseTitle: string;
      lessonTitles?: string[];
      answers: AssessmentSubmissionItem[];
      timeSpentSeconds?: number;
      userId?: string;
      attemptNumber?: number;
    };

    if (!roadmapId || phaseId === undefined || !Array.isArray(answers)) {
      return NextResponse.json(
        { success: false, error: "Invalid submission payload" },
        { status: 400 }
      );
    }

    const phaseNum = phaseNumber || phaseId || 1;
    const title = phaseTitle || `Phase ${phaseNum}`;
    const lessons = Array.isArray(lessonTitles) ? lessonTitles : [];

    // Retrieve master question bank with correct answers
    const key = `fullstack_${phaseNum}`;
    let questionPool = PHASE_QUESTION_BANKS[key];

    if (!questionPool || questionPool.length < 10) {
      questionPool = generateDynamicPhaseQuestions(phaseNum, title, lessons);
    }

    const masterQuestions = questionPool.slice(0, 10);
    const answersMap = new Map<string, number>();
    answers.forEach((a) => {
      answersMap.set(a.questionId, a.selectedOptionIndex);
    });

    let correctCount = 0;
    const results: AssessmentResultItem[] = [];

    masterQuestions.forEach((q) => {
      const selectedIndex = answersMap.has(q.id) ? answersMap.get(q.id)! : -1;
      const isCorrect = selectedIndex === q.correctOptionIndex;
      if (isCorrect) {
        correctCount++;
      }

      results.push({
        questionId: q.id,
        question: q.question,
        options: q.options,
        selectedOptionIndex: selectedIndex,
        correctOptionIndex: q.correctOptionIndex,
        isCorrect,
        explanation: q.explanation,
        codeSnippet: q.codeSnippet,
      });
    });

    const totalQuestions = masterQuestions.length;
    const percentage = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
    const passingPercentage = 70;
    const passed = percentage >= passingPercentage;

    const attempt: AssessmentAttempt = {
      id: `att_${roadmapId}_p${phaseId}_${Date.now()}`,
      attemptNumber: attemptNumber || 1,
      roadmapId,
      phaseId,
      phaseName: phaseName || `Phase ${phaseNum}`,
      phaseTitle: title,
      userId: userId || "usr_student",
      score: correctCount,
      totalQuestions,
      percentage,
      passingPercentage,
      passed,
      completedAt: new Date().toISOString(),
      timeSpentSeconds: timeSpentSeconds || 0,
      results,
    };

    return NextResponse.json({
      success: true,
      attempt,
    });
  } catch (error) {
    console.error("Failed to submit assessment:", error);
    return NextResponse.json(
      { success: false, error: "Failed to validate and grade assessment" },
      { status: 500 }
    );
  }
}
