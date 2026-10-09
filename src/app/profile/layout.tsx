import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Student Profile",
  description:
    "Manage your personal student details, target career role, learning preferences, and technical background on ShikshaAI.",
  robots: {
    index: false,
    follow: false,
  },
  openGraph: {
    title: "Student Profile | ShikshaAI",
    description:
      "Manage your personal student details and learning preferences on ShikshaAI.",
    siteName: "ShikshaAI",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Student Profile | ShikshaAI",
    description: "Manage your student profile and career goals on ShikshaAI.",
  },
};

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
