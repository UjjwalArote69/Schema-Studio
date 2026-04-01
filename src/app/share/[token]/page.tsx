// ============================================================
// FILE: src/app/share/[token]/page.tsx
//
// Public read-only schema viewer. Accessible without auth.
// Renders the schema on a non-interactive React Flow canvas.
// ============================================================

import { notFound } from "next/navigation";
import { getSharedSchema } from "@/app/actions/share-actions";
import { SharedSchemaViewer } from "@/components/share/shared-schema-viewer";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const schema = await getSharedSchema(token);

  if (!schema) {
    return { title: "Schema Not Found — SchemaStudio" };
  }

  return {
    title: `${schema.name} — SchemaStudio`,
    description: `View the "${schema.name}" database schema on SchemaStudio.`,
  };
}

export default async function SharedSchemaPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const schema = await getSharedSchema(token);

  if (!schema) {
    notFound();
  }

  const data = schema.data || { tables: [], relations: [] };

  return (
    <SharedSchemaViewer
      name={schema.name}
      tables={(data.tables as never[]) || []}
      relations={(data.relations as never[]) || []}
      authorName={schema.authorName}
      updatedAt={schema.updatedAt}
    />
  );
}