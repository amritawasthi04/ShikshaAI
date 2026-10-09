import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Account Settings",
  description:
    "Configure your notification preferences, theme appearance, account security, and data management on ShikshaAI.",
  robots: {
    index: false,
    follow: false,
  },
  openGraph: {
    title: "Account Settings | ShikshaAI",
    description:
      "Configure your notification preferences, theme appearance, and security on ShikshaAI.",
    siteName: "ShikshaAI",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Account Settings | ShikshaAI",
    description: "Configure your account settings and preferences on ShikshaAI.",
  },
};

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
