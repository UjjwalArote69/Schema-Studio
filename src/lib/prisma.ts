/* eslint-disable @typescript-eslint/no-explicit-any */
import { PrismaClient } from "@prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { createPool } from "mariadb";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const createPrismaClient = () => {
  let dbUrl = process.env.DATABASE_URL;

  // 1. If Vercel is completely missing the variable
  if (!dbUrl) {
    console.error("🚨 CRITICAL: DATABASE_URL is undefined! Vercel cannot see your environment variable.");
    return new PrismaClient() as any;
  }

  // 2. Automatically clean accidental quotes or spaces pasted into Vercel
  dbUrl = dbUrl.replace(/^["']|["']$/g, '').trim();

  try {
    // 3. Parse the cleaned URL
    const url = new URL(dbUrl);
    
    const pool = createPool({
      host: url.hostname,
      port: Number(url.port) || 12345, // Aiven ports are usually 5 digits
      user: url.username,
      password: url.password,
      database: url.pathname.slice(1),
      connectionLimit: 5,
      ssl: { rejectUnauthorized: false } 
    });

    const adapter = new PrismaMariaDb(pool as any);
    return new PrismaClient({ adapter });

  } catch (error) {
    // 4. If it fails here, the URL is fundamentally broken, don't fall back to localhost!
    console.error("🚨 URL PARSE ERROR: The DATABASE_URL in Vercel is formatted incorrectly.", error);
    throw new Error("Invalid DATABASE_URL format. Check Vercel settings.");
  }
};

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;