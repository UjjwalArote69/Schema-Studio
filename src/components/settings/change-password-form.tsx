// ============================================================
// FILE: src/components/settings/change-password-form.tsx
// ============================================================

"use client";

import { useState, useTransition } from "react";
import {
  Lock,
  Eye,
  EyeOff,
  Loader2,
  CheckCircle2,
  AlertCircle,
  X,
  Shield,
  KeyRound,
  Info,
} from "lucide-react";
import { changePassword } from "@/app/actions/password-actions";

interface ChangePasswordFormProps {
  /** Whether the user signed up with email/password (has a password set) */
  hasPassword: boolean;
  /** The OAuth provider name if applicable (e.g. "Google", "GitHub") */
  oauthProvider?: string | null;
}

export function ChangePasswordForm({
  hasPassword,
  oauthProvider,
}: ChangePasswordFormProps) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  // Password strength
  const strength =
    newPassword.length === 0
      ? 0
      : newPassword.length < 8
        ? 1
        : newPassword.length < 12
          ? 2
          : 3;
  const strengthLabel = ["", "Weak", "Good", "Strong"][strength];
  const strengthColor = ["", "bg-red-500", "bg-amber-500", "bg-green-500"][strength];
  const strengthTextColor = ["", "text-red-500", "text-amber-500", "text-green-500"][strength];

  const passwordsMatch = confirmPassword === "" || newPassword === confirmPassword;
  const canSubmit =
    currentPassword.length > 0 &&
    newPassword.length >= 8 &&
    newPassword === confirmPassword;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("idle");
    setErrorMsg("");

    const formData = new FormData();
    formData.set("currentPassword", currentPassword);
    formData.set("newPassword", newPassword);
    formData.set("confirmPassword", confirmPassword);

    startTransition(async () => {
      try {
        await changePassword(formData);
        setStatus("success");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setTimeout(() => setStatus("idle"), 8000);
      } catch (err) {
        setStatus("error");
        setErrorMsg(
          err instanceof Error ? err.message : "Failed to change password."
        );
      }
    });
  };

  return (
    <div className="bg-white dark:bg-[#0c0c0e] border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="px-6 md:px-8 py-5 border-b border-zinc-100 dark:border-zinc-800/50 bg-zinc-50/50 dark:bg-zinc-900/30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-black flex items-center justify-center text-sm font-bold flex-shrink-0">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-zinc-900 dark:text-white">
              Password
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {hasPassword
                ? "Change your account password."
                : "Manage your authentication method."}
            </p>
          </div>
        </div>
      </div>

      <div className="px-6 md:px-8 py-6 md:py-8">
        {/* OAuth-only users — no password to change */}
        {!hasPassword ? (
          <div className="flex items-start gap-4 p-5 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl">
            <div className="p-2 bg-zinc-200 dark:bg-zinc-800 rounded-lg flex-shrink-0">
              <Info className="w-4 h-4 text-zinc-500" />
            </div>
            <div>
              <p className="text-sm font-semibold text-zinc-900 dark:text-white mb-1">
                Social login active
              </p>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
                Your account is connected via{" "}
                <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                  {oauthProvider || "a social provider"}
                </span>
                . Password management is handled by your provider. To add a
                password to this account, use the &quot;Forgot password&quot;
                flow from the login page.
              </p>
            </div>
          </div>
        ) : (
          /* Email/password users — show the change form */
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Status banners */}
            {status === "success" && (
              <div className="flex items-center gap-3 p-3.5 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900/50 rounded-xl animate-in fade-in slide-in-from-top-2 duration-300">
                <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                <p className="text-sm font-medium text-green-700 dark:text-green-300 flex-1">
                  Password changed successfully. A confirmation email has been sent.
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

            {/* Current Password */}
            <div>
              <label className="block text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                Current Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-zinc-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type={showCurrent ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => {
                    setCurrentPassword(e.target.value);
                    if (status !== "idle") setStatus("idle");
                  }}
                  disabled={isPending}
                  className="w-full pl-11 pr-11 py-2.5 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm font-medium text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white transition-all disabled:opacity-50 placeholder:text-zinc-400"
                  placeholder="Enter your current password"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
                  tabIndex={-1}
                >
                  {showCurrent ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-zinc-100 dark:border-zinc-800/50" />
              </div>
              <div className="relative flex justify-center">
                <div className="bg-white dark:bg-[#0c0c0e] px-3">
                  <KeyRound className="w-4 h-4 text-zinc-300 dark:text-zinc-700" />
                </div>
              </div>
            </div>

            {/* New Password */}
            <div>
              <label className="block text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                New Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-zinc-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type={showNew ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    if (status !== "idle") setStatus("idle");
                  }}
                  disabled={isPending}
                  minLength={8}
                  maxLength={128}
                  className="w-full pl-11 pr-11 py-2.5 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm font-medium text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white transition-all disabled:opacity-50 placeholder:text-zinc-400"
                  placeholder="At least 8 characters"
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
                  tabIndex={-1}
                >
                  {showNew ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>

              {/* Password strength bar */}
              {newPassword.length > 0 && (
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex-1 flex gap-1">
                    {[1, 2, 3].map((level) => (
                      <div
                        key={level}
                        className={`h-1 flex-1 rounded-full transition-colors ${
                          level <= strength
                            ? strengthColor
                            : "bg-zinc-200 dark:bg-zinc-800"
                        }`}
                      />
                    ))}
                  </div>
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider ${strengthTextColor}`}
                  >
                    {strengthLabel}
                  </span>
                </div>
              )}
            </div>

            {/* Confirm New Password */}
            <div>
              <label className="block text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                Confirm New Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-zinc-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type={showNew ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (status !== "idle") setStatus("idle");
                  }}
                  disabled={isPending}
                  minLength={8}
                  maxLength={128}
                  className={`w-full pl-11 pr-4 py-2.5 bg-white dark:bg-zinc-950 border rounded-xl text-sm font-medium text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white transition-all disabled:opacity-50 placeholder:text-zinc-400 ${
                    !passwordsMatch
                      ? "border-red-300 dark:border-red-800"
                      : "border-zinc-200 dark:border-zinc-800"
                  }`}
                  placeholder="Re-enter your new password"
                />
              </div>
              {!passwordsMatch && (
                <p className="mt-1.5 text-xs font-medium text-red-500">
                  Passwords don&apos;t match.
                </p>
              )}
            </div>

            {/* Submit */}
            <div className="flex items-center pt-2">
              <button
                type="submit"
                disabled={isPending || !canSubmit}
                className="flex items-center gap-2 px-5 py-2.5 bg-black hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-black rounded-xl text-sm font-bold transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Updating...
                  </>
                ) : (
                  "Update Password"
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}