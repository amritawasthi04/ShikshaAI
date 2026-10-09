"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { UserRound, Mail } from "lucide-react";
import { AuthLayout } from "@/components/AuthLayout";
import { AuthCard } from "@/components/AuthCard";
import { FormInput } from "@/components/FormInput";
import { PasswordInput } from "@/components/PasswordInput";
import { PrimaryButton } from "@/components/PrimaryButton";
import { StatusAlert } from "@/components/StatusAlert";
import { PageTransition } from "@/components/effects/PageTransition";
import { authService } from "@/services/authService";
import { SignUpFormData } from "@/types/auth";

export default function SignUpPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<SignUpFormData>({
    fullName: "",
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: "idle" | "success" | "error" | "info";
    text: string;
  }>({ type: "idle", text: "" });

  const validate = (): boolean => {
    const nextErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) {
      nextErrors.fullName = "Full name is required.";
    } else if (formData.fullName.trim().length < 2) {
      nextErrors.fullName = "Please enter your full name (at least 2 characters).";
    }

    if (!formData.email.trim()) {
      nextErrors.email = "Email address is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      nextErrors.email = "Please enter a valid email address.";
    }

    if (!formData.password) {
      nextErrors.password = "Password is required.";
    } else if (formData.password.length < 8) {
      nextErrors.password = "Password must be at least 8 characters.";
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
      const response = await authService.signUp(formData);
      if (response.success) {
        setStatusMessage({
          type: "success",
          text: "Account created! Redirecting to path builder.",
        });
        setTimeout(() => {
          router.push("/build-path");
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
        text: "An unexpected error occurred during signup. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PageTransition>
      <AuthLayout variant="signup">
        <AuthCard
          eyebrow="CREATE YOUR ACCOUNT"
          headingPrefix="Begin"
          headingHighlight="your journey"
          description="Create your account and take the next step towards your learning goals."
          showBackButton={true}
          backHref="/signin"
        >
          <StatusAlert
            status={statusMessage.type}
            message={statusMessage.text}
            onDismiss={() => setStatusMessage({ type: "idle", text: "" })}
          />

          <form onSubmit={handleSubmit} noValidate className="w-full">
            {/* Full Name */}
            <FormInput
              label="Full Name"
              id="fullName"
              name="name"
              type="text"
              autoComplete="name"
              placeholder="Enter your full name"
              icon={UserRound}
              value={formData.fullName}
              error={errors.fullName}
              onChange={(e) => {
                setFormData({ ...formData, fullName: e.target.value });
                if (errors.fullName) setErrors({ ...errors, fullName: "" });
              }}
              disabled={isLoading}
            />

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
              autoComplete="new-password"
              placeholder="Create a strong password"
              helperText="Use at least 8 characters with a mix of letters, numbers and symbols."
              value={formData.password}
              error={errors.password}
              onChange={(e) => {
                setFormData({ ...formData, password: e.target.value });
                if (errors.password) setErrors({ ...errors, password: "" });
              }}
              disabled={isLoading}
            />

            {/* Primary Submit CTA */}
            <div className="mt-5">
              <PrimaryButton type="submit" isLoading={isLoading}>
                Create Account
              </PrimaryButton>
            </div>

            {/* Subtle Divider */}
            <div className="flex items-center gap-3 my-5">
              <div className="flex-1 h-[1px] bg-[#D8C8BA]" />
              <span className="text-xs text-[#292827]/50 font-medium">or</span>
              <div className="flex-1 h-[1px] bg-[#D8C8BA]" />
            </div>

            {/* Sign In Navigation Link */}
            <div className="text-center">
              <p className="text-[0.875rem] text-[#292827]/80">
                Already have an account?{" "}
                <Link
                  href="/signin"
                  className="font-semibold text-[#54252C] hover:text-[#803F47] hover:underline transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-[#54252C] rounded-[2px]"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </form>
        </AuthCard>
      </AuthLayout>
    </PageTransition>
  );
}
