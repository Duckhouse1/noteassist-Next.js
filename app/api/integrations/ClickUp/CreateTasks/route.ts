import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getClickUpAccessToken } from "@/lib/Integrations/ClickUp/ClickUpAccessToken";
import type { ClickUpElements } from "@/lib/Integrations/ClickUp/Configuration";

type ClickUpCreateResult =
    | { ok: true; elementId: string; taskId: string; children?: ClickUpCreateResult[] }
    | { ok: false; elementId: string; error: unknown; children?: ClickUpCreateResult[] };

async function createClickUpTask(params: {
    accessToken: string;
    listId: string;
    name: string;
    description?: string;
    parentTaskId?: string;
}): Promise<{ ok: boolean; taskId?: string; error?: unknown }> {
    const { accessToken, listId, name, description, parentTaskId } = params;

    const body: Record<string, unknown> = { name };

    if (description) body.description = description;

    // Setting `parent` is what makes this a subtask in ClickUp.
    // The API still requires the same list endpoint — ClickUp places
    // the subtask under the parent automatically within that list.
    if (parentTaskId) body.parent = parentTaskId;

    const resp = await fetch(
        `https://api.clickup.com/api/v2/list/${encodeURIComponent(listId)}/task`,
        {
            method: "POST",
            headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
        }
    );

    const json = await resp.json().catch(() => ({}));
    if (!resp.ok) return { ok: false, error: json };
    return { ok: true, taskId: json.id };
}

async function createElementTree(params: {
    element: ClickUpElements;
    accessToken: string;
    /** The root list ID — every task and subtask in this tree lives here. */
    rootListId: string;
    parentTaskId?: string;
}): Promise<ClickUpCreateResult> {
    const { element, accessToken, rootListId, parentTaskId } = params;

    const result = await createClickUpTask({
        accessToken,
        listId: rootListId,
        name: element.title,
        description: element.description,
        parentTaskId,
    });

    if (!result.ok) {
        return { ok: false, elementId: element.id, error: result.error };
    }

    const children = Array.isArray(element.children) ? element.children : [];
    const childResults: ClickUpCreateResult[] = [];

    for (const child of children) {
        // Children always use the same rootListId and receive this task as their parent.
        childResults.push(
            await createElementTree({
                element: child,
                accessToken,
                rootListId,
                parentTaskId: result.taskId,
            })
        );
    }

    return {
        ok: true,
        elementId: element.id,
        taskId: result.taskId!,
        children: childResults.length ? childResults : undefined,
    };
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;
    const organizationId = session?.activeOrgID;

    if (!userId || !organizationId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await req.json().catch(() => null)) as unknown;
    const { elements } = (body ?? {}) as { elements?: ClickUpElements[] };

    if (!Array.isArray(elements) || elements.length === 0) {
        return NextResponse.json({ error: "Missing elements[]" }, { status: 400 });
    }

    const accessToken = await getClickUpAccessToken(userId, organizationId);
    if (!accessToken) {
        return NextResponse.json({ error: "ClickUp not connected" }, { status: 400 });
    }

    const results: ClickUpCreateResult[] = [];

    for (const element of elements) {
        const listId = element.list?.id?.trim();

        if (!listId) {
            results.push({
                ok: false,
                elementId: element.id,
                error: `Task "${element.title}" has no list set.`,
            });
            continue;
        }

        try {
            results.push(
                await createElementTree({
                    element,
                    accessToken,
                    rootListId: listId,
                })
            );
        } catch (err) {
            results.push({ ok: false, elementId: element.id, error: err });
        }
    }

    const allOk = results.every((r) => r.ok);
    const someOk = results.some((r) => r.ok);
    const status = allOk ? 200 : someOk ? 207 : 400;

    return NextResponse.json({ results }, { status });
}