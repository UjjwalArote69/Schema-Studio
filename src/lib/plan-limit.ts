// ============================================================
// FILE: src/lib/plan-limits.ts
// (Replaces your existing plan-limits.ts)
// ============================================================

export type PlanTier = "free" | "pro";

export interface PlanLimits {
  maxProjects: number;
  maxTablesPerProject: number;
  maxAIGenerationsPerDay: number;
  maxSnapshotsPerProject: number;
  maxColumnsPerTable: number;
}

const FREE_LIMITS: PlanLimits = {
  maxProjects: 3,
  maxTablesPerProject: 10,
  maxAIGenerationsPerDay: 5,
  maxSnapshotsPerProject: 5,
  maxColumnsPerTable: 15,
};

const PRO_LIMITS: PlanLimits = {
  maxProjects: Infinity,
  maxTablesPerProject: Infinity,
  maxAIGenerationsPerDay: Infinity,
  maxSnapshotsPerProject: 100,
  maxColumnsPerTable: Infinity,
};

export function getLimits(plan: PlanTier): PlanLimits {
  return plan === "pro" ? PRO_LIMITS : FREE_LIMITS;
}

export function isPro(plan: string | null | undefined): boolean {
  return plan === "pro";
}

export function formatLimit(value: number): string {
  return value === Infinity ? "Unlimited" : String(value);
}