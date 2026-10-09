"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail } from "lucide-react";
import { AuthLayout } from "@/components/AuthLayout";
import { AuthCard } from "@/components/AuthCard";
import { FormInput } from "@/components/FormInput";
import { PasswordInput } from "@/components/PasswordInput";
import { CustomCheckbox } from "@/components/CustomCheckbox";
import { PrimaryButton } from "@/components/PrimaryButton";
import { StatusAlert } from "@/components/StatusAlert";
import { PageTransition } from "@/components/effects/PageTransition";
import { authService } from "@/services/authService";
import { SignInFormData } from "@/types/auth";

export default function SignInPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<SignInFormData>({
    email: "",
    password: "",
    rememberMe: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: "idle" | "success" | "error" | "info";
    text: string;
  }>({ type: "idle", text: "" });

  // Load remembered email on mount
  useEffect(() => {
    const remembered = authService.getRememberedEmail();
    if (remembered) {
      setFormData((prev) => ({
        ...prev,
        email: remembered,
        rememberMe: true,
      }));
    }
  }, []);

  const validate = (): boolean => {
    const nextErrors: Record<string, string> = {};

    if (!formData.email.trim()) {
      nextErrors.email = "Email address is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      nextErrors.email = "Please enter a valid email address.";
    }

    if (!formData.password) {
      nextErrors.password = "Password is required.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage({ type: "idle", text: "" });

    if (!validate()) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await authService.signIn(formData);
      if (response.success) {
        setStatusMessage({
          type: "success",
          text: "Signing in... Redirecting to dashboard.",
        });
        setTimeout(() => {
          router.push("/dashboard");
        }, 500);
      } else {
        if (response.errors) {
          setErrors(response.errors);
        }
        setStatusMessage({
          type: "error",
          text: response.message,
        });
      }
    } catch {
      setStatusMessage({
        type: "error",
        text: "An unexpected error occurred during sign in. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PageTransition>
      <AuthLayout variant="signin">
        <AuthCard
          eyebrow="WELCOME BACK"
          headingPrefix="Sign in"
          headingHighlight="to continue"
          description="your learning journey."
        >
          <StatusAlert
            status={statusMessage.type}
            message={statusMessage.text}
            onDismiss={() => setStatusMessage({ type: "idle", text: "" })}
          />

          <form onSubmit={handleSubmit} noValidate className="w-full">
            {/* Email Address */}
            <FormInput
              label="Email Address"
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              icon={Mail}
              value={formData.email}
              error={errors.email}
              onChange={(e) => {
                setFormData({ ...formData, email: e.target.value });
                if (errors.email) setErrors({ ...errors, email: "" });
              }}
              disabled={isLoading}
            />

            {/* Password */}
            <PasswordInput
              label="Password"
              id="password"
              name="password"
              autoComplete="current-password"
              placeholder="Enter your password"
              value={formData.password}
              error={errors.password}
              onChange={(e) => {
                setFormData({ ...formData, password: e.target.value });
                if (errors.password) setErrors({ ...errors, password: "" });
              }}
              disabled={isLoading}
            />

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between mt-1 mb-5">
              <CustomCheckbox
                id="rememberMe"
                label="Remember me"
                checked={formData.rememberMe}
                onChange={(checked) =>
                  setFormData({ ...formData, rememberMe: checked })
                }
                disabled={isLoading}
              />

              <Link
                href="/forgot-password"
                className="text-[0.875rem] font-medium text-[#292827]/80 hover:text-[#54252C] hover:underline transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-[#54252C] rounded-[2px]"
              >
                Forgot password?
              </Link>
            </div>

            {/* Primary Sign In CTA */}
            <div className="mt-2">
              <PrimaryButton type="submit" isLoading={isLoading}>
                Sign In
              </PrimaryButton>
            </div>

            {/* Subtle Divider */}
            <div className="flex items-center gap-3 my-5">
              <div className="flex-1 h-[1px] bg-[#D8C8BA]" />
              <span className="text-xs text-[#292827]/50 font-medium">or</span>
              <div className="flex-1 h-[1px] bg-[#D8C8BA]" />
            </div>

            {/* Create Account Link */}
            <div className="text-center">
              <p className="text-[0.875rem] text-[#292827]/80">
                New to Shiksha Path SI?{" "}
                <Link
                  href="/signup"
                  className="font-semibold text-[#54252C] hover:text-[#803F47] hover:underline transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-[#54252C] rounded-[2px]"
                >
                  Create account
                </Link>
              </p>
            </div>
          </form>
        </AuthCard>
      </AuthLayout>
    </PageTransition>
  );
}
