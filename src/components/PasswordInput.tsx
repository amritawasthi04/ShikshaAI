"use client";

import React, { useState, forwardRef } from "react";
import { LockKeyhole, Eye, EyeOff } from "lucide-react";
import { FormInput, FormInputProps } from "./FormInput";

export interface PasswordInputProps extends Omit<FormInputProps, "type" | "rightElement"> {
  showStrengthGuide?: boolean;
}

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ label = "Password", icon = LockKeyhole, showStrengthGuide, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);

    const toggleVisibility = () => {
      setShowPassword((prev) => !prev);
    };

    return (
      <FormInput
        ref={ref}
        label={label}
        icon={icon}
        type={showPassword ? "text" : "password"}
        rightElement={
          <button
            type="button"
            onClick={toggleVisibility}
            className="p-1 rounded text-[#292827]/60 hover:text-[#54252C] transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-[#54252C]"
            aria-label={showPassword ? "Hide password" : "Show password"}
            tabIndex={0}
          >
            {showPassword ? (
              <EyeOff size={18} strokeWidth={1.75} aria-hidden="true" />
            ) : (
              <Eye size={18} strokeWidth={1.75} aria-hidden="true" />
            )}
          </button>
        }
        {...props}
      />
    );
  }
);

PasswordInput.displayName = "PasswordInput";
