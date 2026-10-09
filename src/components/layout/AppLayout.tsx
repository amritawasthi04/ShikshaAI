"use client";

import React, { useState } from "react";
import { AppNavbar } from "./AppNavbar";
import { AppSidebar } from "./AppSidebar";
import { PageTransition } from "@/components/effects/PageTransition";

interface AppLayoutProps {
  children: React.ReactNode;
  pageTitle?: string;
  pageSubtitle?: string;
  actionElement?: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  children,
  pageTitle,
  pageSubtitle,
  actionElement,
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-[#F6F1E9] text-[#292827] selection:bg-[#54252C]/15 selection:text-[#54252C]">
      {/* Top Navbar */}
      <AppNavbar
        onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
        isSidebarOpen={isSidebarOpen}
      />

      <div className="flex-1 flex w-full">
        {/* Sidebar */}
        <AppSidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col min-w-0 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          <PageTransition>
            {(pageTitle || actionElement) && (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-6 border-b border-[#D8C8BA]">
                <div>
                  {pageTitle && (
                    <h1 className="font-serif text-2xl sm:text-3xl text-[#292827] font-semibold tracking-tight">
                      {pageTitle}
                    </h1>
                  )}
                  {pageSubtitle && (
                    <p className="text-sm text-[#292827]/75 mt-1 font-sans">
                      {pageSubtitle}
                    </p>
                  )}
                </div>
                {actionElement && (
                  <div className="flex items-center gap-3">{actionElement}</div>
                )}
              </div>
            )}

            {children}
          </PageTransition>
        </main>
      </div>
    </div>
  );
};
