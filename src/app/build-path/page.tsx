"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AppLayout } from "@/components/layout/AppLayout";
import { authService } from "@/services/authService";
import { roadmapService, initialPathBuilderState } from "@/services/roadmapService";
import { PathBuilderState, SkillCategoriesResponse, SkillCategoryItem } from "@/types/roadmap";
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
  Terminal,
  Shield,
  Activity,
  Zap,
  Search,
  Layout,
  Server,
  Filter,
  RefreshCw,
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

  // Dynamic skill taxonomy state updated automatically based on user preferences
  const [skillTaxonomy, setSkillTaxonomy] = useState<SkillCategoriesResponse | null>(null);
  const [isLoadingSkills, setIsLoadingSkills] = useState(false);
  const [selectedCategoryTab, setSelectedCategoryTab] = useState<string>("all");
  const [skillSearchQuery, setSkillSearchQuery] = useState("");

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

  // Fallback initial categories for Step 3
  const defaultCategories: SkillCategoryItem[] = [
    {
      id: "frontend_ui",
      name: "Frontend & UI Frameworks",
      icon: "layout",
      description: "Modern component libraries, reactive state, and client rendering.",
      skills: ["React", "Next.js", "TypeScript", "JavaScript", "HTML5 & CSS3", "Tailwind CSS", "Vue.js"],
      recommended: ["React", "Next.js", "TypeScript", "Tailwind CSS"],
    },
    {
      id: "backend_apis",
      name: "Backend & API Architecture",
      icon: "server",
      description: "Server-side logic, routing, REST/GraphQL standards, and microservices.",
      skills: ["Node.js", "Express", "REST APIs", "GraphQL", "FastAPI", "NestJS"],
      recommended: ["Node.js", "REST APIs"],
    },
    {
      id: "databases_storage",
      name: "Databases & Caching",
      icon: "database",
      description: "Relational and document storage, in-memory caches, and query tuning.",
      skills: ["PostgreSQL", "MongoDB", "Redis", "Prisma ORM", "MySQL", "SQLite"],
      recommended: ["PostgreSQL", "MongoDB", "Redis"],
    },
    {
      id: "devops_tooling",
      name: "DevOps & Tooling",
      icon: "terminal",
      description: "Version control, container virtualization, and cloud delivery pipelines.",
      skills: ["Git & GitHub", "Docker", "AWS", "Vercel", "CI/CD Pipelines", "Linux / Bash"],
      recommended: ["Git & GitHub", "Docker"],
    },
  ];

  // Active categories derived from backend/edge taxonomy based on user preferences
  const currentCategories: SkillCategoryItem[] = useMemo(() => {
    return skillTaxonomy?.categories && skillTaxonomy.categories.length > 0
      ? skillTaxonomy.categories
      : defaultCategories;
  }, [skillTaxonomy]);

  const allTaxonomySkills = useMemo(() => {
    return Array.from(new Set(currentCategories.flatMap((c) => c.skills)));
  }, [currentCategories]);

  // Track any custom user-added skills that are not part of the active taxonomy categories
  const customSkills = useMemo(() => {
    return formData.knownSkills.filter((s) => !allTaxonomySkills.includes(s));
  }, [formData.knownSkills, allTaxonomySkills]);

  // Compute filtered categories based on active tab and search query
  const displayedCategories = useMemo(() => {
    let cats = currentCategories;
    if (selectedCategoryTab !== "all") {
      cats = cats.filter((c) => c.id === selectedCategoryTab);
    }
    if (skillSearchQuery.trim()) {
      const q = skillSearchQuery.toLowerCase();
      cats = cats
        .map((c) => ({
          ...c,
          skills: c.skills.filter((s) => s.toLowerCase().includes(q)),
        }))
        .filter((c) => c.skills.length > 0);
    }
    return cats;
  }, [currentCategories, selectedCategoryTab, skillSearchQuery]);


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

  // Dynamically update skill categories whenever learner enters or modifies preferences, goal, or role
  useEffect(() => {
    let isCancelled = false;
    const updateCategories = async () => {
      setIsLoadingSkills(true);
      try {
        const response = await roadmapService.fetchSkillCategories({
          goal: formData.goal,
          targetRole: formData.targetRole,
          experienceLevel: formData.experienceLevel,
          background: formData.background,
        });
        if (!isCancelled && response) {
          setSkillTaxonomy(response);
        }
      } catch (err) {
        console.warn("Failed to update skill categories:", err);
      } finally {
        if (!isCancelled) setIsLoadingSkills(false);
      }
    };

    updateCategories();

    return () => {
      isCancelled = true;
    };
  }, [formData.goal, formData.targetRole, formData.experienceLevel, formData.background]);

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

  const handleSelectAllInCategory = (categorySkills: string[]) => {
    if (formData.isCompleteBeginner) {
      updateFormData({ isCompleteBeginner: false });
    }
    const current = new Set(formData.knownSkills);
    const allSelected = categorySkills.length > 0 && categorySkills.every((s) => current.has(s));
    if (allSelected) {
      const remaining = formData.knownSkills.filter((s) => !categorySkills.includes(s));
      updateFormData({ knownSkills: remaining });
    } else {
      categorySkills.forEach((s) => current.add(s));
      updateFormData({ knownSkills: Array.from(current) });
    }
  };

  const handleClearAllSkills = () => {
    updateFormData({ knownSkills: [] });
  };

  const handleRemoveSingleSkill = (skill: string) => {
    updateFormData({
      knownSkills: formData.knownSkills.filter((s) => s !== skill),
    });
  };

  const renderCategoryIcon = (iconName: string, className = "w-4 h-4") => {
    switch (iconName) {
      case "layout":
        return <Layout className={className} />;
      case "server":
        return <Server className={className} />;
      case "database":
        return <Database className={className} />;
      case "terminal":
        return <Terminal className={className} />;
      case "cpu":
        return <Cpu className={className} />;
      case "brain":
        return <BrainCircuit className={className} />;
      case "sparkles":
        return <Sparkles className={className} />;
      case "cloud":
        return <Cloud className={className} />;
      case "layers":
        return <Layers className={className} />;
      case "smartphone":
        return <Smartphone className={className} />;
      case "shield":
        return <Shield className={className} />;
      case "activity":
        return <Activity className={className} />;
      case "zap":
        return <Zap className={className} />;
      default:
        return <Code2 className={className} />;
    }
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
      // Synchronously record user preferences and skills in authService (persisting to localStorage & MongoDB Atlas)
      const mappedLearningStyle =
        formData.learningStyle === "project-first"
          ? "hands-on"
          : formData.learningStyle === "deep-theory"
          ? "reading"
          : "balanced";

      const mappedStudyPace =
        formData.weeklyPace === "casual"
          ? "relaxed"
          : formData.weeklyPace === "intensive"
          ? "intensive"
          : "recommended";

      const mappedTargetHours =
        formData.weeklyPace === "casual"
          ? 5
          : formData.weeklyPace === "intensive"
          ? 20
          : 10;

      authService.updateLearningPreferences({
        targetGoal: formData.goal.trim() || formData.targetRole || "Custom Engineering Track",
        experienceLevel: (formData.experienceLevel as any) || "intermediate",
        knownSkills: formData.isCompleteBeginner ? [] : formData.knownSkills,
        learningStyle: mappedLearningStyle,
        studyPace: mappedStudyPace,
        weeklyTargetHours: mappedTargetHours,
      });

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

        {/* STEP 3: SKILLS (DYNAMIC CATEGORIES ADAPTED TO PREFERENCES) */}
        {formData.currentStep === 3 && (
          <div>
            <div className="mb-4">
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#54252C]">
                Step 3 of 4
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-[#292827] mt-1">
                Which technologies or skills do you already know?
              </h2>
              <p className="text-sm text-[#292827]/75 mt-1 font-sans">
                Categories and suggestions are automatically personalized based on your learning goals.
              </p>
            </div>

            {/* Dynamic Domain Context Badge */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-5 p-3 rounded-[8px] bg-[#D8C8BA]/25 border border-[#D8C8BA]">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-[6px] bg-[#54252C] text-[#F6F1E9]">
                  <Sparkles size={14} />
                </div>
                <div className="text-xs text-[#292827]">
                  <span>Tailored categories for: </span>
                  <strong className="text-[#54252C] font-semibold">
                    {skillTaxonomy?.domain_title || "Full-Stack Web Development"}
                  </strong>
                  <span className="opacity-75">
                    {" "}• {formData.experienceLevel ? `${formData.experienceLevel.toUpperCase()} level` : "Calibrated"}
                  </span>
                </div>
              </div>

              {isLoadingSkills && (
                <div className="flex items-center gap-1.5 text-xs text-[#54252C]">
                  <RefreshCw size={12} className="animate-spin" />
                  <span>Updating categories...</span>
                </div>
              )}
            </div>

            {/* Complete Beginner Option */}
            <div className="mb-5">
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
                <div>
                  <span className="text-sm font-medium text-[#292827]">
                    I am a complete beginner (skip known skills & start from scratch)
                  </span>
                  <p className="text-xs text-[#292827]/65 mt-0.5">
                    We will include foundational syntax, environment setup, and fundamental concepts.
                  </p>
                </div>
              </label>
            </div>

            {/* Categorized Skills Section */}
            <div
              className={`transition-opacity duration-200 ${
                formData.isCompleteBeginner ? "opacity-40 pointer-events-none" : ""
              }`}
            >
              {/* Category Search & Filter Bar */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 mb-4">
                <div className="relative flex-1">
                  <Search
                    size={15}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#292827]/50"
                  />
                  <input
                    type="text"
                    placeholder="Search skills in this domain (e.g. React, Docker, Python, SQL)..."
                    value={skillSearchQuery}
                    onChange={(e) => setSkillSearchQuery(e.target.value)}
                    className="w-full bg-[#F6F1E9] text-[#292827] placeholder:text-[#292827]/45 text-xs sm:text-sm rounded-[8px] border border-[#D8C8BA] pl-9 pr-8 py-2.5 focus:outline-none focus:border-[#54252C]"
                  />
                  {skillSearchQuery && (
                    <button
                      type="button"
                      onClick={() => setSkillSearchQuery("")}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#292827]/50 hover:text-[#292827]"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>

                {formData.knownSkills.length > 0 && (
                  <button
                    type="button"
                    onClick={handleClearAllSkills}
                    className="text-xs text-[#54252C] hover:underline px-2 py-1 font-medium whitespace-nowrap self-end sm:self-center"
                  >
                    Clear all ({formData.knownSkills.length})
                  </button>
                )}
              </div>

              {/* Category Filter Tabs */}
              <div className="flex flex-wrap items-center gap-1.5 mb-5 pb-1 border-b border-[#D8C8BA]/60">
                <button
                  type="button"
                  onClick={() => setSelectedCategoryTab("all")}
                  className={`px-3 py-1.5 rounded-[6px] text-xs font-medium transition-all ${
                    selectedCategoryTab === "all"
                      ? "bg-[#54252C] text-[#F6F1E9] shadow-2xs"
                      : "bg-[#F6F1E9] border border-[#D8C8BA] text-[#292827] hover:border-[#54252C]"
                  }`}
                >
                  All Categories ({allTaxonomySkills.length})
                </button>

                {currentCategories.map((cat) => {
                  const selectedInCat = cat.skills.filter((s) =>
                    formData.knownSkills.includes(s)
                  ).length;
                  const isActive = selectedCategoryTab === cat.id;

                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setSelectedCategoryTab(cat.id)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] text-xs font-medium transition-all ${
                        isActive
                          ? "bg-[#54252C] text-[#F6F1E9] shadow-2xs"
                          : "bg-[#F6F1E9] border border-[#D8C8BA] text-[#292827] hover:border-[#54252C]"
                      }`}
                    >
                      <span>{cat.name}</span>
                      {selectedInCat > 0 && (
                        <span
                          className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                            isActive
                              ? "bg-[#F6F1E9] text-[#54252C]"
                              : "bg-[#54252C] text-[#F6F1E9]"
                          }`}
                        >
                          {selectedInCat}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Grouped Category Cards */}
              <div className="space-y-4 mb-6">
                {displayedCategories.map((cat) => {
                  const catSkills = cat.skills;
                  const selectedInCat = catSkills.filter((s) =>
                    formData.knownSkills.includes(s)
                  ).length;
                  const isAllSelected =
                    catSkills.length > 0 &&
                    catSkills.every((s) => formData.knownSkills.includes(s));

                  return (
                    <div
                      key={cat.id}
                      className="p-4 rounded-[10px] border border-[#D8C8BA] bg-[#F6F1E9]/40 hover:bg-[#F6F1E9] transition-colors"
                    >
                      {/* Category Header */}
                      <div className="flex flex-wrap items-start sm:items-center justify-between gap-2 mb-3 pb-2.5 border-b border-[#D8C8BA]/40">
                        <div className="flex items-center gap-2.5">
                          <div className="p-1.5 rounded-[6px] bg-[#54252C]/10 text-[#54252C]">
                            {renderCategoryIcon(cat.icon, "w-4 h-4")}
                          </div>
                          <div>
                            <h3 className="font-sans font-semibold text-sm text-[#292827]">
                              {cat.name}
                            </h3>
                            <p className="text-xs text-[#292827]/65">
                              {cat.description}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-end sm:self-center">
                          <span className="text-[11px] font-medium text-[#292827]/70">
                            {selectedInCat} of {catSkills.length} selected
                          </span>
                          <button
                            type="button"
                            onClick={() => handleSelectAllInCategory(catSkills)}
                            className="text-xs text-[#54252C] hover:underline font-medium px-1.5 py-0.5 rounded"
                          >
                            {isAllSelected ? "Deselect category" : "Select category"}
                          </button>
                        </div>
                      </div>

                      {/* Skill Chips in this category */}
                      <div className="flex flex-wrap gap-2">
                        {catSkills.map((skill) => {
                          const isSelected = formData.knownSkills.includes(skill);
                          const isRecommended = cat.recommended?.includes(skill);

                          return (
                            <button
                              key={skill}
                              type="button"
                              onClick={() => handleToggleSkill(skill)}
                              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] text-xs font-medium transition-all duration-150 select-none ${
                                isSelected
                                  ? "bg-[#54252C] text-[#F6F1E9] border border-[#54252C] shadow-2xs scale-[1.02]"
                                  : "bg-[#F6F1E9] border border-[#D8C8BA] text-[#292827] hover:border-[#54252C] hover:bg-[#D8C8BA]/30"
                              }`}
                            >
                              {isSelected ? (
                                <Check size={13} strokeWidth={2.5} />
                              ) : (
                                isRecommended && (
                                  <span
                                    className="w-1.5 h-1.5 rounded-full bg-[#54252C]/60"
                                    title="Recommended for your level"
                                  />
                                )
                              )}
                              <span>{skill}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}

                {/* If searching and no skills matched */}
                {displayedCategories.length === 0 && (
                  <div className="text-center py-8 px-4 rounded-[8px] border border-dashed border-[#D8C8BA]">
                    <p className="text-sm text-[#292827]/70">
                      No skills match &quot;{skillSearchQuery}&quot; in this domain.
                    </p>
                    <button
                      type="button"
                      onClick={() => setSkillSearchQuery("")}
                      className="mt-2 text-xs text-[#54252C] underline font-medium"
                    >
                      Reset search filter
                    </button>
                  </div>
                )}

                {/* Custom User-Added Skills Card (if any exist) */}
                {customSkills.length > 0 && (
                  <div className="p-4 rounded-[10px] border border-[#D8C8BA] bg-[#F6F1E9]/40">
                    <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#D8C8BA]/40">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-[6px] bg-[#54252C]/10 text-[#54252C]">
                          <Plus size={14} />
                        </div>
                        <div>
                          <h3 className="font-sans font-semibold text-sm text-[#292827]">
                            Custom & Added Skills
                          </h3>
                          <p className="text-xs text-[#292827]/65">
                            Additional technologies you entered manually.
                          </p>
                        </div>
                      </div>
                      <span className="text-[11px] font-medium text-[#292827]/70">
                        {customSkills.length} added
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {customSkills.map((cSkill) => (
                        <span
                          key={cSkill}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] text-xs font-medium bg-[#54252C] text-[#F6F1E9] border border-[#54252C]"
                        >
                          <Check size={13} strokeWidth={2.5} />
                          <span>{cSkill}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveSingleSkill(cSkill)}
                            className="ml-0.5 hover:opacity-75"
                            title="Remove custom skill"
                          >
                            <X size={12} />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Add Custom Skill Form */}
              <form onSubmit={handleAddCustomSkill} className="flex gap-2 mb-6">
                <input
                  type="text"
                  placeholder="Add any additional skill (e.g. NextAuth, WebGL, Rust, Polars)..."
                  value={customSkillInput}
                  onChange={(e) => setCustomSkillInput(e.target.value)}
                  className="flex-1 bg-[#F6F1E9] text-[#292827] placeholder:text-[#292827]/40 text-xs sm:text-sm rounded-[8px] border border-[#D8C8BA] px-3.5 py-2.5 focus:outline-none focus:border-[#54252C]"
                />
                <button
                  type="submit"
                  className="inline-flex items-center gap-1 px-4 py-2.5 rounded-[8px] border border-[#54252C] text-[#54252C] text-xs sm:text-sm font-medium hover:bg-[#54252C]/5 transition-colors whitespace-nowrap"
                >
                  <Plus size={15} />
                  <span>Add Skill</span>
                </button>
              </form>

              {/* Selected Skills Summary Drawer */}
              <div className="p-4 rounded-[8px] border border-[#D8C8BA] bg-[#F6F1E9]/70">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-[#292827] uppercase tracking-wider">
                    Selected Knowledge ({formData.knownSkills.length}):
                  </span>
                  {formData.knownSkills.length > 0 && (
                    <button
                      type="button"
                      onClick={handleClearAllSkills}
                      className="text-xs text-[#54252C] hover:underline font-medium"
                    >
                      Deselect all
                    </button>
                  )}
                </div>

                {formData.knownSkills.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {formData.knownSkills.map((skill) => (
                      <span
                        key={skill}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-[4px] text-xs bg-[#54252C]/10 text-[#54252C] border border-[#54252C]/20"
                      >
                        <span>{skill}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveSingleSkill(skill)}
                          className="hover:text-[#292827]"
                          title="Remove"
                        >
                          <X size={11} />
                        </button>
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-[#292827]/60 italic">
                    No skills selected yet. Click skills in the categories above or select &quot;Complete Beginner&quot;.
                  </p>
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
