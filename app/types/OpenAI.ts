// types/OpenAI.ts

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
export interface EmailDraft {
    subject: string;
    body: string;
    recipients: string[];
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
    | TaskList;

// Discriminated union for typed responses
export type OpenAIResponse =
    | { type: "devops_tasks"; content: DevOpsResponse }
    | { type: "jira_tasks"; content: DevOpsResponse }
    | { type: "email_draft"; content: EmailDraft }
// | { type: "meeting_summary"; content: MeetingSummary }
// | { type: "task_list"; content: TaskList };