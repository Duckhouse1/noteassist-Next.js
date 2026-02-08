import { useContext, useEffect } from "react"
import { IntegrationOptions } from "../pages/ConfigurationPage"
import { DevOpsPreBody } from "./IntegrationBodys/DevOpsPreBody"
import { OpenAIActionSolutionsMapContext, ShowNotesBodyContext } from "@/app/Contexts"
import { NotesBody } from "./NotesBody"

export const IntegrationBody = ({ IntegrationOption }: { IntegrationOption: IntegrationOptions }) => {
    const { OpenAISolutionsMap } = useContext(OpenAIActionSolutionsMapContext)

    useEffect(() => {
        console.log("IntegrationBody OpenAISolutionsMap:", OpenAISolutionsMap);
        console.log("OpenAISolutionsMap.get('Azure DevOps'):", OpenAISolutionsMap.get("Azure DevOps"));
    }, [OpenAISolutionsMap]);

    
    if (IntegrationOption === "Azure DevOps") {
        const response = OpenAISolutionsMap.get(IntegrationOption)
        if (response?.type === "devops_tasks") {
            return (
                <DevOpsPreBody integrationKey={IntegrationOption} />
            )
        }

    }
    if (IntegrationOption === "ClickUp") {
        return (
            <div className="p-4">
                <h2 className="text-lg font-semibold text-slate-900">ClickUp Integration Settings</h2>
            </div>
        )
    }
    if (IntegrationOption === "Jira") {
        return (
            <div className="p-4">
                <h2 className="text-lg font-semibold text-slate-900">Jira Integration Settings</h2>
            </div>
        )
    }
    return (
        <div className="p-4">
            <h2 className="text-lg font-semibold text-slate-900">No integration selected</h2>
        </div>
    )
}