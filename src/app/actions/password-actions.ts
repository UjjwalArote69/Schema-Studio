// ============================================================
// FILE: src/app/actions/password-actions.ts
// ============================================================

"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { sendPasswordResetConfirmationEmail } from "@/lib/email";

export async function changePassword(formData: FormData) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id: string })?.id;

  if (!userId) throw new Error("Unauthorized");

  const currentPassword = (formData.get("currentPassword") as string)?.trim();
  const newPassword = (formData.get("newPassword") as string)?.trim();
  const confirmPassword = (formData.get("confirmPassword") as string)?.trim();

  // ── Validation ──────────────────────────────────────────────
  if (!currentPassword) {
    throw new Error("Current password is required.");
  }

  if (!newPassword || newPassword.length < 8) {
    throw new Error("New password must be at least 8 characters.");
  }

  if (newPassword.length > 128) {
    throw new Error("New password must be 128 characters or fewer.");
  }

  if (newPassword !== confirmPassword) {
    throw new Error("New passwords don't match.");
  }

  if (currentPassword === newPassword) {
    throw new Error("New password must be different from your current password.");
  }

  // ── Fetch user ──────────────────────────────────────────────
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      password: true,
    },
  });

  if (!user) throw new Error("User not found.");

  if (!user.password) {
    throw new Error(
      "Your account uses social login (Google/GitHub). Password change is not available."
    );
  }

  // ── Verify current password ─────────────────────────────────
  const isValid = await bcrypt.compare(currentPassword, user.password);

  if (!isValid) {
    throw new Error("Current password is incorrect.");
  }

  // ── Update password ─────────────────────────────────────────
  const hashedPassword = await bcrypt.hash(newPassword, 12);

  await prisma.user.update({
    where: { id: userId },
    data: { password: hashedPassword },
  });

  // ── Send confirmation email (non-blocking) ──────────────────
  if (user.email) {
    sendPasswordResetConfirmationEmail({
      to: user.email,
      name: user.name || "there",
    }).catch((err) => {
      console.error("[ChangePassword] Confirmation email failed:", err);
    });
  }

  return { success: true };
}