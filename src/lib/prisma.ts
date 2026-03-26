/* eslint-disable @typescript-eslint/no-explicit-any */
// lib/prisma.ts
import { PrismaClient } from "../../prisma/generated/prisma/client";
import { Pool, neonConfig } from '@neondatabase/serverless';
import { PrismaNeon } from '@prisma/adapter-neon';
import ws from 'ws';

// Required for Node.js environments (like Vercel serverless functions)
neonConfig.webSocketConstructor = ws;

const connectionString = process.env.DATABASE_URL!;

const prismaClientSingleton = () => {
  const pool = new Pool({ connectionString });
  
  // FIX: Cast pool as any to bypass the conflicting Postgres type definitions
  const adapter = new PrismaNeon(pool as any); 
  
  // Pass the adapter to your custom-generated client
  return new PrismaClient({ adapter } as any);
};

declare global {
  // eslint-disable-next-line no-var
  var prismaGlobal: ReturnType<typeof prismaClientSingleton> | undefined;
}

export const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') {
  globalThis.prismaGlobal = prisma;
}

export default prisma;