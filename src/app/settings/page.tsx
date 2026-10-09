"use client";
import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AppLayout } from "@/components/layout/AppLayout";
import { authService, UserProfile, UserLearningPreferences, UserNotificationPreferences } from "@/services/authService";
import { themeService, ThemeMode } from "@/services/themeService";
import { FormInput } from "@/components/FormInput";
import { PasswordInput } from "@/components/PasswordInput";
import { StatusAlert } from "@/components/StatusAlert";
import {
  User,
  Mail,
  Bell,
  Shield,
  BookOpen,
  Check,
  Sun,
  Moon,
  Laptop,
  LogOut,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Layers,
  Palette,
  Clock,
  Compass,
  CheckCircle2,
  Trash2,
} from "lucide-react";

type SettingsTab = "profile" | "learning" | "appearance" | "notifications" | "security" | "danger";

function SettingsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab") as SettingsTab | null;

  const [activeTab, setActiveTab] = useState<SettingsTab>(tabParam || "profile");
  const [user, setUser] = useState<UserProfile>(() => authService.getDefaultProfile());
  const [currentTheme, setCurrentTheme] = useState<ThemeMode>(() => themeService.getThemePreference());

  // Form State: Profile
  const [fullName, setFullName] = useState(user.fullName);
  const [email, setEmail] = useState(user.email);
  const [bio, setBio] = useState(user.bio);
  const [avatarBgColor, setAvatarBgColor] = useState(user.avatarBgColor || "#54252C");

  // Form State: Learning Preferences
  const [targetGoal, setTargetGoal] = useState(user.learningPreferences.targetGoal);
  const [experienceLevel, setExperienceLevel] = useState(user.learningPreferences.experienceLevel);
  const [learningStyle, setLearningStyle] = useState(user.learningPreferences.learningStyle);
  const [studyPace, setStudyPace] = useState(user.learningPreferences.studyPace);
  const [weeklyHours, setWeeklyHours] = useState(String(user.learningPreferences.weeklyTargetHours || 10));
  const [roadmapMode, setRoadmapMode] = useState(user.learningPreferences.roadmapMode || "sequential");
  const [knownSkillsInput, setKnownSkillsInput] = useState(user.learningPreferences.knownSkills.join(", "));

  // Form State: Notifications
  const [notifications, setNotifications] = useState<UserNotificationPreferences>(user.notifications);

  // Form State: Security
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // UI state
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: "idle" | "success" | "error";
    text: string;
  }>({ type: "idle", text: "" });

  // Confirmation Modals State
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    actionType: "reset_roadmap" | "reset_account" | "sign_out";
    confirmText: string;
  }>({
    isOpen: false,
    title: "",
    description: "",
    actionType: "reset_roadmap",
    confirmText: "Confirm",
  });

  // Sync state on load
  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
    setFullName(currentUser.fullName);
    setEmail(currentUser.email);
    setBio(currentUser.bio);
    setAvatarBgColor(currentUser.avatarBgColor || "#54252C");

    setTargetGoal(currentUser.learningPreferences.targetGoal);
    setExperienceLevel(currentUser.learningPreferences.experienceLevel);
    setLearningStyle(currentUser.learningPreferences.learningStyle);
    setStudyPace(currentUser.learningPreferences.studyPace);
    setWeeklyHours(String(currentUser.learningPreferences.weeklyTargetHours || 10));
    setRoadmapMode(currentUser.learningPreferences.roadmapMode || "sequential");
    setKnownSkillsInput(currentUser.learningPreferences.knownSkills.join(", "));

    setNotifications(currentUser.notifications);
    setCurrentTheme(themeService.getThemePreference());

    if (tabParam && ["profile", "learning", "appearance", "notifications", "security", "danger"].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  // Handle Theme Switching
  const handleThemeSelect = (theme: ThemeMode) => {
    setCurrentTheme(theme);
    themeService.applyTheme(theme);
    authService.updateUserProfile({ themePreference: theme });
    setStatusMessage({
      type: "success",
      text: `Theme preference switched to ${theme.toUpperCase()} and saved.`,
    });
  };

  // Handle Save All Changes
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName.trim() || fullName.trim().length < 2) {
      setStatusMessage({
        type: "error",
        text: "Please provide a valid full name (at least 2 characters).",
      });
      return;
    }

    if (!email.trim() || !email.includes("@")) {
      setStatusMessage({
        type: "error",
        text: "Please provide a valid email address.",
      });
      return;
    }

    if (activeTab === "security" && newPassword) {
      if (newPassword.length < 8) {
        setStatusMessage({
          type: "error",
          text: "New password must be at least 8 characters long.",
        });
        return;
      }
      if (newPassword !== confirmPassword) {
        setStatusMessage({
          type: "error",
          text: "New passwords do not match. Please verify and try again.",
        });
        return;
      }
    }

    setIsSaving(true);
    setStatusMessage({ type: "idle", text: "" });

    try {
      await new Promise((resolve) => setTimeout(resolve, 450));

      const parsedSkills = knownSkillsInput
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      const updated = authService.updateUserProfile({
        fullName: fullName.trim(),
        email: email.trim(),
        bio: bio.trim(),
        avatarBgColor,
        learningPreferences: {
          targetGoal: targetGoal.trim(),
          experienceLevel,
          knownSkills: parsedSkills,
          learningStyle,
          studyPace,
          weeklyTargetHours: parseInt(weeklyHours, 10) || 10,
          roadmapMode,
        },
        notifications,
        themePreference: currentTheme,
      });

      setUser(updated);
      if (activeTab === "security") {
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }

      setStatusMessage({
        type: "success",
        text: "Preferences saved successfully and synchronized across your ShikshaAI account!",
      });
    } catch {
      setStatusMessage({
        type: "error",
        text: "An error occurred while saving preferences. Please try again.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Execute Destructive Action after modal confirmation
  const handleExecuteDestructiveAction = () => {
    if (confirmModal.actionType === "reset_roadmap") {
      authService.resetLearningRoadmap();
      setConfirmModal((prev) => ({ ...prev, isOpen: false }));
      setStatusMessage({
        type: "success",
        text: "Learning roadmap progress has been reset.",
      });
      router.push("/build-path");
    } else if (confirmModal.actionType === "reset_account") {
      authService.resetAccountData();
      setConfirmModal((prev) => ({ ...prev, isOpen: false }));
      router.push("/signin");
    } else if (confirmModal.actionType === "sign_out") {
      authService.signOut();
      setConfirmModal((prev) => ({ ...prev, isOpen: false }));
      router.push("/signin");
    }
  };

  const navTabs: Array<{ id: SettingsTab; label: string; icon: any }> = [
    { id: "profile", label: "Profile Identity", icon: User },
    { id: "learning", label: "Learning & Onboarding", icon: BookOpen },
    { id: "appearance", label: "Appearance & Theme", icon: Palette },
    { id: "notifications", label: "Notification Alert", icon: Bell },
    { id: "security", label: "Password & Security", icon: Shield },
    { id: "danger", label: "Account & Reset", icon: AlertTriangle },
  ];

  return (
    <AppLayout
      pageTitle="Account Settings"
      pageSubtitle="Configure your learning preferences, appearance theme, notification frequencies, and account security."
    >
      <StatusAlert
        status={statusMessage.type}
        message={statusMessage.text}
        onDismiss={() => setStatusMessage({ type: "idle", text: "" })}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Navigation Sidebar Tabs (3 cols) */}
        <div className="lg:col-span-3 flex flex-row lg:flex-col gap-1.5 overflow-x-auto pb-2 lg:pb-0 select-none no-scrollbar">
          {navTabs.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            const isDanger = tab.id === "danger";

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setActiveTab(tab.id);
                  setStatusMessage({ type: "idle", text: "" });
                }}
                className={`flex items-center gap-2.5 sm:gap-3 px-3 sm:px-3.5 py-2 sm:py-2.5 rounded-[8px] text-xs sm:text-sm font-medium whitespace-nowrap transition-colors text-left cursor-pointer flex-shrink-0 ${
                  active
                    ? isDanger
                      ? "bg-[#803F47] text-[#F6F1E9] shadow-2xs"
                      : "bg-[#54252C] text-[#F6F1E9] shadow-2xs"
                    : isDanger
                    ? "text-[#803F47] hover:bg-[#803F47]/10"
                    : "text-[#292827]/80 hover:bg-[#D8C8BA]/40"
                }`}
              >
                <Icon size={16} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content Container (9 cols) */}
        <div className="lg:col-span-9 bg-[#F6F1E9] border border-[#D8C8BA] rounded-[10px] p-4 sm:p-6 lg:p-8 shadow-2xs">
          <form onSubmit={handleSave}>
            {/* 1. Profile Identity Tab */}
            {activeTab === "profile" && (
              <div className="space-y-6">
                <div className="border-b border-[#D8C8BA] pb-4">
                  <h3 className="font-serif text-xl font-semibold text-[#292827]">
                    Personal Identity & Profile
                  </h3>
                  <p className="text-xs text-[#292827]/70 mt-1">
                    Manage your public student persona and contact information.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <FormInput
                    label="Full Name"
                    id="settingsName"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    icon={User}
                    required
                  />

                  <FormInput
                    label="Email Address"
                    id="settingsEmail"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    icon={Mail}
                    required
                  />
                </div>

                <div>
                  <label className="block text-[0.875rem] font-medium text-[#292827] mb-1.5 select-none">
                    Bio & Learning Aspirations
                  </label>
                  <textarea
                    rows={3}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="w-full bg-[#F6F1E9] text-[#292827] placeholder:text-[#292827]/40 text-sm rounded-[8px] border border-[#D8C8BA] p-3 focus:outline-none focus:border-[#54252C] focus:ring-1 focus:ring-[#54252C] transition-colors"
                    placeholder="Tell us about your learning journey and aspirations..."
                  />
                </div>

                <div>
                  <label className="block text-[0.875rem] font-medium text-[#292827] mb-2 select-none">
                    Avatar Brand Accent Color
                  </label>
                  <div className="flex items-center gap-3">
                    {[
                      { label: "Oxblood", value: "#54252C" },
                      { label: "Muted Wine", value: "#803F47" },
                      { label: "Charcoal", value: "#292827" },
                      { label: "Deep Plum", value: "#431D23" },
                      { label: "Warm Clay", value: "#6B3A36" },
                    ].map((c) => (
                      <button
                        key={c.value}
                        type="button"
                        onClick={() => setAvatarBgColor(c.value)}
                        style={{ backgroundColor: c.value }}
                        className={`w-8 h-8 rounded-full flex items-center justify-center transition-transform cursor-pointer ${
                          avatarBgColor === c.value
                            ? "scale-110 ring-2 ring-offset-2 ring-[#54252C]"
                            : "opacity-80 hover:opacity-100"
                        }`}
                        title={c.label}
                      >
                        {avatarBgColor === c.value && (
                          <Check size={16} className="text-[#F6F1E9]" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 2. Learning & Onboarding Preferences Tab */}
            {activeTab === "learning" && (
              <div className="space-y-6">
                <div className="border-b border-[#D8C8BA] pb-4">
                  <h3 className="font-serif text-xl font-semibold text-[#292827]">
                    Curriculum & Learning Preferences
                  </h3>
                  <p className="text-xs text-[#292827]/70 mt-1">
                    Fine-tune study cadence, pedagogical style, and roadmap pacing.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-[0.875rem] font-medium text-[#292827] mb-1.5 select-none">
                      Target Career Goal
                    </label>
                    <input
                      type="text"
                      value={targetGoal}
                      onChange={(e) => setTargetGoal(e.target.value)}
                      className="w-full bg-[#F6F1E9] text-[#292827] text-sm rounded-[8px] border border-[#D8C8BA] px-3.5 py-2.5 focus:outline-none focus:border-[#54252C]"
                      placeholder="e.g. Full-Stack Web Engineering"
                    />
                  </div>

                  <div>
                    <label className="block text-[0.875rem] font-medium text-[#292827] mb-1.5 select-none">
                      Experience Level
                    </label>
                    <select
                      value={experienceLevel}
                      onChange={(e) => setExperienceLevel(e.target.value as any)}
                      className="w-full bg-[#F6F1E9] text-[#292827] text-sm rounded-[8px] border border-[#D8C8BA] px-3 py-2.5 focus:outline-none focus:border-[#54252C]"
                    >
                      <option value="beginner">Beginner (New to tech)</option>
                      <option value="intermediate">Intermediate (Some foundational experience)</option>
                      <option value="advanced">Advanced (Experienced builder)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-[0.875rem] font-medium text-[#292827] mb-1.5 select-none">
                      Target Study Hours per Week
                    </label>
                    <select
                      value={weeklyHours}
                      onChange={(e) => setWeeklyHours(e.target.value)}
                      className="w-full bg-[#F6F1E9] text-[#292827] text-sm rounded-[8px] border border-[#D8C8BA] px-3 py-2.5 focus:outline-none focus:border-[#54252C]"
                    >
                      <option value="5">5 Hours / Week (Casual & Flexible)</option>
                      <option value="10">10 Hours / Week (Recommended Standard)</option>
                      <option value="20">20 Hours / Week (Intensive Fast-Track)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[0.875rem] font-medium text-[#292827] mb-1.5 select-none">
                      Preferred Learning Style
                    </label>
                    <select
                      value={learningStyle}
                      onChange={(e) => setLearningStyle(e.target.value as any)}
                      className="w-full bg-[#F6F1E9] text-[#292827] text-sm rounded-[8px] border border-[#D8C8BA] px-3 py-2.5 focus:outline-none focus:border-[#54252C]"
                    >
                      <option value="hands-on">Hands-on Coding & Exercises</option>
                      <option value="visual">Visual Diagrams & Flowcharts</option>
                      <option value="reading">Deep-Dive Reading & Documentation</option>
                      <option value="project-driven">Project-Driven Capstones</option>
                      <option value="balanced">Balanced Multi-Modal</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[0.875rem] font-medium text-[#292827] mb-1.5 select-none">
                    Known Technologies & Skills (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={knownSkillsInput}
                    onChange={(e) => setKnownSkillsInput(e.target.value)}
                    className="w-full bg-[#F6F1E9] text-[#292827] text-sm rounded-[8px] border border-[#D8C8BA] px-3.5 py-2.5 focus:outline-none focus:border-[#54252C]"
                    placeholder="React, TypeScript, Node.js, Git..."
                  />
                  <span className="text-[0.7rem] text-[#292827]/60 mt-1 block">
                    These skills will be used to calibrate foundational topics and skip redundancies.
                  </span>
                </div>

                {/* Roadmap Mode Radio */}
                <div className="p-4 rounded-[8px] border border-[#D8C8BA] bg-[#F6F1E9]">
                  <p className="font-semibold text-sm text-[#292827] mb-1">
                    Curriculum Progression Flow
                  </p>
                  <p className="text-xs text-[#292827]/70 mb-3">
                    Choose how curriculum lessons and milestones are accessed.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <label
                      className={`flex items-start gap-3 p-3 rounded-[6px] border cursor-pointer transition-colors ${
                        roadmapMode === "sequential"
                          ? "border-[#54252C] bg-[#54252C]/5"
                          : "border-[#D8C8BA]"
                      }`}
                    >
                      <input
                        type="radio"
                        name="roadmapMode"
                        value="sequential"
                        checked={roadmapMode === "sequential"}
                        onChange={() => setRoadmapMode("sequential")}
                        className="accent-[#54252C] mt-0.5"
                      />
                      <div>
                        <span className="text-xs font-semibold text-[#292827] block">
                          Sequential Milestone Flow
                        </span>
                        <span className="text-[0.7rem] text-[#292827]/70">
                          Recommended. Unlocks topics progressively based on completion.
                        </span>
                      </div>
                    </label>

                    <label
                      className={`flex items-start gap-3 p-3 rounded-[6px] border cursor-pointer transition-colors ${
                        roadmapMode === "open"
                          ? "border-[#54252C] bg-[#54252C]/5"
                          : "border-[#D8C8BA]"
                      }`}
                    >
                      <input
                        type="radio"
                        name="roadmapMode"
                        value="open"
                        checked={roadmapMode === "open"}
                        onChange={() => setRoadmapMode("open")}
                        className="accent-[#54252C] mt-0.5"
                      />
                      <div>
                        <span className="text-xs font-semibold text-[#292827] block">
                          Open Exploration Mode
                        </span>
                        <span className="text-[0.7rem] text-[#292827]/70">
                          All phases and lessons are freely accessible for self-paced study.
                        </span>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* 3. Appearance & Theme Tab */}
            {activeTab === "appearance" && (
              <div className="space-y-6">
                <div className="border-b border-[#D8C8BA] pb-4">
                  <h3 className="font-serif text-xl font-semibold text-[#292827]">
                    Interface Appearance & Theme
                  </h3>
                  <p className="text-xs text-[#292827]/70 mt-1">
                    Select your preferred visual mode. Your choice applies immediately and persists across visits.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Light Theme Card */}
                  <button
                    type="button"
                    onClick={() => handleThemeSelect("light")}
                    className={`p-4 rounded-[10px] border-2 text-left transition-all cursor-pointer flex flex-col justify-between h-36 ${
                      currentTheme === "light"
                        ? "border-[#54252C] bg-[#F6F1E9] ring-2 ring-[#54252C]/20 shadow-xs"
                        : "border-[#D8C8BA] hover:border-[#54252C]/50 bg-[#F6F1E9]"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="w-8 h-8 rounded-full bg-[#54252C]/10 text-[#54252C] flex items-center justify-center">
                        <Sun size={18} />
                      </div>
                      {currentTheme === "light" && (
                        <span className="w-5 h-5 rounded-full bg-[#54252C] text-[#F6F1E9] flex items-center justify-center text-xs">
                          <Check size={12} strokeWidth={3} />
                        </span>
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-[#292827]">
                        Light Theme
                      </p>
                      <p className="text-[0.7rem] text-[#292827]/70">
                        Chalk White with rich Oxblood accents
                      </p>
                    </div>
                  </button>

                  {/* Dark Theme Card */}
                  <button
                    type="button"
                    onClick={() => handleThemeSelect("dark")}
                    className={`p-4 rounded-[10px] border-2 text-left transition-all cursor-pointer flex flex-col justify-between h-36 ${
                      currentTheme === "dark"
                        ? "border-[#803F47] bg-[#211B1D] text-[#F6F1E9] ring-2 ring-[#803F47]/30 shadow-xs"
                        : "border-[#D8C8BA] hover:border-[#803F47] bg-[#211B1D] text-[#F6F1E9]"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="w-8 h-8 rounded-full bg-[#803F47]/20 text-[#D8C8BA] flex items-center justify-center">
                        <Moon size={18} />
                      </div>
                      {currentTheme === "dark" && (
                        <span className="w-5 h-5 rounded-full bg-[#803F47] text-[#F6F1E9] flex items-center justify-center text-xs">
                          <Check size={12} strokeWidth={3} />
                        </span>
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-[#F6F1E9]">
                        Dark Theme
                      </p>
                      <p className="text-[0.7rem] text-[#D8C8BA]/80">
                        Deep Charcoal & Oxblood luxury
                      </p>
                    </div>
                  </button>

                  {/* System Theme Card */}
                  <button
                    type="button"
                    onClick={() => handleThemeSelect("system")}
                    className={`p-4 rounded-[10px] border-2 text-left transition-all cursor-pointer flex flex-col justify-between h-36 ${
                      currentTheme === "system"
                        ? "border-[#54252C] bg-[#F6F1E9] ring-2 ring-[#54252C]/20 shadow-xs"
                        : "border-[#D8C8BA] hover:border-[#54252C]/50 bg-[#F6F1E9]"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="w-8 h-8 rounded-full bg-[#54252C]/10 text-[#54252C] flex items-center justify-center">
                        <Laptop size={18} />
                      </div>
                      {currentTheme === "system" && (
                        <span className="w-5 h-5 rounded-full bg-[#54252C] text-[#F6F1E9] flex items-center justify-center text-xs">
                          <Check size={12} strokeWidth={3} />
                        </span>
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-[#292827]">
                        System Default
                      </p>
                      <p className="text-[0.7rem] text-[#292827]/70">
                        Matches your device OS preference
                      </p>
                    </div>
                  </button>
                </div>
              </div>
            )}

            {/* 4. Notification Alerts Tab */}
            {activeTab === "notifications" && (
              <div className="space-y-6">
                <div className="border-b border-[#D8C8BA] pb-4">
                  <h3 className="font-serif text-xl font-semibold text-[#292827]">
                    Notification Frequencies & Channels
                  </h3>
                  <p className="text-xs text-[#292827]/70 mt-1">
                    Control how and when ShikshaAI notifies you about milestone deadlines and streak protection.
                  </p>
                </div>

                <div className="space-y-3">
                  <label className="flex items-center justify-between p-4 rounded-[8px] border border-[#D8C8BA] cursor-pointer hover:bg-[#D8C8BA]/10 transition-colors">
                    <div>
                      <p className="text-sm font-semibold text-[#292827]">
                        Weekly Learning Digest
                      </p>
                      <p className="text-xs text-[#292827]/70 mt-0.5">
                        Receive a weekly summary of completed study hours, earned badges, and velocity.
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={notifications.emailDigest}
                      onChange={(e) =>
                        setNotifications((prev) => ({
                          ...prev,
                          emailDigest: e.target.checked,
                        }))
                      }
                      className="accent-[#54252C] w-4 h-4 cursor-pointer"
                    />
                  </label>

                  <label className="flex items-center justify-between p-4 rounded-[8px] border border-[#D8C8BA] cursor-pointer hover:bg-[#D8C8BA]/10 transition-colors">
                    <div>
                      <p className="text-sm font-semibold text-[#292827]">
                        Milestone Deadlines & Checkpoints
                      </p>
                      <p className="text-xs text-[#292827]/70 mt-0.5">
                        Get timely reminders when you are approaching target milestone completion dates.
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={notifications.milestoneReminders}
                      onChange={(e) =>
                        setNotifications((prev) => ({
                          ...prev,
                          milestoneReminders: e.target.checked,
                        }))
                      }
                      className="accent-[#54252C] w-4 h-4 cursor-pointer"
                    />
                  </label>

                  <label className="flex items-center justify-between p-4 rounded-[8px] border border-[#D8C8BA] cursor-pointer hover:bg-[#D8C8BA]/10 transition-colors">
                    <div>
                      <p className="text-sm font-semibold text-[#292827]">
                        Daily Streak Protection Alert
                      </p>
                      <p className="text-xs text-[#292827]/70 mt-0.5">
                        Receive a daily nudge in the evening if your study streak is at risk of expiring.
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={notifications.streakAlerts}
                      onChange={(e) =>
                        setNotifications((prev) => ({
                          ...prev,
                          streakAlerts: e.target.checked,
                        }))
                      }
                      className="accent-[#54252C] w-4 h-4 cursor-pointer"
                    />
                  </label>

                  <label className="flex items-center justify-between p-4 rounded-[8px] border border-[#D8C8BA] cursor-pointer hover:bg-[#D8C8BA]/10 transition-colors">
                    <div>
                      <p className="text-sm font-semibold text-[#292827]">
                        Curated Resource Recommendations
                      </p>
                      <p className="text-xs text-[#292827]/70 mt-0.5">
                        Discover newly added tutorials and practice blueprints matching your skill profile.
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={notifications.weeklyProgressReport}
                      onChange={(e) =>
                        setNotifications((prev) => ({
                          ...prev,
                          weeklyProgressReport: e.target.checked,
                        }))
                      }
                      className="accent-[#54252C] w-4 h-4 cursor-pointer"
                    />
                  </label>
                </div>
              </div>
            )}

            {/* 5. Password & Security Tab */}
            {activeTab === "security" && (
              <div className="space-y-6">
                <div className="border-b border-[#D8C8BA] pb-4">
                  <h3 className="font-serif text-xl font-semibold text-[#292827]">
                    Security & Credentials
                  </h3>
                  <p className="text-xs text-[#292827]/70 mt-1">
                    Update your access password and session configuration.
                  </p>
                </div>

                <div className="max-w-md space-y-4">
                  <PasswordInput
                    label="Current Password"
                    placeholder="Enter existing password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                  />

                  <PasswordInput
                    label="New Password"
                    placeholder="Min. 8 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />

                  <PasswordInput
                    label="Confirm New Password"
                    placeholder="Re-enter new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* 6. Account & Danger Zone Tab */}
            {activeTab === "danger" && (
              <div className="space-y-6">
                <div className="border-b border-[#D8C8BA] pb-4">
                  <h3 className="font-serif text-xl font-semibold text-[#803F47] flex items-center gap-2">
                    <AlertTriangle size={20} />
                    <span>Account Session & Data Actions</span>
                  </h3>
                  <p className="text-xs text-[#292827]/70 mt-1">
                    Manage session sign-out or perform explicit resets on your learning state.
                  </p>
                </div>

                {/* Sign Out Card */}
                <div className="p-4 rounded-[8px] border border-[#D8C8BA] bg-[#F6F1E9] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <h4 className="font-semibold text-sm text-[#292827]">
                      Sign Out of Session
                    </h4>
                    <p className="text-xs text-[#292827]/70 mt-0.5">
                      Ends your active authenticated session on this browser device.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setConfirmModal({
                        isOpen: true,
                        title: "Confirm Sign Out",
                        description:
                          "Are you sure you want to sign out of your ShikshaAI session?",
                        actionType: "sign_out",
                        confirmText: "Sign Out",
                      })
                    }
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-[6px] border border-[#803F47] text-[#803F47] hover:bg-[#803F47]/10 text-xs font-medium cursor-pointer"
                  >
                    <LogOut size={14} />
                    <span>Sign Out</span>
                  </button>
                </div>

                {/* Reset Roadmap Data Card */}
                <div className="p-4 rounded-[8px] border border-[#D8C8BA] bg-[#F6F1E9] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <h4 className="font-semibold text-sm text-[#292827]">
                      Reset Active Learning Roadmap
                    </h4>
                    <p className="text-xs text-[#292827]/70 mt-0.5">
                      Clears your personalized roadmap and restarts the onboarding path generator.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setConfirmModal({
                        isOpen: true,
                        title: "Reset Roadmap Progress?",
                        description:
                          "This will clear all milestone progression and generated phases. You will be redirected to the Path Generator wizard.",
                        actionType: "reset_roadmap",
                        confirmText: "Reset Roadmap",
                      })
                    }
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-[6px] bg-[#54252C] hover:bg-[#803F47] text-[#F6F1E9] text-xs font-medium cursor-pointer"
                  >
                    <RotateCcw size={14} />
                    <span>Reset Roadmap</span>
                  </button>
                </div>

                {/* Delete / Reset Account Data */}
                <div className="p-4 rounded-[8px] border border-[#803F47]/40 bg-[#803F47]/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <h4 className="font-semibold text-sm text-[#803F47]">
                      Reset Account Data Cache
                    </h4>
                    <p className="text-xs text-[#292827]/70 mt-0.5">
                      Permanently wipes all local progress, streak records, and profile customizations.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setConfirmModal({
                        isOpen: true,
                        title: "Reset Entire Account Data?",
                        description:
                          "Warning: This action will purge all local data, roadmap progress, and streak statistics. You will be redirected to the Sign In screen.",
                        actionType: "reset_account",
                        confirmText: "Purge All Data",
                      })
                    }
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-[6px] bg-[#803F47] hover:bg-[#54252C] text-[#F6F1E9] text-xs font-medium cursor-pointer"
                  >
                    <Trash2 size={14} />
                    <span>Purge Data</span>
                  </button>
                </div>
              </div>
            )}

            {/* Submit Action Bar */}
            {activeTab !== "danger" && (
              <div className="pt-6 mt-6 border-t border-[#D8C8BA] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    const currentUser = authService.getCurrentUser();
                    setFullName(currentUser.fullName);
                    setEmail(currentUser.email);
                    setBio(currentUser.bio);
                    setStatusMessage({
                      type: "idle",
                      text: "",
                    });
                  }}
                  className="px-4 py-2 rounded-[8px] border border-[#D8C8BA] text-xs font-medium text-[#292827] hover:bg-[#D8C8BA]/30 cursor-pointer"
                >
                  Discard Changes
                </button>

                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2.5 rounded-[8px] bg-[#54252C] hover:bg-[#803F47] text-[#F6F1E9] text-xs sm:text-sm font-medium transition-colors shadow-xs cursor-pointer flex items-center gap-2"
                >
                  {isSaving ? (
                    <span>Saving...</span>
                  ) : (
                    <>
                      <Check size={15} />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </form>
        </div>
      </div>

      {/* Confirmation Modal for Destructive Actions */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#292827]/60 backdrop-blur-xs">
          <div className="bg-[#F6F1E9] border border-[#D8C8BA] rounded-[12px] max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#803F47]/10 text-[#803F47] flex items-center justify-center flex-shrink-0">
                <AlertTriangle size={20} />
              </div>
              <div>
                <h3 className="font-serif text-lg font-semibold text-[#292827]">
                  {confirmModal.title}
                </h3>
                <p className="text-xs text-[#292827]/70 mt-0.5">
                  Action confirmation required
                </p>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-[#292827]/80 leading-relaxed">
              {confirmModal.description}
            </p>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#D8C8BA]">
              <button
                type="button"
                onClick={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
                className="px-4 py-2 rounded-[8px] border border-[#D8C8BA] text-xs font-medium text-[#292827] hover:bg-[#D8C8BA]/30 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteDestructiveAction}
                className="px-4 py-2 rounded-[8px] bg-[#803F47] hover:bg-[#54252C] text-[#F6F1E9] text-xs font-medium cursor-pointer transition-colors"
              >
                {confirmModal.confirmText}
              </button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}

export default function SettingsPage() {
  return (
    <Suspense
      fallback={
        <AppLayout
          pageTitle="Account Settings"
          pageSubtitle="Configure your learning preferences, appearance theme, notification frequencies, and account security."
        >
          <div className="p-12 text-center text-sm text-[#292827]/70">
            Loading settings...
          </div>
        </AppLayout>
      }
    >
      <SettingsContent />
    </Suspense>
  );
}

