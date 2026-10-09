"use client";

import React, { useState, useEffect } from "react";
import {
  AssessmentQuestion,
  AssessmentSubmissionItem,
  AssessmentAttempt,
} from "@/types/assessment";
import { RoadmapPhase } from "@/types/roadmap";
import { assessmentService } from "@/services/assessmentService";
import {
  X,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Award,
  Clock,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Sparkles,
  HelpCircle,
  Check,
  ChevronRight,
  ShieldCheck,
  BookOpen,
  Loader2,
  FileCheck,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { CountUp } from "@/components/reactbits";

interface AssessmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  phase: RoadmapPhase;
  roadmapId: string;
  onAssessmentCompleted?: (attempt: AssessmentAttempt) => void;
}

export function AssessmentModal({
  isOpen,
  onClose,
  phase,
  roadmapId,
  onAssessmentCompleted,
}: AssessmentModalProps) {
  // Modal Stages: "intro" | "testing" | "confirming" | "grading" | "results"
  const [stage, setStage] = useState<"intro" | "testing" | "confirming" | "grading" | "results">("intro");
  const [questions, setQuestions] = useState<AssessmentQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);
  const [isGrading, setIsGrading] = useState(false);
  const [assessmentResult, setAssessmentResult] = useState<AssessmentAttempt | null>(null);
  const [startTime, setStartTime] = useState<number>(0);
  const [showExplanationId, setShowExplanationId] = useState<string | null>(null);

  // Load questions when modal opens
  useEffect(() => {
    if (isOpen && phase) {
      // Check if there is an existing attempt to offer viewing results or retaking
      const summary = assessmentService.getPhaseAssessmentSummary(roadmapId, phase);
      if (summary.latestAttempt) {
        setAssessmentResult(summary.latestAttempt);
      } else {
        setAssessmentResult(null);
      }

      setStage("intro");
      setCurrentIndex(0);
      setSelectedAnswers({});
    }
  }, [isOpen, phase, roadmapId]);

  const handleStartTest = async () => {
    setIsLoadingQuestions(true);
    try {
      const qList = await assessmentService.loadQuestionsForPhase(roadmapId, phase);
      setQuestions(qList);
      setCurrentIndex(0);
      setSelectedAnswers({});
      setStartTime(Date.now());
      setStage("testing");
    } catch (e) {
      console.error("Failed to start assessment:", e);
    } finally {
      setIsLoadingQuestions(false);
    }
  };

  const handleSelectOption = (questionId: string, optionIndex: number) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionIndex,
    }));
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setStage("confirming");
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleConfirmSubmit = async () => {
    setIsGrading(true);
    setStage("grading");

    const timeSpentSeconds = Math.round((Date.now() - startTime) / 1000);

    const submissionAnswers: AssessmentSubmissionItem[] = questions.map((q) => ({
      questionId: q.id,
      selectedOptionIndex: selectedAnswers[q.id] !== undefined ? selectedAnswers[q.id] : -1,
    }));

    try {
      const result = await assessmentService.submitAssessment(
        roadmapId,
        phase,
        submissionAnswers,
        timeSpentSeconds
      );

      setAssessmentResult(result);
      if (onAssessmentCompleted) {
        onAssessmentCompleted(result);
      }
      setStage("results");
    } catch (err) {
      console.error("Failed to submit assessment:", err);
    } finally {
      setIsGrading(false);
    }
  };

  if (!isOpen) return null;

  const currentQ = questions[currentIndex];
  const answeredCount = Object.keys(selectedAnswers).length;
  const totalQCount = questions.length;
  const progressPercent = totalQCount > 0 ? Math.round(((currentIndex + 1) / totalQCount) * 100) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#292827]/60 backdrop-blur-xs transition-opacity"
        onClick={stage === "testing" ? () => setStage("confirming") : onClose}
        aria-hidden="true"
      />

      {/* Main Modal Card */}
      <div className="relative z-10 w-full max-w-3xl bg-white border border-[#D8C8BA] rounded-2xl shadow-2xl overflow-hidden my-6 max-h-[92vh] flex flex-col animate-scale-in font-sans">
        {/* =========================================================================
            MODAL HEADER
            ========================================================================= */}
        <div className="px-5 sm:px-6 py-4 border-b border-[#D8C8BA]/80 bg-[#F6F1E9] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#54252C] text-[#F6F1E9] flex items-center justify-center shadow-xs">
              <FileCheck size={17} />
            </div>
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#54252C] block">
                {phase.phaseName || `Phase ${phase.phaseNumber}`} Certification
              </span>
              <h3 className="font-serif text-base sm:text-lg font-semibold text-[#292827] leading-tight line-clamp-1">
                {phase.title} Assessment
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#292827]/60 hover:text-[#54252C] hover:bg-[#D8C8BA]/30 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 sm:p-7 overflow-y-auto flex-1">
          {/* =========================================================================
              STAGE 1: INTRO SCREEN
              ========================================================================= */}
          {stage === "intro" && (
            <div className="text-center py-4 space-y-6 max-w-xl mx-auto">
              <div className="w-16 h-16 rounded-full bg-[#54252C]/10 text-[#54252C] flex items-center justify-center mx-auto shadow-inner">
                <Award size={32} />
              </div>

              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#54252C]/10 text-[#54252C] text-xs font-semibold uppercase tracking-wider mb-2">
                  <Sparkles size={13} /> Official Phase Evaluation
                </span>
                <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-[#292827]">
                  Ready to test your mastery?
                </h2>
                <p className="text-xs sm:text-sm text-[#292827]/75 mt-2 leading-relaxed font-sans">
                  Evaluate your understanding of all <strong>{phase.lessonsCount} lessons</strong> in{" "}
                  <strong>{phase.title}</strong>. Passing this 10-question assessment certifies your technical milestone.
                </p>
              </div>

              {/* Assessment Rules Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
                <div className="p-3.5 rounded-xl border border-[#D8C8BA] bg-[#F6F1E9]/60">
                  <span className="text-[11px] font-semibold text-[#292827]/60 block uppercase tracking-wider">Format</span>
                  <p className="text-xs font-bold text-[#292827] mt-0.5">10 Multiple Choice</p>
                  <p className="text-[11px] text-[#292827]/65 mt-0.5">Single correct answer</p>
                </div>

                <div className="p-3.5 rounded-xl border border-[#D8C8BA] bg-[#F6F1E9]/60">
                  <span className="text-[11px] font-semibold text-[#292827]/60 block uppercase tracking-wider">Passing Target</span>
                  <p className="text-xs font-bold text-[#54252C] mt-0.5">70% (7 of 10 Correct)</p>
                  <p className="text-[11px] text-[#292827]/65 mt-0.5">Unlimited retakes allowed</p>
                </div>

                <div className="p-3.5 rounded-xl border border-[#D8C8BA] bg-[#F6F1E9]/60">
                  <span className="text-[11px] font-semibold text-[#292827]/60 block uppercase tracking-wider">Estimated Time</span>
                  <p className="text-xs font-bold text-[#292827] mt-0.5">~10 - 15 Minutes</p>
                  <p className="text-[11px] text-[#292827]/65 mt-0.5">Navigate back & forth</p>
                </div>
              </div>

              {/* Previous Attempt Summary if Available */}
              {assessmentResult && (
                <div className={`p-4 rounded-xl border text-left flex items-center justify-between gap-4 ${
                  assessmentResult.passed
                    ? "bg-emerald-50/70 border-emerald-300 text-emerald-950"
                    : "bg-amber-50/70 border-amber-300 text-amber-950"
                }`}>
                  <div>
                    <span className="text-[11px] font-semibold uppercase tracking-wider block">
                      Previous Attempt ({assessmentResult.attemptNumber > 1 ? `Attempt #${assessmentResult.attemptNumber}` : "Latest Score"})
                    </span>
                    <p className="font-serif text-lg font-bold">
                      {assessmentResult.score} / {assessmentResult.totalQuestions} ({assessmentResult.percentage}%) —{" "}
                      {assessmentResult.passed ? "Passed ✓" : "Needs Retake"}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setStage("results")}
                    className="px-3 py-1.5 rounded-lg border border-current text-xs font-semibold hover:bg-black/5 transition-colors shrink-0"
                  >
                    View Last Results
                  </button>
                </div>
              )}

              {/* Start Test CTA */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={handleStartTest}
                  disabled={isLoadingQuestions}
                  className="w-full sm:w-auto px-8 py-3 rounded-xl bg-[#54252C] hover:bg-[#803F47] text-[#F6F1E9] text-sm font-semibold transition-all shadow-xs flex items-center justify-center gap-2"
                >
                  {isLoadingQuestions ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Generating Question Suite...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={16} className="text-[#D8C8BA]" />
                      <span>{assessmentResult ? "Retake Assessment" : "Begin Assessment"}</span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="w-full sm:w-auto px-5 py-3 rounded-xl border border-[#D8C8BA] text-xs font-medium text-[#292827] hover:bg-[#F6F1E9] transition-colors"
                >
                  Return to Learning Path
                </button>
              </div>
            </div>
          )}

          {/* =========================================================================
              STAGE 2: TESTING SCREEN (ONE QUESTION AT A TIME)
              ========================================================================= */}
          {stage === "testing" && currentQ && (
            <div className="space-y-6">
              {/* Stepper Progress Bar */}
              <div>
                <div className="flex items-center justify-between text-xs text-[#292827]/75 mb-2 font-medium">
                  <span className="font-semibold text-[#54252C]">
                    Question {currentIndex + 1} of {totalQCount}
                  </span>
                  <span>
                    {answeredCount} of {totalQCount} Answered
                  </span>
                </div>
                <div className="w-full bg-[#D8C8BA]/40 h-2 rounded-full overflow-hidden">
                  <div
                    style={{ width: `${progressPercent}%` }}
                    className="h-full bg-[#54252C] rounded-full transition-all duration-300"
                  />
                </div>
              </div>

              {/* Question Pills Navigator */}
              <div className="flex flex-wrap gap-1.5 pb-1 border-b border-[#D8C8BA]/50">
                {questions.map((q, idx) => {
                  const isCurrent = idx === currentIndex;
                  const isAnswered = selectedAnswers[q.id] !== undefined;

                  return (
                    <button
                      key={q.id}
                      type="button"
                      onClick={() => setCurrentIndex(idx)}
                      className={`w-7 h-7 rounded-lg text-xs font-semibold transition-all flex items-center justify-center ${
                        isCurrent
                          ? "bg-[#54252C] text-[#F6F1E9] ring-2 ring-[#54252C]/30 shadow-xs"
                          : isAnswered
                          ? "bg-[#54252C]/15 text-[#54252C] border border-[#54252C]/30"
                          : "bg-[#F6F1E9] border border-[#D8C8BA] text-[#292827]/60 hover:border-[#54252C]"
                      }`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>

              {/* Question Header & Body */}
              <div>
                {currentQ.category && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-[#54252C] bg-[#54252C]/10 px-2.5 py-0.5 rounded-md mb-2">
                    {currentQ.category}
                  </span>
                )}
                <h4 className="font-serif text-lg sm:text-xl font-semibold text-[#292827] leading-snug">
                  {currentQ.question}
                </h4>

                {currentQ.codeSnippet && (
                  <pre className="mt-3 p-3 rounded-xl bg-[#292827] text-[#F6F1E9] text-xs font-mono overflow-x-auto">
                    <code>{currentQ.codeSnippet}</code>
                  </pre>
                )}
              </div>

              {/* 4 Interactive Option Cards */}
              <div className="space-y-3">
                {currentQ.options.map((option, optIdx) => {
                  const isSelected = selectedAnswers[currentQ.id] === optIdx;
                  const optionLetters = ["A", "B", "C", "D"];

                  return (
                    <button
                      key={optIdx}
                      type="button"
                      onClick={() => handleSelectOption(currentQ.id, optIdx)}
                      className={`w-full p-4 rounded-xl border text-left transition-all flex items-start gap-3.5 group ${
                        isSelected
                          ? "border-[#54252C] bg-[#54252C]/5 ring-1 ring-[#54252C] shadow-xs"
                          : "border-[#D8C8BA] bg-white hover:border-[#54252C]/60 hover:bg-[#F6F1E9]/40"
                      }`}
                    >
                      <div
                        className={`w-6 h-6 rounded-lg text-xs font-bold flex items-center justify-center shrink-0 transition-colors ${
                          isSelected
                            ? "bg-[#54252C] text-[#F6F1E9]"
                            : "bg-[#F6F1E9] border border-[#D8C8BA] text-[#292827]/70 group-hover:border-[#54252C]"
                        }`}
                      >
                        {optionLetters[optIdx]}
                      </div>
                      <span className="text-xs sm:text-sm font-medium text-[#292827] leading-relaxed pt-0.5">
                        {option}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* =========================================================================
              STAGE 3: SUBMISSION CONFIRMATION
              ========================================================================= */}
          {stage === "confirming" && (
            <div className="text-center py-6 space-y-6 max-w-md mx-auto">
              <div className="w-14 h-14 rounded-full bg-[#54252C]/10 text-[#54252C] flex items-center justify-center mx-auto">
                <HelpCircle size={28} />
              </div>

              <div>
                <h3 className="font-serif text-2xl font-semibold text-[#292827]">
                  Submit Your Assessment?
                </h3>
                <p className="text-xs sm:text-sm text-[#292827]/75 mt-1.5 leading-relaxed font-sans">
                  You have completed <strong>{answeredCount}</strong> of <strong>{totalQCount}</strong> questions.
                </p>

                {answeredCount < totalQCount && (
                  <div className="mt-3 p-3 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs flex items-center gap-2 text-left">
                    <AlertCircle size={16} className="shrink-0 text-amber-700" />
                    <span>
                      You have <strong>{totalQCount - answeredCount} unanswered</strong> question(s). Unanswered questions will be scored as 0.
                    </span>
                  </div>
                )}
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={handleConfirmSubmit}
                  className="w-full sm:w-1/2 py-3 px-4 rounded-xl bg-[#54252C] hover:bg-[#803F47] text-[#F6F1E9] text-xs font-semibold transition-all shadow-xs flex items-center justify-center gap-2"
                >
                  <Check size={16} />
                  <span>Submit & Grade Now</span>
                </button>
                <button
                  type="button"
                  onClick={() => setStage("testing")}
                  className="w-full sm:w-1/2 py-3 px-4 rounded-xl border border-[#D8C8BA] text-xs font-medium text-[#292827] hover:bg-[#F6F1E9] transition-colors"
                >
                  Review Questions
                </button>
              </div>
            </div>
          )}

          {/* =========================================================================
              STAGE 4: GRADING STATE
              ========================================================================= */}
          {stage === "grading" && (
            <div className="text-center py-16 space-y-4">
              <Loader2 size={36} className="animate-spin text-[#54252C] mx-auto" />
              <h3 className="font-serif text-xl font-semibold text-[#292827]">
                Evaluating Your Assessment...
              </h3>
              <p className="text-xs text-[#292827]/70 font-sans">
                Verifying answers against the curriculum benchmark and computing phase mastery.
              </p>
            </div>
          )}

          {/* =========================================================================
              STAGE 5: RESULTS & DETAILED QUESTION-BY-QUESTION REVIEW
              ========================================================================= */}
          {stage === "results" && assessmentResult && (
            <div className="space-y-6">
              {/* Score Hero Card */}
              <div
                className={`p-6 sm:p-7 rounded-2xl border text-center relative overflow-hidden shadow-xs ${
                  assessmentResult.passed
                    ? "bg-emerald-50/80 border-emerald-300 text-emerald-950"
                    : "bg-amber-50/80 border-amber-300 text-amber-950"
                }`}
              >
                <div
                  className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3 shadow-xs ${
                    assessmentResult.passed
                      ? "bg-emerald-600 text-white"
                      : "bg-amber-600 text-white"
                  }`}
                >
                  {assessmentResult.passed ? <CheckCircle2 size={30} /> : <XCircle size={30} />}
                </div>

                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-1.5 ${
                    assessmentResult.passed
                      ? "bg-emerald-200/80 text-emerald-900"
                      : "bg-amber-200/80 text-amber-900"
                  }`}
                >
                  {assessmentResult.passed ? "Phase Assessment Passed" : "Retake Recommended"}
                </span>

                <h3 className="font-serif text-3xl sm:text-4xl font-bold mt-1">
                  <CountUp to={assessmentResult.percentage} suffix="%" duration={1.2} />
                </h3>

                <p className="text-xs sm:text-sm font-medium mt-1">
                  You scored <strong>{assessmentResult.score} out of {assessmentResult.totalQuestions}</strong> correct (Passing target: 70%).
                </p>

                <p className="text-xs opacity-80 mt-2 max-w-md mx-auto font-sans">
                  {assessmentResult.passed
                    ? "Outstanding work! You have proven strong competency across this curriculum phase."
                    : "You are close! Review the detailed explanations below and retake the assessment to earn full certification."}
                </p>
              </div>

              {/* Detailed Question Review Header */}
              <div className="flex items-center justify-between pt-2 border-t border-[#D8C8BA]/60">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#54252C] flex items-center gap-1.5">
                  <BookOpen size={14} /> Detailed Question Breakdown
                </span>
                <span className="text-xs text-[#292827]/60">
                  {assessmentResult.results.filter((r) => r.isCorrect).length} Correct /{" "}
                  {assessmentResult.results.filter((r) => !r.isCorrect).length} Incorrect
                </span>
              </div>

              {/* Question Results List */}
              <div className="space-y-4">
                {assessmentResult.results.map((res, rIdx) => {
                  const isExpanded = showExplanationId === res.questionId;
                  const optionLetters = ["A", "B", "C", "D"];

                  return (
                    <div
                      key={res.questionId || rIdx}
                      className={`p-4 rounded-xl border transition-all ${
                        res.isCorrect
                          ? "border-emerald-300 bg-emerald-50/30"
                          : "border-red-300 bg-red-50/30"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-2.5">
                          <div
                            className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                              res.isCorrect
                                ? "bg-emerald-600 text-white"
                                : "bg-red-600 text-white"
                            }`}
                          >
                            {res.isCorrect ? <Check size={13} strokeWidth={3} /> : <X size={13} strokeWidth={3} />}
                          </div>
                          <div>
                            <span className="text-[11px] font-semibold text-[#292827]/60 block mb-0.5">
                              Question {rIdx + 1}
                            </span>
                            <h5 className="font-serif text-sm font-semibold text-[#292827]">
                              {res.question}
                            </h5>
                          </div>
                        </div>

                        <span
                          className={`text-[11px] font-bold px-2 py-0.5 rounded-md shrink-0 uppercase tracking-wider ${
                            res.isCorrect
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {res.isCorrect ? "+1 pt" : "0 pts"}
                        </span>
                      </div>

                      {/* Options breakdown */}
                      <div className="mt-3 pl-8 space-y-1.5 text-xs">
                        {res.options.map((opt, oIdx) => {
                          const isStudentChoice = res.selectedOptionIndex === oIdx;
                          const isCorrectChoice = res.correctOptionIndex === oIdx;

                          return (
                            <div
                              key={oIdx}
                              className={`p-2 rounded-lg flex items-center justify-between text-xs font-medium ${
                                isCorrectChoice
                                  ? "bg-emerald-100/90 text-emerald-900 font-semibold border border-emerald-300"
                                  : isStudentChoice && !res.isCorrect
                                  ? "bg-red-100/90 text-red-900 border border-red-300"
                                  : "text-[#292827]/70"
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <span className="font-bold">{optionLetters[oIdx]}.</span>
                                <span>{opt}</span>
                              </div>
                              <div>
                                {isCorrectChoice && (
                                  <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">
                                    Correct Answer ✓
                                  </span>
                                )}
                                {isStudentChoice && !isCorrectChoice && (
                                  <span className="text-[10px] font-bold text-red-800 uppercase tracking-wider">
                                    Your Choice ✗
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Explanation box */}
                      {res.explanation && (
                        <div className="mt-3 pl-8 pt-2 border-t border-[#D8C8BA]/40 text-xs text-[#292827]/80 leading-relaxed">
                          <strong className="text-[#54252C]">Explanation: </strong>
                          <span>{res.explanation}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* =========================================================================
            MODAL FOOTER CONTROLS
            ========================================================================= */}
        <div className="px-5 sm:px-6 py-4 border-t border-[#D8C8BA]/80 bg-[#F6F1E9] flex items-center justify-between shrink-0">
          {stage === "testing" && (
            <>
              <button
                type="button"
                onClick={handlePrev}
                disabled={currentIndex === 0}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-[#D8C8BA] text-xs font-semibold text-[#292827] hover:bg-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ArrowLeft size={14} />
                <span>Previous</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setStage("confirming")}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold text-[#54252C] hover:underline"
                >
                  Review All ({answeredCount}/{totalQCount})
                </button>

                {currentIndex < totalQCount - 1 ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[#54252C] hover:bg-[#803F47] text-[#F6F1E9] text-xs font-semibold transition-all shadow-2xs"
                  >
                    <span>Next</span>
                    <ArrowRight size={14} />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setStage("confirming")}
                    className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[#54252C] hover:bg-[#803F47] text-[#F6F1E9] text-xs font-semibold transition-all shadow-2xs"
                  >
                    <span>Finish & Submit</span>
                    <Check size={14} />
                  </button>
                )}
              </div>
            </>
          )}

          {stage === "results" && (
            <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleStartTest}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl border border-[#54252C] text-[#54252C] hover:bg-[#54252C]/5 text-xs font-semibold transition-colors"
              >
                <RotateCcw size={14} />
                <span>Retake Assessment</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-6 py-2.5 rounded-xl bg-[#54252C] hover:bg-[#803F47] text-[#F6F1E9] text-xs font-semibold transition-all shadow-xs"
              >
                <span>Continue Learning Path</span>
                <ArrowRight size={14} />
              </button>
            </div>
          )}

          {stage === "intro" && (
            <div className="w-full flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-[#292827]/70 hover:text-[#292827]"
              >
                Close
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
