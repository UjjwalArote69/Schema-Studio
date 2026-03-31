// ============================================================
// FILE: src/lib/email-templates.ts
//
// Inline HTML email templates for transactional emails.
// All templates use inline styles for maximum email client
// compatibility (Gmail, Outlook, Apple Mail, etc.).
//
// Design: Matches SchemaStudio's monochrome aesthetic —
// black/white with zinc grays, clean typography, rounded cards.
// ============================================================

// ─── Shared layout wrapper ─────────────────────────────────

function layout(content: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SchemaStudio</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f5;padding:40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background-color:#ffffff;border-radius:16px;border:1px solid #e4e4e7;overflow:hidden;">
          <!-- Logo Header -->
          <tr>
            <td style="padding:32px 40px 24px 40px;text-align:center;">
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto;">
                <tr>
                  <td style="background-color:#000000;border-radius:10px;padding:8px;line-height:0;">
                    <img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiNmZmZmZmYiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48ZWxsaXBzZSBjeD0iMTIiIGN5PSI1IiByeD0iOSIgcnk9IjMiLz48cGF0aCBkPSJNMyA1VjE5QTkgMyAwIDAgMCAxMiAyMiA5IDMgMCAwIDAgMjEgMTlWNSIvPjxwYXRoIGQ9Ik0zIDEyQTkgMyAwIDAgMCAxMiAxNSA5IDMgMCAwIDAgMjEgMTIiLz48L3N2Zz4=" alt="SchemaStudio" width="20" height="20" style="display:block;" />
                  </td>
                  <td style="padding-left:10px;font-size:16px;font-weight:700;color:#18181b;letter-spacing:-0.02em;">
                    SchemaStudio
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Content -->
          ${content}

          <!-- Footer -->
          <tr>
            <td style="padding:24px 40px 32px 40px;border-top:1px solid #f4f4f5;text-align:center;">
              <p style="margin:0;font-size:12px;color:#a1a1aa;line-height:1.5;">
                &copy; ${new Date().getFullYear()} SchemaStudio. All rights reserved.
              </p>
              <p style="margin:8px 0 0 0;font-size:11px;color:#d4d4d8;">
                You're receiving this because you have an account at SchemaStudio.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`.trim();
}

// ─── CTA button helper ─────────────────────────────────────

function ctaButton(text: string, url: string): string {
  return `
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:28px auto 0 auto;">
      <tr>
        <td style="background-color:#18181b;border-radius:10px;">
          <a href="${url}" target="_blank" style="display:inline-block;padding:14px 32px;font-size:14px;font-weight:700;color:#ffffff;text-decoration:none;letter-spacing:-0.01em;">
            ${text}
          </a>
        </td>
      </tr>
    </table>`;
}

// ─── 1. Welcome Email ──────────────────────────────────────

export function welcomeEmailHtml(params: {
  name: string;
  dashboardUrl: string;
}): string {
  return layout(`
    <tr>
      <td style="padding:0 40px 32px 40px;">
        <h1 style="margin:0 0 16px 0;font-size:24px;font-weight:800;color:#18181b;letter-spacing:-0.03em;line-height:1.2;">
          Welcome aboard, ${params.name}!
        </h1>
        <p style="margin:0 0 12px 0;font-size:15px;color:#52525b;line-height:1.6;">
          Your SchemaStudio account is ready. You can now design database schemas visually,
          generate code for multiple backends, and use AI to architect your databases.
        </p>
        <p style="margin:0;font-size:15px;color:#52525b;line-height:1.6;">
          Here's what you can do to get started:
        </p>

        <!-- Feature list -->
        <table role="presentation" cellpadding="0" cellspacing="0" style="margin:20px 0 0 0;width:100%;">
          <tr>
            <td style="padding:10px 0;vertical-align:top;width:28px;">
              <div style="width:22px;height:22px;background-color:#f4f4f5;border-radius:6px;text-align:center;line-height:22px;font-size:12px;font-weight:700;color:#71717a;">1</div>
            </td>
            <td style="padding:10px 0 10px 12px;font-size:14px;color:#3f3f46;line-height:1.5;">
              <strong style="color:#18181b;">Create a new schema</strong> — start from scratch or use one of our 11 templates.
            </td>
          </tr>
          <tr>
            <td style="padding:10px 0;vertical-align:top;width:28px;">
              <div style="width:22px;height:22px;background-color:#f4f4f5;border-radius:6px;text-align:center;line-height:22px;font-size:12px;font-weight:700;color:#71717a;">2</div>
            </td>
            <td style="padding:10px 0 10px 12px;font-size:14px;color:#3f3f46;line-height:1.5;">
              <strong style="color:#18181b;">Try the AI Architect</strong> — describe your app and let AI generate tables and relationships.
            </td>
          </tr>
          <tr>
            <td style="padding:10px 0;vertical-align:top;width:28px;">
              <div style="width:22px;height:22px;background-color:#f4f4f5;border-radius:6px;text-align:center;line-height:22px;font-size:12px;font-weight:700;color:#71717a;">3</div>
            </td>
            <td style="padding:10px 0 10px 12px;font-size:14px;color:#3f3f46;line-height:1.5;">
              <strong style="color:#18181b;">Export your code</strong> — PostgreSQL, MySQL, SQLite, Prisma, or Mongoose with one click.
            </td>
          </tr>
        </table>

        ${ctaButton("Go to Your Dashboard &rarr;", params.dashboardUrl)}
      </td>
    </tr>
  `);
}

// ─── 2. Password Reset Request ─────────────────────────────

export function passwordResetEmailHtml(params: {
  name: string;
  resetUrl: string;
}): string {
  return layout(`
    <tr>
      <td style="padding:0 40px 32px 40px;">
        <h1 style="margin:0 0 16px 0;font-size:24px;font-weight:800;color:#18181b;letter-spacing:-0.03em;line-height:1.2;">
          Reset your password
        </h1>
        <p style="margin:0 0 12px 0;font-size:15px;color:#52525b;line-height:1.6;">
          Hi ${params.name}, we received a request to reset the password for your SchemaStudio account.
          Click the button below to choose a new password.
        </p>

        ${ctaButton("Reset Password", params.resetUrl)}

        <p style="margin:24px 0 0 0;font-size:13px;color:#a1a1aa;line-height:1.6;">
          This link expires in <strong style="color:#71717a;">1 hour</strong>.
          If you didn't request a password reset, you can safely ignore this email — your password won't change.
        </p>

        <!-- Fallback URL -->
        <div style="margin:20px 0 0 0;padding:16px;background-color:#fafafa;border-radius:10px;border:1px solid #f4f4f5;">
          <p style="margin:0 0 6px 0;font-size:11px;color:#a1a1aa;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;">
            Or copy this link:
          </p>
          <p style="margin:0;font-size:12px;color:#52525b;word-break:break-all;line-height:1.5;">
            ${params.resetUrl}
          </p>
        </div>
      </td>
    </tr>
  `);
}

// ─── 3. Password Reset Confirmation ────────────────────────

export function passwordResetConfirmationEmailHtml(params: {
  name: string;
  loginUrl: string;
}): string {
  return layout(`
    <tr>
      <td style="padding:0 40px 32px 40px;">
        <h1 style="margin:0 0 16px 0;font-size:24px;font-weight:800;color:#18181b;letter-spacing:-0.03em;line-height:1.2;">
          Password changed successfully
        </h1>
        <p style="margin:0 0 12px 0;font-size:15px;color:#52525b;line-height:1.6;">
          Hi ${params.name}, your SchemaStudio password has been updated successfully.
          You can now sign in with your new password.
        </p>

        ${ctaButton("Sign In &rarr;", params.loginUrl)}

        <!-- Security notice -->
        <div style="margin:24px 0 0 0;padding:16px;background-color:#fef2f2;border-radius:10px;border:1px solid #fecaca;">
          <p style="margin:0;font-size:13px;color:#991b1b;line-height:1.6;">
            <strong>Didn't make this change?</strong> If you did not reset your password,
            please secure your account immediately by resetting your password again or
            contacting support.
          </p>
        </div>
      </td>
    </tr>
  `);
}