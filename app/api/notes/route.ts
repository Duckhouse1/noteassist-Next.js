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

  const org = await prisma.organization.findUnique({
    where: { slug: companySlug },
    select: { id: true },
  });
  if (!org) {
    return NextResponse.json({ error: "Org not found" }, { status: 404 });
  }

  const userId = (session.user).id as string;
  const member = await prisma.membership.findUnique({
    where: { organizationId_userId: { organizationId: org.id, userId } },
    select: { id: true },
  });
  if (!member) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const notes = await prisma.note.findMany({
    where: { organizationId: org.id },
    orderBy: { createdAt: "desc" },
  });
  console.log("Dette er notes");
  console.log(notes);
  return NextResponse.json(notes);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email || !(session.user).id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { company: companySlug, note, title } = body as {
    company?: string;
    note: { id: string; content: string, Transcript: string };
    title: string;
  };

  if (!companySlug) {
    return NextResponse.json({ error: "Missing company" }, { status: 400 });
  }
  if (!note?.content) {
    return NextResponse.json({ error: "Invalid note content" }, { status: 400 });
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
    where: { organizationId_userId: { organizationId: company.id, userId } },
    select: { id: true },
  });
  if (!member) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const noteId = note.id || crypto.randomUUID();
  const Transcript = note.Transcript ?? ""
  const savedNote = await prisma.note.upsert({
    where: { id: noteId },
    update: {
      content: note.content,
      title,
      Transcript: Transcript
    },
    create: {
      id: noteId,
      organizationId: company.id,
      userId,
      content: note.content,
      title,
      Transcript: Transcript
    },
  });

  return NextResponse.json(savedNote, { status: 201 });
}