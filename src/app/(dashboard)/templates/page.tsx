// ============================================================
// FILE: src/app/(dashboard)/templates/page.tsx
// (Replaces your existing templates/page.tsx)
//
// Changes: Added analytics.templateUsed and templateSearched
// ============================================================

"use client";

import { useState, useMemo, useTransition } from "react";
import {
  Search, X, Table as TableIcon, Layers, Plus, ArrowRight, Loader2,
  Building, ShoppingCart, Users, Stethoscope, Briefcase, GraduationCap,
  Hotel, CheckSquare, UtensilsCrossed, CreditCard, Newspaper, Database,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { createFromTemplateById } from "@/app/actions/schema-actions";
import { TEMPLATE_METADATA, type TemplateMeta } from "@/data/template-metadata";
import { TemplatePreview } from "@/components/templates/template-preview";
import { analytics } from "@/lib/analytics";

const ICON_MAP: Record<string, LucideIcon> = {
  Building, ShoppingCart, Users, Stethoscope, Briefcase, GraduationCap,
  Hotel, CheckSquare, UtensilsCrossed, CreditCard, Newspaper, Database,
};

const CATEGORIES = ["All", ...Array.from(new Set(TEMPLATE_METADATA.map((t) => t.category)))];

export default function TemplatesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const filteredTemplates = useMemo(() => {
    return TEMPLATE_METADATA.filter((template) => {
      const matchesSearch =
        template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === "All" || template.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    // ── Track: template search (debounced by nature of typing) ──
    if (value.trim().length > 2) {
      analytics.templateSearched(value.trim());
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 md:py-12">
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="flex-1">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-3 text-zinc-900 dark:text-white">Architecture Templates</h1>
          <p className="text-zinc-600 dark:text-zinc-400 text-sm md:text-base max-w-xl">Jumpstart your design with pre-configured, industry-standard database schemas.</p>
        </div>
        <div className="relative w-full md:w-80 group">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-black dark:group-focus-within:text-white transition-colors" />
          <input type="text" placeholder="Search templates..." value={searchQuery} onChange={(e) => handleSearchChange(e.target.value)} className="w-full pl-10 pr-10 py-2.5 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white transition-all text-sm text-zinc-900 dark:text-white placeholder:text-zinc-500" />
          {searchQuery && (
            <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-md transition-colors"><X className="w-3.5 h-3.5 text-zinc-500" /></button>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-10 pb-4 border-b border-zinc-200 dark:border-zinc-800">
        {CATEGORIES.map((cat) => (
          <button key={cat} onClick={() => setSelectedCategory(cat)} className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all border ${selectedCategory === cat ? "bg-black text-white border-black dark:bg-white dark:text-black dark:border-white shadow-sm" : "bg-zinc-50 dark:bg-zinc-900/50 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 hover:text-zinc-900 dark:hover:text-zinc-200"}`}>{cat}</button>
        ))}
      </div>

      {filteredTemplates.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((template) => (
            <TemplateCard key={template.id} template={template} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 bg-zinc-50/50 dark:bg-zinc-900/20 rounded-3xl border-2 border-dashed border-zinc-200 dark:border-zinc-800">
          <Search className="w-10 h-10 text-zinc-400 mb-4" />
          <p className="text-zinc-600 dark:text-zinc-400 font-medium">No templates found for &quot;<span className="text-black dark:text-white">{searchQuery}</span>&quot;</p>
          <button onClick={() => { setSearchQuery(""); setSelectedCategory("All"); }} className="mt-4 px-4 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-black dark:text-white text-sm font-bold hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors shadow-sm">Clear all filters</button>
        </div>
      )}
    </div>
  );
}

function TemplateCard({ template }: { template: TemplateMeta }) {
  const [isPending, startTransition] = useTransition();
  const IconComponent = ICON_MAP[template.iconName] || Database;

  const handleUse = () => {
    // ── Track: template used ──
    analytics.templateUsed(template.id, template.name);

    startTransition(async () => {
      await createFromTemplateById(template.id);
    });
  };

  return (
    <div className="group flex flex-col bg-white dark:bg-[#0c0c0e] border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden hover:shadow-xl hover:border-black dark:hover:border-white transition-all duration-300">
      <div className="h-40 bg-zinc-50/50 dark:bg-zinc-900/30 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.2] dark:opacity-[0.15] bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:14px_24px]" />
        {template.preview && template.preview.tables.length > 0 ? (
          <TemplatePreview preview={template.preview} className="w-full h-full relative z-10 opacity-70 group-hover:opacity-100 group-hover:scale-[1.03] transition-all duration-500" />
        ) : (
          <div className="relative z-10 w-20 h-20 rounded-full border-2 border-dashed border-zinc-300 dark:border-zinc-700 flex items-center justify-center group-hover:scale-105 transition-transform"><Plus className="w-8 h-8 text-zinc-400" /></div>
        )}
      </div>
      <div className="p-6 flex flex-col flex-1">
        <div className="flex items-center justify-between mb-4">
          <div className="p-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm group-hover:border-black dark:group-hover:border-white transition-colors"><IconComponent className="w-5 h-5 text-black dark:text-white" /></div>
          <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-md text-zinc-600 dark:text-zinc-400">{template.category}</span>
        </div>
        <h3 className="text-lg font-bold mb-2 text-zinc-900 dark:text-white group-hover:underline decoration-2 underline-offset-4 decoration-zinc-300 dark:decoration-zinc-700 transition-all">{template.name}</h3>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6 leading-relaxed line-clamp-2">{template.description}</p>
        <div className="mt-auto pt-5 border-t border-zinc-100 dark:border-zinc-800/50 flex items-center justify-between">
          <div className="flex items-center gap-3 text-xs text-zinc-500 font-semibold uppercase tracking-wider">
            <div className="flex items-center gap-1.5" title="Tables"><TableIcon className="w-3.5 h-3.5" /> {template.tableCount}</div>
            <div className="flex items-center gap-1.5" title="Relationships"><Layers className="w-3.5 h-3.5" /> {template.relationCount}</div>
          </div>
          <button type="button" onClick={handleUse} disabled={isPending} className="flex items-center gap-2 px-4 py-2 bg-black hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-black rounded-lg text-sm font-bold transition-all active:scale-95 shadow-sm disabled:opacity-50">
            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Use <ArrowRight className="w-4 h-4" /></>}
          </button>
        </div>
      </div>
    </div>
  );
}