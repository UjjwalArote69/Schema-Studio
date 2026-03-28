/**
 * Server-side helpers to enforce plan limits.
 *
 * Each check queries the database for current usage and compares
 * against the user's plan tier. Throws a descriptive Error when
 * a limit is exceeded so the calling action can surface it to the UI.
 *
 * Prerequisites — add these columns to your Prisma User model:
 *
 *   plan                String   @default("free")
 *   aiGenerationsToday  Int      @default(0)
 *   aiGenerationsResetAt DateTime @default(now())
 *
 * Then run `npx prisma migrate dev` to apply.
 */

import { prisma } from "@/lib/prisma";
import { getLimits, type PlanTier } from "@/lib/plan-limits";

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
// AI generation rate check + increment
// ═══════════════════════════════════════════════════════════════

/**
 * Checks whether the user can make another AI generation today.
 * If yes, increments the counter atomically and returns.
 * If no, throws with a descriptive message.
 *
 * The daily counter resets at midnight UTC (or whenever 24 hours
 * have elapsed since the last reset).
 */
export async function assertCanUseAI(userId: string): Promise<void> {
  const { user, limits } = await getUserPlanLimits(userId);
  if (limits.maxAIGenerationsPerDay === Infinity) return;

  const now = new Date();
  const resetAt = new Date(user.aiGenerationsResetAt);
  const msInDay = 24 * 60 * 60 * 1000;

  // If more than 24 hours since last reset, reset the counter
  if (now.getTime() - resetAt.getTime() >= msInDay) {
    await prisma.user.update({
      where: { id: userId },
      data: {
        aiGenerationsToday: 1, // count this generation
        aiGenerationsResetAt: now,
      },
    });
    return;
  }

  // Counter is still within the current day window
  if (user.aiGenerationsToday >= limits.maxAIGenerationsPerDay) {
    const hoursUntilReset = Math.ceil(
      (msInDay - (now.getTime() - resetAt.getTime())) / (60 * 60 * 1000)
    );
    throw new Error(
      `Free plan allows ${limits.maxAIGenerationsPerDay} AI generations per day. ` +
        `You've used all of them. Try again in ~${hoursUntilReset}h, or upgrade to Pro for unlimited AI.`
    );
  }

  // Increment the counter
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

  // If the day window has elapsed, the effective count is 0
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