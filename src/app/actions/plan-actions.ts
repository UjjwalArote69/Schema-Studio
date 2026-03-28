"use server";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getUsageSummary, type UsageSummary } from "@/lib/plan-enforement";

export async function fetchUsageSummary(): Promise<UsageSummary | null> {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId) return null;

  return getUsageSummary(userId);
}