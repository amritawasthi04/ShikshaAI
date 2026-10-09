"use client";

import React, { useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { BrandLogo } from "./BrandLogo";
import { FeatureItem, FeatureIconType } from "./FeatureItem";
import { EditorialHeadline } from "./effects/EditorialHeadline";

export interface LearningFeature {
  iconType: FeatureIconType;
  title: string;
  description: string;
}

interface LearningShowcaseProps {
  variant: "signup" | "signin" | "forgot-password";
  className?: string;
}

const defaultFeatures: LearningFeature[] = [
  {
    iconType: "roadmap",
    title: "Personalised Roadmaps",
    description: "A clear path tailored to your goals.",
  },
  {
    iconType: "milestones",
    title: "Skill Milestones",
    description: "Structured modules tailored to your level.",
  },
  {
    iconType: "practice",
    title: "Practice & Assessments",
    description: "Learn by doing and track your skills.",
  },
  {
    iconType: "progress",
    title: "Track Your Progress",
    description: "See how far you've come, and what's next.",
  },
];

export const LearningShowcase: React.FC<LearningShowcaseProps> = ({
  variant,
  className = "",
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      // Stagger entrance of motif & subtitle
      gsap.fromTo(
        ".showcase-meta",
        { opacity: 0, y: 15 },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          stagger: 0.1,
          ease: "power2.out",
          delay: 0.1,
        }
      );

      // Feature items stagger
      const featureElements = featuresRef.current?.querySelectorAll(".feature-item-card");
      if (featureElements && featureElements.length > 0) {
        gsap.fromTo(
          featureElements,
          { opacity: 0, y: 20 },
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            stagger: 0.12,
            ease: "power2.out",
            delay: 0.35,
          }
        );
      }

      // Image soft reveal
      if (imageRef.current) {
        gsap.fromTo(
          imageRef.current,
          { opacity: 0, scale: 0.98 },
          {
            opacity: 1,
            scale: 1,
            duration: 1.1,
            ease: "power2.out",
            delay: 0.2,
          }
        );
      }

      // Motivational script note reveal
      gsap.fromTo(
        ".motivational-script",
        { opacity: 0, x: -10 },
        {
          opacity: 1,
          x: 0,
          duration: 0.8,
          ease: "power2.out",
          delay: 0.6,
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, [variant]);

  // Content configurations based on page
  const headlineConfig = {
    signup: [
      { text: "Knowledge" },
      { text: "Builds" },
      { text: "Brighter Futures", highlight: true },
    ],
    signin: [
      { text: "Every Learner" },
      { text: "A Brighter Tomorrow", highlight: true },
    ],
    "forgot-password": [
      { text: "Rediscover" },
      { text: "Your Potential", highlight: true },
    ],
  }[variant];

  return (
    <div
      ref={containerRef}
      className={`relative w-full min-h-full flex flex-col justify-between p-8 sm:p-12 lg:p-14 bg-[#F6F1E9] overflow-hidden ${className}`}
    >
      {/* Top Header Row with Brand Logo */}
      <div className="z-10 flex items-center justify-between w-full mb-8 lg:mb-10">
        <BrandLogo showTagline={true} />
      </div>

      {/* Main Showcase Body */}
      <div className="z-10 flex-1 flex flex-col justify-center max-w-2xl py-2">
        {/* Navigation Motif */}
        <div className="showcase-meta flex items-center gap-3 mb-4">
          <div className="w-8 h-[1px] bg-[#292827]/40" />
          <p className="text-[0.7rem] sm:text-[0.75rem] font-semibold text-[#292827]/75 tracking-[0.22em] uppercase">
            LEARN &nbsp; PRACTICE &nbsp; BUILD &nbsp; GROW
          </p>
        </div>

        {/* Editorial Headline */}
        <EditorialHeadline
          lines={headlineConfig}
          size={variant === "signin" ? "xl" : "2xl"}
          className="mb-4"
        />

        {/* Supporting Copy */}
        <p className="showcase-meta text-[0.92rem] sm:text-[1rem] text-[#292827]/80 leading-relaxed max-w-xl mb-7 font-sans">
          Personalised learning paths, AI mentorship, real practice and continuous
          progress — all in one place.
        </p>

        {/* Learning Features */}
        <div
          ref={featuresRef}
          className={`w-full mb-6 ${
            variant === "signin"
              ? "grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4"
              : "flex flex-col space-y-3.5"
          }`}
        >
          {defaultFeatures.map((feat, idx) => (
            <FeatureItem
              key={idx}
              iconType={feat.iconType}
              title={feat.title}
              description={feat.description}
              compact={variant === "signin"}
            />
          ))}
        </div>
      </div>

      {/* Photorealistic Study Workspace Layer */}
      <div
        ref={imageRef}
        className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
      >
        {/* High quality realistic study room photography background */}
        <div className="relative w-full h-full">
          <Image
            src="/images/study-workspace.jpg"
            alt="Warm sunlit academic study desk with books, coffee mug and laptop"
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 60vw"
            className="object-cover object-center opacity-30 lg:opacity-40 mix-blend-multiply transition-opacity duration-700"
          />

          {/* Natural daylight gradient overlays blending seamlessly into #F6F1E9 */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#F6F1E9] via-[#F6F1E9]/80 to-[#F6F1E9]/40" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#F6F1E9] via-transparent to-[#F6F1E9]/60" />
        </div>
      </div>

      {/* Wall Poster Note & Motivational Taglines */}
      <div className="z-10 flex items-end justify-between w-full pt-4 mt-auto">
        {/* Bottom-left handwritten motivational tagline */}
        <div className="motivational-script flex flex-col">
          <span className="font-handwriting text-2xl sm:text-3xl text-[#54252C]/90 -rotate-2 select-none tracking-wide">
            A Better You Everyday
          </span>
          <div className="w-10 h-[1.5px] bg-[#54252C]/50 mt-0.5" />
        </div>

        {/* Pinned Quote Tag (matching the reference wall note) */}
        {variant === "signup" && (
          <div className="hidden sm:flex flex-col bg-[#F6F1E9]/90 border border-[#D8C8BA] rounded-[4px] px-3 py-2 text-center shadow-xs backdrop-blur-xs select-none">
            <span className="text-[0.68rem] uppercase tracking-wider font-semibold text-[#54252C]">
              Good Students
            </span>
            <span className="text-[0.68rem] text-[#292827]/80">
              Build Great Lives
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
