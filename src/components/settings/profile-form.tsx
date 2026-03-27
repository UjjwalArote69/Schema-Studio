"use client";

import { useState, useTransition } from "react";
import { Loader2, CheckCircle2, AlertCircle, X } from "lucide-react";
import { updateProfile } from "@/app/actions/user-actions";

interface ProfileFormProps {
  defaultName: string;
}

export function ProfileForm({ defaultName }: ProfileFormProps) {
  const [name, setName] = useState(defaultName);
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("idle");
    setErrorMsg("");

    const formData = new FormData();
    formData.set("name", name);

    startTransition(async () => {
      try {
        await updateProfile(formData);
        setStatus("success");
        setTimeout(() => setStatus("idle"), 5000);
      } catch (err) {
        setStatus("error");
        setErrorMsg(
          err instanceof Error ? err.message : "Failed to save changes.",
        );
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Success Banner */}
      {status === "success" && (
        <div className="flex items-center gap-3 p-3.5 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900/50 rounded-xl animate-in fade-in slide-in-from-top-2 duration-300">
          <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
          <p className="text-sm font-medium text-green-700 dark:text-green-300 flex-1">
            Profile updated successfully.
          </p>
          <button
            type="button"
            onClick={() => setStatus("idle")}
            className="p-1 text-green-500 hover:text-green-700 dark:hover:text-green-200 rounded-md transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Error Banner */}
      {status === "error" && (
        <div className="flex items-center gap-3 p-3.5 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-xl animate-in fade-in slide-in-from-top-2 duration-300">
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
          <p className="text-sm font-medium text-red-700 dark:text-red-300 flex-1">
            {errorMsg}
          </p>
          <button
            type="button"
            onClick={() => setStatus("idle")}
            className="p-1 text-red-500 hover:text-red-700 dark:hover:text-red-200 rounded-md transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Name Input */}
      <div>
        <label
          htmlFor="profile-name"
          className="block text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-1.5"
        >
          Display Name
        </label>
        <input
          id="profile-name"
          type="text"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (status !== "idle") setStatus("idle");
          }}
          disabled={isPending}
          className="w-full px-4 py-2.5 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm font-medium text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white transition-all disabled:opacity-50"
        />
      </div>

      {/* Submit */}
      <div className="flex items-center">
        <button
          type="submit"
          disabled={isPending || !name.trim()}
          className="flex items-center gap-2 px-5 py-2.5 bg-black hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-black rounded-xl text-sm font-bold transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Saving...
            </>
          ) : (
            "Save Changes"
          )}
        </button>
      </div>
    </form>
  );
}