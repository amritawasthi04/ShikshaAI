"use client";

import React, { useEffect, useRef } from "react";
import gsap from "gsap";

interface EditorialHeadlineProps {
  lines: Array<{
    text: string;
    highlight?: boolean;
    italic?: boolean;
  }>;
  className?: string;
  size?: "lg" | "xl" | "2xl";
}

export const EditorialHeadline: React.FC<EditorialHeadlineProps> = ({
  lines,
  className = "",
  size = "2xl",
}) => {
  const containerRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Check prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion) {
      return;
    }

    const ctx = gsap.context(() => {
      const lineElements = containerRef.current?.querySelectorAll(".headline-line");
      if (lineElements && lineElements.length > 0) {
        gsap.fromTo(
          lineElements,
          {
            y: 24,
            opacity: 0,
          },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            stagger: 0.14,
            ease: "power3.out",
          }
        );
      }
    }, containerRef);

    return () => ctx.revert();
  }, [lines]);

  const sizeClasses = {
    lg: "text-2xl sm:text-3xl lg:text-4xl",
    xl: "text-3xl sm:text-4xl lg:text-5xl",
    "2xl": "text-3xl sm:text-4xl lg:text-[2.75rem] xl:text-[3.25rem]",
  };

  return (
    <h1
      ref={containerRef}
      className={`font-serif font-normal leading-[1.08] tracking-tight ${sizeClasses[size]} ${className}`}
    >
      {lines.map((line, index) => (
        <span
          key={index}
          className={`headline-line block ${
            line.highlight
              ? "text-[#54252C] font-normal"
              : "text-[#292827]"
          } ${line.italic ? "italic" : ""}`}
        >
          {line.text}
        </span>
      ))}
    </h1>
  );
};
