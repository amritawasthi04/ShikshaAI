import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Forgot Password",
  description:
    "Reset your ShikshaAI account password securely to regain access to your personalized learning paths and progress history.",
  alternates: {
    canonical: "/forgot-password",
  },
  openGraph: {
    title: "Forgot Password | ShikshaAI",
    description:
      "Reset your ShikshaAI account password securely to regain access to your personalized learning paths and progress history.",
    url: "/forgot-password",
    siteName: "ShikshaAI",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Forgot Password | ShikshaAI",
    description:
      "Reset your ShikshaAI account password securely to regain access to your learning paths.",
  },
  robots: {
    index: false,
    follow: true,
  },
};

export default function ForgotPasswordLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
