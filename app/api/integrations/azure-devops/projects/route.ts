import { NextResponse } from "next/server";
import { getAzureDevOpsAccessToken } from "@/lib/Integrations/DevOpsAccessToken";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  const session = await getServerSession(authOptions);
  const userId = session?.user.id
  const organizationId = session?.activeOrgID

  if (!userId || !organizationId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const accessToken = await getAzureDevOpsAccessToken(userId, organizationId);
  if (!accessToken) {
    return NextResponse.json({ error: "Azure DevOps not connected" }, { status: 400 });
  }

  const resp = await fetch(
    "https://dev.azure.com/noteTester/_apis/projects?api-version=7.2-preview.1",
    {
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "Authorization": `Bearer ${accessToken}`,
      }
    }
  );
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
      { error: "Expected JSON, got non-JSON response", contentType, bodyPreview: text.slice(0, 500) },
      { status: 502 }
    );
  }

  const data = JSON.parse(text);
  return NextResponse.json(data);

}
