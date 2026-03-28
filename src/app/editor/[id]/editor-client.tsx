/* eslint-disable react-hooks/refs */
/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState, useRef, useCallback, useMemo, Component } from "react";
import type { ErrorInfo, ReactNode } from "react";
import {
  Database,
  Plus,
  Cloud,
  Loader2,
  ChevronLeft,
  Code,
  PenLine,
  Undo2,
  Redo2,
  AlertTriangle,
  RotateCcw,
} from "lucide-react";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { updateSchema } from "@/app/actions/schema-actions";
import { useSchemaEditor } from "@/hooks/useSchemaEditor";
import { SchemaCanvas } from "@/components/editor/schema-canvas";
import { ImportModal } from "@/components/editor/import-modal";

// ═══════════════════════════════════════════════════════════════
// Authenticated Editor — owns auto-save, project name, toolbar
// ═══════════════════════════════════════════════════════════════

function EditorClient({ project }: { project: any }) {
  const editor = useSchemaEditor();
  const { tables, relations, addTable, setSchema, undo, redo, past, future } = editor;

  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [projectName, setProjectName] = useState(project.name);

  // ── Initialization tracking ─────────────────────────────────
  const [isReady, setIsReady] = useState(false);
  const hasInitialized = useRef(false);
  const saveVersionRef = useRef(0);
  const lastSavedSnapshotRef = useRef("");

  // ── Initialize schema from project data ─────────────────────
  useEffect(() => {
    if (!hasInitialized.current) {
      const savedData = (project.data as { tables?: any[]; relations?: any[] }) || {};
      setSchema(savedData.tables || [], savedData.relations || []);
      hasInitialized.current = true;
      setIsReady(true);
    }
  }, [project.data, setSchema]);

  // ── PERF: Ref-based auto-save ───────────────────────────────
  // Instead of putting tables/relations in the effect deps (which
  // would trigger the effect on every position update during drag),
  // we store them in refs. The effect uses a polling interval to
  // check if the data has changed, but only serializes + saves
  // after a debounce period of inactivity.
  //
  // This eliminates the cascade:
  //   drag → tables change → effect fires → timer created → timer cleared
  //   (repeated 60x/sec during drag)
  const tablesRef = useRef(tables);
  tablesRef.current = tables;
  const relationsRef = useRef(relations);
  relationsRef.current = relations;
  const projectNameRef = useRef(projectName);
  projectNameRef.current = projectName;

  // Zustand's `tables` array reference changes on every mutation.
  // We track the last-seen reference to know when to start the
  // debounce timer, without running JSON.stringify on every frame.
  const lastSeenTablesRef = useRef(tables);
  const lastSeenRelationsRef = useRef(relations);
  const lastSeenNameRef = useRef(projectName);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!isReady) return;

    // Check if anything actually changed (reference equality — O(1))
    const tablesChanged = tables !== lastSeenTablesRef.current;
    const relationsChanged = relations !== lastSeenRelationsRef.current;
    const nameChanged = projectName !== lastSeenNameRef.current;

    lastSeenTablesRef.current = tables;
    lastSeenRelationsRef.current = relations;
    lastSeenNameRef.current = projectName;

    if (!tablesChanged && !relationsChanged && !nameChanged) return;

    // Clear previous debounce timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    const thisVersion = ++saveVersionRef.current;

    debounceTimerRef.current = setTimeout(() => {
      // Stringify inside the timer — only runs after 1.5s of inactivity
      const currentTables = tablesRef.current;
      const currentRelations = relationsRef.current;
      const currentName = projectNameRef.current;

      const snapshot = JSON.stringify({
        projectName: currentName,
        tables: currentTables,
        relations: currentRelations,
      });

      if (snapshot === lastSavedSnapshotRef.current) return;

      setIsSaving(true);
      updateSchema(project.id, currentName, {
        tables: currentTables,
        relations: currentRelations,
      })
        .then(() => {
          if (saveVersionRef.current === thisVersion) {
            lastSavedSnapshotRef.current = snapshot;
            setIsSaving(false);
          }
        })
        .catch((err) => {
          console.error("Failed to save", err);
          if (saveVersionRef.current === thisVersion) setIsSaving(false);
        });
    }, 3000);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [tables, relations, projectName, project.id, isReady]);

  // ── Memoized callbacks for toolbar ──────────────────────────
  const handleAddTable = useCallback(() => {
    addTable({
      x: Math.random() * 100 + 50,
      y: Math.random() * 100 + 50,
    });
  }, [addTable]);

  const openExport = useCallback(() => setIsExportOpen(true), []);
  const closeExport = useCallback(() => setIsExportOpen(false), []);
  const openImport = useCallback(() => setIsImportOpen(true), []);
  const closeImport = useCallback(() => setIsImportOpen(false), []);

  // ── Derived values for toolbar (cheap comparisons) ──────────
  const hasUndo = past.length > 0;
  const hasRedo = future.length > 0;
  const hasTables = tables.length > 0;

  // ── Toolbar ─────────────────────────────────────────────────
  const toolbar = useMemo(
    () => (
      <div className="h-14 bg-white dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between px-2 sm:px-4 z-10 shadow-sm transition-colors duration-300 w-full">
        {/* Left: Branding & Status */}
        <div className="flex items-center gap-1 sm:gap-3 flex-1 min-w-0">
          <Link
            href="/dashboard"
            className="p-1.5 text-zinc-500 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-all shrink-0"
            title="Back to Dashboard"
          >
            <ChevronLeft className="w-5 h-5" />
          </Link>

          <div className="w-px h-5 bg-zinc-200 dark:bg-zinc-800 mx-0.5 hidden sm:block shrink-0" />

          <div className="hidden md:flex items-center gap-2 font-semibold select-none cursor-default opacity-80 shrink-0">
            <Database className="w-4 h-4 text-black dark:text-white" />
            <span className="text-sm text-zinc-900 dark:text-zinc-100">Schema Studio</span>
          </div>

          <span className="text-zinc-300 dark:text-zinc-700 font-light hidden md:inline-block shrink-0">/</span>

          <div className="relative group flex items-center min-w-0 flex-1 max-w-[200px]">
            <input
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="text-sm font-bold sm:font-medium text-zinc-900 dark:text-zinc-100 bg-transparent border border-transparent hover:border-zinc-200 dark:hover:border-zinc-800 focus:border-zinc-300 dark:focus:border-zinc-700 focus:bg-zinc-50 dark:focus:bg-zinc-900 focus:outline-none rounded px-1.5 sm:px-2 py-1 w-full transition-all truncate"
            />
            <PenLine className="w-3 h-3 text-zinc-400 absolute right-2 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity hidden sm:block" />
          </div>

          <div className="flex items-center justify-center p-1.5 sm:px-2.5 sm:py-1 bg-zinc-50 dark:bg-zinc-900/50 rounded-full border border-zinc-200 dark:border-zinc-800 text-xs font-medium text-zinc-500 shadow-sm shrink-0">
            {isSaving ? (
              <Loader2 className="w-3.5 h-3.5 sm:w-3 sm:h-3 animate-spin text-zinc-500" />
            ) : (
              <Cloud className="w-3.5 h-3.5 sm:w-3 sm:h-3 text-green-500" />
            )}
            <span className="hidden sm:inline ml-1.5">{isSaving ? "Saving" : "Saved"}</span>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0 pl-2">
          <div className="items-center bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md p-0.5 hidden lg:flex">
            <button
              onClick={undo}
              disabled={!hasUndo}
              className={`p-1.5 rounded-sm transition-colors ${!hasUndo ? "opacity-30 cursor-not-allowed" : "hover:bg-white dark:hover:bg-zinc-800 hover:shadow-sm text-zinc-700 dark:text-zinc-300"}`}
              title="Undo (Cmd+Z)"
            >
              <Undo2 className="w-4 h-4" />
            </button>
            <button
              onClick={redo}
              disabled={!hasRedo}
              className={`p-1.5 rounded-sm transition-colors ${!hasRedo ? "opacity-30 cursor-not-allowed" : "hover:bg-white dark:hover:bg-zinc-800 hover:shadow-sm text-zinc-700 dark:text-zinc-300"}`}
              title="Redo (Cmd+Shift+Z)"
            >
              <Redo2 className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={handleAddTable}
            title="Add Table"
            className="flex items-center justify-center gap-1.5 p-2 sm:px-3 sm:py-1.5 bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-black dark:text-white rounded-md text-xs font-semibold transition-colors border border-zinc-200 dark:border-zinc-800 shrink-0"
          >
            <Plus className="w-5 h-5 sm:w-3.5 sm:h-3.5" />
            <span className="hidden sm:inline">Add Table</span>
          </button>

          <button
            onClick={openExport}
            disabled={!hasTables}
            title="Export Code"
            className="flex items-center justify-center gap-1.5 p-2 sm:px-3 sm:py-1.5 bg-black dark:bg-white text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200 rounded-md text-xs font-semibold transition-all shadow-sm disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
          >
            <Code className="w-5 h-5 sm:w-3.5 sm:h-3.5" />
            <span className="hidden sm:inline">Export</span>
          </button>

          <div className="w-px h-5 bg-zinc-200 dark:bg-zinc-800 mx-0.5 sm:mx-1" />
          <ThemeToggle />
        </div>
      </div>
    ),
    [projectName, isSaving, hasUndo, hasRedo, hasTables, undo, redo, handleAddTable, openExport],
  );

  return (
    <>
      <SchemaCanvas
        editor={editor}
        toolbar={toolbar}
        isExportOpen={isExportOpen}
        onExportClose={closeExport}
        onImportSQL={openImport}
        isReady={isReady}
      />
      <ImportModal isOpen={isImportOpen} onClose={closeImport} />
    </>
  );
}

// ═══════════════════════════════════════════════════════════════
// Error Boundary — catches canvas crashes and offers recovery
// ═══════════════════════════════════════════════════════════════

interface BoundaryProps {
  projectId: string;
  projectName: string;
  children: ReactNode;
}
interface BoundaryState {
  hasError: boolean;
  error: Error | null;
  isResetting: boolean;
}

class EditorErrorBoundary extends Component<BoundaryProps, BoundaryState> {
  constructor(props: BoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null, isResetting: false };
  }
  static getDerivedStateFromError(error: Error): Partial<BoundaryState> {
    return { hasError: true, error };
  }
  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Editor crashed:", error, info.componentStack);
  }
  handleReset = async () => {
    this.setState({ isResetting: true });
    try {
      await updateSchema(this.props.projectId, this.props.projectName, {
        tables: [],
        relations: [],
      });
      window.location.reload();
    } catch (err) {
      console.error("Failed to reset schema:", err);
      this.setState({ isResetting: false });
    }
  };
  render() {
    if (this.state.hasError) {
      return (
        <div className="h-screen w-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 p-6">
          <div className="max-w-md w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xl p-8 flex flex-col items-center text-center animate-in fade-in zoom-in-95 duration-300">
            <div className="w-16 h-16 rounded-2xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 flex items-center justify-center mb-6">
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">Editor Crashed</h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed mb-2">
              Something went wrong while rendering this schema. This usually means the saved data is corrupted.
            </p>
            {this.state.error && (
              <details className="w-full mb-6 text-left">
                <summary className="text-xs font-semibold text-zinc-400 cursor-pointer hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors">
                  Technical details
                </summary>
                <pre className="mt-2 p-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg text-[11px] font-mono text-red-600 dark:text-red-400 overflow-x-auto whitespace-pre-wrap break-words max-h-32 overflow-y-auto">
                  {this.state.error.message}
                </pre>
              </details>
            )}
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
              <button
                onClick={this.handleReset}
                disabled={this.state.isResetting}
                className="w-full flex items-center justify-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-bold transition-all active:scale-95 shadow-md disabled:opacity-50"
              >
                {this.state.isResetting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <RotateCcw className="w-4 h-4" />
                )}
                {this.state.isResetting ? "Resetting..." : "Reset to Blank"}
              </button>
              <a
                href="/dashboard"
                className="w-full flex items-center justify-center gap-2 px-5 py-2.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-900 dark:text-white rounded-xl text-sm font-bold transition-all active:scale-95"
              >
                <ChevronLeft className="w-4 h-4" /> Dashboard
              </a>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// ═══════════════════════════════════════════════════════════════
// Default export
// ═══════════════════════════════════════════════════════════════

export default function SafeEditorClient({ project }: { project: any }) {
  return (
    <EditorErrorBoundary projectId={project.id} projectName={project.name}>
      <EditorClient project={project} />
    </EditorErrorBoundary>
  );
}