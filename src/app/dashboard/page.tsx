"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { AppLayout } from "@/components/layout/AppLayout";
import { authService, UserProfile } from "@/services/authService";
import {
  roadmapService,
  DashboardMetrics,
  SkillMastery,
  RecommendationInfo,
} from "@/services/roadmapService";
import { GeneratedRoadmap, RoadmapPhase, RoadmapLesson } from "@/types/roadmap";
import {
  Route,
  ArrowRight,
  TrendingUp,
  Clock,
  Sparkles,
  Compass,
  CheckCircle2,
  Calendar,
  Lock,
  Play,
  Zap,
  Flame,
  Award,
  BookOpen,
  Code2,
  FileCheck,
  Check,
  Circle,
  Layers,
  ChevronRight,
  AlertCircle,
  Plus,
  BrainCircuit,
  Target,
  Sliders,
} from "lucide-react";
import { CountUp, AnimatedContent, AnimatedList } from "@/components/reactbits";

export default function DashboardPage() {
  const [user, setUser] = useState<UserProfile | null>(() => authService.getCurrentUser());

  const [roadmap, setRoadmap] = useState<GeneratedRoadmap | null>(() => {
    return roadmapService.getActiveRoadmap();
  });

  const [metrics, setMetrics] = useState<DashboardMetrics | null>(() => {
    const r = roadmapService.getActiveRoadmap();
    const u = authService.getCurrentUser();
    return roadmapService.getDashboardMetrics(r, u);
  });

  const [isLoading, setIsLoading] = useState(false);
  const [hasExplicitPath, setHasExplicitPath] = useState(true);
  const [skillFilter, setSkillFilter] = useState<"all" | "prior" | "curriculum">("all");

  // Sync latest persisted data from localStorage and backend database on mount
  useEffect(() => {
    const syncDashboardData = async () => {
      try {
        const currentUser = authService.getCurrentUser();
        setUser(currentUser);

        const isExplicit = roadmapService.hasExplicitRoadmap();
        setHasExplicitPath(isExplicit);

        const activeRoadmap = roadmapService.getActiveRoadmap();
        setRoadmap(activeRoadmap);

        if (activeRoadmap) {
          const computedMetrics = roadmapService.getDashboardMetrics(
            activeRoadmap,
            currentUser
          );
          setMetrics(computedMetrics);
        }

        // Live backend fetch: synchronize learner profile, preferences, and goals from FastAPI/MongoDB
        try {
          const res = await fetch("/api/auth", {
            headers: {
              "X-Learner-Id": currentUser?.id || "usr_student_1",
            },
          });
          if (res.ok) {
            const data = await res.json();
            if (data.preferences || data.profile) {
              const pref = data.preferences;
              const remoteProfile = data.profile;
              if (pref && currentUser) {
                const updatedPref = {
                  ...currentUser.learningPreferences,
                  learningStyle: (pref.learning_style as any) || currentUser.learningPreferences.learningStyle,
                  weeklyTargetHours: pref.weekly_availability_hours || currentUser.learningPreferences.weeklyTargetHours,
                  studyPace: (pref.preferred_pace as any) || currentUser.learningPreferences.studyPace,
                };
                const updatedUser = {
                  ...currentUser,
                  fullName: remoteProfile?.display_name || currentUser.fullName,
                  learningPreferences: updatedPref,
                };
                setUser(updatedUser);
                if (activeRoadmap) {
                  setMetrics(roadmapService.getDashboardMetrics(activeRoadmap, updatedUser));
                }
              }
            }
          }
        } catch (fetchErr) {
          console.warn("Background auth refresh deferred:", fetchErr);
        }
      } catch (e) {
        console.error("Failed to load dashboard data:", e);
      }
    };

    syncDashboardData();

    // Listen to profile updates across tabs and path builder wizard
    const handleProfileUpdated = (e: Event) => {
      const customEvt = e as CustomEvent<UserProfile>;
      const updatedUser = customEvt.detail || authService.getCurrentUser();
      setUser(updatedUser);
      const curRoadmap = roadmapService.getActiveRoadmap();
      if (curRoadmap) {
        setMetrics(roadmapService.getDashboardMetrics(curRoadmap, updatedUser));
      }
    };

    const handleRoadmapReset = () => {
      const curRoadmap = roadmapService.getActiveRoadmap();
      const curUser = authService.getCurrentUser();
      setRoadmap(curRoadmap);
      setMetrics(roadmapService.getDashboardMetrics(curRoadmap, curUser));
    };

    window.addEventListener("shiksha_profile_updated", handleProfileUpdated);
    window.addEventListener("shiksha_roadmap_reset", handleRoadmapReset);
    window.addEventListener("storage", handleRoadmapReset);

    return () => {
      window.removeEventListener("shiksha_profile_updated", handleProfileUpdated);
      window.removeEventListener("shiksha_roadmap_reset", handleRoadmapReset);
      window.removeEventListener("storage", handleRoadmapReset);
    };
  }, []);

  // Handler to toggle lesson completion directly from dashboard with immediate reactive update
  const handleToggleLesson = (lessonId: string, currentCompleted: boolean) => {
    const updated = roadmapService.toggleLessonCompletion(lessonId, !currentCompleted);
    if (updated) {
      setRoadmap(updated);
      const computed = roadmapService.getDashboardMetrics(
        updated,
        user
      );
      setMetrics(computed);
    }
  };

  const getLessonTypeIcon = (type: string) => {
    switch (type) {
      case "exercise":
        return <Code2 size={13} className="text-[#54252C]" />;
      case "quiz":
        return <FileCheck size={13} className="text-[#54252C]" />;
      case "project":
        return <Sparkles size={13} className="text-[#54252C]" />;
      case "concept":
      default:
        return <BookOpen size={13} className="text-[#54252C]" />;
    }
  };

  // Compute metrics fallback if state is still initializing
  const activeMetrics =
    metrics ||
    (roadmap ? roadmapService.getDashboardMetrics(roadmap, user) : null);

  // If no roadmap exists at all (Empty State)
  if (!roadmap) {
    return (
      <AppLayout
        pageTitle="Student Dashboard"
        pageSubtitle="Get started by generating your personalized learning roadmap."
      >
        <div className="p-8 sm:p-12 text-center rounded-[12px] border-2 border-dashed border-[#D8C8BA] bg-[#F6F1E9] max-w-2xl mx-auto my-8">
          <div className="w-16 h-16 rounded-full bg-[#54252C]/10 text-[#54252C] flex items-center justify-center mx-auto mb-4">
            <Sparkles size={28} />
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-[#292827] mb-2">
            No Active Learning Path Found
          </h2>
          <p className="text-sm sm:text-base text-[#292827]/75 mb-6 max-w-md mx-auto leading-relaxed">
            Welcome, {user?.fullName || "Learner"}! Complete the 4-step path builder to generate an adaptive, milestone-driven curriculum tailored to your goals.
          </p>
          <Link
            href="/build-path"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-[8px] bg-[#54252C] hover:bg-[#803F47] text-[#F6F1E9] text-sm font-medium transition-colors shadow-xs"
          >
            <Sparkles size={16} className="text-[#D8C8BA]" />
            <span>Build My Learning Path</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      </AppLayout>
    );
  }

  const nextLesson = activeMetrics?.nextIncompleteLesson;
  const nextPhase = activeMetrics?.nextIncompletePhase;
  const recommendation = activeMetrics?.nextRecommendation;

  const currentGoalTitle =
    user?.learningPreferences?.targetGoal || roadmap.targetRole || roadmap.title;

  const knownSkillsList =
    (user?.learningPreferences?.knownSkills && user.learningPreferences.knownSkills.length > 0)
      ? user.learningPreferences.knownSkills
      : (roadmap.knownSkills || []);

  return (
    <AppLayout
      pageTitle="Student Dashboard"
      pageSubtitle="Track your active roadmaps, real-time statistics, and adaptive learning milestones."
      actionElement={
        <Link
          href="/build-path"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-[8px] bg-[#54252C] hover:bg-[#803F47] text-[#F6F1E9] text-xs sm:text-sm font-medium transition-colors shadow-2xs"
        >
          <Sparkles size={15} className="text-[#D8C8BA]" />
          <span>Build New Path</span>
        </Link>
      }
    >
      {/* 1. Personalized Dynamic Greeting Banner */}
      <div className="p-6 sm:p-8 rounded-[10px] border border-[#D8C8BA] bg-[#F6F1E9] mb-6 relative overflow-hidden shadow-2xs">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#54252C]/10 text-[#54252C] text-xs font-semibold uppercase tracking-wider mb-3">
            <span className="flex items-center gap-1">
              <Flame size={13} className="text-[#54252C]" />
              {user?.streakDays || activeMetrics?.learningStreakDays || 0}-Day Streak Active
            </span>
            <span className="text-[#54252C]/40">•</span>
            <span className="capitalize">
              {user?.learningPreferences?.experienceLevel || roadmap.experienceLevel || "Personalized"} Track
            </span>
          </div>

          <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-[#292827] mb-2">
            Welcome back, {user?.fullName || "Learner"}
          </h2>

          <p className="text-sm sm:text-base text-[#292827]/80 leading-relaxed font-sans">
            You are progressing through your <strong>{currentGoalTitle}</strong> path. You have completed{" "}
            <strong>{activeMetrics?.completedLessonsCount || 0}</strong> of{" "}
            <strong>{activeMetrics?.totalLessonsCount || 0}</strong> lessons (
            <strong>{activeMetrics?.progressPercent || 0}% completed</strong>).
          </p>

          {/* Skipped Prerequisite Notice Badge */}
          {roadmap.skippedTopics && roadmap.skippedTopics.length > 0 && (
            <div className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[6px] bg-[#54252C]/5 border border-[#54252C]/20 text-xs text-[#54252C]">
              <Zap size={13} className="text-[#54252C]" />
              <span>
                {roadmap.skippedTopics.length} introductory topics skipped based on your verified known skills.
              </span>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-3.5 mt-5">
            <Link
              href="/learning-path"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[8px] bg-[#54252C] hover:bg-[#803F47] text-[#F6F1E9] text-sm font-medium transition-colors shadow-xs"
            >
              <Play size={15} />
              <span>Continue Learning</span>
              <ArrowRight size={16} />
            </Link>
            <Link
              href="/progress"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-[8px] border border-[#D8C8BA] hover:border-[#54252C] text-sm font-medium text-[#292827] transition-colors"
            >
              <TrendingUp size={16} className="text-[#54252C]" />
              <span>View Full Analytics</span>
            </Link>
          </div>
        </div>

        {/* Ambient watermark pattern */}
        <div className="absolute right-0 bottom-0 top-0 w-1/3 pointer-events-none opacity-20 hidden md:block bg-gradient-to-l from-[#D8C8BA] to-transparent" />
      </div>

      {/* 2. Active Preferences & Focus Profile Panel */}
      <div className="p-5 sm:p-6 rounded-[10px] border border-[#D8C8BA] bg-[#F6F1E9] mb-8 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 mb-4 border-b border-[#D8C8BA]/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-[6px] bg-[#54252C] text-[#F6F1E9] flex items-center justify-center">
              <BrainCircuit size={17} />
            </div>
            <div>
              <h3 className="font-serif text-base sm:text-lg font-semibold text-[#292827]">
                Active Learning Preferences & Focus
              </h3>
              <p className="text-xs text-[#292827]/60">
                Derived directly from your input preferences and live curriculum state
              </p>
            </div>
          </div>

          <Link
            href="/build-path"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#54252C] hover:text-[#803F47] hover:underline"
          >
            <span>Modify Preferences</span>
            <ChevronRight size={13} />
          </Link>
        </div>

        {/* 4-Item Preferences Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
          <div className="p-3 rounded-[6px] bg-[#F6F1E9] border border-[#D8C8BA]/70">
            <span className="text-[0.68rem] uppercase font-semibold text-[#292827]/50 tracking-wider block mb-1">
              Target Goal
            </span>
            <p className="text-xs sm:text-sm font-semibold text-[#54252C] truncate" title={currentGoalTitle}>
              {currentGoalTitle}
            </p>
          </div>

          <div className="p-3 rounded-[6px] bg-[#F6F1E9] border border-[#D8C8BA]/70">
            <span className="text-[0.68rem] uppercase font-semibold text-[#292827]/50 tracking-wider block mb-1">
              Experience Level
            </span>
            <p className="text-xs sm:text-sm font-semibold text-[#292827] capitalize">
              {user?.learningPreferences?.experienceLevel || roadmap.experienceLevel || "Intermediate"}
            </p>
          </div>

          <div className="p-3 rounded-[6px] bg-[#F6F1E9] border border-[#D8C8BA]/70">
            <span className="text-[0.68rem] uppercase font-semibold text-[#292827]/50 tracking-wider block mb-1">
              Learning Style
            </span>
            <p className="text-xs sm:text-sm font-semibold text-[#292827] capitalize">
              {user?.learningPreferences?.learningStyle || "Balanced Theory & Practice"}
            </p>
          </div>

          <div className="p-3 rounded-[6px] bg-[#F6F1E9] border border-[#D8C8BA]/70">
            <span className="text-[0.68rem] uppercase font-semibold text-[#292827]/50 tracking-wider block mb-1">
              Target Study Pace
            </span>
            <p className="text-xs sm:text-sm font-semibold text-[#292827] capitalize">
              {user?.learningPreferences?.studyPace || "Recommended"} • {user?.learningPreferences?.weeklyTargetHours || activeMetrics?.weeklyTargetHours || 10}h/wk
            </p>
          </div>
        </div>

        {/* Verified Input Skills Badges */}
        <div className="pt-3 border-t border-[#D8C8BA]/40">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-[#292827]/70 mr-1 flex items-center gap-1">
              <Check size={13} className="text-[#54252C]" />
              <span>Your Input Skills:</span>
            </span>
            {knownSkillsList.length > 0 ? (
              knownSkillsList.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#54252C]/10 border border-[#54252C]/20 text-[0.72rem] font-semibold text-[#54252C]"
                >
                  <Check size={11} className="stroke-[3]" />
                  {skill}
                </span>
              ))
            ) : (
              <span className="text-xs text-[#292827]/60 italic">
                No prior skills specified (Clean slate curriculum starting from fundamentals)
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 2. Real Calculated Statistics Row (No Hardcoding) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-6 mb-8">
        {/* Metric 1: Weekly Study Time */}
        <AnimatedContent distance={15} delay={0.05}>
          <div className="p-4 sm:p-5 rounded-[8px] border border-[#D8C8BA] bg-[#F6F1E9] h-full shadow-2xs">
            <div className="flex items-center justify-between text-[#292827]/70 mb-2">
              <span className="text-xs font-medium uppercase tracking-wider">
                Weekly Study Time
              </span>
              <Clock size={16} className="text-[#54252C]" />
            </div>
            <p className="font-serif text-2xl sm:text-3xl font-semibold text-[#292827]">
              <CountUp to={activeMetrics?.weeklyStudyHours || 0} duration={1.2} />{" "}
              <span className="text-xs font-sans text-[#292827]/60">
                / {activeMetrics?.weeklyTargetHours || 10} hrs
              </span>
            </p>
            <div className="w-full bg-[#D8C8BA]/50 h-1.5 rounded-full mt-3 overflow-hidden">
              <div
                style={{
                  width: `${Math.min(
                    ((activeMetrics?.weeklyStudyHours || 0) / (activeMetrics?.weeklyTargetHours || 10)) * 100,
                    100
                  )}%`,
                }}
                className="bg-[#54252C] h-full rounded-full transition-all duration-500"
              />
            </div>
            <p className="text-[0.7rem] text-[#292827]/60 mt-1.5 capitalize">
              {activeMetrics?.weeklyPaceDescription}
            </p>
          </div>
        </AnimatedContent>

        {/* Metric 2: Completed Lessons */}
        <AnimatedContent distance={15} delay={0.1}>
          <div className="p-5 rounded-[8px] border border-[#D8C8BA] bg-[#F6F1E9] h-full shadow-2xs">
            <div className="flex items-center justify-between text-[#292827]/70 mb-2">
              <span className="text-xs font-medium uppercase tracking-wider">
                Completed Lessons
              </span>
              <CheckCircle2 size={16} className="text-[#54252C]" />
            </div>
            <p className="font-serif text-2xl sm:text-3xl font-semibold text-[#292827]">
              <CountUp to={activeMetrics?.completedLessonsCount || 0} duration={1.4} />{" "}
              <span className="text-xs font-sans text-[#292827]/60">
                / {activeMetrics?.totalLessonsCount || 0}
              </span>
            </p>
            <div className="w-full bg-[#D8C8BA]/50 h-1.5 rounded-full mt-3 overflow-hidden">
              <div
                style={{ width: `${activeMetrics?.progressPercent || 0}%` }}
                className="bg-[#54252C] h-full rounded-full transition-all duration-500"
              />
            </div>
            <p className="text-[0.7rem] text-[#54252C] font-medium mt-1.5">
              {activeMetrics?.progressPercent || 0}% curriculum completed
            </p>
          </div>
        </AnimatedContent>

        {/* Metric 3: Projects & Assessments */}
        <AnimatedContent distance={15} delay={0.15}>
          <div className="p-5 rounded-[8px] border border-[#D8C8BA] bg-[#F6F1E9] h-full shadow-2xs">
            <div className="flex items-center justify-between text-[#292827]/70 mb-2">
              <span className="text-xs font-medium uppercase tracking-wider">
                Projects & Quizzes
              </span>
              <Award size={16} className="text-[#54252C]" />
            </div>
            <p className="font-serif text-2xl sm:text-3xl font-semibold text-[#292827]">
              <CountUp to={activeMetrics?.completedProjectsCount || 0} duration={1.4} />{" "}
              <span className="text-xs font-sans text-[#292827]/60">
                / {activeMetrics?.totalProjectsCount || 0}
              </span>
            </p>
            <div className="w-full bg-[#D8C8BA]/50 h-1.5 rounded-full mt-3 overflow-hidden">
              <div
                style={{
                  width: `${
                    (activeMetrics?.totalProjectsCount || 0) > 0
                      ? Math.round(
                          ((activeMetrics?.completedProjectsCount || 0) /
                            (activeMetrics?.totalProjectsCount || 1)) *
                            100
                        )
                      : 0
                  }%`,
                }}
                className="bg-[#54252C] h-full rounded-full transition-all duration-500"
              />
            </div>
            <p className="text-[0.7rem] text-[#292827]/70 mt-1.5">Verified milestone builds</p>
          </div>
        </AnimatedContent>

        {/* Metric 4: Learning Streak */}
        <AnimatedContent distance={15} delay={0.2}>
          <div className="p-5 rounded-[8px] border border-[#D8C8BA] bg-[#F6F1E9] h-full shadow-2xs">
            <div className="flex items-center justify-between text-[#292827]/70 mb-2">
              <span className="text-xs font-medium uppercase tracking-wider">
                Learning Streak
              </span>
              <Flame size={16} className="text-[#54252C]" />
            </div>
            <p className="font-serif text-2xl sm:text-3xl font-semibold text-[#54252C]">
              <CountUp to={user?.streakDays ?? (activeMetrics?.learningStreakDays || 0)} duration={1.5} />{" "}
              <span className="text-xs font-sans text-[#292827]/60">Days</span>
            </p>
            <div className="w-full bg-[#D8C8BA]/50 h-1.5 rounded-full mt-3 overflow-hidden">
              <div
                style={{
                  width: `${Math.min(
                    (((user?.streakDays ?? (activeMetrics?.learningStreakDays || 0))) / 30) * 100,
                    100
                  )}%`,
                }}
                className="bg-[#54252C] h-full rounded-full"
              />
            </div>
            <p className="text-[0.7rem] text-[#54252C] font-medium mt-1.5">
              Consistency benchmark on track
            </p>
          </div>
        </AnimatedContent>
      </div>

      {/* 3. Next Recommendation Section with Clear Reason */}
      {recommendation && (
        <div className="p-6 rounded-[10px] border-2 border-[#54252C] bg-[#F6F1E9] mb-8 shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="px-2.5 py-0.5 rounded-[4px] bg-[#54252C] text-[#F6F1E9] text-[0.7rem] font-semibold uppercase tracking-wider">
                  Next Recommendation
                </span>
                <span className="text-xs text-[#292827]/60 font-medium">
                  {recommendation.phase.phaseName}
                </span>
              </div>

              <h3 className="font-serif text-xl font-semibold text-[#292827]">
                {recommendation.lesson.title}
              </h3>

              <div className="flex items-center gap-3 text-xs text-[#292827]/70 mt-1 mb-2">
                <span className="inline-flex items-center gap-1 capitalize">
                  {getLessonTypeIcon(recommendation.lesson.type)}
                  {recommendation.lesson.type}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock size={12} />
                  {recommendation.lesson.duration}
                </span>
              </div>

              {/* Clear Reason Explanation */}
              <div className="p-3 rounded-[6px] bg-[#54252C]/5 border border-[#54252C]/15 text-xs text-[#292827] leading-relaxed">
                <strong className="text-[#54252C]">Why this item: </strong>
                {recommendation.reason}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 flex-shrink-0">
              <button
                type="button"
                onClick={() => handleToggleLesson(recommendation.lesson.id, false)}
                className="px-4 py-2.5 rounded-[8px] bg-[#54252C] hover:bg-[#803F47] text-[#F6F1E9] text-sm font-medium transition-colors shadow-2xs flex items-center justify-center gap-1.5"
              >
                <Play size={14} />
                <span>{recommendation.actionText}</span>
              </button>
              <Link
                href="/learning-path"
                className="px-3.5 py-2.5 rounded-[8px] border border-[#D8C8BA] hover:border-[#54252C] text-xs font-medium text-[#292827] text-center transition-colors"
              >
                Open in Curriculum
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* 4. Main Grid: Visual Learning Roadmap + Skills Mastery */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
        {/* Left Column (8 Cols): Visual Learning Roadmap */}
        <div className="lg:col-span-8 flex flex-col space-y-6">
          <div className="p-6 rounded-[8px] border border-[#D8C8BA] bg-[#F6F1E9]">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#D8C8BA]">
              <div>
                <span className="text-xs font-semibold text-[#54252C] uppercase tracking-wider">
                  Visual Learning Roadmap ({roadmap.phases.length} Phases)
                </span>
                <h3 className="font-serif text-xl font-semibold text-[#292827] mt-0.5">
                  {roadmap.title}
                </h3>
              </div>
              <Link
                href="/learning-path"
                className="text-xs font-semibold text-[#54252C] hover:underline flex items-center gap-1"
              >
                <span>Full Learning Path</span>
                <ChevronRight size={14} />
              </Link>
            </div>

            {/* Visual Milestones Checklist by Phase */}
            <div className="space-y-4">
              {roadmap.phases.map((phase) => {
                const isCompleted = phase.status === "completed";
                const isInProgress = phase.status === "in-progress";

                return (
                  <div
                    key={phase.id}
                    className={`rounded-[8px] border transition-all ${
                      isInProgress
                        ? "border-[#54252C] bg-[#F6F1E9] ring-1 ring-[#54252C]/30"
                        : isCompleted
                        ? "border-[#D8C8BA] bg-[#F6F1E9]"
                        : "border-[#D8C8BA]/60 bg-[#F6F1E9]/70 opacity-75"
                    }`}
                  >
                    {/* Phase Banner */}
                    <div className="p-4 flex items-center justify-between border-b border-[#D8C8BA]/50">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                            isCompleted
                              ? "bg-[#54252C] text-[#F6F1E9]"
                              : isInProgress
                              ? "border-2 border-[#54252C] text-[#54252C]"
                              : "border border-[#D8C8BA] text-[#292827]/40"
                          }`}
                        >
                          {isCompleted ? "✓" : isInProgress ? "•" : <Lock size={11} />}
                        </div>
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wider text-[#54252C]">
                            {phase.phaseName}
                          </p>
                          <h4 className="font-serif text-base font-semibold text-[#292827]">
                            {phase.title}
                          </h4>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-xs text-[#292827]/60 font-medium">
                          {phase.completedLessons} / {phase.lessonsCount} Done
                        </span>
                        <span
                          className={`text-[0.7rem] px-2 py-0.5 rounded-[4px] uppercase font-semibold tracking-wider ${
                            isCompleted
                              ? "bg-[#D8C8BA]/50 text-[#54252C]"
                              : isInProgress
                              ? "bg-[#54252C] text-[#F6F1E9]"
                              : "bg-[#D8C8BA]/30 text-[#292827]/50"
                          }`}
                        >
                          {phase.status}
                        </span>
                      </div>
                    </div>

                    {/* Checkpoint Milestones inside Phase */}
                    <div className="p-4 divide-y divide-[#D8C8BA]/40 space-y-2">
                      {phase.lessons.map((lesson) => {
                        const isLessonDone = lesson.completed;
                        const isCurrentLesson = lesson.status === "current";

                        return (
                          <div
                            key={lesson.id}
                            className="pt-2 first:pt-0 flex items-center justify-between gap-3"
                          >
                            <div className="flex items-center gap-2.5">
                              {/* Quick toggle check button */}
                              <button
                                type="button"
                                onClick={() => handleToggleLesson(lesson.id, !!isLessonDone)}
                                title={isLessonDone ? "Mark uncompleted" : "Mark completed"}
                                className="p-0.5 rounded hover:bg-[#D8C8BA]/30 transition-colors"
                              >
                                {isLessonDone ? (
                                  <CheckCircle2
                                    size={16}
                                    className="text-[#54252C] flex-shrink-0"
                                  />
                                ) : isCurrentLesson ? (
                                  <div className="w-3.5 h-3.5 rounded-full border-2 border-[#54252C] flex-shrink-0 animate-pulse" />
                                ) : (
                                  <Circle
                                    size={16}
                                    className="text-[#292827]/30 flex-shrink-0"
                                  />
                                )}
                              </button>

                              <div>
                                <p
                                  className={`text-xs sm:text-sm font-medium ${
                                    isLessonDone
                                      ? "text-[#292827]/60 line-through"
                                      : isCurrentLesson
                                      ? "text-[#54252C] font-semibold"
                                      : "text-[#292827]"
                                  }`}
                                >
                                  {lesson.title}
                                </p>
                                <span className="text-[0.7rem] text-[#292827]/50 capitalize">
                                  {lesson.type} • {lesson.duration}
                                </span>
                              </div>
                            </div>

                            {/* Milestone action */}
                            <div>
                              {isCurrentLesson ? (
                                <Link
                                  href="/learning-path"
                                  className="px-2.5 py-1 rounded-[4px] bg-[#54252C] text-[#F6F1E9] text-[0.7rem] font-medium hover:bg-[#803F47] transition-colors"
                                >
                                  Resume
                                </Link>
                              ) : isLessonDone ? (
                                <span className="text-[0.7rem] text-[#54252C] font-medium">
                                  Done ✓
                                </span>
                              ) : (
                                <span className="text-[0.7rem] text-[#292827]/40">
                                  Upcoming
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column (4 Cols): Skills Section with Mastery Indicators & Quick Shortcuts */}
        <div className="lg:col-span-4 flex flex-col space-y-6">
          {/* Skills Section with Mastery Indicators */}
          <div className="p-6 rounded-[8px] border border-[#D8C8BA] bg-[#F6F1E9]">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#D8C8BA]">
              <div>
                <h3 className="font-serif text-lg font-semibold text-[#292827]">
                  Skills & Mastery
                </h3>
                <p className="text-xs text-[#292827]/70 leading-relaxed">
                  Calculated from your verified input skills & completed milestones.
                </p>
              </div>
              <Link
                href="/progress"
                className="text-xs font-semibold text-[#54252C] hover:underline flex-shrink-0"
              >
                Analytics →
              </Link>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5 p-1 rounded-[6px] bg-[#D8C8BA]/30 mb-4 text-[0.7rem] font-medium">
              <button
                type="button"
                onClick={() => setSkillFilter("all")}
                className={`px-2.5 py-1 rounded-[4px] transition-colors ${
                  skillFilter === "all"
                    ? "bg-[#54252C] text-[#F6F1E9] font-semibold"
                    : "text-[#292827]/70 hover:text-[#54252C]"
                }`}
              >
                All ({(activeMetrics?.skillsMastery || []).length})
              </button>
              <button
                type="button"
                onClick={() => setSkillFilter("prior")}
                className={`px-2.5 py-1 rounded-[4px] transition-colors ${
                  skillFilter === "prior"
                    ? "bg-[#54252C] text-[#F6F1E9] font-semibold"
                    : "text-[#292827]/70 hover:text-[#54252C]"
                }`}
              >
                Prior Skills (
                {
                  (activeMetrics?.skillsMastery || []).filter(
                    (s) => s.category === "Verified Prior Skill"
                  ).length
                }
                )
              </button>
              <button
                type="button"
                onClick={() => setSkillFilter("curriculum")}
                className={`px-2.5 py-1 rounded-[4px] transition-colors ${
                  skillFilter === "curriculum"
                    ? "bg-[#54252C] text-[#F6F1E9] font-semibold"
                    : "text-[#292827]/70 hover:text-[#54252C]"
                }`}
              >
                Curriculum (
                {
                  (activeMetrics?.skillsMastery || []).filter(
                    (s) => s.category !== "Verified Prior Skill"
                  ).length
                }
                )
              </button>
            </div>

            {/* Filtered Skills List */}
            <div className="space-y-4 max-h-[380px] overflow-y-auto pr-1">
              {(() => {
                const list = (activeMetrics?.skillsMastery || []).filter((s) => {
                  if (skillFilter === "prior") return s.category === "Verified Prior Skill";
                  if (skillFilter === "curriculum") return s.category !== "Verified Prior Skill";
                  return true;
                });

                if (list.length === 0) {
                  return (
                    <p className="text-xs text-[#292827]/60 italic py-4 text-center">
                      No skills found in this view.
                    </p>
                  );
                }

                return list.map((skill) => {
                  const isMastered = skill.level === "Mastered";
                  const isProficient = skill.level === "Proficient";
                  const isDeveloping = skill.level === "Developing";
                  const isPrior = skill.category === "Verified Prior Skill";

                  return (
                    <div key={skill.name} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5 truncate max-w-[170px]">
                          <span className="font-medium text-[#292827] truncate" title={skill.name}>
                            {skill.name}
                          </span>
                          {isPrior && (
                            <span className="px-1 py-0.2 rounded text-[0.6rem] bg-[#54252C]/10 text-[#54252C] font-semibold flex-shrink-0">
                              Input
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`px-1.5 py-0.5 rounded-[3px] text-[0.65rem] font-semibold uppercase tracking-wider ${
                              isMastered
                                ? "bg-[#54252C] text-[#F6F1E9]"
                                : isProficient
                                ? "bg-[#54252C]/15 text-[#54252C]"
                                : isDeveloping
                                ? "bg-[#D8C8BA]/50 text-[#292827]"
                                : "border border-[#D8C8BA] text-[#292827]/40"
                            }`}
                          >
                            {skill.level}
                          </span>
                          <span className="font-semibold text-[#54252C]">{skill.score}%</span>
                        </div>
                      </div>

                      <div className="w-full bg-[#D8C8BA]/40 h-2 rounded-full overflow-hidden">
                        <div
                          style={{ width: `${skill.score}%` }}
                          className="bg-[#54252C] h-full rounded-full transition-all duration-500"
                        />
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
          </div>

          {/* Quick Shortcuts Card */}
          <div className="p-6 rounded-[8px] border border-[#D8C8BA] bg-[#F6F1E9]">
            <h3 className="font-serif text-lg font-semibold text-[#292827] mb-3">
              Quick Shortcuts
            </h3>
            <div className="space-y-2.5">
              <Link
                href="/learning-path"
                className="flex items-center justify-between p-3 rounded-[6px] border border-[#D8C8BA] hover:border-[#54252C] transition-colors group"
              >
                <div className="flex items-center gap-2.5">
                  <Route size={16} className="text-[#54252C]" />
                  <span className="text-sm font-medium text-[#292827] group-hover:text-[#54252C]">
                    Active Learning Path
                  </span>
                </div>
                <ArrowRight size={14} className="text-[#292827]/50" />
              </Link>

              <Link
                href="/build-path"
                className="flex items-center justify-between p-3 rounded-[6px] border border-[#D8C8BA] hover:border-[#54252C] transition-colors group"
              >
                <div className="flex items-center gap-2.5">
                  <Sparkles size={16} className="text-[#54252C]" />
                  <span className="text-sm font-medium text-[#292827] group-hover:text-[#54252C]">
                    Build / Recalibrate Path
                  </span>
                </div>
                <ArrowRight size={14} className="text-[#292827]/50" />
              </Link>

              <Link
                href="/explore"
                className="flex items-center justify-between p-3 rounded-[6px] border border-[#D8C8BA] hover:border-[#54252C] transition-colors group"
              >
                <div className="flex items-center gap-2.5">
                  <Compass size={16} className="text-[#54252C]" />
                  <span className="text-sm font-medium text-[#292827] group-hover:text-[#54252C]">
                    Explore Other Tracks
                  </span>
                </div>
                <ArrowRight size={14} className="text-[#292827]/50" />
              </Link>

              <Link
                href="/progress"
                className="flex items-center justify-between p-3 rounded-[6px] border border-[#D8C8BA] hover:border-[#54252C] transition-colors group"
              >
                <div className="flex items-center gap-2.5">
                  <TrendingUp size={16} className="text-[#54252C]" />
                  <span className="text-sm font-medium text-[#292827] group-hover:text-[#54252C]">
                    Progress & Analytics
                  </span>
                </div>
                <ArrowRight size={14} className="text-[#292827]/50" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
