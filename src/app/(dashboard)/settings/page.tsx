import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import {prisma}  from "@/lib/prisma";
import { User, Mail, Shield, Save, AlertTriangle, CreditCard } from "lucide-react";
import { updateProfile, deleteAccount } from "@/app/actions/user-actions";

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id: string })?.id;

  const dbUser = await prisma.user.findUnique({
    where: { id: userId }
  });

  if (!dbUser) return null;

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 md:py-12">
      
      {/* Symmetrical Header */}
      <div className="mb-10 md:mb-12 border-b border-zinc-200 dark:border-zinc-800 pb-8">
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-2 text-zinc-900 dark:text-white">
          Account Settings
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400 text-sm md:text-base max-w-xl">
          Manage your preferences, update your profile, and control your data.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12">
        <div className="col-span-1 space-y-1">
          <div className="px-3 py-2.5 bg-white dark:bg-zinc-800/80 rounded-lg text-sm font-bold text-black dark:text-white flex items-center gap-3 shadow-sm ring-1 ring-zinc-200 dark:ring-zinc-700 transition-all">
            <User className="w-4 h-4" /> Profile
          </div>
          <div className="px-3 py-2.5 text-sm font-medium text-zinc-500 hover:text-black dark:hover:text-white cursor-not-allowed opacity-60 flex items-center gap-3 transition-colors">
            <CreditCard className="w-4 h-4" /> Billing 
            <span className="ml-auto text-[10px] font-bold uppercase tracking-wider bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-500 px-1.5 py-0.5 rounded-md">Soon</span>
          </div>
          <div className="px-3 py-2.5 text-sm font-medium text-zinc-500 hover:text-black dark:hover:text-white cursor-not-allowed opacity-60 flex items-center gap-3 transition-colors">
            <Shield className="w-4 h-4" /> Security
          </div>
        </div>

        <div className="col-span-1 md:col-span-3 space-y-8 max-w-3xl">
          
          <div className="bg-white dark:bg-[#0c0c0e] border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
            <div className="p-6 md:p-8 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30">
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white mb-1">Public Profile</h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">This information will be displayed to your team and collaborators.</p>
            </div>
            
            <form action={updateProfile} className="p-6 md:p-8">
              <div className="flex items-center gap-6 mb-10">
                <div className="w-20 h-20 rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-3xl font-bold text-zinc-900 dark:text-white shadow-sm">
                  {dbUser.name?.charAt(0).toUpperCase() || "U"}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-white">Profile Avatar</h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-xs leading-relaxed">
                    Your avatar is automatically generated from your display name. Custom uploads coming soon.
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-2">Display Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    defaultValue={dbUser.name || ""}
                    className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white focus:border-black dark:focus:border-white transition-all text-sm font-medium text-zinc-900 dark:text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-2">Email Address</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
                    <input
                      type="email"
                      disabled
                      defaultValue={dbUser.email || ""}
                      className="w-full pl-11 pr-4 py-2.5 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm font-medium text-zinc-500 dark:text-zinc-400 cursor-not-allowed opacity-70"
                    />
                  </div>
                  <p className="text-[11px] font-medium text-zinc-500 dark:text-zinc-500 mt-2 uppercase tracking-wide">
                    Permanently tied to your authentication provider
                  </p>
                </div>
              </div>

              <div className="mt-10 pt-6 border-t border-zinc-100 dark:border-zinc-800/50 flex justify-end">
                <button 
                  type="submit"
                  className="flex items-center gap-2 bg-black hover:bg-zinc-800 text-white dark:bg-white dark:hover:bg-zinc-200 dark:text-black px-6 py-2.5 rounded-xl text-sm font-bold transition-all shadow-md active:scale-95"
                >
                  <Save className="w-4 h-4" /> Save Changes
                </button>
              </div>
            </form>
          </div>

          <div className="bg-red-50/50 dark:bg-red-950/10 border border-red-200 dark:border-red-900/30 rounded-2xl overflow-hidden mt-8">
            <div className="p-6 md:p-8 flex flex-col sm:flex-row sm:items-start md:items-center justify-between gap-6">
              <div>
                <div className="flex items-center gap-2 text-red-600 dark:text-red-500 mb-1.5">
                  <AlertTriangle className="w-5 h-5" />
                  <h2 className="text-lg font-bold">Danger Zone</h2>
                </div>
                <p className="text-sm font-medium text-red-600/80 dark:text-red-400/80 max-w-sm leading-relaxed">
                  Permanently delete your account and all of your schema projects. This action cannot be undone.
                </p>
              </div>
              <form action={deleteAccount} className="shrink-0">
                <button type="submit" className="whitespace-nowrap px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-bold transition-all shadow-md active:scale-95">
                  Delete Account
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}