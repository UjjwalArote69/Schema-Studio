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
  // Inside PublicEditorContent component, locate the 'toolbar' constant and replace it with:

  // ── Public sandbox toolbar ──────────────────────────────────
  const toolbar = (
    <div className="h-14 sm:h-16 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-200/80 dark:border-zinc-800/80 flex items-center justify-between px-3 sm:px-6 z-40 transition-colors duration-300 w-full">
      {/* Left: Branding & Sandbox Indicator */}
      <div className="flex items-center gap-2 sm:gap-4 shrink-0">
        <Link
          href="/"
          className="flex items-center gap-2 font-bold tracking-tight hover:opacity-80 transition-opacity"
        >
          <div className="p-1.5 bg-black dark:bg-white rounded-lg shadow-sm shrink-0">
            <Database className="w-4 h-4 text-white dark:text-black" />
          </div>
          <span className="text-zinc-900 dark:text-white hidden md:block">SchemaStudio</span>
        </Link>

        <div className="w-px h-5 bg-zinc-200 dark:bg-zinc-800 hidden sm:block" />

        <div className="hidden sm:flex items-center gap-2 px-2 py-1 bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-500 rounded-md text-[11px] font-bold uppercase tracking-wider border border-amber-200/50 dark:border-amber-900/50">
          <CloudOff className="w-3.5 h-3.5" />
          <span>Local Sandbox</span>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
        <button
          onClick={() =>
            addTable({
              x: typeof window !== "undefined" ? window.innerWidth / 2 - 100 : 200,
              y: typeof window !== "undefined" ? window.innerHeight / 2 - 100 : 200,
            })
          }
          title="Add Table"
          className="flex items-center justify-center gap-2 p-2 sm:px-3 sm:py-1.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-zinc-900 dark:text-white rounded-lg text-sm font-bold transition-all active:scale-95 border border-transparent dark:border-zinc-800 shrink-0"
        >
          <Plus className="w-5 h-5 sm:w-4 sm:h-4" /> 
          <span className="hidden sm:inline">Add</span>
        </button>

        <button
          onClick={() => setIsExportOpen(true)}
          disabled={tables.length === 0}
          title="Export Code"
          className="flex items-center justify-center gap-2 p-2 sm:px-4 sm:py-2 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-zinc-900 dark:text-white rounded-lg text-sm font-bold transition-all disabled:opacity-50 active:scale-95 shrink-0"
        >
          <Code className="w-5 h-5 sm:w-4 sm:h-4" /> 
          <span className="hidden sm:inline">Export</span>
        </button>

        <Link
          href="/login"
          title="Save to Cloud"
          className="flex items-center justify-center gap-2 p-2 sm:px-4 sm:py-2 bg-black hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-black rounded-lg text-sm font-bold transition-all shadow-sm active:scale-95 shrink-0"
        >
          <LogIn className="w-5 h-5 sm:w-4 sm:h-4" /> 
          <span className="hidden sm:inline">Save</span>
        </Link>

        <div className="w-px h-5 bg-zinc-200 dark:bg-zinc-800 mx-0.5 sm:mx-1" />
        <ThemeToggle />
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