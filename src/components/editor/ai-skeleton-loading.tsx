"use client";

import { Database } from "lucide-react";

export function AILoadingSkeleton() {
  // Configuration for the background ghost tables to simulate an architecture blueprint
  const ghostTables = [
    { id: 1, transform: "-translate-y-12", delay: "0s" },
    { id: 2, transform: "translate-y-8", delay: "0.5s" },
    { id: 3, transform: "-translate-y-4", delay: "1s" },
  ];

  return (
    <div className="absolute inset-0 z-50 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-sm flex items-center justify-center animate-in fade-in duration-500">
      
      {/* Background Technical Blueprint (Ghost Schema) */}
      <div className="absolute inset-0 flex items-center justify-center opacity-20 dark:opacity-30 pointer-events-none overflow-hidden select-none">
        <div className="flex items-center gap-12 scale-110">
          {ghostTables.map((table, i) => (
            <div key={table.id} className="flex items-center gap-12">
              
              {/* Fake Table Node */}
              <div 
                className={`w-52 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-xl overflow-hidden shadow-sm animate-pulse ${table.transform}`}
                style={{ animationDelay: table.delay, animationDuration: "3s" }}
              >
                <div className="h-10 border-b border-zinc-200 dark:border-zinc-800 flex items-center px-4 bg-zinc-50 dark:bg-zinc-800/50">
                  <div className="w-24 h-2.5 bg-zinc-300 dark:bg-zinc-600 rounded-full" />
                </div>
                <div className="p-4 space-y-4">
                  {[1, 2, 3].map((row) => (
                    <div key={row} className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-zinc-200 dark:bg-zinc-700" />
                        <div className="w-16 h-2 bg-zinc-200 dark:bg-zinc-700 rounded-full" />
                      </div>
                      <div className="w-8 h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full" />
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Fake Connecting Line */}
              {i < ghostTables.length - 1 && (
                <div className="w-12 h-0.5 bg-zinc-300 dark:bg-zinc-700 border-y border-dashed border-zinc-200 dark:border-zinc-800" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Central Processing Modal */}
      <div className="relative z-10 flex flex-col items-center bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl shadow-2xl p-8 max-w-[320px] w-full mx-4 animate-in slide-in-from-bottom-4 duration-500">
        
        {/* Elegant Spinner */}
        <div className="relative w-16 h-16 mb-6">
          {/* Static Track */}
          <div className="absolute inset-0 border-[3px] border-zinc-100 dark:border-zinc-800 rounded-full" />
          {/* Spinning Highlight */}
          <div className="absolute inset-0 border-[3px] border-blue-500 border-t-transparent border-r-transparent rounded-full animate-spin" />
          {/* Center Icon */}
          <div className="absolute inset-0 flex items-center justify-center">
            <Database className="w-6 h-6 text-zinc-900 dark:text-white" />
          </div>
        </div>

        <h3 className="text-base font-semibold text-zinc-900 dark:text-white mb-2">
          Designing Architecture
        </h3>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 text-center leading-relaxed">
          Analyzing requirements and calculating optimal database relationships...
        </p>
      </div>

    </div>
  );
}