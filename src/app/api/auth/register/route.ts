
import {prisma}  from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    // src/app/api/auth/register/route.ts  (top of file, temporary)
console.log("DB URL CHECK:", process.env.DATABASE_URL_UNPOOLED, process.env.DATABASE_URL);
    const { email, password, name } = await req.json();

    if (!email || !password) {
      return new NextResponse("Missing Info", { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword, // MUST BE HASHED
      }
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error("REGISTRATION_ERROR", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}