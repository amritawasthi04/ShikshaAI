"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BrandLogo } from "@/components/BrandLogo";
import { authService, UserProfile } from "@/services/authService";
import {
  Menu,
  X,
  Search,
  Bell,
  User,
  Settings,
  LogOut,
  Sparkles,
  ChevronDown,
} from "lucide-react";

interface AppNavbarProps {
  onToggleSidebar?: () => void;
  isSidebarOpen?: boolean;
}

export const AppNavbar: React.FC<AppNavbarProps> = ({
  onToggleSidebar,
  isSidebarOpen,
}) => {
  const pathname = usePathname();
  const router = useRouter();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [user, setUser] = useState<UserProfile>(() => authService.getDefaultProfile());

  useEffect(() => {
    // Sync actual client-side saved user profile after hydration
    setUser(authService.getCurrentUser());

    const handleProfileUpdate = (e: CustomEvent<UserProfile>) => {
      if (e.detail) {
        setUser(e.detail);
      } else {
        setUser(authService.getCurrentUser());
      }
    };

    window.addEventListener("shiksha_profile_updated" as any, handleProfileUpdate);
    return () => {
      window.removeEventListener("shiksha_profile_updated" as any, handleProfileUpdate);
    };
  }, []);

  const getInitials = (name: string) => {
    if (!name) return "AS";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const handleSignOut = () => {
    authService.signOut();
    setIsProfileOpen(false);
    router.push("/signin");
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/explore?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-[#F6F1E9]/95 backdrop-blur-md border-b border-[#D8C8BA] transition-all">
      <div className="w-full px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left Corner: Mobile Menu Toggle & Brand Logo (Emblem + Shiksha Path + SI badge) */}
        <div className="flex items-center gap-3 flex-shrink-0">
          {onToggleSidebar && (
            <button
              type="button"
              onClick={onToggleSidebar}
              className="lg:hidden p-2 rounded-[6px] text-[#292827] hover:bg-[#D8C8BA]/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#54252C]"
              aria-label={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
            >
              {isSidebarOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          )}

          <BrandLogo size="default" showTagline={false} href="/dashboard" />
        </div>

        {/* Center: Search Bar (Visually Centered in Available Space) */}
        <div className="hidden md:flex flex-1 max-w-md lg:max-w-lg mx-auto justify-center px-4">
          <form onSubmit={handleSearchSubmit} className="relative w-full">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#292827]/50 pointer-events-none">
              <Search size={16} />
            </div>
            <input
              type="text"
              placeholder="Search roadmaps, topics, or skills..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#F6F1E9] text-[#292827] placeholder:text-[#292827]/45 text-[0.875rem] rounded-[8px] border border-[#D8C8BA] pl-10 pr-4 py-2 focus:outline-none focus:border-[#54252C] focus:ring-1 focus:ring-[#54252C] transition-colors shadow-2xs"
            />
          </form>
        </div>

        {/* Right Corner: Build Path Button + Notification Icon + Profile Avatar & Dropdown Arrow */}
        <div className="flex items-center justify-end gap-2.5 sm:gap-3 flex-shrink-0">
          {/* Quick Action "Build Path" CTA Button */}
          <Link
            href="/build-path"
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-[6px] bg-[#54252C] hover:bg-[#803F47] text-[#F6F1E9] text-xs sm:text-sm font-medium transition-colors shadow-2xs whitespace-nowrap"
          >
            <Sparkles size={14} className="text-[#D8C8BA]" />
            <span>Build Path</span>
          </Link>

          {/* Notifications Link */}
          <Link
            href="/settings?tab=notifications"
            className="relative p-2 rounded-[6px] text-[#292827]/80 hover:bg-[#D8C8BA]/30 hover:text-[#54252C] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#54252C]"
            aria-label="Notifications"
          >
            <Bell size={19} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#54252C]" />
          </Link>

          {/* User Profile Avatar & Dropdown Arrow */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsProfileOpen((prev) => !prev)}
              className="flex items-center gap-1.5 sm:gap-2 p-1 rounded-[6px] hover:bg-[#D8C8BA]/30 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#54252C] cursor-pointer"
              aria-label="User profile menu"
            >
              <div
                suppressHydrationWarning
                style={{ backgroundColor: user.avatarBgColor || "#54252C" }}
                className="w-8 h-8 rounded-full text-[#F6F1E9] flex items-center justify-center font-serif text-sm font-medium select-none shadow-2xs flex-shrink-0"
              >
                {getInitials(user.fullName)}
              </div>
              <ChevronDown
                size={14}
                className={`text-[#292827]/60 transition-transform duration-200 flex-shrink-0 ${
                  isProfileOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* Dropdown Menu */}
            {isProfileOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsProfileOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-56 bg-[#F6F1E9] border border-[#D8C8BA] rounded-[8px] shadow-lg py-1.5 z-50 divide-y divide-[#D8C8BA]/60">
                  <div className="px-4 py-2.5">
                    <p className="text-xs font-semibold text-[#54252C] uppercase tracking-wider">
                      Student Account
                    </p>
                    <p suppressHydrationWarning className="text-sm font-medium text-[#292827] truncate">
                      {user.fullName}
                    </p>
                    <p suppressHydrationWarning className="text-xs text-[#292827]/60 truncate">
                      {user.email}
                    </p>
                  </div>

                  <div className="py-1">
                    <Link
                      href="/profile"
                      onClick={() => setIsProfileOpen(false)}
                      className={`flex items-center gap-2.5 px-4 py-2 text-sm text-[#292827] hover:bg-[#D8C8BA]/40 transition-colors ${
                        pathname === "/profile" ? "font-semibold text-[#54252C]" : ""
                      }`}
                    >
                      <User size={16} />
                      <span>My Profile</span>
                    </Link>
                    <Link
                      href="/settings"
                      onClick={() => setIsProfileOpen(false)}
                      className={`flex items-center gap-2.5 px-4 py-2 text-sm text-[#292827] hover:bg-[#D8C8BA]/40 transition-colors ${
                        pathname === "/settings" ? "font-semibold text-[#54252C]" : ""
                      }`}
                    >
                      <Settings size={16} />
                      <span>Settings & Preferences</span>
                    </Link>
                  </div>

                  <div className="py-1">
                    <button
                      type="button"
                      onClick={handleSignOut}
                      className="w-full text-left flex items-center gap-2.5 px-4 py-2 text-sm text-[#803F47] hover:bg-[#D8C8BA]/40 transition-colors cursor-pointer"
                    >
                      <LogOut size={16} />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
