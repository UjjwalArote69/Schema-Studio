"use client";

import { useState, useEffect, useCallback, createContext, useContext } from "react";
import Link from "next/link";
import {
  Database, BookOpen, Zap, MousePointer2, Cable, Sparkles,
  LayoutTemplate, Upload, Download, History, Keyboard, Search,
  X, ChevronDown, ChevronLeft, Menu, Shield, HelpCircle, Columns3, Bug,
} from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

// ═══════════════════════════════════════════════════════════════

interface DocsContextValue {
  activeSection: string;
  setActiveSection: (id: string) => void;
}

const DocsContext = createContext<DocsContextValue>({
  activeSection: "overview",
  setActiveSection: () => {},
});

export function useDocsContext() {
  return useContext(DocsContext);
}

// ═══════════════════════════════════════════════════════════════

interface NavChild { id: string; title: string }
interface NavGroup { id: string; title: string; icon: React.ElementType; children?: NavChild[] }

const NAV: NavGroup[] = [
  {
    id: "getting-started", title: "Getting started", icon: Zap,
    children: [
      { id: "overview", title: "Overview" },
      { id: "quickstart", title: "Quickstart" },
      { id: "concepts", title: "Core concepts" },
      { id: "workspace", title: "Workspace & projects" },
      { id: "authentication", title: "Authentication" },
      { id: "sandbox-vs-cloud", title: "Sandbox vs cloud" },
    ],
  },
  {
    id: "visual-editor", title: "Visual editor", icon: MousePointer2,
    children: [
      { id: "canvas-controls", title: "Canvas controls" },
      { id: "table-node-anatomy", title: "Table node anatomy" },
      { id: "creating-tables", title: "Creating tables" },
      { id: "editing-columns", title: "Editing columns" },
      { id: "sidebar-anatomy", title: "Sidebar anatomy" },
      { id: "bulk-operations", title: "Bulk operations" },
    ],
  },
  {
    id: "relationships", title: "Relationships", icon: Cable,
    children: [
      { id: "drawing-relations", title: "Drawing relations" },
      { id: "relation-types", title: "Relation types" },
      { id: "relation-export-behavior", title: "Export behavior per type" },
      { id: "managing-relations", title: "Managing relations" },
    ],
  },
  {
    id: "data-types", title: "Data types", icon: Columns3,
    children: [
      { id: "type-reference", title: "Type mapping table" },
      { id: "type-guidance", title: "When to use which type" },
    ],
  },
  {
    id: "ai-architect", title: "AI Architect", icon: Sparkles,
    children: [
      { id: "generating-schemas", title: "Generating schemas" },
      { id: "modifying-schemas", title: "Modifying schemas" },
      { id: "ai-internals", title: "How it works internally" },
      { id: "prompting-tips", title: "Prompting tips" },
      { id: "ai-limitations", title: "Limitations" },
    ],
  },
  { id: "templates", title: "Templates", icon: LayoutTemplate },
  {
    id: "import", title: "SQL import", icon: Upload,
    children: [
      { id: "import-usage", title: "How to import" },
      { id: "import-supported", title: "Supported syntax" },
      { id: "import-type-mapping", title: "Type mapping" },
      { id: "import-limitations", title: "Limitations" },
    ],
  },
  {
    id: "export", title: "Code export", icon: Download,
    children: [
      { id: "export-formats", title: "Supported formats" },
      { id: "export-examples", title: "Output examples" },
      { id: "export-m2m", title: "Many-to-many output" },
    ],
  },
  { id: "version-history", title: "Version history", icon: History },
  { id: "auto-save", title: "Auto-save", icon: Shield },
  { id: "keyboard-shortcuts", title: "Keyboard shortcuts", icon: Keyboard },
  { id: "troubleshooting", title: "Troubleshooting", icon: Bug },
  { id: "faq", title: "FAQ", icon: HelpCircle },
];

// ═══════════════════════════════════════════════════════════════

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  const [activeSection, setActiveSection] = useState("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(() => new Set(NAV.map((n) => n.id)));

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setMobileNavOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const scrollTo = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (el) { window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 80, behavior: "smooth" }); }
    setMobileNavOpen(false);
  }, []);

  const toggleGroup = (id: string) => {
    setExpandedGroups((prev) => { const next = new Set(prev); if (next.has(id)) next.delete(id); else next.add(id); return next; });
  };

  const filteredNav = searchQuery.trim()
    ? NAV.map((g) => {
        const q = searchQuery.toLowerCase();
        const gm = g.title.toLowerCase().includes(q);
        const mc = g.children?.filter((c) => c.title.toLowerCase().includes(q));
        if (gm || (mc && mc.length > 0)) return { ...g, children: gm ? g.children : mc };
        return null;
      }).filter(Boolean) as NavGroup[]
    : NAV;

  const navTree = (
    <div className="space-y-0.5">
      {filteredNav.map((group) => {
        const Icon = group.icon;
        const isExpanded = expandedGroups.has(group.id);
        const hasChildren = group.children && group.children.length > 0;
        const isActive = activeSection === group.id || group.children?.some((c) => c.id === activeSection);
        return (
          <div key={group.id}>
            <button
              onClick={() => { if (hasChildren) toggleGroup(group.id); scrollTo(hasChildren ? group.children![0].id : group.id); }}
              className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] transition-all ${isActive ? "text-zinc-900 dark:text-white font-semibold" : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white font-medium"}`}
            >
              <Icon className="w-3.5 h-3.5 shrink-0 opacity-60" />
              <span className="flex-1 text-left truncate">{group.title}</span>
              {hasChildren && <ChevronDown className={`w-3 h-3 opacity-40 transition-transform ${isExpanded ? "" : "-rotate-90"}`} />}
            </button>
            {hasChildren && isExpanded && (
              <div className="ml-4 pl-3 border-l border-zinc-200 dark:border-zinc-800 space-y-0.5 mt-0.5 mb-1.5">
                {group.children!.map((child) => (
                  <button key={child.id} onClick={() => scrollTo(child.id)} className={`w-full text-left block px-2.5 py-1.5 rounded-md text-[12.5px] transition-all ${activeSection === child.id ? "text-zinc-900 dark:text-white font-semibold bg-zinc-100 dark:bg-zinc-800/60" : "text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 font-medium"}`}>
                    {child.title}
                  </button>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );

  return (
    <DocsContext.Provider value={{ activeSection, setActiveSection }}>
      <div className="min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 transition-colors">
        <header className="sticky top-0 z-40 h-14 border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl flex items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="flex items-center gap-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors">
              <ChevronLeft className="w-4 h-4" />
              <div className="p-1 bg-black dark:bg-white rounded-[6px]"><Database className="w-3.5 h-3.5 text-white dark:text-black" /></div>
              <span className="text-sm font-semibold hidden sm:inline">SchemaStudio</span>
            </Link>
            <div className="w-px h-5 bg-zinc-200 dark:bg-zinc-800 hidden sm:block" />
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-zinc-400 uppercase tracking-widest">
              <BookOpen className="w-3.5 h-3.5" /><span className="hidden sm:inline">Docs</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button onClick={() => setMobileNavOpen(!mobileNavOpen)} className="md:hidden p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors">
              {mobileNavOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </header>

        <div className="flex">
          <aside className="hidden md:flex w-[250px] lg:w-[260px] shrink-0 flex-col border-r border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950">
            <div className="sticky top-14 flex flex-col max-h-[calc(100vh-3.5rem)] overflow-hidden">
              <div className="p-3 pb-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
                  <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search docs..." className="w-full pl-8 pr-8 py-2 bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white transition-all text-zinc-900 dark:text-white placeholder:text-zinc-400" />
                  {searchQuery && <button onClick={() => setSearchQuery("")} className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"><X className="w-3.5 h-3.5" /></button>}
                </div>
              </div>
              <div className="flex-1 overflow-y-auto px-3 pb-6 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-zinc-300 dark:[&::-webkit-scrollbar-thumb]:bg-zinc-700 [&::-webkit-scrollbar-thumb]:rounded-full">{navTree}</div>
            </div>
          </aside>

          {mobileNavOpen && (
            <>
              <div className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm md:hidden" onClick={() => setMobileNavOpen(false)} />
              <aside className="fixed inset-y-0 left-0 z-40 w-72 bg-white dark:bg-zinc-950 border-r border-zinc-200 dark:border-zinc-800 flex flex-col md:hidden animate-in slide-in-from-left duration-200">
                <div className="h-14 flex items-center justify-between px-4 border-b border-zinc-200 dark:border-zinc-800">
                  <span className="text-sm font-bold">Navigation</span>
                  <button onClick={() => setMobileNavOpen(false)} className="p-1.5 text-zinc-400 hover:text-zinc-900 dark:hover:text-white"><X className="w-4 h-4" /></button>
                </div>
                <div className="flex-1 overflow-y-auto p-3">
                  <div className="relative mb-3">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
                    <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search docs..." className="w-full pl-8 pr-3 py-2 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white text-zinc-900 dark:text-white placeholder:text-zinc-400" />
                  </div>
                  {navTree}
                </div>
              </aside>
            </>
          )}

          <main className="flex-1 min-w-0 overflow-y-auto">{children}</main>
        </div>
      </div>
    </DocsContext.Provider>
  );
}