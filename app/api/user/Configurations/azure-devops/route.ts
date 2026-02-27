import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { AzureDevopsConfigSchema } from "@/lib/ConfigSchemas";
import type { AzureDevopsSettings } from "@/lib/Integrations/AzureDevops/Configuration";

type AdoProvider = "azure-devops";

function safeJsonParse(input: string | null | undefined): unknown {
  if (!input) return {};
  try {
    return JSON.parse(input);
  } catch {
    return {};
  }
}

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const connectionId = searchParams.get("connectionId");
  if (!connectionId) {
    return NextResponse.json({ error: "connectionId is required" }, { status: 400 });
  }

  // Ensure the connection belongs to the user
  const connection = await prisma.integrationConnection.findUnique({
    where: { id: connectionId },
    select: { id: true, userId: true, provider: true },
  });

  if (!connection) {
    return NextResponse.json({ error: "Connection not found" }, { status: 404 });
  }
  if (connection.userId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Optional: enforce this endpoint is only for ADO connections
  const provider = connection.provider.trim().toLowerCase();
  if (provider !== "azure-devops" && provider !== "azuredevops") {
    return NextResponse.json({ error: "Not an Azure DevOps connection" }, { status: 400 });
  }

  // Fetch generic config row for this connection
  const row = await prisma.integrationConfig.findUnique({
    where: { connectionId },
    select: { data: true },
  });

  // Parse + validate with defaults
  const raw = safeJsonParse(row?.data);
  const cfg: AzureDevopsSettings = AzureDevopsConfigSchema.parse(raw);

  return NextResponse.json(cfg);
}

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const connectionId = searchParams.get("connectionId");
  if (!connectionId) {
    return NextResponse.json({ error: "connectionId is required" }, { status: 400 });
  }

  // Ensure the connection belongs to the user
  const connection = await prisma.integrationConnection.findUnique({
    where: { id: connectionId },
    select: { id: true, userId: true, provider: true },
  });

  if (!connection) {
    return NextResponse.json({ error: "Connection not found" }, { status: 404 });
  }
  if (connection.userId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const providerNormalized: AdoProvider = "azure-devops";

  // Body can be either { ADOSettings: {...} } (old) or directly the config (new)
  const body: unknown = await req.json();

  const maybeWrapped = body as { ADOSettings?: unknown };
  const rawConfig: unknown = maybeWrapped?.ADOSettings ?? body;

  // Validate + apply defaults
  const parsed: AzureDevopsSettings = AzureDevopsConfigSchema.parse(rawConfig);

  // Upsert into IntegrationConfig
  const saved = await prisma.integrationConfig.upsert({
    where: { connectionId },
    create: {
      connectionId,
      provider: providerNormalized,
      data: JSON.stringify(parsed),
      schemaVersion: 1,
    },
    update: {
      provider: providerNormalized,
      data: JSON.stringify(parsed),
    },
    select: { data: true },
  });

  const cfg: AzureDevopsSettings = AzureDevopsConfigSchema.parse(safeJsonParse(saved.data));
  return NextResponse.json(cfg);
}