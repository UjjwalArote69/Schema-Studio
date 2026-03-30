// ============================================================
// FILE: src/lib/plan-enforement.ts
// (Replaces your existing plan-enforement.ts)
// ============================================================

import { prisma } from "@/lib/prisma";
import { getLimits, type PlanTier } from "@/lib/plan-limit";

// ═══════════════════════════════════════════════════════════════
// Fetch the user's plan and limits in one call
// ═══════════════════════════════════════════════════════════════

export async function getUserPlanLimits(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      plan: true,
      aiGenerationsToday: true,
      aiGenerationsResetAt: true,
    },
  });

  if (!user) throw new Error("User not found.");

  const plan = (user.plan ?? "free") as PlanTier;
  const limits = getLimits(plan);

  return { user, plan, limits };
}

// ═══════════════════════════════════════════════════════════════
// Project count check
// ═══════════════════════════════════════════════════════════════

export async function assertCanCreateProject(userId: string): Promise<void> {
  const { limits, plan } = await getUserPlanLimits(userId);
  if (limits.maxProjects === Infinity) return;

  const projectCount = await prisma.project.count({
    where: { userId },
  });

  if (projectCount >= limits.maxProjects) {
    throw new Error(
      `Free plan allows up to ${limits.maxProjects} projects. ` +
        `You currently have ${projectCount}. Upgrade to Pro for unlimited projects.`
    );
  }
}

// ═══════════════════════════════════════════════════════════════
// Table count check (within a single project)
// ═══════════════════════════════════════════════════════════════

export async function assertCanAddTables(
  userId: string,
  projectData: { tables?: unknown[] },
  tablesToAdd: number = 0
): Promise<void> {
  const { limits } = await getUserPlanLimits(userId);
  if (limits.maxTablesPerProject === Infinity) return;

  const currentTableCount = Array.isArray(projectData?.tables)
    ? projectData.tables.length
    : 0;

  const totalAfter = currentTableCount + tablesToAdd;

  if (totalAfter > limits.maxTablesPerProject) {
    throw new Error(
      `Free plan allows up to ${limits.maxTablesPerProject} tables per project. ` +
        `This project would have ${totalAfter}. Upgrade to Pro for unlimited tables.`
    );
  }
}

// ═══════════════════════════════════════════════════════════════
// Column count check (within a single table)
// ═══════════════════════════════════════════════════════════════

export async function assertCanAddColumns(
  userId: string,
  currentColumnCount: number,
  columnsToAdd: number = 1
): Promise<void> {
  const { limits } = await getUserPlanLimits(userId);
  if (limits.maxColumnsPerTable === Infinity) return;

  const totalAfter = currentColumnCount + columnsToAdd;

  if (totalAfter > limits.maxColumnsPerTable) {
    throw new Error(
      `Free plan allows up to ${limits.maxColumnsPerTable} columns per table. ` +
        `Upgrade to Pro for unlimited columns.`
    );
  }
}

// ═══════════════════════════════════════════════════════════════
// Snapshot count check
// ═══════════════════════════════════════════════════════════════

export async function getMaxSnapshots(userId: string): Promise<number> {
  const { limits } = await getUserPlanLimits(userId);
  return limits.maxSnapshotsPerProject;
}

// ═══════════════════════════════════════════════════════════════
// AI generation rate check + increment
// ═══════════════════════════════════════════════════════════════

export async function assertCanUseAI(userId: string): Promise<void> {
  const { user, limits } = await getUserPlanLimits(userId);
  if (limits.maxAIGenerationsPerDay === Infinity) return;

  const now = new Date();
  const resetAt = new Date(user.aiGenerationsResetAt);
  const msInDay = 24 * 60 * 60 * 1000;

  if (now.getTime() - resetAt.getTime() >= msInDay) {
    await prisma.user.update({
      where: { id: userId },
      data: {
        aiGenerationsToday: 1,
        aiGenerationsResetAt: now,
      },
    });
    return;
  }

  if (user.aiGenerationsToday >= limits.maxAIGenerationsPerDay) {
    const hoursUntilReset = Math.ceil(
      (msInDay - (now.getTime() - resetAt.getTime())) / (60 * 60 * 1000)
    );
    throw new Error(
      `Free plan allows ${limits.maxAIGenerationsPerDay} AI generations per day. ` +
        `You've used all of them. Try again in ~${hoursUntilReset}h, or upgrade to Pro for unlimited AI.`
    );
  }

  await prisma.user.update({
    where: { id: userId },
    data: { aiGenerationsToday: { increment: 1 } },
  });
}

// ═══════════════════════════════════════════════════════════════
// Usage summary (for dashboard display)
// ═══════════════════════════════════════════════════════════════

export interface UsageSummary {
  plan: PlanTier;
  projects: { current: number; limit: number };
  aiGenerations: { current: number; limit: number; resetsAt: Date };
}

export async function getUsageSummary(userId: string): Promise<UsageSummary> {
  const { user, plan, limits } = await getUserPlanLimits(userId);

  const projectCount = await prisma.project.count({
    where: { userId },
  });

  const now = new Date();
  const resetAt = new Date(user.aiGenerationsResetAt);
  const msInDay = 24 * 60 * 60 * 1000;

  const aiCount =
    now.getTime() - resetAt.getTime() >= msInDay
      ? 0
      : user.aiGenerationsToday;

  return {
    plan,
    projects: { current: projectCount, limit: limits.maxProjects },
    aiGenerations: {
      current: aiCount,
      limit: limits.maxAIGenerationsPerDay,
      resetsAt: new Date(resetAt.getTime() + msInDay),
    },
  };
}