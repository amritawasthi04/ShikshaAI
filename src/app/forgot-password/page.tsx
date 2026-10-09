"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Mail, ArrowLeft } from "lucide-react";
import { AuthLayout } from "@/components/AuthLayout";
import { AuthCard } from "@/components/AuthCard";
import { FormInput } from "@/components/FormInput";
import { PrimaryButton } from "@/components/PrimaryButton";
import { StatusAlert } from "@/components/StatusAlert";
import { PageTransition } from "@/components/effects/PageTransition";
import { authService } from "@/services/authService";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: "idle" | "success" | "error" | "info";
    text: string;
  }>({ type: "idle", text: "" });

  const validate = (): boolean => {
    if (!email.trim()) {
      setError("Email address is required.");
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Please enter a valid email address.");
      return false;
    }
    setError("");
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage({ type: "idle", text: "" });

    if (!validate()) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await authService.requestPasswordReset({ email });
      if (response.success) {
        setStatusMessage({
          type: "success",
          text: response.message,
        });
      } else {
        setStatusMessage({
          type: "error",
          text: response.message,
        });
      }
    } catch {
      setStatusMessage({
        type: "error",
        text: "Unable to process password reset. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PageTransition>
      <AuthLayout variant="forgot-password">
        <AuthCard
          eyebrow="RECOVER ACCOUNT"
          headingPrefix="Reset"
          headingHighlight="your password"
          description="Enter your registered email address and we'll send you instructions to regain access."
          showBackButton={true}
          backHref="/signin"
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
              value={email}
              error={error}
              onChange={(e) => {
                setEmail(e.target.value);
                if (error) setError("");
              }}
              disabled={isLoading}
            />

            {/* Submit Button */}
            <div className="mt-5">
              <PrimaryButton type="submit" isLoading={isLoading}>
                Send Reset Link
              </PrimaryButton>
            </div>

            {/* Back to Sign In */}
            <div className="text-center mt-7">
              <Link
                href="/signin"
                className="inline-flex items-center gap-2 text-[0.875rem] font-medium text-[#292827]/80 hover:text-[#54252C] transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-[#54252C] rounded-[2px]"
              >
                <ArrowLeft size={16} strokeWidth={1.75} />
                <span>
                  Remember your password?{" "}
                  <strong className="font-semibold text-[#54252C] hover:text-[#803F47] hover:underline">
                    Sign in
                  </strong>
                </span>
              </Link>
            </div>
          </form>
        </AuthCard>
      </AuthLayout>
    </PageTransition>
  );
}
