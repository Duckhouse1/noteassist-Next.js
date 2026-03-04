import { Action } from "../Types";




export const AllADOActions: Action[] = [
    {
        key: "ado.createWorkItems",
        title: "Create work items",
        description: "Create work items in specific project, area and iterations",
        createText: "Create work items",
        integration: "azure-devops",
        responseType: "devops_tasks"
    },
]