// ============================================================
// FILE: src/lib/email.ts
//
// Nodemailer + Gmail SMTP email client.
// Free, no domain verification needed, sends to ANY address.
//
// Setup:
//   1. npm install nodemailer
//   2. npm install -D @types/nodemailer  (for TypeScript)
//   3. Enable 2FA on your Google account
//   4. Generate app password: https://myaccount.google.com/apppasswords
//   5. Add to .env:
//        GMAIL_USER=you@gmail.com
//        GMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx
//
// Usage:
//   import { sendWelcomeEmail, sendPasswordResetEmail } from "@/lib/email";
//   await sendWelcomeEmail({ to: "anyone@example.com", name: "Alice" });
// ============================================================

import nodemailer from "nodemailer";
import {
  welcomeEmailHtml,
  passwordResetEmailHtml,
  passwordResetConfirmationEmailHtml,
} from "@/lib/email-templates";

// ─── Transporter ────────────────────────────────────────────

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

const FROM_ADDRESS =
  process.env.EMAIL_FROM ||
  `SchemaStudio <${process.env.GMAIL_USER}>`;

const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

// ─── Helpers ────────────────────────────────────────────────

interface SendResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

async function send(options: {
  to: string;
  subject: string;
  html: string;
}): Promise<SendResult> {
  // Guard: skip if Gmail credentials aren't configured
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    console.warn(
      "[Email] GMAIL_USER or GMAIL_APP_PASSWORD not set — skipping email send."
    );
    return { success: false, error: "Gmail credentials not configured" };
  }

  try {
    const info = await transporter.sendMail({
      from: FROM_ADDRESS,
      to: options.to,
      subject: options.subject,
      html: options.html,
    });

    console.log("[Email] Sent:", info.messageId, "→", options.to);
    return { success: true, messageId: info.messageId };
  } catch (err) {
    console.error("[Email] Failed to send:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

// ─── Public API ─────────────────────────────────────────────

/**
 * Send a welcome email after successful registration.
 */
export async function sendWelcomeEmail(params: {
  to: string;
  name: string;
}): Promise<SendResult> {
  const dashboardUrl = `${APP_URL}/dashboard`;

  return send({
    to: params.to,
    subject: "Welcome to SchemaStudio!",
    html: welcomeEmailHtml({
      name: params.name || "there",
      dashboardUrl,
    }),
  });
}

/**
 * Send a password reset link.
 */
export async function sendPasswordResetEmail(params: {
  to: string;
  name: string;
  resetToken: string;
}): Promise<SendResult> {
  const resetUrl = `${APP_URL}/reset-password?token=${params.resetToken}`;

  return send({
    to: params.to,
    subject: "Reset your SchemaStudio password",
    html: passwordResetEmailHtml({
      name: params.name || "there",
      resetUrl,
    }),
  });
}

/**
 * Send confirmation that the password was successfully changed.
 */
export async function sendPasswordResetConfirmationEmail(params: {
  to: string;
  name: string;
}): Promise<SendResult> {
  const loginUrl = `${APP_URL}/login`;

  return send({
    to: params.to,
    subject: "Your SchemaStudio password was changed",
    html: passwordResetConfirmationEmailHtml({
      name: params.name || "there",
      loginUrl,
    }),
  });
}