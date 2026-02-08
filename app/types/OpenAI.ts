// types/OpenAI.ts

// Specific response types

export type DevOpsTaskTypes = "Features"

export interface Assignee {
    id: string
    name:string
}

export interface DevOpsFeature {
    id: string;
    title: string;
    description: string;
    Assignee?: Assignee
    pbis: DevOpsPBI[];
}

export interface DevOpsPBI {
    id: string;
    title: string;
    description: string;
    Assignee?: Assignee
    tasks: DevOpsTask[];
}

export interface DevOpsTask {
    id: string;
    title: string;
    description: string;
    Assignee?: Assignee

}

export interface DevOpsResponse {
    features: DevOpsFeature[];
}

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
    | { type: "meeting_summary"; content: MeetingSummary }
    | { type: "task_list"; content: TaskList };