import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import type { DevOpsElement } from "@/app/types/OpenAI";
import { getJiraAccessToken } from "@/lib/Integrations/Jira/accessToken";

// Reuses the DevOpsElement shape from OpenAI types since the LLM outputs the same structure.

type JiraCreateResult =
    | { ok: true; elementId?: string; issueKey: string; children?: JiraCreateResult[] }
    | { ok: false; elementId?: string; error: unknown; children?: JiraCreateResult[] };

async function createJiraIssue(params: {
    accessToken: string;
    cloudId: string;
    projectKey: string;
    issueType: string;
    title: string;
    description?: string;
    parentKey?: string;
}): Promise<{ ok: boolean; key?: string; error?: unknown }> {
    const { accessToken, cloudId, projectKey, issueType, title, description, parentKey } = params;

    const fields: Record<string, unknown> = {
        project: { key: projectKey },
        issuetype: { name: issueType },
        summary: title,
    };

    if (description) {
        // Atlassian Document Format (ADF) for description
        fields.description = {
            type: "doc",
            version: 1,
            content: [
                {
                    type: "paragraph",
                    content: [{ type: "text", text: description }],
                },
            ],
        };
    }

    if (parentKey) {
        fields.parent = { key: parentKey };
    }

    const url = `https://api.atlassian.com/ex/jira/${encodeURIComponent(cloudId)}/rest/api/3/issue`;

    const resp = await fetch(url, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
            Accept: "application/json",
        },
        body: JSON.stringify({ fields }),
    });

    const json = await resp.json().catch(() => ({}));

    if (!resp.ok) {
        return { ok: false, error: json };
    }

    return { ok: true, key: json.key };
}

async function createElementTree(params: {
    element: DevOpsElement;
    accessToken: string;
    cloudId: string;
    projectKey: string;
    parentKey?: string;
}): Promise<JiraCreateResult> {
    const { element, accessToken, cloudId, projectKey, parentKey } = params;

    const result = await createJiraIssue({
        accessToken,
        cloudId,
        projectKey,
        issueType: element.type,
        title: element.title,
        description: element.description,
        parentKey,
    });

    if (!result.ok) {
        return { ok: false, elementId: element.id, error: result.error };
    }

    const children = Array.isArray(element.children) ? element.children : [];
    const childResults: JiraCreateResult[] = [];

    for (const child of children) {
        childResults.push(
            await createElementTree({
                element: child,
                accessToken,
                cloudId,
                projectKey,
                parentKey: result.key,
            })
        );
    }

    return {
        ok: true,
        elementId: element.id,
        issueKey: result.key!,
        children: childResults.length ? childResults : undefined,
    };
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;
    const orgId = (session as unknown as { activeOrgID?: string })?.activeOrgID;

    if (!userId || !orgId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await req.json().catch(() => null)) as unknown;
    const { elements, cloudId, projectKey } = (body ?? {}) as {
        elements?: DevOpsElement[];
        cloudId?: string;
        projectKey?: string;
    };

    if (!Array.isArray(elements) || elements.length === 0) {
        return NextResponse.json({ error: "Missing elements[]" }, { status: 400 });
    }
    if (!cloudId || !projectKey) {
        return NextResponse.json({ error: "Missing cloudId or projectKey" }, { status: 400 });
    }

    const accessToken = await getJiraAccessToken(userId, orgId);
    if (!accessToken) {
        return NextResponse.json({ error: "No Jira token" }, { status: 400 });
    }

    const results: JiraCreateResult[] = [];

    for (const element of elements) {
        try {
            results.push(await createElementTree({ element, accessToken, cloudId, projectKey }));
        } catch (err) {
            results.push({ ok: false, elementId: element?.id, error: err });
        }
    }

    const allOk = results.every((r) => r.ok);
    const someOk = results.some((r) => r.ok);
    const status = allOk ? 200 : someOk ? 207 : 400;

    return NextResponse.json({ results }, { status });
}