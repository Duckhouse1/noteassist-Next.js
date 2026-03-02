import { ClickUpList, ClickUpSpace, ClickUpWorkSpace } from "./Configuration";

export interface FetchedClickUpData {
    workspaces: ClickUpWorkSpace[]
    spaces: ClickUpSpace[];
    lists: ClickUpList[];
}

async function FetchClickUpWorkspaceSpaceLists(): Promise<FetchedClickUpData> {
    try {
        // 1) Fetch Workspaces
        const workspaceRes = await fetch("/api/integrations/ClickUp/Workspaces");
        if (!workspaceRes.ok) {
            throw new Error(`Failed to fetch ClickUp workspaces (${workspaceRes.status})`);
        }

        const workspaceJson = await workspaceRes.json() as {
            teams: { id: string; name: string }[];
        };

        const workspaces: ClickUpWorkSpace[] =
            workspaceJson?.teams?.map(w => ({
                id: String(w.id),
                name: w.name,
            })) ?? [];

        if (workspaces.length === 0) {
            return { workspaces: [], spaces: [], lists: [] };
        }

        // 2) Fetch Spaces (from first workspace)
        const firstWorkspaceId = workspaces[0].id;

        const spaceRes = await fetch(
            `/api/integrations/ClickUp/spaces?teamId=${encodeURIComponent(firstWorkspaceId)}`
        );

        if (!spaceRes.ok) {
            throw new Error(`Failed to fetch ClickUp spaces (${spaceRes.status})`);
        }

        const spacesJson = await spaceRes.json() as {
            spaces: { id: string; name: string }[];
        };

        const spaces: ClickUpSpace[] =
            spacesJson?.spaces?.map(s => ({
                id: String(s.id),
                name: s.name,
            })) ?? [];

        if (spaces.length === 0) {
            return { workspaces, spaces: [], lists: [] };
        }

        // 3) Fetch Lists (from first space)
        const firstSpaceId = spaces[0].id;

        const listsRes = await fetch(
            `/api/integrations/ClickUp/lists?space=${encodeURIComponent(firstSpaceId)}`
        );

        if (!listsRes.ok) {
            throw new Error(`Failed to fetch ClickUp lists (${listsRes.status})`);
        }

        const listsJson = await listsRes.json() as {
            lists: { id: string; name: string }[];
        };

        const lists: ClickUpList[] =
            listsJson?.lists?.map(l => ({
                id: String(l.id),
                name: l.name,
            })) ?? [];

        return { workspaces, spaces, lists };
    } catch (err) {
        console.error("Error fetching ClickUp data:", err);
        return { workspaces: [], spaces: [], lists: [] };
    }
}

const ClickUpFetchFunctions = {
    FetchClickUpWorkspaceSpaceLists,
};

export default ClickUpFetchFunctions;