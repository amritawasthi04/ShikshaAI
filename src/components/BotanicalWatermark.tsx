import React from "react";

interface BotanicalWatermarkProps {
  position?: "top-right" | "bottom-right" | "both";
  className?: string;
}

export const BotanicalWatermark: React.FC<BotanicalWatermarkProps> = ({
  position = "both",
  className = "",
}) => {
  const showTopRight = position === "top-right" || position === "both";
  const showBottomRight = position === "bottom-right" || position === "both";

  return (
    <>
      {/* Top-Right Botanical Watermark */}
      {showTopRight && (
        <div
          aria-hidden="true"
          className={`pointer-events-none absolute right-0 top-0 overflow-hidden select-none z-0 opacity-45 mix-blend-multiply ${className}`}
        >
          <svg
            width="220"
            height="220"
            viewBox="0 0 220 220"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="stroke-[#D8C8BA] translate-x-10 -translate-y-6 sm:translate-x-6 sm:-translate-y-4"
            strokeWidth="1.25"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {/* Top right branching botanical leaves */}
            <path d="M220 0C160 30 110 90 90 180" strokeWidth="1.5" />
            <path d="M90 180C110 130 150 90 190 70C160 50 120 70 90 120" />
            <path d="M140 50C100 80 80 130 90 170" />
            <path d="M170 20C140 50 130 90 140 130" />
            {/* Secondary sprig */}
            <path d="M220 0C180 60 150 140 160 210" strokeWidth="1.25" />
            <path d="M160 210C175 160 195 120 220 100" />
            <path d="M180 130C160 110 140 100 120 110C130 140 150 160 170 170" />
          </svg>
        </div>
      )}

      {/* Bottom-Right Botanical Watermark */}
      {showBottomRight && (
        <div
          aria-hidden="true"
          className={`pointer-events-none absolute right-0 bottom-0 overflow-hidden select-none z-0 opacity-45 mix-blend-multiply ${className}`}
        >
          <svg
            width="260"
            height="240"
            viewBox="0 0 260 240"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="stroke-[#D8C8BA] translate-x-10 translate-y-10 sm:translate-x-6 sm:translate-y-6"
            strokeWidth="1.25"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {/* Base branch */}
            <path d="M240 240C190 170 150 100 160 10" strokeWidth="1.5" />
            <path d="M160 10C120 40 100 90 120 140C130 165 160 190 190 210" />
            <path d="M170 60C140 80 120 120 135 160" />
            <path d="M180 110C160 130 150 160 160 190" />
            {/* Secondary fan leaf */}
            <path d="M240 240C160 220 90 160 70 70" strokeWidth="1.5" />
            <path d="M70 70C50 100 50 140 80 180C100 205 130 225 170 235" />
            <path d="M95 115C75 140 80 175 105 200" />
          </svg>
        </div>
      )}
    </>
  );
};
