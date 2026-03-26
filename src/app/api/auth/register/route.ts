import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { createRateLimiter } from "@/lib/rate-limiter";
import { registerSchema } from "@/lib/validations";

// 5 registrations per IP per 15-minute window
const registerLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  maxRequests: 5,
});

function getIP(req: Request): string {
  // Vercel / Cloudflare / standard proxies
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return "unknown";
}

export async function POST(req: Request) {
  try {
    // ── Rate limit check ──────────────────────────────────────
    const ip = getIP(req);
    const { success, retryAfterMs } = registerLimiter.check(ip);

    if (!success) {
      return NextResponse.json(
        { error: "Too many registration attempts. Please try again later." },
        {
          status: 429,
          headers: { "Retry-After": String(Math.ceil(retryAfterMs / 1000)) },
        }
      );
    }

    // ── Validate input with Zod ───────────────────────────────
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      // Return the first validation error as a user-friendly message
      const firstError = parsed.error.message[0] || "Invalid input.";
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    const { email, password, name } = parsed.data;

    // ── Check for existing user ───────────────────────────────
    const existingUser = await prisma.user.findUnique({
      where: { email },     // already lowercased + trimmed by Zod transform
      select: { id: true },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 409 }
      );
    }

    // ── Create user ───────────────────────────────────────────
    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        email,
        name: name || null,
        password: hashedPassword,
      },
      select: { id: true, email: true, name: true }, // never return the hash
    });

    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    console.error("REGISTRATION_ERROR", error);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}