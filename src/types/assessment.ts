export interface AssessmentQuestion {
  id: string;
  question: string;
  options: string[];
  category?: string;
  difficulty?: "beginner" | "intermediate" | "advanced";
  codeSnippet?: string;
}

export interface AssessmentQuestionWithAnswer extends AssessmentQuestion {
  correctOptionIndex: number;
  explanation: string;
}

export interface AssessmentSubmissionItem {
  questionId: string;
  selectedOptionIndex: number; // 0, 1, 2, 3 or -1 if skipped
}

export interface AssessmentResultItem {
  questionId: string;
  question: string;
  options: string[];
  selectedOptionIndex: number;
  correctOptionIndex: number;
  isCorrect: boolean;
  explanation: string;
  codeSnippet?: string;
}

export interface AssessmentAttempt {
  id: string;
  attemptNumber: number;
  roadmapId: string;
  phaseId: number;
  phaseName: string;
  phaseTitle: string;
  userId?: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  passingPercentage: number;
  passed: boolean;
  completedAt: string;
  timeSpentSeconds: number;
  results: AssessmentResultItem[];
}

export interface PhaseAssessmentSummary {
  roadmapId: string;
  phaseId: number;
  phaseName: string;
  phaseTitle: string;
  status: "locked" | "available" | "passed" | "retake";
  bestScore: number | null;
  bestPercentage: number | null;
  passed: boolean;
  attemptsCount: number;
  latestAttempt: AssessmentAttempt | null;
  allAttempts: AssessmentAttempt[];
}
