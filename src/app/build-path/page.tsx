"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AppLayout } from "@/components/layout/AppLayout";
import {
  roadmapService,
  initialPathBuilderState,
} from "@/services/roadmapService";
import { authService } from "@/services/authService";
import { PathBuilderState, GeneratedRoadmap } from "@/types/roadmap";
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
  Route,
  ChevronDown,
  RotateCcw,
  Zap,
  TrendingUp,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function BuildPathPage() {
  const router = useRouter();

  // Mode: First-time user vs Returning user
  const [isReturningUser, setIsReturningUser] = useState(false);
  const [activeRoadmap, setActiveRoadmap] = useState<GeneratedRoadmap | null>(null);
  const [allRoadmaps, setAllRoadmaps] = useState<GeneratedRoadmap[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Success State for Newly Generated Roadmap
  const [justCreatedRoadmap, setJustCreatedRoadmap] = useState<GeneratedRoadmap | null>(null);

  // First-time 4-step wizard form state
  const [formData, setFormData] = useState<PathBuilderState>(initialPathBuilderState);
  const [customSkillInput, setCustomSkillInput] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationPhase, setGenerationPhase] = useState("");
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [hasRestoredDraft, setHasRestoredDraft] = useState(false);

  // Returning user concise form state
  const [newGoal, setNewGoal] = useState("");
  const [newExperience, setNewExperience] = useState<"beginner" | "intermediate" | "advanced">("intermediate");
  const [newStyle, setNewStyle] = useState<"project-first" | "balanced" | "deep-theory">("balanced");
  const [newPace, setNewPace] = useState<"casual" | "recommended" | "intensive">("recommended");
  const [newDuration, setNewDuration] = useState<"1m" | "3m" | "6m">("3m");

  // Suggested Roles & Goals
  const suggestedGoals = [
    {
      id: "fullstack",
      title: "Full-Stack Web Developer",
      desc: "React, Next.js, Node APIs, PostgreSQL & Production Deployment",
      icon: Code2,
    },
    {
      id: "dsa",
      title: "Data Structures & Algorithms",
      desc: "Algorithmic patterns, complexity optimization & technical interview preparation",
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
      title: "Cloud Architect & DevOps",
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

  // Experience options
  const experienceLevels = [
    {
      id: "beginner",
      title: "Beginner",
      subtitle: "Starting from Scratch",
      desc: "Fundamental concepts, syntax foundations, and clear progression.",
    },
    {
      id: "intermediate",
      title: "Intermediate",
      subtitle: "Building Projects",
      desc: "Comfortable with syntax. Ready for scalable production architectures.",
    },
    {
      id: "advanced",
      title: "Advanced",
      subtitle: "Professional Mastery",
      desc: "Master system design, performance optimization, and deep internals.",
    },
  ];

  // Backgrounds for First-time Wizard
  const backgrounds = [
    "Computer Science / STEM Student",
    "Self-Taught Coder",
    "Working Professional (Career Transition)",
    "Experienced Software Engineer (Upskilling)",
    "Tech Enthusiast / Hobbyist",
  ];

  // Predefined skills for First-time Wizard
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

  // Learning styles
  const learningStyles = [
    {
      id: "project-first",
      title: "Hands-on Project First",
      desc: "Build real-world applications with practical milestone checkpoints.",
    },
    {
      id: "balanced",
      title: "Balanced & Structured (Recommended)",
      desc: "Mix of architectural theory, guided practice exercises, and capstones.",
    },
    {
      id: "deep-theory",
      title: "Deep Theory & Concepts",
      desc: "Understand algorithmic internals, mathematical principles, and architecture.",
    },
  ];

  // Initialize state on mount
  useEffect(() => {
    // 1. Check if user already has an explicit saved roadmap
    const hasExplicit = roadmapService.hasExplicitRoadmap();
    const currentRoadmap = roadmapService.getActiveRoadmap();
    const savedList = roadmapService.getAllSavedRoadmaps();

    setIsReturningUser(hasExplicit);
    setActiveRoadmap(currentRoadmap);
    setAllRoadmaps(savedList);

    // 2. Pre-fill returning user defaults from saved profile or active roadmap
    const currentUser = authService.getCurrentUser();
    if (currentUser?.learningPreferences) {
      if (currentUser.learningPreferences.experienceLevel) {
        setNewExperience(currentUser.learningPreferences.experienceLevel);
      }
      if (currentUser.learningPreferences.studyPace) {
        const pace = currentUser.learningPreferences.studyPace;
        if (pace === "intensive") setNewPace("intensive");
        else if (pace === "relaxed") setNewPace("casual");
        else setNewPace("recommended");
      }
    }

    if (currentRoadmap) {
      if (currentRoadmap.learningStyle) {
        setNewStyle(
          currentRoadmap.learningStyle.toLowerCase().includes("project")
            ? "project-first"
            : currentRoadmap.learningStyle.toLowerCase().includes("theory")
            ? "deep-theory"
            : "balanced"
        );
      }
      if (currentRoadmap.targetDuration) {
        setNewDuration(
          currentRoadmap.targetDuration.toLowerCase().includes("1")
            ? "1m"
            : currentRoadmap.targetDuration.toLowerCase().includes("6")
            ? "6m"
            : "3m"
        );
      }
    }

    // 3. For first-time users, load draft if present
    if (!hasExplicit) {
      const draft = roadmapService.loadDraft();
      if (
        draft &&
        (draft.goal || draft.experienceLevel || draft.knownSkills.length > 0)
      ) {
        // Reset step if it was somehow saved at 4/5
        setFormData({ ...draft, currentStep: Math.min(draft.currentStep || 1, 4) });
        setHasRestoredDraft(true);
        setTimeout(() => setHasRestoredDraft(false), 4000);
      }
    }

    setIsLoaded(true);
  }, []);

  // Sync draft for first-time wizard
  const updateFormData = (updates: Partial<PathBuilderState>) => {
    setFormData((prev) => {
      const next = { ...prev, ...updates };
      roadmapService.saveDraft(next);
      return next;
    });
    if (errorMessage) setErrorMessage("");
  };

  // Validation function for 4-step wizard
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
    if (!validateStep(formData.currentStep)) return;
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
    if (isReturningUser) {
      router.push("/dashboard");
      return;
    }

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

  // Generate for First-Time Users
  const handleGenerateFirstTimeRoadmap = async () => {
    if (!validateStep(4)) return;

    setIsGenerating(true);
    setGenerationPhase("Synthesizing your career targets & skill level...");

    setTimeout(() => {
      setGenerationPhase("Structuring customized milestone curriculum...");
    }, 450);

    setTimeout(() => {
      setGenerationPhase("Finalizing your interactive roadmap...");
    }, 850);

    try {
      const generated = await roadmapService.generateRoadmap(formData);
      router.push("/dashboard");
    } catch {
      setIsGenerating(false);
      setErrorMessage("Unable to generate roadmap. Please try again.");
    }
  };

  // Generate for Returning Users ("Build Another Path")
  const handleGenerateAnotherPath = async () => {
    if (!newGoal.trim()) {
      setErrorMessage("Please enter or select a new learning goal.");
      return;
    }

    setErrorMessage("");
    setIsGenerating(true);
    setGenerationPhase(`Synthesizing tailored curriculum for "${newGoal.trim()}"...`);

    const builderPayload: PathBuilderState = {
      goal: newGoal.trim(),
      targetRole: newGoal.trim(),
      experienceLevel: newExperience,
      background: "Returning Student",
      knownSkills: [],
      isCompleteBeginner: newExperience === "beginner",
      learningStyle: newStyle,
      weeklyPace: newPace,
      targetDuration: newDuration,
      preferredTime: "flexible",
      currentStep: 1,
    };

    try {
      const newRoadmap = await roadmapService.generateRoadmap(builderPayload, true);
      setJustCreatedRoadmap(newRoadmap);
      setActiveRoadmap(newRoadmap);
      setAllRoadmaps(roadmapService.getAllSavedRoadmaps());
      setIsGenerating(false);
    } catch {
      setIsGenerating(false);
      setErrorMessage("Unable to create additional roadmap. Please try again.");
    }
  };

  const handleSwitchRoadmap = (id: string) => {
    const switched = roadmapService.switchActiveRoadmap(id);
    if (switched) {
      setActiveRoadmap(switched);
    }
  };

  const stepsMeta = [
    { number: 1, label: "Goal" },
    { number: 2, label: "Experience" },
    { number: 3, label: "Skills" },
    { number: 4, label: "Preferences" },
  ];

  if (!isLoaded) {
    return (
      <AppLayout pageTitle="Build My Path">
        <div className="flex items-center justify-center min-h-[350px]">
          <div className="flex items-center gap-2 text-[#54252C] font-medium text-sm">
            <Loader2 className="animate-spin" size={20} />
            <span>Loading path builder...</span>
          </div>
        </div>
      </AppLayout>
    );
  }

  // SUCCESS SCREEN AFTER CREATING ANOTHER ROADMAP
  if (justCreatedRoadmap) {
    return (
      <AppLayout
        pageTitle="New Roadmap Created!"
        pageSubtitle="Your additional learning path is ready and set as your active track."
      >
        <div className="max-w-2xl mx-auto bg-white border border-[#D8C8BA] rounded-2xl p-6 sm:p-8 text-center shadow-md animate-scale-in">
          <div className="w-16 h-16 rounded-full bg-[#54252C] text-[#F6F1E9] flex items-center justify-center mx-auto mb-4 shadow-sm">
            <Sparkles size={28} />
          </div>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#54252C]/10 text-[#54252C] text-xs font-semibold uppercase tracking-wider mb-2">
            <CheckCircle2 size={13} /> Successfully Generated
          </span>

          <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-[#292827] mb-2">
            {justCreatedRoadmap.title}
          </h2>

          <p className="text-sm text-[#292827]/75 max-w-md mx-auto mb-6 leading-relaxed">
            We synthesized <strong>{justCreatedRoadmap.phases.length} structured phases</strong> and{" "}
            <strong>{justCreatedRoadmap.totalLessons} milestones</strong> calibrated for your{" "}
            <span className="capitalize">{justCreatedRoadmap.experienceLevel}</span> level.
          </p>

          <div className="p-4 rounded-xl bg-[#F6F1E9] border border-[#D8C8BA] max-w-md mx-auto text-left mb-8 space-y-2 text-xs text-[#292827]/80">
            <div className="flex justify-between">
              <span className="text-[#292827]/60">Target Role:</span>
              <span className="font-semibold text-[#54252C]">{justCreatedRoadmap.targetRole}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#292827]/60">Target Timeline:</span>
              <span className="font-semibold text-[#292827]">{justCreatedRoadmap.targetDuration}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#292827]/60">Total Saved Roadmaps:</span>
              <span className="font-semibold text-[#54252C]">{allRoadmaps.length} Saved Paths</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 max-w-md mx-auto">
            <Link
              href="/learning-path"
              className="w-full sm:w-1/2 py-3 px-4 rounded-xl bg-[#54252C] hover:bg-[#803F47] text-[#F6F1E9] text-sm font-semibold transition-all shadow-xs flex items-center justify-center gap-2"
            >
              <span>View New Path</span>
              <ArrowRight size={16} />
            </Link>
            <Link
              href="/dashboard"
              className="w-full sm:w-1/2 py-3 px-4 rounded-xl border border-[#D8C8BA] hover:border-[#54252C] bg-white text-[#292827] text-sm font-medium transition-all flex items-center justify-center gap-2"
            >
              <span>Go to Dashboard</span>
            </Link>
          </div>
        </div>
      </AppLayout>
    );
  }

  // ==========================================
  // RETURNING USER: STREAMLINED "BUILD ANOTHER PATH"
  // ==========================================
  if (isReturningUser && activeRoadmap) {
    return (
      <AppLayout
        pageTitle="Build Another Learning Path"
        pageSubtitle="Add a new career goal or specialized skill track to your personalized portfolio."
        actionElement={
          <div className="flex items-center gap-2.5">
            <Link
              href="/learning-path"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-[#D8C8BA] bg-white text-xs font-medium text-[#292827]/80 hover:text-[#54252C] hover:bg-[#D8C8BA]/20 transition-all shadow-2xs"
            >
              <Route size={14} className="text-[#54252C]" />
              <span>Active Path</span>
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#54252C] text-[#F6F1E9] text-xs font-medium hover:bg-[#803F47] transition-all shadow-2xs"
            >
              <span>Dashboard</span>
            </Link>
          </div>
        }
      >
        <div className="max-w-4xl mx-auto space-y-8">
          {/* 1. Compact Current Learning Path Summary Card */}
          <div className="p-5 sm:p-6 rounded-2xl border border-[#D8C8BA] bg-white shadow-2xs">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#D8C8BA]/60">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                  <span className="text-[11px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-[#54252C]/10 text-[#54252C]">
                    Your Current Learning Path
                  </span>
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${
                    activeRoadmap.progressPercent >= 100
                      ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                      : "bg-[#54252C]/10 text-[#54252C] border border-[#54252C]/20"
                  }`}>
                    {activeRoadmap.progressPercent >= 100 ? "Completed" : "In Progress"}
                  </span>
                  <span className="text-xs text-[#292827]/60 capitalize">
                    • {activeRoadmap.experienceLevel || "Intermediate"} Track
                  </span>
                </div>
                <h3 className="font-serif text-xl sm:text-2xl font-semibold text-[#292827]">
                  {activeRoadmap.title}
                </h3>
                <p className="text-xs text-[#292827]/70 mt-0.5 font-sans">
                  Goal / Target: <strong>{activeRoadmap.targetRole}</strong> • {activeRoadmap.totalLessons} Total Milestones
                </p>
              </div>

              {/* Progress and Actions */}
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <span className="text-xs text-[#292827]/60 block">Progress</span>
                  <span className="font-serif text-xl font-bold text-[#54252C]">
                    {activeRoadmap.progressPercent}%
                  </span>
                </div>
                <Link
                  href="/learning-path"
                  className="px-4 py-2 rounded-xl bg-[#F6F1E9] hover:bg-[#54252C] text-[#54252C] hover:text-[#F6F1E9] border border-[#D8C8BA] text-xs font-semibold transition-all shadow-2xs flex items-center gap-1.5 shrink-0"
                >
                  <span>Continue Path</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>

            {/* Multiple Saved Roadmaps Quick Switcher */}
            {allRoadmaps.length > 1 && (
              <div className="pt-3 flex items-center justify-between text-xs text-[#292827]/75">
                <span className="font-medium">You have {allRoadmaps.length} saved paths:</span>
                <select
                  value={activeRoadmap.id}
                  onChange={(e) => handleSwitchRoadmap(e.target.value)}
                  className="bg-[#F6F1E9] text-[#292827] text-xs rounded-lg border border-[#D8C8BA] px-2.5 py-1 focus:outline-none focus:border-[#54252C]"
                >
                  {allRoadmaps.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.title} ({r.progressPercent}%)
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* 2. Shorter "Build Another Path" Form */}
          <div className="bg-white border border-[#D8C8BA] rounded-2xl p-6 sm:p-8 shadow-xs">
            <div className="mb-6 pb-4 border-b border-[#D8C8BA]/60">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#54252C] flex items-center gap-1.5 mb-1">
                <Sparkles size={14} /> Create Additional Roadmap
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-[#292827]">
                What would you like to master next?
              </h2>
              <p className="text-xs sm:text-sm text-[#292827]/75 mt-1 font-sans">
                Enter your new goal below. This creates a separate roadmap and preserves your existing learning progress.
              </p>
            </div>

            {/* Inline Error Alert */}
            <AnimatePresence>
              {errorMessage && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="mb-6 p-3.5 rounded-xl bg-[#803F47]/10 border border-[#803F47]/30 text-xs sm:text-sm text-[#803F47] flex items-center gap-2"
                >
                  <AlertCircle size={16} className="shrink-0" />
                  <span>{errorMessage}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-6">
              {/* Question 1: New Learning Goal */}
              <div>
                <label className="block text-sm font-semibold text-[#292827] mb-2 font-sans">
                  1. New Learning Goal / Target Role
                </label>
                <input
                  type="text"
                  value={newGoal}
                  onChange={(e) => {
                    setNewGoal(e.target.value);
                    if (errorMessage) setErrorMessage("");
                  }}
                  placeholder="e.g. AI & LLM Systems Engineer, Distributed Backend Architect, Mobile App Dev..."
                  className="w-full bg-[#F6F1E9]/40 text-[#292827] placeholder:text-[#292827]/40 text-sm rounded-xl border border-[#D8C8BA] px-4 py-3 focus:outline-none focus:border-[#54252C] focus:bg-white focus:ring-1 focus:ring-[#54252C] transition-all shadow-2xs font-sans"
                />

                {/* Suggested Chips */}
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="text-[11px] font-semibold text-[#292827]/60 self-center">
                    Quick suggestions:
                  </span>
                  {suggestedGoals.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setNewGoal(item.title);
                        if (errorMessage) setErrorMessage("");
                      }}
                      className={`text-xs px-2.5 py-1 rounded-full border transition-all ${
                        newGoal === item.title
                          ? "bg-[#54252C] text-[#F6F1E9] border-[#54252C]"
                          : "bg-white border-[#D8C8BA] text-[#292827]/80 hover:border-[#54252C] hover:text-[#54252C]"
                      }`}
                    >
                      {item.title}
                    </button>
                  ))}
                </div>
              </div>

              {/* Question 2: Current Experience Level */}
              <div>
                <label className="block text-sm font-semibold text-[#292827] mb-2 font-sans">
                  2. Your Current Experience in this Domain
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {experienceLevels.map((lvl) => {
                    const isSelected = newExperience === lvl.id;
                    return (
                      <button
                        key={lvl.id}
                        type="button"
                        onClick={() => setNewExperience(lvl.id as any)}
                        className={`p-3.5 rounded-xl border text-left transition-all ${
                          isSelected
                            ? "border-[#54252C] bg-[#54252C]/5 ring-1 ring-[#54252C]"
                            : "border-[#D8C8BA] bg-white hover:border-[#54252C]/50"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold text-sm text-[#292827]">
                            {lvl.title}
                          </span>
                          {isSelected && <Check size={14} className="text-[#54252C]" />}
                        </div>
                        <p className="text-[11px] text-[#292827]/70 leading-relaxed font-sans">
                          {lvl.desc}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Question 3: Preferences (Style, Weekly Pace, Timeline) */}
              <div>
                <label className="block text-sm font-semibold text-[#292827] mb-2 font-sans">
                  3. Learning Preferences & Study Commitment
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-xl bg-[#F6F1E9]/40 border border-[#D8C8BA]">
                  {/* Learning Style */}
                  <div>
                    <span className="block text-xs font-semibold text-[#54252C] mb-1.5">
                      Learning Style
                    </span>
                    <select
                      value={newStyle}
                      onChange={(e) => setNewStyle(e.target.value as any)}
                      className="w-full bg-white text-xs text-[#292827] rounded-lg border border-[#D8C8BA] px-3 py-2 focus:outline-none focus:border-[#54252C]"
                    >
                      <option value="balanced">Balanced Theory & Practice</option>
                      <option value="project-first">Hands-on Project First</option>
                      <option value="deep-theory">Deep Conceptual Theory</option>
                    </select>
                  </div>

                  {/* Weekly Pace */}
                  <div>
                    <span className="block text-xs font-semibold text-[#54252C] mb-1.5">
                      Weekly Study Pace
                    </span>
                    <select
                      value={newPace}
                      onChange={(e) => setNewPace(e.target.value as any)}
                      className="w-full bg-white text-xs text-[#292827] rounded-lg border border-[#D8C8BA] px-3 py-2 focus:outline-none focus:border-[#54252C]"
                    >
                      <option value="casual">Casual (3 - 5 hrs/wk)</option>
                      <option value="recommended">Recommended (8 - 12 hrs/wk)</option>
                      <option value="intensive">Intensive (15 - 20 hrs/wk)</option>
                    </select>
                  </div>

                  {/* Target Timeline */}
                  <div>
                    <span className="block text-xs font-semibold text-[#54252C] mb-1.5">
                      Target Timeline
                    </span>
                    <select
                      value={newDuration}
                      onChange={(e) => setNewDuration(e.target.value as any)}
                      className="w-full bg-white text-xs text-[#292827] rounded-lg border border-[#D8C8BA] px-3 py-2 focus:outline-none focus:border-[#54252C]"
                    >
                      <option value="1m">1 Month (Sprint)</option>
                      <option value="3m">3 Months (Recommended)</option>
                      <option value="6m">6 Months (Comprehensive)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Submit CTA */}
              <div className="pt-4 border-t border-[#D8C8BA]/60 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setIsReturningUser(false)}
                  className="text-xs text-[#292827]/60 hover:text-[#54252C] hover:underline"
                >
                  Need the complete 4-step wizard instead?
                </button>

                <button
                  type="button"
                  disabled={isGenerating || !newGoal.trim()}
                  onClick={handleGenerateAnotherPath}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#54252C] hover:bg-[#803F47] text-[#F6F1E9] text-sm font-semibold transition-all shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 size={16} className="animate-spin text-[#F6F1E9]" />
                      <span>{generationPhase}</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={16} className="text-[#D8C8BA]" />
                      <span>Generate Additional Path</span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  // ==========================================
  // FIRST-TIME USERS: FULL 4-STEP WIZARD
  // ==========================================
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
        <div className="w-full bg-[#D8C8BA]/60 h-2 rounded-full mb-6 overflow-hidden">
          <div
            style={{ width: `${(formData.currentStep / 4) * 100}%` }}
            className="h-full bg-[#54252C] transition-all duration-300 rounded-full"
          />
        </div>

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
                onChange={(e) => updateFormData({ goal: e.target.value, targetRole: e.target.value })}
                className="w-full bg-[#F6F1E9] text-[#292827] placeholder:text-[#292827]/40 text-sm rounded-[8px] border border-[#D8C8BA] px-4 py-2.5 focus:outline-none focus:border-[#54252C] focus:ring-1 focus:ring-[#54252C] transition-colors"
              />
            </div>

            <div className="mb-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#292827]/70 mb-3">
                Or select a curated curriculum path:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {suggestedGoals.map((item) => {
                  const Icon = item.icon;
                  const isSelected = formData.targetRole === item.title;

                  return (
                    <div
                      key={item.id}
                      onClick={() =>
                        updateFormData({
                          goal: item.title,
                          targetRole: item.title,
                        })
                      }
                      className={`p-4 rounded-[8px] border text-left cursor-pointer transition-all ${
                        isSelected
                          ? "border-[#54252C] bg-[#54252C]/10 shadow-xs"
                          : "border-[#D8C8BA] hover:border-[#54252C]/50 hover:bg-[#D8C8BA]/20"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`p-2 rounded-[6px] ${
                            isSelected
                              ? "bg-[#54252C] text-[#F6F1E9]"
                              : "bg-[#54252C]/10 text-[#54252C]"
                          }`}
                        >
                          <Icon size={18} />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-[#292827] leading-snug">
                            {item.title}
                          </p>
                          <p className="text-xs text-[#292827]/70 mt-1 leading-relaxed">
                            {item.desc}
                          </p>
                        </div>
                      </div>
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
                What is your experience level and background?
              </h2>
              <p className="text-sm text-[#292827]/75 mt-1.5 font-sans">
                We calibrate introductory milestones according to your proficiency.
              </p>
            </div>

            <div className="space-y-3 mb-8">
              {experienceLevels.map((lvl) => {
                const isSelected = formData.experienceLevel === lvl.id;
                return (
                  <div
                    key={lvl.id}
                    onClick={() => updateFormData({ experienceLevel: lvl.id as any })}
                    className={`p-4 rounded-[8px] border text-left cursor-pointer transition-all ${
                      isSelected
                        ? "border-[#54252C] bg-[#54252C]/10 shadow-xs"
                        : "border-[#D8C8BA] hover:border-[#54252C]/50 hover:bg-[#D8C8BA]/20"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-[#292827]">
                          {lvl.title}
                        </p>
                        <p className="text-xs text-[#292827]/70 mt-1">
                          {lvl.desc}
                        </p>
                      </div>
                      <div
                        className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                          isSelected
                            ? "border-[#54252C] bg-[#54252C] text-[#F6F1E9]"
                            : "border-[#D8C8BA]"
                        }`}
                      >
                        {isSelected && <Check size={12} strokeWidth={3} />}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div>
              <label
                htmlFor="backgroundSelect"
                className="block text-sm font-medium text-[#292827] mb-2"
              >
                Relevant Educational / Professional Background
              </label>
              <select
                id="backgroundSelect"
                value={formData.background}
                onChange={(e) => updateFormData({ background: e.target.value })}
                className="w-full bg-[#F6F1E9] text-[#292827] text-sm rounded-[8px] border border-[#D8C8BA] px-4 py-2.5 focus:outline-none focus:border-[#54252C]"
              >
                <option value="">Select your background...</option>
                {backgrounds.map((b) => (
                  <option key={b} value={b}>
                    {b}
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
                We will automatically skip redundant introductory modules for skills you have already mastered.
              </p>
            </div>

            <div className="mb-6 p-4 rounded-[8px] bg-[#54252C]/5 border border-[#54252C]/20">
              <label className="flex items-center gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={formData.isCompleteBeginner}
                  onChange={(e) =>
                    updateFormData({
                      isCompleteBeginner: e.target.checked,
                      knownSkills: e.target.checked ? [] : formData.knownSkills,
                    })
                  }
                  className="w-4 h-4 rounded text-[#54252C] accent-[#54252C] focus:ring-[#54252C]"
                />
                <div>
                  <span className="text-sm font-semibold text-[#54252C]">
                    I am a complete beginner
                  </span>
                  <p className="text-xs text-[#292827]/70">
                    Include all foundational fundamentals and prerequisites from the start.
                  </p>
                </div>
              </label>
            </div>

            {!formData.isCompleteBeginner && (
              <>
                <div className="mb-6">
                  <span className="block text-xs font-semibold uppercase tracking-wider text-[#292827]/70 mb-3">
                    Select Your Known Skills:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {availableSkills.map((skill) => {
                      const isSelected = formData.knownSkills.includes(skill);
                      return (
                        <button
                          key={skill}
                          type="button"
                          onClick={() => handleToggleSkill(skill)}
                          className={`px-3 py-1.5 rounded-[6px] text-xs font-medium transition-all ${
                            isSelected
                              ? "bg-[#54252C] text-[#F6F1E9] shadow-xs"
                              : "bg-[#F6F1E9] border border-[#D8C8BA] text-[#292827]/80 hover:border-[#54252C]"
                          }`}
                        >
                          {isSelected ? `✓ ${skill}` : `+ ${skill}`}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <form onSubmit={handleAddCustomSkill} className="mb-4">
                  <label
                    htmlFor="customSkillInput"
                    className="block text-xs font-semibold uppercase tracking-wider text-[#292827]/70 mb-1.5"
                  >
                    Add Other Tools or Technologies
                  </label>
                  <div className="flex gap-2">
                    <input
                      id="customSkillInput"
                      type="text"
                      placeholder="e.g. NextAuth, Prisma, Zustand, Rust..."
                      value={customSkillInput}
                      onChange={(e) => setCustomSkillInput(e.target.value)}
                      className="flex-1 bg-[#F6F1E9] text-[#292827] placeholder:text-[#292827]/40 text-sm rounded-[8px] border border-[#D8C8BA] px-4 py-2 focus:outline-none focus:border-[#54252C]"
                    />
                    <button
                      type="submit"
                      disabled={!customSkillInput.trim()}
                      className="px-4 py-2 rounded-[8px] bg-[#54252C] hover:bg-[#803F47] text-[#F6F1E9] text-xs font-semibold transition-colors disabled:opacity-50"
                    >
                      Add
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        )}

        {/* STEP 4: PREFERENCES */}
        {formData.currentStep === 4 && (
          <div>
            <div className="mb-6">
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#54252C]">
                Step 4 of 4
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-[#292827] mt-1">
                How do you prefer to learn?
              </h2>
              <p className="text-sm text-[#292827]/75 mt-1.5 font-sans">
                Set your study pace, timeline, and preferred pedagogy style.
              </p>
            </div>

            <div className="space-y-3 mb-8">
              <span className="block text-xs font-semibold uppercase tracking-wider text-[#292827]/70">
                Preferred Learning Style:
              </span>
              {learningStyles.map((style) => {
                const isSelected = formData.learningStyle === style.id;
                return (
                  <div
                    key={style.id}
                    onClick={() => updateFormData({ learningStyle: style.id as any })}
                    className={`p-4 rounded-[8px] border text-left cursor-pointer transition-all ${
                      isSelected
                        ? "border-[#54252C] bg-[#54252C]/10 shadow-xs"
                        : "border-[#D8C8BA] hover:border-[#54252C]/50 hover:bg-[#D8C8BA]/20"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-[#292827]">
                          {style.title}
                        </p>
                        <p className="text-xs text-[#292827]/70 mt-1">
                          {style.desc}
                        </p>
                      </div>
                      <div
                        className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                          isSelected
                            ? "border-[#54252C] bg-[#54252C] text-[#F6F1E9]"
                            : "border-[#D8C8BA]"
                        }`}
                      >
                        {isSelected && <Check size={12} strokeWidth={3} />}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="weeklyPaceSelect"
                  className="block text-sm font-medium text-[#292827] mb-1.5"
                >
                  Weekly Study Commitment
                </label>
                <select
                  id="weeklyPaceSelect"
                  value={formData.weeklyPace}
                  onChange={(e) => updateFormData({ weeklyPace: e.target.value as any })}
                  className="w-full bg-[#F6F1E9] text-[#292827] text-sm rounded-[8px] border border-[#D8C8BA] px-4 py-2.5 focus:outline-none focus:border-[#54252C]"
                >
                  <option value="casual">Casual (3 - 5 hrs/week)</option>
                  <option value="recommended">Recommended (8 - 12 hrs/week)</option>
                  <option value="intensive">Intensive (15 - 20 hrs/week)</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="targetDurationSelect"
                  className="block text-sm font-medium text-[#292827] mb-1.5"
                >
                  Target Completion Timeline
                </label>
                <select
                  id="targetDurationSelect"
                  value={formData.targetDuration}
                  onChange={(e) => updateFormData({ targetDuration: e.target.value as any })}
                  className="w-full bg-[#F6F1E9] text-[#292827] text-sm rounded-[8px] border border-[#D8C8BA] px-4 py-2.5 focus:outline-none focus:border-[#54252C]"
                >
                  <option value="1m">1 Month (Sprint)</option>
                  <option value="3m">3 Months (Standard)</option>
                  <option value="6m">6 Months (Deep Mastery)</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons for 4-step wizard */}
        <div className="pt-8 mt-8 border-t border-[#D8C8BA] flex items-center justify-between">
          {formData.currentStep > 1 ? (
            <button
              type="button"
              onClick={handleBack}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-[8px] border border-[#D8C8BA] text-xs sm:text-sm font-medium text-[#292827] hover:bg-[#D8C8BA]/30 transition-colors"
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
              onClick={handleGenerateFirstTimeRoadmap}
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
