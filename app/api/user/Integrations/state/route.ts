import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ProviderSchemas } from "@/lib/ConfigSchemas";
import { AllIntegrationOptions } from "@/lib/Integrations/Catalog";
import { WorkspaceConfig } from "@/lib/Integrations/WorkSpaceConfig";

type WorkspaceProviderId = typeof AllIntegrationOptions[number]["providerId"];

function normalizeWorkspaceProviderId(p: string): WorkspaceProviderId | null {
  const raw = p.trim();
  const x = raw.toLowerCase();

  // canonical / db ids
  if (x === "azure-devops" || x === "azuredevops") return "azure-devops";
  if (x === "outlook") return "outlook";
  if (x === "sharepoint") return "sharepoint";
  if (x === "jira") return "jira";
  if (x === "notion") return "notion";

  // old UI keys
  if (raw === "Azure-Devops") return "azure-devops";
  if (raw === "Outlook") return "outlook";
  if (raw === "SharePoint") return "sharepoint";
  if (raw === "Jira") return "jira";
  if (raw === "Notion") return "notion";

  return null;
}
// --- Provider id types used by ProviderSchemas ---
type ProviderId = keyof typeof ProviderSchemas;

function normalizeProviderId(p: string): ProviderId {
  const x = p.trim().toLowerCase();
  if (x === "azure-devops" || x === "azuredevops") return "azure-devops";
  if (x === "outlook") return "outlook";
  if (x === "jira") return "jira";
  if (x==="sharepoint" || x === "SharePoint") return "sharepoint"
  throw new Error(`Unsupported provider: ${p}`);
}

// Map DB provider -> canonical provider id
function providerDbToUi(p: string): ProviderId | null {
  const x = p.trim().toLowerCase();
  if (x === "azure-devops" || x === "azuredevops") return "azure-devops";
  if (x === "outlook") return "outlook";
  if (x === "jira") return "jira";
  // if (x === "sharepoint") return "sharepoint";
  // if (x === "notion") return "notion";
  return null;
}

// Build defaults for toggles from the catalog
function defaultWorkspaceConfig(): WorkspaceConfig {
  const enabledActions: WorkspaceConfig["enabledActions"] = {};

  for (const card of AllIntegrationOptions) {
    enabledActions[card.providerId] = Object.fromEntries(
      card.actions.map((a) => [a.key, false]) // default enabled = true
    );
  }

  return {
    enabledProviders: [],
    enabledActions,
  };
}

export async function GET(req:Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // You likely also need organizationId scoping; add it if you store org in session.
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
    select: { connectionId: true, provider: true, data: true, schemaVersion: true, updatedAt: true },
  });

  const cfgByConnectionId = new Map(configs.map((c) => [c.connectionId, c]));

  // 3) Normalize and validate configs with defaults (same behavior as your single GET)
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
      provider, // db canonical provider id (azure-devops/outlook/jira)
      providerUi: providerDbToUi(provider) ?? provider, // helpful for UI mapping
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
      ws = { ...wsDefault, ...(JSON.parse(wsRow.data) as Partial<WorkspaceConfig>) };
    } catch {
      ws = wsDefault;
    }
  }
  ws.enabledProviders = (ws.enabledProviders ?? [])
  .map((p) => normalizeWorkspaceProviderId(p))
  .filter((p): p is WorkspaceProviderId => p !== null);

// enabledActions keys
const normalizedEnabledActions: Partial<Record<WorkspaceProviderId, Record<string, boolean>>> = {};

for (const [k, v] of Object.entries(ws.enabledActions ?? {})) {
  const nk = normalizeWorkspaceProviderId(k);
  if (!nk) continue;
  if (v && typeof v === "object") {
    normalizedEnabledActions[nk] = v as Record<string, boolean>;
  }
}

ws.enabledActions = normalizedEnabledActions as WorkspaceConfig["enabledActions"];
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
  //    If any action is true for a provider, that provider should be enabled.
  //    This self-heals data where actions were saved but enabledProviders wasn't updated.
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