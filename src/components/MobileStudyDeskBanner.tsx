"use client";

import React from "react";
import Image from "next/image";

export const MobileStudyDeskBanner: React.FC<{ className?: string }> = ({
  className = "",
}) => {
  return (
    <div
      className={`relative w-full h-44 sm:h-52 mt-6 rounded-[8px] overflow-hidden border border-[#D8C8BA]/60 shadow-xs pointer-events-none select-none ${className}`}
    >
      {/* Background study desk photograph */}
      <Image
        src="/images/study-workspace.jpg"
        alt="Sunlit study desk with stacked books and coffee mug"
        fill
        sizes="(max-width: 1024px) 100vw, 420px"
        className="object-cover object-bottom"
        priority
      />

      {/* Top gradient blend */}
      <div className="absolute inset-0 bg-gradient-to-t from-transparent via-[#F6F1E9]/10 to-[#F6F1E9]/40" />

      {/* Bottom-left curved overlay with handwritten "A Better You Everyday" */}
      <div className="absolute left-0 bottom-0 p-4 bg-gradient-to-tr from-[#54252C]/90 via-[#54252C]/75 to-transparent pr-8 pt-6 rounded-tr-3xl">
        <div className="flex flex-col text-[#F6F1E9] leading-tight">
          <span className="font-handwriting text-xl sm:text-2xl font-normal drop-shadow-xs">
            A
          </span>
          <span className="font-handwriting text-xl sm:text-2xl font-normal -mt-1 drop-shadow-xs">
            Better
          </span>
          <span className="font-handwriting text-xl sm:text-2xl font-normal -mt-1 drop-shadow-xs">
            You
          </span>
          <span className="font-handwriting text-xl sm:text-2xl font-normal -mt-1 drop-shadow-xs">
            Everyday
          </span>
          <div className="w-8 h-[1px] bg-[#F6F1E9]/80 mt-1" />
        </div>
      </div>
    </div>
  );
};
