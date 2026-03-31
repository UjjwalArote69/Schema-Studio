// ============================================================
// FILE: src/app/(auth)/reset-password/page.tsx
// ============================================================

"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Database,
  Loader2,
  Lock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Eye,
  EyeOff,
} from "lucide-react";

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  // No token in URL — show error state
  if (!token) {
    return (
      <div className="flex flex-col items-center">
        <div className="w-14 h-14 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-2xl flex items-center justify-center mb-4">
          <AlertTriangle className="w-7 h-7 text-red-500" />
        </div>
        <h1 className="text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-white mb-2">
          Invalid reset link
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 text-center mb-6 max-w-xs">
          This password reset link is invalid or has been tampered with.
          Please request a new one.
        </p>
        <Link
          href="/forgot-password"
          className="flex items-center gap-2 px-6 py-3 bg-black dark:bg-white text-white dark:text-black rounded-xl text-sm font-bold transition-all active:scale-95 shadow-md"
        >
          Request New Link <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong. Please try again.");
        return;
      }

      setSuccess(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Success state
  if (success) {
    return (
      <div className="flex flex-col items-center">
        <div className="w-14 h-14 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900/50 rounded-2xl flex items-center justify-center mb-4">
          <CheckCircle2 className="w-7 h-7 text-green-600 dark:text-green-400" />
        </div>
        <h1 className="text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-white mb-2">
          Password updated!
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 text-center mb-6 max-w-xs">
          Your password has been changed successfully. You can now sign in with
          your new password.
        </p>
        <Link
          href="/login"
          className="flex items-center gap-2 px-6 py-3 bg-black dark:bg-white text-white dark:text-black rounded-xl text-sm font-bold transition-all active:scale-95 shadow-md"
        >
          Sign In <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  // Password strength indicator
  const strength =
    password.length === 0
      ? 0
      : password.length < 8
        ? 1
        : password.length < 12
          ? 2
          : 3;

  const strengthLabel = ["", "Weak", "Good", "Strong"][strength];
  const strengthColor = [
    "bg-zinc-200 dark:bg-zinc-800",
    "bg-red-500",
    "bg-amber-500",
    "bg-green-500",
  ][strength];

  return (
    <>
      <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white text-center mb-2">
        Set a new password
      </h1>
      <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-8 text-center">
        Choose a strong password for your account.
      </p>

      {error && (
        <div className="mb-6 p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-xl text-sm font-medium text-red-600 dark:text-red-400 text-center animate-in fade-in slide-in-from-top-2">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-1.5">
            New Password
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-zinc-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type={showPassword ? "text" : "password"}
              required
              minLength={8}
              maxLength={128}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-11 pr-11 py-3 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white transition-all text-sm font-medium text-zinc-900 dark:text-white placeholder:text-zinc-400"
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
              tabIndex={-1}
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* Password strength bar */}
          {password.length > 0 && (
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
                className={`text-[10px] font-bold uppercase tracking-wider ${
                  strength === 1
                    ? "text-red-500"
                    : strength === 2
                      ? "text-amber-500"
                      : "text-green-500"
                }`}
              >
                {strengthLabel}
              </span>
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-1.5">
            Confirm Password
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-zinc-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type={showPassword ? "text" : "password"}
              required
              minLength={8}
              maxLength={128}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={`w-full pl-11 pr-4 py-3 bg-zinc-50 dark:bg-zinc-900/50 border rounded-xl focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white transition-all text-sm font-medium text-zinc-900 dark:text-white placeholder:text-zinc-400 ${
                confirmPassword && password !== confirmPassword
                  ? "border-red-300 dark:border-red-800"
                  : "border-zinc-200 dark:border-zinc-800"
              }`}
              placeholder="••••••••"
            />
          </div>
          {confirmPassword && password !== confirmPassword && (
            <p className="mt-1.5 text-xs font-medium text-red-500">
              Passwords don&apos;t match.
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading || password.length < 8 || password !== confirmPassword}
          className="w-full py-3 px-4 bg-black dark:bg-white text-white dark:text-black font-bold text-sm rounded-xl hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all flex items-center justify-center gap-2 disabled:opacity-50 active:scale-95 shadow-md mt-2"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            "Reset Password"
          )}
        </button>
      </form>
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 px-4 transition-colors duration-300 relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.4] dark:opacity-[0.15] bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:14px_24px] pointer-events-none" />

      <div className="w-full max-w-md bg-white dark:bg-[#0c0c0e] border border-zinc-200 dark:border-zinc-800/80 rounded-3xl shadow-xl p-8 sm:p-10 animate-in fade-in zoom-in-95 duration-500">
        <div className="flex justify-center mb-6">
          <Link
            href="/"
            className="w-12 h-12 bg-black dark:bg-white rounded-2xl flex items-center justify-center shadow-sm hover:scale-105 transition-transform"
          >
            <Database className="w-6 h-6 text-white dark:text-black" />
          </Link>
        </div>

        <Suspense
          fallback={
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-zinc-400" />
            </div>
          }
        >
          <ResetPasswordContent />
        </Suspense>
      </div>
    </div>
  );
}