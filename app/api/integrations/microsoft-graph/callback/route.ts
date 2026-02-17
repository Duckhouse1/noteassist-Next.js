import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ProviderOptions } from "../connect/route";
import { IntegrationOptionsTitle } from "@/app/(app)/[company]/dashboard/sections/ConfigurationPage";


export const displayNameByProvider: Record<IntegrationOptionsTitle, string> = {
  Outlook: "Microsoft Outlook",
  "azure-devops":"azure-devops"
};

async function exchangeCodeForToken(params: {
    tenant: string;
    clientId: string;
    clientSecret: string;
    redirectUri: string;
    code: string;
    codeVerifier: string;
    scope: string;
}) {
    const tokenUrl = `https://login.microsoftonline.com/${encodeURIComponent(
        params.tenant
    )}/oauth2/v2.0/token`;

    const body = new URLSearchParams();
    body.set("client_id", params.clientId);
    body.set("client_secret", params.clientSecret);
    body.set("grant_type", "authorization_code");
    body.set("code", params.code);
    body.set("redirect_uri", params.redirectUri);
    body.set("code_verifier", params.codeVerifier);
    body.set("scope", params.scope);

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
        id_token?: string;
        token_type?: string;
    };
}

export async function GET(req: NextRequest) {
    const url = new URL(req.url);
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");

    if (!code || !state) {
        return NextResponse.json({ error: "Missing code/state" }, { status: 400 });
    }

    const cookie = req.cookies.get("ms_graph_oauth")?.value;
    if (!cookie) {
        return NextResponse.json({ error: "Missing oauth cookie" }, { status: 400 });
    }

    let payload: {
        state: string;
        codeVerifier: string;
        userId: string;
        provider: IntegrationOptionsTitle;
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

    // Optional: expire after 10 min
    if (Date.now() - payload.createdAt > 10 * 60 * 1000) {
        return NextResponse.json({ error: "OAuth flow expired" }, { status: 400 });
    }

    const tenant = process.env.AZURE_AD_TENANT_ID!;
    const clientId = process.env.AZURE_AD_CLIENT_ID!;
    const clientSecret = process.env.AZURE_AD_CLIENT_SECRET!;
    const redirectUri = `${process.env.NEXTAUTH_URL}/api/integrations/microsoft-graph/callback`;
    const provider = payload.provider;
    const providerDisplayName = displayNameByProvider[provider]
    const scope = [
        "openid",
        "profile",
        "email",
        "offline_access",
        "User.Read",
        "Mail.ReadWrite",
        "Calendars.ReadWrite",
    ].join(" ");

    try {
        const tokenResponse = await exchangeCodeForToken({
            tenant,
            clientId,
            clientSecret,
            redirectUri,
            code,
            codeVerifier: payload.codeVerifier,
            scope,
        });

        const expiresAt = new Date(Date.now() + tokenResponse.expires_in * 1000);

        // Store/update connection in your IntegrationConnection table
        await prisma.integrationConnection.upsert({
            where: {
                organizationId_userId_provider: {
                    organizationId: payload.organizationId,
                    userId: payload.userId,
                    provider: provider,
                },
            },
            update: {
                accessToken: tokenResponse.access_token,
                refreshToken: tokenResponse.refresh_token ?? undefined,
                expiresAt,
                scope: tokenResponse.scope,
                meta: JSON.stringify({ tenantId: tenant }),
            },
            create: {
                organizationId: payload.organizationId,
                userId: payload.userId,
                provider: provider,
                displayName: providerDisplayName,
                accessToken: tokenResponse.access_token,
                refreshToken: tokenResponse.refresh_token ?? null,
                expiresAt,
                scope: tokenResponse.scope,
                meta: JSON.stringify({ tenantId: tenant }),
            },
        });

        const res = NextResponse.redirect(new URL(payload.returnTo, process.env.NEXTAUTH_URL));
        // Clear cookie
        res.cookies.set("ms_graph_oauth", "", { path: "/", maxAge: 0 });
        return res;
    } catch (err: unknown) {
        let message = "OAuth callback failed";

        if (err instanceof Error) {
            message = err.message;
        }

        const res = NextResponse.json(
            { error: message },
            { status: 400 }
        );

        res.cookies.set("ms_graph_oauth", "", { path: "/", maxAge: 0 });

        return res;
    }

}
