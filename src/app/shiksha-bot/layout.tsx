import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shiksha Bot — AI Learning Assistant",
  description:
    "Interactive AI tutoring assistant for instant conceptual explanations, code debugging, study plan advice, and topic quizzes on ShikshaAI.",
  robots: {
    index: false,
    follow: false,
  },
  openGraph: {
    title: "Shiksha Bot — AI Learning Assistant | ShikshaAI",
    description:
      "Interactive AI tutoring assistant for instant conceptual explanations, code debugging, study plan advice, and topic quizzes on ShikshaAI.",
    siteName: "ShikshaAI",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Shiksha Bot — AI Learning Assistant | ShikshaAI",
    description:
      "Your personalized AI tutor and study companion on ShikshaAI.",
  },
};

export default function ShikshaBotLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
