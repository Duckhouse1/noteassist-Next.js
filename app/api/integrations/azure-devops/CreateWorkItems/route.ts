import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getAzureDevOpsAccessToken } from "@/lib/Integrations/AzureDevops/DevOpsAccessToken";
import type { DevOpsElement } from "@/app/types/OpenAI";

export interface CreateWitWorkItem {
  id: number;
  rev: number;
  url: string;
  fields: Record<string, unknown>;
  relations?: Array<{
    rel: string;
    url: string;
    attributes?: Record<string, unknown>;
  }>;
}

// Optional: type ADO error shape a bit, but keep flexible
type AzureDevOpsError = {
  message?: string;
  typeKey?: string;
  errorCode?: number;
  raw?: string;
};

function isNonEmptyString(x: unknown): x is string {
  return typeof x === "string" && x.trim().length > 0;
}

function isCreateWitWorkItem(x: unknown): x is CreateWitWorkItem {
  if (typeof x !== "object" || x === null) return false;
  const o = x as Record<string, unknown>;
  return typeof o.id === "number" && typeof o.rev === "number" && typeof o.url === "string";
}

/** JSON Patch types (no `any`) */
type JsonPatchOp =
  | { op: "add"; path: "/fields/System.Title"; value: string }
  | { op: "add"; path: "/fields/System.Description"; value: string }
  | {
      op: "add";
      path: "/relations/-";
      value: {
        rel: "System.LinkTypes.Hierarchy-Reverse";
        url: string;
        attributes?: Record<string, unknown>;
      };
    };

type CreateWorkItemResponse =
  | { ok: true; status: number; data: CreateWitWorkItem }
  | { ok: false; status: number; data: AzureDevOpsError };

async function createWorkItem(params: {
  accessToken: string;
  organization: string;
  projectIdOrName: string;
  workItemType: string;
  title: string;
  description?: string;
  parentWorkItemId?: number;
}): Promise<CreateWorkItemResponse> {
  const {
    accessToken,
    organization,
    projectIdOrName,
    workItemType,
    title,
    description,
    parentWorkItemId,
  } = params;

  const url = `https://dev.azure.com/${encodeURIComponent(
    organization
  )}/${encodeURIComponent(projectIdOrName)}/_apis/wit/workitems/$${encodeURIComponent(
    workItemType
  )}?api-version=7.2-preview.3`;

  const patch: JsonPatchOp[] = [{ op: "add", path: "/fields/System.Title", value: title }];

  if (isNonEmptyString(description)) {
    patch.push({ op: "add", path: "/fields/System.Description", value: description });
  }

  if (typeof parentWorkItemId === "number") {
    patch.push({
      op: "add",
      path: "/relations/-",
      value: {
        rel: "System.LinkTypes.Hierarchy-Reverse",
        url: `https://dev.azure.com/${organization}/_apis/wit/workItems/${parentWorkItemId}`,
        attributes: { comment: "Linked as parent" },
      },
    });
  }

  const resp = await fetch(url, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json-patch+json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(patch),
  });

  const text = await resp.text();

  let parsed: unknown = null;
  try {
    parsed = text ? JSON.parse(text) : null;
  } catch {
    parsed = { raw: text };
  }

  if (resp.ok && isCreateWitWorkItem(parsed)) {
    return { ok: true, status: resp.status, data: parsed };
  }

  // If API returned ok but shape differs, still treat as error (helps typing discipline)
  const errObj: AzureDevOpsError =
    typeof parsed === "object" && parsed !== null
      ? (parsed as AzureDevOpsError)
      : { raw: text };

  return { ok: false, status: resp.status, data: errObj };
}

type TreeResult =
  | {
      ok: true;
      elementId?: string;
      status: number;
      createdWorkItemId: number;
      data: CreateWitWorkItem;
      children?: TreeResult[];
    }
  | {
      ok: false;
      elementId?: string;
      status: number;
      error: unknown;
      children?: TreeResult[];
    };

async function createElementTree(params: {
  element: DevOpsElement;
  accessToken: string;
  organization: string;
  parentWorkItemId?: number;
}): Promise<TreeResult> {
  const { element, accessToken, organization, parentWorkItemId } = params;

  const elementId = element?.id ?? undefined;
  const projectIdOrName = element?.Project?.id;
  const workItemType = element?.type;
  const title = element?.title;
  const description = element?.description;

  if (
    !isNonEmptyString(projectIdOrName) ||
    !isNonEmptyString(workItemType) ||
    !isNonEmptyString(title)
  ) {
    return {
      ok: false,
      elementId,
      status: 400,
      error: "Invalid element: requires Project.id, type, title",
    };
  }

  const created = await createWorkItem({
    accessToken,
    organization,
    projectIdOrName,
    workItemType,
    title,
    description,
    parentWorkItemId,
  });

  if (!created.ok) {
    return {
      ok: false,
      elementId,
      status: created.status,
      error: created.data,
    };
  }

  const createdId = created.data.id;

  const children = Array.isArray(element.children) ? element.children : [];
  const childResults: TreeResult[] = [];

  for (const child of children) {
    childResults.push(
      await createElementTree({
        element: child,
        accessToken,
        organization,
        parentWorkItemId: createdId,
      })
    );
  }

  return {
    ok: true,
    elementId,
    status: created.status,
    createdWorkItemId: createdId,
    data: created.data,
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
  const elements = (body as { elements?: DevOpsElement[] } | null)?.elements;

  if (!Array.isArray(elements) || elements.length === 0) {
    return NextResponse.json({ error: "Missing elements[]" }, { status: 400 });
  }

  const organization = "noteTester"; // ideally from your AzureDevopsSettings
  const accessToken = await getAzureDevOpsAccessToken(userId, orgId);

  if (!accessToken) {
    return NextResponse.json({ error: "No DevOps token" }, { status: 400 });
  }

  const results: TreeResult[] = [];

  for (const element of elements) {
    try {
      results.push(await createElementTree({ element, accessToken, organization }));
    } catch (err) {
      results.push({
        ok: false,
        elementId: element?.id,
        status: 500,
        error: err,
      });
    }
  }

  const allOk = results.every(r => r.ok);
  const someOk = results.some(r => r.ok);
  const status = allOk ? 200 : someOk ? 207 : 400;

  return NextResponse.json({ results }, { status });
}