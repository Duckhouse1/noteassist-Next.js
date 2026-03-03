import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { encrypt } from "@/lib/cryptation";

const OUTLOOK_SCOPES = [
    "openid",
    "profile",
    "email",
    "offline_access",
    "User.Read",
    "Mail.Send",
    "Mail.ReadWrite",
    "Calendars.ReadWrite",
    "OnlineMeetings.ReadWrite",
].join(" ");

async function exchangeCodeForToken(params: {
    tenant: string;
    clientId: string;
    clientSecret: string;
    redirectUri: string;
    code: string;
    codeVerifier: string;
}) {
    const tokenUrl = `https://login.microsoftonline.com/${encodeURIComponent(params.tenant)}/oauth2/v2.0/token`;

    const body = new URLSearchParams();
    body.set("client_id", params.clientId);
    body.set("client_secret", params.clientSecret);
    body.set("grant_type", "authorization_code");
    body.set("code", params.code);
    body.set("redirect_uri", params.redirectUri);
    body.set("code_verifier", params.codeVerifier);
    body.set("scope", OUTLOOK_SCOPES);

    const resp = await fetch(tokenUrl, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: body.toString(),
    });

    const json = await resp.json();
    if (!resp.ok) {
        throw new Error(json?.error_description || "Token exchange failed");
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

    const cookie = req.cookies.get("outlook_oauth")?.value;
    if (!cookie) {
        return NextResponse.json({ error: "Missing oauth cookie" }, { status: 400 });
    }

    let payload: {
        state: string;
        codeVerifier: string;
        userId: string;
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

    const tenant = process.env.AZURE_AD_TENANT_ID!;
    const clientId = process.env.AZURE_AD_CLIENT_ID!;
    const clientSecret = process.env.AZURE_AD_CLIENT_SECRET!;
    const redirectUri = `${process.env.NEXTAUTH_URL}/api/integrations/Outlook/callback`;

    try {
        const tokenResponse = await exchangeCodeForToken({
            tenant,
            clientId,
            clientSecret,
            redirectUri,
            code,
            codeVerifier: payload.codeVerifier,
        });

        const expiresAt = new Date(Date.now() + tokenResponse.expires_in * 1000);

        await prisma.integrationConnection.upsert({
            where: {
                organizationId_userId_provider: {
                    organizationId: payload.organizationId,
                    userId: payload.userId,
                    provider: "outlook",
                },
            },
            update: {
                accessToken: encrypt(tokenResponse.access_token),
                refreshToken: tokenResponse.refresh_token
                    ? encrypt(tokenResponse.refresh_token)
                    : null,
                expiresAt,
                scope: tokenResponse.scope,
                meta: JSON.stringify({ tenantId: tenant }),
            },
            create: {
                organizationId: payload.organizationId,
                userId: payload.userId,
                provider: "outlook",
                displayName: "Microsoft Outlook",
                accessToken: encrypt(tokenResponse.access_token),
                refreshToken: tokenResponse.refresh_token
                    ? encrypt(tokenResponse.refresh_token)
                    : null,
                expiresAt,
                scope: tokenResponse.scope,
                meta: JSON.stringify({ tenantId: tenant }),
            },
        });

        const res = NextResponse.redirect(new URL(payload.returnTo, process.env.NEXTAUTH_URL));
        res.cookies.set("outlook_oauth", "", { path: "/", maxAge: 0 });
        return res;
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "OAuth callback failed";
        const res = NextResponse.json({ error: message }, { status: 400 });
        res.cookies.set("outlook_oauth", "", { path: "/", maxAge: 0 });
        return res;
    }
}