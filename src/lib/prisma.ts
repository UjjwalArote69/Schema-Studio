/* eslint-disable @typescript-eslint/no-explicit-any */
// lib/prisma.ts
// 1. ONLY import from your custom generated path. 
// Do NOT import anything from "@prisma/client"
import { PrismaClient } from "../../prisma/generated/prisma/client";
import { Pool, neonConfig } from '@neondatabase/serverless';
import { PrismaNeon } from '@prisma/adapter-neon';
import ws from 'ws';

// Required for Node.js environments (like Vercel serverless functions)
neonConfig.webSocketConstructor = ws;

const prismaClientSingleton = () => {
  // Read the env variable lazily to avoid the "localhost" error
  const connectionString = process.env.DATABASE_URL!;
  
  const pool = new Pool({ connectionString });
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