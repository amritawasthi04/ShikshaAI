export interface LessonResource {
  title: string;
  url: string;
  type: "documentation" | "article" | "repository" | "video";
  description?: string;
  sourceLabel?: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface DeepDiveCoreConcept {
  title: string;
  description: string;
  highlight?: string;
}

export interface DeepDiveSection {
  overview: string;
  mentalModel: string;
  coreConcepts: DeepDiveCoreConcept[];
  pitfalls: string[];
  realWorldApplications: string;
}

export interface CodeBlueprint {
  language: string;
  languageBadge: string;
  filename: string;
  code: string;
  explanation: string;
  architectureFlow?: string;
}

export interface PracticalChallenge {
  prompt: string;
  starterHint: string;
  expectedOutput: string;
}

export interface DetailedLessonModule {
  topicId: string;
  title: string;
  subtitle: string;
  domain: string;
  phaseName: string;
  duration: string;
  type: "concept" | "exercise" | "quiz" | "project";
  keyObjectives: string[];
  deepDive: DeepDiveSection;
  codeBlueprint: CodeBlueprint;
  quizQuestions: QuizQuestion[];
  resources: LessonResource[];
  practicalChallenge?: PracticalChallenge;
}
