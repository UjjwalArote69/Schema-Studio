// ============================================================
// FILE: src/app/(auth)/forgot-password/layout.tsx
// ============================================================

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Forgot Password",
  description: "Reset your SchemaStudio account password.",
  robots: { index: false },
};

export default function ForgotPasswordLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}