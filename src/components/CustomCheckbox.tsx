"use client";

import React from "react";
import { Check } from "lucide-react";

interface CustomCheckboxProps {
  id?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  disabled?: boolean;
}

export const CustomCheckbox: React.FC<CustomCheckboxProps> = ({
  id = "remember-me",
  checked,
  onChange,
  label,
  disabled = false,
}) => {
  return (
    <label
      htmlFor={id}
      className={`inline-flex items-center gap-2.5 cursor-pointer select-none group ${
        disabled ? "opacity-60 cursor-not-allowed" : ""
      }`}
    >
      <div className="relative flex items-center justify-center">
        <input
          type="checkbox"
          id={id}
          checked={checked}
          disabled={disabled}
          onChange={(e) => onChange(e.target.checked)}
          className="sr-only"
        />
        <div
          className={`w-[18px] h-[18px] rounded-[4px] border flex items-center justify-center transition-all duration-200 ${
            checked
              ? "bg-[#54252C] border-[#54252C] text-[#F6F1E9]"
              : "bg-[#F6F1E9] border-[#D8C8BA] group-hover:border-[#292827]/60"
          } group-focus-within:ring-2 group-focus-within:ring-[#54252C] group-focus-within:ring-offset-1`}
        >
          {checked && <Check size={13} strokeWidth={3} className="text-[#F6F1E9]" />}
        </div>
      </div>
      <span className="text-[0.875rem] font-medium text-[#292827] group-hover:text-[#54252C] transition-colors">
        {label}
      </span>
    </label>
  );
};
