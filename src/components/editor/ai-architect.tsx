"use client";

import { useState } from "react";
import { Sparkles, Loader2, Send, Lock } from "lucide-react";
import { generateSchemaFromAI } from "@/app/actions/ai-actions";
import { useSchemaStore } from "@/store/useSchemaStore";
import { AILoadingSkeleton } from "./ai-skeleton-loading";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export function AIArchitect() {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const { tables, relations, setSchema } = useSchemaStore();
  
  // Auth hooks
  const { data: session, status } = useSession();
  const router = useRouter();

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) {
      router.push("/login?callbackUrl=/editor");
      return;
    }
    if (!prompt.trim() || isGenerating) return;

    setIsGenerating(true);
    try {
      const result = await generateSchemaFromAI(prompt, { tables, relations });
      setSchema(result.tables, result.relations);
      setPrompt("");
    } catch (err) {
      alert("AI failed to generate schema. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <>
      {isGenerating && <AILoadingSkeleton />}

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-full max-w-2xl px-4 z-40 animate-in slide-in-from-bottom-4 fade-in duration-500">
        <form 
          onSubmit={handleGenerate}
          className="relative group bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border border-zinc-200 dark:border-zinc-700/50 rounded-full shadow-2xl p-1.5 flex items-center gap-2 focus-within:ring-4 focus-within:ring-zinc-100 dark:focus-within:ring-zinc-800 focus-within:border-zinc-400 dark:focus-within:border-zinc-600 transition-all"
        >
          <div className="pl-4 pr-2 flex items-center gap-2 border-r border-zinc-200 dark:border-zinc-700">
            {/* If locked, show grey icon instead of blue sparkle */}
            <Sparkles className={`w-5 h-5 ${session ? "text-zinc-900 dark:text-white" : "text-zinc-400"}`} />
          </div>
          
          <input 
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            disabled={isGenerating || (!session && status !== "loading")}
            placeholder={!session ? "Sign in to use the AI Architect..." : "Ask AI to redesign or add to your schema..."}
            className="flex-1 bg-transparent border-none text-sm font-medium focus:ring-0 text-zinc-900 dark:text-white placeholder:text-zinc-500 outline-none px-2 disabled:opacity-60"
          />

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
    </>
  );
}