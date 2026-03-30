// ============================================================
// FILE: src/components/editor/export-modal.tsx
// (Replaces your existing export-modal.tsx)
//
// Changes: Added analytics.exportOpened/Copied/Downloaded
// ============================================================

"use client";

import { useState, useMemo, useEffect } from "react";
import { X, Copy, Check, Database, Terminal, Download } from "lucide-react";
import { generateCode, ExportFormat } from "@/utils/generate-code";
import { Table, Relation } from "@/store/useSchemaStore";
import { analytics } from "@/lib/analytics";

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  tables: Table[];
  relations: Relation[];
}

export function ExportModal({ isOpen, onClose, tables, relations }: ExportModalProps) {
  const [copied, setCopied] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const [format, setFormat] = useState<ExportFormat>("postgresql");

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // ── Track: export modal opened ──
  useEffect(() => {
    if (isOpen && tables.length > 0) {
      analytics.exportOpened();
    }
  }, [isOpen, tables.length]);

  const generatedCode = useMemo(() => {
    return generateCode(tables, relations, format);
  }, [tables, relations, format]);

  const isEmpty = tables.length === 0;

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);

    // ── Track: code copied ──
    analytics.exportCopied(format);
  };

  const tabs: { id: ExportFormat; label: string; ext: string }[] = [
    { id: "postgresql", label: "PostgreSQL", ext: "sql" },
    { id: "mysql", label: "MySQL", ext: "sql" },
    { id: "sqlite", label: "SQLite", ext: "sql" },
    { id: "prisma", label: "Prisma ORM", ext: "prisma" },
    { id: "mongoose-ts", label: "Mongoose (TS)", ext: "ts" },
    { id: "mongoose-js", label: "Mongoose (JS)", ext: "js" },
  ];

  const currentTab = tabs.find((t) => t.id === format);

  const handleDownload = () => {
    const blob = new Blob([generatedCode], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `schema.${currentTab?.ext || "txt"}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 2000);

    // ── Track: file downloaded ──
    analytics.exportDownloaded(format);
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-100 flex items-center justify-center bg-black/40 dark:bg-black/60 backdrop-blur-md p-4 transition-all"
      onClick={handleBackdropClick}
    >
      <div 
        className="bg-white dark:bg-zinc-950 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl shadow-2xl w-full max-w-3xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 slide-in-from-bottom-4 duration-300 ease-out"
        onClick={(e) => e.stopPropagation()}
      >
        
        <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-100 dark:border-zinc-800/50 bg-white dark:bg-zinc-950">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 dark:bg-blue-500/10 rounded-xl border border-blue-100 dark:border-blue-500/20">
              <Database className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-zinc-900 dark:text-white leading-tight">Export Schema</h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium mt-0.5">Generate code for your current architecture</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 dark:hover:text-zinc-200 rounded-full transition-all active:scale-95"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 py-4 bg-zinc-50/50 dark:bg-zinc-900/20 border-b border-zinc-100 dark:border-zinc-800/50">
          <div className="flex items-center gap-1 p-1 bg-zinc-100 dark:bg-zinc-900/80 border border-zinc-200/50 dark:border-zinc-800 rounded-xl overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFormat(tab.id)}
                className={`px-4 py-2 text-sm font-semibold rounded-lg whitespace-nowrap transition-all duration-200 ${
                  format === tab.id
                    ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm ring-1 ring-zinc-200 dark:ring-zinc-700"
                    : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6 bg-zinc-50/50 dark:bg-zinc-900/20">
          {isEmpty ? (
            <div className="flex flex-col items-center justify-center py-16 px-6 rounded-xl border-2 border-dashed border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/30">
              <div className="p-3 bg-zinc-100 dark:bg-zinc-800 rounded-2xl border border-zinc-200 dark:border-zinc-700 mb-4">
                <Database className="w-7 h-7 text-zinc-400" />
              </div>
              <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                No tables to export
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 text-center max-w-xs">
                Add at least one table to your schema before exporting.
              </p>
            </div>
          ) : (
          <div className="rounded-xl overflow-hidden bg-[#0d1117] border border-zinc-200 dark:border-zinc-800 shadow-inner flex flex-col">
            <div className="flex items-center justify-between px-4 py-2.5 bg-white/5 border-b border-white/5">
              <div className="flex items-center gap-2 text-zinc-400">
                <Terminal className="w-4 h-4" />
                <span className="text-xs font-mono">schema.{currentTab?.ext}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-zinc-600/50" />
                <div className="w-2.5 h-2.5 rounded-full bg-zinc-600/50" />
                <div className="w-2.5 h-2.5 rounded-full bg-zinc-600/50" />
              </div>
            </div>

            <pre className="p-5 text-[13px] text-zinc-300 font-mono whitespace-pre-wrap leading-relaxed overflow-y-auto max-h-[45vh] min-h-75 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-zinc-700 [&::-webkit-scrollbar-thumb]:rounded-full">
              <code>{generatedCode}</code>
            </pre>
          </div>
          )}
        </div>

        <div className="flex items-center justify-between px-6 py-4 border-t border-zinc-100 dark:border-zinc-800/50 bg-white dark:bg-zinc-950">
          <p className="text-xs font-medium text-zinc-500 hidden sm:block">
            Automatically generated by SchemaStudio
          </p>
          
          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <button 
              onClick={handleDownload}
              disabled={isEmpty}
              className="flex items-center justify-center gap-2 px-5 py-2.5 bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-900 dark:text-white rounded-xl text-sm font-bold transition-all active:scale-95 shadow-sm border border-zinc-200 dark:border-zinc-800 disabled:opacity-40 disabled:pointer-events-none"
            >
              {downloaded ? <Check className="w-4 h-4 text-green-500" /> : <Download className="w-4 h-4" />}
              {downloaded ? "Downloaded" : "Download File"}
            </button>

            <button 
              onClick={handleCopy}
              disabled={isEmpty}
              className="flex items-center justify-center gap-2 px-5 py-2.5 bg-zinc-900 hover:bg-black dark:bg-white text-white dark:text-black dark:hover:bg-zinc-200 rounded-xl text-sm font-bold transition-all active:scale-95 shadow-md shadow-zinc-900/10 disabled:opacity-40 disabled:pointer-events-none"
            >
              {copied ? <Check className="w-4 h-4 text-green-500 dark:text-green-600" /> : <Copy className="w-4 h-4" />}
              {copied ? "Copied" : "Copy Code"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}