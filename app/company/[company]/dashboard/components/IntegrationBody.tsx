import { IntegrationOptions } from "../pages/ConfigurationPage"
import { DevOpsPreBody } from "./IntegrationBodys/DevOpsPreBody"

export const IntegrationBody = ({IntegrationOption} : {IntegrationOption: IntegrationOptions}) => {


    if (IntegrationOption === "Azure DevOps") {
        return (
            <DevOpsPreBody />
        )
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