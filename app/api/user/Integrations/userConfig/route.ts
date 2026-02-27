import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ProviderSchemas } from "@/lib/ConfigSchemas";

type ProviderId = keyof typeof ProviderSchemas;

function normalizeProviderId(p: string): ProviderId {
  const x = p.trim().toLowerCase();
  if (x === "azure-devops" || x === "azuredevops") return "azure-devops";
  if (x === "outlook") return "outlook";
  if (x === "jira" || x === "Jira") return "jira"
  if (x === "sharepoint" || x === "SharePoint") return "sharepoint"
  // add sharepoint/jira/notion when you add schemas
  throw new Error(`Unsupported provider: ${p}`);
}

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
  const url = new URL(req.url);
  const orgSlug = url.searchParams.get("org");
  if (!orgSlug) return NextResponse.json({ error: "Missing org" }, { status: 400 });

  const org = await prisma.organization.findUnique({
    where: { slug: orgSlug },
    select: { id: true },
  });
  if (!org) return NextResponse.json({ error: "Org not found" }, { status: 404 });

  const body = (await req.json()) as {
    connectionId: string;
    provider: string;
    config: unknown;
  };

  const provider = normalizeProviderId(body.provider);
  const schema = ProviderSchemas[provider];
  const parsedConfig = schema.parse(body.config);

  // IMPORTANT: scope connection by org + user
  const conn = await prisma.integrationConnection.findFirst({
    where: {
      id: body.connectionId,
      userId,
      organizationId: org.id,
    },
    select: { id: true, provider: true },
  });
  if (!conn) return NextResponse.json({ error: "Connection not found" }, { status: 404 });

  // sanity check: provider matches the connection
  const connProvider = normalizeProviderId(conn.provider);
  if (connProvider !== provider) {
    return NextResponse.json({ error: "Provider mismatch" }, { status: 400 });
  }

  const row = await prisma.integrationConfig.upsert({
    where: { connectionId: conn.id },
    create: {
      connectionId: conn.id,
      provider,
      data: JSON.stringify(parsedConfig),
      schemaVersion: 1,
    },
    update: {
      provider,
      data: JSON.stringify(parsedConfig),
    },
    select: { connectionId: true, provider: true, schemaVersion: true, updatedAt: true },
  });

  return NextResponse.json({
    ...row,
    config: parsedConfig, // handy for client
  });
}