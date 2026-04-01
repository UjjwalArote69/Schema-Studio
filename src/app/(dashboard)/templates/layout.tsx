// ============================================================
// FILE: src/app/(dashboard)/templates/layout.tsx
// ============================================================

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Templates",
  description:
    "Browse 11 pre-built database schema templates for SaaS, e-commerce, social networks, healthcare, CRM, and more. Clone and customize instantly.",
  openGraph: {
    title: "Schema Templates — SchemaStudio",
    description:
      "Pre-built database schema templates for common architectures. Clone and customize instantly.",
  },
  robots: { index: false },
};

export default function TemplatesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}