"use client";

import { useState } from "react";
import { AlertTriangle, Trash2, X, Loader2 } from "lucide-react";
import { deleteAccount } from "@/app/actions/user-actions";

export function DeleteAccountForm({ userEmail }: { userEmail: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [confirmEmail, setConfirmEmail] = useState("");
  const [error, setError] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const emailMatches = confirmEmail.trim().toLowerCase() === userEmail.toLowerCase();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailMatches) return;

    setIsDeleting(true);
    setError("");

    try {
      const formData = new FormData();
      formData.set("confirmEmail", confirmEmail.trim());
      await deleteAccount(formData);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to delete account.");
      setIsDeleting(false);
    }
  };

  // Collapsed state — just the warning + button
  if (!isOpen) {
    return (
      <div className="bg-red-50/50 dark:bg-red-950/10 border border-red-200 dark:border-red-900/30 rounded-2xl overflow-hidden">
        <div className="p-6 md:p-8 flex flex-col sm:flex-row sm:items-start md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-red-600 dark:text-red-500 mb-1.5">
              <AlertTriangle className="w-5 h-5" />
              <h2 className="text-lg font-bold">Danger Zone</h2>
            </div>
            <p className="text-sm font-medium text-red-600/80 dark:text-red-400/80 max-w-sm leading-relaxed">
              Permanently delete your account and all of your schema projects. This action cannot be undone.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="shrink-0 whitespace-nowrap px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-bold transition-all shadow-md active:scale-95"
          >
            Delete Account
          </button>
        </div>
      </div>
    );
  }

  // Expanded state — confirmation form
  return (
    <div className="bg-red-50/50 dark:bg-red-950/10 border border-red-200 dark:border-red-900/30 rounded-2xl overflow-hidden">
      <div className="p-6 md:p-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-red-600 dark:text-red-500">
            <AlertTriangle className="w-5 h-5" />
            <h2 className="text-lg font-bold">Confirm Account Deletion</h2>
          </div>
          <button
            type="button"
            onClick={() => { setIsOpen(false); setConfirmEmail(""); setError(""); }}
            className="p-1.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-sm text-red-600/80 dark:text-red-400/80 leading-relaxed mb-6">
          This will permanently destroy your account and <span className="font-bold">all schema projects</span>.
          To confirm, type your email address below:
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-100 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 rounded-xl text-sm font-medium text-red-600 dark:text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-red-700 dark:text-red-400 mb-2">
              Type <span className="font-mono bg-red-100 dark:bg-red-950/50 px-1.5 py-0.5 rounded text-xs">{userEmail}</span> to confirm
            </label>
            <input
              type="email"
              value={confirmEmail}
              onChange={(e) => setConfirmEmail(e.target.value)}
              disabled={isDeleting}
              placeholder={userEmail}
              autoComplete="off"
              className="w-full px-4 py-2.5 bg-white dark:bg-zinc-950 border border-red-200 dark:border-red-900/50 rounded-xl focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 transition-all text-sm font-medium text-zinc-900 dark:text-white placeholder:text-zinc-400"
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={!emailMatches || isDeleting}
              className="flex items-center justify-center gap-2 px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-bold transition-all shadow-md active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isDeleting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4" />
              )}
              {isDeleting ? "Deleting..." : "Permanently Delete"}
            </button>
            <button
              type="button"
              onClick={() => { setIsOpen(false); setConfirmEmail(""); setError(""); }}
              disabled={isDeleting}
              className="px-5 py-2.5 text-sm font-bold text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}