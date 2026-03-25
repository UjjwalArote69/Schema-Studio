"use client"; // This tells Next.js this specific part can use onClick

import { Trash2 } from "lucide-react";
import { deleteSchema } from "@/app/actions/schema-actions";

export function DeleteButton({ projectId }: { projectId: string }) {
  const handleDelete = async (e: React.FormEvent) => {
    e.preventDefault(); // Stop the form from submitting immediately
    
    if (confirm("Are you sure you want to delete this schema? This cannot be undone.")) {
      // If confirmed, trigger the server action manually
      await deleteSchema(projectId);
    }
  };

  return (
    <form onSubmit={handleDelete}>
      <button 
        type="submit"
        className="p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 dark:hover:text-red-400 dark:hover:bg-red-950/30 rounded-md transition-all"
        title="Delete Schema"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </form>
  );
}