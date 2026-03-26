/* eslint-disable @typescript-eslint/no-explicit-any */
import { PrismaClient } from "../../prisma/generated/prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";

declare global {
  var prismaGlobal: PrismaClient | undefined;
}

function createPrismaClient(): PrismaClient {
  const connectionString =
    process.env.DATABASE_URL_UNPOOLED ||
    process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error(
      "DATABASE_URL_UNPOOLED or DATABASE_URL must be set in environment variables."
    );
  }

  // Prisma v7: PrismaNeon takes a config object directly — no Pool() wrapper needed
  const adapter = new PrismaNeon({ connectionString });

  return new PrismaClient({ adapter } as any);
}

export const prisma: PrismaClient =
  globalThis.prismaGlobal ?? (globalThis.prismaGlobal = createPrismaClient());

export default prisma;