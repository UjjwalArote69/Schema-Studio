export default function DocsLoading() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-8 md:py-12 animate-pulse">
      
      {/* Header Skeleton */}
      <div className="mb-10 md:mb-12 border-b border-zinc-200 dark:border-zinc-800 pb-8">
        <div className="w-48 h-10 bg-zinc-200 dark:bg-zinc-800 rounded-lg mb-4" />
        <div className="w-80 max-w-full h-4 bg-zinc-200 dark:bg-zinc-800 rounded-md" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12">
        {/* Nav Skeleton */}
        <div className="col-span-1 space-y-2">
          <div className="h-2.5 w-12 bg-zinc-200 dark:bg-zinc-800 rounded mb-4" />
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-10 bg-zinc-100 dark:bg-zinc-900 rounded-lg w-full" />
          ))}
        </div>

        {/* Content Skeleton */}
        <div className="col-span-1 md:col-span-3 space-y-12">
          {[1, 2].map((section) => (
            <div key={section} className="space-y-6">
              <div className="w-40 h-8 bg-zinc-200 dark:bg-zinc-800 rounded-md" />
              <div className="w-full h-24 bg-zinc-100 dark:bg-zinc-900 rounded-2xl" />
              <div className="grid grid-cols-2 gap-4">
                 <div className="h-32 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl" />
                 <div className="h-32 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}