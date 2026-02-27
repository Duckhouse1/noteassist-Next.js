import { Action } from "../Types";

export const AllJiraActions: Action[] = [
    {
        key: "jira.createIssues",
        title: "Create Jira issues",
        description: "Extract tasks from your notes and create issues in Jira",
        createText: "Create Jira issues",
        integration: "jira",
    },
];