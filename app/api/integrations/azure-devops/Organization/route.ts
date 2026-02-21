import { NextResponse } from "next/server";
import { getAzureDevOpsAccessToken } from "@/lib/Integrations/DevOpsAccessToken";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

type AdoProfileMe = {
  id: string;
  displayName?: string;
  emailAddress?: string;
};

type AdoAccountsResponse = {
  count: number;
  value: Array<{
    accountId: string;
    accountName: string; // org name (what you use in dev.azure.com/{org})
    organizationName?: string;
    accountUri?: string;
  }>;
};

export async function GET() {
  const session = await getServerSession(authOptions);

  // Your existing session fields
  const userId = session?.user?.id as string | undefined;
  const organizationId = session?.activeOrgID as string | undefined;

  if (!userId || !organizationId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const accessToken = await getAzureDevOpsAccessToken(userId, organizationId);
  if (!accessToken) {
    return NextResponse.json(
      { error: "Azure DevOps not connected" },
      { status: 400 }
    );
  }

  const commonHeaders = {
    Accept: "application/json",
    "Content-Type": "application/json",
    Authorization: `Bearer ${accessToken}`,
  };

  // 1) Fetch profile id (GUID) for the signed-in user
  const profileUrl =
    "https://app.vssps.visualstudio.com/_apis/profile/profiles/me?api-version=7.0-preview";

  const profileResp = await fetch(profileUrl, { headers: commonHeaders });
  const profileContentType = profileResp.headers.get("content-type") || "";
  const profileText = await profileResp.text();

  if (!profileResp.ok) {
    return NextResponse.json(
      {
        step: "profile",
        status: profileResp.status,
        contentType: profileContentType,
        bodyPreview: profileText.slice(0, 800),
      },
      { status: profileResp.status }
    );
  }

  if (!profileContentType.includes("application/json")) {
    return NextResponse.json(
      {
        step: "profile",
        error: "Expected JSON, got non-JSON response",
        contentType: profileContentType,
        bodyPreview: profileText.slice(0, 800),
      },
      { status: 502 }
    );
  }

  const profile = JSON.parse(profileText) as AdoProfileMe;

  if (!profile?.id) {
    return NextResponse.json(
      {
        step: "profile",
        error: "Profile response missing id",
        bodyPreview: profileText.slice(0, 800),
      },
      { status: 502 }
    );
  }

  // 2) Use that profile id as memberId to list orgs/accounts
  // NOTE: This endpoint is stable at 7.0 (not preview).
  const accountsUrl = `https://app.vssps.visualstudio.com/_apis/accounts?memberId=${encodeURIComponent(
    profile.id
  )}&api-version=7.0`;

  const accountsResp = await fetch(accountsUrl, { headers: commonHeaders });
  const accountsContentType = accountsResp.headers.get("content-type") || "";
  const accountsText = await accountsResp.text();

  if (!accountsResp.ok) {
    return NextResponse.json(
      {
        step: "accounts",
        status: accountsResp.status,
        contentType: accountsContentType,
        bodyPreview: accountsText.slice(0, 800),
        profileIdUsed: profile.id,
      },
      { status: accountsResp.status }
    );
  }

  if (!accountsContentType.includes("application/json")) {
    return NextResponse.json(
      {
        step: "accounts",
        error: "Expected JSON, got non-JSON response",
        contentType: accountsContentType,
        bodyPreview: accountsText.slice(0, 800),
        profileIdUsed: profile.id,
      },
      { status: 502 }
    );
  }

  const accounts = JSON.parse(accountsText) as AdoAccountsResponse;

  // Return a nice shape for your UI to populate a picker
  const organizations = (accounts.value || []).map((a) => ({
    accountId: a.accountId,
    name: a.accountName,
    organizationName: a.organizationName ?? a.accountName,
    accountUri: a.accountUri,
  }));

  return NextResponse.json({
    profile: {
      id: profile.id,
      displayName: profile.displayName,
      emailAddress: profile.emailAddress,
    },
    organizations,
    count: organizations.length,
  });
}
