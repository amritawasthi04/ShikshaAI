"use client";

import React from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { ArrowRight, Loader2 } from "lucide-react";

export interface PrimaryButtonProps
  extends Omit<HTMLMotionProps<"button">, "children"> {
  children: React.ReactNode;
  isLoading?: boolean;
  showArrow?: boolean;
  variant?: "primary" | "secondary" | "outline";
}

export const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  children,
  isLoading = false,
  showArrow = true,
  variant = "primary",
  disabled,
  className = "",
  ...props
}) => {
  const baseStyles =
    "w-full h-12 flex items-center justify-center gap-2.5 px-6 rounded-[8px] text-[0.95rem] font-medium transition-colors duration-200 select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-[#54252C] focus-visible:ring-offset-2";

  const variantStyles = {
    primary:
      "bg-[#54252C] hover:bg-[#803F47] text-[#F6F1E9] shadow-sm disabled:bg-[#54252C]/60 disabled:cursor-not-allowed",
    secondary:
      "bg-[#D8C8BA] hover:bg-[#D8C8BA]/80 text-[#292827] disabled:opacity-60 disabled:cursor-not-allowed",
    outline:
      "border border-[#54252C] text-[#54252C] hover:bg-[#54252C]/5 disabled:opacity-60 disabled:cursor-not-allowed",
  };

  return (
    <motion.button
      whileHover={!disabled && !isLoading ? { scale: 1.008 } : undefined}
      whileTap={!disabled && !isLoading ? { scale: 0.992 } : undefined}
      transition={{ duration: 0.15, ease: "easeOut" }}
      disabled={disabled || isLoading}
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin text-[#F6F1E9]" />
          <span>Please wait...</span>
        </>
      ) : (
        <>
          <span>{children}</span>
          {showArrow && (
            <ArrowRight
              size={18}
              strokeWidth={2}
              className="transition-transform duration-200 group-hover:translate-x-1"
              aria-hidden="true"
            />
          )}
        </>
      )}
    </motion.button>
  );
};
