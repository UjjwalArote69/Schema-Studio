"use client";

import { useState, useRef } from "react";
import { X, FileCode, Sparkles, Loader2, Upload } from "lucide-react";
import { parseSQL } from "@/utils/sql-parser";
import { importSchemaAction } from "@/app/actions/schema-actions";
import { useRouter } from "next/navigation";

export function DashboardImportModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [sql, setSql] = useState("");
  const [isImporting, setIsImporting] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith(".sql")) {
      alert("Please upload a valid .sql file.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setSql(content);
      setFileName(file.name);
    };
    reader.readAsText(file);
  };

  const handleImport = async () => {
    if (!sql.trim()) return;
    setIsImporting(true);

    try {
      const schemaData = parseSQL(sql);
      
      if (schemaData.tables.length === 0) {
        alert("No valid CREATE TABLE statements found in this file.");
        setIsImporting(false);
        return;
      }

      const projectName = fileName ? fileName.replace(".sql", "") : "Imported Schema";
      const newProjectId = await importSchemaAction(projectName, schemaData);

      router.push(`/editor/${newProjectId}`);
    } catch (err) {
      console.error(err);
      alert("Failed to import. Check your SQL syntax.");
      setIsImporting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-zinc-100 dark:border-zinc-900 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-900/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-zinc-900 dark:bg-white rounded-xl shadow-lg">
              <FileCode className="w-5 h-5 text-white dark:text-black" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Import SQL Architecture</h2>
              <p className="text-xs text-zinc-500">Upload a .sql file or paste your code</p>
            </div>
          </div>
          <button onClick={onClose} disabled={isImporting} className="p-2 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-full transition-colors text-zinc-500 hover:text-zinc-900 dark:hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 flex flex-col gap-4">
          {/* File Upload Trigger */}
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="group cursor-pointer border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl p-8 flex flex-col items-center justify-center gap-3 hover:border-zinc-400 dark:hover:border-zinc-600 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-all"
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              accept=".sql" 
              className="hidden" 
            />
            <div className="p-3 bg-zinc-100 dark:bg-zinc-900 rounded-xl group-hover:scale-110 transition-transform shadow-sm">
              <Upload className="w-6 h-6 text-zinc-500 group-hover:text-black dark:group-hover:text-white" />
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-zinc-900 dark:text-white">
                {fileName ? `Selected: ${fileName}` : "Click to upload .sql file"}
              </p>
              <p className="text-xs text-zinc-500 mt-1 uppercase tracking-widest font-bold">Drag and drop also works</p>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-zinc-100 dark:border-zinc-800" />
            </div>
            <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-widest text-zinc-400">
              <span className="bg-white dark:bg-zinc-950 px-3">OR PASTE CODE</span>
            </div>
          </div>

          <textarea
            value={sql}
            onChange={(e) => {
              setSql(e.target.value);
              if (fileName) setFileName(null); 
            }}
            disabled={isImporting}
            placeholder="CREATE TABLE users ( ... );"
            className="w-full h-48 p-4 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-2xl font-mono text-sm focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white focus:border-black dark:focus:border-white transition-all resize-none text-zinc-900 dark:text-white placeholder:text-zinc-500"
          />
        </div>

        {/* Footer */}
        <div className="px-6 py-5 bg-zinc-50 dark:bg-zinc-900/50 border-t border-zinc-100 dark:border-zinc-900 flex justify-end gap-3">
          <button onClick={onClose} disabled={isImporting} className="px-5 py-2.5 text-sm font-bold text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors">
            Cancel
          </button>
          <button 
            onClick={handleImport}
            disabled={isImporting || !sql.trim()}
            className="flex items-center gap-2 bg-black hover:bg-zinc-800 text-white dark:bg-white dark:hover:bg-zinc-200 dark:text-black px-6 py-2.5 rounded-xl text-sm font-bold shadow-md active:scale-95 disabled:opacity-50 transition-all"
          >
            {isImporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            {isImporting ? "Processing..." : "Import & Design"}
          </button>
        </div>
      </div>
    </div>
  );
}