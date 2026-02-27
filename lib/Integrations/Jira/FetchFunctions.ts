import { JiraCloudSite, JiraProject, JiraIssueType } from "./Configuration";

export interface FetchedJiraData {
    sites: JiraCloudSite[];
    projects: JiraProject[];
}

async function FetchJiraData(): Promise<FetchedJiraData> {
    try {
        // 1) Fetch accessible cloud sites
        const sitesRes = await fetch("/api/integrations/jira/sites");
        if (!sitesRes.ok) {
            throw new Error(`Failed to fetch Jira sites (${sitesRes.status})`);
        }
        const sitesJson = await sitesRes.json() as { sites: JiraCloudSite[] };
        const sites = sitesJson.sites ?? [];

        if (sites.length === 0) {
            return { sites: [], projects: [] };
        }

        // 2) Fetch projects for first site
        const cloudId = sites[0].id;
        const projRes = await fetch(`/api/integrations/jira/projects?cloudId=${encodeURIComponent(cloudId)}`);
        if (!projRes.ok) {
            throw new Error(`Failed to fetch Jira projects (${projRes.status})`);
        }
        const projects = (await projRes.json()) as JiraProject[];

        return { sites, projects };
    } catch (err) {
        console.error("Error fetching Jira data:", err);
        return { sites: [], projects: [] };
    }
}

const JiraFetchFunctions = {
    FetchJiraData,
};

export default JiraFetchFunctions;