import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getJiraAccessToken } from "@/lib/Integrations/Jira/accessToken";

export async function GET(req: NextRequest) {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;
    const orgId = (session as unknown as { activeOrgID?: string })?.activeOrgID;

    if (!userId || !orgId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(req.url);
    const cloudId = url.searchParams.get("cloudId");
    if (!cloudId) {
        return NextResponse.json({ error: "Missing cloudId" }, { status: 400 });
    }

    const accessToken = await getJiraAccessToken(userId, orgId);
    if (!accessToken) {
        return NextResponse.json({ error: "No Jira token" }, { status: 400 });
    }

    const res = await fetch(
        `https://api.atlassian.com/ex/jira/${encodeURIComponent(cloudId)}/rest/api/3/project/search?maxResults=50`,
        {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                Accept: "application/json",
            },
        }
    );

    if (!res.ok) {
        const text = await res.text();
        return NextResponse.json({ error: text }, { status: res.status });
    }

    const json = await res.json();
    // Jira returns { values: [...], ... }
    const projects = (json.values ?? []).map((p: Record<string, unknown>) => ({
        id: p.id,
        key: p.key,
        name: p.name,
        style: p.style ?? "",
    }));

    return NextResponse.json(projects);
}