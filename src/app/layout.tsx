// ============================================================
// FILE: src/app/layout.tsx
// 
// Changes: Added comprehensive Open Graph, Twitter Card,
// structured metadata, icons, manifest, and theme-color.
// ============================================================

import "./globals.css";
import { Suspense } from "react";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/components/auth-provider";
import { PostHogProvider } from "@/components/posthog-provider";
import type { Metadata, Viewport } from "next";

// ═══════════════════════════════════════════════════════════════
// Site-wide constants (reused across metadata fields)
// ═══════════════════════════════════════════════════════════════

const SITE_NAME = "SchemaStudio";
const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://schemastudio.dev";
const SITE_DESCRIPTION =
  "The visual database schema designer. Drag-and-drop tables, draw relationships, generate production-ready SQL, Prisma, and Mongoose code instantly.";
const OG_IMAGE = `${SITE_URL}/og-image.png`;

// ═══════════════════════════════════════════════════════════════
// Viewport (separated from metadata in Next.js 14+)
// ═══════════════════════════════════════════════════════════════

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#09090b" },
  ],
};

// ═══════════════════════════════════════════════════════════════
// Metadata
// ═══════════════════════════════════════════════════════════════

export const metadata: Metadata = {
  // ── Core ────────────────────────────────────────────────────
  title: {
    default: "SchemaStudio — Visual Database Schema Designer",
    template: "%s — SchemaStudio",
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: [
    "database schema designer",
    "visual database designer",
    "ERD tool",
    "entity relationship diagram",
    "SQL generator",
    "Prisma schema generator",
    "Mongoose schema generator",
    "database architect",
    "schema builder",
    "PostgreSQL",
    "MySQL",
    "SQLite",
    "drag and drop database",
    "AI database design",
  ],
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,

  // ── Canonical & Alternates ─────────────────────────────────
  metadataBase: new URL(SITE_URL),
  alternates: {
    canonical: "/",
  },

  // ── Open Graph ─────────────────────────────────────────────
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: "SchemaStudio — Visual Database Schema Designer",
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    locale: "en_US",
    images: [
      {
        url: OG_IMAGE,
        width: 1200,
        height: 630,
        alt: "SchemaStudio — Design your database, generate the code",
        type: "image/png",
      },
    ],
  },

  // ── Twitter Card ───────────────────────────────────────────
  twitter: {
    card: "summary_large_image",
    title: "SchemaStudio — Visual Database Schema Designer",
    description: SITE_DESCRIPTION,
    images: [OG_IMAGE],
    creator: "@schemastudio",
  },

  // ── Icons & Manifest ───────────────────────────────────────
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
  manifest: "/site.webmanifest",

  // ── Robots ─────────────────────────────────────────────────
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

  // ── Miscellaneous ──────────────────────────────────────────
  category: "developer tools",
};

// ═══════════════════════════════════════════════════════════════
// Root Layout
// ═══════════════════════════════════════════════════════════════

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased selection:bg-black selection:text-white dark:selection:bg-white dark:selection:text-black">
        <AuthProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <Suspense fallback={null}>
              <PostHogProvider>{children}</PostHogProvider>
            </Suspense>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}