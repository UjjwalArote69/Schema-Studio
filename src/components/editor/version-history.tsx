"use client";

import { useState, useEffect, useTransition, useCallback } from "react";
import {
  History,
  X,
  RotateCcw,
  Trash2,
  Plus,
  Loader2,
  Clock,
  ChevronDown,
} from "lucide-react";
import {
  listSnapshots,
  createSnapshot,
  restoreSnapshot,
  deleteSnapshot,
} from "@/app/actions/snapshot-actions";
import { useSchemaStore } from "@/store/useSchemaStore";

interface Snapshot {
  id: string;
  label: string;
  createdAt: Date;
}

interface VersionHistoryProps {
  projectId: string;
}

export function VersionHistory({ projectId }: VersionHistoryProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
  const [isLoading, startTransition] = useTransition();
  const [actionId, setActionId] = useState<string | null>(null);
  const [confirmRestore, setConfirmRestore] = useState<string | null>(null);
  const { tables, relations, setSchema } = useSchemaStore();

  const refresh = useCallback(() => {
    startTransition(async () => {
      const data = await listSnapshots(projectId);
      setSnapshots(data);
    });
  }, [projectId]);

  // Load snapshots when panel opens
  useEffect(() => {
    if (isOpen) refresh();
  }, [isOpen, refresh]);

  const handleSaveSnapshot = () => {
    setActionId("save");
    startTransition(async () => {
      await createSnapshot(projectId, "Manual snapshot", {
        tables,
        relations,
      });
      await refresh();
      setActionId(null);
    });
  };

  const handleRestore = (snapshotId: string) => {
    if (confirmRestore !== snapshotId) {
      setConfirmRestore(snapshotId);
      return;
    }

    setActionId(snapshotId);
    setConfirmRestore(null);
    startTransition(async () => {
      const data = await restoreSnapshot(projectId, snapshotId);
      if (data && typeof data === "object") {
        const parsed = data as { tables?: unknown[]; relations?: unknown[] };
        setSchema(
          (parsed.tables as Parameters<typeof setSchema>[0]) || [],
          (parsed.relations as Parameters<typeof setSchema>[1]) || [],
        );
      }
      await refresh();
      setActionId(null);
    });
  };

  const handleDelete = (snapshotId: string) => {
    setActionId(snapshotId);
    startTransition(async () => {
      await deleteSnapshot(projectId, snapshotId);
      await refresh();
      setActionId(null);
    });
  };

  const formatDate = (date: Date) => {
    const d = new Date(date);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  return (
    <>
      {/* Toolbar trigger button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-black dark:text-white rounded-md text-xs font-semibold transition-colors border border-zinc-200 dark:border-zinc-800"
        title="Version History"
      >
        <History className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">History</span>
      </button>

      {/* Slide-out panel */}
      {isOpen && (
        <div className="fixed top-14 right-0 bottom-0 w-80 bg-white dark:bg-zinc-950 border-l border-zinc-200 dark:border-zinc-800 z-50 flex flex-col shadow-2xl animate-in slide-in-from-right duration-200">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-zinc-500" />
              <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
                Version History
              </h3>
              {snapshots.length > 0 && (
                <span className="text-[10px] font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-500 px-1.5 py-0.5 rounded-full">
                  {snapshots.length}
                </span>
              )}
            </div>
            <button
              onClick={() => {
                setIsOpen(false);
                setConfirmRestore(null);
              }}
              className="p-1.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Save snapshot button */}
          <div className="px-4 py-3 border-b border-zinc-100 dark:border-zinc-800/50">
            <button
              onClick={handleSaveSnapshot}
              disabled={actionId === "save"}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-lg text-xs font-bold transition-all hover:bg-zinc-800 dark:hover:bg-zinc-200 active:scale-[0.98] disabled:opacity-50"
            >
              {actionId === "save" ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Plus className="w-3.5 h-3.5" />
              )}
              Save Current Version
            </button>
          </div>

          {/* Snapshot list */}
          <div className="flex-1 overflow-y-auto">
            {isLoading && snapshots.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-5 h-5 animate-spin text-zinc-400" />
              </div>
            ) : snapshots.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
                <Clock className="w-8 h-8 text-zinc-300 dark:text-zinc-700 mb-3" />
                <p className="text-sm font-medium text-zinc-500">
                  No versions saved yet
                </p>
                <p className="text-xs text-zinc-400 mt-1">
                  Versions are auto-saved periodically and before AI
                  modifications.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-zinc-100 dark:divide-zinc-800/50">
                {snapshots.map((snap) => (
                  <div
                    key={snap.id}
                    className="px-4 py-3 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors group"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-zinc-900 dark:text-white truncate">
                          {snap.label}
                        </p>
                        <p className="text-[11px] text-zinc-400 mt-0.5">
                          {formatDate(snap.createdAt)}
                        </p>
                      </div>

                      <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleRestore(snap.id)}
                          disabled={actionId === snap.id}
                          className={`p-1.5 rounded-md text-xs font-medium transition-all ${
                            confirmRestore === snap.id
                              ? "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400"
                              : "text-zinc-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30"
                          }`}
                          title={
                            confirmRestore === snap.id
                              ? "Click again to confirm"
                              : "Restore this version"
                          }
                        >
                          {actionId === snap.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : confirmRestore === snap.id ? (
                            <span className="text-[10px] font-bold px-1">
                              Confirm?
                            </span>
                          ) : (
                            <RotateCcw className="w-3.5 h-3.5" />
                          )}
                        </button>
                        <button
                          onClick={() => handleDelete(snap.id)}
                          disabled={actionId === snap.id}
                          className="p-1.5 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-md transition-all"
                          title="Delete this version"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Restore confirmation hint */}
                    {confirmRestore === snap.id && (
                      <p className="text-[10px] text-amber-600 dark:text-amber-400 mt-1">
                        Your current work will be saved automatically before
                        restoring.
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer info */}
          {snapshots.length > 0 && (
            <div className="px-4 py-2 border-t border-zinc-100 dark:border-zinc-800/50">
              <p className="text-[10px] text-zinc-400 flex items-center gap-1">
                <ChevronDown className="w-3 h-3" />
                Up to {30} versions kept per project
              </p>
            </div>
          )}
        </div>
      )}
    </>
  );
}