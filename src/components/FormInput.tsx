"use client";

import React, { forwardRef } from "react";
import { LucideIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export interface FormInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon?: LucideIcon;
  error?: string;
  helperText?: string;
  rightElement?: React.ReactNode;
}

export const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
  (
    {
      label,
      icon: Icon,
      error,
      helperText,
      rightElement,
      id,
      className = "",
      disabled,
      ...props
    },
    ref
  ) => {
    const inputId = id || `input-${label.toLowerCase().replace(/\s+/g, "-")}`;

    return (
      <div className="w-full flex flex-col mb-4">
        <label
          htmlFor={inputId}
          className="block text-[0.875rem] font-medium text-[#292827] mb-1.5 select-none"
        >
          {label}
        </label>

        <div className="relative flex items-center">
          {Icon && (
            <div className="absolute left-3.5 flex items-center pointer-events-none text-[#292827]/60">
              <Icon size={18} strokeWidth={1.75} aria-hidden="true" />
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            disabled={disabled}
            className={`w-full bg-[#F6F1E9] text-[#292827] placeholder:text-[#292827]/40 text-base sm:text-[0.9375rem] font-sans rounded-[8px] border transition-colors duration-200 py-3 ${
              Icon ? "pl-11" : "pl-3.5"
            } ${rightElement ? "pr-11" : "pr-3.5"} ${
              error
                ? "border-[#803F47] focus:border-[#54252C] focus:ring-1 focus:ring-[#54252C]"
                : "border-[#D8C8BA] hover:border-[#292827]/40 focus:border-[#54252C] focus:ring-1 focus:ring-[#54252C]"
            } ${disabled ? "opacity-60 cursor-not-allowed" : ""} focus:outline-none ${className}`}
            {...props}
          />

          {rightElement && (
            <div className="absolute right-3 flex items-center">
              {rightElement}
            </div>
          )}
        </div>

        {/* Inline Validation Error */}
        <AnimatePresence mode="wait">
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15 }}
              className="text-[0.8rem] font-medium text-[#803F47] mt-1.5 flex items-center gap-1"
              role="alert"
            >
              <span>•</span> {error}
            </motion.p>
          )}
        </AnimatePresence>

        {/* Password or Input Helper Text */}
        {!error && helperText && (
          <p className="text-[0.78rem] text-[#292827]/70 mt-1.5 leading-normal">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

FormInput.displayName = "FormInput";
