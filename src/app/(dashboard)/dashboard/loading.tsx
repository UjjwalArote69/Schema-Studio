export default function DashboardLoading() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-8 md:py-12 animate-pulse">
      
      {/* Hero Banner Skeleton */}
      <div className="mb-10 p-8 rounded-3xl bg-zinc-100 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 h-40 flex flex-col md:flex-row items-start md:items-center justify-between gap-6" />

      {/* Toolbar Skeleton */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-4 mb-8">
        <div className="w-32 h-6 bg-zinc-200 dark:bg-zinc-800 rounded-md" />
        <div className="w-full sm:w-72 h-10 bg-zinc-200 dark:bg-zinc-800 rounded-xl" />
      </div>

      {/* Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="flex flex-col bg-white dark:bg-[#0c0c0e] border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden h-72">
            <div className="h-40 bg-zinc-100 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800" />
            <div className="p-5 flex flex-col flex-1">
              <div className="w-3/4 h-5 bg-zinc-200 dark:bg-zinc-800 rounded-md mb-2" />
              <div className="w-1/2 h-3 bg-zinc-200 dark:bg-zinc-800 rounded-md mb-auto" />
              <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800/50 flex justify-between">
                <div className="w-24 h-4 bg-zinc-200 dark:bg-zinc-800 rounded-md" />
                <div className="w-16 h-4 bg-zinc-200 dark:bg-zinc-800 rounded-md" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}