import React from "react";
import {
  BookOpen,
  Layers,
  FileText,
  ChartNoAxesColumnIncreasing,
  LucideIcon,
} from "lucide-react";

export type FeatureIconType = "roadmap" | "milestones" | "practice" | "progress";

interface FeatureItemProps {
  iconType: FeatureIconType;
  title: string;
  description?: string;
  compact?: boolean;
  className?: string;
}

const iconMap: Record<FeatureIconType, LucideIcon> = {
  roadmap: BookOpen,
  milestones: Layers,
  practice: FileText,
  progress: ChartNoAxesColumnIncreasing,
};

export const FeatureItem: React.FC<FeatureItemProps> = ({
  iconType,
  title,
  description,
  compact = false,
  className = "",
}) => {
  const IconComponent = iconMap[iconType] || BookOpen;

  return (
    <div
      className={`feature-item-card group flex items-start gap-3.5 transition-all duration-300 ${
        compact ? "py-1" : "py-1.5"
      } ${className}`}
    >
      <div className="flex-shrink-0 mt-0.5 text-[#54252C] transition-transform duration-300 group-hover:scale-110">
        <IconComponent
          size={compact ? 20 : 22}
          strokeWidth={1.75}
          className="text-[#54252C]"
          aria-hidden="true"
        />
      </div>

      <div className="flex flex-col">
        <h4 className="font-sans font-semibold text-[#292827] text-[0.95rem] sm:text-[1rem] leading-tight">
          {title}
        </h4>
        {description && (
          <p className="text-[0.82rem] sm:text-[0.85rem] text-[#292827]/75 font-normal mt-0.5 leading-snug">
            {description}
          </p>
        )}
      </div>
    </div>
  );
};
