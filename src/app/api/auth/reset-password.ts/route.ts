// ============================================================
// FILE: src/app/api/auth/reset-password/route.ts
//
// Validates the reset token, updates the user's password,
// marks the token as used, and sends a confirmation email.
//
// Security:
//   - Rate limited (5 attempts per IP per 15 min)
//   - Token must not be expired or already used
//   - Password hashed with bcrypt (12 rounds)
//   - Token invalidated immediately after use
//   - Confirmation email sent to alert user of the change
// ============================================================

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createRateLimiter } from "@/lib/rate-limiter";
import { sendPasswordResetConfirmationEmail } from "@/lib/email";
import bcrypt from "bcryptjs";

// 5 attempts per IP per 15-minute window
const resetLimiter = createRateLimiter({
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
    // ── Rate limit ────────────────────────────────────────────
    const ip = getIP(req);
    const { success, retryAfterMs } = resetLimiter.check(ip);

    if (!success) {
      return NextResponse.json(
        { error: "Too many attempts. Please try again later." },
        {
          status: 429,
          headers: { "Retry-After": String(Math.ceil(retryAfterMs / 1000)) },
        }
      );
    }

    // ── Parse & validate input ────────────────────────────────
    const body = await req.json();
    const { token, password } = body;

    if (!token || typeof token !== "string") {
      return NextResponse.json(
        { error: "Reset token is required." },
        { status: 400 }
      );
    }

    if (!password || typeof password !== "string" || password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters." },
        { status: 400 }
      );
    }

    if (password.length > 128) {
      return NextResponse.json(
        { error: "Password must be 128 characters or fewer." },
        { status: 400 }
      );
    }

    // ── Look up the token ─────────────────────────────────────
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    if (!resetToken) {
      return NextResponse.json(
        { error: "Invalid or expired reset link. Please request a new one." },
        { status: 400 }
      );
    }

    // Check if already used
    if (resetToken.usedAt) {
      return NextResponse.json(
        { error: "This reset link has already been used. Please request a new one." },
        { status: 400 }
      );
    }

    // Check if expired
    if (new Date() > resetToken.expiresAt) {
      // Mark as used so it can't be retried
      await prisma.passwordResetToken.update({
        where: { id: resetToken.id },
        data: { usedAt: new Date() },
      });

      return NextResponse.json(
        { error: "This reset link has expired. Please request a new one." },
        { status: 400 }
      );
    }

    // ── Update the password ───────────────────────────────────
    const hashedPassword = await bcrypt.hash(password, 12);

    await prisma.$transaction([
      // Update user password
      prisma.user.update({
        where: { id: resetToken.userId },
        data: { password: hashedPassword },
      }),
      // Mark token as used
      prisma.passwordResetToken.update({
        where: { id: resetToken.id },
        data: { usedAt: new Date() },
      }),
    ]);

    // ── Send confirmation email (non-blocking) ────────────────
    sendPasswordResetConfirmationEmail({
      to: resetToken.user.email!,
      name: resetToken.user.name || "there",
    }).catch((err) => {
      console.error("[ResetPassword] Failed to send confirmation email:", err);
    });

    return NextResponse.json(
      { message: "Password reset successfully. You can now sign in." },
      { status: 200 }
    );
  } catch (error) {
    console.error("RESET_PASSWORD_ERROR:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}