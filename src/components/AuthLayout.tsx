"use client";

import React from "react";
import { LearningShowcase } from "./LearningShowcase";
import { BotanicalWatermark } from "./BotanicalWatermark";
import { MobileStudyDeskBanner } from "./MobileStudyDeskBanner";
import { motion } from "framer-motion";

interface AuthLayoutProps {
  variant: "signup" | "signin" | "forgot-password";
  children: React.ReactNode;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ variant, children }) => {
  return (
    <div className="relative w-full min-h-screen flex flex-col lg:flex-row bg-[#F6F1E9] text-[#292827] overflow-x-hidden selection:bg-[#54252C]/15 selection:text-[#54252C]">
      {/* Left Panel (approx 60% width on desktop) — Warm Learning Showcase */}
      <section
        aria-label="Platform Showcase"
        className="hidden lg:flex lg:w-[56%] xl:w-[60%] flex-col border-r border-[#D8C8BA] min-h-screen"
      >
        <LearningShowcase variant={variant} />
      </section>

      {/* Right Panel (approx 40% width on desktop, full-width on mobile/tablet) — Interactive Authentication Form */}
      <section
        aria-label="Authentication Form"
        className="relative w-full lg:w-[44%] xl:w-[40%] flex flex-col justify-start sm:justify-center items-center px-4 py-8 sm:px-8 sm:py-12 lg:px-10 lg:py-14 min-h-screen bg-[#F6F1E9] overflow-hidden"
      >
        {/* Subtle Botanical Watermarks matching mobile reference layout */}
        <BotanicalWatermark
          position={variant === "signin" ? "top-right" : "both"}
        />

        {/* Auth Content Card with Framer Motion Entrance */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10 w-full max-w-[390px] sm:max-w-[420px] mx-auto flex flex-col justify-center my-auto"
        >
          {children}

          {/* Mobile bottom study-desk photograph banner on Sign-in page */}
          {variant === "signin" && (
            <div className="block lg:hidden">
              <MobileStudyDeskBanner />
            </div>
          )}
        </motion.div>
      </section>
    </div>
  );
};
