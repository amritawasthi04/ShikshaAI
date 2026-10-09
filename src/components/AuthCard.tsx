"use client";

import React from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { BrandLogo } from "./BrandLogo";

interface AuthCardProps {
  eyebrow: string;
  headingPrefix: string;
  headingHighlight: string;
  headingSuffix?: string;
  description?: string;
  showBackButton?: boolean;
  backHref?: string;
  children: React.ReactNode;
}

export const AuthCard: React.FC<AuthCardProps> = ({
  eyebrow,
  headingPrefix,
  headingHighlight,
  headingSuffix = "",
  description,
  showBackButton = false,
  backHref = "/signin",
  children,
}) => {
  return (
    <div className="w-full flex flex-col relative">
      {/* Top Header Row with Optional Back Button & Brand Logo */}
      <div className="relative flex items-center justify-center mb-6 pt-1">
        {showBackButton && (
          <Link
            href={backHref}
            className="absolute left-0 top-1/2 -translate-y-1/2 p-1.5 -ml-1 text-[#292827] hover:text-[#54252C] transition-colors rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-[#54252C]"
            aria-label="Go back"
          >
            <ChevronLeft size={22} strokeWidth={2} />
          </Link>
        )}
        <BrandLogo showTagline={true} centered={true} />
      </div>

      {/* Eyebrow */}
      <div className="text-left mt-2 mb-1">
        <span className="text-[0.7rem] sm:text-[0.75rem] font-semibold tracking-[0.22em] text-[#54252C] uppercase select-none">
          {eyebrow}
        </span>
      </div>

      {/* Main Form Heading */}
      <div className="text-left mb-2">
        <h1 className="font-serif text-[1.75rem] sm:text-[2rem] leading-[1.18] text-[#292827]">
          <span>{headingPrefix} </span>
          <span className="text-[#54252C] font-normal">{headingHighlight}</span>
          {headingSuffix && <span> {headingSuffix}</span>}
        </h1>
        {description && (
          <p className="text-[0.875rem] text-[#292827]/80 font-sans mt-1.5 leading-normal">
            {description}
          </p>
        )}
      </div>

      {/* Form Content */}
      <div className="mt-4">{children}</div>
    </div>
  );
};
