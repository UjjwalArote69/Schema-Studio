"use client";

import { useState } from "react";
import { 
  Database, Plus, LayoutTemplate, FileCode, Sparkles, Send, Loader2, Lock
} from "lucide-react";
import { useSchemaStore } from "@/store/useSchemaStore";
import { generateSchemaFromAI } from "@/app/actions/ai-actions";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export function EmptyState() {
  const { addTable, setSchema, tables, relations } = useSchemaStore();
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Auth hooks
  const { data: session, status } = useSession();
  const router = useRouter();

  const handleCreateFirstTable = () => {
    addTable({ 
      x: typeof window !== "undefined" ? window.innerWidth / 2 - 150 : 250, 
      y: typeof window !== "undefined" ? window.innerHeight / 2 - 100 : 200 
    });
  };

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
    } catch (err) {
      alert("AI failed to generate schema. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="absolute inset-0 flex items-center justify-center z-10 p-6 bg-zinc-50/50 dark:bg-zinc-950/50">
      <div className="max-w-2xl w-full flex flex-col items-center animate-in fade-in zoom-in-95 slide-in-from-bottom-8 duration-500">
        
        {/* Monochrome Hero Icon */}
        <div className="relative w-20 h-20 mb-6">
          <div className="absolute inset-0 bg-zinc-500/10 dark:bg-zinc-100/5 blur-2xl rounded-full" />
          <div className="relative w-full h-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl flex items-center justify-center shadow-xl">
            <Sparkles className="w-8 h-8 text-zinc-900 dark:text-white" />
          </div>
        </div>
        
        <h2 className="text-3xl font-extrabold text-zinc-900 dark:text-white mb-3 tracking-tight text-center">
          What are we building today?
        </h2>
        <p className="text-zinc-500 dark:text-zinc-400 text-sm mb-8 text-center max-w-md leading-relaxed">
          Describe your application and our AI will instantly generate a complete relational database schema for you.
        </p>

        {/* AI Input Form */}
        <form 
          onSubmit={handleGenerate}
          className="w-full relative group bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xl p-2 flex items-center gap-3 focus-within:ring-4 focus-within:ring-zinc-100 dark:focus-within:ring-zinc-900/50 focus-within:border-zinc-400 dark:focus-within:border-zinc-600 transition-all mb-10"
        >
          <div className="pl-4">
            <Database className="w-5 h-5 text-zinc-400 group-focus-within:text-zinc-900 dark:group-focus-within:text-zinc-100 transition-colors" />
          </div>
          <input 
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            disabled={isGenerating}
            placeholder="e.g. A gym management system with memberships and classes..."
            className="flex-1 bg-transparent border-none py-3 text-base focus:ring-0 text-zinc-900 dark:text-white placeholder:text-zinc-500 outline-none"
          />
          <button 
            type={session ? "submit" : "button"}
            onClick={() => {
              if (!session) router.push("/login?callbackUrl=/editor");
            }}
            disabled={(session && (!prompt.trim() || isGenerating)) || status === "loading"}
            className="flex items-center gap-2 px-6 py-3 bg-black hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-black rounded-xl font-bold transition-all active:scale-95 shadow-lg disabled:opacity-50"
          >
            {status === "loading" ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : !session ? (
              <>
                <Lock className="w-4 h-4" /> Sign in for AI
              </>
            ) : isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" /> Generating...
              </>
            ) : (
              <>
                <Send className="w-5 h-5" /> Generate
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="w-full flex items-center gap-4 mb-8">
          <div className="flex-1 h-px bg-zinc-200 dark:bg-zinc-800" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Or start manually</span>
          <div className="flex-1 h-px bg-zinc-200 dark:bg-zinc-800" />
        </div>

        {/* Manual Actions Grid */}
        <div className="flex flex-wrap items-center justify-center gap-3 w-full">
          <button
            onClick={handleCreateFirstTable}
            className="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white rounded-xl text-sm font-bold transition-all shadow-sm active:scale-95"
          >
            <Plus className="w-4 h-4 text-zinc-500" /> Blank Table
          </button>
          
          <Link 
            href="/templates" 
            className="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white rounded-xl text-sm font-bold transition-all shadow-sm active:scale-95"
          >
            <LayoutTemplate className="w-4 h-4 text-zinc-500" /> Browse Templates
          </Link>
          
          <button 
            className="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white rounded-xl text-sm font-bold transition-all shadow-sm active:scale-95"
          >
            <FileCode className="w-4 h-4 text-zinc-500" /> Import SQL
          </button>
        </div>

      </div>
    </div>
  );
}