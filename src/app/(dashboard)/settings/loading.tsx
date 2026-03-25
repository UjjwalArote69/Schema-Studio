export default function SettingsLoading() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-8 md:py-12 animate-pulse">
      
      {/* Header Skeleton */}
      <div className="mb-10 md:mb-12 border-b border-zinc-200 dark:border-zinc-800 pb-8">
        <div className="w-64 h-10 bg-zinc-200 dark:bg-zinc-800 rounded-lg mb-4" />
        <div className="w-96 h-4 bg-zinc-200 dark:bg-zinc-800 rounded-md" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12">
        {/* Left Column Skeleton */}
        <div className="col-span-1 space-y-2">
          <div className="h-10 bg-zinc-200 dark:bg-zinc-800 rounded-lg w-full" />
          <div className="h-10 bg-zinc-100 dark:bg-zinc-900 rounded-lg w-full" />
          <div className="h-10 bg-zinc-100 dark:bg-zinc-900 rounded-lg w-full" />
        </div>

        {/* Right Column Skeleton */}
        <div className="col-span-1 md:col-span-3 max-w-3xl">
          <div className="bg-white dark:bg-[#0c0c0e] border border-zinc-200 dark:border-zinc-800 rounded-2xl h-[500px]">
            <div className="h-20 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/30 p-6" />
            <div className="p-8 space-y-10">
               <div className="flex gap-6 items-center">
                  <div className="w-20 h-20 rounded-2xl bg-zinc-200 dark:bg-zinc-800" />
                  <div className="space-y-2">
                     <div className="w-32 h-4 bg-zinc-200 dark:bg-zinc-800 rounded-md" />
                     <div className="w-48 h-3 bg-zinc-200 dark:bg-zinc-800 rounded-md" />
                  </div>
               </div>
               <div className="space-y-6">
                  <div className="w-full h-12 bg-zinc-200 dark:bg-zinc-800 rounded-xl" />
                  <div className="w-full h-12 bg-zinc-200 dark:bg-zinc-800 rounded-xl" />
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}