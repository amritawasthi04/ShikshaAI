"use client";

import React, { useState } from "react";
import { RoadmapLesson, RoadmapPhase } from "@/types/roadmap";
import {
  X,
  CheckCircle2,
  Clock,
  BookOpen,
  Code2,
  FileCheck,
  Sparkles,
  ExternalLink,
  Check,
  RotateCcw,
  ArrowRight,
  Bookmark,
  Layers,
  FileCode,
  Terminal,
} from "lucide-react";

interface LessonDetailModalProps {
  lesson: RoadmapLesson | null;
  phase: RoadmapPhase | null;
  isOpen: boolean;
  onClose: () => void;
  onToggleComplete: (lessonId: string, completed: boolean) => void;
  onNextLesson?: () => void;
  hasNextLesson?: boolean;
}

export const LessonDetailModal: React.FC<LessonDetailModalProps> = ({
  lesson,
  phase,
  isOpen,
  onClose,
  onToggleComplete,
  onNextLesson,
  hasNextLesson = false,
}) => {
  const [activeTab, setActiveTab] = useState<"overview" | "code" | "resources">("overview");

  if (!isOpen || !lesson || !phase) return null;

  const isCompleted = lesson.completed;

  const getLessonTypeIcon = (type: string) => {
    switch (type) {
      case "exercise":
        return <Code2 size={14} className="text-[#54252C]" />;
      case "quiz":
        return <FileCheck size={14} className="text-[#54252C]" />;
      case "project":
        return <Sparkles size={14} className="text-[#54252C]" />;
      case "concept":
      default:
        return <BookOpen size={14} className="text-[#54252C]" />;
    }
  };

  // Curated fallback learning objectives if not explicitly defined
  const objectives = lesson.keyObjectives || [
    `Master the fundamental architecture and principles of ${lesson.title}.`,
    "Implement production-grade error handling, type safety, and boundary checks.",
    "Verify performance, edge cases, and algorithmic complexity tradeoffs.",
    "Synthesize knowledge through guided practical exercise checkpoints.",
  ];

  // Curated code snippet pattern based on lesson topic
  const codeSample =
    lesson.codeSnippet ||
    `// Technical Implementation Blueprint for ${lesson.title}
export interface ModuleContext<T> {
  id: string;
  payload: T;
  timestamp: string;
}

export async function executeMilestoneTask(ctx: ModuleContext<{ topic: string }>) {
  // 1. Validate incoming state boundaries
  if (!ctx.payload.topic) {
    throw new Error("Invalid milestone payload");
  }

  // 2. Perform verified execution pipeline
  console.log(\`[Shiksha Execution] Processing: \${ctx.payload.topic}\`);
  return { success: true, verifiedAt: new Date().toISOString() };
}`;

  // Curated technical resources
  const resources = lesson.resources || [
    {
      title: "Official Architecture Documentation & RFCs",
      url: "https://developer.mozilla.org",
      type: "documentation" as const,
    },
    {
      title: "Reference Implementation & Interactive Sandbox",
      url: "https://github.com",
      type: "repository" as const,
    },
    {
      title: "Deep-Dive Engineering Guide & Best Practices",
      url: "https://web.dev",
      type: "article" as const,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#292827]/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog Content */}
      <div className="relative z-10 w-full max-w-2xl bg-[#F6F1E9] border border-[#D8C8BA] rounded-[12px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-[#D8C8BA] bg-[#F6F1E9] flex items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-[4px] bg-[#54252C]/10 text-[#54252C] text-xs font-semibold uppercase tracking-wider">
                {phase.phaseName}
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[4px] border border-[#D8C8BA] text-xs text-[#292827]/80 capitalize">
                {getLessonTypeIcon(lesson.type)}
                <span>{lesson.type}</span>
              </span>
              <span className="flex items-center gap-1 text-xs text-[#292827]/60">
                <Clock size={12} />
                <span>{lesson.duration}</span>
              </span>
            </div>

            <h3 className="font-serif text-xl sm:text-2xl font-semibold text-[#292827]">
              {lesson.title}
            </h3>
            <p className="text-xs sm:text-sm text-[#292827]/75 mt-1 font-sans">
              {lesson.description}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="p-1.5 rounded-[6px] text-[#292827]/60 hover:text-[#54252C] hover:bg-[#D8C8BA]/40 transition-colors flex-shrink-0"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-6 pt-3 border-b border-[#D8C8BA] bg-[#F6F1E9]">
          {[
            { id: "overview", label: "Learning Overview" },
            { id: "code", label: "Code & Architecture" },
            { id: "resources", label: "Curated Resources" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`pb-2.5 px-3 text-xs sm:text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? "border-[#54252C] text-[#54252C] font-semibold"
                  : "border-transparent text-[#292827]/70 hover:text-[#292827]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-5">
          {/* TAB 1: OVERVIEW */}
          {activeTab === "overview" && (
            <div className="space-y-4">
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-[#54252C] mb-2">
                  Key Learning Objectives:
                </h4>
                <ul className="space-y-2 text-xs sm:text-sm text-[#292827]/85">
                  {objectives.map((obj, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <div className="w-4 h-4 rounded-full bg-[#54252C]/10 text-[#54252C] flex items-center justify-center flex-shrink-0 mt-0.5 text-[0.65rem] font-bold">
                        {i + 1}
                      </div>
                      <span>{obj}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-4 rounded-[8px] bg-[#54252C]/5 border border-[#54252C]/15">
                <h4 className="text-xs font-semibold text-[#54252C] uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <Bookmark size={13} />
                  <span>Curriculum Context</span>
                </h4>
                <p className="text-xs text-[#292827]/80 leading-relaxed">
                  This milestone belongs to <strong>{phase.title}</strong>. Completing this exercise cements your technical mastery and updates your weekly study time on the Student Dashboard.
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: CODE & ARCHITECTURE */}
          {activeTab === "code" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-[#292827]/70 flex items-center gap-1">
                  <Terminal size={13} className="text-[#54252C]" />
                  <span>Pattern Implementation Reference</span>
                </span>
                <span className="text-[0.7rem] px-2 py-0.5 rounded-[3px] bg-[#D8C8BA]/40 text-[#292827]/70 font-mono">
                  TypeScript
                </span>
              </div>
              <pre className="p-4 rounded-[8px] bg-[#292827] text-[#F6F1E9] text-xs font-mono overflow-x-auto leading-relaxed border border-[#292827]">
                <code>{codeSample}</code>
              </pre>
            </div>
          )}

          {/* TAB 3: RESOURCES */}
          {activeTab === "resources" && (
            <div className="space-y-3">
              <p className="text-xs text-[#292827]/70">
                Recommended readings and practical sandboxes for this topic:
              </p>
              <div className="space-y-2">
                {resources.map((res, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-[6px] border border-[#D8C8BA] bg-[#F6F1E9] hover:border-[#54252C] transition-colors flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 rounded-[4px] bg-[#54252C]/10 text-[#54252C]">
                        {res.type === "repository" ? (
                          <FileCode size={14} />
                        ) : res.type === "documentation" ? (
                          <BookOpen size={14} />
                        ) : (
                          <Layers size={14} />
                        )}
                      </div>
                      <div>
                        <p className="text-xs font-medium text-[#292827] group-hover:text-[#54252C]">
                          {res.title}
                        </p>
                        <span className="text-[0.65rem] text-[#292827]/50 capitalize">
                          {res.type} Reference
                        </span>
                      </div>
                    </div>

                    <a
                      href={res.url || "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-[#54252C] hover:underline flex items-center gap-1 font-medium"
                    >
                      <span>Open</span>
                      <ExternalLink size={12} />
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="p-4 sm:p-5 border-t border-[#D8C8BA] bg-[#F6F1E9] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {isCompleted ? (
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] bg-[#54252C]/10 text-[#54252C] text-xs font-semibold">
                <Check size={14} strokeWidth={2.5} />
                <span>Completed Milestone</span>
              </div>
            ) : (
              <span className="text-xs text-[#292827]/70">
                Status: <strong>In Progress</strong>
              </span>
            )}
          </div>

          <div className="flex items-center justify-end gap-2.5">
            {isCompleted ? (
              <button
                type="button"
                onClick={() => onToggleComplete(lesson.id, true)}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-[6px] border border-[#D8C8BA] hover:border-[#803F47] text-xs text-[#54252C] font-medium transition-colors"
              >
                <RotateCcw size={12} />
                <span>Mark as Incomplete</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => onToggleComplete(lesson.id, false)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-[6px] bg-[#54252C] hover:bg-[#803F47] text-[#F6F1E9] text-xs sm:text-sm font-medium transition-colors shadow-2xs"
              >
                <Check size={14} strokeWidth={2.5} />
                <span>Mark as Completed</span>
              </button>
            )}

            {hasNextLesson && onNextLesson && (
              <button
                type="button"
                onClick={onNextLesson}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-[6px] border border-[#54252C] text-[#54252C] hover:bg-[#54252C]/5 text-xs sm:text-sm font-medium transition-colors"
              >
                <span>Next Milestone</span>
                <ArrowRight size={14} />
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-[6px] border border-[#D8C8BA] text-xs sm:text-sm font-medium text-[#292827] hover:bg-[#D8C8BA]/30 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
