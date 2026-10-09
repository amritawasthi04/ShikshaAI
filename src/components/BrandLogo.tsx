import React from "react";
import Link from "next/link";
import Image from "next/image";

interface BrandLogoProps {
  showTagline?: boolean;
  centered?: boolean;
  className?: string;
  size?: "default" | "sm" | "lg";
  href?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  showTagline = true,
  centered = false,
  className = "",
  size = "default",
  href = "/",
}) => {
  const dimensions = {
    sm: { size: 34, className: "w-[32px] h-[32px] sm:w-[36px] sm:h-[36px]" },
    default: { size: 44, className: "w-[38px] h-[38px] sm:w-[44px] sm:h-[44px]" },
    lg: { size: 54, className: "w-[48px] h-[48px] sm:w-[54px] sm:h-[54px]" },
  }[size];

  const content = (
    <div
      className={`inline-flex items-center gap-3 group select-none ${
        centered ? "justify-center" : ""
      } ${className}`}
    >
      {/* Official Brand Logo Emblem with preserved proportions, oxblood color & gold accent */}
      <div
        className={`relative flex-shrink-0 ${dimensions.className} transition-transform duration-300 group-hover:scale-105`}
      >
        <Image
          src="/images/brand-logo.jpg"
          alt="Shiksha Path SI Official Emblem"
          width={dimensions.size}
          height={dimensions.size}
          priority
          className="w-full h-full object-contain mix-blend-multiply rounded-[4px]"
        />
      </div>

      {/* Brand Wordmark and Tagline */}
      <div className={`flex flex-col ${centered ? "text-left" : ""}`}>
        <div className="flex items-center leading-none">
          <span className="font-serif text-[1.3rem] sm:text-[1.45rem] font-semibold text-[#292827] tracking-tight">
            Shiksha Path
          </span>
        </div>
        {showTagline && (
          <span className="text-[0.72rem] sm:text-[0.75rem] text-[#292827]/85 tracking-tight mt-1 font-sans">
            Your Learning Journey, Guided by AI
          </span>
        )}
      </div>
    </div>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="inline-flex focus:outline-none focus-visible:ring-2 focus-visible:ring-[#54252C] rounded-md"
        aria-label="Shiksha Path SI Home"
      >
        {content}
      </Link>
    );
  }

  return content;
};
