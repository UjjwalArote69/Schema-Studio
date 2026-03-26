/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { getServerSession } from "next-auth/next";
import { authOptions } from "../api/auth/[...nextauth]/route";
import {prisma}  from "@/lib/prisma";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function createSchema() {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
        throw new Error("You must be logged in to create schema");
    }

    const newProject = await prisma.project.create({
        data: {
            name: "Untitled Schema",
            userId: session.user.id,
            data: {},
        },
    });

    redirect(`/editor/${newProject.id}`);
}

export async function importSchemaAction(name: string, data: any) {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as {id: string})?.id;

    if (!userId) {
        throw new Error("Unauthorized");
    }

    const project = await prisma.project.create({
        data: {
            name: name || "Imported Schema",
            userId: userId,
            data: data,
        }
    });

    return project.id
}

export async function deleteSchema(projectId: string) {
    const session = await getServerSession(authOptions);
    const userId  =  (session?.user as {id: string})?.id;

    if (!userId) {
        throw new Error("Unauthorized");
    }

    const project = await prisma.project.findUnique({
        where: {id:projectId}
    });

    if (!project || project.userId !== userId) {
        throw new Error("Unauthorized");
    };

    await prisma.project.delete({
        where: {id: projectId}
    });

    revalidatePath('/dashboard');
}

// Add this to the bottom of app/actions/schema.ts

export async function updateSchema(projectId: string, name: string, data: any) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id: string })?.id;

  if (!userId) throw new Error("Unauthorized");

  // Verify ownership
  const project = await prisma.project.findUnique({
    where: { id: projectId }
  });

  if (!project || project.userId !== userId) {
    throw new Error("Unauthorized");
  }

  // Update the database with the new tables/relations
  await prisma.project.update({
    where: { id: projectId },
    data: { 
      name: name,
      data: data 
    }
  });
}

export async function createFromTemplate(templateName: string, templateData: any) {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as {id: string})?.id;

    if(!userId) throw new Error("You must be logged in to account");

    const project = await prisma.project.create({
        data: {
            name: templateName,
            userId: userId,
            data: templateData
        }
    });

    redirect(`/editor/${project.id}`);
}