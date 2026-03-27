"use client";

import { useSchemaStore } from "@/store/useSchemaStore";
import { X, Plus, Trash2, Key, Hash, Settings2 } from "lucide-react";

export function FloatingSidebar({ selectedNodeId }: { selectedNodeId: string | null }) {
  const { tables, updateTableName, addColumn, updateColumn, removeColumn, removeTable } = useSchemaStore();

  if (!selectedNodeId) return null;

  const table = tables.find((t) => t.id === selectedNodeId);
  if (!table) return null;

  const DATA_TYPES = ["UUID", "VARCHAR", "TEXT", "INT", "FLOAT", "BOOLEAN", "DATE", "JSON"];

  return (
    // Responsive Positioning: Bottom sheet on mobile, Floating Left Center on md+
    <div className="absolute z-50 flex flex-col bg-white/95 dark:bg-zinc-950/95 backdrop-blur-xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-2xl overflow-hidden transition-all duration-300 
      bottom-0 left-0 right-0 w-full rounded-t-2xl rounded-b-none max-h-[60vh] 
      md:top-1/2 md:-translate-y-1/2 md:bottom-auto md:left-6 md:right-auto md:w-85 md:rounded-2xl md:max-h-[85vh] 
      animate-in slide-in-from-bottom-8 md:slide-in-from-left-8 fade-in">
      
      {/* Sleek Header */}
      <div className="p-3 md:p-4 border-b border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/50 flex flex-col gap-2 md:gap-3 shrink-0">
        {/* Mobile Pull Handle Indicator */}
        <div className="w-10 h-1 bg-zinc-300 dark:bg-zinc-700 rounded-full mx-auto md:hidden mb-1" />
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400">
            <Settings2 className="w-4 h-4" />
            <span className="text-xs font-semibold uppercase tracking-wider hidden sm:inline-block">Table Properties</span>
          </div>
          <button 
            onClick={() => removeTable(table.id)}
            className="p-1.5 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-md transition-colors"
            title="Delete Table"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
        
        {/* Clean table name input */}
        <input 
          value={table.name}
          onChange={(e) => updateTableName(table.id, e.target.value)}
          className="text-lg md:text-xl font-bold text-zinc-900 dark:text-white bg-transparent hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50 focus:bg-white dark:focus:bg-zinc-900 border border-transparent focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 rounded-lg px-2 py-1 outline-none transition-all w-full"
          placeholder="table_name"
        />
      </div>

      {/* Flat List Columns Area */}
      <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-zinc-300 dark:[&::-webkit-scrollbar-thumb]:bg-zinc-700 [&::-webkit-scrollbar-thumb]:rounded-full pb-2">
        
        {table.columns.length === 0 && (
          <div className="p-6 text-center text-sm text-zinc-500">
            No columns yet. Add one below.
          </div>
        )}

        {table.columns.map((col) => (
          <div 
            key={col.id} 
            className="group flex flex-col gap-2.5 p-3 md:p-4 border-b border-zinc-100 dark:border-zinc-800/50 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30 transition-colors last:border-0"
          >
            {/* Top Row: Name Input & Delete */}
            <div className="flex items-center justify-between gap-2">
              <input 
                value={col.name}
                onChange={(e) => updateColumn(table.id, col.id, { name: e.target.value })}
                className="flex-1 text-sm font-semibold text-zinc-800 dark:text-zinc-200 bg-transparent hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50 focus:bg-white dark:focus:bg-zinc-900 border border-transparent focus:border-blue-500 rounded px-1.5 py-0.5 outline-none transition-all"
                placeholder="column_name"
              />
              <button 
                onClick={() => removeColumn(table.id, col.id)}
                className="p-1 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/50 rounded transition-all md:opacity-0 md:group-hover:opacity-100"
                title="Remove Column"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Bottom Row: Type Selector & Constraints */}
            <div className="flex flex-wrap items-center gap-2 pl-1.5">
              <select 
                value={col.type}
                onChange={(e) => updateColumn(table.id, col.id, { type: e.target.value })}
                className="flex-1 min-w-[100px] text-xs font-mono bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-md px-2 py-1.5 outline-none focus:ring-2 focus:ring-blue-500/50 cursor-pointer"
              >
                {DATA_TYPES.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>

              {/* Segmented Toggles */}
              <div className="flex items-center bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md p-0.5">
                <button 
                  onClick={() => updateColumn(table.id, col.id, { isPrimary: !col.isPrimary })}
                  className={`flex items-center gap-1 px-2 py-1 rounded-sm text-[10px] font-bold uppercase transition-all ${
                    col.isPrimary 
                    ? "bg-white dark:bg-zinc-800 text-amber-500 shadow-sm border border-zinc-200 dark:border-zinc-700" 
                    : "text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                  }`}
                  title="Toggle Primary Key"
                >
                  <Key className="w-3 h-3" /> <span className="hidden sm:inline">PK</span>
                </button>
                
                <button 
                  onClick={() => updateColumn(table.id, col.id, { isUnique: !col.isUnique })}
                  className={`flex items-center gap-1 px-2 py-1 rounded-sm text-[10px] font-bold uppercase transition-all ${
                    col.isUnique 
                    ? "bg-white dark:bg-zinc-800 text-blue-500 shadow-sm border border-zinc-200 dark:border-zinc-700" 
                    : "text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                  }`}
                  title="Toggle Unique Constraint"
                >
                  <Hash className="w-3 h-3" /> <span className="hidden sm:inline">UQ</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer Add Button */}
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