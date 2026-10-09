import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In",
  description:
    "Sign in to your ShikshaAI account to access your personalized learning dashboard, active roadmaps, and progress tracking.",
  alternates: {
    canonical: "/signin",
  },
  openGraph: {
    title: "Sign In | ShikshaAI",
    description:
      "Sign in to your ShikshaAI account to access your personalized learning dashboard, active roadmaps, and progress tracking.",
    url: "/signin",
    siteName: "ShikshaAI",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Sign In | ShikshaAI",
    description:
      "Sign in to your ShikshaAI account to access your personalized learning dashboard and roadmaps.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function SignInLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
