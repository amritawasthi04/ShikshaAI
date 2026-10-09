"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { BrandLogo } from "@/components/BrandLogo";
import {
  Route,
  Sparkles,
  BookOpen,
  CheckCircle2,
  TrendingUp,
  Layers,
  ArrowRight,
  Compass,
  Menu,
  X,
  User,
  LayoutDashboard,
} from "lucide-react";

export default function LandingPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-[#F6F1E9] text-[#292827] selection:bg-[#54252C]/15 selection:text-[#54252C]">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 w-full bg-[#F6F1E9]/95 backdrop-blur-md border-b border-[#D8C8BA]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-18 flex items-center justify-between">
          <BrandLogo size="default" showTagline={true} href="/" />

          {/* Desktop Links */}
          <nav className="hidden md:flex items-center gap-8">
            <Link
              href="/explore"
              className="text-sm font-medium text-[#292827]/80 hover:text-[#54252C] transition-colors"
            >
              Explore Roadmaps
            </Link>
            <Link
              href="/learning-path"
              className="text-sm font-medium text-[#292827]/80 hover:text-[#54252C] transition-colors"
            >
              Learning Path
            </Link>
            <Link
              href="/progress"
              className="text-sm font-medium text-[#292827]/80 hover:text-[#54252C] transition-colors"
            >
              Progress Tracking
            </Link>
          </nav>

          {/* Desktop CTA Group */}
          <div className="hidden sm:flex items-center gap-3">
            <Link
              href="/signin"
              className="text-sm font-medium text-[#292827] hover:text-[#54252C] px-3.5 py-2 rounded-[6px] hover:bg-[#D8C8BA]/30 transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/build-path"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-[8px] bg-[#54252C] hover:bg-[#803F47] text-[#F6F1E9] text-sm font-medium transition-colors shadow-xs"
            >
              <span>Build My Path</span>
              <ArrowRight size={15} />
            </Link>
          </div>

          {/* Mobile Actions: Build Path & Hamburger */}
          <div className="flex sm:hidden items-center gap-2">
            <Link
              href="/build-path"
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-[6px] bg-[#54252C] text-[#F6F1E9] text-xs font-medium"
            >
              <span>Build Path</span>
            </Link>
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen((prev) => !prev)}
              className="p-2 rounded-[6px] text-[#292827] hover:bg-[#D8C8BA]/40 focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile Sliding Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="sm:hidden border-t border-[#D8C8BA] bg-[#F6F1E9] px-4 py-4 space-y-3 shadow-lg">
            <nav className="flex flex-col space-y-2">
              <Link
                href="/explore"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-[6px] text-sm font-medium text-[#292827] hover:bg-[#D8C8BA]/30"
              >
                <Compass size={16} className="text-[#54252C]" />
                <span>Explore Roadmaps</span>
              </Link>
              <Link
                href="/learning-path"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-[6px] text-sm font-medium text-[#292827] hover:bg-[#D8C8BA]/30"
              >
                <Route size={16} className="text-[#54252C]" />
                <span>Learning Path</span>
              </Link>
              <Link
                href="/progress"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-[6px] text-sm font-medium text-[#292827] hover:bg-[#D8C8BA]/30"
              >
                <TrendingUp size={16} className="text-[#54252C]" />
                <span>Progress Tracking</span>
              </Link>
              <Link
                href="/dashboard"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-[6px] text-sm font-medium text-[#292827] hover:bg-[#D8C8BA]/30"
              >
                <LayoutDashboard size={16} className="text-[#54252C]" />
                <span>Dashboard</span>
              </Link>
            </nav>

            <div className="pt-3 border-t border-[#D8C8BA] flex flex-col gap-2">
              <Link
                href="/signin"
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full text-center py-2.5 rounded-[6px] border border-[#54252C] text-[#54252C] text-sm font-medium"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full text-center py-2.5 rounded-[6px] bg-[#54252C] text-[#F6F1E9] text-sm font-medium"
              >
                Create Account
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-16 sm:py-24 border-b border-[#D8C8BA]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Hero Left Content */}
            <div className="lg:col-span-7 flex flex-col text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#54252C]/10 text-[#54252C] text-xs font-semibold uppercase tracking-[0.2em] mb-6 w-max">
                <Sparkles size={13} />
                <span>Personalized Learning Platform</span>
              </div>

              <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl text-[#292827] font-normal leading-[1.12] tracking-tight mb-6">
                Knowledge Builds <br />
                <span className="text-[#54252C]">Brighter Futures</span>
              </h1>

              <p className="text-base sm:text-lg text-[#292827]/80 leading-relaxed max-w-xl mb-8 font-sans">
                Personalised learning paths, structured skill milestones, real
                practice and continuous progress — all in one calm, editorial
                workspace.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 max-w-md">
                <Link
                  href="/build-path"
                  className="flex-1 h-12 flex items-center justify-center gap-2 px-6 rounded-[8px] bg-[#54252C] hover:bg-[#803F47] text-[#F6F1E9] font-medium transition-all shadow-sm"
                >
                  <span>Build My Path</span>
                  <ArrowRight size={18} />
                </Link>
                <Link
                  href="/explore"
                  className="flex-1 h-12 flex items-center justify-center gap-2 px-6 rounded-[8px] border border-[#54252C] text-[#54252C] hover:bg-[#54252C]/5 font-medium transition-colors"
                >
                  <Compass size={18} />
                  <span>Explore Roadmaps</span>
                </Link>
              </div>

              {/* Stats Row */}
              <div className="grid grid-cols-3 gap-6 pt-10 mt-10 border-t border-[#D8C8BA]/80">
                <div>
                  <p className="font-serif text-2xl sm:text-3xl font-semibold text-[#54252C]">
                    50+
                  </p>
                  <p className="text-xs sm:text-sm text-[#292827]/70 mt-0.5">
                    Curated Roadmaps
                  </p>
                </div>
                <div>
                  <p className="font-serif text-2xl sm:text-3xl font-semibold text-[#54252C]">
                    100%
                  </p>
                  <p className="text-xs sm:text-sm text-[#292827]/70 mt-0.5">
                    Adaptive Pacing
                  </p>
                </div>
                <div>
                  <p className="font-serif text-2xl sm:text-3xl font-semibold text-[#54252C]">
                    94%
                  </p>
                  <p className="text-xs sm:text-sm text-[#292827]/70 mt-0.5">
                    Goal Completion
                  </p>
                </div>
              </div>
            </div>

            {/* Hero Right Visual Showcase */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-[12px] overflow-hidden border border-[#D8C8BA] shadow-lg bg-[#F6F1E9]">
                <div className="relative w-full h-80 sm:h-96">
                  <Image
                    src="/images/study-workspace.jpg"
                    alt="Warm sunlit academic workspace"
                    fill
                    priority
                    className="object-cover object-center mix-blend-multiply"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#F6F1E9] via-transparent to-transparent" />
                </div>

                {/* Floating Preview Card */}
                <div className="absolute bottom-4 inset-x-4 p-4 rounded-[8px] bg-[#F6F1E9]/95 backdrop-blur-md border border-[#D8C8BA] shadow-md">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-[#54252C] uppercase tracking-wider">
                      Current Milestone
                    </span>
                    <span className="text-xs font-medium text-[#292827]/60">
                      Module 3 of 5
                    </span>
                  </div>
                  <p className="font-sans font-semibold text-sm text-[#292827] truncate">
                    Full-Stack Web Engineering
                  </p>
                  <div className="w-full bg-[#D8C8BA]/60 h-2 rounded-full mt-2 overflow-hidden">
                    <div className="bg-[#54252C] h-full rounded-full w-[65%]" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4 Core Pillars Section */}
      <section className="py-16 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-semibold tracking-[0.2em] text-[#54252C] uppercase">
            Platform Capabilities
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl text-[#292827] mt-2 font-semibold">
            Built For Deep, Structured Learning
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 rounded-[8px] border border-[#D8C8BA] bg-[#F6F1E9] hover:border-[#54252C]/60 transition-colors shadow-2xs">
            <div className="w-10 h-10 rounded-[6px] bg-[#54252C]/10 text-[#54252C] flex items-center justify-center mb-4">
              <Route size={22} />
            </div>
            <h3 className="font-sans font-semibold text-lg text-[#292827] mb-1.5">
              Personalised Roadmaps
            </h3>
            <p className="text-sm text-[#292827]/75 leading-relaxed">
              Step-by-step learning blueprints customized to your current skill
              level and career targets.
            </p>
          </div>

          <div className="p-6 rounded-[8px] border border-[#D8C8BA] bg-[#F6F1E9] hover:border-[#54252C]/60 transition-colors shadow-2xs">
            <div className="w-10 h-10 rounded-[6px] bg-[#54252C]/10 text-[#54252C] flex items-center justify-center mb-4">
              <Layers size={22} />
            </div>
            <h3 className="font-sans font-semibold text-lg text-[#292827] mb-1.5">
              Skill Milestones
            </h3>
            <p className="text-sm text-[#292827]/75 leading-relaxed">
              Structured modules broken into digestible lessons with clear learning
              objectives.
            </p>
          </div>

          <div className="p-6 rounded-[8px] border border-[#D8C8BA] bg-[#F6F1E9] hover:border-[#54252C]/60 transition-colors shadow-2xs">
            <div className="w-10 h-10 rounded-[6px] bg-[#54252C]/10 text-[#54252C] flex items-center justify-center mb-4">
              <CheckCircle2 size={22} />
            </div>
            <h3 className="font-sans font-semibold text-lg text-[#292827] mb-1.5">
              Practice & Assessments
            </h3>
            <p className="text-sm text-[#292827]/75 leading-relaxed">
              Hands-on checkpoints and quizzes to validate your understanding
              before advancing.
            </p>
          </div>

          <div className="p-6 rounded-[8px] border border-[#D8C8BA] bg-[#F6F1E9] hover:border-[#54252C]/60 transition-colors shadow-2xs">
            <div className="w-10 h-10 rounded-[6px] bg-[#54252C]/10 text-[#54252C] flex items-center justify-center mb-4">
              <TrendingUp size={22} />
            </div>
            <h3 className="font-sans font-semibold text-lg text-[#292827] mb-1.5">
              Track Your Progress
            </h3>
            <p className="text-sm text-[#292827]/75 leading-relaxed">
              Visualize mastery metrics, learning streaks, and completed milestones
              over time.
            </p>
          </div>
        </div>
      </section>

      {/* Featured Roadmaps Preview Section */}
      <section className="py-16 bg-[#F6F1E9] border-t border-[#D8C8BA]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
            <div>
              <span className="text-xs font-semibold tracking-[0.2em] text-[#54252C] uppercase">
                Curriculum Library
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl text-[#292827] mt-1 font-semibold">
                Popular Learning Paths
              </h2>
            </div>
            <Link
              href="/explore"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#54252C] hover:text-[#803F47] transition-colors"
            >
              <span>View All Roadmaps</span>
              <ArrowRight size={16} />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: "Full-Stack Web Engineering",
                level: "Intermediate",
                duration: "12 Weeks",
                modules: 5,
                desc: "Modern React, Next.js, Node APIs, Database Architecture, and Production Deployment.",
              },
              {
                title: "Data Structures & Algorithms",
                level: "All Levels",
                duration: "8 Weeks",
                modules: 6,
                desc: "Core computational foundations, trees, dynamic programming, and complexity analysis.",
              },
              {
                title: "Machine Learning Foundations",
                level: "Advanced",
                duration: "16 Weeks",
                modules: 8,
                desc: "Statistical learning, neural architectures, data pipelines, and model evaluation.",
              },
            ].map((path, idx) => (
              <div
                key={idx}
                className="p-6 rounded-[8px] border border-[#D8C8BA] bg-[#F6F1E9] flex flex-col justify-between hover:border-[#54252C] transition-all group"
              >
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs font-medium px-2.5 py-0.5 rounded-[4px] bg-[#54252C]/10 text-[#54252C]">
                      {path.level}
                    </span>
                    <span className="text-xs text-[#292827]/60">
                      • {path.duration}
                    </span>
                  </div>
                  <h3 className="font-sans font-semibold text-lg text-[#292827] group-hover:text-[#54252C] transition-colors mb-2">
                    {path.title}
                  </h3>
                  <p className="text-sm text-[#292827]/75 leading-relaxed mb-6">
                    {path.desc}
                  </p>
                </div>

                <div className="pt-4 border-t border-[#D8C8BA]/60 flex items-center justify-between">
                  <span className="text-xs text-[#292827]/70 font-medium">
                    {path.modules} Structured Modules
                  </span>
                  <Link
                    href="/build-path"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-[#54252C] hover:underline"
                  >
                    <span>Start Path</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-[#D8C8BA] bg-[#F6F1E9] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <BrandLogo size="default" showTagline={true} />

          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-[#292827]/75">
            <Link href="/dashboard" className="hover:text-[#54252C]">
              Dashboard
            </Link>
            <Link href="/learning-path" className="hover:text-[#54252C]">
              Learning Path
            </Link>
            <Link href="/explore" className="hover:text-[#54252C]">
              Explore
            </Link>
            <Link href="/progress" className="hover:text-[#54252C]">
              Progress
            </Link>
            <Link href="/build-path" className="hover:text-[#54252C]">
              Build Path
            </Link>
            <Link href="/signin" className="hover:text-[#54252C]">
              Sign In
            </Link>
            <Link href="/signup" className="hover:text-[#54252C]">
              Sign Up
            </Link>
          </div>

          <p className="text-xs text-[#292827]/60">
            © 2026 Shiksha Path SI. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
