import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  const body = await req.json();
  const { email, password, firstName, lastName } = body as {
    email?: string;
    password?: string;
    firstName?: string;
    lastName?: string;
  };
  const emailNorm = email?.trim().toLowerCase();
  const first = firstName?.trim();
  const last = lastName?.trim();

  if (!emailNorm || !password) {
    return NextResponse.json(
      { error: "Email and password are required" },
      { status: 400 }
    );
  }

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email:emailNorm },
  });

  if (existingUser) {
    return NextResponse.json(
      { error: "User already exists" },
      { status: 409 }
    );
  }

  // Hash password
  const passwordHash = await bcrypt.hash(password, 12);

  // Create user
  const user = await prisma.user.create({
    data: {
      email:emailNorm,
      passwordHash,
      name: `${first} ${last}`
    },
  });

  return NextResponse.json(
    { id: user.id, email: user.email },
    { status: 201 }
  );
}
