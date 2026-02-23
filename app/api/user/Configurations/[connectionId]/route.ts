import { authOptions } from "@/lib/auth";
import { ProviderSchemas } from "@/lib/ConfigSchemas";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { z } from "zod";

type ProviderId = keyof typeof ProviderSchemas;

type ErrorBody = { error: string; details?: unknown };

/**
 * GET /api/user/configurations/[connectionId]
 * Returns config for this connectionId.
 * If no config exists yet -> returns schema defaults.
 */
export async function GET(
  req: Request,
  { params }: { params: { connectionId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json<ErrorBody>({ error: "Unauthorized" }, { status: 401 });
  }

  const connectionId = params.connectionId;

  const conn = await prisma.integrationConnection.findFirst({
    where: { id: connectionId, userId: session.user.id },
    select: { id: true, provider: true, displayName: true },
  });

  if (!conn) {
    return NextResponse.json<ErrorBody>({ error: "Forbidden" }, { status: 403 });
  }

  const provider = normalizeProviderId(conn.provider);
  const schema = ProviderSchemas[provider];

  const row = await prisma.integrationConfig.findUnique({
    where: { connectionId: conn.id },
    select: { connectionId: true, provider: true, data: true, schemaVersion: true, updatedAt: true },
  });

  // Parse DB JSON safely (SQL Server stores as NVARCHAR)
  let raw: unknown = {};
  if (row?.data) {
    try {
      raw = JSON.parse(row.data) as unknown;
    } catch {
      raw = {};
    }
  }

  // Validate + apply defaults
  const config = schema.parse(raw);

  return NextResponse.json({
    connectionId: conn.id,
    provider,
    displayName: conn.displayName ?? provider,
    schemaVersion: row?.schemaVersion ?? 1,
    updatedAt: row?.updatedAt ?? null,
    config,
  });
}

/**
 * PUT /api/user/configurations/[connectionId]
 * Body: provider-specific config object
 *
 * Optional concurrency:
 * - Send header: If-Match-UpdatedAt: <ISO datetime string from last GET>
 * If header is present and DB updatedAt differs -> 409
 */
export async function PUT(req: Request,{ params }: { params: Promise<{ connectionId: string }> }) {
  
  const { connectionId } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json<ErrorBody>({ error: "Unauthorized" }, { status: 401 });
  }


  const conn = await prisma.integrationConnection.findFirst({
    where: { id: connectionId, userId: session.user.id },
    select: { id: true, provider: true },
  });

  if (!conn) {
    return NextResponse.json<ErrorBody>({ error: "Forbidden" }, { status: 403 });
  }

  const provider = normalizeProviderId(conn.provider);
  const schema = ProviderSchemas[provider];

  let rawBody: unknown;
  try {
    rawBody = (await req.json()) as unknown;
  } catch {
    return NextResponse.json<ErrorBody>({ error: "Invalid JSON body" }, { status: 400 });
  }

  // Validate + apply defaults
  let parsed: unknown;
  try {
    parsed = schema.parse(rawBody);
  } catch (e: unknown) {
    // Zod error -> 400 with details
    if (e instanceof z.ZodError) {
      return NextResponse.json<ErrorBody>(
        { error: "Validation failed", details: e.flatten() },
        { status: 400 }
      );
    }
    return NextResponse.json<ErrorBody>({ error: "Validation failed" }, { status: 400 });
  }

  // Optional optimistic concurrency check
  const ifMatchUpdatedAt = req.headers.get("if-match-updatedat");
  if (ifMatchUpdatedAt) {
    const existing = await prisma.integrationConfig.findUnique({
      where: { connectionId: conn.id },
      select: { updatedAt: true },
    });

    if (existing?.updatedAt) {
      const client = new Date(ifMatchUpdatedAt);
      const server = new Date(existing.updatedAt);

      // If client date invalid -> 400
      if (Number.isNaN(client.getTime())) {
        return NextResponse.json<ErrorBody>(
          { error: "Invalid if-match-updatedat header; must be ISO date string" },
          { status: 400 }
        );
      }

      // If mismatch -> 409
      if (client.getTime() !== server.getTime()) {
        return NextResponse.json<ErrorBody>(
          { error: "Config has changed since you last loaded it. Please refresh and try again." },
          { status: 409 }
        );
      }
    }
  }

  // Store as JSON string in SQL Server
  const json = JSON.stringify(parsed);

  const saved = await prisma.integrationConfig.upsert({
    where: { connectionId: conn.id },
    update: { data: json, provider },
    create: { connectionId: conn.id, provider, data: json },
    select: { connectionId: true, provider: true, data: true, schemaVersion: true, updatedAt: true },
  });

  return NextResponse.json({
    connectionId: saved.connectionId,
    provider: saved.provider as ProviderId, // saved.provider should already be canonical
    schemaVersion: saved.schemaVersion,
    updatedAt: saved.updatedAt,
    config: parsed,
  });
}

/**
 * Normalize DB provider values to your canonical schema keys.
 * Best practice: store canonical values in DB and delete this later.
 */
function normalizeProviderId(p: string): ProviderId {
  const x = p.trim().toLowerCase();

  if (x === "azure-devops" || x === "azuredevops" || x === "azure-devops ") return "azure-devops";
  if (x === "outlook") return "outlook";
  // if (x === "sharepoint") return "sharepoint";
  // if (x === "jira") return "jira";
  // if (x === "notion") return "notion";

  throw new Error(`Unsupported provider: ${p}`);
}