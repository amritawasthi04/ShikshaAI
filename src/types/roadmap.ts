export interface PathBuilderState {
  // Step 1: Goal
  goal: string;
  targetRole: string;

  // Step 2: Experience
  experienceLevel: "beginner" | "intermediate" | "advanced" | "";
  background: string;

  // Step 3: Skills
  knownSkills: string[];
  isCompleteBeginner: boolean;

  // Step 4: Preferences
  learningStyle: "project-first" | "deep-theory" | "balanced" | "";
  weeklyPace: "casual" | "recommended" | "intensive" | "";
  targetDuration: "1m" | "3m" | "6m" | "";
  preferredTime: "morning" | "afternoon" | "evening" | "flexible" | "";

  // Wizard state
  currentStep: number;
}

export interface RoadmapResource {
  title: string;
  url?: string;
  type: "documentation" | "article" | "repository" | "video";
}

export interface RoadmapLesson {
  id: string;
  title: string;
  description: string;
  duration: string;
  type: "concept" | "exercise" | "quiz" | "project";
  completed: boolean;
  status: "completed" | "current" | "upcoming" | "locked";
  resources?: RoadmapResource[];
  keyObjectives?: string[];
  codeSnippet?: string;
  contentMarkdown?: string;
  isUserAdded?: boolean;
}

export interface ExploreResource {
  id: string;
  title: string;
  description: string;
  category: "Technologies" | "Learning Paths" | "Tutorials" | "Projects";
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  duration: string;
  resourceType: "path" | "tutorial" | "project" | "technology";
  tags: string[];
  objectives: string[];
  prerequisites: string[];
  externalUrl?: string;
  targetRoles: string[];
  skillFocus: string[];
  codePreview?: string;
}

export interface RoadmapPhase {
  id: number;
  phaseNumber: number;
  phaseName: "Foundation" | "Core Skills" | "Advanced Topics" | "Practice & Projects" | "Capstone & Production";
  title: string;
  description: string;
  status: "completed" | "in-progress" | "locked";
  lessonsCount: number;
  completedLessons: number;
  lessons: RoadmapLesson[];
}

export interface GeneratedRoadmap {
  id: string;
  title: string;
  targetRole: string;
  experienceLevel: string;
  weeklyPace: string;
  targetDuration: string;
  learningStyle: string;
  knownSkills: string[];
  skippedTopics: string[];
  createdAt: string;
  phases: RoadmapPhase[];
  totalLessons: number;
  completedLessons: number;
  progressPercent: number;
  currentLesson?: RoadmapLesson | null;
  currentPhase?: RoadmapPhase | null;
}
