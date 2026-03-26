import { cache } from "react";
import { prisma } from "@/lib/prisma";

/**
 * Cached data fetchers for the dashboard layout + pages.
 *
 * React's `cache()` deduplicates calls with the same arguments
 * within a single server render pass. So when the layout calls
 * `getUser(userId)` and the dashboard page also calls `getUser(userId)`,
 * only one database query actually executes.
 */

export const getUser = cache(async (userId: string) => {
  return prisma.user.findUnique({
    where: { id: userId },
  });
});

export const getRecentProjects = cache(async (userId: string, take = 3) => {
  return prisma.project.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    take,
    select: { id: true, name: true },
  });
});

export const getAllProjects = cache(async (userId: string) => {
  return prisma.project.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
  });
});