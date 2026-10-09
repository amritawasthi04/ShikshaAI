import type { Metadata } from "next";
import { Inter, Playfair_Display, Caveat } from "next/font/google";
import "./globals.css";
import { ThemeInitializer } from "@/components/ThemeInitializer";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

const caveat = Caveat({
  variable: "--font-caveat",
  subsets: ["latin"],
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://shikshaai.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "ShikshaAI — Intelligent Adaptive Learning Roadmaps & AI Tutoring",
    template: "%s | ShikshaAI",
  },
  description:
    "ShikshaAI is an intelligent, personalized learning platform that creates adaptive technical roadmaps, milestone curriculum, AI tutoring, and real-time skill analytics.",
  keywords: [
    "ShikshaAI",
    "Shiksha Path",
    "AI Learning Platform",
    "Adaptive Roadmaps",
    "Personalized Learning",
    "Developer Curriculum",
    "Skill Analytics",
    "Interactive Learning",
    "AI Tutor",
    "Full-Stack Roadmap",
    "DSA Guide",
  ],
  authors: [{ name: "ShikshaAI Team" }],
  creator: "ShikshaAI",
  publisher: "ShikshaAI",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "ShikshaAI — Intelligent Adaptive Learning Roadmaps & AI Tutoring",
    description:
      "ShikshaAI is an intelligent, personalized learning platform that helps students learn through adaptive roadmaps, AI tutoring, practice exercises, assessments, and progress tracking.",
    url: "/",
    siteName: "ShikshaAI",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ShikshaAI — Intelligent Adaptive Learning Roadmaps",
    description:
      "AI-powered personalized learning platform that helps students learn through adaptive roadmaps, AI tutoring, practice exercises, and progress tracking.",
    creator: "@shikshaai",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${playfair.variable} ${caveat.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans bg-[#F6F1E9] text-[#292827] selection:bg-[#54252C]/15 selection:text-[#54252C]">
        <ThemeInitializer />
        {children}
      </body>
    </html>
  );
}
