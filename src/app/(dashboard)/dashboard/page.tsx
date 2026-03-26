import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Plus } from "lucide-react";
import { createSchema } from "@/app/actions/schema-actions";
import { ImportButton } from "@/components/dashboard/import-button";
import { ProjectGrid } from "@/components/dashboard/project-grid";
import { getAllProjects, getUser } from "@/lib/dashboard-queries";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  if (!userId) redirect("/login");

  const [projects, user] = await Promise.all([
    getAllProjects(userId),
    getUser(userId),
  ]);

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 md:py-12">
      {/* Premium Monochrome Welcome Banner */}
      <div className="relative mb-10 p-8 rounded-3xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 overflow-hidden shadow-sm">
        <div className="absolute inset-0 opacity-[0.4] dark:opacity-[0.2] bg-[radial-gradient(#a1a1aa_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

        <div className="relative z-10">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-2 text-zinc-900 dark:text-white">
            {user?.name
              ? `${user.name.split(" ")[0]}'s Workspace`
              : "Your Workspace"}
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400 text-sm md:text-base max-w-xl">
            Manage your{" "}
            <span className="font-bold text-black dark:text-white">
              {projects.length}
            </span>{" "}
            active database architectures, import existing SQL, or start a new
            design.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-3 w-full md:w-auto">
          <ImportButton />
          <form action={createSchema}>
            <button
              type="submit"
              className="flex items-center justify-center w-full md:w-auto gap-2 bg-black hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-black px-6 py-3 rounded-xl text-sm font-bold transition-all shadow-md active:scale-95 whitespace-nowrap"
            >
              <Plus className="w-5 h-5" />
              New Schema
            </button>
          </form>
        </div>
      </div>

      {/* Search + Project Grid (client component for instant filtering) */}
      <ProjectGrid projects={projects} />
    </div>
  );
}