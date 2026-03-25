"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Library, Settings } from "lucide-react";

export function SidebarNav() {
  const pathname = usePathname();

  const navLinks = [
    { name: "Schemas", href: "/dashboard", icon: LayoutDashboard },
    { name: "Templates", href: "/templates", icon: Library },
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  return (
    <nav className="flex flex-col gap-1">
      <h3 className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-2 px-2">
        Overview
      </h3>
      
      {navLinks.map((link) => {
        // Match exact path, or if we are in a sub-route
        const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
        const Icon = link.icon;

        return (
          <Link
            key={link.name}
            href={link.href}
            className={`group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 ${
              isActive
                ? "bg-white dark:bg-zinc-800/80 text-black dark:text-white shadow-sm ring-1 ring-zinc-200 dark:ring-zinc-700 font-semibold"
                : "text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50 font-medium"
            }`}
          >
            <Icon 
              className={`w-4 h-4 transition-colors ${
                isActive 
                  ? "text-black dark:text-white" 
                  : "text-zinc-400 group-hover:text-black dark:group-hover:text-white"
              }`} 
            />
            {link.name}
          </Link>
        );
      })}
    </nav>
  );
}