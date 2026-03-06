// types/OpenAI.ts

import { ClickUpAIResponse } from "@/lib/Integrations/ClickUp/Configuration"
import { DevOpsArea, DevOpsIteration } from "../(app)/[company]/dashboard/components/IntegrationBodys/DevOps/DevOpsPreBody"
import { DevOpsProjectsProps } from "../Services/DevOpsServices/Fetchservice"

// Specific response types

export type DevOpsTaskTypes = "Features"

export interface Assignee {
    identity: {
        id: string
        displayName: string
        uniqueName: string
        imageUrl: string
    }
}

export interface DevOpsFeature {
    id: string;
    title: string;
    description: string;
    Assignee?: Assignee;
    Project?: DevOpsProjectsProps;
    Area?: DevOpsArea;
    Iteration?: DevOpsIteration;
    pbis: DevOpsPBI[];
}

export interface DevOpsPBI {
    id: string;
    title: string;
    description: string;
    Assignee?: Assignee;
    Project?: DevOpsProjectsProps;
    Area?: DevOpsArea;
    Iteration?: DevOpsIteration;
    tasks: DevOpsTask[];
}

export interface DevOpsTask {
    id: string;
    title: string;
    description: string;
    Assignee?: Assignee
    Project?: DevOpsProjectsProps;
    Area?: DevOpsArea;
    Iteration?: DevOpsIteration;
}

export interface DevOpsResponse {
    elements: DevOpsElement[];
}

export type DevOpsElement = {
    id: string;
    type: string;        // must match one of userConfig types exactly
    title: string;
    description: string;
    children: DevOpsElement[];
    Assignee?: Assignee
    Project?: DevOpsProjectsProps;
    Area?: DevOpsArea;
    Iteration?: DevOpsIteration;
};

// ── Jira ──────────────────────────────────────────────────────────────────────

export type JiraElement = {
    id: string;
    type: string;
    title: string;
    description: string;
    children: JiraElement[];
    cloudId?: string;
    cloudName?: string;
    projectKey?: string;
    projectName?: string;
};

export interface JiraTasksContent {
    elements: JiraElement[];
}

// ── Other types ───────────────────────────────────────────────────────────────

export interface EmailDraft {
    subject: string;
    body: string;
    recipients: string[];
}

export interface OutlookMeeting {
    title: string;
    description: string;
    startDateTime: string;   // ISO 8601, e.g. "2025-04-10T14:00:00"
    endDateTime: string;     // ISO 8601
    attendees: string[];     // email addresses
    location?: string;
    isOnlineMeeting: boolean;
}

export interface MeetingSummary {
    title: string;
    keyPoints: string[];
    actionItems: string[];
    attendees?: string[];
}

export interface TaskList {
    tasks: Array<{
        id: string;
        title: string;
        priority: "high" | "medium" | "low";
        dueDate?: string;
    }>;
}

// Union type for all possible OpenAI response content types
export type OpenAIContentType =
    | DevOpsResponse
    | EmailDraft
    | MeetingSummary
    | TaskList
    | ClickUpAIResponse
    | OutlookMeeting

// Discriminated union for typed responses
export type OpenAIResponse =
    | { type: "devops_tasks"; content: DevOpsResponse }
    | { type: "jira_tasks"; content: JiraTasksContent }
    | { type: "email_draft"; content: EmailDraft }
    | { type: "clickup_tasks"; content: ClickUpAIResponse }
    | { type: "outlook_meeting"; content: OutlookMeeting }
// | { type: "meeting_summary"; content: MeetingSummary }
// | { type: "task_list"; content: TaskList };