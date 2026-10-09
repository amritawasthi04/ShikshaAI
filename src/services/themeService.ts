"use client";

export type ThemeMode = "light" | "dark" | "system";

const THEME_STORAGE_KEY = "shiksha_theme_preference";

class ThemeService {
  /**
   * Get user theme preference ('light' | 'dark' | 'system'), defaulting to original 'light' theme
   */
  getThemePreference(): ThemeMode {
    if (typeof window === "undefined") return "light";
    try {
      const stored = localStorage.getItem(THEME_STORAGE_KEY);
      if (stored === "light" || stored === "dark" || stored === "system") {
        return stored;
      }
    } catch (e) {
      console.warn("Failed to read theme preference:", e);
    }
    return "light";
  }

  /**
   * Determine resolved active theme ('light' or 'dark') based on preference
   */
  getResolvedTheme(): "light" | "dark" {
    const preference = this.getThemePreference();
    if (preference === "dark") return "dark";
    return "light";
  }

  /**
   * Apply theme to the document and notify listeners
   */
  applyTheme(theme: ThemeMode): void {
    if (typeof window === "undefined") return;

    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch (e) {
      console.warn("Failed to save theme preference:", e);
    }

    const resolved = theme === "dark" ? "dark" : "light";
    const root = document.documentElement;
    if (resolved === "dark") {
      root.classList.add("dark");
      root.setAttribute("data-theme", "dark");
    } else {
      root.classList.remove("dark");
      root.setAttribute("data-theme", "light");
    }

    // Dispatch custom event for reactive UI components
    window.dispatchEvent(
      new CustomEvent("shiksha_theme_change", {
        detail: { theme, resolved },
      })
    );
  }

  /**
   * Initialize theme system
   */
  initTheme(): () => void {
    if (typeof window === "undefined") return () => {};
    const preference = this.getThemePreference();
    this.applyTheme(preference);
    return () => {};
  }
}

export const themeService = new ThemeService();
