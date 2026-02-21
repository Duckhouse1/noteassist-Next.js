import { authOptions } from "@/lib/auth";
import { getAzureDevOpsAccessToken } from "@/lib/Integrations/DevOpsAccessToken";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;
    const orgId = (session)?.activeOrgID; // make sure this matches what you set in session callback
    console.log(orgId);
    // console.log("user id" + userId);
    if (!userId || !orgId) {
        console.log("Du sku ikke autoriseret");
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const accessToken = await getAzureDevOpsAccessToken(userId, orgId);
    console.log(accessToken);
    if (!accessToken) {
        return NextResponse.json({ error: "No DevOps token" }, { status: 400 });
    }
    const url =
        "https://dev.azure.com/noteTester/TestProject/_apis/wit/workitems/$Task?api-version=7.2-preview.3";


    // const body = req.body
    const resp = await fetch(url, {
        method: "POST",
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json-patch+json",
            Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify([
            { op: "add", path: "/fields/System.Title", value: "My new task 2" },
            { op: "add", path: "/fields/System.Description", value: "Created via API 2" },
        ]),
    });


    const text = await resp.text();
    let data: unknown;
    try {
        data = text ? JSON.parse(text) : null;
    } catch {
        data = { raw: text };
    }
    // console.log("Her har vi data: ");
    // console.log(data);
    // ✅ Return DevOps response so you can see errors in browser/network
    return NextResponse.json(
        { ok: resp.ok, status: resp.status, data },
        { status: resp.ok ? 200 : resp.status }
    );
}
