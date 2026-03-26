/* eslint-disable @typescript-eslint/no-explicit-any */
import { PrismaClient } from "../../prisma/generated/prisma/client";
import { Pool, neonConfig } from '@neondatabase/serverless';
import { PrismaNeon } from '@prisma/adapter-neon';
import ws from 'ws';

neonConfig.webSocketConstructor = ws;

const prismaClientSingleton = () => {
  const connectionString =
    process.env.DATABASE_URL_UNPOOLED ||
    process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error(
      "No database connection string found. " +
      "Set DATABASE_URL_UNPOOLED (or DATABASE_URL) in your .env.local file."
    );
  }

  const pool = new Pool({ connectionString });
  const adapter = new PrismaNeon(pool as any);

  return new PrismaClient({ adapter } as any);
};

declare global {
  var prismaGlobal: ReturnType<typeof prismaClientSingleton> | undefined;
}

export const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

// Keep a single instance in all environments to avoid exhausting the pool
globalThis.prismaGlobal = prisma;

export default prisma;