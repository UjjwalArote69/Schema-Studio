// ============================================================
// FILE: src/app/api/auth/register/route.ts
// (Replaces your existing register/route.ts)
//
// Changes: Added welcome email via Gmail SMTP after account creation
// ============================================================

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { createRateLimiter } from "@/lib/rate-limiter";
import { registerSchema } from "@/lib/validations";
import { sendWelcomeEmail } from "@/lib/email";

// 5 registrations per IP per 15-minute window
const registerLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  maxRequests: 5,
});

function getIP(req: Request): string {
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
      const firstError = parsed.error.message[0] || "Invalid input.";
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    const { email, password, name } = parsed.data;

    // ── Check for existing user ───────────────────────────────
    const existingUser = await prisma.user.findUnique({
      where: { email },
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
      select: { id: true, email: true, name: true },
    });

    // ── Send welcome email ────────────────────────────────────
    // BLOCKING with full logging so we can debug delivery issues
    if (user.email) {
      console.log("[Register] Attempting to send welcome email to:", user.email);

      try {
        const emailResult = await sendWelcomeEmail({
          to: user.email,
          name: user.name || "there",
        });

        if (emailResult.success) {
          console.log("[Register] Welcome email sent:", emailResult.messageId);
        } else {
          console.error("[Register] Welcome email failed:", emailResult.error);
        }
      } catch (emailErr) {
        console.error("[Register] Welcome email threw:", emailErr);
      }
    } else {
      console.warn("[Register] No email on user — skipping welcome email");
    }

    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    console.error("REGISTRATION_ERROR", error);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}