// ============================================================
// FILE: src/app/(auth)/register/layout.tsx
// ============================================================

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign Up",
  description:
    "Create a free SchemaStudio account. Design database schemas visually and export production-ready code.",
  openGraph: {
    title: "Sign Up — SchemaStudio",
    description:
      "Create a free account and start designing database schemas visually.",
  },
};

export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}