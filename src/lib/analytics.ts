// ============================================================
// FILE: src/lib/analytics.ts
// (Create this new file)
//
// Usage: import { analytics } from "@/lib/analytics";
//        analytics.schemaCreated();
//        analytics.templateUsed("e-commerce");
//
// All events are no-ops if PostHog isn't loaded (SSR, missing key).
// ============================================================

import posthog from "posthog-js";

function capture(event: string, properties?: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  try {
    posthog.capture(event, properties);
  } catch {
    // PostHog not initialized — fail silently
  }
}

export const analytics = {
  // ─── Schema actions ───────────────────────────────────────
  schemaCreated: () => capture("schema_created"),

  schemaDeleted: () => capture("schema_deleted"),

  schemaRenamed: (name: string) =>
    capture("schema_renamed", { name }),

  // ─── Template usage ───────────────────────────────────────
  templateUsed: (templateId: string, templateName: string) =>
    capture("template_used", { template_id: templateId, template_name: templateName }),

  templateSearched: (query: string) =>
    capture("template_searched", { query }),

  // ─── AI architect ─────────────────────────────────────────
  aiGenerationStarted: (promptLength: number, hasExistingSchema: boolean) =>
    capture("ai_generation_started", {
      prompt_length: promptLength,
      has_existing_schema: hasExistingSchema,
    }),

  aiGenerationCompleted: (tableCount: number, relationCount: number) =>
    capture("ai_generation_completed", {
      table_count: tableCount,
      relation_count: relationCount,
    }),

  aiGenerationFailed: (error: string) =>
    capture("ai_generation_failed", { error }),

  // ─── Editor actions ───────────────────────────────────────
  tableAdded: () => capture("table_added"),

  tableDeleted: () => capture("table_deleted"),

  columnAdded: () => capture("column_added"),

  relationCreated: (type: string) =>
    capture("relation_created", { relation_type: type }),

  relationDeleted: () => capture("relation_deleted"),

  // ─── Export ───────────────────────────────────────────────
  exportOpened: () => capture("export_opened"),

  exportCopied: (format: string) =>
    capture("export_copied", { format }),

  exportDownloaded: (format: string) =>
    capture("export_downloaded", { format }),

  // ─── Import ───────────────────────────────────────────────
  sqlImported: (tableCount: number) =>
    capture("sql_imported", { table_count: tableCount }),

  sqlImportFailed: () => capture("sql_import_failed"),

  // ─── Version history ──────────────────────────────────────
  snapshotSaved: () => capture("snapshot_saved"),

  snapshotRestored: () => capture("snapshot_restored"),

  // ─── Billing ──────────────────────────────────────────────
  upgradeClicked: (interval: "monthly" | "yearly") =>
    capture("upgrade_clicked", { interval }),

  upgradeCompleted: (interval: string) =>
    capture("upgrade_completed", { interval }),

  billingPortalOpened: () => capture("billing_portal_opened"),

  // ─── Auth ─────────────────────────────────────────────────
  signedUp: (method: "email" | "github" | "google") =>
    capture("signed_up", { method }),

  loggedIn: (method: "email" | "github" | "google") =>
    capture("logged_in", { method }),

  // ─── Navigation / engagement ──────────────────────────────
  docsOpened: (section?: string) =>
    capture("docs_opened", { section }),

  onboardingCompleted: () => capture("onboarding_completed"),

  onboardingSkipped: (step: number) =>
    capture("onboarding_skipped", { skipped_at_step: step }),

  // ─── Plan-related user properties ─────────────────────────
  /** Call after plan changes to update the user's profile in PostHog */
  setPlanProperty: (plan: string) => {
    if (typeof window === "undefined") return;
    try {
      posthog.people.set({ plan });
    } catch {
      // fail silently
    }
  },
};