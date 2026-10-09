import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Interactive Learning Path",
  description:
    "Access your customized technical curriculum phases, interactive lessons, hands-on coding exercises, and milestone assessments on ShikshaAI.",
  robots: {
    index: false,
    follow: false,
  },
  openGraph: {
    title: "Interactive Learning Path | ShikshaAI",
    description:
      "Structured curriculum phases, adaptive milestones, and interactive lesson content on ShikshaAI.",
    siteName: "ShikshaAI",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Interactive Learning Path | ShikshaAI",
    description:
      "Structured technical curriculum, adaptive milestones, and interactive lessons.",
  },
};

export default function LearningPathLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
