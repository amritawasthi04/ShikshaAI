"use client";

import React from "react";
import Link from "next/link";
import { ExploreResource } from "@/types/roadmap";
import {
  X,
  Sparkles,
  BookOpen,
  Code2,
  FileCheck,
  Clock,
  Check,
  Plus,
  ExternalLink,
  Target,
  Layers,
  ArrowRight,
  Terminal,
  Zap,
} from "lucide-react";

interface ResourceDetailModalProps {
  resource: ExploreResource | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToPath: (resource: ExploreResource) => void;
  isAlreadyAdded: boolean;
  matchReason?: string;
}

export const ResourceDetailModal: React.FC<ResourceDetailModalProps> = ({
  resource,
  isOpen,
  onClose,
  onAddToPath,
  isAlreadyAdded,
  matchReason,
}) => {
  if (!isOpen || !resource) return null;

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Projects":
        return <Sparkles size={14} className="text-[#54252C]" />;
      case "Tutorials":
        return <Code2 size={14} className="text-[#54252C]" />;
      case "Technologies":
        return <Terminal size={14} className="text-[#54252C]" />;
      case "Learning Paths":
      default:
        return <BookOpen size={14} className="text-[#54252C]" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#292827]/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Card */}
      <div className="relative z-10 w-full max-w-2xl bg-[#F6F1E9] border border-[#D8C8BA] rounded-[12px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-[#D8C8BA] bg-[#F6F1E9] flex items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-[4px] bg-[#54252C]/10 text-[#54252C] text-xs font-semibold uppercase tracking-wider">
                {getCategoryIcon(resource.category)}
                <span>{resource.category}</span>
              </span>
              <span className="px-2 py-0.5 rounded-[4px] border border-[#D8C8BA] text-xs text-[#292827]/80">
                {resource.difficulty}
              </span>
              <span className="flex items-center gap-1 text-xs text-[#292827]/60">
                <Clock size={12} />
                <span>{resource.duration}</span>
              </span>
            </div>

            <h3 className="font-serif text-xl sm:text-2xl font-semibold text-[#292827]">
              {resource.title}
            </h3>
            <p className="text-xs sm:text-sm text-[#292827]/75 mt-1 font-sans">
              {resource.description}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="p-1.5 rounded-[6px] text-[#292827]/60 hover:text-[#54252C] hover:bg-[#D8C8BA]/40 transition-colors flex-shrink-0"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-5">
          {/* Match Reason Banner */}
          {matchReason && (
            <div className="p-3.5 rounded-[8px] bg-[#54252C]/5 border border-[#54252C]/20 flex items-start gap-2.5">
              <div className="p-1 rounded-[4px] bg-[#54252C] text-[#F6F1E9] mt-0.5 flex-shrink-0">
                <Target size={13} />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-[#54252C] uppercase tracking-wider">
                  Why this matches your profile
                </h4>
                <p className="text-xs text-[#292827]/85 mt-0.5 leading-relaxed">
                  {matchReason}
                </p>
              </div>
            </div>
          )}

          {/* Learning Objectives */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#54252C] mb-2.5">
              Learning Objectives:
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm text-[#292827]/85">
              {resource.objectives.map((obj, idx) => (
                <li key={idx} className="flex items-start gap-2.5">
                  <div className="w-4 h-4 rounded-full bg-[#54252C]/10 text-[#54252C] flex items-center justify-center flex-shrink-0 mt-0.5 text-[0.65rem] font-bold">
                    {idx + 1}
                  </div>
                  <span>{obj}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Prerequisites */}
          {resource.prerequisites && resource.prerequisites.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-[#292827]/70 mb-2">
                Recommended Prerequisites:
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {resource.prerequisites.map((prereq, idx) => (
                  <span
                    key={idx}
                    className="text-xs px-2.5 py-1 rounded-[4px] bg-[#D8C8BA]/30 border border-[#D8C8BA] text-[#292827]/80"
                  >
                    {prereq}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Code Implementation Preview */}
          {resource.codePreview && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#54252C] flex items-center gap-1">
                  <Code2 size={13} />
                  <span>Pattern Blueprint</span>
                </span>
              </div>
              <pre className="p-4 rounded-[8px] bg-[#292827] text-[#F6F1E9] text-xs font-mono overflow-x-auto leading-relaxed border border-[#292827]">
                <code>{resource.codePreview}</code>
              </pre>
            </div>
          )}

          {/* External Reference Link */}
          {resource.externalUrl && (
            <div className="pt-2">
              <a
                href={resource.externalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#54252C] hover:underline"
              >
                <span>Visit Official Technical Documentation</span>
                <ExternalLink size={12} />
              </a>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-[#D8C8BA] bg-[#F6F1E9] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div>
            {isAlreadyAdded ? (
              <span className="inline-flex items-center gap-1 text-xs text-[#54252C] font-semibold">
                <Check size={14} strokeWidth={2.5} />
                <span>Added to your active Learning Path</span>
              </span>
            ) : (
              <span className="text-xs text-[#292827]/60">
                Available to add as custom milestone
              </span>
            )}
          </div>

          <div className="flex items-center justify-end gap-2.5">
            {isAlreadyAdded ? (
              <button
                type="button"
                disabled
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-[6px] bg-[#54252C]/10 text-[#54252C] text-xs font-semibold cursor-not-allowed opacity-75"
              >
                <Check size={13} strokeWidth={2.5} />
                <span>In Your Path</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => onAddToPath(resource)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-[6px] bg-[#54252C] hover:bg-[#803F47] text-[#F6F1E9] text-xs sm:text-sm font-medium transition-colors shadow-2xs"
              >
                <Plus size={14} />
                <span>Add to My Path</span>
              </button>
            )}

            <Link
              href="/learning-path"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-[6px] border border-[#54252C] text-[#54252C] hover:bg-[#54252C]/5 text-xs sm:text-sm font-medium transition-colors text-center"
            >
              <span>Start Learning</span>
              <ArrowRight size={13} />
            </Link>

            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-[6px] border border-[#D8C8BA] text-xs sm:text-sm font-medium text-[#292827] hover:bg-[#D8C8BA]/30 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
