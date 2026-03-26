"use client";

import { useState } from "react";
import { ReactFlowProvider } from "@xyflow/react";
import { Database, Plus, CloudOff, LogIn, Code } from "lucide-react";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { useSchemaEditor } from "@/hooks/useSchemaEditor";
import { SchemaCanvas } from "@/components/editor/schema-canvas";
import { ImportModal } from "@/components/editor/import-modal";

// ═══════════════════════════════════════════════════════════════
// Public Sandbox Editor — no auth, no auto-save, own toolbar
// ═══════════════════════════════════════════════════════════════

function PublicEditorContent() {
  const editor = useSchemaEditor();
  const { tables, addTable } = editor;

  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);

  // ── Public sandbox toolbar ──────────────────────────────────
  const toolbar = (
    <div className="h-16 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-200/80 dark:border-zinc-800/80 flex items-center justify-between px-6 z-40 transition-colors duration-300">
      {/* Left: Branding & Sandbox Indicator */}
      <div className="flex items-center gap-4">
        <Link
          href="/"
          className="flex items-center gap-2.5 font-bold tracking-tight hover:opacity-80 transition-opacity"
        >
          <div className="p-1.5 bg-black dark:bg-white rounded-lg shadow-sm">
            <Database className="w-4 h-4 text-white dark:text-black" />
          </div>
          <span className="text-zinc-900 dark:text-white hidden sm:block">SchemaStudio</span>
        </Link>

        <div className="w-px h-5 bg-zinc-200 dark:bg-zinc-800" />

        <div className="flex items-center gap-2 px-2.5 py-1 bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-500 rounded-md text-[11px] font-bold uppercase tracking-wider border border-amber-200/50 dark:border-amber-900/50">
          <CloudOff className="w-3.5 h-3.5" />
          <span className="hidden sm:block">Local Sandbox</span>
        </div>
      </div>

      {/* Center: Add Table */}
      <div className="hidden md:flex items-center gap-1">
        <button
          onClick={() =>
            addTable({
              x: typeof window !== "undefined" ? window.innerWidth / 2 - 100 : 200,
              y: typeof window !== "undefined" ? window.innerHeight / 2 - 100 : 200,
            })
          }
          className="flex items-center gap-2 px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-zinc-900 dark:text-white rounded-lg text-xs font-bold transition-all active:scale-95 border border-transparent dark:border-zinc-800"
        >
          <Plus className="w-3 h-3" /> Add Table
        </button>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setIsExportOpen(true)}
          disabled={tables.length === 0}
          className="flex items-center gap-2 px-4 py-2 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-zinc-900 dark:text-white rounded-lg text-sm font-bold transition-all disabled:opacity-50 active:scale-95"
        >
          <Code className="w-4 h-4" /> Export
        </button>

        <Link
          href="/login"
          className="flex items-center gap-2 px-4 py-2 bg-black hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-black rounded-lg text-sm font-bold transition-all shadow-sm active:scale-95"
        >
          <LogIn className="w-4 h-4" /> Save to Cloud
        </Link>

        <div className="w-px h-5 bg-zinc-200 dark:bg-zinc-800 mx-2 hidden sm:block" />
        <div className="hidden sm:block">
          <ThemeToggle />
        </div>
      </div>
    </div>
  );

  return (
    <>
      <SchemaCanvas
        editor={editor}
        toolbar={toolbar}
        isExportOpen={isExportOpen}
        onExportClose={() => setIsExportOpen(false)}
        onImportSQL={() => setIsImportOpen(true)}
      />
      <ImportModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
      />
    </>
  );
}

// Wrap in ReactFlowProvider
export default function PublicEditorPage() {
  return (
    <ReactFlowProvider>
      <PublicEditorContent />
    </ReactFlowProvider>
  );
}