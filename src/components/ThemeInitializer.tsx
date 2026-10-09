"use client";

import { useEffect } from "react";
import { themeService } from "@/services/themeService";

export function ThemeInitializer() {
  useEffect(() => {
    // Ensure clean light theme by default
    document.documentElement.classList.remove("dark");
    document.documentElement.setAttribute("data-theme", "light");
    const cleanup = themeService.initTheme();
    return () => {
      if (cleanup) cleanup();
    };
  }, []);

  return null;
}
