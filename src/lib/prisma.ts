/* eslint-disable @typescript-eslint/no-explicit-any */
import { PrismaClient } from "@prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

// Prevent multiple instances of Prisma Client in development
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const createPrismaClient = () => {
  // Provide a dummy URL fallback so Vercel's build step doesn't crash if the env var is missing
  const dbUrl = process.env.DATABASE_URL || "mysql://user:pass@localhost:3306/dummy";
  
  try {
    const url = new URL(dbUrl);
    
    // In Prisma 7, ALL direct connections require an adapter
    const adapter = new PrismaMariaDb({
      host: url.hostname,
      port: Number(url.port) || 12345, // Aiven usually uses 5-digit ports
      user: url.username,
      password: url.password,
      database: url.pathname.slice(1),
      // CRITICAL FOR AIVEN: Bypasses strict CA validation during serverless cold starts
      ssl: { rejectUnauthorized: false }, 
      connectionLimit: 5
    });

    return new PrismaClient({ adapter });
  } catch (error) {
    console.warn("Invalid DATABASE_URL format, falling back to empty client.");
    return new PrismaClient() as any;
  }
};

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;