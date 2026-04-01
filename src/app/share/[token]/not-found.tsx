// ============================================================
// FILE: src/app/share/[token]/not-found.tsx
// ============================================================

import Link from "next/link";
import { Database, ArrowRight, Link2Off } from "lucide-react";

export default function SharedSchemaNotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 px-4 transition-colors duration-300 relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.4] dark:opacity-[0.15] bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:14px_24px] pointer-events-none" />

      <div className="w-full max-w-md bg-white dark:bg-[#0c0c0e] border border-zinc-200 dark:border-zinc-800/80 rounded-3xl shadow-xl p-8 sm:p-10 animate-in fade-in zoom-in-95 duration-500 text-center">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl flex items-center justify-center">
            <Link2Off className="w-8 h-8 text-zinc-400" />
          </div>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white mb-3">
          Schema not found
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-8 max-w-sm mx-auto leading-relaxed">
          This shared link is invalid, has been revoked by the owner, or the
          schema no longer exists.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-2 px-6 py-3 bg-black dark:bg-white text-white dark:text-black rounded-xl text-sm font-bold transition-all active:scale-95 shadow-md"
          >
            <Database className="w-4 h-4" />
            Go to SchemaStudio
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}