import { create } from "zustand";
import {
  enablePatches,
  produceWithPatches,
  applyPatches,
  type Patch,
} from "immer";

enablePatches();

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface Column {
  id: string;
  name: string;
  type: string;
  isPrimary?: boolean;
  isUnique?: boolean;
}

export interface Table {
  id: string;
  name: string;
  position: { x: number; y: number };
  columns: Column[];
}

export interface Relation {
  id: string;
  sourceTableId: string;
  sourceColumnId: string;
  targetTableId: string;
  targetColumnId: string;
  type: "1:1" | "1:n" | "m:n";
}

/** Lightweight undo entry — only the delta, not a full snapshot. */
type HistoryEntry = {
  patches: Patch[];
  inversePatches: Patch[];
};

type SchemaData = { tables: Table[]; relations: Relation[] };

interface SchemaState {
  tables: Table[];
  relations: Relation[];

  // --- HISTORY STATE ---
  past: HistoryEntry[];
  future: HistoryEntry[];

  // --- HISTORY ACTIONS ---
  beginDrag: () => void;
  commitDrag: () => void;
  undo: () => void;
  redo: () => void;

  // --- SCHEMA ACTIONS ---
  setSchema: (tables: Table[], relations: Relation[]) => void;
  addTable: (position: { x: number; y: number }) => void;
  removeTable: (id: string) => void;
  updateTableName: (id: string, name: string) => void;
  updateTablePosition: (
    id: string,
    position: { x: number; y: number },
  ) => void;
  addColumn: (tableId: string) => void;
  updateColumn: (
    tableId: string,
    columnId: string,
    data: Partial<Column>,
  ) => void;
  removeColumn: (tableId: string, columnId: string) => void;
  addRelation: (relation: Omit<Relation, "id">) => void;
  removeRelation: (id: string) => void;
  updateRelation: (id: string, type: "1:1" | "1:n" | "m:n") => void;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const generateId = () => Math.random().toString(36).substring(2, 9);
const MAX_HISTORY = 50;

/**
 * Closure variable for drag tracking.
 * Kept outside Zustand state so it doesn't trigger re-renders.
 */
let dragSnapshot: SchemaData | null = null;

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export const useSchemaStore = create<SchemaState>((set, get) => {
  /**
   * Run a mutation expressed as an Immer recipe and push the resulting
   * patches onto the undo stack.  Unchanged objects keep the same JS
   * reference (structural sharing), so React.memo on child components
   * works correctly.
   *
   * Before (full snapshot):
   *   JSON.parse(JSON.stringify({ tables, relations }))   — O(n) clone
   *   50 tables × 20 cols → ~1 000 objects deep-copied per action
   *   50-entry undo stack  → ~50 full copies held in memory
   *
   * After (patch):
   *   { op: "replace", path: ["tables", 3, "name"], value: "users" }
   *   — O(1) allocation, ~100 bytes regardless of schema size
   */
  function withUndo(recipe: (draft: SchemaData) => void) {
    const { tables, relations, past } = get();
    const [next, patches, inversePatches] = produceWithPatches(
      { tables, relations } as SchemaData,
      recipe,
    );

    // No-op guard — if nothing actually changed, don't pollute history
    if (patches.length === 0) return;

    set({
      tables: next.tables,
      relations: next.relations,
      past: [...past, { patches, inversePatches }].slice(-MAX_HISTORY),
      future: [],
    });
  }

  return {
    tables: [],
    relations: [],
    past: [],
    future: [],

    // -----------------------------------------------------------------
    // TIME MACHINE — patch-based undo / redo
    // -----------------------------------------------------------------

    undo: () => {
      const { past, future, tables, relations } = get();
      if (past.length === 0) return;

      const entry = past[past.length - 1];
      const restored = applyPatches(
        { tables, relations } as SchemaData,
        entry.inversePatches,
      );

      set({
        tables: restored.tables,
        relations: restored.relations,
        past: past.slice(0, -1),
        future: [entry, ...future],
      });
    },

    redo: () => {
      const { past, future, tables, relations } = get();
      if (future.length === 0) return;

      const entry = future[0];
      const restored = applyPatches(
        { tables, relations } as SchemaData,
        entry.patches,
      );

      set({
        tables: restored.tables,
        relations: restored.relations,
        past: [...past, entry],
        future: future.slice(1),
      });
    },

    // -----------------------------------------------------------------
    // DRAG HANDLING
    //
    // Drags fire updateTablePosition many times per second.  We capture
    // one reference snapshot when the drag starts, then when the drag
    // ends we diff the snapshot against the current state and push a
    // single patch entry.
    //
    // Wire up in the editor:
    //   onNodeDragStart  → beginDrag()
    //   onNodeDragStop   → commitDrag()
    // -----------------------------------------------------------------

    beginDrag: () => {
      const { tables, relations } = get();
      // Safe to store by reference: updateTablePosition creates new
      // table objects via spread, so these original references stay frozen.
      dragSnapshot = { tables, relations };
    },

    commitDrag: () => {
      const snap = dragSnapshot;
      if (!snap) return;
      dragSnapshot = null;

      const { tables, past } = get();

      // Replay position deltas into an Immer recipe to produce patches.
      const [, patches, inversePatches] = produceWithPatches(snap, (draft) => {
        for (const draftTable of draft.tables) {
          const current = tables.find((t) => t.id === draftTable.id);
          if (
            current &&
            (current.position.x !== draftTable.position.x ||
              current.position.y !== draftTable.position.y)
          ) {
            draftTable.position = { ...current.position };
          }
        }
      });

      if (patches.length === 0) return; // drag ended at same position
      set({
        past: [...past, { patches, inversePatches }].slice(-MAX_HISTORY),
        future: [],
      });
    },

    // -----------------------------------------------------------------
    // CORE ACTIONS
    // -----------------------------------------------------------------

    setSchema: (tables, relations) =>
      set({ tables, relations, past: [], future: [] }),

    addTable: (position) => {
      withUndo((draft) => {
        draft.tables.push({
          id: `t_${generateId()}`,
          name: "new_table",
          position,
          columns: [
            {
              id: `c_${generateId()}`,
              name: "id",
              type: "UUID",
              isPrimary: true,
            },
          ],
        });
      });
    },

    removeTable: (id) => {
      withUndo((draft) => {
        for (let i = draft.relations.length - 1; i >= 0; i--) {
          const r = draft.relations[i];
          if (r.sourceTableId === id || r.targetTableId === id) {
            draft.relations.splice(i, 1);
          }
        }
        const idx = draft.tables.findIndex((t) => t.id === id);
        if (idx !== -1) draft.tables.splice(idx, 1);
      });
    },

    updateTableName: (id, name) => {
      withUndo((draft) => {
        const table = draft.tables.find((t) => t.id === id);
        if (table) table.name = name;
      });
    },

    updateTablePosition: (id, position) => {
      // Silent — no undo entry.  Use beginDrag / commitDrag instead.
      set((state) => ({
        tables: state.tables.map((t) =>
          t.id === id ? { ...t, position } : t,
        ),
      }));
    },

    addColumn: (tableId) => {
      withUndo((draft) => {
        const table = draft.tables.find((t) => t.id === tableId);
        if (table) {
          table.columns.push({
            id: `c_${generateId()}`,
            name: "new_column",
            type: "VARCHAR",
          });
        }
      });
    },

    updateColumn: (tableId, columnId, data) => {
      withUndo((draft) => {
        const table = draft.tables.find((t) => t.id === tableId);
        if (!table) return;
        const col = table.columns.find((c) => c.id === columnId);
        if (col) Object.assign(col, data);
      });
    },

    removeColumn: (tableId, columnId) => {
      withUndo((draft) => {
        const table = draft.tables.find((t) => t.id === tableId);
        if (table) {
          const idx = table.columns.findIndex((c) => c.id === columnId);
          if (idx !== -1) table.columns.splice(idx, 1);
        }
        for (let i = draft.relations.length - 1; i >= 0; i--) {
          const r = draft.relations[i];
          if (
            r.sourceColumnId === columnId ||
            r.targetColumnId === columnId
          ) {
            draft.relations.splice(i, 1);
          }
        }
      });
    },

    addRelation: (relation) => {
      withUndo((draft) => {
        draft.relations.push({ ...relation, id: `r_${generateId()}` });
      });
    },

    removeRelation: (id) => {
      withUndo((draft) => {
        const idx = draft.relations.findIndex((r) => r.id === id);
        if (idx !== -1) draft.relations.splice(idx, 1);
      });
    },

    updateRelation: (id, type) => {
      withUndo((draft) => {
        const rel = draft.relations.find((r) => r.id === id);
        if (rel) rel.type = type;
      });
    },
  };
});