/* eslint-disable react-hooks/refs */
"use client";

import { useState, useRef, useCallback, useMemo } from "react";
import { useSchemaStore } from "@/store/useSchemaStore";
import { X, Plus, Trash2, Key, Hash, Settings2, GripVertical, Cable, ChevronDown, ArrowRight } from "lucide-react";

const DATA_TYPES = ["UUID", "VARCHAR", "TEXT", "INT", "FLOAT", "BOOLEAN", "DATE", "JSON"];

export function FloatingSidebar({ selectedNodeId }: { selectedNodeId: string | null }) {
  // PERF: Individual selectors — only re-render when tables or
  // relations change, not on every undo/redo/past/future update.
  const tables = useSchemaStore((s) => s.tables);
  const relations = useSchemaStore((s) => s.relations);
  // Actions are stable references — never cause re-renders
  const updateTableName = useSchemaStore((s) => s.updateTableName);
  const addColumn = useSchemaStore((s) => s.addColumn);
  const updateColumn = useSchemaStore((s) => s.updateColumn);
  const removeColumn = useSchemaStore((s) => s.removeColumn);
  const removeTable = useSchemaStore((s) => s.removeTable);
  const reorderColumns = useSchemaStore((s) => s.reorderColumns);
  const removeRelation = useSchemaStore((s) => s.removeRelation);
  const updateRelation = useSchemaStore((s) => s.updateRelation);

  // ── Drag state ──────────────────────────────────────────────
  // sourceIndex lives in a ref so mid-drag events don't cause
  // re-renders.  dropIndicator is state because it drives the
  // visual indicator line that React needs to paint.
  const dragSourceIdx = useRef<number | null>(null);
  const gripActivated = useRef(false);
  const [dropIndicator, setDropIndicator] = useState<{
    index: number;
    edge: "top" | "bottom";
  } | null>(null);

  // ── Handlers ────────────────────────────────────────────────

  /**
   * Grip handle pointer-down sets a flag so onDragStart knows the
   * drag was initiated from the handle, not from an input or button.
   * pointerdown always fires before dragstart on the same element.
   */
  const onGripPointerDown = useCallback(() => {
    gripActivated.current = true;
  }, []);

  const onRowDragStart = useCallback(
    (e: React.DragEvent<HTMLDivElement>, index: number) => {
      if (!gripActivated.current) {
        // Drag didn't originate from the grip handle — cancel it
        // so inputs / buttons / selects keep working normally.
        e.preventDefault();
        return;
      }
      gripActivated.current = false;

      dragSourceIdx.current = index;
      e.dataTransfer.effectAllowed = "move";
      // Minimal transfer data (Firefox requires setData to be called)
      e.dataTransfer.setData("text/plain", String(index));

      // Slightly transparent ghost
      if (e.currentTarget) {
        e.currentTarget.style.opacity = "0.4";
      }
    },
    [],
  );

  const onRowDragEnd = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.currentTarget.style.opacity = "";
      dragSourceIdx.current = null;
      setDropIndicator(null);
      gripActivated.current = false;
    },
    [],
  );

  const onRowDragOver = useCallback(
    (e: React.DragEvent<HTMLDivElement>, index: number) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";

      // Determine whether the cursor is in the top or bottom half
      // of the row — this decides where the blue indicator line sits.
      const rect = e.currentTarget.getBoundingClientRect();
      const midY = rect.top + rect.height / 2;
      const edge: "top" | "bottom" = e.clientY < midY ? "top" : "bottom";

      setDropIndicator((prev) => {
        if (prev && prev.index === index && prev.edge === edge) return prev;
        return { index, edge };
      });
    },
    [],
  );

  const onRowDragLeave = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      // Only clear if we're leaving the row entirely (not entering a child)
      if (!e.currentTarget.contains(e.relatedTarget as Node)) {
        setDropIndicator(null);
      }
    },
    [],
  );

  const onRowDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>, targetIndex: number, tableId: string) => {
      e.preventDefault();
      const fromIndex = dragSourceIdx.current;
      if (fromIndex === null) return;

      // Compute the effective insertion index
      const rect = e.currentTarget.getBoundingClientRect();
      const midY = rect.top + rect.height / 2;
      let toIndex = e.clientY < midY ? targetIndex : targetIndex + 1;

      // Adjust for the removal of the source element
      if (fromIndex < toIndex) toIndex -= 1;

      reorderColumns(tableId, fromIndex, toIndex);
      dragSourceIdx.current = null;
      setDropIndicator(null);
    },
    [reorderColumns],
  );

  // ── Relations section state ─────────────────────────────────
  const [showRelations, setShowRelations] = useState(true);

  // Compute relations involving the selected table, with resolved
  // names for display. Runs before render guards so hooks order is stable.
  const tableRelations = useMemo(() => {
    if (!selectedNodeId) return [];
    return relations
      .filter(
        (r) =>
          r.sourceTableId === selectedNodeId ||
          r.targetTableId === selectedNodeId,
      )
      .map((r) => {
        const otherTableId =
          r.sourceTableId === selectedNodeId
            ? r.targetTableId
            : r.sourceTableId;
        const otherTable = tables.find((t) => t.id === otherTableId);
        const direction: "outgoing" | "incoming" =
          r.sourceTableId === selectedNodeId ? "outgoing" : "incoming";
        return {
          ...r,
          otherTableName: otherTable?.name ?? "unknown",
          direction,
        };
      });
  }, [selectedNodeId, relations, tables]);

  // ── Render guards ───────────────────────────────────────────

  if (!selectedNodeId) return null;

  const table = tables.find((t) => t.id === selectedNodeId);
  if (!table) return null;

  return (
    <div className="absolute z-50 flex flex-col bg-white/95 dark:bg-zinc-950/95 backdrop-blur-xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-2xl overflow-hidden transition-all duration-300
      bottom-0 left-0 right-0 w-full rounded-t-2xl rounded-b-none max-h-[60vh]
      md:top-1/2 md:-translate-y-1/2 md:bottom-auto md:left-6 md:right-auto md:w-85 md:rounded-2xl md:max-h-[85vh]
      animate-in slide-in-from-bottom-8 md:slide-in-from-left-8 fade-in">

      {/* ── Header ──────────────────────────────────────────── */}
      <div className="p-3 md:p-4 border-b border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/50 flex flex-col gap-2 md:gap-3 shrink-0">
        <div className="w-10 h-1 bg-zinc-300 dark:bg-zinc-700 rounded-full mx-auto md:hidden mb-1" />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400">
            <Settings2 className="w-4 h-4" />
            <span className="text-xs font-semibold uppercase tracking-wider hidden sm:inline-block">
              Table Properties
            </span>
          </div>
          <button
            onClick={() => removeTable(table.id)}
            className="p-1.5 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-md transition-colors"
            title="Delete Table"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        <input
          value={table.name}
          onChange={(e) => updateTableName(table.id, e.target.value)}
          className="text-lg md:text-xl font-bold text-zinc-900 dark:text-white bg-transparent hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50 focus:bg-white dark:focus:bg-zinc-900 border border-transparent focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 rounded-lg px-2 py-1 outline-none transition-all w-full"
          placeholder="table_name"
        />
      </div>

      {/* ── Columns List (Drag-Reorderable) ─────────────────── */}
      <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-zinc-300 dark:[&::-webkit-scrollbar-thumb]:bg-zinc-700 [&::-webkit-scrollbar-thumb]:rounded-full pb-2">

        {table.columns.length === 0 && (
          <div className="p-6 text-center text-sm text-zinc-500">
            No columns yet. Add one below.
          </div>
        )}

        {table.columns.map((col, index) => (
          <div key={col.id} className="relative">

            {/* Drop indicator — blue line above this row */}
            {dropIndicator &&
              dropIndicator.index === index &&
              dropIndicator.edge === "top" &&
              dragSourceIdx.current !== null &&
              dragSourceIdx.current !== index && (
              <div className="absolute top-0 left-3 right-3 z-10 flex items-center pointer-events-none">
                <div className="w-2 h-2 rounded-full bg-blue-500 -ml-1 shrink-0" />
                <div className="flex-1 h-0.5 bg-blue-500 rounded-full" />
                <div className="w-2 h-2 rounded-full bg-blue-500 -mr-1 shrink-0" />
              </div>
            )}

            {/* Column row */}
            <div
              draggable
              onDragStart={(e) => onRowDragStart(e, index)}
              onDragEnd={onRowDragEnd}
              onDragOver={(e) => onRowDragOver(e, index)}
              onDragLeave={onRowDragLeave}
              onDrop={(e) => onRowDrop(e, index, table.id)}
              className={`group flex flex-col gap-2.5 p-3 md:p-4 border-b border-zinc-100 dark:border-zinc-800/50 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30 transition-colors last:border-0 ${
                dragSourceIdx.current === index ? "opacity-40" : ""
              }`}
            >
              {/* Top Row: Grip + Name + Delete */}
              <div className="flex items-center gap-1.5">
                {/* Drag grip handle */}
                <button
                  type="button"
                  onPointerDown={onGripPointerDown}
                  className="p-0.5 cursor-grab active:cursor-grabbing text-zinc-300 dark:text-zinc-600 hover:text-zinc-500 dark:hover:text-zinc-400 transition-colors touch-none shrink-0 md:opacity-0 md:group-hover:opacity-100"
                  tabIndex={-1}
                  aria-label={`Reorder ${col.name}`}
                >
                  <GripVertical className="w-4 h-4" />
                </button>

                <input
                  value={col.name}
                  onChange={(e) =>
                    updateColumn(table.id, col.id, { name: e.target.value })
                  }
                  className="flex-1 text-sm font-semibold text-zinc-800 dark:text-zinc-200 bg-transparent hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50 focus:bg-white dark:focus:bg-zinc-900 border border-transparent focus:border-blue-500 rounded px-1.5 py-0.5 outline-none transition-all min-w-0"
                  placeholder="column_name"
                />

                <button
                  onClick={() => removeColumn(table.id, col.id)}
                  className="p-1 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/50 rounded transition-all md:opacity-0 md:group-hover:opacity-100 shrink-0"
                  title="Remove Column"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Bottom Row: Type Selector & Constraints */}
              <div className="flex flex-wrap items-center gap-2 pl-6">
                <select
                  value={col.type}
                  onChange={(e) =>
                    updateColumn(table.id, col.id, { type: e.target.value })
                  }
                  className="flex-1 min-w-[100px] text-xs font-mono bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-md px-2 py-1.5 outline-none focus:ring-2 focus:ring-blue-500/50 cursor-pointer"
                >
                  {DATA_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>

                {/* Segmented Toggles */}
                <div className="flex items-center bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md p-0.5">
                  <button
                    onClick={() =>
                      updateColumn(table.id, col.id, {
                        isPrimary: !col.isPrimary,
                      })
                    }
                    className={`flex items-center gap-1 px-2 py-1 rounded-sm text-[10px] font-bold uppercase transition-all ${
                      col.isPrimary
                        ? "bg-white dark:bg-zinc-800 text-amber-500 shadow-sm border border-zinc-200 dark:border-zinc-700"
                        : "text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                    }`}
                    title="Toggle Primary Key"
                  >
                    <Key className="w-3 h-3" />{" "}
                    <span className="hidden sm:inline">PK</span>
                  </button>

                  <button
                    onClick={() =>
                      updateColumn(table.id, col.id, {
                        isUnique: !col.isUnique,
                      })
                    }
                    className={`flex items-center gap-1 px-2 py-1 rounded-sm text-[10px] font-bold uppercase transition-all ${
                      col.isUnique
                        ? "bg-white dark:bg-zinc-800 text-blue-500 shadow-sm border border-zinc-200 dark:border-zinc-700"
                        : "text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                    }`}
                    title="Toggle Unique Constraint"
                  >
                    <Hash className="w-3 h-3" />{" "}
                    <span className="hidden sm:inline">UQ</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Drop indicator — blue line below this row (last item only) */}
            {dropIndicator &&
              dropIndicator.index === index &&
              dropIndicator.edge === "bottom" &&
              dragSourceIdx.current !== null &&
              dragSourceIdx.current !== index &&
              dragSourceIdx.current !== index + 1 && (
              <div className="absolute bottom-0 left-3 right-3 z-10 flex items-center pointer-events-none">
                <div className="w-2 h-2 rounded-full bg-blue-500 -ml-1 shrink-0" />
                <div className="flex-1 h-0.5 bg-blue-500 rounded-full" />
                <div className="w-2 h-2 rounded-full bg-blue-500 -mr-1 shrink-0" />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* ── Relationships Section ───────────────────────────── */}
      {tableRelations.length > 0 && (
        <div className="border-t border-zinc-200/80 dark:border-zinc-800/80 shrink-0">
          {/* Section header — collapsible */}
          <button
            onClick={() => setShowRelations((v) => !v)}
            className="w-full flex items-center justify-between px-3 md:px-4 py-2.5 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Cable className="w-3.5 h-3.5" />
              <span className="text-xs font-semibold uppercase tracking-wider">
                Relationships
              </span>
              <span className="text-[10px] font-bold tabular-nums bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400 px-1.5 py-0.5 rounded-md">
                {tableRelations.length}
              </span>
            </div>
            <ChevronDown
              className={`w-3.5 h-3.5 transition-transform duration-200 ${
                showRelations ? "" : "-rotate-90"
              }`}
            />
          </button>

          {/* Relation rows */}
          {showRelations && (
            <div className="max-h-40 overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-zinc-300 dark:[&::-webkit-scrollbar-thumb]:bg-zinc-700 [&::-webkit-scrollbar-thumb]:rounded-full">
              {tableRelations.map((rel) => {
                const typeColor =
                  rel.type === "1:1"
                    ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60"
                    : rel.type === "1:n"
                      ? "bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800/60"
                      : "bg-violet-50 dark:bg-violet-950/40 text-violet-700 dark:text-violet-300 border-violet-200 dark:border-violet-800/60";

                return (
                  <div
                    key={rel.id}
                    className="group flex items-center gap-2 px-3 md:px-4 py-2 border-t border-zinc-100 dark:border-zinc-800/30 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30 transition-colors"
                  >
                    {/* Type badge */}
                    <button
                      onClick={() => {
                        const next =
                          rel.type === "1:n"
                            ? "m:n"
                            : rel.type === "m:n"
                              ? "1:1"
                              : "1:n";
                        updateRelation(rel.id, next);
                      }}
                      className={`shrink-0 px-1.5 py-0.5 rounded text-[9px] font-bold border transition-all hover:brightness-95 active:scale-95 ${typeColor}`}
                      title="Click to cycle type"
                    >
                      {rel.type}
                    </button>

                    {/* Direction arrow + other table */}
                    <div className="flex items-center gap-1 min-w-0 flex-1 text-xs">
                      <ArrowRight
                        className={`w-3 h-3 shrink-0 text-zinc-400 ${
                          rel.direction === "incoming" ? "rotate-180" : ""
                        }`}
                      />
                      <span className="font-semibold text-zinc-700 dark:text-zinc-300 truncate">
                        {rel.otherTableName}
                      </span>
                    </div>

                    {/* Delete */}
                    <button
                      onClick={() => removeRelation(rel.id)}
                      className="p-0.5 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/50 rounded transition-all md:opacity-0 md:group-hover:opacity-100 shrink-0"
                      title="Remove relationship"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── Footer ──────────────────────────────────────────── */}
      <div className="p-3 md:p-4 border-t border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-50/30 dark:bg-zinc-900/30 shrink-0">
        <button
          onClick={() => addColumn(table.id)}
          className="w-full py-2 flex items-center justify-center gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-lg transition-all shadow-sm active:scale-95"
        >
          <Plus className="w-4 h-4" /> Add Column
        </button>
      </div>
    </div>
  );
}