"use client";

import React, { useState, useEffect } from "react";
import { RoadmapLesson, RoadmapPhase } from "@/types/roadmap";
import { getDetailedLessonModule, DetailedLessonModule } from "@/data/learningModules";
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
  Copy,
  Lightbulb,
  AlertTriangle,
  HelpCircle,
  Send,
  Bot,
  Video,
  FileText,
  Workflow,
  CheckCheck,
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
  const [activeTab, setActiveTab] = useState<"overview" | "code" | "practice" | "resources" | "ai_tutor">("overview");
  const [copiedCode, setCopiedCode] = useState(false);

  // Interactive Quiz State
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [submittedQuiz, setSubmittedQuiz] = useState(false);

  // AI Tutor in-modal State
  const [aiQuestion, setAiQuestion] = useState("");
  const [aiConversation, setAiConversation] = useState<{ role: "user" | "assistant"; text: string }[]>([]);
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Reset tab and states when lesson changes
  useEffect(() => {
    if (lesson) {
      setActiveTab("overview");
      setSelectedAnswers({});
      setSubmittedQuiz(false);
      setCopiedCode(false);
      setAiQuestion("");
      setAiConversation([]);
    }
  }, [lesson?.id]);

  if (!isOpen || !lesson || !phase) return null;

  // Resolve comprehensive detailed topic module
  const moduleData: DetailedLessonModule = getDetailedLessonModule(lesson, phase);
  const isCompleted = lesson.completed;

  const handleCopyCode = async () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(moduleData.codeBlueprint.code);
        setCopiedCode(true);
        setTimeout(() => setCopiedCode(false), 2200);
      } catch {
        // Fallback
      }
    }
  };

  const handleSelectQuizOption = (questionIdx: number, optionIdx: number) => {
    if (submittedQuiz) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionIdx]: optionIdx,
    }));
  };

  const handleAskAiTutor = async (promptText?: string) => {
    const query = promptText || aiQuestion;
    if (!query.trim() || isAiLoading) return;

    const userMessage = query.trim();
    setAiConversation((prev) => [...prev, { role: "user", text: userMessage }]);
    setAiQuestion("");
    setIsAiLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            ...aiConversation.map((m) => ({
              role: m.role,
              content: m.text,
            })),
            {
              role: "user",
              content: `Regarding the curriculum lesson "${moduleData.title}" (${phase.phaseName} • ${moduleData.domain}): ${userMessage}`,
            },
          ],
          userContext: {
            targetGoal: moduleData.domain,
            experienceLevel: "Intermediate",
            currentLesson: moduleData.title,
          },
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const reply = data.reply || "I analyzed your question regarding this concept. Focus on the core invariant properties and edge cases shown in the implementation blueprint.";
        setAiConversation((prev) => [...prev, { role: "assistant", text: reply }]);
      } else {
        throw new Error("Chat request failed");
      }
    } catch {
      // Pedagogical fallback response tailored to current lesson
      const fallbackReply = `Great question on **${moduleData.title}**! In production systems, the critical factor is verifying the mathematical/architectural invariant: ${moduleData.deepDive.mentalModel}. Review the implementation blueprint in the Code & Architecture tab to see how boundary errors are prevented.`;
      setAiConversation((prev) => [...prev, { role: "assistant", text: fallbackReply }]);
    } finally {
      setIsAiLoading(false);
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

  const getResourceIcon = (type: string) => {
    switch (type) {
      case "video":
        return <Video size={14} />;
      case "repository":
        return <FileCode size={14} />;
      case "article":
        return <FileText size={14} />;
      case "documentation":
      default:
        return <BookOpen size={14} />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#292827]/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog Content */}
      <div className="relative z-10 w-full max-w-3xl lg:max-w-4xl bg-[#F6F1E9] border border-[#D8C8BA] rounded-[12px] shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-[#D8C8BA] bg-[#F6F1E9] flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
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
                <span>{moduleData.duration}</span>
              </span>
              <span className="text-[0.7rem] px-2 py-0.5 rounded-[4px] bg-[#D8C8BA]/40 text-[#292827]/70 font-medium">
                {moduleData.domain}
              </span>
            </div>

            <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#292827] leading-tight">
              {moduleData.title}
            </h3>
            <p className="text-xs sm:text-sm text-[#292827]/75 mt-1 font-sans">
              {moduleData.subtitle}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="p-1.5 rounded-[6px] text-[#292827]/60 hover:text-[#54252C] hover:bg-[#D8C8BA]/40 transition-colors flex-shrink-0"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 sm:gap-2 px-4 sm:px-6 pt-2.5 border-b border-[#D8C8BA] bg-[#F6F1E9] overflow-x-auto scrollbar-none">
          {[
            { id: "overview", label: "Learning Overview", icon: BookOpen },
            { id: "code", label: "Code & Architecture", icon: Terminal },
            { id: "practice", label: "Interactive Checkpoint", icon: FileCheck },
            { id: "resources", label: "Curated Resources", icon: Layers },
            { id: "ai_tutor", label: "Ask AI Tutor", icon: Sparkles },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`pb-2.5 px-2.5 sm:px-3 text-xs sm:text-sm font-medium border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
                  isActive
                    ? "border-[#54252C] text-[#54252C] font-semibold"
                    : "border-transparent text-[#292827]/70 hover:text-[#292827] hover:border-[#D8C8BA]"
                }`}
              >
                <Icon size={14} className={isActive ? "text-[#54252C]" : "text-[#292827]/50"} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-6">
          {/* ======================================================== */}
          {/* TAB 1: LEARNING OVERVIEW & PEDAGOGICAL DEEP DIVE         */}
          {/* ======================================================== */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Key Learning Objectives */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#54252C] mb-2.5 flex items-center gap-1.5">
                  <CheckCircle2 size={14} className="text-[#54252C]" />
                  <span>Key Learning Objectives</span>
                </h4>
                <ul className="space-y-2.5 text-xs sm:text-sm text-[#292827]/85">
                  {moduleData.keyObjectives.map((obj, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <div className="w-5 h-5 rounded-full bg-[#54252C]/10 text-[#54252C] flex items-center justify-center flex-shrink-0 mt-0.5 text-[0.7rem] font-bold">
                        {i + 1}
                      </div>
                      <span className="leading-relaxed">{obj}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Mental Model Callout */}
              <div className="p-4 sm:p-5 rounded-[10px] bg-[#54252C]/5 border border-[#54252C]/15 space-y-2">
                <div className="flex items-center gap-2 text-[#54252C]">
                  <Lightbulb size={16} />
                  <h4 className="text-xs font-bold uppercase tracking-wider">
                    Core Mental Model & Intuition
                  </h4>
                </div>
                <p className="text-xs sm:text-sm text-[#292827]/90 leading-relaxed font-sans">
                  {moduleData.deepDive.mentalModel}
                </p>
              </div>

              {/* Core Pedagogical Concepts */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#54252C] flex items-center gap-1.5">
                  <Layers size={14} className="text-[#54252C]" />
                  <span>Foundational Concepts & Principles</span>
                </h4>
                <div className="grid grid-cols-1 gap-3">
                  {moduleData.deepDive.coreConcepts.map((concept, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 sm:p-4 rounded-[8px] border border-[#D8C8BA] bg-[#FDFBF7] space-y-1.5"
                    >
                      <h5 className="text-xs sm:text-sm font-semibold text-[#292827] flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#54252C]" />
                        <span>{concept.title}</span>
                      </h5>
                      <p className="text-xs text-[#292827]/80 leading-relaxed">
                        {concept.description}
                      </p>
                      {concept.highlight && (
                        <div className="pt-1 text-[0.7rem] font-medium text-[#54252C] flex items-center gap-1">
                          <Check size={12} className="text-[#54252C]" />
                          <span>{concept.highlight}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Real World Applications */}
              <div className="p-4 rounded-[8px] border border-[#D8C8BA] bg-[#FDFBF7] space-y-1.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#54252C] flex items-center gap-1.5">
                  <Workflow size={14} className="text-[#54252C]" />
                  <span>Production & Industry Real-World Applications</span>
                </h4>
                <p className="text-xs text-[#292827]/85 leading-relaxed">
                  {moduleData.deepDive.realWorldApplications}
                </p>
              </div>

              {/* Common Pitfalls & Anti-Patterns */}
              <div className="p-4 rounded-[8px] bg-[#FFF8F0] border border-[#E8C4A0] space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#A05A1C] flex items-center gap-1.5">
                  <AlertTriangle size={14} className="text-[#A05A1C]" />
                  <span>Common Pitfalls & Architectural Anti-Patterns</span>
                </h4>
                <ul className="space-y-1.5 text-xs text-[#292827]/85">
                  {moduleData.deepDive.pitfalls.map((pitfall, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-[#A05A1C] font-bold mt-0.5">•</span>
                      <span>{pitfall}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Curriculum Context */}
              <div className="p-4 rounded-[8px] bg-[#54252C]/5 border border-[#54252C]/15">
                <h4 className="text-xs font-semibold text-[#54252C] uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <Bookmark size={13} />
                  <span>Curriculum Context</span>
                </h4>
                <p className="text-xs text-[#292827]/80 leading-relaxed">
                  This milestone belongs to <strong>{phase.title}</strong> in your{" "}
                  <strong>{moduleData.domain}</strong> curriculum. Completing this exercise cements your technical mastery and updates your weekly study time on the Student Dashboard.
                </p>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 2: CODE & ARCHITECTURE                               */}
          {/* ======================================================== */}
          {activeTab === "code" && (
            <div className="space-y-4">
              {/* Code Header Bar */}
              <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-[8px] bg-[#E8DDD1]/40 border border-[#D8C8BA]">
                <div className="flex items-center gap-2">
                  <Terminal size={15} className="text-[#54252C]" />
                  <span className="text-xs font-semibold text-[#292827]">
                    {moduleData.codeBlueprint.filename}
                  </span>
                  <span className="text-[0.68rem] px-2 py-0.5 rounded-[4px] bg-[#54252C]/10 text-[#54252C] font-mono font-medium">
                    {moduleData.codeBlueprint.languageBadge}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[6px] border border-[#D8C8BA] hover:border-[#54252C] bg-[#F6F1E9] text-xs font-medium text-[#292827] transition-all hover:bg-white shadow-2xs"
                >
                  {copiedCode ? (
                    <>
                      <CheckCheck size={13} className="text-green-700" />
                      <span className="text-green-800 font-semibold">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy size={13} className="text-[#54252C]" />
                      <span>Copy Code</span>
                    </>
                  )}
                </button>
              </div>

              {/* Code Snippet Pre Block */}
              <div className="relative rounded-[8px] overflow-hidden border border-[#292827] bg-[#292827] shadow-inner">
                <pre className="p-4 sm:p-5 text-[#F6F1E9] text-xs font-mono overflow-x-auto leading-relaxed max-h-[460px] scrollbar-thin">
                  <code>{moduleData.codeBlueprint.code}</code>
                </pre>
              </div>

              {/* Architecture Data Flow Diagram */}
              {moduleData.codeBlueprint.architectureFlow && (
                <div className="p-3.5 rounded-[8px] bg-[#FDFBF7] border border-[#D8C8BA] space-y-1.5">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#54252C] flex items-center gap-1.5">
                    <Workflow size={13} />
                    <span>Data Flow & Execution Pipeline</span>
                  </span>
                  <div className="p-2.5 rounded-[6px] bg-[#292827]/5 border border-[#D8C8BA]/60 text-[0.72rem] font-mono text-[#292827]/90 overflow-x-auto">
                    {moduleData.codeBlueprint.architectureFlow}
                  </div>
                </div>
              )}

              {/* Technical Implementation Explanation */}
              <div className="p-3.5 rounded-[8px] bg-[#54252C]/5 border border-[#54252C]/15">
                <h5 className="text-xs font-semibold text-[#54252C] uppercase tracking-wider mb-1">
                  Blueprint Analysis & Key Steps
                </h5>
                <p className="text-xs text-[#292827]/85 leading-relaxed">
                  {moduleData.codeBlueprint.explanation}
                </p>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 3: INTERACTIVE CHECKPOINT & MINI-QUIZ                */}
          {/* ======================================================== */}
          {activeTab === "practice" && (
            <div className="space-y-6">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#54252C] mb-1 flex items-center gap-1.5">
                  <FileCheck size={14} className="text-[#54252C]" />
                  <span>Milestone Comprehension Assessment</span>
                </h4>
                <p className="text-xs text-[#292827]/70">
                  Validate your conceptual retention of {moduleData.title} by answering the verification questions below:
                </p>
              </div>

              <div className="space-y-5">
                {moduleData.quizQuestions.map((q, qIdx) => {
                  const selectedOpt = selectedAnswers[qIdx];
                  const hasAnswered = selectedOpt !== undefined;
                  const isCorrect = submittedQuiz && selectedOpt === q.correctIndex;
                  const isWrong = submittedQuiz && hasAnswered && selectedOpt !== q.correctIndex;

                  return (
                    <div
                      key={qIdx}
                      className="p-4 sm:p-5 rounded-[10px] border border-[#D8C8BA] bg-[#FDFBF7] space-y-3"
                    >
                      <p className="text-xs sm:text-sm font-semibold text-[#292827]">
                        <span className="text-[#54252C] mr-1.5">Q{qIdx + 1}:</span>
                        {q.question}
                      </p>

                      <div className="space-y-2">
                        {q.options.map((opt, oIdx) => {
                          const isOptionSelected = selectedOpt === oIdx;
                          let optionStyle = "border-[#D8C8BA] bg-[#F6F1E9] text-[#292827]/85 hover:border-[#54252C]";

                          if (submittedQuiz) {
                            if (oIdx === q.correctIndex) {
                              optionStyle = "border-green-600 bg-green-50 text-green-950 font-medium";
                            } else if (isOptionSelected && oIdx !== q.correctIndex) {
                              optionStyle = "border-red-400 bg-red-50 text-red-900";
                            }
                          } else if (isOptionSelected) {
                            optionStyle = "border-[#54252C] bg-[#54252C]/10 text-[#54252C] font-semibold";
                          }

                          return (
                            <button
                              key={oIdx}
                              type="button"
                              onClick={() => handleSelectQuizOption(qIdx, oIdx)}
                              className={`w-full text-left p-2.5 sm:p-3 rounded-[6px] border text-xs sm:text-sm transition-all flex items-start gap-2.5 ${optionStyle}`}
                            >
                              <div
                                className={`w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0 mt-0.5 text-[0.65rem] ${
                                  isOptionSelected
                                    ? "border-[#54252C] bg-[#54252C] text-white"
                                    : "border-[#D8C8BA]"
                                }`}
                              >
                                {String.fromCharCode(65 + oIdx)}
                              </div>
                              <span className="flex-1 leading-relaxed">{opt}</span>
                            </button>
                          );
                        })}
                      </div>

                      {/* Explanation Reveal */}
                      {submittedQuiz && (
                        <div
                          className={`p-3 rounded-[6px] text-xs leading-relaxed ${
                            selectedOpt === q.correctIndex
                              ? "bg-green-100/60 border border-green-300 text-green-900"
                              : "bg-red-100/60 border border-red-300 text-red-950"
                          }`}
                        >
                          <strong>{selectedOpt === q.correctIndex ? "Correct! " : "Incorrect. "}</strong>
                          {q.explanation}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Submit Quiz Actions */}
              <div className="flex items-center justify-between pt-2">
                {!submittedQuiz ? (
                  <button
                    type="button"
                    onClick={() => setSubmittedQuiz(true)}
                    disabled={Object.keys(selectedAnswers).length === 0}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-[6px] bg-[#54252C] hover:bg-[#803F47] disabled:opacity-50 text-[#F6F1E9] text-xs sm:text-sm font-medium transition-colors shadow-2xs"
                  >
                    <Check size={14} />
                    <span>Submit Verification Answers</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedAnswers({});
                      setSubmittedQuiz(false);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] border border-[#D8C8BA] hover:border-[#54252C] text-xs font-medium text-[#292827]"
                  >
                    <RotateCcw size={13} />
                    <span>Reset Quiz</span>
                  </button>
                )}
              </div>

              {/* Practical Challenge */}
              {moduleData.practicalChallenge && (
                <div className="p-4 rounded-[8px] bg-[#54252C]/5 border border-[#54252C]/15 space-y-2">
                  <h5 className="text-xs font-bold text-[#54252C] uppercase tracking-wider flex items-center gap-1.5">
                    <Code2 size={13} />
                    <span>Practical Coding Challenge</span>
                  </h5>
                  <p className="text-xs text-[#292827]/85 leading-relaxed">
                    {moduleData.practicalChallenge.prompt}
                  </p>
                  <p className="text-[0.72rem] text-[#292827]/70 italic">
                    Hint: {moduleData.practicalChallenge.starterHint}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 4: CURATED RESOURCES                                 */}
          {/* ======================================================== */}
          {activeTab === "resources" && (
            <div className="space-y-4">
              <p className="text-xs text-[#292827]/75">
                Authoritative external documentation, interactive sandboxes, and production references for{" "}
                <strong>{moduleData.title}</strong>:
              </p>

              <div className="grid grid-cols-1 gap-2.5">
                {moduleData.resources.map((res, i) => (
                  <div
                    key={i}
                    className="p-3.5 rounded-[8px] border border-[#D8C8BA] bg-[#FDFBF7] hover:border-[#54252C] transition-colors flex items-center justify-between group gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="p-2 rounded-[6px] bg-[#54252C]/10 text-[#54252C] flex-shrink-0">
                        {getResourceIcon(res.type)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs sm:text-sm font-semibold text-[#292827] group-hover:text-[#54252C] truncate">
                          {res.title}
                        </p>
                        <p className="text-[0.72rem] text-[#292827]/60 line-clamp-1 mt-0.5">
                          {res.description || `${res.type} reference for ${moduleData.title}`}
                        </p>
                        <span className="text-[0.65rem] px-1.5 py-0.2 rounded-[3px] bg-[#D8C8BA]/40 text-[#292827]/70 font-medium capitalize mt-1 inline-block">
                          {res.sourceLabel || `${res.type} Reference`}
                        </span>
                      </div>
                    </div>

                    <a
                      href={res.url || "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1.5 rounded-[6px] border border-[#D8C8BA] hover:border-[#54252C] hover:bg-white text-xs text-[#54252C] font-semibold flex items-center gap-1.5 flex-shrink-0 transition-all shadow-2xs"
                    >
                      <span>Open</span>
                      <ExternalLink size={12} />
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 5: ASK AI TUTOR                                      */}
          {/* ======================================================== */}
          {activeTab === "ai_tutor" && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-[8px] bg-[#54252C]/5 border border-[#54252C]/15 flex items-start gap-3">
                <div className="p-1.5 rounded-full bg-[#54252C]/10 text-[#54252C] mt-0.5 flex-shrink-0">
                  <Bot size={18} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#54252C] uppercase tracking-wider">
                    Shiksha AI Lesson Tutor
                  </h4>
                  <p className="text-xs text-[#292827]/80 mt-0.5">
                    Ask any question, request a step-by-step breakdown, or explore edge cases for{" "}
                    <strong>{moduleData.title}</strong>.
                  </p>
                </div>
              </div>

              {/* Quick Prompt Chips */}
              <div className="space-y-1.5">
                <span className="text-[0.7rem] uppercase tracking-wider font-semibold text-[#292827]/60">
                  Suggested Questions:
                </span>
                <div className="flex flex-wrap gap-2">
                  {[
                    `Explain the geometric intuition of ${moduleData.title} in simple terms.`,
                    `What are the most common bugs or performance pitfalls in ${moduleData.title}?`,
                    `How do high-scale tech companies apply ${moduleData.title} in production?`,
                  ].map((chip, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleAskAiTutor(chip)}
                      className="text-left text-xs px-2.5 py-1.5 rounded-[6px] border border-[#D8C8BA] hover:border-[#54252C] bg-[#FDFBF7] text-[#292827]/80 hover:text-[#54252C] transition-colors"
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              </div>

              {/* Chat Messages */}
              <div className="space-y-3 min-h-[140px] max-h-[300px] overflow-y-auto p-3 rounded-[8px] bg-[#FDFBF7] border border-[#D8C8BA]">
                {aiConversation.length === 0 ? (
                  <div className="text-center py-8 text-xs text-[#292827]/50">
                    Type a question below or pick a suggested topic to begin chatting with the AI Tutor.
                  </div>
                ) : (
                  aiConversation.map((msg, i) => (
                    <div
                      key={i}
                      className={`flex gap-2.5 text-xs ${
                        msg.role === "user" ? "justify-end" : "justify-start"
                      }`}
                    >
                      {msg.role === "assistant" && (
                        <div className="w-6 h-6 rounded-full bg-[#54252C]/10 text-[#54252C] flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Bot size={13} />
                        </div>
                      )}
                      <div
                        className={`p-3 rounded-[8px] max-w-[85%] leading-relaxed ${
                          msg.role === "user"
                            ? "bg-[#54252C] text-[#F6F1E9]"
                            : "bg-[#F6F1E9] border border-[#D8C8BA] text-[#292827]"
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{msg.text}</p>
                      </div>
                    </div>
                  ))
                )}
                {isAiLoading && (
                  <div className="flex items-center gap-2 text-xs text-[#54252C] italic">
                    <Sparkles size={14} className="animate-spin" />
                    <span>Shiksha Tutor is synthesizing explanation...</span>
                  </div>
                )}
              </div>

              {/* Chat Input */}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={aiQuestion}
                  onChange={(e) => setAiQuestion(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAskAiTutor()}
                  placeholder={`Ask a question about ${moduleData.title}...`}
                  className="flex-1 px-3.5 py-2 text-xs sm:text-sm rounded-[6px] border border-[#D8C8BA] bg-[#FDFBF7] text-[#292827] focus:outline-none focus:border-[#54252C]"
                />
                <button
                  type="button"
                  onClick={() => handleAskAiTutor()}
                  disabled={!aiQuestion.trim() || isAiLoading}
                  className="px-3.5 py-2 rounded-[6px] bg-[#54252C] hover:bg-[#803F47] disabled:opacity-50 text-[#F6F1E9] text-xs sm:text-sm font-medium transition-colors flex items-center gap-1"
                >
                  <Send size={13} />
                  <span>Send</span>
                </button>
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
