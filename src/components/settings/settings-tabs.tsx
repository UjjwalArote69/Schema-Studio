"use client";

import Link from "next/link";
import { User, CreditCard, Shield } from "lucide-react";

interface SettingsTabsProps {
  activeTab: string;
}

const TABS = [
  { id: "profile", label: "Profile", icon: User, href: "/settings?tab=profile" },
  { id: "billing", label: "Billing", icon: CreditCard, href: "/settings?tab=billing" },
  {
    id: "security",
    label: "Security",
    icon: Shield,
    href: "#",
    disabled: true,
  },
];

export function SettingsTabs({ activeTab }: SettingsTabsProps) {
  return (
    <div className="col-span-1 space-y-1">
      {TABS.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        if (tab.disabled) {
          return (
            <div
              key={tab.id}
              className="px-3 py-2.5 text-sm font-medium text-zinc-500 cursor-not-allowed opacity-60 flex items-center gap-3 transition-colors"
            >
              <Icon className="w-4 h-4" /> {tab.label}
            </div>
          );
        }

        return (
          <Link
            key={tab.id}
            href={tab.href}
            className={`px-3 py-2.5 rounded-lg text-sm font-bold flex items-center gap-3 transition-all ${
              isActive
                ? "bg-white dark:bg-zinc-800/80 text-black dark:text-white shadow-sm ring-1 ring-zinc-200 dark:ring-zinc-700"
                : "text-zinc-500 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800/50"
            }`}
          >
            <Icon className="w-4 h-4" /> {tab.label}
          </Link>
        );
      })}
    </div>
  );
}