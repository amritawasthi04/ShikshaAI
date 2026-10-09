"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AppLayout } from "@/components/layout/AppLayout";
import { roadmapService } from "@/services/roadmapService";
import { GeneratedRoadmap, RoadmapPhase, RoadmapLesson } from "@/types/roadmap";
import { LessonDetailModal } from "@/components/learning/LessonDetailModal";
import {
  CheckCircle2,
  Circle,
  Clock,
  BookOpen,
  ArrowRight,
  Sparkles,
  Lock,
  Play,
  FileCheck,
  Zap,
  Code2,
  Check,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  Search,
  BookMarked,
  Eye,
  Layers,
  ChevronRight,
} from "lucide-react";

function LearningPathContent() {
  const searchParams = useSearchParams();
  const initialLessonParam = searchParams.get("lesson");

  const [activeRoadmap, setActiveRoadmap] = useState<GeneratedRoadmap | null>(() => {
    return roadmapService.getActiveRoadmap();
  });

  const [activeFilter, setActiveFilter] = useState<"all" | "in-progress" | "completed">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedPhases, setExpandedPhases] = useState<Record<number, boolean>>({});
  const [showSkippedDetails, setShowSkippedDetails] = useState(false);

  // Lesson Detail Modal State
  const [selectedLesson, setSelectedLesson] = useState<RoadmapLesson | null>(null);
  const [selectedPhase, setSelectedPhase] = useState<RoadmapPhase | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Load from localStorage and handle query parameter on mount
  useEffect(() => {
    const rdm = roadmapService.getActiveRoadmap();
    if (rdm) {
      setActiveRoadmap(rdm);

      // Auto-expand in-progress phase by default
      const initialExpanded: Record<number, boolean> = {};
      rdm.phases.forEach((p) => {
        if (p.status === "in-progress" || p.id === 1) {
          initialExpanded[p.id] = true;
        }
      });
      setExpandedPhases(initialExpanded);

      // If URL has ?lesson=xxx, open that lesson modal immediately
      if (initialLessonParam) {
        for (const phase of rdm.phases) {
          const matched = phase.lessons.find((l) => l.id === initialLessonParam);
          if (matched) {
            setSelectedLesson(matched);
            setSelectedPhase(phase);
            setIsModalOpen(true);
            initialExpanded[phase.id] = true;
            setExpandedPhases({ ...initialExpanded });
            break;
          }
        }
      }
    }
  }, [initialLessonParam]);

  // Handle lesson completion toggle
  const handleToggleLesson = (lessonId: string, currentCompleted: boolean) => {
    const updated = roadmapService.toggleLessonCompletion(lessonId, !currentCompleted);
    if (updated) {
      setActiveRoadmap({ ...updated });

      // Update currently opened modal lesson state if viewing it
      if (selectedLesson && selectedLesson.id === lessonId) {
        const updatedPhase = updated.phases.find((p) => p.id === selectedPhase?.id);
        const updatedLsn = updatedPhase?.lessons.find((l) => l.id === lessonId);
        if (updatedLsn && updatedPhase) {
          setSelectedLesson({ ...updatedLsn });
          setSelectedPhase({ ...updatedPhase });
        }
      }
    }
  };

  // Open modal for a lesson (Start / Revisit / View)
  const handleOpenLessonModal = (lesson: RoadmapLesson, phase: RoadmapPhase) => {
    setSelectedLesson(lesson);
    setSelectedPhase(phase);
    setIsModalOpen(true);
  };

  // Navigate to next lesson in modal
  const handleNextLessonInModal = () => {
    if (!activeRoadmap || !selectedLesson || !selectedPhase) return;

    let foundCurrent = false;
    let nextLsn: RoadmapLesson | null = null;
    let nextPhs: RoadmapPhase | null = null;

    for (const phase of activeRoadmap.phases) {
      for (const lesson of phase.lessons) {
        if (foundCurrent) {
          nextLsn = lesson;
          nextPhs = phase;
          break;
        }
        if (lesson.id === selectedLesson.id) {
          foundCurrent = true;
        }
      }
      if (nextLsn) break;
    }

    if (nextLsn && nextPhs) {
      setSelectedLesson(nextLsn);
      setSelectedPhase(nextPhs);
    }
  };

  const togglePhaseExpansion = (phaseId: number) => {
    setExpandedPhases((prev) => ({
      ...prev,
      [phaseId]: !prev[phaseId],
    }));
  };

  const expandAllPhases = () => {
    const allExpanded: Record<number, boolean> = {};
    (activeRoadmap?.phases || []).forEach((p) => {
      allExpanded[p.id] = true;
    });
    setExpandedPhases(allExpanded);
  };

  const collapseAllPhases = () => {
    setExpandedPhases({});
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

  // If no roadmap exists (Empty State)
  if (!activeRoadmap) {
    return (
      <AppLayout
        pageTitle="Learning Path"
        pageSubtitle="Design and view your customized technical curriculum."
      >
        <div className="p-8 sm:p-12 text-center rounded-[12px] border-2 border-dashed border-[#D8C8BA] bg-[#F6F1E9] max-w-2xl mx-auto my-8">
          <div className="w-16 h-16 rounded-full bg-[#54252C]/10 text-[#54252C] flex items-center justify-center mx-auto mb-4">
            <Sparkles size={28} />
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-[#292827] mb-2">
            No Active Learning Path Found
          </h2>
          <p className="text-sm sm:text-base text-[#292827]/75 mb-6 max-w-md mx-auto leading-relaxed">
            Generate an ordered, personalized learning roadmap structured around your career target, current skills, and weekly pace.
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

  const phases = activeRoadmap.phases || [];

  // Identify next recommended actionable lesson
  let nextActionableLesson: RoadmapLesson | null = null;
  let nextActionablePhase: RoadmapPhase | null = null;
  for (const phase of phases) {
    for (const lesson of phase.lessons) {
      if (!lesson.completed) {
        nextActionableLesson = lesson;
        nextActionablePhase = phase;
        break;
      }
    }
    if (nextActionableLesson) break;
  }

  // Filter phases & lessons
  const filteredPhases = phases
    .map((phase) => {
      let filteredLessons = phase.lessons;
      if (activeFilter === "completed") {
        filteredLessons = phase.lessons.filter((l) => l.completed);
      } else if (activeFilter === "in-progress") {
        filteredLessons = phase.lessons.filter((l) => !l.completed);
      }

      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        filteredLessons = filteredLessons.filter(
          (l) =>
            l.title.toLowerCase().includes(query) ||
            l.description.toLowerCase().includes(query) ||
            l.type.toLowerCase().includes(query)
        );
      }

      return {
        ...phase,
        filteredLessons,
      };
    })
    .filter((phase) => {
      if (activeFilter === "completed") return phase.completedLessons > 0;
      if (activeFilter === "in-progress") return phase.status !== "completed";
      return true;
    });

  return (
    <AppLayout
      pageTitle="Learning Path"
      pageSubtitle="Your structured curriculum, adaptive milestones, and interactive lesson content."
      actionElement={
        <Link
          href="/build-path"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-[8px] border border-[#54252C] text-[#54252C] hover:bg-[#54252C]/5 text-xs sm:text-sm font-medium transition-colors"
        >
          <Sparkles size={15} />
          <span>Recalibrate Path</span>
        </Link>
      }
    >
      {/* 1. Active Path Header Overview Card */}
      <div className="p-6 sm:p-8 rounded-[10px] border border-[#D8C8BA] bg-[#F6F1E9] mb-8 shadow-2xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-[#D8C8BA]">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-[4px] bg-[#54252C]/10 text-[#54252C] text-xs font-semibold uppercase tracking-wider mb-2.5">
              <span className="capitalize">{activeRoadmap.experienceLevel || "Intermediate"} Track</span>
              <span>•</span>
              <span className="capitalize">{activeRoadmap.learningStyle || "Balanced"} Learning</span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-[#292827]">
              {activeRoadmap.title}
            </h2>
            <p className="text-sm text-[#292827]/75 mt-1 font-sans">
              Personalized roadmap targeted for{" "}
              <strong>{activeRoadmap.targetRole || "Software Engineering"}</strong>.
            </p>
          </div>

          <div className="flex items-center gap-6 text-sm text-[#292827]/80">
            <div>
              <p className="text-xs text-[#292827]/60">Total Completion</p>
              <p className="font-serif text-2xl sm:text-3xl font-semibold text-[#54252C]">
                {activeRoadmap.progressPercent}%
              </p>
            </div>
            <div>
              <p className="text-xs text-[#292827]/60">Lessons Done</p>
              <p className="font-serif text-2xl sm:text-3xl font-semibold text-[#292827]">
                {activeRoadmap.completedLessons} / {activeRoadmap.totalLessons}
              </p>
            </div>
            <div>
              <p className="text-xs text-[#292827]/60">Target Timeline</p>
              <p className="font-serif text-2xl sm:text-3xl font-semibold text-[#292827]">
                {activeRoadmap.targetDuration || "3 Months"}
              </p>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-[#D8C8BA]/50 h-2.5 rounded-full mt-4 overflow-hidden">
          <div
            style={{ width: `${activeRoadmap.progressPercent}%` }}
            className="bg-[#54252C] h-full rounded-full transition-all duration-500"
          />
        </div>
      </div>

      {/* 2. Highlight Next Actionable Lesson Banner */}
      {nextActionableLesson && nextActionablePhase && (
        <div className="p-5 sm:p-6 rounded-[10px] border-2 border-[#54252C] bg-[#F6F1E9] mb-8 shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="px-2.5 py-0.5 rounded-[4px] bg-[#54252C] text-[#F6F1E9] text-[0.7rem] font-semibold uppercase tracking-wider">
                  Current Recommended Action
                </span>
                <span className="text-xs text-[#292827]/60 font-medium">
                  {nextActionablePhase.phaseName}
                </span>
              </div>

              <h3 className="font-serif text-lg sm:text-xl font-semibold text-[#292827]">
                {nextActionableLesson.title}
              </h3>
              <p className="text-xs sm:text-sm text-[#292827]/75 mt-0.5 max-w-2xl font-sans">
                {nextActionableLesson.description}
              </p>

              <div className="flex items-center gap-3 text-xs text-[#292827]/70 mt-2">
                <span className="inline-flex items-center gap-1 capitalize">
                  {getLessonTypeIcon(nextActionableLesson.type)}
                  {nextActionableLesson.type}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock size={12} />
                  {nextActionableLesson.duration}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 flex-shrink-0">
              <button
                type="button"
                onClick={() =>
                  handleOpenLessonModal(nextActionableLesson!, nextActionablePhase!)
                }
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[8px] bg-[#54252C] hover:bg-[#803F47] text-[#F6F1E9] text-xs sm:text-sm font-medium transition-colors shadow-2xs"
              >
                <Play size={14} />
                <span>Start Lesson</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Adaptive Fast-Track Prerequisite Banner */}
      {activeRoadmap.skippedTopics && activeRoadmap.skippedTopics.length > 0 && (
        <div className="p-4 sm:p-5 rounded-[8px] bg-[#54252C]/5 border border-[#54252C]/20 mb-8">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="p-1.5 rounded-[4px] bg-[#54252C] text-[#F6F1E9] mt-0.5">
                <Zap size={14} />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-[#54252C]">
                  Personalized Prerequisite Fast-Track
                </h4>
                <p className="text-xs text-[#292827]/80 mt-0.5 leading-relaxed">
                  Based on your known skills (
                  <span className="font-medium text-[#292827]">
                    {activeRoadmap.knownSkills.join(", ")}
                  </span>
                  ), we pruned <strong>{activeRoadmap.skippedTopics.length} introductory topics</strong> to keep your path focused on high-impact milestones.
                </p>

                {showSkippedDetails && (
                  <div className="mt-3 pt-3 border-t border-[#54252C]/15 space-y-1.5">
                    <p className="text-xs font-semibold text-[#54252C] uppercase tracking-wider">
                      Pruned Introductory Topics:
                    </p>
                    <ul className="list-disc list-inside text-xs text-[#292827]/80 space-y-1">
                      {activeRoadmap.skippedTopics.map((topic, i) => (
                        <li key={i}>{topic}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowSkippedDetails(!showSkippedDetails)}
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#54252C] hover:underline flex-shrink-0"
            >
              <span>{showSkippedDetails ? "Hide" : "View"} Topics</span>
              {showSkippedDetails ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
            </button>
          </div>
        </div>
      )}

      {/* 4. Filter Tabs & Search Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-3 border-b border-[#D8C8BA]">
        {/* Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: "all", label: `All Phases (${phases.length})` },
            {
              id: "in-progress",
              label: `In Progress (${phases.filter((p) => p.status === "in-progress").length})`,
            },
            {
              id: "completed",
              label: `Completed (${phases.filter((p) => p.status === "completed").length})`,
            },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveFilter(tab.id as any)}
              className={`px-3.5 py-1.5 rounded-[6px] text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
                activeFilter === tab.id
                  ? "bg-[#54252C] text-[#F6F1E9]"
                  : "text-[#292827]/75 hover:bg-[#D8C8BA]/40"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search & Collapse Controls */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 sm:w-60">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#292827]/40"
            />
            <input
              type="text"
              placeholder="Search lessons & topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#F6F1E9] text-[#292827] placeholder:text-[#292827]/40 text-xs rounded-[6px] border border-[#D8C8BA] pl-8 pr-3 py-1.5 focus:outline-none focus:border-[#54252C]"
            />
          </div>

          <div className="flex items-center gap-1.5 text-xs text-[#292827]/70">
            <button
              type="button"
              onClick={expandAllPhases}
              className="hover:text-[#54252C] hover:underline"
            >
              Expand All
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={collapseAllPhases}
              className="hover:text-[#54252C] hover:underline"
            >
              Collapse All
            </button>
          </div>
        </div>
      </div>

      {/* 5. Phases Accordion List */}
      <div className="space-y-5 mb-12">
        {filteredPhases.map((phase) => {
          const isExpanded = !!expandedPhases[phase.id];
          const isCompleted = phase.status === "completed";
          const isInProgress = phase.status === "in-progress";

          return (
            <div
              key={phase.id}
              className={`rounded-[10px] border transition-all overflow-hidden ${
                isInProgress
                  ? "border-[#54252C] bg-[#F6F1E9] ring-1 ring-[#54252C]/30 shadow-2xs"
                  : isCompleted
                  ? "border-[#D8C8BA] bg-[#F6F1E9]"
                  : "border-[#D8C8BA]/60 bg-[#F6F1E9]/70 opacity-80"
              }`}
            >
              {/* Phase Header */}
              <div
                onClick={() => togglePhaseExpansion(phase.id)}
                className="p-5 sm:p-6 flex items-center justify-between cursor-pointer hover:bg-[#D8C8BA]/20 transition-colors select-none"
              >
                <div className="flex items-start sm:items-center gap-3.5 sm:gap-4">
                  <div className="mt-0.5 sm:mt-0 flex-shrink-0">
                    {isCompleted ? (
                      <div className="w-8 h-8 rounded-full bg-[#54252C] text-[#F6F1E9] flex items-center justify-center">
                        <CheckCircle2 size={18} />
                      </div>
                    ) : isInProgress ? (
                      <div className="w-8 h-8 rounded-full border-2 border-[#54252C] text-[#54252C] flex items-center justify-center font-bold text-xs">
                        {phase.phaseNumber || phase.id}
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-full border border-[#D8C8BA] text-[#292827]/40 flex items-center justify-center">
                        <Lock size={14} />
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[0.7rem] font-semibold uppercase tracking-wider text-[#54252C]">
                        {phase.phaseName || `Phase ${phase.phaseNumber}`}
                      </span>
                    </div>
                    <h3 className="font-serif text-lg sm:text-xl font-semibold text-[#292827]">
                      {phase.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#292827]/70 font-sans mt-0.5 max-w-3xl">
                      {phase.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm flex-shrink-0 ml-2">
                  <span className="hidden md:inline-block text-[#292827]/60">
                    {phase.completedLessons} / {phase.lessonsCount} Lessons
                  </span>
                  <span
                    className={`font-medium px-2.5 py-1 rounded-[4px] text-xs uppercase tracking-wider ${
                      isCompleted
                        ? "bg-[#D8C8BA]/50 text-[#54252C]"
                        : isInProgress
                        ? "bg-[#54252C] text-[#F6F1E9]"
                        : "bg-[#D8C8BA]/30 text-[#292827]/50"
                    }`}
                  >
                    {phase.status}
                  </span>
                  {isExpanded ? (
                    <ChevronUp size={16} className="text-[#292827]/50" />
                  ) : (
                    <ChevronDown size={16} className="text-[#292827]/50" />
                  )}
                </div>
              </div>

              {/* Lessons Accordion List */}
              {isExpanded && (
                <div className="px-5 sm:px-6 pb-6 pt-2 border-t border-[#D8C8BA]/60 bg-[#F6F1E9] divide-y divide-[#D8C8BA]/40">
                  {phase.filteredLessons.map((lesson) => {
                    const isLessonDone = lesson.completed;
                    const isCurrentLesson = lesson.status === "current";

                    return (
                      <div
                        key={lesson.id}
                        className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 group"
                      >
                        <div className="flex items-start gap-3.5">
                          {/* Interactive Toggle Checkbox */}
                          <button
                            type="button"
                            onClick={() => handleToggleLesson(lesson.id, !!isLessonDone)}
                            title={isLessonDone ? "Mark uncompleted" : "Mark completed"}
                            className="mt-0.5 p-0.5 rounded hover:bg-[#D8C8BA]/40 transition-colors"
                          >
                            {isLessonDone ? (
                              <CheckCircle2
                                size={20}
                                className="text-[#54252C] flex-shrink-0"
                              />
                            ) : isCurrentLesson ? (
                              <div className="w-4 h-4 rounded-full border-2 border-[#54252C] flex-shrink-0 animate-pulse" />
                            ) : (
                              <Circle size={20} className="text-[#292827]/30 flex-shrink-0" />
                            )}
                          </button>

                          <div>
                            <div className="flex items-center gap-2">
                              <h4
                                onClick={() => handleOpenLessonModal(lesson, phase)}
                                className={`text-sm sm:text-base font-medium cursor-pointer hover:text-[#54252C] transition-colors ${
                                  isLessonDone
                                    ? "text-[#292827]/60 line-through"
                                    : isCurrentLesson
                                    ? "text-[#54252C] font-semibold"
                                    : "text-[#292827]"
                                }`}
                              >
                                {lesson.title}
                              </h4>
                            </div>

                            {lesson.description && (
                              <p className="text-xs sm:text-sm text-[#292827]/70 font-sans mt-0.5">
                                {lesson.description}
                              </p>
                            )}

                            <div className="flex items-center gap-2.5 text-xs text-[#292827]/60 mt-1.5">
                              <span className="inline-flex items-center gap-1 capitalize">
                                {getLessonTypeIcon(lesson.type)}
                                <span>{lesson.type}</span>
                              </span>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                <Clock size={11} />
                                {lesson.duration}
                              </span>
                              {lesson.resources && lesson.resources.length > 0 && (
                                <>
                                  <span>•</span>
                                  <span className="text-[#54252C]">
                                    {lesson.resources.length} Reference Docs
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Lesson Actions: Start, Revisit, Complete */}
                        <div className="flex items-center gap-2 flex-shrink-0 pl-8 sm:pl-0">
                          {isLessonDone ? (
                            <>
                              <button
                                type="button"
                                onClick={() => handleOpenLessonModal(lesson, phase)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] border border-[#D8C8BA] hover:border-[#54252C] text-xs font-medium text-[#292827] transition-colors"
                              >
                                <Eye size={12} className="text-[#54252C]" />
                                <span>Revisit Lesson</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => handleToggleLesson(lesson.id, true)}
                                title="Reset completion status"
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-[6px] bg-[#54252C]/10 text-[#54252C] text-xs font-semibold hover:bg-[#54252C]/20 transition-colors"
                              >
                                <Check size={12} strokeWidth={2.5} />
                                <span>Completed</span>
                              </button>
                            </>
                          ) : isCurrentLesson ? (
                            <>
                              <button
                                type="button"
                                onClick={() => handleOpenLessonModal(lesson, phase)}
                                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-[6px] bg-[#54252C] hover:bg-[#803F47] text-[#F6F1E9] text-xs sm:text-sm font-medium transition-colors shadow-2xs"
                              >
                                <Play size={13} />
                                <span>Start / Open</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleToggleLesson(lesson.id, false)}
                                className="inline-flex items-center gap-1 px-3 py-2 rounded-[6px] border border-[#D8C8BA] hover:border-[#54252C] text-xs font-medium text-[#292827] transition-colors"
                              >
                                <span>Mark Done</span>
                              </button>
                            </>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleOpenLessonModal(lesson, phase)}
                              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-[6px] border border-[#D8C8BA] hover:border-[#54252C] text-xs font-medium text-[#292827] transition-colors"
                            >
                              <BookOpen size={12} className="text-[#54252C]" />
                              <span>View Content</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 6. Lesson Detail & Resource Viewer Modal */}
      <LessonDetailModal
        lesson={selectedLesson}
        phase={selectedPhase}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onToggleComplete={handleToggleLesson}
        onNextLesson={handleNextLessonInModal}
        hasNextLesson={true}
      />
    </AppLayout>
  );
}

export default function LearningPathPage() {
  return (
    <Suspense
      fallback={
        <AppLayout
          pageTitle="Learning Path"
          pageSubtitle="Loading your structured curriculum..."
        >
          <div className="p-12 text-center text-[#292827]/60">
            Loading curriculum...
          </div>
        </AppLayout>
      }
    >
      <LearningPathContent />
    </Suspense>
  );
}
