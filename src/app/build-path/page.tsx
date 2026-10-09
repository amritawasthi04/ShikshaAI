"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AppLayout } from "@/components/layout/AppLayout";
import { roadmapService, initialPathBuilderState } from "@/services/roadmapService";
import { PathBuilderState } from "@/types/roadmap";
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Check,
  Code2,
  BrainCircuit,
  Database,
  Cloud,
  Smartphone,
  Cpu,
  Loader2,
  X,
  Plus,
  AlertCircle,
  HelpCircle,
  Clock,
  BookOpen,
  Layers,
  CheckCircle2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function BuildPathPage() {
  const router = useRouter();

  // Wizard state initialized from localStorage draft if available
  const [formData, setFormData] = useState<PathBuilderState>(initialPathBuilderState);
  const [customSkillInput, setCustomSkillInput] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationPhase, setGenerationPhase] = useState("");
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [hasRestoredDraft, setHasRestoredDraft] = useState(false);

  // Suggested Goals for Step 1
  const suggestedGoals = [
    {
      id: "fullstack",
      title: "Full-Stack Web Developer",
      desc: "React, Next.js, Node APIs, PostgreSQL & Production Deployment",
      icon: Code2,
    },
    {
      id: "dsa",
      title: "Data Structures & Algorithms Specialist",
      desc: "Algorithmic patterns, complexity optimization & technical problem solving",
      icon: Cpu,
    },
    {
      id: "ai-ml",
      title: "Machine Learning & AI Engineer",
      desc: "Python, PyTorch, statistical modeling, neural networks & data pipelines",
      icon: BrainCircuit,
    },
    {
      id: "cloud-devops",
      title: "Cloud Architect & DevOps Engineer",
      desc: "Docker, Kubernetes, AWS infrastructure, Terraform & CI/CD pipelines",
      icon: Cloud,
    },
    {
      id: "mobile-dev",
      title: "Mobile App Developer (iOS / Android)",
      desc: "React Native, Expo, mobile state synchronization & native capabilities",
      icon: Smartphone,
    },
    {
      id: "backend-db",
      title: "Backend Systems & Database Architect",
      desc: "High-throughput APIs, database sharding, caching strategies & message queues",
      icon: Database,
    },
  ];

  // Experience levels for Step 2
  const experienceLevels = [
    {
      id: "beginner",
      title: "Beginner / Starting from Scratch",
      desc: "Little to no prior programming background. Looking for fundamental foundations and clear progression.",
    },
    {
      id: "intermediate",
      title: "Intermediate / Building Projects",
      desc: "Comfortable with syntax and basic applications. Looking to build scalable, full-stack production systems.",
    },
    {
      id: "advanced",
      title: "Advanced / Professional Upskilling",
      desc: "Working engineer aiming to master system architecture, performance optimization, and deep internals.",
    },
  ];

  // Background options for Step 2
  const backgrounds = [
    "Computer Science / STEM Student",
    "Self-Taught Coder",
    "Working Professional (Career Transition)",
    "Experienced Software Engineer (Upskilling)",
    "Tech Enthusiast / Hobbyist",
  ];

  // Predefined skill chips for Step 3
  const availableSkills = [
    "JavaScript",
    "TypeScript",
    "React",
    "Next.js",
    "Node.js",
    "Python",
    "SQL / PostgreSQL",
    "HTML5 & CSS3",
    "Tailwind CSS",
    "Git & GitHub",
    "Docker",
    "REST APIs",
    "GraphQL",
    "MongoDB",
    "Redis",
    "AWS",
    "Java",
    "C++",
    "Linux / Bash",
    "Data Structures",
  ];

  // Learning styles for Step 4
  const learningStyles = [
    {
      id: "project-first",
      title: "Hands-on Project First",
      desc: "Build real-world applications with practical milestone checkpoints.",
    },
    {
      id: "balanced",
      title: "Balanced & Structured (Recommended)",
      desc: "Mix of core architectural theory, guided practice exercises, and capstones.",
    },
    {
      id: "deep-theory",
      title: "Deep Theory & Concepts",
      desc: "Understand algorithmic internals, mathematical principles, and architecture before coding.",
    },
  ];

  // Load draft from localStorage on mount
  useEffect(() => {
    const draft = roadmapService.loadDraft();
    if (draft && (draft.goal || draft.experienceLevel || draft.knownSkills.length > 0)) {
      setFormData(draft);
      setHasRestoredDraft(true);
      setTimeout(() => setHasRestoredDraft(false), 4000);
    }
  }, []);

  // Save draft whenever formData changes
  const updateFormData = (updates: Partial<PathBuilderState>) => {
    setFormData((prev) => {
      const next = { ...prev, ...updates };
      roadmapService.saveDraft(next);
      return next;
    });
    if (errorMessage) setErrorMessage("");
  };

  // Validation function per step
  const validateStep = (step: number): boolean => {
    setErrorMessage("");

    if (step === 1) {
      if (!formData.goal.trim() && !formData.targetRole) {
        setErrorMessage("Please enter or select your target learning goal.");
        return false;
      }
      if (formData.goal.trim().length > 0 && formData.goal.trim().length < 3) {
        setErrorMessage("Please enter a descriptive learning goal (at least 3 characters).");
        return false;
      }
    }

    if (step === 2) {
      if (!formData.experienceLevel) {
        setErrorMessage("Please select your current experience level.");
        return false;
      }
      if (!formData.background) {
        setErrorMessage("Please select your relevant background.");
        return false;
      }
    }

    if (step === 3) {
      if (!formData.isCompleteBeginner && formData.knownSkills.length === 0) {
        setErrorMessage("Please select at least one known skill or check 'I am a complete beginner'.");
        return false;
      }
    }

    if (step === 4) {
      if (!formData.learningStyle) {
        setErrorMessage("Please choose your preferred learning style.");
        return false;
      }
      if (!formData.weeklyPace) {
        setErrorMessage("Please select your weekly study pace.");
        return false;
      }
    }

    return true;
  };

  const handleNext = () => {
    if (!validateStep(formData.currentStep)) {
      return;
    }
    const nextStep = Math.min(formData.currentStep + 1, 4);
    updateFormData({ currentStep: nextStep });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleBack = () => {
    setErrorMessage("");
    const prevStep = Math.max(formData.currentStep - 1, 1);
    updateFormData({ currentStep: prevStep });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancelClick = () => {
    const hasData =
      formData.goal ||
      formData.experienceLevel ||
      formData.knownSkills.length > 0;

    if (hasData) {
      setShowCancelModal(true);
    } else {
      router.push("/dashboard");
    }
  };

  const handleConfirmDiscard = () => {
    roadmapService.clearDraft();
    setFormData(initialPathBuilderState);
    setShowCancelModal(false);
    router.push("/dashboard");
  };

  const handleToggleSkill = (skill: string) => {
    if (formData.isCompleteBeginner) {
      updateFormData({ isCompleteBeginner: false });
    }

    const currentSkills = formData.knownSkills;
    if (currentSkills.includes(skill)) {
      updateFormData({
        knownSkills: currentSkills.filter((s) => s !== skill),
      });
    } else {
      updateFormData({
        knownSkills: [...currentSkills, skill],
      });
    }
  };

  const handleAddCustomSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customSkillInput.trim()) return;

    const formatted = customSkillInput.trim();
    if (!formData.knownSkills.includes(formatted)) {
      updateFormData({
        knownSkills: [...formData.knownSkills, formatted],
        isCompleteBeginner: false,
      });
    }
    setCustomSkillInput("");
  };

  const handleGenerateRoadmap = async () => {
    if (!validateStep(4)) return;

    setIsGenerating(true);
    setGenerationPhase("Synthesizing your career targets & skill level...");

    setTimeout(() => {
      setGenerationPhase("Structuring customized milestone curriculum...");
    }, 500);

    setTimeout(() => {
      setGenerationPhase("Finalizing your interactive roadmap...");
    }, 1000);

    try {
      await roadmapService.generateRoadmap(formData);
      router.push("/dashboard");
    } catch {
      setIsGenerating(false);
      setErrorMessage("Unable to generate roadmap. Please try again.");
    }
  };

  const stepsMeta = [
    { number: 1, label: "Goal" },
    { number: 2, label: "Experience" },
    { number: 3, label: "Skills" },
    { number: 4, label: "Preferences" },
  ];

  return (
    <AppLayout
      pageTitle="Build My Path"
      pageSubtitle="Design a personalized, adaptive learning roadmap structured for your specific goals."
      actionElement={
        <button
          type="button"
          onClick={handleCancelClick}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-[6px] border border-[#D8C8BA] text-xs sm:text-sm font-medium text-[#292827]/80 hover:text-[#803F47] hover:bg-[#D8C8BA]/30 transition-colors"
        >
          <X size={15} />
          <span>Cancel</span>
        </button>
      }
    >
      {/* Draft Restored Toast Notice */}
      <AnimatePresence>
        {hasRestoredDraft && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="mb-6 p-3 rounded-[8px] bg-[#54252C]/10 border border-[#54252C]/30 text-xs sm:text-sm text-[#54252C] flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} />
              <span>Restored your saved progress from your previous session.</span>
            </div>
            <button
              type="button"
              onClick={() => setHasRestoredDraft(false)}
              className="text-xs font-semibold hover:underline"
            >
              Dismiss
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress Bar & Stepper Indicator */}
      <div className="max-w-3xl mx-auto mb-8 sm:mb-10">
        {/* Progress Bar */}
        <div className="w-full bg-[#D8C8BA]/60 h-2 rounded-full mb-6 overflow-hidden">
          <div
            style={{ width: `${(formData.currentStep / 4) * 100}%` }}
            className="h-full bg-[#54252C] transition-all duration-300 rounded-full"
          />
        </div>

        {/* Stepper Dots */}
        <div className="flex items-center justify-between relative">
          <div className="absolute left-4 right-4 top-1/2 -translate-y-1/2 h-[1px] bg-[#D8C8BA] z-0" />
          {stepsMeta.map((s) => {
            const isCompleted = formData.currentStep > s.number;
            const isCurrent = formData.currentStep === s.number;

            return (
              <div
                key={s.number}
                className="relative z-10 flex flex-col items-center select-none"
              >
                <div
                  className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-xs font-semibold transition-all duration-200 ${
                    isCompleted
                      ? "bg-[#54252C] text-[#F6F1E9]"
                      : isCurrent
                      ? "bg-[#54252C] text-[#F6F1E9] ring-4 ring-[#54252C]/20"
                      : "bg-[#F6F1E9] border border-[#D8C8BA] text-[#292827]/60"
                  }`}
                >
                  {isCompleted ? <Check size={14} strokeWidth={2.5} /> : s.number}
                </div>
                <span
                  className={`text-xs font-medium mt-1.5 transition-colors ${
                    isCurrent
                      ? "text-[#54252C] font-semibold"
                      : "text-[#292827]/75"
                  }`}
                >
                  {s.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Wizard Form Card */}
      <div className="max-w-3xl mx-auto bg-[#F6F1E9] border border-[#D8C8BA] rounded-[10px] p-6 sm:p-10 shadow-xs">
        {/* Inline Error Alert */}
        <AnimatePresence>
          {errorMessage && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="mb-6 p-3.5 rounded-[8px] bg-[#F6F1E9] border border-[#803F47] text-xs sm:text-sm text-[#803F47] flex items-center gap-2"
              role="alert"
            >
              <AlertCircle size={16} className="flex-shrink-0" />
              <span>{errorMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* STEP 1: GOAL */}
        {formData.currentStep === 1 && (
          <div>
            <div className="mb-6">
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#54252C]">
                Step 1 of 4
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-[#292827] mt-1">
                What is your target career or learning goal?
              </h2>
              <p className="text-sm text-[#292827]/75 mt-1.5 font-sans">
                Enter your desired role or select one of our curated career tracks below.
              </p>
            </div>

            {/* Custom Goal Input */}
            <div className="mb-6">
              <label
                htmlFor="goalInput"
                className="block text-sm font-medium text-[#292827] mb-1.5"
              >
                Target Learning Goal / Role
              </label>
              <input
                id="goalInput"
                type="text"
                placeholder="e.g. Senior Full-Stack Engineer, Master DSA for interviews..."
                value={formData.goal}
                onChange={(e) =>
                  updateFormData({ goal: e.target.value, targetRole: e.target.value })
                }
                className="w-full bg-[#F6F1E9] text-[#292827] placeholder:text-[#292827]/40 text-base sm:text-sm rounded-[8px] border border-[#D8C8BA] p-3.5 focus:outline-none focus:border-[#54252C] focus:ring-1 focus:ring-[#54252C] transition-colors"
              />
            </div>

            {/* Clickable Suggested Goals */}
            <div>
              <p className="text-xs font-semibold text-[#292827]/70 uppercase tracking-wider mb-3">
                Or choose from suggested tracks:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {suggestedGoals.map((sg) => {
                  const Icon = sg.icon;
                  const isSelected =
                    formData.targetRole === sg.title ||
                    formData.goal.toLowerCase() === sg.title.toLowerCase();

                  return (
                    <div
                      key={sg.id}
                      onClick={() =>
                        updateFormData({ goal: sg.title, targetRole: sg.title })
                      }
                      className={`p-4 rounded-[8px] border cursor-pointer transition-all duration-200 ${
                        isSelected
                          ? "border-[#54252C] bg-[#54252C]/5 ring-1 ring-[#54252C] shadow-2xs"
                          : "border-[#D8C8BA] bg-[#F6F1E9] hover:border-[#292827]/50"
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-1.5">
                        <div
                          className={`p-2 rounded-[6px] ${
                            isSelected
                              ? "bg-[#54252C] text-[#F6F1E9]"
                              : "bg-[#54252C]/10 text-[#54252C]"
                          }`}
                        >
                          <Icon size={18} />
                        </div>
                        <h3 className="font-sans font-semibold text-sm text-[#292827]">
                          {sg.title}
                        </h3>
                      </div>
                      <p className="text-xs text-[#292827]/70 leading-relaxed">
                        {sg.desc}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: EXPERIENCE */}
        {formData.currentStep === 2 && (
          <div>
            <div className="mb-6">
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#54252C]">
                Step 2 of 4
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-[#292827] mt-1">
                Tell us about your experience level
              </h2>
              <p className="text-sm text-[#292827]/75 mt-1.5 font-sans">
                We use this to set the difficulty of exercises and calibrate foundational modules.
              </p>
            </div>

            {/* Experience Level Cards */}
            <div className="space-y-3.5 mb-7">
              {experienceLevels.map((lvl) => {
                const isSelected = formData.experienceLevel === lvl.id;
                return (
                  <div
                    key={lvl.id}
                    onClick={() => updateFormData({ experienceLevel: lvl.id as any })}
                    className={`p-4 sm:p-5 rounded-[8px] border cursor-pointer flex items-start justify-between transition-all duration-200 ${
                      isSelected
                        ? "border-[#54252C] bg-[#54252C]/5 ring-1 ring-[#54252C] shadow-2xs"
                        : "border-[#D8C8BA] bg-[#F6F1E9] hover:border-[#292827]/50"
                    }`}
                  >
                    <div>
                      <h3 className="font-sans font-semibold text-base text-[#292827]">
                        {lvl.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-[#292827]/75 mt-1 leading-relaxed">
                        {lvl.desc}
                      </p>
                    </div>
                    <div
                      className={`w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 mt-0.5 ml-3 ${
                        isSelected
                          ? "border-[#54252C] bg-[#54252C] text-[#F6F1E9]"
                          : "border-[#D8C8BA]"
                      }`}
                    >
                      {isSelected && (
                        <div className="w-2 h-2 rounded-full bg-[#F6F1E9]" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Relevant Background Selection */}
            <div>
              <label
                htmlFor="backgroundSelect"
                className="block text-sm font-medium text-[#292827] mb-1.5"
              >
                What best describes your current background?
              </label>
              <select
                id="backgroundSelect"
                value={formData.background}
                onChange={(e) => updateFormData({ background: e.target.value })}
                className="w-full bg-[#F6F1E9] text-[#292827] text-sm rounded-[8px] border border-[#D8C8BA] p-3.5 focus:outline-none focus:border-[#54252C] focus:ring-1 focus:ring-[#54252C] transition-colors"
              >
                <option value="">Select your background...</option>
                {backgrounds.map((bg) => (
                  <option key={bg} value={bg}>
                    {bg}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* STEP 3: SKILLS */}
        {formData.currentStep === 3 && (
          <div>
            <div className="mb-6">
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#54252C]">
                Step 3 of 4
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-[#292827] mt-1">
                Which technologies or skills do you already know?
              </h2>
              <p className="text-sm text-[#292827]/75 mt-1.5 font-sans">
                Select your existing knowledge so we can optimize module prerequisites.
              </p>
            </div>

            {/* Complete Beginner Option */}
            <div className="mb-6">
              <label className="flex items-center gap-3 p-3.5 rounded-[8px] border border-[#D8C8BA] bg-[#F6F1E9] cursor-pointer hover:bg-[#D8C8BA]/20 transition-colors">
                <input
                  type="checkbox"
                  checked={formData.isCompleteBeginner}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    updateFormData({
                      isCompleteBeginner: checked,
                      knownSkills: checked ? [] : formData.knownSkills,
                    });
                  }}
                  className="accent-[#54252C] w-4 h-4 rounded"
                />
                <span className="text-sm font-medium text-[#292827]">
                  I am a complete beginner (skip known skills & start from scratch)
                </span>
              </label>
            </div>

            {/* Selectable Skill Chips */}
            <div
              className={`transition-opacity duration-200 ${
                formData.isCompleteBeginner ? "opacity-40 pointer-events-none" : ""
              }`}
            >
              <p className="text-xs font-semibold text-[#292827]/70 uppercase tracking-wider mb-3">
                Click to select known skills:
              </p>

              <div className="flex flex-wrap gap-2.5 mb-6">
                {availableSkills.map((skill) => {
                  const isSelected = formData.knownSkills.includes(skill);
                  return (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => handleToggleSkill(skill)}
                      className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-[6px] text-xs sm:text-sm font-medium transition-all duration-150 select-none ${
                        isSelected
                          ? "bg-[#54252C] text-[#F6F1E9] border border-[#54252C] shadow-2xs scale-[1.02]"
                          : "bg-[#F6F1E9] border border-[#D8C8BA] text-[#292827] hover:border-[#54252C] hover:bg-[#D8C8BA]/30"
                      }`}
                    >
                      {isSelected && <Check size={14} strokeWidth={2.5} />}
                      <span>{skill}</span>
                    </button>
                  );
                })}
              </div>

              {/* Add Custom Skill Tag */}
              <form onSubmit={handleAddCustomSkill} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Add custom skill (e.g. NextAuth, Tailwind, Rust)..."
                  value={customSkillInput}
                  onChange={(e) => setCustomSkillInput(e.target.value)}
                  className="flex-1 bg-[#F6F1E9] text-[#292827] placeholder:text-[#292827]/40 text-sm rounded-[8px] border border-[#D8C8BA] px-3.5 py-2 focus:outline-none focus:border-[#54252C]"
                />
                <button
                  type="submit"
                  className="inline-flex items-center gap-1 px-4 py-2 rounded-[8px] border border-[#54252C] text-[#54252C] text-xs sm:text-sm font-medium hover:bg-[#54252C]/5 transition-colors"
                >
                  <Plus size={15} />
                  <span>Add</span>
                </button>
              </form>

              {/* Selected Count Indicator */}
              <div className="mt-4 text-xs text-[#292827]/70">
                {formData.knownSkills.length > 0 ? (
                  <span>
                    Selected: <strong>{formData.knownSkills.join(", ")}</strong>
                  </span>
                ) : (
                  <span>No skills selected yet.</span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: PREFERENCES & PACE */}
        {formData.currentStep === 4 && (
          <div>
            <div className="mb-6">
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#54252C]">
                Step 4 of 4
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-[#292827] mt-1">
                Customize your learning style & pace
              </h2>
              <p className="text-sm text-[#292827]/75 mt-1.5 font-sans">
                Tailor how content is scheduled and structured across weekly milestones.
              </p>
            </div>

            {/* Learning Style */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-[#292827] mb-2.5">
                Preferred Learning Style
              </label>
              <div className="space-y-3">
                {learningStyles.map((style) => {
                  const isSelected = formData.learningStyle === style.id;
                  return (
                    <div
                      key={style.id}
                      onClick={() => updateFormData({ learningStyle: style.id as any })}
                      className={`p-4 rounded-[8px] border cursor-pointer flex items-start justify-between transition-all ${
                        isSelected
                          ? "border-[#54252C] bg-[#54252C]/5 ring-1 ring-[#54252C]"
                          : "border-[#D8C8BA] bg-[#F6F1E9] hover:border-[#292827]/50"
                      }`}
                    >
                      <div>
                        <h3 className="font-sans font-semibold text-sm text-[#292827]">
                          {style.title}
                        </h3>
                        <p className="text-xs text-[#292827]/75 mt-0.5">
                          {style.desc}
                        </p>
                      </div>
                      <div
                        className={`w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 mt-0.5 ml-3 ${
                          isSelected
                            ? "border-[#54252C] bg-[#54252C] text-[#F6F1E9]"
                            : "border-[#D8C8BA]"
                        }`}
                      >
                        {isSelected && (
                          <div className="w-2 h-2 rounded-full bg-[#F6F1E9]" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Weekly Pace */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-[#292827] mb-2.5">
                Weekly Study Commitment
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { id: "casual", title: "Casual Track", hours: "3 - 5 hrs / week" },
                  { id: "recommended", title: "Standard Track", hours: "8 - 12 hrs / week" },
                  { id: "intensive", title: "Intensive Track", hours: "15 - 20 hrs / week" },
                ].map((pace) => {
                  const isSelected = formData.weeklyPace === pace.id;
                  return (
                    <div
                      key={pace.id}
                      onClick={() => updateFormData({ weeklyPace: pace.id as any })}
                      className={`p-3.5 rounded-[8px] border cursor-pointer text-center transition-all ${
                        isSelected
                          ? "border-[#54252C] bg-[#54252C]/5 ring-1 ring-[#54252C]"
                          : "border-[#D8C8BA] bg-[#F6F1E9] hover:border-[#292827]/50"
                      }`}
                    >
                      <h4 className="font-sans font-semibold text-xs sm:text-sm text-[#292827]">
                        {pace.title}
                      </h4>
                      <p className="text-xs text-[#54252C] font-medium mt-1">
                        {pace.hours}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Target Duration */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-[#292827] mb-2.5">
                Target Timeline
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: "1m", label: "1 Month" },
                  { id: "3m", label: "3 Months" },
                  { id: "6m", label: "6 Months" },
                ].map((dur) => {
                  const isSelected = formData.targetDuration === dur.id;
                  return (
                    <button
                      key={dur.id}
                      type="button"
                      onClick={() => updateFormData({ targetDuration: dur.id as any })}
                      className={`py-2 rounded-[6px] text-xs sm:text-sm font-medium transition-all ${
                        isSelected
                          ? "bg-[#54252C] text-[#F6F1E9]"
                          : "bg-[#F6F1E9] border border-[#D8C8BA] text-[#292827]/80 hover:border-[#54252C]"
                      }`}
                    >
                      {dur.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Summary Review Card */}
            <div className="p-4 rounded-[8px] bg-[#F6F1E9] border border-[#D8C8BA] text-xs sm:text-sm divide-y divide-[#D8C8BA]/60">
              <div className="flex justify-between py-1.5">
                <span className="text-[#292827]/60">Goal / Role:</span>
                <span className="font-semibold text-[#292827]">
                  {formData.goal || formData.targetRole}
                </span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-[#292827]/60">Experience:</span>
                <span className="font-semibold text-[#292827] capitalize">
                  {formData.experienceLevel}
                </span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-[#292827]/60">Known Skills:</span>
                <span className="font-semibold text-[#292827]">
                  {formData.isCompleteBeginner
                    ? "Complete Beginner"
                    : formData.knownSkills.length > 0
                    ? formData.knownSkills.slice(0, 3).join(", ") +
                      (formData.knownSkills.length > 3 ? "..." : "")
                    : "None specified"}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Wizard Footer Controls (Back, Next, Generate) */}
        <div className="flex items-center justify-between pt-6 mt-8 border-t border-[#D8C8BA]">
          {formData.currentStep > 1 ? (
            <button
              type="button"
              onClick={handleBack}
              disabled={isGenerating}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-[6px] border border-[#D8C8BA] text-xs sm:text-sm font-medium text-[#292827] hover:bg-[#D8C8BA]/30 transition-colors disabled:opacity-50"
            >
              <ArrowLeft size={16} />
              <span>Back</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleCancelClick}
              className="text-xs sm:text-sm text-[#292827]/70 hover:text-[#803F47] hover:underline"
            >
              Cancel
            </button>
          )}

          {formData.currentStep < 4 ? (
            <button
              type="button"
              onClick={handleNext}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[8px] bg-[#54252C] hover:bg-[#803F47] text-[#F6F1E9] text-xs sm:text-sm font-medium transition-colors shadow-xs"
            >
              <span>Continue</span>
              <ArrowRight size={16} />
            </button>
          ) : (
            <button
              type="button"
              disabled={isGenerating}
              onClick={handleGenerateRoadmap}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-[8px] bg-[#54252C] hover:bg-[#803F47] text-[#F6F1E9] text-xs sm:text-sm font-medium transition-colors shadow-xs disabled:opacity-75"
            >
              {isGenerating ? (
                <>
                  <Loader2 size={16} className="animate-spin text-[#F6F1E9]" />
                  <span>{generationPhase}</span>
                </>
              ) : (
                <>
                  <Sparkles size={16} className="text-[#D8C8BA]" />
                  <span>Generate My Path</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Cancel & Discard Confirmation Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-[#292827]/40 backdrop-blur-xs transition-opacity"
            onClick={() => setShowCancelModal(false)}
            aria-hidden="true"
          />
          <div className="relative z-10 w-full max-w-md bg-[#F6F1E9] border border-[#D8C8BA] rounded-[10px] p-6 shadow-xl">
            <h3 className="font-serif text-xl font-semibold text-[#292827] mb-2">
              Discard Roadmap Progress?
            </h3>
            <p className="text-sm text-[#292827]/75 mb-6 leading-relaxed">
              You have entered selections in the path builder. Discarding will
              clear your draft and return you to the dashboard.
            </p>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowCancelModal(false)}
                className="px-4 py-2 rounded-[6px] border border-[#D8C8BA] text-sm font-medium text-[#292827] hover:bg-[#D8C8BA]/30"
              >
                Keep Editing
              </button>
              <button
                type="button"
                onClick={handleConfirmDiscard}
                className="px-4 py-2 rounded-[6px] bg-[#803F47] hover:bg-[#54252C] text-[#F6F1E9] text-sm font-medium transition-colors shadow-2xs"
              >
                Discard & Exit
              </button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
