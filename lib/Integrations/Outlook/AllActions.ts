import { Action } from "../Types";

export const AllOutlookActions: Action[] = [
    {
        key: "outlook.EmailDraft",
        title: "Write email draft",
        description: "Create an email draft based on your notes",
        createText: "Create outlook email draft",
        integration: "outlook"
    },
    {
        key: "outlook.ScheduleMeeting",
        title: "Schedule Outlook meeting",
        description: "Create a new calendar meeting based on your notes",
        createText: "Schedule meeting in Outlook",
        integration: "outlook"
    },
]