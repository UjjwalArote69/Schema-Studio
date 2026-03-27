/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useState, useEffect, useCallback } from "react";
import { useTheme } from "next-themes";
import { Sun, Moon, Monitor } from "lucide-react";

/**
 * Theme toggle button with a brief floating indicator that
 * confirms which mode was activated. Cycles: light → dark → system.
 */
export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => setMounted(true), []);

  const cycle = useCallback(() => {
    let next: string;
    if (theme === "light") {
      next = "dark";
    } else if (theme === "dark") {
      next = "system";
    } else {
      next = "light";
    }
    setTheme(next);

    // Show brief confirmation
    const label =
      next === "light" ? "Light" : next === "dark" ? "Dark" : "System";
    setToast(label);
    setTimeout(() => setToast(null), 1400);
  }, [theme, setTheme]);

  if (!mounted) {
    // Avoid hydration mismatch — render placeholder with same size
    return (
      <div className="w-9 h-9 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900" />
    );
  }

  const Icon =
    theme === "system" ? Monitor : resolvedTheme === "dark" ? Moon : Sun;

  return (
    <div className="relative">
      <button
        onClick={cycle}
        aria-label={`Switch theme (current: ${theme})`}
        className="relative p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:border-zinc-300 dark:hover:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all active:scale-90 shadow-sm overflow-hidden"
      >
        {/* Rotating icon with crossfade */}
        <Icon
          key={theme}
          className="w-[18px] h-[18px] animate-in fade-in spin-in-90 duration-300"
        />
      </button>

      {/* Floating toast label */}
      {toast && (
        <div
          key={toast}
          className="absolute -bottom-9 left-1/2 -translate-x-1/2 whitespace-nowrap px-2.5 py-1 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-[10px] font-bold uppercase tracking-wider rounded-lg shadow-lg animate-in fade-in slide-in-from-top-1 duration-200 pointer-events-none"
        >
          {toast}
        </div>
      )}
    </div>
  );
}