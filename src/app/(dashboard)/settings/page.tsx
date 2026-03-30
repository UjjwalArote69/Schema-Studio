import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { User, Mail, Shield, CreditCard } from "lucide-react";
import { DeleteAccountForm } from "@/components/settings/delete-account-form";
import { ProfileForm } from "@/components/settings/profile-form";
import { BillingForm } from "@/components/settings/billing-form";
import { SettingsTabs } from "@/components/settings/settings-tabs";

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; upgraded?: string; canceled?: string }>;
}) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  const dbUser = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!dbUser) return null;

  const params = await searchParams;
  const activeTab = params.tab || "profile";

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 md:py-12">
      {/* Header */}
      <div className="mb-10 md:mb-12 border-b border-zinc-200 dark:border-zinc-800 pb-8">
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-2 text-zinc-900 dark:text-white">
          Account Settings
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400 text-sm md:text-base max-w-xl">
          Manage your preferences, update your profile, and control your data.
        </p>
      </div>

      {/* Success / Canceled banners */}
      {params.upgraded === "true" && (
        <div className="mb-6 p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 rounded-xl text-sm font-medium text-emerald-700 dark:text-emerald-300 animate-in fade-in slide-in-from-top-2">
          🎉 Welcome to Pro! Your account has been upgraded successfully.
        </div>
      )}
      {params.canceled === "true" && (
        <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-xl text-sm font-medium text-amber-700 dark:text-amber-300 animate-in fade-in slide-in-from-top-2">
          Checkout was canceled. No charges were made.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12">
        {/* Sidebar Navigation — client component for active tab */}
        <SettingsTabs activeTab={activeTab} />

        {/* Main Content */}
        <div className="col-span-1 md:col-span-3 space-y-8 max-w-3xl">
          {activeTab === "profile" && (
            <>
              {/* Profile Card */}
              <div className="bg-white dark:bg-[#0c0c0e] border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden">
                <div className="px-6 md:px-8 py-5 border-b border-zinc-100 dark:border-zinc-800/50 bg-zinc-50/50 dark:bg-zinc-900/30">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-black flex items-center justify-center text-sm font-bold flex-shrink-0">
                      {dbUser.name?.charAt(0)?.toUpperCase() || "U"}
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-zinc-900 dark:text-white">
                        Profile Information
                      </h2>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">
                        Update your display name and view your account details.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="px-6 md:px-8 py-6 md:py-8 space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                      Email Address
                    </label>
                    <div className="flex items-center gap-3 w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm text-zinc-500 dark:text-zinc-400">
                      <Mail className="w-4 h-4 text-zinc-400 flex-shrink-0" />
                      <span className="truncate">{dbUser.email}</span>
                      <span className="ml-auto text-[10px] font-bold uppercase tracking-wider text-zinc-400 flex-shrink-0">
                        Read-only
                      </span>
                    </div>
                  </div>
                  <ProfileForm defaultName={dbUser.name || ""} />
                </div>
              </div>

              {/* Danger Zone */}
              <DeleteAccountForm userEmail={dbUser.email || ""} />
            </>
          )}

          {activeTab === "billing" && (
            <BillingForm
              plan={dbUser.plan}
              stripeCurrentPeriodEnd={
                dbUser.stripeCurrentPeriodEnd?.toISOString() ?? null
              }
            />
          )}
        </div>
      </div>
    </div>
  );
}