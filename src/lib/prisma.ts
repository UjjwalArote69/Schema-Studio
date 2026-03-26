/* eslint-disable @typescript-eslint/no-explicit-any */
// lib/prisma.ts
import { PrismaClient as GeneratedClient } from "../../prisma/generated/prisma/client";
import { PrismaClient } from "@prisma/client"; // Use this for typing
import { PrismaPg } from '@prisma/adapter-pg';
import  pg  from 'pg'; // Ensure you have pg installed

const connectionString = process.env.DATABASE_URL;
const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool as any);

const prismaClientSingleton = () => {
  return new GeneratedClient({
    adapter
  }) as unknown as PrismaClient; // Cast to the standard type
}
declare const globalThis: {
  prismaGlobal: ReturnType<typeof prismaClientSingleton>
} & typeof global;

export const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();


if (process.env.NODE_ENV !== 'production') {
  globalThis.prismaGlobal = prisma
}
