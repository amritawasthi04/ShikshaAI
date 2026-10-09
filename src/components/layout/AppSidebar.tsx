"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Route,
  Compass,
  TrendingUp,
  Sparkles,
  User,
  Settings,
  BookOpen,
  Bot,
} from "lucide-react";

interface AppSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navItems = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Learning Path",
    href: "/learning-path",
    icon: Route,
  },
  {
    label: "Explore",
    href: "/explore",
    icon: Compass,
  },
  {
    label: "Progress",
    href: "/progress",
    icon: TrendingUp,
  },
  {
    label: "Build My Path",
    href: "/build-path",
    icon: Sparkles,
  },
  {
    label: "Shiksha Bot",
    href: "/shiksha-bot",
    icon: Bot,
  },
];

const secondaryNavItems = [
  {
    label: "Profile",
    href: "/profile",
    icon: User,
  },
  {
    label: "Settings",
    href: "/settings",
    icon: Settings,
  },
];

export const AppSidebar: React.FC<AppSidebarProps> = ({ isOpen, onClose }) => {
  const pathname = usePathname();

  const isLinkActive = (href: string) => {
    if (href === "/dashboard" && pathname === "/dashboard") return true;
    if (href !== "/dashboard" && pathname.startsWith(href)) return true;
    return false;
  };

  const navContent = (
    <div className="flex flex-col h-full justify-between py-6 px-4">
      {/* Primary Navigation */}
      <div className="flex flex-col space-y-1">
        <div className="px-3 pb-2 text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-[#292827]/50 select-none">
          Learning
        </div>
        {navItems.map((item) => {
          const active = isLinkActive(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-[8px] text-sm font-medium transition-all duration-200 ${
                active
                  ? "bg-[#54252C] text-[#F6F1E9] shadow-xs"
                  : "text-[#292827]/85 hover:bg-[#D8C8BA]/40 hover:text-[#54252C]"
              }`}
            >
              <Icon
                size={18}
                strokeWidth={active ? 2.2 : 1.75}
                className={active ? "text-[#F6F1E9]" : "text-[#292827]/70"}
              />
              <span>{item.label}</span>
            </Link>
          );
        })}

        {/* Secondary Navigation */}
        <div className="pt-6 px-3 pb-2 text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-[#292827]/50 select-none">
          Account
        </div>
        {secondaryNavItems.map((item) => {
          const active = isLinkActive(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-[8px] text-sm font-medium transition-all duration-200 ${
                active
                  ? "bg-[#54252C] text-[#F6F1E9] shadow-xs"
                  : "text-[#292827]/85 hover:bg-[#D8C8BA]/40 hover:text-[#54252C]"
              }`}
            >
              <Icon
                size={18}
                strokeWidth={active ? 2.2 : 1.75}
                className={active ? "text-[#F6F1E9]" : "text-[#292827]/70"}
              />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>

      {/* Bottom Study Motivation Card */}
      <div className="pt-6">
        <div className="bg-[#F6F1E9] border border-[#D8C8BA] rounded-[8px] p-3.5 text-center select-none shadow-2xs">
          <div className="w-7 h-7 mx-auto mb-2 rounded-full bg-[#54252C]/10 flex items-center justify-center text-[#54252C]">
            <BookOpen size={15} />
          </div>
          <p className="font-handwriting text-lg text-[#54252C] leading-none mb-1">
            A Better You Everyday
          </p>
          <p className="text-[0.72rem] text-[#292827]/70">
            Keep your daily learning momentum going.
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-[#F6F1E9] border-r border-[#D8C8BA] min-h-[calc(100vh-4rem)] flex-shrink-0">
        {navContent}
      </aside>

      {/* Mobile Drawer Backdrop & Sliding Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-[#292827]/40 backdrop-blur-xs transition-opacity"
            onClick={onClose}
            aria-hidden="true"
          />
          <div className="fixed inset-y-0 left-0 w-72 max-w-[80vw] bg-[#F6F1E9] border-r border-[#D8C8BA] shadow-2xl z-50 overflow-y-auto">
            {navContent}
          </div>
        </div>
      )}
    </>
  );
};
