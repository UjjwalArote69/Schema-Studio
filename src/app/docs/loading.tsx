export default function DocsLoading() {
  return (
    <div className="max-w-3xl mx-auto px-5 sm:px-8 py-8 md:py-12 animate-pulse">
      {/* H2 skeleton */}
      <div className="w-48 h-8 bg-zinc-200 dark:bg-zinc-800 rounded-lg mb-4" />
      <div className="w-full h-4 bg-zinc-100 dark:bg-zinc-900 rounded-md mb-2" />
      <div className="w-5/6 h-4 bg-zinc-100 dark:bg-zinc-900 rounded-md mb-2" />
      <div className="w-2/3 h-4 bg-zinc-100 dark:bg-zinc-900 rounded-md mb-8" />

      {/* Steps skeleton */}
      <div className="w-32 h-6 bg-zinc-200 dark:bg-zinc-800 rounded-md mb-4" />
      <div className="space-y-4 mb-10">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-start gap-4">
            <div className="w-7 h-7 bg-zinc-200 dark:bg-zinc-800 rounded-lg shrink-0" />
            <div className="flex-1 space-y-1.5">
              <div className="w-40 h-4 bg-zinc-200 dark:bg-zinc-800 rounded-md" />
              <div className="w-full h-3 bg-zinc-100 dark:bg-zinc-900 rounded-md" />
            </div>
          </div>
        ))}
      </div>

      {/* Cards skeleton */}
      <div className="w-40 h-7 bg-zinc-200 dark:bg-zinc-800 rounded-md mb-4" />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-10">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 bg-zinc-50 dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-800 rounded-xl" />
        ))}
      </div>

      {/* Table skeleton */}
      <div className="w-44 h-7 bg-zinc-200 dark:bg-zinc-800 rounded-md mb-4" />
      <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden mb-10">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className={`h-11 ${i !== 1 ? "border-t border-zinc-100 dark:border-zinc-800/50" : ""}`} />
        ))}
      </div>

      {/* Code block skeleton */}
      <div className="w-52 h-7 bg-zinc-200 dark:bg-zinc-800 rounded-md mb-4" />
      <div className="h-44 bg-[#0d1117] border border-zinc-200 dark:border-zinc-800 rounded-xl" />
    </div>
  );
}