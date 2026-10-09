import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign Up & Start Learning",
  description:
    "Create your free ShikshaAI account to generate custom technical roadmaps, track daily study streaks, and learn with an adaptive AI tutor.",
  alternates: {
    canonical: "/signup",
  },
  openGraph: {
    title: "Sign Up & Start Learning | ShikshaAI",
    description:
      "Create your free ShikshaAI account to generate custom technical roadmaps, track daily study streaks, and learn with an adaptive AI tutor.",
    url: "/signup",
    siteName: "ShikshaAI",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Sign Up & Start Learning | ShikshaAI",
    description:
      "Create your free ShikshaAI account to generate custom technical roadmaps and learn with an adaptive AI tutor.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function SignUpLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
