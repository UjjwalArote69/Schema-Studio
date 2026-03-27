"use client";

import { useState } from "react";
import { Sparkles, Loader2, Send, Lock, X } from "lucide-react";
import { generateSchemaFromAI } from "@/app/actions/ai-actions";
import { useSchemaStore } from "@/store/useSchemaStore";
import { AILoadingSkeleton } from "./ai-skeleton-loading";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export function AIArchitect() {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isMobileModalOpen, setIsMobileModalOpen] = useState(false);
  
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
    // Close the mobile modal immediately when generation starts
    setIsMobileModalOpen(false); 
    
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

      {/* =========================================
        DESKTOP UI: Full-width bottom bar 
        =========================================
      */}
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

      {/* =========================================
        MOBILE UI: Floating Action Button + Modal
        =========================================
      */}
      <div className="md:hidden">
        {/* Backdrop for the modal */}
        {isMobileModalOpen && (
          <div 
            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm animate-in fade-in" 
            onClick={() => setIsMobileModalOpen(false)} 
          />
        )}

        <div className={`absolute z-50 transition-all duration-300 ${isMobileModalOpen ? 'bottom-4 left-4 right-4' : 'bottom-6 left-6'}`}>
          
          {!isMobileModalOpen ? (
            /* The Floating Button */
            <button
              onClick={() => setIsMobileModalOpen(true)}
              className="p-3.5 bg-black dark:bg-white text-white dark:text-black rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center border border-transparent dark:border-zinc-200 animate-in fade-in slide-in-from-bottom-8"
            >
              <Sparkles className="w-6 h-6" />
            </button>
          ) : (
            /* The Floating Window */
            <div className="bg-white/95 dark:bg-zinc-950/95 backdrop-blur-xl border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl shadow-2xl p-4 animate-in slide-in-from-bottom-4 fade-in zoom-in-95 duration-200">
              
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 bg-zinc-100 dark:bg-zinc-900 rounded-lg">
                    <Sparkles className="w-4 h-4 text-zinc-900 dark:text-white" />
                  </div>
                  <span className="text-sm font-bold text-zinc-900 dark:text-white">AI Architect</span>
                </div>
                <button 
                  type="button" 
                  onClick={() => setIsMobileModalOpen(false)} 
                  className="p-1.5 text-zinc-400 hover:text-zinc-900 dark:hover:text-white bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-900 dark:hover:bg-zinc-800 rounded-md transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

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