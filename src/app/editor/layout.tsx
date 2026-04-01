// ============================================================
// FILE: src/app/editor/layout.tsx
// ============================================================

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Schema Editor",
  description:
    "Design database schemas visually with the drag-and-drop editor. Create tables, draw relationships, and export to SQL, Prisma, or Mongoose.",
  openGraph: {
    title: "Schema Editor — SchemaStudio",
    description:
      "Visual drag-and-drop database schema designer. Try it free — no sign-up required.",
  },
};

export default function EditorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}