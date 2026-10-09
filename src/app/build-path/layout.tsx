import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Build My Path — Adaptive Curriculum Creator",
  description:
    "Configure your target career role, experience level, known technologies, and study commitment to generate a custom, milestone-driven technical learning roadmap.",
  robots: {
    index: false,
    follow: false,
  },
  openGraph: {
    title: "Build My Path — Adaptive Curriculum Creator | ShikshaAI",
    description:
      "Generate a personalized, milestone-driven learning roadmap structured for your specific goals on ShikshaAI.",
    siteName: "ShikshaAI",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Build My Path | ShikshaAI",
    description: "Generate a personalized learning roadmap on ShikshaAI.",
  },
};

export default function BuildPathLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
