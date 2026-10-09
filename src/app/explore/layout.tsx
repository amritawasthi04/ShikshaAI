import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Explore Roadmaps & Learning Tracks",
  description:
    "Explore curated technical roadmaps, full-stack web development curricula, machine learning tracks, DSA interview guides, and cloud DevOps resources on ShikshaAI.",
  alternates: {
    canonical: "/explore",
  },
  openGraph: {
    title: "Explore Roadmaps & Learning Tracks | ShikshaAI",
    description:
      "Explore curated technical roadmaps, full-stack web development curricula, machine learning tracks, DSA interview guides, and cloud DevOps resources on ShikshaAI.",
    url: "/explore",
    siteName: "ShikshaAI",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Explore Roadmaps & Learning Tracks | ShikshaAI",
    description:
      "Discover curated developer roadmaps, full-stack tracks, DSA guides, and AI curricula on ShikshaAI.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function ExploreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
