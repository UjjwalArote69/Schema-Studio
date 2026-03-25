"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function updateProfile(formData: FormData) {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as {id: string})?.id;

    if(!userId) throw new Error("Unauthorized");

    const name = formData.get("name") as string;

    if(!name || name.trim() === "") {
        throw new Error("Name cannot be empty");
    }

    await prisma.user.update({
        where: {id:userId},
        data: {name: name.trim()},
    });
    revalidatePath("/settings");
    revalidatePath("/", "layout");
}

export async function deleteAccount() {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as {id: string})?.id;

    if(!userId) throw new Error("Unauthorized");

    await prisma.project.deleteMany({
        where: {userId: userId}
    });

    await prisma.user.delete({
        where: {id: userId}
    })

    redirect("/login");
}