"use client";

import { Trash2, X, CheckSquare, Keyboard } from "lucide-react";

interface BulkActionsToolbarProps {
  selectedCount: number;
  totalCount: number;
  onDelete: () => void;
  onSelectAll: () => void;
  onDeselect: () => void;
}

export function BulkActionsToolbar({
  selectedCount,
  totalCount,
  onDelete,
  onSelectAll,
  onDeselect,
}: BulkActionsToolbarProps) {
  if (selectedCount < 2) return null;

  const allSelected = selectedCount === totalCount;

  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-40 animate-in fade-in slide-in-from-top-2 duration-200">
      <div className="flex items-center gap-1 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl border border-zinc-200 dark:border-zinc-700 rounded-xl shadow-2xl px-1.5 py-1.5">
        {/* Selection count badge */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/50 rounded-lg select-none">
          <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
          <span className="text-xs font-bold text-blue-700 dark:text-blue-300 tabular-nums whitespace-nowrap">
            {selectedCount} selected
          </span>
        </div>

        <div className="w-px h-6 bg-zinc-200 dark:bg-zinc-700 mx-0.5" />

        {/* Select All / Deselect toggle */}
        {!allSelected ? (
          <button
            onClick={onSelectAll}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors whitespace-nowrap"
            title={`Select all ${totalCount} tables`}
          >
            <CheckSquare className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">All</span>
          </button>
        ) : (
          <button
            onClick={onDeselect}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors whitespace-nowrap"
            title="Deselect all"
          >
            <X className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Deselect</span>
          </button>
        )}

        <div className="w-px h-6 bg-zinc-200 dark:bg-zinc-700 mx-0.5" />

        {/* Delete */}
        <button
          onClick={onDelete}
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors whitespace-nowrap"
          title={`Delete ${selectedCount} tables`}
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Delete</span>
        </button>

        <div className="w-px h-6 bg-zinc-200 dark:bg-zinc-700 mx-0.5" />

        {/* Shortcut hint */}
        <div className="hidden lg:flex items-center gap-1 px-2 py-1.5">
          <Keyboard className="w-3 h-3 text-zinc-400" />
          <span className="text-[10px] font-medium text-zinc-400 whitespace-nowrap">
            ⌫ Delete &middot; Esc Clear
          </span>
        </div>
      </div>
    </div>
  );
}