// ============================================================
// FILE: src/app/(auth)/login/layout.tsx
//
// Metadata wrapper for the login page.
// Required because page.tsx is a client component and
// cannot export metadata directly.
// ============================================================

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Log In",
  description:
    "Sign in to SchemaStudio to design database schemas, generate SQL, Prisma, and Mongoose code.",
  openGraph: {
    title: "Log In — SchemaStudio",
    description:
      "Sign in to your SchemaStudio account.",
  },
  robots: { index: false },
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}