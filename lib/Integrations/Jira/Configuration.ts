export type JiraSettings = {
    /** Atlassian Cloud site id (from accessible-resources) */
    defaultCloudId: string;
    /** Project key, e.g. "PROJ" */
    defaultProjectKey: string;
    /** Issue type names to use when creating, e.g. ["Epic","Story","Task"] */
    defaultIssueTypes: string[];
};

export interface JiraCloudSite {
    id: string;
    name: string;
    url: string;
    scopes: string[];
    avatarUrl: string;
}

export interface JiraProject {
    id: string;
    key: string;
    name: string;
    style: string;
}

export interface JiraIssueType {
    id: string;
    name: string;
    subtask: boolean;
    description?: string;
    iconUrl?: string;
}

export const DEFAULT_JIRA_SETTINGS: JiraSettings = {
    defaultCloudId: "",
    defaultProjectKey: "",
    defaultIssueTypes: [],
};