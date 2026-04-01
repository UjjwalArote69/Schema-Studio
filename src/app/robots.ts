// ============================================================
// FILE: src/app/robots.ts
//
// Generates /robots.txt via the Next.js Metadata API.
// ============================================================

import type { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://schemastudio.dev";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/dashboard/",
          "/settings/",
          "/editor/",
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}