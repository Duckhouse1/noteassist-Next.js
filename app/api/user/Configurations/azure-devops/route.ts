import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
function csvToArray(csv: unknown): string[] {
  if (typeof csv !== "string") return [];
  return csv
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function arrayToCsv(arr: unknown): string {
  if (!Array.isArray(arr)) return "";
  const clean = arr
    .filter((x): x is string => typeof x === "string")
    .map((s) => s.trim())
    .filter(Boolean);

  // de-dupe
  return Array.from(new Set(clean)).join(",");
}
export async function GET(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email || !session.user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const connectionId = searchParams.get("connectionId");

  if (!connectionId) {
    return NextResponse.json({ error: "connectionId is required" }, { status: 400 });
  }

  const config = await prisma.azureDevopsConfig.findUnique({
    where: { connectionId },
    select: {
      connectionId: true,
      defaultOrganization: true,
      defaultProject: true,
      defaultWorkItemTypes: true,
      connection: {
        select: {
          userId: true, // only what you need for the auth check
        },
      },
    },
  });

  if (!config) {
    return NextResponse.json({ error: "Config not found" }, { status: 404 });
  }

  // Make sure the config belongs to the requesting user
  if (config.connection.userId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json({
    defaultOrganization: config.defaultOrganization ?? "",
    defaultProject: config.defaultProject ?? "",
    defaultWorkItemTypes: csvToArray(config.defaultWorkItemTypes),
  });
}


export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email || !session.user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { ADOSettings } = body;
  console.log("dette er settings:");
  console.log(ADOSettings);
  const { searchParams } = new URL(req.url);
  const connectionId = searchParams.get("connectionId");

  if (!connectionId || !ADOSettings) {
    return NextResponse.json({ error: "connectionId and ADOCnfig is required" }, { status: 400 });
  }

  // Verify ownership
  const connection = await prisma.integrationConnection.findUnique({
    where: { id: connectionId },
  });

  if (!connection || connection.userId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const witCsv = arrayToCsv(ADOSettings.defaultWorkItemTypes);
  const config = await prisma.azureDevopsConfig.upsert({
    where: { connectionId },
    update: {
      defaultOrganization: ADOSettings.Defaultorganization ?? "",
      defaultProject: ADOSettings.Defaultproject ?? "",
      defaultWorkItemTypes: witCsv, // ✅ add
    },
    create: {
      defaultOrganization: ADOSettings.Defaultorganization ?? "",
      defaultProject: ADOSettings.Defaultproject ?? "",
      defaultWorkItemTypes: witCsv, // ✅ add
      connection: {
        connect: { id: connectionId },
      },
    },
    select: {
      defaultOrganization: true,
      defaultProject: true,
      defaultWorkItemTypes: true,
    },
  });
  return NextResponse.json({
    defaultOrganization: config.defaultOrganization ?? "",
    defaultProject: config.defaultProject ?? "",
    defaultWorkItemTypes: csvToArray(config.defaultWorkItemTypes),
  });
}