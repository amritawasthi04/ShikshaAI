"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Info, AlertCircle, CheckCircle2 } from "lucide-react";

interface StatusAlertProps {
  status: "idle" | "success" | "error" | "info";
  message: string;
  onDismiss?: () => void;
}

export const StatusAlert: React.FC<StatusAlertProps> = ({
  status,
  message,
  onDismiss,
}) => {
  if (status === "idle" || !message) return null;

  const isSuccess = status === "success";
  const isError = status === "error";

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -6 }}
        transition={{ duration: 0.2 }}
        className={`w-full p-3.5 rounded-[8px] border text-[0.85rem] leading-relaxed mb-4 flex items-start gap-2.5 ${
          isSuccess
            ? "bg-[#F6F1E9] border-[#54252C] text-[#54252C]"
            : isError
            ? "bg-[#F6F1E9] border-[#803F47] text-[#803F47]"
            : "bg-[#F6F1E9] border-[#D8C8BA] text-[#292827]"
        }`}
        role="alert"
      >
        <div className="flex-shrink-0 mt-0.5">
          {isSuccess ? (
            <CheckCircle2 size={16} strokeWidth={2} className="text-[#54252C]" />
          ) : isError ? (
            <AlertCircle size={16} strokeWidth={2} className="text-[#803F47]" />
          ) : (
            <Info size={16} strokeWidth={2} className="text-[#292827]" />
          )}
        </div>
        <div className="flex-1 font-sans">{message}</div>
        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            className="text-xs font-semibold underline hover:opacity-80 ml-2"
          >
            Dismiss
          </button>
        )}
      </motion.div>
    </AnimatePresence>
  );
};
