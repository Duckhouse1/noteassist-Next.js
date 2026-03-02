import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ProviderSchemas } from "@/lib/ConfigSchemas";
import { AllIntegrationOptions } from "@/lib/Integrations/Catalog";
import { WorkspaceConfig } from "@/lib/Integrations/WorkSpaceConfig";
import { normalizeProviderId, normalizeProviderIdSafe } from "@/lib/Integrations/NormalizedProvider";


// Re-export so existing imports from other files keep working

type WorkspaceProviderId = typeof AllIntegrationOptions[number]["providerId"];

// Build defaults for toggles from the catalog
function defaultWorkspaceConfig(): WorkspaceConfig {
  const enabledActions: WorkspaceConfig["enabledActions"] = {};

  for (const card of AllIntegrationOptions) {
    enabledActions[card.providerId] = Object.fromEntries(
      card.actions.map((a) => [a.key, false])
    );
  }

  return {
    enabledProviders: [],
    enabledActions,
  };
}

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
  const url = new URL(req.url);
  const orgSlug = url.searchParams.get("org");
  if (!orgSlug) {
    return NextResponse.json({ error: "Missing org" }, { status: 400 });
  }
  const org = await prisma.organization.findUnique({
    where: { slug: orgSlug },
    select: { id: true },
  });

  if (!org) {
    return NextResponse.json({ error: "Org not found" }, { status: 404 });
  }

  // 1) Connections
  const connections = await prisma.integrationConnection.findMany({
    where: { userId, organizationId: org.id },
    select: { id: true, provider: true, displayName: true, updatedAt: true },
    orderBy: { updatedAt: "desc" },
  });

  // 2) IntegrationConfig rows for those connections
  const configs = await prisma.integrationConfig.findMany({
    where: { connectionId: { in: connections.map((c) => c.id) } },
    select: {
      connectionId: true,
      provider: true,
      data: true,
      schemaVersion: true,
      updatedAt: true,
    },
  });

  const cfgByConnectionId = new Map(configs.map((c) => [c.connectionId, c]));

  // 3) Normalize and validate configs with defaults
  const parsedConfigs = connections.map((conn) => {
    const provider = normalizeProviderId(conn.provider);
    const schema = ProviderSchemas[provider];

    const row = cfgByConnectionId.get(conn.id);

    let raw: unknown = {};
    if (row?.data) {
      try {
        raw = JSON.parse(row.data);
      } catch {
        raw = {};
      }
    }

    const config = schema.parse(raw);

    return {
      connectionId: conn.id,
      provider,
      providerUi: provider,
      displayName: conn.displayName ?? provider,
      schemaVersion: row?.schemaVersion ?? 1,
      updatedAt: row?.updatedAt ?? null,
      config,
    };
  });

  // 4) Workspace toggles (UserWorkspaceConfig)
  const wsDefault = defaultWorkspaceConfig();

  const wsRow = await prisma.userWorkspaceConfig.findUnique({
    where: {
      organizationId_userId: { organizationId: org.id, userId },
    },
    select: { data: true, schemaVersion: true, updatedAt: true },
  });

  let ws: WorkspaceConfig = wsDefault;
  if (wsRow?.data) {
    try {
      ws = {
        ...wsDefault,
        ...(JSON.parse(wsRow.data) as Partial<WorkspaceConfig>),
      };
    } catch {
      ws = wsDefault;
    }
  }

  // Normalize enabledProviders
  ws.enabledProviders = (ws.enabledProviders ?? [])
    .map((p) => normalizeProviderIdSafe(p))
    .filter((p): p is WorkspaceProviderId => p !== null);

  // Normalize enabledActions keys
  const normalizedEnabledActions: Partial<
    Record<WorkspaceProviderId, Record<string, boolean>>
  > = {};

  for (const [k, v] of Object.entries(ws.enabledActions ?? {})) {
    const nk = normalizeProviderIdSafe(k);
    if (!nk) continue;
    if (v && typeof v === "object") {
      normalizedEnabledActions[nk] = v as Record<string, boolean>;
    }
  }

  ws.enabledActions =
    normalizedEnabledActions as WorkspaceConfig["enabledActions"];

  // 5) Ensure all catalog actions exist in ws.enabledActions (fill missing defaults)
  for (const card of AllIntegrationOptions) {
    ws.enabledActions[card.providerId] ??= {};
    for (const a of card.actions) {
      if (typeof ws.enabledActions[card.providerId]![a.key] !== "boolean") {
        ws.enabledActions[card.providerId]![a.key] = false;
      }
    }
  }

  // 6) Auto-derive enabledProviders from enabledActions
  const derivedProviders = new Set<WorkspaceProviderId>(ws.enabledProviders);
  for (const card of AllIntegrationOptions) {
    const actionMap = ws.enabledActions[card.providerId] ?? {};
    const hasAnyEnabled = Object.values(actionMap).some(Boolean);
    if (hasAnyEnabled) {
      derivedProviders.add(card.providerId as WorkspaceProviderId);
    } else {
      derivedProviders.delete(card.providerId as WorkspaceProviderId);
    }
  }
  ws.enabledProviders = Array.from(derivedProviders);

  return NextResponse.json({
    connections,
    configs: parsedConfigs,
    workspace: {
      schemaVersion: wsRow?.schemaVersion ?? 1,
      updatedAt: wsRow?.updatedAt ?? null,
      config: ws,
    },
  });
}