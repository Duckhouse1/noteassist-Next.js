import type { IntegrationOptions } from "../pages/ConfigurationPage";
import type { ActionKey } from "../pages/ConfigurationPage";
import { Action } from "../pages/frontPage";

export const ActionsMockData: Action[] = [
    // ─────────────────────────────
    // Integrations
    // ─────────────────────────────
    {
        key: "integrations",
        title: "Integrate with Azure DevOps",
        description:
            "Push notes, tasks, and decisions directly into Azure DevOps.",
        integration: "Azure DevOps",
        createText: "Create in Azure DevOps",
    },
    {
        key: "integrations",
        title: "Integrate with ClickUp",
        description:
            "Create and update ClickUp tasks automatically from your notes.",
        integration: "ClickUp",
        createText: "Create in ClickUp",
    },
    // {
    //     key: "integrations",
    //     title: "Integrate with SharePoint",
    //     description:
    //         "Store and organize notes and files in SharePoint libraries.",
    //     integration: "SharePoint",
    //     createText: "Create in SharePoint",
    // },
    {
        key: "integrations",
        title: "Integrate with Jira",
        description:
            "Turn action items into Jira tickets in seconds.",
        integration: "Jira",
        createText: "Create in Jira",
    },
    // {
    //     key: "integrations",
    //     title: "Integrate with Notion",
    //     description:
    //         "Sync notes and summaries into Notion databases.",
    //     integration: "Notion",
    //     createText: "Create in Notion",
    // },

    // ─────────────────────────────
    // Other actions
    // ─────────────────────────────
    {
        key: "email_outlook_draft",
        title: "Create Outlook email draft",
        description:
            "Generate a structured Outlook email draft based on your notes.",
        createText: "Send email",
    },

    {
        key: "schedule_outlook_meeting",
        title: "Schedule Outlook meeting",
        description:
            "Create a scheduled meeting in Outlook.",
        createText: "Schedule meeting",
    },
    {
        key: "task_list",
        title: "Task list",
        description:
            "Extract tasks with owners and due dates from notes.",
        createText: "Generate task list",
    },
    {
        key: "attach_photo",
        title: "Attach photo",
        description:
            "Include photos as input for notes and action generation.",
        createText: "Attach photo",
    },
];