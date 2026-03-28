/**
 * Plan tier definitions and limit constants.
 *
 * Free tier enforces hard caps on projects, tables-per-project,
 * and AI generations per day. Pro tier removes all limits.
 */

export type PlanTier = "free" | "pro";

export interface PlanLimits {
  maxProjects: number;
  maxTablesPerProject: number;
  maxAIGenerationsPerDay: number;
}

const FREE_LIMITS: PlanLimits = {
  maxProjects: 3,
  maxTablesPerProject: 10,
  maxAIGenerationsPerDay: 5,
};

const PRO_LIMITS: PlanLimits = {
  maxProjects: Infinity,
  maxTablesPerProject: Infinity,
  maxAIGenerationsPerDay: Infinity,
};

export function getLimits(plan: PlanTier): PlanLimits {
  return plan === "pro" ? PRO_LIMITS : FREE_LIMITS;
}

export function isPro(plan: string | null | undefined): boolean {
  return plan === "pro";
}