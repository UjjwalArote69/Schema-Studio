// ============================================================
// FILE: src/components/dashboard/usage-banner.tsx
// (Replaces your existing usage-banner.tsx)
// ============================================================

"use client";

import { Zap, Crown, ArrowRight } from "lucide-react";
import Link from "next/link";

interface UsageSummaryData {
  plan: "free" | "pro";
  projects: { current: number; limit: number };
  aiGenerations: { current: number; limit: number; resetsAt: string };
}

function UsageBar({
  current,
  limit,
  label,
}: {
  current: number;
  limit: number;
  label: string;
}) {
  const pct =
    limit === Infinity ? 0 : Math.min((current / limit) * 100, 100);
  const isNearLimit = pct >= 80;
  const isAtLimit = current >= limit && limit !== Infinity;

  return (
    <div className="flex-1 min-w-[140px]">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">
          {label}
        </span>
        <span
          className={`text-xs font-bold tabular-nums ${
            isAtLimit
              ? "text-red-500"
              : isNearLimit
                ? "text-amber-500"
                : "text-zinc-900 dark:text-white"
          }`}
        >
          {current} / {limit === Infinity ? "∞" : limit}
        </span>
      </div>
      {limit !== Infinity && (
        <div className="h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              isAtLimit
                ? "bg-red-500"
                : isNearLimit
                  ? "bg-amber-500"
                  : "bg-zinc-900 dark:bg-white"
            }`}
            style={{ width: `${pct}%` }}
          />
        </div>
      )}
    </div>
  );
}

export function UsageBanner({ usage }: { usage: UsageSummaryData }) {
  // Pro users see a subtle confirmation instead of usage bars
  if (usage.plan === "pro") {
    return (
      <div className="mb-6 p-4 bg-amber-50/50 dark:bg-amber-950/10 border border-amber-200/50 dark:border-amber-900/20 rounded-xl">
        <div className="flex items-center gap-3">
          <div className="p-1.5 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
            <Crown className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-sm font-semibold text-amber-800 dark:text-amber-300">
              Pro Plan Active
            </span>
            <span className="text-xs text-amber-600/70 dark:text-amber-400/50 ml-2">
              Unlimited projects, tables & AI
            </span>
          </div>
          <Link
            href="/settings?tab=billing"
            className="text-xs font-semibold text-amber-700 dark:text-amber-400 hover:underline underline-offset-2 flex-shrink-0"
          >
            Manage
          </Link>
        </div>
      </div>
    );
  }

  // Free users see the usage bars + upgrade nudge
  const projectsAtLimit = usage.projects.current >= usage.projects.limit;
  const aiAtLimit = usage.aiGenerations.current >= usage.aiGenerations.limit;
  const somethingAtLimit = projectsAtLimit || aiAtLimit;

  return (
    <div
      className={`mb-6 p-4 border rounded-xl ${
        somethingAtLimit
          ? "bg-red-50/50 dark:bg-red-950/10 border-red-200/50 dark:border-red-900/30"
          : "bg-zinc-50 dark:bg-zinc-900/40 border-zinc-200 dark:border-zinc-800"
      }`}
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex items-center gap-2 shrink-0">
          <div
            className={`p-1.5 rounded-lg ${
              somethingAtLimit
                ? "bg-red-100 dark:bg-red-900/30"
                : "bg-zinc-200 dark:bg-zinc-800"
            }`}
          >
            <Zap
              className={`w-3.5 h-3.5 ${
                somethingAtLimit
                  ? "text-red-500"
                  : "text-zinc-600 dark:text-zinc-400"
              }`}
            />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">
            Free Plan
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-6 flex-1">
          <UsageBar
            current={usage.projects.current}
            limit={usage.projects.limit}
            label="Projects"
          />
          <UsageBar
            current={usage.aiGenerations.current}
            limit={usage.aiGenerations.limit}
            label="AI / day"
          />
        </div>

        <Link
          href="/settings?tab=billing"
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all active:scale-95 flex-shrink-0 ${
            somethingAtLimit
              ? "bg-red-600 hover:bg-red-700 text-white shadow-sm"
              : "bg-zinc-900 hover:bg-black dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-black shadow-sm"
          }`}
        >
          {somethingAtLimit ? "Upgrade Now" : "Upgrade"}
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );
}