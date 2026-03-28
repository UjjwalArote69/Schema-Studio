"use client";

import { memo } from "react";
import { Handle, Position } from "@xyflow/react";
import { Table } from "@/store/useSchemaStore";
import { Key } from "lucide-react";

// ═══════════════════════════════════════════════════════════════
// PERF: memo() is critical here. React Flow re-renders all visible
// nodes on any state change (zoom, pan, selection). Without memo,
// 50 table nodes × 10 columns = 500 DOM elements re-rendered on
// every frame during pan/zoom.
//
// Immer's structural sharing ensures `data.table` is the SAME
// object reference when nothing about that table changed, so
// memo's shallow comparison bails out correctly.
// ═══════════════════════════════════════════════════════════════
export const TableNode = memo(function TableNode({
  data,
  selected,
}: {
  data: { table: Table };
  selected: boolean;
}) {
  const { table } = data;

  return (
    <div
      className={`bg-white dark:bg-zinc-950 border-2 rounded-xl shadow-xl min-w-[220px] transition-shadow ${
        selected
          ? "border-blue-500 shadow-blue-500/20"
          : "border-zinc-200 dark:border-zinc-800"
      }`}
    >
      {/* Table Header */}
      <div
        className={`px-4 py-2 flex items-center justify-between border-b rounded-t-[10px] ${
          selected
            ? "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-900/50"
            : "bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800"
        }`}
      >
        <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
          {table.name}
        </h3>
      </div>

      {/* Columns List */}
      <div className="flex flex-col py-1 pb-2">
        {table.columns.map((col) => (
          <div
            key={col.id}
            className="relative px-4 py-1.5 flex items-center justify-between group hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors"
          >
            {/* Target Handle (Left) */}
            <Handle
              type="target"
              position={Position.Left}
              id={col.id}
              className="!w-1.5 !h-4 !bg-zinc-300 dark:!bg-zinc-600 hover:!bg-blue-500 hover:!w-2 !border-none !rounded-[3px] z-10 opacity-0 group-hover:opacity-100 transition-all !-left-1.5"
            />

            <div className="flex items-center gap-2">
              {col.isPrimary && (
                <Key className="w-3 h-3 text-amber-500 flex-shrink-0" />
              )}
              <span
                className={`text-xs font-medium ${
                  col.isPrimary
                    ? "text-amber-600 dark:text-amber-400"
                    : "text-zinc-700 dark:text-zinc-300"
                }`}
              >
                {col.name}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold text-zinc-400 dark:text-zinc-500 tracking-wider">
                {col.type}
              </span>
              {col.isUnique && !col.isPrimary && (
                <span className="text-[10px] bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 px-1 rounded">
                  UQ
                </span>
              )}
            </div>

            {/* Source Handle (Right) */}
            <Handle
              type="source"
              position={Position.Right}
              id={col.id}
              className="!w-1.5 !h-4 !bg-zinc-300 dark:!bg-zinc-600 hover:!bg-blue-500 hover:!w-2 !border-none !rounded-[3px] z-10 opacity-0 group-hover:opacity-100 transition-all !-right-1.5"
            />
          </div>
        ))}
      </div>
    </div>
  );
});