"use client";

import { useState } from "react";
import { FileCode } from "lucide-react";
import { DashboardImportModal } from "./dashboard-import-modal";

export function ImportButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-900 dark:text-zinc-100 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all border border-zinc-200 dark:border-zinc-800 active:scale-95 whitespace-nowrap"
      >
        <FileCode className="w-4 h-4" />
        Import SQL
      </button>

      <DashboardImportModal 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)} 
      />
    </>
  );
}