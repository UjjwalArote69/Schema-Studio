"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {prisma}  from "@/lib/prisma";
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

export async function deleteAccount(formData: FormData) {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as {id: string})?.id;

    if(!userId) throw new Error("Unauthorized");

    // Server-side confirmation: the user must type their email to prove intent
    const confirmationEmail = (formData.get("confirmEmail") as string)?.trim().toLowerCase();

    if (!confirmationEmail) {
        throw new Error("Please type your email to confirm account deletion.");
    }

    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { email: true },
    });

    if (!user || user.email?.toLowerCase() !== confirmationEmail) {
        throw new Error("The email you entered does not match your account. Deletion aborted.");
    }

    // Confirmed — proceed with cascading delete
    await prisma.project.deleteMany({
        where: { userId: userId }
    });

    await prisma.user.delete({
        where: { id: userId }
    });

    redirect("/login");
}