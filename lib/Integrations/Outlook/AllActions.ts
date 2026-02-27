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
        key: "OutLook.ScheduleMeeting",
        title: "Schedule new outlook meeting",
        description: "Create a new outlook meeting",
        createText: "Create new outlook meeting",
        integration: "outlook"
    },
    {
        key: "OutLook.Emailread",
        title: "Summarize Indbox",
        description: "Have ai summarize your indbox",
        createText: "Create new outlook meeting",
        integration: "outlook"
    },

]
