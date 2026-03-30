// ============================================================
// FILE: src/components/editor/import-modal.tsx
// (Replaces your existing import-modal.tsx)
//
// Changes: Added analytics.sqlImported and sqlImportFailed
// ============================================================

"use client";

import { useState } from "react";
import { X, FileCode, AlertCircle, Sparkles } from "lucide-react";
import { parseSQL } from "@/utils/sql-parser";
import { useSchemaStore } from "@/store/useSchemaStore";
import { analytics } from "@/lib/analytics";

export function ImportModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [sql, setSql] = useState("");
  const { setSchema } = useSchemaStore();

  const handleImport = () => {
    try {
      const { tables, relations } = parseSQL(sql);
      if (tables.length === 0) {
        alert("No valid CREATE TABLE statements found.");
        analytics.sqlImportFailed();
        return;
      }
      setSchema(tables, relations);
      analytics.sqlImported(tables.length);
      onClose();
    } catch (err) {
      console.error(err);
      alert("Error parsing SQL. Please check your syntax.");
      analytics.sqlImportFailed();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col">
        <div className="px-6 py-5 border-b border-zinc-100 dark:border-zinc-900 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-900/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500 rounded-xl shadow-lg shadow-blue-500/20"><FileCode className="w-5 h-5 text-white" /></div>
            <div>
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Import from SQL</h2>
              <p className="text-xs text-zinc-500">Paste your DDL / CREATE TABLE statements below</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-full transition-colors"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-6">
          <textarea value={sql} onChange={(e) => setSql(e.target.value)} placeholder="CREATE TABLE users (&#10;  id UUID PRIMARY KEY,&#10;  name VARCHAR(255)&#10;);" className="w-full h-64 p-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none" />
          <div className="mt-4 flex items-start gap-3 p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-900/50 rounded-xl">
            <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-500 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-700 dark:text-amber-400 leading-relaxed">This will <strong>overwrite</strong> your current canvas. Make sure you&rsquo;ve saved any important changes before importing.</p>
          </div>
        </div>
        <div className="px-6 py-5 bg-zinc-50 dark:bg-zinc-900/50 border-t border-zinc-100 dark:border-zinc-900 flex justify-end gap-3">
          <button onClick={onClose} className="px-5 py-2.5 text-sm font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors">Cancel</button>
          <button onClick={handleImport} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-blue-600/20 transition-all active:scale-95"><Sparkles className="w-4 h-4" />Generate Diagram</button>
        </div>
      </div>
    </div>
  );
}