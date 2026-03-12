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
    const projectKey = url.searchParams.get("projectKey");

    if (!cloudId || !projectKey) {
        return NextResponse.json({ error: "Missing cloudId or projectKey" }, { status: 400 });
    }

    const accessToken = await getJiraAccessToken(userId, orgId);
    if (!accessToken) {
        return NextResponse.json({ error: "No Jira token" }, { status: 400 });
    }

    const res = await fetch(
        `https://api.atlassian.com/ex/jira/${encodeURIComponent(cloudId)}/rest/api/3/user/assignable/search?project=${encodeURIComponent(projectKey)}&maxResults=50`,
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
    const users = (Array.isArray(json) ? json : []).map((u: Record<string, unknown>) => ({
        accountId: u.accountId as string,
        displayName: u.displayName as string,
        avatarUrl: (u.avatarUrls as Record<string, string>)?.["24x24"] ?? "",
        active: u.active ?? true,
    }));

    return NextResponse.json({ users });
}