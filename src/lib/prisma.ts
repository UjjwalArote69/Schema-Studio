/* eslint-disable @typescript-eslint/no-explicit-any */
// lib/prisma.ts
import { PrismaClient } from "../../prisma/generated/prisma/client";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

// Add ({} as any) right here to satisfy the custom-generated TypeScript rules
export const prisma = globalForPrisma.prisma || new PrismaClient({} as any);

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;