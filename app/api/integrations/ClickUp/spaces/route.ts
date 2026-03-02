import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getClickUpAccessToken } from "@/lib/Integrations/ClickUp/ClickUpAccessToken";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  const organizationId = session?.activeOrgID;

  if (!userId || !organizationId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const accessToken = await getClickUpAccessToken(userId, organizationId);
  if (!accessToken) {
    return NextResponse.json({ error: "ClickUp not connected" }, { status: 400 });
  }

  const { searchParams } = new URL(req.url);
  const teamIdParam = searchParams.get("teamId"); // optional

  // Helper for consistent ClickUp fetch + JSON validation
  async function clickupFetch(url: string) {
    const resp = await fetch(url, {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`, // ClickUp uses Bearer tokens :contentReference[oaicite:1]{index=1}
      },
      cache: "no-store",
    });

    const contentType = resp.headers.get("content-type") || "";
    const text = await resp.text();

    if (!resp.ok) {
      return {
        ok: false as const,
        status: resp.status,
        error: {
          status: resp.status,
          contentType,
          bodyPreview: text.slice(0, 500),
        },
      };
    }

    if (!contentType.includes("application/json")) {
      return {
        ok: false as const,
        status: 502,
        error: {
          error: "Expected JSON, got non-JSON response",
          contentType,
          bodyPreview: text.slice(0, 500),
        },
      };
    }

    return { ok: true as const, status: resp.status, data: JSON.parse(text) };
  }

  // 1) Determine team_id (workspace)
  let teamId = teamIdParam;

  if (!teamId) {
    const teamsRes = await clickupFetch("https://api.clickup.com/api/v2/team"); // authorized workspaces :contentReference[oaicite:2]{index=2}
    if (!teamsRes.ok) {
      return NextResponse.json(teamsRes.error, { status: teamsRes.status });
    }

    const teams = teamsRes.data?.teams;
    if (!Array.isArray(teams) || teams.length === 0) {
      return NextResponse.json(
        { error: "No authorized ClickUp workspaces found for this connection." },
        { status: 404 }
      );
    }

    teamId = String(teams[0].id);
  }

  // 2) Fetch spaces for that team_id (workspace)
  const spacesUrl = new URL(`https://api.clickup.com/api/v2/team/${teamId}/space`);
  spacesUrl.searchParams.set("archived", "false"); // Get Spaces endpoint supports archived :contentReference[oaicite:3]{index=3}

  const spacesRes = await clickupFetch(spacesUrl.toString());
  if (!spacesRes.ok) {
    return NextResponse.json(spacesRes.error, { status: spacesRes.status });
  }

  // ClickUp returns { spaces: [...] , ... }
  return NextResponse.json(spacesRes.data);
}