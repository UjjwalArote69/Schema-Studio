import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Database, Sparkles, BookOpen, Clock, ChevronRight } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { LogoutButton } from "@/components/logout-button";
import { SidebarNav } from "@/components/layout/sidebar-nav";
import { prisma } from "@/lib/prisma";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as {id: string})?.id;
  if (!session || !userId) {redirect("/login");}

  const [User, recentProjects] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId } }),
    prisma.project.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
      take: 3,
      select: { id: true, name: true }
    })
  ]);

  if (!User) return null;

  return (
    <div className="flex h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans overflow-hidden">
      
      {/* Sidebar */}
      <aside className="w-64 border-r border-zinc-200 dark:border-zinc-800 bg-zinc-50/30 dark:bg-[#0c0c0e] flex flex-col">
        
        {/* Brand Header */}
        <div className="h-14 flex items-center px-5 border-b border-zinc-200 dark:border-zinc-800">
          <Link href="/dashboard" className="flex items-center gap-2.5 font-semibold text-sm hover:opacity-80 transition-opacity">
            <div className="p-1 bg-black dark:bg-white rounded-[6px]">
              <Database className="w-4 h-4 text-white dark:text-black" />
            </div>
            <span>SchemaStudio</span>
          </Link>
        </div>

        {/* Scrollable Nav Area */}
        <div className="flex-1 overflow-y-auto py-5 px-3 flex flex-col gap-6 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          
          <div className="space-y-0.5">
            <SidebarNav />
          </div>

          {/* Dynamic Recent Projects */}
          {recentProjects.length > 0 && (
            <div>
              <h3 className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider mb-2 px-2">
                Recent
              </h3>
              <div className="space-y-0.5">
                {recentProjects.map((project) => (
                  <Link 
                    key={project.id} 
                    href={`/editor/${project.id}`}
                    className="flex items-center gap-2.5 px-2 py-1.5 text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50 rounded-md transition-colors group"
                  >
                    <Clock className="w-3.5 h-3.5 opacity-50 group-hover:opacity-100 transition-opacity" />
                    <span className="truncate flex-1">{project.name}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Resources */}
          <div className="mt-auto space-y-0.5">
            <h3 className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider mb-2 px-2">
              Resources
            </h3>
            <Link href="/docs" className="flex items-center gap-2.5 px-2 py-1.5 text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50 rounded-md transition-colors">
              <BookOpen className="w-4 h-4 opacity-50" /> Documentation
            </Link>
          </div>

          {/* Clean Pro Upgrade Box */}
          <div className="px-3 py-3 rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 group cursor-pointer hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-3.5 h-3.5 text-zinc-900 dark:text-white" />
              <span className="text-sm font-semibold text-zinc-900 dark:text-white">Upgrade to Pro</span>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-3 leading-relaxed">
              Unlock AI generation and team collaboration.
            </p>
            <span className="text-xs font-medium text-zinc-900 dark:text-white flex items-center gap-1 group-hover:gap-1.5 transition-all">
              View plans <ChevronRight className="w-3 h-3" />
            </span>
          </div>

        </div>

        {/* User Profile & Footer */}
        <div className="p-3 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
          <div className="flex items-center justify-between mb-2 px-2">
            <span className="text-xs font-medium text-zinc-500">Theme</span>
            <ThemeToggle />
          </div>
          
          <div className="flex items-center gap-2.5 p-2 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors">
            {/* Solid, non-gradient Avatar */}
            <div className="w-8 h-8 rounded bg-zinc-900 dark:bg-zinc-100 text-white dark:text-black flex items-center justify-center text-xs font-bold flex-shrink-0">
              {User.name?.charAt(0) || "U"}
            </div>
            <div className="flex flex-col flex-1 min-w-0">
              <span className="text-sm font-medium text-zinc-900 dark:text-white truncate">{User.name || "User"}</span>
              <span className="text-[11px] text-zinc-500 truncate">{User.email}</span>
            </div>
            <LogoutButton />
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto relative">
        {children}
      </main>
    </div>
  );
}