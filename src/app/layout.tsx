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

export const metadata: Metadata = {
  title: "Shiksha Path SI — Your Learning Journey, Guided by AI",
  description:
    "AI-powered personalized learning platform that helps students learn through adaptive roadmaps, AI tutoring, practice exercises, assessments, and progress tracking.",
  keywords: [
    "Shiksha Path SI",
    "AI tutor",
    "personalized roadmaps",
    "adaptive learning",
    "learning platform",
  ],
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
