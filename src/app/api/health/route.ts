// ============================================================
// FILE: src/app/api/health/route.ts
//
// Health check endpoint for monitoring.
// Returns 200 if the service and database are reachable,
// 503 if the database connection fails.
// ============================================================

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const start = Date.now();

  try {
    await prisma.$queryRawUnsafe("SELECT 1");
    const dbLatencyMs = Date.now() - start;

    return NextResponse.json(
      {
        status: "healthy",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        database: { status: "connected", latencyMs: dbLatencyMs },
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        database: {
          status: "disconnected",
          error: error instanceof Error ? error.message : "Unknown error",
        },
      },
      { status: 503 }
    );
  }
}