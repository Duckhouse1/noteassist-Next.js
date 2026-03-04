import { Action } from "../Types";





export const AllClickUpActions: Action[] = [
    {
        title: "Create new ClickUp tasks",
        key: "clickup.createtasks",
        description: "Create ClickUp Actions directly from your notes",
        createText: "Create tasks",
        integration:"clickup",
        responseType:"clickup_tasks"
    }
]