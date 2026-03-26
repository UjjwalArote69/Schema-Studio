/* eslint-disable @typescript-eslint/no-explicit-any */
// lib/prisma.ts
import { PrismaClient as GeneratedClient } from "../../prisma/generated/prisma/client";
import { PrismaClient } from "@prisma/client"; 

const prismaClientSingleton = () => {
  // Pass an empty object to satisfy the "1 argument" requirement
  return new GeneratedClient({} as any) as unknown as PrismaClient;
}

declare global {
  // This ensures the global variable is recognized in development (Fast Refresh)
  var prismaGlobal: ReturnType<typeof prismaClientSingleton> | undefined;
}

// Access the global variable safely
const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== 'production') {
  globalThis.prismaGlobal = prisma;
}