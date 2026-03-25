import { create } from 'zustand';

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
  type: '1:1' | '1:n' | 'm:n';
}

interface SchemaState {
  tables: Table[];
  relations: Relation[];
  
  // --- HISTORY STATE ---
  past: { tables: Table[]; relations: Relation[] }[];
  future: { tables: Table[]; relations: Relation[] }[];
  
  // --- HISTORY ACTIONS ---
  saveHistory: () => void;
  undo: () => void;
  redo: () => void;

  // --- SCHEMA ACTIONS ---
  setSchema: (tables: Table[], relations: Relation[]) => void;
  addTable: (position: { x: number; y: number }) => void;
  removeTable: (id: string) => void;
  updateTableName: (id: string, name: string) => void;
  updateTablePosition: (id: string, position: { x: number; y: number }) => void;
  addColumn: (tableId: string) => void;
  updateColumn: (tableId: string, columnId: string, data: Partial<Column>) => void;
  removeColumn: (tableId: string, columnId: string) => void;
  addRelation: (relation: Omit<Relation, 'id'>) => void;
  removeRelation: (id: string) => void;
  updateRelation: (id: string, type: '1:1' | '1:n' | 'm:n') => void;
}

const generateId = () => Math.random().toString(36).substring(2, 9);
const MAX_HISTORY = 50; // Cap history to prevent memory leaks

export const useSchemaStore = create<SchemaState>((set, get) => ({
  tables: [],
  relations: [],
  past: [],
  future: [],

  // --- TIME MACHINE ENGINE ---
  saveHistory: () => {
    const { tables, relations, past } = get();
    // Deep copy to prevent JS reference mutation bugs
    const currentSnapshot = JSON.parse(JSON.stringify({ tables, relations }));
    set({
      past: [...past, currentSnapshot].slice(-MAX_HISTORY),
      future: [], // Every new action wipes out the "future" redo stack
    });
  },

  undo: () => {
    const { past, future, tables, relations } = get();
    if (past.length === 0) return;

    const previousState = past[past.length - 1];
    const newPast = past.slice(0, past.length - 1);
    const currentSnapshot = JSON.parse(JSON.stringify({ tables, relations }));

    set({
      past: newPast,
      future: [currentSnapshot, ...future],
      tables: previousState.tables,
      relations: previousState.relations,
    });
  },

  redo: () => {
    const { past, future, tables, relations } = get();
    if (future.length === 0) return;

    const nextState = future[0];
    const newFuture = future.slice(1);
    const currentSnapshot = JSON.parse(JSON.stringify({ tables, relations }));

    set({
      past: [...past, currentSnapshot],
      future: newFuture,
      tables: nextState.tables,
      relations: nextState.relations,
    });
  },

  // --- CORE ACTIONS (Now saving history!) ---
  setSchema: (tables, relations) => set({ tables, relations, past: [], future: [] }),

  addTable: (position) => {
    get().saveHistory();
    set((state) => {
      const newTable: Table = {
        id: `t_${generateId()}`,
        name: "new_table",
        position,
        columns: [{ id: `c_${generateId()}`, name: "id", type: "UUID", isPrimary: true }],
      };
      return { tables: [...state.tables, newTable] };
    });
  },

  removeTable: (id) => {
    get().saveHistory();
    set((state) => ({
      tables: state.tables.filter((t) => t.id !== id),
      relations: state.relations.filter((r) => r.sourceTableId !== id && r.targetTableId !== id),
    }));
  },

  updateTableName: (id, name) => {
    get().saveHistory();
    set((state) => ({
      tables: state.tables.map((t) => t.id === id ? { ...t, name } : t)
    }));
  },

  updateTablePosition: (id, position) => {
    get().saveHistory();
    set((state) => ({
      tables: state.tables.map((t) => t.id === id ? { ...t, position } : t)
    }));
  },

  addColumn: (tableId) => {
    get().saveHistory();
    set((state) => ({
      tables: state.tables.map((t) => {
        if (t.id === tableId) {
          return { ...t, columns: [...t.columns, { id: `c_${generateId()}`, name: "new_column", type: "VARCHAR" }] };
        }
        return t;
      })
    }));
  },

  updateColumn: (tableId, columnId, data) => {
    get().saveHistory();
    set((state) => ({
      tables: state.tables.map((t) => {
        if (t.id === tableId) {
          return {
            ...t,
            columns: t.columns.map((c) => c.id === columnId ? { ...c, ...data } : c)
          };
        }
        return t;
      })
    }));
  },

  removeColumn: (tableId, columnId) => {
    get().saveHistory();
    set((state) => ({
      tables: state.tables.map((t) => {
        if (t.id === tableId) {
          return { ...t, columns: t.columns.filter((c) => c.id !== columnId) };
        }
        return t;
      }),
      relations: state.relations.filter((r) => r.sourceColumnId !== columnId && r.targetColumnId !== columnId),
    }));
  },

  addRelation: (relation) => {
    get().saveHistory();
    set((state) => ({
      relations: [...state.relations, { ...relation, id: `r_${generateId()}` }]
    }));
  },

  removeRelation: (id) => {
    get().saveHistory();
    set((state) => ({
      relations: state.relations.filter((r) => r.id !== id)
    }));
  },

  updateRelation: (id, type) => {
    get().saveHistory();
    set((state) => ({
      relations: state.relations.map((r) => r.id === id ? { ...r, type } : r)
    }));
  },
}));