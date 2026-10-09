import {
  AssessmentQuestion,
  AssessmentSubmissionItem,
  AssessmentAttempt,
  PhaseAssessmentSummary,
} from "@/types/assessment";
import { RoadmapPhase } from "@/types/roadmap";
import { PHASE_QUESTION_BANKS, generateDynamicPhaseQuestions } from "./assessmentQuestionBank";

const ASSESSMENT_STORAGE_KEY = "shiksha_assessment_attempts";

class AssessmentService {
  /**
   * Get all stored assessment attempts from localStorage
   */
  getAllAttempts(): AssessmentAttempt[] {
    if (typeof window === "undefined") return [];
    try {
      const stored = localStorage.getItem(ASSESSMENT_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.warn("Failed to retrieve assessment attempts from localStorage:", e);
    }
    return [];
  }

  /**
   * Get all assessment attempts for a specific roadmap
   */
  getAttemptsForRoadmap(roadmapId: string): AssessmentAttempt[] {
    const all = this.getAllAttempts();
    return all.filter((a) => a.roadmapId === roadmapId);
  }

  /**
   * Get all assessment attempts for a specific phase within a roadmap
   */
  getAttemptsForPhase(roadmapId: string, phaseId: number): AssessmentAttempt[] {
    const roadmapAttempts = this.getAttemptsForRoadmap(roadmapId);
    return roadmapAttempts.filter((a) => a.phaseId === phaseId);
  }

  /**
   * Compute comprehensive summary for a phase's assessment status
   */
  getPhaseAssessmentSummary(
    roadmapId: string,
    phase: RoadmapPhase
  ): PhaseAssessmentSummary {
    const attempts = this.getAttemptsForPhase(roadmapId, phase.id);
    const isLessonsCompleted = phase.completedLessons === phase.lessonsCount && phase.lessonsCount > 0;

    let bestScore: number | null = null;
    let bestPercentage: number | null = null;
    let hasPassed = false;

    attempts.forEach((att) => {
      if (bestScore === null || att.score > bestScore) {
        bestScore = att.score;
        bestPercentage = att.percentage;
      }
      if (att.passed) {
        hasPassed = true;
      }
    });

    const latestAttempt = attempts.length > 0 ? attempts[0] : null;

    let status: "locked" | "available" | "passed" | "retake" = "locked";
    if (!isLessonsCompleted) {
      status = "locked";
    } else if (hasPassed) {
      status = "passed";
    } else if (attempts.length > 0) {
      status = "retake";
    } else {
      status = "available";
    }

    return {
      roadmapId,
      phaseId: phase.id,
      phaseName: phase.phaseName,
      phaseTitle: phase.title,
      status,
      bestScore,
      bestPercentage,
      passed: hasPassed,
      attemptsCount: attempts.length,
      latestAttempt,
      allAttempts: attempts,
    };
  }

  /**
   * Fetch 10 questions for a phase via server API (with offline fallback)
   */
  async loadQuestionsForPhase(
    roadmapId: string,
    phase: RoadmapPhase
  ): Promise<AssessmentQuestion[]> {
    try {
      const res = await fetch("/api/assessment/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roadmapId,
          phaseId: phase.id,
          phaseNumber: phase.phaseNumber || phase.id,
          phaseTitle: phase.title,
          lessonTitles: phase.lessons.map((l) => l.title),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.questions)) {
          return data.questions;
        }
      }
    } catch (err) {
      console.warn("Server questions endpoint unavailable, using local question bank:", err);
    }

    // Local fallback if API fails
    const key = `fullstack_${phase.phaseNumber || phase.id}`;
    let pool = PHASE_QUESTION_BANKS[key];
    if (!pool || pool.length < 10) {
      pool = generateDynamicPhaseQuestions(
        phase.phaseNumber || phase.id,
        phase.title,
        phase.lessons.map((l) => l.title)
      );
    }

    return pool.slice(0, 10).map((q) => ({
      id: q.id,
      question: q.question,
      options: q.options,
      category: q.category,
      difficulty: q.difficulty,
      codeSnippet: q.codeSnippet,
    }));
  }

  /**
   * Submit and grade assessment answers via server API and persist attempt
   */
  async submitAssessment(
    roadmapId: string,
    phase: RoadmapPhase,
    answers: AssessmentSubmissionItem[],
    timeSpentSeconds: number = 0,
    userId: string = "usr_student"
  ): Promise<AssessmentAttempt> {
    const existingAttempts = this.getAttemptsForPhase(roadmapId, phase.id);
    const nextAttemptNumber = existingAttempts.length + 1;

    let attempt: AssessmentAttempt | null = null;

    try {
      const res = await fetch("/api/assessment/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roadmapId,
          phaseId: phase.id,
          phaseNumber: phase.phaseNumber || phase.id,
          phaseName: phase.phaseName,
          phaseTitle: phase.title,
          lessonTitles: phase.lessons.map((l) => l.title),
          answers,
          timeSpentSeconds,
          userId,
          attemptNumber: nextAttemptNumber,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.attempt) {
          attempt = data.attempt;
        }
      }
    } catch (err) {
      console.warn("Server submission endpoint failed, evaluating locally:", err);
    }

    // Fallback local evaluation if offline
    if (!attempt) {
      const key = `fullstack_${phase.phaseNumber || phase.id}`;
      let questionPool = PHASE_QUESTION_BANKS[key];
      if (!questionPool || questionPool.length < 10) {
        questionPool = generateDynamicPhaseQuestions(
          phase.phaseNumber || phase.id,
          phase.title,
          phase.lessons.map((l) => l.title)
        );
      }

      const masterQuestions = questionPool.slice(0, 10);
      const answersMap = new Map<string, number>();
      answers.forEach((a) => answersMap.set(a.questionId, a.selectedOptionIndex));

      let correctCount = 0;
      const results = masterQuestions.map((q) => {
        const selectedIndex = answersMap.has(q.id) ? answersMap.get(q.id)! : -1;
        const isCorrect = selectedIndex === q.correctOptionIndex;
        if (isCorrect) correctCount++;
        return {
          questionId: q.id,
          question: q.question,
          options: q.options,
          selectedOptionIndex: selectedIndex,
          correctOptionIndex: q.correctOptionIndex,
          isCorrect,
          explanation: q.explanation,
          codeSnippet: q.codeSnippet,
        };
      });

      const percentage = Math.round((correctCount / masterQuestions.length) * 100);
      attempt = {
        id: `att_${roadmapId}_p${phase.id}_${Date.now()}`,
        attemptNumber: nextAttemptNumber,
        roadmapId,
        phaseId: phase.id,
        phaseName: phase.phaseName,
        phaseTitle: phase.title,
        userId,
        score: correctCount,
        totalQuestions: masterQuestions.length,
        percentage,
        passingPercentage: 70,
        passed: percentage >= 70,
        completedAt: new Date().toISOString(),
        timeSpentSeconds,
        results,
      };
    }

    // Persist to localStorage
    this.saveAttempt(attempt);

    return attempt;
  }

  /**
   * Save an assessment attempt and dispatch custom events
   */
  private saveAttempt(attempt: AssessmentAttempt): void {
    if (typeof window === "undefined") return;
    try {
      const all = this.getAllAttempts();
      const updated = [attempt, ...all];
      localStorage.setItem(ASSESSMENT_STORAGE_KEY, JSON.stringify(updated));

      window.dispatchEvent(
        new CustomEvent("shiksha_assessment_completed", { detail: attempt })
      );
      window.dispatchEvent(
        new CustomEvent("shiksha_assessment_updated", { detail: attempt })
      );
    } catch (e) {
      console.warn("Failed to save assessment attempt:", e);
    }
  }

  /**
   * Calculate roadmap-wide assessment statistics
   */
  getRoadmapAssessmentStats(roadmapId: string) {
    const attempts = this.getAttemptsForRoadmap(roadmapId);
    const passedPhases = new Set<number>();
    let totalScoreSum = 0;

    attempts.forEach((a) => {
      if (a.passed) {
        passedPhases.add(a.phaseId);
      }
      totalScoreSum += a.percentage;
    });

    const averageScore = attempts.length > 0 ? Math.round(totalScoreSum / attempts.length) : 0;

    return {
      totalAttempts: attempts.length,
      passedPhasesCount: passedPhases.size,
      averageScore,
      latestAttempts: attempts.slice(0, 10),
    };
  }
}

export const assessmentService = new AssessmentService();
