import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DEFAULT_WORKSPACE_CONFIG, WorkspaceConfig } from "@/lib/Integrations/WorkSpaceConfig";

type ErrorBody = { error: string; details?: unknown };

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json<ErrorBody>({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const orgSlug = url.searchParams.get("org");
  if (!orgSlug) {
    return NextResponse.json<ErrorBody>({ error: "Missing org" }, { status: 400 });
  }

  const org = await prisma.organization.findUnique({
    where: { slug: orgSlug },
    select: { id: true },
  });
  if (!org) {
    return NextResponse.json<ErrorBody>({ error: "Org not found" }, { status: 404 });
  }

  const row = await prisma.userWorkspaceConfig.findUnique({
    where: { organizationId_userId: { organizationId: org.id, userId: session.user.id } },
    select: { data: true },
  });

  if (!row?.data) return NextResponse.json(DEFAULT_WORKSPACE_CONFIG);

  try {
    return NextResponse.json(JSON.parse(row.data) as WorkspaceConfig);
  } catch {
    // bad JSON in DB -> fall back
    return NextResponse.json(DEFAULT_WORKSPACE_CONFIG);
  }
}

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json<ErrorBody>({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const orgSlug = url.searchParams.get("org");
  if (!orgSlug) {
    return NextResponse.json<ErrorBody>({ error: "Missing org" }, { status: 400 });
  }

  const org = await prisma.organization.findUnique({
    where: { slug: orgSlug },
    select: { id: true },
  });
  if (!org) {
    return NextResponse.json<ErrorBody>({ error: "Org not found" }, { status: 404 });
  }

  let body: WorkspaceConfig;
  try {
    body = (await req.json()) as WorkspaceConfig;
  } catch {
    return NextResponse.json<ErrorBody>({ error: "Invalid JSON body" }, { status: 400 });
  }

  // Optional: merge with defaults so missing keys don’t break you
  const merged: WorkspaceConfig = {
    ...DEFAULT_WORKSPACE_CONFIG,
    ...body,
    enabledActions: {
      ...DEFAULT_WORKSPACE_CONFIG.enabledActions,
      ...(body.enabledActions ?? {}),
    },
  };

  await prisma.userWorkspaceConfig.upsert({
    where: { organizationId_userId: { organizationId: org.id, userId: session.user.id } },
    update: { data: JSON.stringify(merged) },
    create: { organizationId: org.id, userId: session.user.id, data: JSON.stringify(merged) },
  });

  return NextResponse.json({ ok: true, config: merged });
}