// app/api/integrations/WorkItem/GetWorkItemTypesByProject/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { decrypt } from "@/lib/cryptation";

export interface WorkItemType {
  name: string;
  referenceName: string;
  description: string;
  color: string;
  icon: string;
  isDisabled: boolean;
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get("projectId");
    const organizationSlug = searchParams.get("org");

    if (!projectId || !organizationSlug) {
      return NextResponse.json(
        { error: "Missing projectId or org query param" },
        { status: 400 }
      );
    }

    // Find the Azure DevOps connection for this user + org
    // const org = await prisma.organization.findUnique({
    //   where: { slug: organizationSlug },
    // });
    // if (!org) {
    //   return NextResponse.json({ error: "Organization not found" }, { status: 404 });
    // }

    const connection = await prisma.integrationConnection.findFirst({
      where: {
        userId: session.user.id,
        provider: "Azure-Devops",
      },
    });

    if (!connection?.accessToken) {
      return NextResponse.json(
        { error: "No Azure DevOps connection found" },
        { status: 404 }
      );
    }

    // Parse org/project from meta or use the stored meta JSON
    // const devopsConfig = await prisma.integrationConfig.findUnique({
    //   where: { connectionId: connection.id },
      
    // });

    // const devopsOrg = devopsConfig?.data ?? "";

    // if (!devopsOrg) {
    //   return NextResponse.json(
    //     { error: "Azure DevOps organisation not set — save your configuration first" },
    //     { status: 400 }
    //   );
    // }

    // Fetch work item types from Azure DevOps REST API
    const url = `https://dev.azure.com/${organizationSlug}/${projectId}/_apis/wit/workitemtypes?api-version=7.1`;

    const devopsRes = await fetch(url, {
      headers: {
        Authorization: `Bearer ${decrypt(connection.accessToken)}`,
        "Content-Type": "application/json",
      },
    });

    if (!devopsRes.ok) {
      const errText = await devopsRes.text();
      console.error("Azure DevOps API error:", errText);
      return NextResponse.json(
        { error: "Failed to fetch work item types from Azure DevOps" },
        { status: devopsRes.status }
      );
    }
    // console.log(devopsRes);
    const data = await devopsRes.json();

    // Filter out system types users typically don't care about
    const excluded = new Set([
      "Test Plan",
      "Test Suite",
      "Test Case",
      "Shared Steps",
      "Shared Parameter",
      "Code Review Request",
      "Code Review Response",
      "Feedback Request",
      "Feedback Response",
      "Impediment",
    ]);

    const types: WorkItemType[] = (data.value ?? [])
      .filter((t: WorkItemType) => !t.isDisabled && !excluded.has(t.name))
      .map((t: WorkItemType) => ({
        name: t.name,
        referenceName: t.referenceName,
        description: t.description,
        color: t.color,
        icon: t.icon,
        isDisabled: t.isDisabled,
      }));

    return NextResponse.json({ types });
  } catch (error) {
    console.error("GetWorkItemTypesByProject error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}