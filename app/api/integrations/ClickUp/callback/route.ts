import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { encrypt } from "@/lib/cryptation";

async function exchangeCodeForToken(code: string, redirectUri: string) {
    const resp = await fetch("https://api.clickup.com/api/v2/oauth/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            grant_type: "authorization_code",
            client_id: process.env.CLICKUP_CLIENT_ID!,
            client_secret: process.env.CLICKUP_CLIENT_SECRET!,
            code,
            redirect_uri: redirectUri,
        }),
    });

    const json = await resp.json();

    if (!resp.ok) {
        throw new Error(json?.error_description || json?.error || "ClickUp token exchange failed");
    }

    return json as {
        access_token: string;
        refresh_token?: string;
        expires_in: number;
        scope?: string;
    };
}

export async function GET(req: NextRequest) {
    const url = new URL(req.url);
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");

    if (!code || !state) {
        return NextResponse.json({ error: "Missing code/state" }, { status: 400 });
    }

    const cookie = req.cookies.get("clickup_oauth")?.value;
    if (!cookie) {
        return NextResponse.json({ error: "Missing oauth cookie" }, { status: 400 });
    }

    let payload: {
        state: string;
        userId: string;
        provider: string;
        organizationId: string;
        returnTo: string;
        createdAt: number;
    };

    try {
        payload = JSON.parse(cookie);
    } catch {
        return NextResponse.json({ error: "Invalid oauth cookie" }, { status: 400 });
    }

    if (payload.state !== state) {
        return NextResponse.json({ error: "State mismatch" }, { status: 400 });
    }

    if (Date.now() - payload.createdAt > 10 * 60 * 1000) {
        return NextResponse.json({ error: "OAuth flow expired" }, { status: 400 });
    }

    const redirectUri = `${process.env.NEXTAUTH_URL}/api/integrations/ClickUp/callback`;

    try {
        const tokenResponse = await exchangeCodeForToken(code, redirectUri);
        const expiresAt = tokenResponse.expires_in
            ? new Date(Date.now() + tokenResponse.expires_in * 1000)
            : null;
        await prisma.integrationConnection.upsert({
            where: {
                organizationId_userId_provider: {
                    organizationId: payload.organizationId,
                    userId: payload.userId,
                    provider: "clickup",
                },
            },
            update: {
                accessToken: encrypt(tokenResponse.access_token),
                refreshToken: tokenResponse.refresh_token
                    ? encrypt(tokenResponse.refresh_token)
                    : null,
                expiresAt,
                scope: tokenResponse.scope,
                meta: JSON.stringify({ provider: "clickup" }),
            },
            create: {
                organizationId: payload.organizationId,
                userId: payload.userId,
                provider: "clickup",
                displayName: "clickup",
                accessToken: encrypt(tokenResponse.access_token),
                refreshToken: tokenResponse.refresh_token
                    ? encrypt(tokenResponse.refresh_token)
                    : null,
                expiresAt,
                scope: tokenResponse.scope,
                meta: JSON.stringify({ provider: "clickup" }),
            },
        });

        const res = NextResponse.redirect(new URL(payload.returnTo, process.env.NEXTAUTH_URL));
        res.cookies.set("clickup_oauth", "", { path: "/", maxAge: 0 });
        return res;
    } catch (err: unknown) {
        let message = "clickup OAuth callback failed";
        if (err instanceof Error) message = err.message;

        const res = NextResponse.json({ error: message }, { status: 400 });
        res.cookies.set("clickup_oauth", "", { path: "/", maxAge: 0 });
        return res;
    }
}