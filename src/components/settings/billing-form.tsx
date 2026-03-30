// ============================================================
// FILE: src/components/settings/billing-form.tsx
// (Replaces your existing billing-form.tsx)
//
// Changes: Added analytics.upgradeClicked and billingPortalOpened
// ============================================================

"use client";

import { useState } from "react";
import {
  Check,
  Loader2,
  Sparkles,
  ExternalLink,
  Crown,
  Zap,
  Shield,
  Infinity,
} from "lucide-react";
import { analytics } from "@/lib/analytics";

interface BillingFormProps {
  plan: string;
  stripeCurrentPeriodEnd: string | null;
}

export function BillingForm({ plan, stripeCurrentPeriodEnd }: BillingFormProps) {
  const [loading, setLoading] = useState<"monthly" | "yearly" | "portal" | null>(null);
  const [error, setError] = useState("");
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("yearly");
  const isPro = plan === "pro";

  const handleCheckout = async (interval: "monthly" | "yearly") => {
    setLoading(interval);
    setError("");
    analytics.upgradeClicked(interval);
    try {
      const res = await fetch("/api/stripe/checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ interval }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to start checkout");
      window.location.href = data.url;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(null);
    }
  };

  const handleManageBilling = async () => {
    setLoading("portal");
    setError("");
    analytics.billingPortalOpened();
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to open billing portal");
      window.location.href = data.url;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-xl text-sm font-medium text-red-600 dark:text-red-400">{error}</div>
      )}

      {isPro ? (
        <div className="bg-white dark:bg-[#0c0c0e] border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden">
          <div className="px-6 md:px-8 py-5 border-b border-zinc-100 dark:border-zinc-800/50 bg-zinc-50/50 dark:bg-zinc-900/30">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 flex items-center justify-center flex-shrink-0"><Crown className="w-5 h-5" /></div>
              <div>
                <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Billing & Subscription</h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">You&apos;re on the Pro plan. Thank you for your support!</p>
              </div>
            </div>
          </div>
          <div className="px-6 md:px-8 py-6 md:py-8 space-y-6">
            <div className="p-5 bg-gradient-to-br from-amber-50 to-orange-50/50 dark:from-amber-950/20 dark:to-orange-950/10 border border-amber-200/60 dark:border-amber-900/30 rounded-2xl">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-100 dark:bg-amber-900/40 border border-amber-200 dark:border-amber-800/50 rounded-full">
                    <Crown className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" /><span className="text-xs font-bold text-amber-700 dark:text-amber-300">PRO</span>
                  </div>
                  <span className="text-sm font-semibold text-zinc-900 dark:text-white">SchemaStudio Pro</span>
                </div>
                <Shield className="w-5 h-5 text-amber-500/50" />
              </div>
              {stripeCurrentPeriodEnd && (
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-5">Your subscription renews on{" "}<span className="font-semibold text-zinc-900 dark:text-white">{new Date(stripeCurrentPeriodEnd).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</span></p>
              )}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {["Unlimited projects", "Unlimited tables", "Unlimited AI / day", "100 snapshots", "Unlimited columns", "All export formats"].map((f) => (
                  <div key={f} className="flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400"><Check className="w-3 h-3 text-amber-500 flex-shrink-0" />{f}</div>
                ))}
              </div>
            </div>
            <button onClick={handleManageBilling} disabled={loading === "portal"} className="flex items-center justify-center gap-2 px-5 py-2.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-zinc-900 dark:text-white rounded-xl text-sm font-bold transition-all active:scale-95 border border-zinc-200 dark:border-zinc-800">
              {loading === "portal" ? <Loader2 className="w-4 h-4 animate-spin" /> : <ExternalLink className="w-4 h-4" />} Manage Subscription
            </button>
            <p className="text-xs text-zinc-400">Update payment method, view invoices, or cancel via Stripe&apos;s secure portal.</p>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-[#0c0c0e] border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden">
          <div className="px-6 md:px-8 py-5 border-b border-zinc-100 dark:border-zinc-800/50 bg-zinc-50/50 dark:bg-zinc-900/30">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 flex items-center justify-center flex-shrink-0"><Zap className="w-5 h-5" /></div>
              <div>
                <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Upgrade to Pro</h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">Remove all limits and unlock the full power of SchemaStudio.</p>
              </div>
            </div>
          </div>
          <div className="px-6 md:px-8 py-6 md:py-8 space-y-8">
            <div className="flex items-center justify-center">
              <div className="inline-flex items-center p-1 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl">
                <button onClick={() => setBillingCycle("monthly")} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${billingCycle === "monthly" ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm" : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"}`}>Monthly</button>
                <button onClick={() => setBillingCycle("yearly")} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${billingCycle === "yearly" ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm" : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"}`}>Yearly<span className="px-1.5 py-0.5 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold rounded-md">-17%</span></button>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col p-5 bg-zinc-50/50 dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-800 rounded-2xl">
                <div className="flex items-center gap-2 mb-4"><Zap className="w-4 h-4 text-zinc-400" /><span className="text-sm font-bold text-zinc-500">Free</span><span className="ml-auto px-2 py-0.5 bg-zinc-200 dark:bg-zinc-800 text-zinc-500 text-[10px] font-bold rounded-md uppercase">Current</span></div>
                <div className="flex items-baseline gap-1 mb-6"><span className="text-3xl font-extrabold text-zinc-900 dark:text-white">₹0</span><span className="text-sm text-zinc-400">/forever</span></div>
                <div className="space-y-3.5 flex-1">
                  <LimitRow label="Projects" value="3" /><LimitRow label="Tables / project" value="10" /><LimitRow label="AI generations" value="5 / day" /><LimitRow label="Snapshots" value="5" /><LimitRow label="Columns / table" value="15" /><LimitRow label="Export formats" value="All 6" isIncluded />
                </div>
              </div>
              <div className="relative flex flex-col p-5 border-2 border-zinc-900 dark:border-white rounded-2xl bg-white dark:bg-zinc-950">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-full text-[10px] font-bold uppercase tracking-widest whitespace-nowrap">Recommended</div>
                <div className="flex items-center gap-2 mb-4 mt-1"><Crown className="w-4 h-4 text-amber-500" /><span className="text-sm font-bold text-zinc-900 dark:text-white">Pro</span></div>
                <div className="mb-1">
                  <div className="flex items-baseline gap-1"><span className="text-3xl font-extrabold text-zinc-900 dark:text-white">{billingCycle === "monthly" ? "₹99" : "₹999"}</span><span className="text-sm text-zinc-400">/{billingCycle === "monthly" ? "month" : "year"}</span></div>
                  {billingCycle === "yearly" && <p className="text-xs text-zinc-400 mt-0.5">₹83/mo · billed annually · <span className="text-emerald-600 dark:text-emerald-400 font-semibold">save ₹189</span></p>}
                </div>
                <div className="h-3" />
                <div className="space-y-3.5 flex-1">
                  <LimitRow label="Projects" value="Unlimited" isUnlimited /><LimitRow label="Tables / project" value="Unlimited" isUnlimited /><LimitRow label="AI generations" value="Unlimited" isUnlimited /><LimitRow label="Snapshots" value="100" isIncluded /><LimitRow label="Columns / table" value="Unlimited" isUnlimited /><LimitRow label="Export formats" value="All 6" isIncluded />
                </div>
                <div className="h-5" />
                <button onClick={() => handleCheckout(billingCycle)} disabled={loading !== null} className="w-full flex items-center justify-center gap-2 py-3 bg-zinc-900 hover:bg-black dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-black rounded-xl text-sm font-bold transition-all active:scale-95 disabled:opacity-50 shadow-md">
                  {loading === billingCycle ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  {loading === billingCycle ? "Redirecting to Stripe..." : `Upgrade — ${billingCycle === "monthly" ? "₹99/mo" : "₹999/yr"}`}
                </button>
              </div>
            </div>
            <p className="text-[11px] text-zinc-400 text-center">Secure payment via Stripe · Cancel anytime · No hidden fees</p>
          </div>
        </div>
      )}
    </div>
  );
}

function LimitRow({ label, value, isUnlimited, isIncluded }: { label: string; value: string; isUnlimited?: boolean; isIncluded?: boolean }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-zinc-500 dark:text-zinc-400">{label}</span>
      <span className={`font-semibold flex items-center gap-1 ${isUnlimited ? "text-emerald-600 dark:text-emerald-400" : isIncluded ? "text-zinc-900 dark:text-white" : "text-zinc-500 dark:text-zinc-400"}`}>
        {isUnlimited && <Infinity className="w-3.5 h-3.5" />}{isIncluded && !isUnlimited && <Check className="w-3.5 h-3.5 text-emerald-500" />}{value}
      </span>
    </div>
  );
}