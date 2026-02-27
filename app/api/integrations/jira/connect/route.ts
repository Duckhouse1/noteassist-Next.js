import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { getToken } from "next-auth/jwt";

function base64url(input: Buffer) {
    return input
        .toString("base64")
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/g, "");
}

export async function GET(req: NextRequest) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    const userId = token?.sub as string | undefined;
    const activeOrgId = token?.activeOrgId as string | undefined;
    const url = new URL(req.url);

    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!activeOrgId) {
        return NextResponse.json(
            { error: "No active organization found on session" },
            { status: 400 }
        );
    }

    const clientId = process.env.JIRA_CLIENT_ID!;
    const redirectUri = `${process.env.NEXTAUTH_URL}/api/integrations/jira/callback`;
    const returnTo = url.searchParams.get("returnTo") || "/dashboard";

    // CSRF state
    const state = base64url(crypto.randomBytes(16));

    // Store ephemeral oauth data in an httpOnly cookie
    const cookiePayload = JSON.stringify({
        state,
        userId,
        provider: "jira",
        organizationId: activeOrgId,
        returnTo,
        createdAt: Date.now(),
    });

    // Atlassian OAuth 2.0 (3LO) scopes
    const scopes = [
        "read:jira-work",
        "write:jira-work",
        "read:jira-user",
        "offline_access",
    ].join(" ");

    const authorizeUrl =
        `https://auth.atlassian.com/authorize` +
        `?audience=api.atlassian.com` +
        `&client_id=${encodeURIComponent(clientId)}` +
        `&scope=${encodeURIComponent(scopes)}` +
        `&redirect_uri=${encodeURIComponent(redirectUri)}` +
        `&state=${encodeURIComponent(state)}` +
        `&response_type=code` +
        `&prompt=consent`;

    const res = NextResponse.redirect(authorizeUrl);

    res.cookies.set("jira_oauth", cookiePayload, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 10 * 60,
    });

    return res;
}