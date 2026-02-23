import { useContext, useEffect } from "react"
import { IntegrationOptions, IntegrationOptionsTitle } from "../sections/ConfigurationPage"
import { DevOpsPreBody } from "./IntegrationBodys/DevOps/DevOpsPreBody"
import { OpenAIActionSolutionsMapContext, UserConfigContext } from "@/app/Contexts"

export const IntegrationBody = ({ IntegrationOption }: { IntegrationOption: IntegrationOptionsTitle }) => {
    const { OpenAISolutionsMap } = useContext(OpenAIActionSolutionsMapContext)
    const {configs} = useContext(UserConfigContext)



    if (IntegrationOption === "Azure-Devops") {
        const response = OpenAISolutionsMap.get(IntegrationOption)
        if (response?.type === "devops_tasks") {
            return (
                <>
                
                    <DevOpsPreBody integrationKey={IntegrationOption} />

                    <button
                        className="ml-4 mt-3 p-2 px-7 cursor-pointer rounded-2xl bg-blue-950 text-white font-semibold"
                        onClick={async () => {
                            const data = response.content
                            console.log("Her har vi vores data: ");
                            console.log(data);
                            await fetch("/api/integrations/azure-devops/CreateWorkItems", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({
                                    element:data.elements[0]
                                })

                            })
                        }} >

                        Create in {IntegrationOption}
                    </button>
                </>
            )
        }

    }
    // if (IntegrationOption.title === "ClickUp") {
    //     return (
    //         <div className="p-4">
    //             <h2 className="text-lg font-semibold text-slate-900">ClickUp Integration Settings</h2>
    //         </div>
    //     )
    // }
    // if (IntegrationOption === "Jira") {
    //     return (
    //         <div className="p-4">
    //             <h2 className="text-lg font-semibold text-slate-900">Jira Integration Settings</h2>
    //         </div>
    //     )
    // }
    return (
        <div className="p-4">
            <h2 className="text-lg font-semibold text-slate-900">No integration selected</h2>
        </div>
    )
}