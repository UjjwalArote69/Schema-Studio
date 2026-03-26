/* eslint-disable @typescript-eslint/no-explicit-any */
// src/lib/prisma.ts
import { PrismaClient } from "../../prisma/generated/prisma/client";
import { Pool, neonConfig } from '@neondatabase/serverless';
import { PrismaNeon } from '@prisma/adapter-neon';
import ws from 'ws';

neonConfig.webSocketConstructor = ws;

const prismaClientSingleton = () => {
  const connectionString = process.env.DATABASE_URL_UNPOOLED;
  
  // Add this check
  if (!connectionString) {
    throw new Error("DATABASE_URL_UNPOOLED is not defined in the environment variables.");
  }
  
  const pool = new Pool({ connectionString });
  const adapter = new PrismaNeon(pool as any); 
  
  return new PrismaClient({ adapter } as any);
};

declare global {
  var prismaGlobal: ReturnType<typeof prismaClientSingleton> | undefined;
}

export const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') {
  globalThis.prismaGlobal = prisma;
}

export default prisma;