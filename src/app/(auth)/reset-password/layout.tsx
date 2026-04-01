// ============================================================
// FILE: src/app/(auth)/reset-password/layout.tsx
// ============================================================

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reset Password",
  description: "Set a new password for your SchemaStudio account.",
  robots: { index: false },
};

export default function ResetPasswordLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}