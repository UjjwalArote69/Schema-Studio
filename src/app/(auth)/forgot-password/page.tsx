// ============================================================
// FILE: src/app/(auth)/forgot-password/page.tsx
// ============================================================

"use client";

import { useState } from "react";
import Link from "next/link";
import { Database, Loader2, ArrowLeft, Mail, CheckCircle2 } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!res.ok && res.status === 429) {
        setError("Too many requests. Please wait a few minutes and try again.");
        return;
      }

      // Always show success (prevents email enumeration)
      setSent(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 px-4 transition-colors duration-300 relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.4] dark:opacity-[0.15] bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:14px_24px] pointer-events-none" />

      <div className="w-full max-w-md bg-white dark:bg-[#0c0c0e] border border-zinc-200 dark:border-zinc-800/80 rounded-3xl shadow-xl p-8 sm:p-10 animate-in fade-in zoom-in-95 duration-500">
        <div className="flex flex-col items-center mb-8">
          <Link
            href="/"
            className="w-12 h-12 bg-black dark:bg-white rounded-2xl flex items-center justify-center mb-5 shadow-sm hover:scale-105 transition-transform"
          >
            <Database className="w-6 h-6 text-white dark:text-black" />
          </Link>

          {sent ? (
            <>
              <div className="w-14 h-14 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900/50 rounded-2xl flex items-center justify-center mb-4">
                <CheckCircle2 className="w-7 h-7 text-green-600 dark:text-green-400" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white text-center">
                Check your email
              </h1>
              <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mt-2 text-center max-w-sm">
                If an account with <span className="text-zinc-900 dark:text-white font-bold">{email}</span> exists,
                we&apos;ve sent a password reset link. It expires in 1 hour.
              </p>
            </>
          ) : (
            <>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
                Forgot password?
              </h1>
              <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mt-2 text-center">
                Enter your email and we&apos;ll send you a reset link.
              </p>
            </>
          )}
        </div>

        {!sent ? (
          <>
            {error && (
              <div className="mb-6 p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-xl text-sm font-medium text-red-600 dark:text-red-400 text-center animate-in fade-in slide-in-from-top-2">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5 mb-6">
              <div>
                <label className="block text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-zinc-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white transition-all text-sm font-medium text-zinc-900 dark:text-white placeholder:text-zinc-400"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-black dark:bg-white text-white dark:text-black font-bold text-sm rounded-xl hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all flex items-center justify-center gap-2 disabled:opacity-50 active:scale-95 shadow-md"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Send Reset Link"
                )}
              </button>
            </form>
          </>
        ) : (
          <div className="space-y-4 mb-6">
            <button
              onClick={() => {
                setSent(false);
                setEmail("");
              }}
              className="w-full py-3 px-4 bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-white font-bold text-sm rounded-xl hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-all flex items-center justify-center gap-2 border border-zinc-200 dark:border-zinc-800"
            >
              <Mail className="w-4 h-4" />
              Try a different email
            </button>
          </div>
        )}

        <div className="flex items-center justify-center">
          <Link
            href="/login"
            className="flex items-center gap-2 text-sm font-bold text-zinc-500 hover:text-black dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to login
          </Link>
        </div>
      </div>
    </div>
  );
}