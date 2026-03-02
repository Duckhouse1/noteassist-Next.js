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
  const spaceId = searchParams.get("space");

  if (!spaceId) {
    return NextResponse.json(
      { error: "Missing required query parameter: space" },
      { status: 400 }
    );
  }

  // ClickUp: Get Lists in a Space
  // GET https://api.clickup.com/api/v2/space/{space_id}/list?archived=false
  const url = new URL(`https://api.clickup.com/api/v2/space/${encodeURIComponent(spaceId)}/list`);
  url.searchParams.set("archived", "false");

  const resp = await fetch(url.toString(), {
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    cache: "no-store",
  });

  const contentType = resp.headers.get("content-type") || "";
  const text = await resp.text();

  if (!resp.ok) {
    return NextResponse.json(
      {
        status: resp.status,
        contentType,
        bodyPreview: text.slice(0, 500),
      },
      { status: resp.status }
    );
  }

  if (!contentType.includes("application/json")) {
    return NextResponse.json(
      {
        error: "Expected JSON, got non-JSON response",
        contentType,
        bodyPreview: text.slice(0, 500),
      },
      { status: 502 }
    );
  }

  const data = JSON.parse(text);

  // ClickUp typically returns: { lists: [...] }
  return NextResponse.json(data);
}