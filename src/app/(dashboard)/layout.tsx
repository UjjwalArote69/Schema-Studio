// ============================================================
// FILE: src/app/(dashboard)/layout.tsx
// (Replaces your existing layout.tsx)
// ============================================================

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Database,
  Sparkles,
  BookOpen,
  Clock,
  ChevronRight,
  Menu,
  X,
  Crown,
} from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { LogoutButton } from "@/components/logout-button";
import { SidebarNav } from "@/components/layout/sidebar-nav";
import { getUser, getRecentProjects } from "@/lib/dashboard-queries";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!session || !userId) {
    redirect("/login");
  }

  const [User, recentProjects] = await Promise.all([
    getUser(userId),
    getRecentProjects(userId),
  ]);

  if (!User) return null;

  const isPro = User.plan === "pro";

  return (
    <div className="flex h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans overflow-hidden">
      {/* MOBILE MENU STATE HANDLER (Hidden Checkbox) */}
      <input type="checkbox" id="mobile-menu-toggle" className="peer hidden" />

      {/* MOBILE OVERLAY */}
      <label
        htmlFor="mobile-menu-toggle"
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 hidden peer-checked:block md:hidden transition-opacity"
      />

      {/* SIDEBAR */}
      <aside className="fixed inset-y-0 left-0 z-50 w-64 md:w-64 transform -translate-x-full transition-transform duration-300 ease-in-out peer-checked:translate-x-0 md:relative md:translate-x-0 flex flex-col border-r border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#0c0c0e]">
        {/* Brand Header */}
        <div className="h-14 flex items-center justify-between px-5 border-b border-zinc-200 dark:border-zinc-800">
          <Link
            href="/dashboard"
            className="flex items-center gap-2.5 font-semibold text-sm hover:opacity-80 transition-opacity"
          >
            <div className="p-1 bg-black dark:bg-white rounded-[6px]">
              <Database className="w-4 h-4 text-white dark:text-black" />
            </div>
            <span>SchemaStudio</span>
          </Link>
          <label
            htmlFor="mobile-menu-toggle"
            className="md:hidden p-1 cursor-pointer text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
          >
            <X className="w-5 h-5" />
          </label>
        </div>

        {/* Scrollable Nav Area */}
        <div className="flex-1 overflow-y-auto py-5 px-3 flex flex-col gap-6 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <div className="space-y-0.5">
            <SidebarNav />
          </div>

          {/* Dynamic Recent Projects */}
          {recentProjects.length > 0 && (
            <div>
              <h3 className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider mb-2 px-2">
                Recent
              </h3>
              <div className="space-y-0.5">
                {recentProjects.map((project) => (
                  <Link
                    key={project.id}
                    href={`/editor/${project.id}`}
                    className="flex items-center gap-2.5 px-2 py-1.5 text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50 rounded-md transition-colors group"
                  >
                    <Clock className="w-3.5 h-3.5 opacity-50 group-hover:opacity-100 transition-opacity" />
                    <span className="truncate flex-1">{project.name}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Resources */}
          <div className="mt-auto space-y-0.5">
            <h3 className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider mb-2 px-2">
              Resources
            </h3>
            <Link
              href="/docs"
              className="flex items-center gap-2.5 px-2 py-1.5 text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50 rounded-md transition-colors"
            >
              <BookOpen className="w-4 h-4 opacity-50" /> Documentation
            </Link>
          </div>

          {/* ── Conditional: Pro Badge OR Upgrade Box ──────── */}
          {isPro ? (
            /* Pro user — show compact Pro badge */
            <Link
              href="/settings?tab=billing"
              className="flex items-center gap-3 px-3 py-3 rounded-lg bg-gradient-to-br from-amber-50 to-orange-50/50 dark:from-amber-950/20 dark:to-orange-950/10 border border-amber-200/60 dark:border-amber-900/30 group hover:border-amber-300 dark:hover:border-amber-800/50 transition-colors"
            >
              <div className="p-1.5 bg-amber-100 dark:bg-amber-900/40 rounded-lg flex-shrink-0">
                <Crown className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-amber-700 dark:text-amber-300">
                    Pro Plan
                  </span>
                  <span className="px-1.5 py-0.5 bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 text-[8px] font-bold uppercase tracking-widest rounded">
                    Active
                  </span>
                </div>
                <p className="text-[10px] text-amber-600/70 dark:text-amber-400/60 mt-0.5">
                  All features unlocked
                </p>
              </div>
            </Link>
          ) : (
            /* Free user — show Upgrade box */
            <Link
              href="/settings?tab=billing"
              className="block px-3 py-3 rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 group cursor-pointer hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors"
            >
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="w-3.5 h-3.5 text-zinc-900 dark:text-white" />
                <span className="text-sm font-semibold text-zinc-900 dark:text-white">
                  Upgrade to Pro
                </span>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-3 leading-relaxed">
                Unlock unlimited projects, tables, and AI generations.
              </p>
              <span className="text-xs font-medium text-zinc-900 dark:text-white flex items-center gap-1 group-hover:gap-1.5 transition-all">
                View plans <ChevronRight className="w-3 h-3" />
              </span>
            </Link>
          )}
        </div>

        {/* User Profile & Footer */}
        <div className="p-3 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shrink-0">
          <div className="flex items-center justify-between mb-2 px-2">
            <span className="text-xs font-medium text-zinc-500">Theme</span>
            <ThemeToggle />
          </div>

          <div className="flex items-center gap-2.5 p-2 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors">
            <div className="relative w-8 h-8 rounded bg-zinc-900 dark:bg-zinc-100 text-white dark:text-black flex items-center justify-center text-xs font-bold flex-shrink-0">
              {User.name?.charAt(0) || "U"}
              {/* Pro indicator dot on avatar */}
              {isPro && (
                <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-amber-400 border-2 border-zinc-50 dark:border-[#0c0c0e] rounded-full" />
              )}
            </div>
            <div className="flex flex-col flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-medium text-zinc-900 dark:text-white truncate">
                  {User.name || "User"}
                </span>
                {isPro && (
                  <span className="px-1 py-0.5 bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 text-[8px] font-bold uppercase tracking-widest rounded flex-shrink-0">
                    Pro
                  </span>
                )}
              </div>
              <span className="text-[11px] text-zinc-500 truncate">
                {User.email}
              </span>
            </div>
            <LogoutButton />
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Header */}
        <header className="md:hidden h-14 flex items-center justify-between px-4 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shrink-0">
          <Link
            href="/dashboard"
            className="flex items-center gap-2.5 font-semibold text-sm"
          >
            <div className="p-1 bg-black dark:bg-white rounded-[6px]">
              <Database className="w-4 h-4 text-white dark:text-black" />
            </div>
            <span>SchemaStudio</span>
          </Link>
          <label
            htmlFor="mobile-menu-toggle"
            className="p-1.5 -mr-1.5 cursor-pointer text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
          >
            <Menu className="w-5 h-5" />
          </label>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto relative">{children}</main>
      </div>
    </div>
  );
}