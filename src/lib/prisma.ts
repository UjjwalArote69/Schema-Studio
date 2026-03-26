import { PrismaClient } from "@prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

// Prevent multiple instances of Prisma Client in development
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const createPrismaClient = () => {
  const dbUrl = process.env.DATABASE_URL;
  
  // 1. Fallback for Vercel build steps where the DB URL might not be loaded yet
  if (!dbUrl) {
    return new PrismaClient();
  }

  try {
    // 2. Parse the URL into pieces for the Adapter
    const url = new URL(dbUrl);
    
    // 3. Initialize the Prisma 7 Driver Adapter
    const adapter = new PrismaMariaDb({
      host: url.hostname,
      port: Number(url.port) || 4000,
      user: url.username,
      password: url.password,
      database: url.pathname.slice(1),
      ssl: true // CRITICAL: Forces the secure transport required by TiDB
    });

    // 4. Pass the adapter to the Prisma Client
    return new PrismaClient({ adapter });
    
  } catch (error) {
    console.warn("Invalid DATABASE_URL format, falling back to default client.");
    return new PrismaClient();
  }
};

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;