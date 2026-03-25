/* eslint-disable @typescript-eslint/no-explicit-any */
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function POST(request: Request)  {
    try {
        const body = await request.json();
        const {email, password, name} = body;

        if (!email || !password) {
            return new NextResponse("Missing email or password", {status: 400});
        }

        const existingUser = await prisma.user.findUnique({
            where: {email}
        })

        if (existingUser) {
            return new NextResponse("Email already exists");
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        const user = await prisma.user.create({
            data: {
                email,
                name,
                password: hashedPassword
            }
        });

        return NextResponse.json({message: "User successfully created", user: {id: user.id, email: user.email}});
    } catch (error: any) {
        console.error("REGISTRATION_ERROR", error);
        return new NextResponse("Internal Error", {status: 500})
    }
}