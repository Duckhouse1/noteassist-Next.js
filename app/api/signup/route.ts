import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

async function ensurePersonalOrg(userId: string) {
  const existing = await prisma.membership.findFirst({
    where: { userId },
    include: { organization: true },
    orderBy: { createdAt: "asc" },
  });

  if (existing) return existing.organization;

  return prisma.organization.create({
    data: {
      name: "MyWorkspace",
      slug: `user-${userId}`,
      members: {
        create: { userId, role: "owner" },
      },
    },
  });
}

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
    return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
  }

  const existingUser = await prisma.user.findUnique({
    where: { email: emailNorm },
    select: { id: true },
  });

  if (existingUser) {
    return NextResponse.json({ error: "User already exists" }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 12);

  // ✅ Do it in a transaction so user + org are consistent
  const result = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        email: emailNorm,
        passwordHash,
        name: `${first ?? ""} ${last ?? ""}`.trim() || null,
      },
      select: { id: true, email: true },
    });

    // re-implement ensurePersonalOrg using tx:
    const org = await tx.organization.create({
      data: {
        name: "MyWorkspace",
        slug: `user-${user.id}`,
        members: { create: { userId: user.id, role: "owner" } },
      },
      select: { id: true, slug: true },
    });

    return { user, org };
  });

  // ✅ return 201; your client already router.push("/signin")
  return NextResponse.json(
    { id: result.user.id, email: result.user.email, orgSlug: result.org.slug },
    { status: 201 }
  );
}
