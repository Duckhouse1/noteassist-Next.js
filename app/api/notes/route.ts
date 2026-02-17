// app/api/notes/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email || !(session.user).id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const companySlug = url.searchParams.get("company");
  if (!companySlug) {
    return NextResponse.json({ error: "Missing org" }, { status: 400 });
  }

  // Find org by slug
  const org = await prisma.organization.findUnique({
    where: { slug: companySlug },
    select: { id: true },
  });
  if (!org) {
    return NextResponse.json({ error: "Org not found" }, { status: 404 });
  }

  // Ensure membership
  const userId = (session.user).id as string;
  const member = await prisma.membership.findUnique({
    where: {
      organizationId_userId: {
        organizationId: org.id,
        userId,
      },
    },
    select: { id: true },
  });
  if (!member) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const notes = await prisma.note.findMany({
    where: { organizationId: org.id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(notes);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  console.log("EMAIL frA SESSION" + session?.user.id);
  if (!session?.user?.email || !(session.user).id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { company: companySlug, text, title } = body as { company?: string; text?: string, title:string};

  if (!companySlug) {
    return NextResponse.json({ error: "Missing company" }, { status: 400 });
  }
  if (!text || typeof text !== "string") {
    return NextResponse.json({ error: "Invalid text" }, { status: 400 });
  }

  const company = await prisma.organization.findUnique({
    where: { slug: companySlug },
    select: { id: true },
  });
  if (!company) {
    return NextResponse.json({ error: "Org not found" }, { status: 404 });
  }

  const userId = (session.user).id as string;

  const member = await prisma.membership.findUnique({
    where: {
      organizationId_userId: {
        organizationId: company.id,
        userId,
      },
    },
    select: { id: true },
  });
  if (!member) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const note = await prisma.note.create({
    data: {
      organizationId: company.id,
      userId,
      content: text,
      title: title,
    },
  });

  return NextResponse.json(note, { status: 201 });
}
