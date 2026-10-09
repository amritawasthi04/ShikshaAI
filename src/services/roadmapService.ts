import { PathBuilderState, GeneratedRoadmap, RoadmapPhase, RoadmapLesson } from "@/types/roadmap";
import { generatePersonalizedRoadmap } from "./roadmapGenerator";

const DRAFT_STORAGE_KEY = "shiksha_build_path_draft";
const ACTIVE_ROADMAP_KEY = "shiksha_active_roadmap";

export const initialPathBuilderState: PathBuilderState = {
  goal: "",
  targetRole: "",
  experienceLevel: "",
  background: "",
  knownSkills: [],
  isCompleteBeginner: false,
  learningStyle: "balanced",
  weeklyPace: "recommended",
  targetDuration: "3m",
  preferredTime: "flexible",
  currentStep: 1,
};

export interface SkillMastery {
  name: string;
  category: string;
  score: number;
  level: "Not Started" | "Developing" | "Proficient" | "Mastered";
  completedCount: number;
  totalCount: number;
}

export interface RecommendationInfo {
  lesson: RoadmapLesson;
  phase: RoadmapPhase;
  reason: string;
  actionText: string;
}

export interface DashboardMetrics {
  weeklyStudyHours: number;
  weeklyTargetHours: number;
  weeklyPaceDescription: string;
  completedLessonsCount: number;
  totalLessonsCount: number;
  completedProjectsCount: number;
  totalProjectsCount: number;
  learningStreakDays: number;
  progressPercent: number;
  nextIncompleteLesson: RoadmapLesson | null;
  nextIncompletePhase: RoadmapPhase | null;
  nextRecommendation: RecommendationInfo | null;
  skillsMastery: SkillMastery[];
}

class RoadmapService {
  /**
   * Check if user has explicitly generated a custom roadmap
   */
  hasExplicitRoadmap(): boolean {
    if (typeof window === "undefined") return false;
    try {
      return !!localStorage.getItem(ACTIVE_ROADMAP_KEY);
    } catch {
      return false;
    }
  }

  /**
   * Save draft state to localStorage
   */
  saveDraft(state: PathBuilderState): void {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.warn("Failed to save draft to localStorage:", e);
    }
  }

  /**
   * Load draft state from localStorage
   */
  loadDraft(): PathBuilderState | null {
    if (typeof window === "undefined") return null;
    try {
      const stored = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn("Failed to load draft from localStorage:", e);
    }
    return null;
  }

  /**
   * Clear draft state
   */
  clearDraft(): void {
    if (typeof window === "undefined") return;
    localStorage.removeItem(DRAFT_STORAGE_KEY);
  }

  /**
   * Generate and persist a new roadmap from builder answers
   */
  async generateRoadmap(state: PathBuilderState): Promise<GeneratedRoadmap> {
    // Brief generation feedback latency
    await new Promise((resolve) => setTimeout(resolve, 1100));

    const roadmap = generatePersonalizedRoadmap(state);

    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(ACTIVE_ROADMAP_KEY, JSON.stringify(roadmap));
        this.clearDraft();
      } catch (e) {
        console.warn("Failed to save active roadmap:", e);
      }
    }

    return roadmap;
  }

  /**
   * Get current active roadmap from localStorage (or fallback default)
   */
  getActiveRoadmap(): GeneratedRoadmap {
    if (typeof window === "undefined") return this.getDefaultRoadmap();
    try {
      const stored = localStorage.getItem(ACTIVE_ROADMAP_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn("Failed to retrieve active roadmap:", e);
    }

    // Return default initial roadmap if none generated yet
    return this.getDefaultRoadmap();
  }

  /**
   * Calculate real dashboard analytics derived strictly from the active roadmap and user progression
   */
  getDashboardMetrics(roadmap: GeneratedRoadmap, streakDays: number = 12): DashboardMetrics {
    let completedLessonsCount = 0;
    let totalLessonsCount = 0;
    let completedProjectsCount = 0;
    let totalProjectsCount = 0;
    let totalCompletedMinutes = 0;

    let nextIncompleteLesson: RoadmapLesson | null = null;
    let nextIncompletePhase: RoadmapPhase | null = null;
    let lastCompletedLesson: RoadmapLesson | null = null;

    const skillsMastery: SkillMastery[] = [];

    for (const phase of roadmap.phases) {
      let phaseCompleted = 0;
      for (const lesson of phase.lessons) {
        totalLessonsCount++;
        if (lesson.type === "project") {
          totalProjectsCount++;
        }

        if (lesson.completed) {
          completedLessonsCount++;
          phaseCompleted++;
          lastCompletedLesson = lesson;
          if (lesson.type === "project") {
            completedProjectsCount++;
          }

          // Parse duration (e.g. "30m", "45m", "1h")
          const durationMatch = lesson.duration.match(/(\d+)\s*(m|h|min|hr)/i);
          if (durationMatch) {
            const val = parseInt(durationMatch[1], 10);
            const unit = durationMatch[2].toLowerCase();
            totalCompletedMinutes += unit.startsWith("h") ? val * 60 : val;
          } else {
            totalCompletedMinutes += 30;
          }
        } else if (!nextIncompleteLesson) {
          nextIncompleteLesson = lesson;
          nextIncompletePhase = phase;
        }
      }

      // Compute skill mastery for this phase
      const phaseTotal = phase.lessons.length;
      const score = phaseTotal > 0 ? Math.round((phaseCompleted / phaseTotal) * 100) : 0;
      const cleanSkillName = phase.title.replace(/^Phase \d+:\s*/, "");
      
      let level: "Not Started" | "Developing" | "Proficient" | "Mastered" = "Not Started";
      if (score === 100) {
        level = "Mastered";
      } else if (score >= 60) {
        level = "Proficient";
      } else if (score > 0) {
        level = "Developing";
      }

      skillsMastery.push({
        name: cleanSkillName,
        category: phase.phaseName,
        score,
        level,
        completedCount: phaseCompleted,
        totalCount: phaseTotal,
      });
    }

    // Weekly hours target & actual calculation
    const weeklyTargetHours =
      roadmap.weeklyPace === "intensive"
        ? 18
        : roadmap.weeklyPace === "casual"
        ? 5
        : 10;

    const weeklyPaceDescription =
      roadmap.weeklyPace === "intensive"
        ? "15 - 20 hrs / week"
        : roadmap.weeklyPace === "casual"
        ? "3 - 5 hrs / week"
        : "8 - 12 hrs / week";

    // Convert completed minutes to hours formatted nicely
    const completedHoursFromLessons = Math.round((totalCompletedMinutes / 60) * 10) / 10;
    const weeklyStudyHours = Math.min(
      Math.max(completedHoursFromLessons, 0.5),
      weeklyTargetHours
    );

    // If total projects is 0, count quizzes as practical milestone evaluations
    if (totalProjectsCount === 0) {
      for (const phase of roadmap.phases) {
        for (const lesson of phase.lessons) {
          if (lesson.type === "quiz" || lesson.type === "exercise") {
            totalProjectsCount++;
            if (lesson.completed) completedProjectsCount++;
          }
        }
      }
    }

    // Contextual Next Recommendation with Clear Explanation
    let nextRecommendation: RecommendationInfo | null = null;
    if (nextIncompleteLesson && nextIncompletePhase) {
      let reason = "Essential next step to build foundational competencies for your target goal.";
      let actionText = "Start Next Lesson";

      if (lastCompletedLesson) {
        if (nextIncompleteLesson.type === "exercise") {
          reason = `Recommended because you completed "${lastCompletedLesson.title}". This hands-on exercise cements theoretical concepts into working code.`;
          actionText = "Start Practical Exercise";
        } else if (nextIncompleteLesson.type === "quiz") {
          reason = `Recommended to evaluate your comprehension of ${nextIncompletePhase.phaseName} concepts before advancing.`;
          actionText = "Take Milestone Assessment";
        } else if (nextIncompleteLesson.type === "project") {
          reason = `Capstone project for ${nextIncompletePhase.title} to synthesize your skills into a portfolio-ready build.`;
          actionText = "Launch Capstone Project";
        } else {
          reason = `Recommended continuation from "${lastCompletedLesson.title}" to expand your architecture skills.`;
          actionText = "Begin Lesson";
        }
      }

      nextRecommendation = {
        lesson: nextIncompleteLesson,
        phase: nextIncompletePhase,
        reason,
        actionText,
      };
    }

    const progressPercent =
      totalLessonsCount > 0
        ? Math.round((completedLessonsCount / totalLessonsCount) * 100)
        : 0;

    return {
      weeklyStudyHours,
      weeklyTargetHours,
      weeklyPaceDescription,
      completedLessonsCount,
      totalLessonsCount,
      completedProjectsCount,
      totalProjectsCount,
      learningStreakDays: streakDays,
      progressPercent,
      nextIncompleteLesson,
      nextIncompletePhase,
      nextRecommendation,
      skillsMastery,
    };
  }

  /**
   * Toggle completion status of a specific lesson in the active roadmap
   */
  toggleLessonCompletion(lessonId: string, completed: boolean): GeneratedRoadmap | null {
    const roadmap = this.getActiveRoadmap();
    if (!roadmap) return null;

    let totalLessons = 0;
    let completedLessons = 0;
    let foundCurrent = false;
    let currentLesson: RoadmapLesson | null = null;
    let currentPhase: RoadmapPhase | null = null;

    for (const phase of roadmap.phases) {
      let phaseCompleted = 0;
      for (const lesson of phase.lessons) {
        if (lesson.id === lessonId) {
          lesson.completed = completed;
        }

        totalLessons++;
        if (lesson.completed) {
          completedLessons++;
          phaseCompleted++;
          lesson.status = "completed";
        } else if (!foundCurrent) {
          lesson.status = "current";
          foundCurrent = true;
          currentLesson = lesson;
          currentPhase = phase;
        } else {
          lesson.status = "upcoming";
        }
      }

      phase.completedLessons = phaseCompleted;
      phase.lessonsCount = phase.lessons.length;

      if (phaseCompleted === phase.lessons.length && phase.lessons.length > 0) {
        phase.status = "completed";
      } else if (phaseCompleted > 0 || (currentPhase && currentPhase.id === phase.id)) {
        phase.status = "in-progress";
      } else {
        phase.status = "locked";
      }
    }

    roadmap.totalLessons = totalLessons;
    roadmap.completedLessons = completedLessons;
    roadmap.progressPercent = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
    roadmap.currentLesson = currentLesson;
    roadmap.currentPhase = currentPhase || roadmap.phases[0];

    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(ACTIVE_ROADMAP_KEY, JSON.stringify(roadmap));
      } catch (e) {
        console.warn("Failed to update active roadmap:", e);
      }
    }

    return roadmap;
  }

  /**
   * Check if an explore resource is already in the active roadmap
   */
  isResourceInRoadmap(resourceId: string, resourceTitle?: string): boolean {
    const roadmap = this.getActiveRoadmap();
    if (!roadmap) return false;

    for (const phase of roadmap.phases) {
      for (const lesson of phase.lessons) {
        if (lesson.id === resourceId) return true;
        if (resourceTitle && lesson.title.toLowerCase() === resourceTitle.toLowerCase()) return true;
      }
    }
    return false;
  }

  /**
   * Add an explored resource to the active roadmap with duplicate prevention
   */
  addResourceToRoadmap(resource: {
    id: string;
    title: string;
    description: string;
    duration: string;
    resourceType: "path" | "tutorial" | "project" | "technology";
    objectives?: string[];
    externalUrl?: string;
    codePreview?: string;
  }): { success: boolean; message: string; roadmap: GeneratedRoadmap } {
    const roadmap = this.getActiveRoadmap();

    // 1. Prevent Duplicates
    if (this.isResourceInRoadmap(resource.id, resource.title)) {
      return {
        success: false,
        message: `"${resource.title}" is already in your learning path.`,
        roadmap,
      };
    }

    // 2. Create the user-added lesson
    const newLesson: RoadmapLesson = {
      id: "usr_res_" + resource.id,
      title: resource.title,
      description: resource.description,
      duration: resource.duration,
      type:
        resource.resourceType === "project"
          ? "project"
          : resource.resourceType === "tutorial"
          ? "exercise"
          : "concept",
      completed: false,
      status: "upcoming",
      isUserAdded: true,
      keyObjectives: resource.objectives,
      codeSnippet: resource.codePreview,
      resources: [
        {
          title: `${resource.title} — Official Documentation`,
          url: resource.externalUrl || "https://developer.mozilla.org",
          type: "documentation",
        },
        {
          title: "Interactive Code Sandbox Repository",
          url: "https://github.com",
          type: "repository",
        },
      ],
    };

    // 3. Find target phase (Phase 4: Practice & Projects or Phase 3: Advanced Topics)
    let targetPhase = roadmap.phases.find((p) => p.id === 4) || roadmap.phases.find((p) => p.id === 3) || roadmap.phases[roadmap.phases.length - 1];

    if (!targetPhase) {
      targetPhase = {
        id: roadmap.phases.length + 1,
        phaseNumber: roadmap.phases.length + 1,
        phaseName: "Practice & Projects",
        title: "Phase 4: Practice, Projects & Custom Electives",
        description: "Hands-on projects and user-selected custom elective milestones.",
        status: "locked",
        lessonsCount: 0,
        completedLessons: 0,
        lessons: [],
      };
      roadmap.phases.push(targetPhase);
    }

    targetPhase.lessons.push(newLesson);
    targetPhase.lessonsCount = targetPhase.lessons.length;

    // Recalculate roadmap overall metrics
    let totalLessons = 0;
    let completedLessons = 0;
    for (const p of roadmap.phases) {
      for (const l of p.lessons) {
        totalLessons++;
        if (l.completed) completedLessons++;
      }
    }

    roadmap.totalLessons = totalLessons;
    roadmap.completedLessons = completedLessons;
    roadmap.progressPercent = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(ACTIVE_ROADMAP_KEY, JSON.stringify(roadmap));
      } catch (e) {
        console.warn("Failed to persist added resource to roadmap:", e);
      }
    }

    return {
      success: true,
      message: `Added "${resource.title}" to your active Learning Path!`,
      roadmap,
    };
  }

  /**
   * Clear active roadmap for testing empty state
   */
  clearRoadmap(): void {
    if (typeof window === "undefined") return;
    localStorage.removeItem(ACTIVE_ROADMAP_KEY);
  }

  /**
   * Default fallback roadmap for first-time visitors
   */
  getDefaultRoadmap(): GeneratedRoadmap {
    return generatePersonalizedRoadmap({
      goal: "Full-Stack Web Engineering",
      targetRole: "Full-Stack Web Developer",
      experienceLevel: "intermediate",
      background: "Self-Taught Coder",
      knownSkills: ["JavaScript", "React", "HTML5 & CSS3"],
      isCompleteBeginner: false,
      learningStyle: "balanced",
      weeklyPace: "recommended",
      targetDuration: "3m",
      preferredTime: "flexible",
      currentStep: 1,
    });
  }
}

export const roadmapService = new RoadmapService();
