"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { AppLayout } from "@/components/layout/AppLayout";
import { authService, UserProfile } from "@/services/authService";
import { roadmapService, DashboardMetrics } from "@/services/roadmapService";
import { GeneratedRoadmap } from "@/types/roadmap";
import { StatusAlert } from "@/components/StatusAlert";
import {
  User,
  Mail,
  Calendar,
  Award,
  BookOpen,
  Settings,
  Flame,
  ArrowRight,
  Sparkles,
  Edit3,
  Check,
  X,
  Target,
  Clock,
  Layers,
  CheckCircle2,
  Code2,
  Compass,
} from "lucide-react";

export default function ProfilePage() {
  const [user, setUser] = useState<UserProfile>(() => authService.getCurrentUser());
  const [roadmap, setRoadmap] = useState<GeneratedRoadmap | null>(() => roadmapService.getActiveRoadmap());
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);

  // Edit Mode state
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(user.fullName);
  const [editEmail, setEditEmail] = useState(user.email);
  const [editBio, setEditBio] = useState(user.bio);
  const [editColor, setEditColor] = useState(user.avatarBgColor || "#54252C");
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: "idle" | "success" | "error";
    text: string;
  }>({ type: "idle", text: "" });

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
    setEditName(currentUser.fullName);
    setEditEmail(currentUser.email);
    setEditBio(currentUser.bio);
    setEditColor(currentUser.avatarBgColor || "#54252C");

    const activeRoadmap = roadmapService.getActiveRoadmap();
    setRoadmap(activeRoadmap);
    if (activeRoadmap) {
      setMetrics(roadmapService.getDashboardMetrics(activeRoadmap, currentUser.streakDays || 12));
    }

    const handleProfileUpdate = (e: CustomEvent<UserProfile>) => {
      if (e.detail) {
        setUser(e.detail);
        setEditName(e.detail.fullName);
        setEditEmail(e.detail.email);
        setEditBio(e.detail.bio);
        setEditColor(e.detail.avatarBgColor || "#54252C");
      }
    };

    window.addEventListener("shiksha_profile_updated" as any, handleProfileUpdate);
    return () => {
      window.removeEventListener("shiksha_profile_updated" as any, handleProfileUpdate);
    };
  }, []);

  const getInitials = (name: string) => {
    if (!name) return "AS";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim()) {
      setStatusMessage({ type: "error", text: "Please provide a valid full name." });
      return;
    }
    if (!editEmail.trim() || !editEmail.includes("@")) {
      setStatusMessage({ type: "error", text: "Please enter a valid email address." });
      return;
    }

    setIsSaving(true);
    setStatusMessage({ type: "idle", text: "" });

    try {
      await new Promise((r) => setTimeout(r, 400));
      const updated = authService.updateUserProfile({
        fullName: editName.trim(),
        email: editEmail.trim(),
        bio: editBio.trim(),
        avatarBgColor: editColor,
      });
      setUser(updated);
      setIsEditing(false);
      setStatusMessage({
        type: "success",
        text: "Student profile updated successfully and synchronized across ShikshaAI!",
      });
    } catch {
      setStatusMessage({ type: "error", text: "Failed to save profile changes." });
    } finally {
      setIsSaving(false);
    }
  };

  const colorOptions = [
    { label: "Oxblood", value: "#54252C" },
    { label: "Muted Wine", value: "#803F47" },
    { label: "Charcoal", value: "#292827" },
    { label: "Deep Plum", value: "#431D23" },
    { label: "Warm Clay", value: "#6B3A36" },
  ];

  const badges = [
    {
      title: `${user.streakDays || 12}-Day Streak`,
      desc: `Maintained consistent daily learning activity for ${user.streakDays || 12} continuous days`,
      icon: Flame,
      tier: "Gold",
    },
    {
      title: "Full-Stack Foundation",
      desc: "Successfully verified architecture patterns and React state management milestones",
      icon: Award,
      tier: "Honor",
    },
    {
      title: "Assessment Honors",
      desc: "Scored first-class distinction across progressive checkpoint evaluations",
      icon: CheckCircle2,
      tier: "Verified",
    },
  ];

  const preferences = user.learningPreferences || {
    targetGoal: "Full-Stack Web Engineering",
    experienceLevel: "intermediate",
    knownSkills: ["JavaScript", "TypeScript", "React", "HTML/CSS", "Git"],
    learningStyle: "hands-on",
    studyPace: "recommended",
    weeklyTargetHours: 10,
    roadmapMode: "sequential",
  };

  const progressPct = metrics ? metrics.progressPercent : roadmap ? 42 : 0;
  const completedLessons = metrics ? metrics.completedLessonsCount : 5;
  const totalLessons = metrics ? metrics.totalLessonsCount : 12;

  return (
    <AppLayout
      pageTitle="Student Profile"
      pageSubtitle="Your personal learning identity, active tracks, and academic achievements."
      actionElement={
        <div className="flex items-center gap-2.5">
          {!isEditing ? (
            <button
              type="button"
              onClick={() => {
                setIsEditing(true);
                setStatusMessage({ type: "idle", text: "" });
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-[8px] bg-[#54252C] hover:bg-[#803F47] text-[#F6F1E9] text-xs sm:text-sm font-medium transition-colors shadow-2xs cursor-pointer"
            >
              <Edit3 size={14} />
              <span>Edit Profile</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-[8px] border border-[#D8C8BA] text-[#292827] hover:bg-[#D8C8BA]/30 text-xs sm:text-sm font-medium transition-colors cursor-pointer"
            >
              <X size={14} />
              <span>Cancel Edit</span>
            </button>
          )}
          <Link
            href="/settings"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-[8px] border border-[#54252C] text-[#54252C] hover:bg-[#54252C]/10 text-xs sm:text-sm font-medium transition-colors"
          >
            <Settings size={14} />
            <span className="hidden sm:inline">Preferences</span>
          </Link>
        </div>
      }
    >
      <StatusAlert
        status={statusMessage.type}
        message={statusMessage.text}
        onDismiss={() => setStatusMessage({ type: "idle", text: "" })}
      />

      {/* Profile Header & Identity Card */}
      <div className="p-6 sm:p-8 rounded-[10px] border border-[#D8C8BA] bg-[#F6F1E9] mb-8 shadow-2xs transition-all">
        {!isEditing ? (
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            {/* Avatar */}
            <div
              style={{ backgroundColor: user.avatarBgColor || "#54252C" }}
              className="w-20 h-20 rounded-full text-[#F6F1E9] flex items-center justify-center font-serif text-2xl font-semibold shadow-xs flex-shrink-0 select-none ring-4 ring-[#D8C8BA]/40"
            >
              {getInitials(user.fullName)}
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2.5 mb-1">
                <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-[#292827]">
                  {user.fullName}
                </h2>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-[4px] bg-[#54252C]/10 text-[#54252C] uppercase tracking-wider">
                  Active Student
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-[4px] bg-[#D8C8BA]/40 text-[#292827]/80">
                  {user.streakDays || 12} Day Streak
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-[#292827]/75 font-sans mt-1">
                <span className="flex items-center gap-1.5">
                  <Mail size={14} className="text-[#54252C]" />
                  {user.email}
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar size={14} className="text-[#54252C]" />
                  Enrolled September 2026
                </span>
              </div>

              <p className="text-xs sm:text-sm text-[#292827]/80 mt-3 max-w-2xl font-sans leading-relaxed">
                {user.bio || "Student focused on mastering computer science and modern software engineering."}
              </p>
            </div>
          </div>
        ) : (
          /* Inline Edit Form */
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#D8C8BA]">
              <h3 className="font-serif text-lg font-semibold text-[#292827]">
                Edit Student Profile
              </h3>
              <span className="text-xs text-[#292827]/70">
                Synchronized with Dashboard & Learning Path
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#292827] mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-[#F6F1E9] text-[#292827] text-sm rounded-[8px] border border-[#D8C8BA] px-3 py-2 focus:outline-none focus:border-[#54252C]"
                  placeholder="Student Name"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#292827] mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full bg-[#F6F1E9] text-[#292827] text-sm rounded-[8px] border border-[#D8C8BA] px-3 py-2 focus:outline-none focus:border-[#54252C]"
                  placeholder="student@example.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#292827] mb-1">
                Bio & Learning Aspirations
              </label>
              <textarea
                rows={3}
                value={editBio}
                onChange={(e) => setEditBio(e.target.value)}
                className="w-full bg-[#F6F1E9] text-[#292827] text-sm rounded-[8px] border border-[#D8C8BA] p-3 focus:outline-none focus:border-[#54252C]"
                placeholder="Share your background, key interests, and target roles..."
              />
            </div>

            {/* Avatar Color Choice */}
            <div>
              <label className="block text-xs font-semibold text-[#292827] mb-2">
                Avatar Brand Accent
              </label>
              <div className="flex items-center gap-3">
                {colorOptions.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => setEditColor(c.value)}
                    style={{ backgroundColor: c.value }}
                    className={`w-7 h-7 rounded-full flex items-center justify-center transition-transform cursor-pointer ${
                      editColor === c.value
                        ? "scale-110 ring-2 ring-offset-2 ring-[#54252C]"
                        : "opacity-80 hover:opacity-100"
                    }`}
                    title={c.label}
                  >
                    {editColor === c.value && (
                      <Check size={14} className="text-[#F6F1E9]" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#D8C8BA]">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 rounded-[8px] border border-[#D8C8BA] text-xs font-medium text-[#292827] hover:bg-[#D8C8BA]/30 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-5 py-2 rounded-[8px] bg-[#54252C] hover:bg-[#803F47] text-[#F6F1E9] text-xs font-medium transition-colors shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                {isSaving ? (
                  <span>Saving...</span>
                ) : (
                  <>
                    <Check size={14} />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Main 2-Column Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column (7 cols): Current Learning Path & Goal Blueprint */}
        <div className="lg:col-span-7 space-y-6">
          {/* Active Roadmap Overview */}
          <div className="p-6 rounded-[10px] border border-[#D8C8BA] bg-[#F6F1E9] shadow-2xs">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#D8C8BA]">
              <div className="flex items-center gap-2">
                <Target size={18} className="text-[#54252C]" />
                <h3 className="font-serif text-lg font-semibold text-[#292827]">
                  Active Learning Track
                </h3>
              </div>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-[4px] bg-[#54252C]/10 text-[#54252C]">
                {progressPct}% Complete
              </span>
            </div>

            {roadmap ? (
              <div className="space-y-4">
                <div>
                  <h4 className="font-serif text-xl font-semibold text-[#292827]">
                    {roadmap.title}
                  </h4>
                  <p className="text-xs text-[#292827]/75 mt-1 leading-relaxed">
                    Customized for {roadmap.targetRole || "Software Engineering"} • {roadmap.learningStyle || "Hands-on"} • {roadmap.weeklyPace || "Recommended"} pace
                  </p>
                </div>

                {/* Progress Bar */}
                <div>
                  <div className="flex items-center justify-between text-xs text-[#292827]/70 mb-1.5">
                    <span>Curriculum Milestones</span>
                    <span className="font-semibold text-[#54252C]">
                      {completedLessons} / {totalLessons} Completed
                    </span>
                  </div>
                  <div className="w-full bg-[#D8C8BA]/50 h-2 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${progressPct}%` }}
                      className="bg-[#54252C] h-full rounded-full transition-all duration-500"
                    />
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <div className="flex items-center gap-3 text-xs text-[#292827]/75">
                    <span className="inline-flex items-center gap-1">
                      <Clock size={13} className="text-[#54252C]" />
                      Est. {roadmap.targetDuration || "3 Months"}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Layers size={13} className="text-[#54252C]" />
                      {roadmap.phases.length} Phases
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      href="/learning-path"
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-[6px] bg-[#54252C] hover:bg-[#803F47] text-[#F6F1E9] text-xs font-medium transition-colors shadow-2xs"
                    >
                      <span>Continue Path</span>
                      <ArrowRight size={13} />
                    </Link>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-xs text-[#292827]/70 mb-3">
                  No custom roadmap generated yet.
                </p>
                <Link
                  href="/build-path"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-[6px] bg-[#54252C] text-[#F6F1E9] text-xs font-medium"
                >
                  <Sparkles size={14} />
                  <span>Build My Learning Path</span>
                </Link>
              </div>
            )}
          </div>

          {/* Learning Preferences & Background Snapshot */}
          <div className="p-6 rounded-[10px] border border-[#D8C8BA] bg-[#F6F1E9] shadow-2xs">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#D8C8BA]">
              <div className="flex items-center gap-2">
                <BookOpen size={18} className="text-[#54252C]" />
                <h3 className="font-serif text-lg font-semibold text-[#292827]">
                  Onboarding Preferences & Blueprint
                </h3>
              </div>
              <Link
                href="/settings?tab=learning"
                className="text-xs font-medium text-[#54252C] hover:underline flex items-center gap-0.5"
              >
                <span>Edit</span>
                <ArrowRight size={12} />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3 rounded-[6px] border border-[#D8C8BA]/80 bg-[#F6F1E9]">
                <span className="text-[#292827]/60 block mb-0.5">Target Career Goal</span>
                <span className="font-semibold text-[#292827] text-sm">
                  {preferences.targetGoal || "Full-Stack Web Engineering"}
                </span>
              </div>

              <div className="p-3 rounded-[6px] border border-[#D8C8BA]/80 bg-[#F6F1E9]">
                <span className="text-[#292827]/60 block mb-0.5">Experience Level</span>
                <span className="font-semibold text-[#292827] capitalize text-sm">
                  {preferences.experienceLevel || "Intermediate"}
                </span>
              </div>

              <div className="p-3 rounded-[6px] border border-[#D8C8BA]/80 bg-[#F6F1E9]">
                <span className="text-[#292827]/60 block mb-0.5">Learning Style</span>
                <span className="font-semibold text-[#292827] capitalize text-sm">
                  {preferences.learningStyle === "hands-on" ? "Hands-on Coding" : preferences.learningStyle}
                </span>
              </div>

              <div className="p-3 rounded-[6px] border border-[#D8C8BA]/80 bg-[#F6F1E9]">
                <span className="text-[#292827]/60 block mb-0.5">Weekly Target Pace</span>
                <span className="font-semibold text-[#292827] text-sm">
                  {preferences.weeklyTargetHours || 10} Hours / Week
                </span>
              </div>
            </div>

            {/* Known Skills Chips */}
            <div className="mt-4 pt-3 border-t border-[#D8C8BA]/60">
              <span className="text-xs font-semibold text-[#292827]/80 block mb-2">
                Declared Known Skills
              </span>
              <div className="flex flex-wrap gap-1.5">
                {(preferences.knownSkills || []).map((skill) => (
                  <span
                    key={skill}
                    className="px-2.5 py-1 rounded-[4px] bg-[#54252C]/10 text-[#54252C] text-xs font-medium border border-[#54252C]/20"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (5 cols): Badges, Achievements & Enrolled Tracks */}
        <div className="lg:col-span-5 space-y-6">
          {/* Earned Badges */}
          <div className="p-6 rounded-[10px] border border-[#D8C8BA] bg-[#F6F1E9] shadow-2xs">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#D8C8BA]">
              <div className="flex items-center gap-2">
                <Award size={18} className="text-[#54252C]" />
                <h3 className="font-serif text-lg font-semibold text-[#292827]">
                  Badges & Honors
                </h3>
              </div>
              <span className="text-xs text-[#54252C] font-semibold">
                3 Verified
              </span>
            </div>

            <div className="space-y-3">
              {badges.map((b) => {
                const Icon = b.icon;
                return (
                  <div
                    key={b.title}
                    className="p-3.5 rounded-[8px] border border-[#D8C8BA]/80 bg-[#F6F1E9] flex items-start gap-3.5 hover:border-[#54252C]/40 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-[#54252C]/10 text-[#54252C] flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Icon size={16} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-sans font-semibold text-xs sm:text-sm text-[#292827]">
                          {b.title}
                        </h4>
                        <span className="text-[0.65rem] font-semibold px-1.5 py-0.2 rounded bg-[#D8C8BA]/50 text-[#54252C]">
                          {b.tier}
                        </span>
                      </div>
                      <p className="text-xs text-[#292827]/75 mt-0.5 leading-relaxed">
                        {b.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Hub Navigation Cards */}
          <div className="p-6 rounded-[10px] border border-[#D8C8BA] bg-[#F6F1E9] shadow-2xs">
            <h3 className="font-serif text-lg font-semibold text-[#292827] mb-3">
              Learning Hub Quick Links
            </h3>
            <div className="space-y-2.5">
              <Link
                href="/progress"
                className="flex items-center justify-between p-3 rounded-[6px] border border-[#D8C8BA] hover:bg-[#D8C8BA]/20 transition-colors group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-[#54252C]/10 text-[#54252C] flex items-center justify-center">
                    <Sparkles size={14} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-[#292827]">
                      Detailed Progress & Velocity
                    </p>
                    <p className="text-[0.7rem] text-[#292827]/60">
                      Weekly study chart & skill breakdown
                    </p>
                  </div>
                </div>
                <ArrowRight size={14} className="text-[#54252C] group-hover:translate-x-0.5 transition-transform" />
              </Link>

              <Link
                href="/explore"
                className="flex items-center justify-between p-3 rounded-[6px] border border-[#D8C8BA] hover:bg-[#D8C8BA]/20 transition-colors group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-[#54252C]/10 text-[#54252C] flex items-center justify-center">
                    <Compass size={14} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-[#292827]">
                      Explore Resources
                    </p>
                    <p className="text-[0.7rem] text-[#292827]/60">
                      Curated tutorials & capstone projects
                    </p>
                  </div>
                </div>
                <ArrowRight size={14} className="text-[#54252C] group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
