// ============================================================
// FILE: src/app/api/auth/forgot-password/route.ts
//
// Generates a secure reset token, stores it in the database,
// and sends the user an email with a reset link.
// ============================================================

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createRateLimiter } from "@/lib/rate-limiter";
import { sendPasswordResetEmail } from "@/lib/email";
import crypto from "crypto";

const forgotPasswordLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  maxRequests: 3,
});

function getIP(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return "unknown";
}

const TOKEN_EXPIRY_MS = 60 * 60 * 1000;

export async function POST(req: Request) {
  try {
    const ip = getIP(req);
    const { success } = forgotPasswordLimiter.check(ip);

    if (!success) {
      return NextResponse.json(
        { message: "If an account with that email exists, we've sent a reset link." },
        { status: 200 }
      );
    }

    const body = await req.json();
    const email = (body.email as string)?.trim().toLowerCase();

    console.log("[ForgotPassword] Request for:", email);

    if (!email) {
      return NextResponse.json(
        { message: "If an account with that email exists, we've sent a reset link." },
        { status: 200 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        password: true,
        accounts: { select: { provider: true }, take: 1 },
      },
    });

    if (!user) {
      console.log("[ForgotPassword] No user found for:", email);
      return NextResponse.json(
        { message: "If an account with that email exists, we've sent a reset link." },
        { status: 200 }
      );
    }

    if (!user.password) {
      console.log("[ForgotPassword] OAuth-only user, skipping:", email);
      return NextResponse.json(
        { message: "If an account with that email exists, we've sent a reset link." },
        { status: 200 }
      );
    }

    // Invalidate old tokens
    await prisma.passwordResetToken.updateMany({
      where: { userId: user.id, usedAt: null },
      data: { usedAt: new Date() },
    });

    const rawToken = crypto.randomBytes(32).toString("hex");

    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        token: rawToken,
        expiresAt: new Date(Date.now() + TOKEN_EXPIRY_MS),
      },
    });

    console.log("[ForgotPassword] Token created, sending email to:", user.email);

    try {
      const result = await sendPasswordResetEmail({
        to: user.email!,
        name: user.name || "there",
        resetToken: rawToken,
      });

      if (result.success) {
        console.log("[ForgotPassword] Reset email sent:", result.messageId);
      } else {
        console.error("[ForgotPassword] Reset email failed:", result.error);
      }
    } catch (emailErr) {
      console.error("[ForgotPassword] Reset email threw:", emailErr);
    }

    return NextResponse.json(
      { message: "If an account with that email exists, we've sent a reset link." },
      { status: 200 }
    );
  } catch (error) {
    console.error("FORGOT_PASSWORD_ERROR:", error);
    return NextResponse.json(
      { message: "If an account with that email exists, we've sent a reset link." },
      { status: 200 }
    );
  }
}