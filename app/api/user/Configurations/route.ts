// /api/user/configurations/route.ts

import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { ProviderSchemas } from "@/lib/ConfigSchemas";

type ProviderId = keyof typeof ProviderSchemas;

type ConfigResponse = {
  connectionId: string;
  provider: ProviderId;
  displayName: string;
  schemaVersion: number;
  updatedAt: Date | null;
  config: unknown; // union across providers (safe)
};

type ErrorEntry = {
  connectionId?: string;
  provider?: string;
  error: string;
};

// Only normalize to providers that actually exist in ProviderSchemas
function normalizeProviderId(p: string): ProviderId {
  const x = p.trim().toLowerCase();

  if (x === "azure-devops" || x === "azuredevops") return "azure-devops";
  if (x === "outlook") return "outlook";

  // If you add these schemas later, then add them here too:
  // if (x === "sharepoint") return "sharepoint";
  // if (x === "jira") return "jira";
  // if (x === "notion") return "notion";

  throw new Error(`Unsupported provider: ${p}`);
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 1) Load all connections for the user
  const connections = await prisma.integrationConnection.findMany({
    where: { userId: session.user.id },
    select: { id: true, provider: true, displayName: true },
  });

  if (connections.length === 0) {
    return NextResponse.json({ configs: [], errors: [] });
  }

  // 2) Load config rows for those connections in one query
  const configRows = await prisma.integrationConfig.findMany({
    where: { connectionId: { in: connections.map((c) => c.id) } },
    select: {
      connectionId: true,
      provider: true,
      data: true,          // JSON string
      schemaVersion: true,
      updatedAt: true,
    },
  });

  const byConnectionId = new Map(configRows.map((r) => [r.connectionId, r]));

  const configs: ConfigResponse[] = [];
  const errors: ErrorEntry[] = [];

  // 3) Build response, never throwing out a connection unless provider unsupported
  for (const conn of connections) {
    let provider: ProviderId;
    try {
      provider = normalizeProviderId(conn.provider);
    } catch (e) {
      errors.push({
        connectionId: conn.id,
        provider: conn.provider,
        error: e instanceof Error ? e.message : "Unsupported provider",
      });
      continue;
    }

    const schema = ProviderSchemas[provider];
    const row = byConnectionId.get(conn.id);

    // If row exists but was saved under a different provider string, ignore it
    if (row?.provider && row.provider !== provider) {
      errors.push({
        connectionId: conn.id,
        provider,
        error: `Stored config provider mismatch (row=${row.provider}, expected=${provider}) — defaults applied.`,
      });
    }

    // Parse stored JSON safely
    let raw: unknown = {};
    if (row?.data && row.provider === provider) {
      try {
        raw = JSON.parse(row.data) as unknown;
      } catch {
        raw = {};
        errors.push({
          connectionId: conn.id,
          provider,
          error: "Stored config JSON invalid — defaults applied.",
        });
      }
    }

    // Validate safely; if invalid -> defaults
    const parsed = schema.safeParse(raw);
    const config = parsed.success ? parsed.data : schema.parse({});

    if (!parsed.success) {
      errors.push({
        connectionId: conn.id,
        provider,
        error: "Stored config failed validation — defaults applied.",
      });
    }

    configs.push({
      connectionId: conn.id,
      provider,
      displayName: conn.displayName ?? provider,
      schemaVersion: row?.schemaVersion ?? 1,
      updatedAt: row?.updatedAt ?? null,
      config,
    });
  }

  return NextResponse.json({ configs, errors });
}