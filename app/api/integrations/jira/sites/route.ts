import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getJiraAccessToken } from "@/lib/Integrations/Jira/accessToken";

export async function GET() {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;
    const orgId = (session as unknown as { activeOrgID?: string })?.activeOrgID;

    if (!userId || !orgId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const accessToken = await getJiraAccessToken(userId, orgId);
    if (!accessToken) {
        return NextResponse.json({ error: "No Jira token" }, { status: 400 });
    }

    const res = await fetch("https://api.atlassian.com/oauth/token/accessible-resources", {
        headers: { Authorization: `Bearer ${accessToken}`, Accept: "application/json" },
    });

    if (!res.ok) {
        const text = await res.text();
        return NextResponse.json({ error: text }, { status: res.status });
    }

    const sites = await res.json();
    return NextResponse.json({ sites });
}