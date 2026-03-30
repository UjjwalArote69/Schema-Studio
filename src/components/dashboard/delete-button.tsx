// ============================================================
// FILE: src/components/dashboard/delete-button.tsx
// (Replaces your existing delete-button.tsx)
//
// Changes: Added analytics.schemaDeleted
// ============================================================

"use client";

import { useTransition } from "react";
import { Trash2, Loader2 } from "lucide-react";
import { deleteSchema } from "@/app/actions/schema-actions";
import { analytics } from "@/lib/analytics";

export function DeleteButton({ projectId }: { projectId: string }) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (isPending) return;

    if (confirm("Are you sure you want to delete this schema? This cannot be undone.")) {
      analytics.schemaDeleted();
      startTransition(async () => {
        await deleteSchema(projectId);
      });
    }
  };

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={isPending}
      className="p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 dark:hover:text-red-400 dark:hover:bg-red-950/30 rounded-md transition-all disabled:opacity-50 disabled:pointer-events-none"
      title="Delete Schema"
    >
      {isPending ? (
        <Loader2 className="w-4 h-4 animate-spin text-red-500" />
      ) : (
        <Trash2 className="w-4 h-4" />
      )}
    </button>
  );
}