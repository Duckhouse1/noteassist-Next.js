import { ComponentType } from "react";
import { OpenAIResponse } from "@/app/types/OpenAI";
import { ProviderId } from "@/lib/Integrations/ProviderUserConfigs";
import { DevOpsPreBody } from "./DevOps/DevOpsPreBody";
import { JiraPreBody } from "./Jira/JiraPreBody";
import ClickUpPreBody from "./ClickUp/ClickUpPreBody";
import { OutLookDraft } from "./Outlook/OutLookDraft";
import { OutlookMeetingPreBody } from "./Outlook/OutlookMeetingPreBody";

// Hver integration definerer selv hvordan den skal renderes og oprettes.
// For at tilføje en ny integration: tilføj en ny entry her — rør ikke IntegrationBody.

export type IntegrationRegistryEntry = {
    // Komponenten der vises som preview inden oprettelse
    component: ComponentType<{ integrationKey: string; responseType: string }>;
    // Hvilken OpenAIResponse-type denne entry svarer til
    responseType: OpenAIResponse["type"];

    // Vis den generiske "Create"-knap (false = komponenten håndterer det selv)
    showCreateButton: boolean;

    // Label på knappen, fx "Create in Azure DevOps"
    createLabel?: string;

    // Selve oprettelseslogikken — kaldes når brugeren trykker på knappen
    createFn?: (response: OpenAIResponse) => Promise<void>;
};

// Outlook er speciel: den har to response-typer og ingen fælles create-knap.
// Derfor har den to entries under samme providerId.
export type IntegrationRegistry = Partial<Record<ProviderId, IntegrationRegistryEntry[]>>;

export const integrationRegistry: IntegrationRegistry = {
    "azure-devops": [
        {
            component: DevOpsPreBody,
            responseType: "devops_tasks",
            showCreateButton: true,
            createLabel: "Create in Azure DevOps",
            createFn: async (response) => {
                if (response.type !== "devops_tasks") return;
                await fetch("/api/integrations/azure-devops/CreateWorkItems", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ elements: response.content.elements }),
                });
            },
        },
    ],

    jira: [
        {
            component: JiraPreBody,
            responseType: "jira_tasks",
            showCreateButton: true,
            createLabel: "Create in Jira",
            createFn: async (response) => {
                if (response.type !== "jira_tasks") return;
                await fetch("/api/integrations/jira/createIssues", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        elements: response.content.elements
                    }),
                });
            },
        },
    ],

    clickup: [
        {
            component: ClickUpPreBody,
            responseType: "clickup_tasks",
            showCreateButton: true,
            createLabel: "Create in ClickUp",
            createFn: async (response) => {
                if (response.type !== "clickup_tasks") return;
                await fetch("/api/integrations/ClickUp/CreateTasks", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ elements: response.content.elements }),
                });
            },
        },
    ],
    outlook: [
        {
            component: OutLookDraft,
            responseType: "email_draft",
            showCreateButton: false,
        },
        {
            component: OutlookMeetingPreBody,
            responseType: "outlook_meeting",
            showCreateButton: false,
        },
    ],
};