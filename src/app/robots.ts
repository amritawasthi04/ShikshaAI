import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://shikshaai.com";

  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/signin", "/signup", "/forgot-password", "/explore"],
      disallow: [
        "/dashboard",
        "/build-path",
        "/learning-path",
        "/progress",
        "/shiksha-bot",
        "/profile",
        "/settings",
        "/api/",
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
