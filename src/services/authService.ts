import { SignUpFormData, SignInFormData, ForgotPasswordFormData, AuthResponse } from "@/types/auth";
import { ThemeMode } from "./themeService";

export interface UserLearningPreferences {
  targetGoal: string;
  experienceLevel: "beginner" | "intermediate" | "advanced";
  knownSkills: string[];
  learningStyle: "balanced" | "hands-on" | "visual" | "reading" | "project-driven";
  studyPace: "relaxed" | "recommended" | "intensive";
  weeklyTargetHours: number;
  roadmapMode: "sequential" | "open";
}

export interface UserNotificationPreferences {
  emailDigest: boolean;
  milestoneReminders: boolean;
  streakAlerts: boolean;
  weeklyProgressReport: boolean;
}

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  avatarPreset: "initials" | "botanical" | "geometric" | "scholar" | "astronomer";
  avatarBgColor?: string;
  bio: string;
  streakDays: number;
  createdAt: string;
  learningPreferences: UserLearningPreferences;
  notifications: UserNotificationPreferences;
  themePreference: ThemeMode;
}

const DEFAULT_USER_PROFILE: UserProfile = {
  id: "usr_student_1",
  fullName: "Aarav Sharma",
  email: "aarav.sharma@example.com",
  avatarPreset: "initials",
  avatarBgColor: "#54252C",
  bio: "Software engineer aspiring to build scalable, full-stack web applications and distributed systems.",
  streakDays: 12,
  createdAt: "2026-09-01T00:00:00.000Z",
  learningPreferences: {
    targetGoal: "Full-Stack Web Engineering",
    experienceLevel: "intermediate",
    knownSkills: ["JavaScript", "TypeScript", "React", "HTML/CSS", "Git"],
    learningStyle: "hands-on",
    studyPace: "recommended",
    weeklyTargetHours: 10,
    roadmapMode: "sequential",
  },
  notifications: {
    emailDigest: true,
    milestoneReminders: true,
    streakAlerts: true,
    weeklyProgressReport: true,
  },
  themePreference: "light",
};

class AuthService {
  private readonly REMEMBER_KEY = "shiksha_remembered_email";
  private readonly USER_KEY = "shiksha_user_profile";
  private readonly AUTH_TOKEN_KEY = "shiksha_auth_token";

  /**
   * Get current student user profile
   */
  getCurrentUser(): UserProfile {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(this.USER_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          // Merge with defaults to ensure all fields are populated
          return {
            ...DEFAULT_USER_PROFILE,
            ...parsed,
            learningPreferences: {
              ...DEFAULT_USER_PROFILE.learningPreferences,
              ...(parsed.learningPreferences || {}),
            },
            notifications: {
              ...DEFAULT_USER_PROFILE.notifications,
              ...(parsed.notifications || {}),
            },
          };
        }
      } catch (e) {
        console.warn("Failed to load user profile:", e);
      }
    }

    return { ...DEFAULT_USER_PROFILE };
  }

  /**
   * Update student user profile
   */
  updateUserProfile(partial: Partial<UserProfile>): UserProfile {
    const current = this.getCurrentUser();
    const updated: UserProfile = {
      ...current,
      ...partial,
      learningPreferences: {
        ...current.learningPreferences,
        ...(partial.learningPreferences || {}),
      },
      notifications: {
        ...current.notifications,
        ...(partial.notifications || {}),
      },
    };

    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(this.USER_KEY, JSON.stringify(updated));
        // Dispatch window event so all UI components update synchronously
        window.dispatchEvent(
          new CustomEvent("shiksha_profile_updated", { detail: updated })
        );
      } catch (e) {
        console.warn("Failed to save user profile:", e);
      }
    }
    return updated;
  }

  /**
   * Update specific learning preferences
   */
  updateLearningPreferences(prefs: Partial<UserLearningPreferences>): UserProfile {
    const current = this.getCurrentUser();
    return this.updateUserProfile({
      learningPreferences: {
        ...current.learningPreferences,
        ...prefs,
      },
    });
  }

  /**
   * Update notification preferences
   */
  updateNotificationPreferences(prefs: Partial<UserNotificationPreferences>): UserProfile {
    const current = this.getCurrentUser();
    return this.updateUserProfile({
      notifications: {
        ...current.notifications,
        ...prefs,
      },
    });
  }

  /**
   * Register a new student account
   */
  async signUp(data: SignUpFormData): Promise<AuthResponse> {
    await new Promise((resolve) => setTimeout(resolve, 800));

    const errors: Record<string, string> = {};
    if (!data.fullName || data.fullName.trim().length < 2) {
      errors.fullName = "Please enter your full name (at least 2 characters).";
    }
    if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      errors.email = "Please enter a valid email address.";
    }
    if (!data.password || data.password.length < 8) {
      errors.password = "Password must be at least 8 characters.";
    }

    if (Object.keys(errors).length > 0) {
      return {
        success: false,
        message: "Please correct the highlighted errors.",
        errors,
      };
    }

    const newUser: UserProfile = {
      ...DEFAULT_USER_PROFILE,
      id: "usr_" + Math.random().toString(36).substring(2, 9),
      fullName: data.fullName.trim(),
      email: data.email.trim(),
      streakDays: 1,
      createdAt: new Date().toISOString(),
    };

    if (typeof window !== "undefined") {
      localStorage.setItem(this.USER_KEY, JSON.stringify(newUser));
      localStorage.setItem(this.AUTH_TOKEN_KEY, "jwt_active_session");
      window.dispatchEvent(
        new CustomEvent("shiksha_profile_updated", { detail: newUser })
      );
    }

    return {
      success: true,
      message: "Account created successfully! Welcome to ShikshaAI.",
      user: newUser,
      token: "jwt_token_" + Date.now(),
    };
  }

  /**
   * Authenticate existing student
   */
  async signIn(data: SignInFormData): Promise<AuthResponse> {
    await new Promise((resolve) => setTimeout(resolve, 750));

    const errors: Record<string, string> = {};
    if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      errors.email = "Please enter a valid email address.";
    }
    if (!data.password || data.password.length === 0) {
      errors.password = "Please enter your password.";
    }

    if (Object.keys(errors).length > 0) {
      return {
        success: false,
        message: "Please correct the highlighted errors.",
        errors,
      };
    }

    const nameFromEmail = data.email.split("@")[0].replace(/[._]/g, " ");
    const formattedName = nameFromEmail
      .split(" ")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");

    const current = this.getCurrentUser();
    const loggedUser: UserProfile = {
      ...current,
      id: current.id || "usr_" + Math.random().toString(36).substring(2, 9),
      fullName: formattedName || current.fullName || "Aarav Sharma",
      email: data.email,
      streakDays: current.streakDays || 12,
    };

    if (typeof window !== "undefined") {
      localStorage.setItem(this.USER_KEY, JSON.stringify(loggedUser));
      localStorage.setItem(this.AUTH_TOKEN_KEY, "jwt_active_session");
      if (data.rememberMe) {
        localStorage.setItem(this.REMEMBER_KEY, data.email);
      } else {
        localStorage.removeItem(this.REMEMBER_KEY);
      }
      window.dispatchEvent(
        new CustomEvent("shiksha_profile_updated", { detail: loggedUser })
      );
    }

    return {
      success: true,
      message: "Signed in successfully!",
      user: loggedUser,
      token: "jwt_token_" + Date.now(),
    };
  }

  /**
   * Send password reset email
   */
  async requestPasswordReset(data: ForgotPasswordFormData): Promise<AuthResponse> {
    await new Promise((resolve) => setTimeout(resolve, 700));

    const errors: Record<string, string> = {};
    if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      errors.email = "Please enter a valid email address.";
      return {
        success: false,
        message: "Please enter a valid email address.",
        errors,
      };
    }

    return {
      success: true,
      message: `Password reset instructions have been sent to ${data.email}.`,
    };
  }

  /**
   * Retrieve remembered email if stored
   */
  getRememberedEmail(): string {
    if (typeof window !== "undefined") {
      return localStorage.getItem(this.REMEMBER_KEY) || "";
    }
    return "";
  }

  /**
   * Sign out current student user and clear session tokens
   */
  signOut(): void {
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem(this.AUTH_TOKEN_KEY);
      } catch (e) {
        console.warn("Failed to clear session token:", e);
      }
    }
  }

  /**
   * Reset learning roadmap data (Destructive action)
   */
  resetLearningRoadmap(): void {
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem("shiksha_active_roadmap");
        localStorage.removeItem("shiksha_build_path_draft");
        window.dispatchEvent(new CustomEvent("shiksha_roadmap_reset"));
      } catch (e) {
        console.warn("Failed to reset roadmap data:", e);
      }
    }
  }

  /**
   * Reset entire account and restore fresh state (Destructive action)
   */
  resetAccountData(): void {
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem(this.USER_KEY);
        localStorage.removeItem("shiksha_active_roadmap");
        localStorage.removeItem("shiksha_build_path_draft");
        localStorage.removeItem("shiksha_theme_preference");
        window.dispatchEvent(new CustomEvent("shiksha_profile_updated", { detail: DEFAULT_USER_PROFILE }));
      } catch (e) {
        console.warn("Failed to reset account data:", e);
      }
    }
  }
}

export const authService = new AuthService();
