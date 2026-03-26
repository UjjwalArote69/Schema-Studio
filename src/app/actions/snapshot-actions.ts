"use server";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const MAX_SNAPSHOTS_PER_PROJECT = 30;
const MIN_SNAPSHOT_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes between auto-snapshots

// ═══════════════════════════════════════════════════════════════
// Helper — verify ownership and return the project
// ═══════════════════════════════════════════════════════════════

async function requireOwnedProject(projectId: string) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId) throw new Error("Unauthorized");

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { id: true, userId: true },
  });

  if (!project || project.userId !== userId) {
    throw new Error("Unauthorized");
  }

  return { userId, projectId: project.id };
}

// ═══════════════════════════════════════════════════════════════
// Create a snapshot (manual or automatic)
// ═══════════════════════════════════════════════════════════════

export async function createSnapshot(
  projectId: string,
  label: string,
  data: unknown,
) {
  await requireOwnedProject(projectId);

  // Auto-snapshots: skip if the last snapshot was created very recently
  if (label === "Auto-save") {
    const recent = await prisma.projectSnapshot.findFirst({
      where: { projectId },
      orderBy: { createdAt: "desc" },
      select: { createdAt: true },
    });

    if (
      recent &&
      Date.now() - recent.createdAt.getTime() < MIN_SNAPSHOT_INTERVAL_MS
    ) {
      return null; // Too soon — skip
    }
  }

  // Create the snapshot
  const snapshot = await prisma.projectSnapshot.create({
    data: {
      projectId,
      label: label.slice(0, 100), // Cap label length
      data: data as object,
    },
    select: { id: true, label: true, createdAt: true },
  });

  // Prune old snapshots beyond the limit (keep newest)
  const allSnapshots = await prisma.projectSnapshot.findMany({
    where: { projectId },
    orderBy: { createdAt: "desc" },
    select: { id: true },
  });

  if (allSnapshots.length > MAX_SNAPSHOTS_PER_PROJECT) {
    const toDelete = allSnapshots
      .slice(MAX_SNAPSHOTS_PER_PROJECT)
      .map((s) => s.id);

    await prisma.projectSnapshot.deleteMany({
      where: { id: { in: toDelete } },
    });
  }

  return snapshot;
}

// ═══════════════════════════════════════════════════════════════
// List snapshots for a project (newest first)
// ═══════════════════════════════════════════════════════════════

export async function listSnapshots(projectId: string) {
  await requireOwnedProject(projectId);

  return prisma.projectSnapshot.findMany({
    where: { projectId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      label: true,
      createdAt: true,
    },
  });
}

// ═══════════════════════════════════════════════════════════════
// Restore a snapshot → overwrites the project's current data
// ═══════════════════════════════════════════════════════════════

export async function restoreSnapshot(
  projectId: string,
  snapshotId: string,
) {
  await requireOwnedProject(projectId);

  const snapshot = await prisma.projectSnapshot.findUnique({
    where: { id: snapshotId },
    select: { id: true, projectId: true, data: true, label: true },
  });

  if (!snapshot || snapshot.projectId !== projectId) {
    throw new Error("Snapshot not found");
  }

  // Save the current state as a "Before restore" snapshot first
  const currentProject = await prisma.project.findUnique({
    where: { id: projectId },
    select: { data: true },
  });

  if (currentProject?.data) {
    await prisma.projectSnapshot.create({
      data: {
        projectId,
        label: `Before restoring "${snapshot.label}"`,
        data: currentProject.data as object,
      },
    });
  }

  // Overwrite project data with the snapshot
  await prisma.project.update({
    where: { id: projectId },
    data: { data: snapshot.data as object },
  });

  return snapshot.data;
}

// ═══════════════════════════════════════════════════════════════
// Delete a snapshot
// ═══════════════════════════════════════════════════════════════

export async function deleteSnapshot(
  projectId: string,
  snapshotId: string,
) {
  await requireOwnedProject(projectId);

  const snapshot = await prisma.projectSnapshot.findUnique({
    where: { id: snapshotId },
    select: { id: true, projectId: true },
  });

  if (!snapshot || snapshot.projectId !== projectId) {
    throw new Error("Snapshot not found");
  }

  await prisma.projectSnapshot.delete({
    where: { id: snapshotId },
  });
}