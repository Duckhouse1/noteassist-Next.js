import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { getToken } from "next-auth/jwt";
import { IntegrationOptionsTitle } from "@/app/(app)/[company]/dashboard/sections/ConfigurationPage";

function base64url(input: Buffer) {
  return input
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

async function sha256(verifier: string) {
  return crypto.createHash("sha256").update(verifier).digest();
}
export type ProviderOptions = "outlook" | "SharePoint"

export async function GET(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const userId = token?.sub as string | undefined;
  const activeOrgId = token?.activeOrgId as string | undefined;
  const url = new URL(req.url);
  const providerParam = url.searchParams.get("provider");

  const ALLOWED_PROVIDERS = new Set<IntegrationOptionsTitle>([
    "Azure-Devops", "Outlook", "SharePoint"
  ]);

  if (!providerParam || !ALLOWED_PROVIDERS.has(providerParam as IntegrationOptionsTitle)) {
    return NextResponse.json({ error: "Invalid provider" }, { status: 400 });
  }

  const provider = providerParam as ProviderOptions;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!activeOrgId) {
    return NextResponse.json(
      { error: "No active organization found on session" },
      { status: 400 }
    );
  }

  const tenant = process.env.AZURE_AD_TENANT_ID!;
  const clientId = process.env.AZURE_AD_CLIENT_ID!;
  const redirectUri = `${process.env.NEXTAUTH_URL}/api/integrations/microsoft-graph/callback`;

  // ✅ Graph scopes (edit to your needs)
  const scope = provider === "SharePoint" ?
    [
      "Sites.ReadWrite.All",
      "offline_access",
      "openid",
      "profile",
    ]
    :
    [
      "openid",
      "profile",
      "email",
      "offline_access",
      "User.Read",
      "Mail.ReadWrite",
      "Calendars.ReadWrite",
    ]

  // PKCE
  const codeVerifier = base64url(crypto.randomBytes(32));
  const codeChallenge = base64url(await sha256(codeVerifier));

  // CSRF state + where to return
  const state = base64url(crypto.randomBytes(16));

  // Optional returnTo param (e.g. integrations page)
  // const url = new URL(req.url);
  const returnTo = url.searchParams.get("returnTo") || "/dashboard";

  // Store ephemeral oauth data in an httpOnly cookie
  const cookiePayload = JSON.stringify({
    state,
    codeVerifier,
    provider, 
    userId,
    organizationId: activeOrgId,
    returnTo,
    createdAt: Date.now(),
  });


  const authorizeUrl =
    `https://login.microsoftonline.com/${encodeURIComponent(
      tenant
    )}/oauth2/v2.0/authorize` +
    `?client_id=${encodeURIComponent(clientId)}` +
    `&response_type=code` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&response_mode=query` +
    `&scope=${encodeURIComponent(scope.join(" "))}` +
    `&state=${encodeURIComponent(state)}` +
    `&code_challenge=${encodeURIComponent(codeChallenge)}` +
    `&code_challenge_method=S256`;

  const res = NextResponse.redirect(authorizeUrl);

  res.cookies.set("ms_graph_oauth", cookiePayload, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 10 * 60, 
  });

  return res;
}
