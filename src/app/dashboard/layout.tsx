import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Student Dashboard",
  description:
    "Track your active learning roadmaps, daily study streak, next recommended lesson milestones, and overall completion velocity on ShikshaAI.",
  robots: {
    index: false,
    follow: false,
  },
  openGraph: {
    title: "Student Dashboard | ShikshaAI",
    description:
      "Track your active learning roadmaps, daily study streak, and milestone progress on ShikshaAI.",
    siteName: "ShikshaAI",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Student Dashboard | ShikshaAI",
    description: "View your active learning tracks and progress metrics on ShikshaAI.",
  },
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
