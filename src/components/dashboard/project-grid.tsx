"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Database, Search, Clock, ArrowRight, LayoutTemplate, Plus, X } from "lucide-react";
import { createSchema } from "@/app/actions/schema-actions";
import { DeleteButton } from "@/components/dashboard/delete-button";

interface Project {
  id: string;
  name: string;
  updatedAt: Date;
}

export function ProjectGrid({ projects }: { projects: Project[] }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return projects;
    return projects.filter((p) => p.name.toLowerCase().includes(q));
  }, [projects, query]);

  return (
    <>
      {/* Toolbar (Search & Filter) */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-4 mb-8">
        <div className="flex items-center gap-4 text-sm font-bold">
          <span className="text-zinc-900 dark:text-white border-b-2 border-black dark:border-white pb-4 -mb-[18px]">
            Recent Projects
          </span>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search schemas..."
            className="w-full pl-10 pr-9 py-2.5 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white transition-all text-zinc-900 dark:text-white placeholder:text-zinc-500"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Projects Grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((project) => (
            <div
              key={project.id}
              className="group flex flex-col bg-white dark:bg-[#0c0c0e] border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:border-black dark:hover:border-white transition-all duration-300"
            >
              <Link
                href={`/editor/${project.id}`}
                className="block h-40 bg-zinc-50/50 dark:bg-zinc-900/30 border-b border-zinc-100 dark:border-zinc-800 relative overflow-hidden"
              >
                <div className="absolute inset-0 opacity-[0.2] dark:opacity-[0.15] bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:14px_24px]" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="p-3.5 bg-white dark:bg-zinc-900 rounded-xl shadow-md border border-zinc-200 dark:border-zinc-700 group-hover:scale-110 group-hover:border-black dark:group-hover:border-white transition-all duration-300">
                    <Database className="w-6 h-6 text-black dark:text-white" />
                  </div>
                </div>
              </Link>

              <div className="p-5 flex flex-col flex-1">
                <Link href={`/editor/${project.id}`} className="mb-4">
                  <h3
                    className="font-bold text-zinc-900 dark:text-white truncate group-hover:underline decoration-2 underline-offset-4 decoration-zinc-300 dark:decoration-zinc-700 transition-colors"
                    title={project.name}
                  >
                    {project.name}
                  </h3>
                  <p className="text-xs text-zinc-500 mt-1">
                    Click to edit architecture
                  </p>
                </Link>

                <div className="mt-auto flex items-center justify-between pt-4 border-t border-zinc-100 dark:border-zinc-800/50">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                    <Clock className="w-3.5 h-3.5" />
                    {new Date(project.updatedAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </div>
                  <div className="flex items-center gap-1">
                    <Link
                      href={`/editor/${project.id}`}
                      className="p-2.5 text-zinc-400 hover:text-black hover:bg-zinc-100 dark:hover:text-white dark:hover:bg-zinc-800 rounded-lg transition-all"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                    <DeleteButton projectId={project.id} />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : query ? (
        /* No results for search */
        <div className="flex flex-col items-center justify-center text-center py-24 px-6 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-3xl bg-zinc-50/50 dark:bg-zinc-900/20">
          <div className="relative mb-6">
            <div className="relative w-20 h-20 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl flex items-center justify-center shadow-sm">
              <Search className="w-10 h-10 text-zinc-400" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">
            No matching schemas
          </h2>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm max-w-sm mb-8 leading-relaxed">
            No schemas match &ldquo;{query}&rdquo;. Try a different search term
            or{" "}
            <button
              onClick={() => setQuery("")}
              className="underline underline-offset-2 hover:text-zinc-900 dark:hover:text-white transition-colors"
            >
              clear the filter
            </button>
            .
          </p>
        </div>
      ) : (
        /* Empty state — no projects at all */
        <div className="flex flex-col items-center justify-center text-center py-24 px-6 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-3xl bg-zinc-50/50 dark:bg-zinc-900/20">
          <div className="relative mb-6">
            <div className="relative w-20 h-20 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl flex items-center justify-center shadow-sm">
              <Database className="w-10 h-10 text-black dark:text-white" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">
            No schemas found
          </h2>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm max-w-sm mb-8 leading-relaxed">
            Create your first database architecture from scratch, import
            existing SQL, or start with a pre-built template.
          </p>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <form action={createSchema}>
              <button
                type="submit"
                className="flex items-center gap-2 bg-black hover:bg-zinc-800 text-white dark:bg-white dark:hover:bg-zinc-200 dark:text-black px-6 py-3 rounded-xl text-sm font-bold transition-all shadow-md active:scale-95 w-full sm:w-auto justify-center"
              >
                <Plus className="w-4 h-4" /> New Schema
              </button>
            </form>
            <Link
              href="/templates"
              className="flex items-center justify-center gap-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-black dark:hover:border-white text-zinc-900 dark:text-white px-6 py-3 rounded-xl text-sm font-bold transition-all shadow-sm w-full sm:w-auto"
            >
              <LayoutTemplate className="w-4 h-4" /> Browse Templates
            </Link>
          </div>
        </div>
      )}
    </>
  );
}