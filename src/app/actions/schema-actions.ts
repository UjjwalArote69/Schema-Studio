/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// ═══════════════════════════════════════════════════════════════
// Validation schemas
// ═══════════════════════════════════════════════════════════════

const MAX_NAME_LENGTH = 255;
const MAX_DATA_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

const columnSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.string(),
  isPrimary: z.boolean().optional(),
  isUnique: z.boolean().optional(),
});

const tableSchema = z.object({
  id: z.string(),
  name: z.string(),
  position: z.object({ x: z.number(), y: z.number() }),
  columns: z.array(columnSchema),
});

const relationSchema = z.object({
  id: z.string(),
  sourceTableId: z.string(),
  sourceColumnId: z.string(),
  targetTableId: z.string(),
  targetColumnId: z.string(),
  type: z.enum(["1:1", "1:n", "m:n"]),
});

const schemaDataSchema = z.object({
  tables: z.array(tableSchema).optional().default([]),
  relations: z.array(relationSchema).optional().default([]),
});

const schemaNameSchema = z
  .string()
  .min(1, "Schema name cannot be empty.")
  .max(MAX_NAME_LENGTH, `Schema name must be ${MAX_NAME_LENGTH} characters or fewer.`)
  .transform((v) => v.trim());

/** Validates that the serialized JSON payload isn't unreasonably large. */
function assertPayloadSize(data: unknown): void {
  const size = new TextEncoder().encode(JSON.stringify(data)).length;
  if (size > MAX_DATA_SIZE_BYTES) {
    throw new Error(
      `Schema data exceeds the ${MAX_DATA_SIZE_BYTES / 1024 / 1024}MB limit.`
    );
  }
}

// ═══════════════════════════════════════════════════════════════
// Helper — get authenticated user ID or throw
// ═══════════════════════════════════════════════════════════════

async function requireUserId(): Promise<string> {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId) throw new Error("You must be logged in.");
  return userId;
}

// ═══════════════════════════════════════════════════════════════
// Actions
// ═══════════════════════════════════════════════════════════════

export async function createSchema() {
  const userId = await requireUserId();

  const newProject = await prisma.project.create({
    data: {
      name: "Untitled Schema",
      userId,
      data: {},
    },
  });

  redirect(`/editor/${newProject.id}`);
}

export async function importSchemaAction(name: string, data: any) {
  const userId = await requireUserId();

  // Validate
  const safeName = schemaNameSchema.parse(name || "Imported Schema");
  const safeData = schemaDataSchema.parse(data);
  assertPayloadSize(safeData);

  const project = await prisma.project.create({
    data: {
      name: safeName,
      userId,
      data: safeData,
    },
  });

  return project.id;
}

export async function deleteSchema(projectId: string) {
  const userId = await requireUserId();

  const project = await prisma.project.findUnique({
    where: { id: projectId },
  });

  if (!project || project.userId !== userId) {
    throw new Error("Unauthorized");
  }

  await prisma.project.delete({
    where: { id: projectId },
  });

  revalidatePath("/dashboard");
}

export async function updateSchema(projectId: string, name: string, data: any) {
  const userId = await requireUserId();

  // Validate inputs before touching the database
  const safeName = schemaNameSchema.parse(name);
  const safeData = schemaDataSchema.parse(data);
  assertPayloadSize(safeData);

  // Verify ownership
  const project = await prisma.project.findUnique({
    where: { id: projectId },
  });

  if (!project || project.userId !== userId) {
    throw new Error("Unauthorized");
  }

  await prisma.project.update({
    where: { id: projectId },
    data: {
      name: safeName,
      data: safeData,
    },
  });
}

export async function createFromTemplate(templateName: string, templateData: any) {
  const userId = await requireUserId();

  // Validate
  const safeName = schemaNameSchema.parse(templateName);
  const safeData = schemaDataSchema.parse(templateData);
  assertPayloadSize(safeData);

  const project = await prisma.project.create({
    data: {
      name: safeName,
      userId,
      data: safeData,
    },
  });

  redirect(`/editor/${project.id}`);
}


 
export async function createFromTemplateById(templateId: string) {
  const userId = await requireUserId();
 
  // Dynamic import — Template.ts is only loaded server-side, never bundled to the client
  const { TEMPLATES } = await import("@/data/Template");
  const template = TEMPLATES.find((t) => t.id === templateId);
 
  if (!template) {
    throw new Error("Template not found.");
  }
 
  const safeName = schemaNameSchema.parse(template.name);
  const safeData = schemaDataSchema.parse(template.data);
  assertPayloadSize(safeData);
 
  const project = await prisma.project.create({
    data: {
      name: safeName,
      userId,
      data: safeData,
    },
  });
 
  redirect(`/editor/${project.id}`);
}