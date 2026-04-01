// ============================================================
// FILE: src/app/share/[token]/loading.tsx
// ============================================================

import { Database, Loader2 } from "lucide-react";

export default function SharedSchemaLoading() {
  return (
    <div className="h-screen w-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950">
      <div className="flex flex-col items-center gap-4 animate-in fade-in duration-500">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 border-[3px] border-zinc-200 dark:border-zinc-800 rounded-full" />
          <div className="absolute inset-0 border-[3px] border-zinc-900 dark:border-white border-t-transparent border-r-transparent rounded-full animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Database className="w-6 h-6 text-zinc-900 dark:text-white" />
          </div>
        </div>
        <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
          Loading shared schema...
        </p>
      </div>
    </div>
  );
}