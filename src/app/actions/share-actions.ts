// ============================================================
// FILE: src/app/actions/share-actions.ts
//
// Server actions for public schema sharing.
// Generates a unique share token that creates a public read-only
// URL for viewing a schema without authentication.
// ============================================================

"use server";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

// ═══════════════════════════════════════════════════════════════
// Helper — verify ownership
// ═══════════════════════════════════════════════════════════════

async function requireOwnedProject(projectId: string) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId) throw new Error("Unauthorized");

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { id: true, userId: true, shareToken: true },
  });

  if (!project || project.userId !== userId) {
    throw new Error("Unauthorized");
  }

  return { userId, project };
}

// ═══════════════════════════════════════════════════════════════
// Enable sharing — generates a unique token
// ═══════════════════════════════════════════════════════════════

export async function enableSharing(
  projectId: string
): Promise<{ shareToken: string }> {
  const { project } = await requireOwnedProject(projectId);

  // If already shared, return existing token
  if (project.shareToken) {
    return { shareToken: project.shareToken };
  }

  // Generate a URL-safe token (22 chars, ~131 bits of entropy)
  const shareToken = crypto.randomBytes(16).toString("base64url");

  await prisma.project.update({
    where: { id: projectId },
    data: { shareToken },
  });

  return { shareToken };
}

// ═══════════════════════════════════════════════════════════════
// Disable sharing — removes the token
// ═══════════════════════════════════════════════════════════════

export async function disableSharing(projectId: string): Promise<void> {
  await requireOwnedProject(projectId);

  await prisma.project.update({
    where: { id: projectId },
    data: { shareToken: null },
  });
}

// ═══════════════════════════════════════════════════════════════
// Regenerate token — invalidates old link, creates new one
// ═══════════════════════════════════════════════════════════════

export async function regenerateShareToken(
  projectId: string
): Promise<{ shareToken: string }> {
  await requireOwnedProject(projectId);

  const shareToken = crypto.randomBytes(16).toString("base64url");

  await prisma.project.update({
    where: { id: projectId },
    data: { shareToken },
  });

  return { shareToken };
}

// ═══════════════════════════════════════════════════════════════
// Get share status for a project (used by the share modal)
// ═══════════════════════════════════════════════════════════════

export async function getShareStatus(
  projectId: string
): Promise<{ isShared: boolean; shareToken: string | null }> {
  const { project } = await requireOwnedProject(projectId);

  return {
    isShared: !!project.shareToken,
    shareToken: project.shareToken,
  };
}

// ═══════════════════════════════════════════════════════════════
// Fetch shared schema by token (public — no auth required)
// ═══════════════════════════════════════════════════════════════

export async function getSharedSchema(shareToken: string) {
  if (!shareToken || typeof shareToken !== "string") {
    return null;
  }

  const project = await prisma.project.findUnique({
    where: { shareToken },
    select: {
      id: true,
      name: true,
      data: true,
      updatedAt: true,
      user: {
        select: {
          name: true,
        },
      },
    },
  });

  if (!project) return null;

  return {
    name: project.name,
    data: project.data as { tables?: unknown[]; relations?: unknown[] } | null,
    updatedAt: project.updatedAt.toISOString(),
    authorName: project.user.name || "Anonymous",
  };
}