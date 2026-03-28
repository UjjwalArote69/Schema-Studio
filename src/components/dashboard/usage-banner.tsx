"use client";

import { Database, Sparkles, Zap } from "lucide-react";

interface UsageSummaryData {
  plan: "free" | "pro";
  projects: { current: number; limit: number };
  aiGenerations: { current: number; limit: number; resetsAt: string };
}

function UsageBar({ current, limit, label }: { current: number; limit: number; label: string }) {
  const pct = limit === Infinity ? 0 : Math.min((current / limit) * 100, 100);
  const isNearLimit = pct >= 80;
  const isAtLimit = current >= limit && limit !== Infinity;

  return (
    <div className="flex-1 min-w-[140px]">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">{label}</span>
        <span className={`text-xs font-bold tabular-nums ${isAtLimit ? "text-red-500" : isNearLimit ? "text-amber-500" : "text-zinc-900 dark:text-white"}`}>
          {current} / {limit === Infinity ? "∞" : limit}
        </span>
      </div>
      {limit !== Infinity && (
        <div className="h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${isAtLimit ? "bg-red-500" : isNearLimit ? "bg-amber-500" : "bg-zinc-900 dark:bg-white"}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      )}
    </div>
  );
}

export function UsageBanner({ usage }: { usage: UsageSummaryData }) {
  if (usage.plan === "pro") return null;

  return (
    <div className="mb-6 p-4 bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 rounded-xl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex items-center gap-2 shrink-0">
          <div className="p-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-lg">
            <Zap className="w-3.5 h-3.5 text-zinc-600 dark:text-zinc-400" />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">Free Plan</span>
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
      </div>
    </div>
  );
}