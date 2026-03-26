/* eslint-disable @typescript-eslint/no-explicit-any */
import { PrismaClient } from "@prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { createPool } from "mariadb";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const createPrismaClient = () => {
  const dbUrl = process.env.DATABASE_URL;

  // Fallback for build steps
  if (!dbUrl) {
    return new PrismaClient() as any;
  }

  try {
    // 1. Create a native MariaDB/MySQL connection pool using the raw URL
    const pool = createPool({
      host: new URL(dbUrl).hostname,
      port: Number(new URL(dbUrl).port),
      user: new URL(dbUrl).username,
      password: new URL(dbUrl).password,
      database: new URL(dbUrl).pathname.slice(1),
      connectionLimit: 5,
      // Force SSL but bypass strict CA checks for serverless environments
      ssl: { rejectUnauthorized: false } 
    });

    // 2. Attach the pool to the Prisma Adapter
    // ADD 'as any' HERE TO BYPASS THE TYPESCRIPT BUILD ERROR
    const adapter = new PrismaMariaDb(pool as any);

    // 3. Return the fully configured client
    return new PrismaClient({ adapter });
  } catch (error) {
    console.error("Failed to initialize Prisma Adapter", error);
    return new PrismaClient() as any;
  }
};

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;