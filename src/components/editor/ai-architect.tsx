// ============================================================
// FILE: src/components/editor/ai-architect.tsx
// (Replaces your existing ai-architect.tsx)
//
// Changes: Added analytics.aiGenerationStarted/Completed/Failed
// ============================================================

/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useCallback, useEffect } from "react";
import { Sparkles, Loader2, Send, Lock, X, Zap } from "lucide-react";
import { generateSchemaFromAI } from "@/app/actions/ai-actions";
import { fetchUsageSummary } from "@/app/actions/plan-actions";
import { useSchemaStore } from "@/store/useSchemaStore";
import { AILoadingSkeleton } from "./ai-skeleton-loading";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { analytics } from "@/lib/analytics";

export function AIArchitect() {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isMobileModalOpen, setIsMobileModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [aiUsed, setAiUsed] = useState<number | null>(null);
  const [aiLimit, setAiLimit] = useState<number | null>(null);

  const setSchema = useSchemaStore((s) => s.setSchema);

  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!session) return;
    fetchUsageSummary().then((usage) => {
      if (usage && usage.plan === "free") {
        setAiUsed(usage.aiGenerations.current);
        setAiLimit(usage.aiGenerations.limit);
      }
    }).catch(() => {});
  }, [session]);

  const handleGenerate = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);
      if (!session) {
        router.push("/login?callbackUrl=/editor");
        return;
      }
      if (!prompt.trim() || isGenerating) return;

      setIsGenerating(true);
      setIsMobileModalOpen(false);

      const { tables, relations } = useSchemaStore.getState();

      // ── Track: AI generation started ──
      analytics.aiGenerationStarted(prompt.trim().length, tables.length > 0);

      try {
        const result = await generateSchemaFromAI(prompt, { tables, relations });
        setSchema(result.tables, result.relations);
        setPrompt("");

        // ── Track: AI generation completed ──
        analytics.aiGenerationCompleted(
          result.tables?.length || 0,
          result.relations?.length || 0
        );

        if (aiUsed !== null) setAiUsed((prev) => (prev !== null ? prev + 1 : prev));
      } catch (err: any) {
        const msg = err?.message || "AI failed to generate schema. Please try again.";
        setError(msg);

        // ── Track: AI generation failed ──
        analytics.aiGenerationFailed(msg);
      } finally {
        setIsGenerating(false);
      }
    },
    [session, prompt, isGenerating, router, setSchema, aiUsed],
  );

  const aiRemaining = aiUsed !== null && aiLimit !== null ? Math.max(0, aiLimit - aiUsed) : null;

  return (
    <>
      {isGenerating && <AILoadingSkeleton />}

      {error && (
        <div className="hidden md:flex absolute bottom-24 left-1/2 -translate-x-1/2 z-50 max-w-xl w-full px-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="w-full flex items-start gap-3 p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 rounded-xl shadow-lg">
            <Zap className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
            <p className="text-sm text-red-700 dark:text-red-300 flex-1">{error}</p>
            <button onClick={() => setError(null)} className="p-0.5 text-red-400 hover:text-red-600">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* DESKTOP UI */}
      <div className="hidden md:block absolute bottom-8 left-1/2 -translate-x-1/2 w-full max-w-2xl px-4 z-40 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <form
          onSubmit={handleGenerate}
          className="relative group bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border border-zinc-200 dark:border-zinc-700/50 rounded-full shadow-2xl p-1.5 flex items-center gap-2 focus-within:ring-4 focus-within:ring-zinc-100 dark:focus-within:ring-zinc-800 focus-within:border-zinc-400 dark:focus-within:border-zinc-600 transition-all"
        >
          <div className="pl-4 pr-2 flex items-center gap-2 border-r border-zinc-200 dark:border-zinc-700">
            <Sparkles className={`w-5 h-5 ${session ? "text-zinc-900 dark:text-white" : "text-zinc-400"}`} />
          </div>

          <input
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            disabled={isGenerating || (!session && status !== "loading")}
            placeholder={!session ? "Sign in to use the AI Architect..." : "Ask AI to redesign or add to your schema..."}
            className="flex-1 bg-transparent border-none text-sm font-medium focus:ring-0 text-zinc-900 dark:text-white placeholder:text-zinc-500 outline-none px-2 disabled:opacity-60"
          />

          {session && aiRemaining !== null && (
            <span
              className={`text-[10px] font-bold tabular-nums px-2 py-0.5 rounded-full border shrink-0 ${
                aiRemaining === 0
                  ? "bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800"
                  : aiRemaining <= 2
                    ? "bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800"
                    : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500 border-zinc-200 dark:border-zinc-700"
              }`}
              title={`${aiRemaining} AI generation${aiRemaining !== 1 ? "s" : ""} remaining today`}
            >
              {aiRemaining} left
            </span>
          )}

          <button
            type={session ? "submit" : "button"}
            onClick={() => {
              if (!session) router.push("/login?callbackUrl=/editor");
            }}
            disabled={(session && (!prompt.trim() || isGenerating)) || status === "loading"}
            className="p-2.5 bg-black hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-200 disabled:opacity-50 text-white dark:text-black rounded-full transition-all active:scale-95 shadow-sm flex items-center justify-center"
            title={!session ? "Sign in to use AI" : "Generate Schema"}
          >
            {status === "loading" ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : !session ? (
              <Lock className="w-4 h-4" />
            ) : isGenerating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </form>
      </div>

      {/* MOBILE UI */}
      <div className="md:hidden">
        {isMobileModalOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm animate-in fade-in"
            onClick={() => setIsMobileModalOpen(false)}
          />
        )}

        <div className={`absolute z-50 transition-all duration-300 ${isMobileModalOpen ? "bottom-4 left-4 right-4" : "bottom-6 left-6"}`}>
          {!isMobileModalOpen ? (
            <button
              onClick={() => setIsMobileModalOpen(true)}
              className="p-3.5 bg-black dark:bg-white text-white dark:text-black rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center border border-transparent dark:border-zinc-200 animate-in fade-in slide-in-from-bottom-8"
            >
              <Sparkles className="w-6 h-6" />
            </button>
          ) : (
            <div className="bg-white/95 dark:bg-zinc-950/95 backdrop-blur-xl border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl shadow-2xl p-4 animate-in slide-in-from-bottom-4 fade-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 bg-zinc-100 dark:bg-zinc-900 rounded-lg">
                    <Sparkles className="w-4 h-4 text-zinc-900 dark:text-white" />
                  </div>
                  <span className="text-sm font-bold text-zinc-900 dark:text-white">AI Architect</span>
                  {session && aiRemaining !== null && (
                    <span className="text-[10px] font-bold tabular-nums px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 border border-zinc-200 dark:border-zinc-700">
                      {aiRemaining} left today
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setIsMobileModalOpen(false)}
                  className="p-1.5 text-zinc-400 hover:text-zinc-900 dark:hover:text-white bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-900 dark:hover:bg-zinc-800 rounded-md transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {error && (
                <div className="mb-3 p-2.5 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 rounded-xl">
                  <p className="text-xs text-red-700 dark:text-red-300">{error}</p>
                </div>
              )}

              <form onSubmit={handleGenerate} className="flex flex-col gap-3">
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  disabled={isGenerating || (!session && status !== "loading")}
                  placeholder={!session ? "Sign in to use AI..." : "Ask AI to redesign or add to your schema..."}
                  className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-3 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white resize-none min-h-[100px]"
                />

                <button
                  type={session ? "submit" : "button"}
                  onClick={() => {
                    if (!session) router.push("/login?callbackUrl=/editor");
                  }}
                  disabled={(session && (!prompt.trim() || isGenerating)) || status === "loading"}
                  className="w-full py-3 bg-black hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-200 disabled:opacity-50 text-white dark:text-black rounded-xl text-sm font-bold transition-all active:scale-95 shadow-sm flex items-center justify-center gap-2"
                >
                  {status === "loading" || isGenerating ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : !session ? (
                    <><Lock className="w-4 h-4" /> Sign In to Generate</>
                  ) : (
                    <><Send className="w-4 h-4" /> Generate Schema</>
                  )}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </>
  );
}