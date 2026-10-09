import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Progress & Skill Analytics",
  description:
    "Comprehensive insights into your learning velocity, weekly study hours, competency mastery scores, and milestone completion history on ShikshaAI.",
  robots: {
    index: false,
    follow: false,
  },
  openGraph: {
    title: "Progress & Skill Analytics | ShikshaAI",
    description:
      "Comprehensive insights into your learning velocity, weekly study hours, and competency mastery scores on ShikshaAI.",
    siteName: "ShikshaAI",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Progress & Skill Analytics | ShikshaAI",
    description:
      "Real-time metrics, weekly study analytics, and skill mastery insights on ShikshaAI.",
  },
};

export default function ProgressLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
