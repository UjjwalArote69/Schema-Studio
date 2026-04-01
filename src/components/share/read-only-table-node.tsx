// ============================================================
// FILE: src/components/share/read-only-table-node.tsx
//
// Simplified table node for the public share viewer.
// No connection handles, no hover effects — pure display.
// ============================================================

"use client";

import { memo } from "react";
import { Handle, Position } from "@xyflow/react";
import type { Table } from "@/store/useSchemaStore";
import { Key } from "lucide-react";

export const ReadOnlyTableNode = memo(function ReadOnlyTableNode({
  data,
}: {
  data: { table: Table };
  selected?: boolean;
}) {
  const { table } = data;

  return (
    <div className="bg-white dark:bg-zinc-950 border-2 border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xl min-w-[220px] transition-shadow">
      {/* Table Header */}
      <div className="px-4 py-2 flex items-center justify-between border-b rounded-t-[10px] bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
        <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
          {table.name}
        </h3>
      </div>

      {/* Columns List */}
      <div className="flex flex-col py-1 pb-2">
        {table.columns.map((col) => (
          <div
            key={col.id}
            className="relative px-4 py-1.5 flex items-center justify-between"
          >
            {/* Hidden handles for edge routing (invisible but needed for edges to connect) */}
            <Handle
              type="target"
              position={Position.Left}
              id={col.id}
              className="!w-0 !h-0 !bg-transparent !border-none !-left-px"
              isConnectable={false}
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

            {/* Hidden handles for edge routing */}
            <Handle
              type="source"
              position={Position.Right}
              id={col.id}
              className="w-0! !h-0 !bg-transparent !border-none !-right-px"
              isConnectable={false}
            />
          </div>
        ))}
      </div>
    </div>
  );
});