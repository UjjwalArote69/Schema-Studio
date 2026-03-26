import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import EditorClient from "./editor-client";
import { ReactFlowProvider } from "@xyflow/react"; // <-- Import the provider

export default async function AuthenticatedEditorPage({ params }: { params: Promise<{ id: string }> }) {
  // 1. AWAIT the params before trying to read the ID!
  const resolvedParams = await params;
  const projectId = resolvedParams.id;

  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id: string })?.id;

  if (!userId) redirect("/login");

  // 2. Fetch the specific project from MySQL using the resolved ID
  const project = await prisma.project.findUnique({
    where: { id: projectId },
  });

  // 3. Security Check: Does it exist and do they own it?
  if (!project || project.userId !== userId) {
    redirect("/dashboard");
  }

  // 4. Pass the data to the interactive Client canvas wrapped in the Provider
  return (
    <ReactFlowProvider>
      <EditorClient project={project} />
    </ReactFlowProvider>
  );
}