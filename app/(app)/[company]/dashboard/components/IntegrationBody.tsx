import { useContext } from "react"
import { DevOpsPreBody } from "./IntegrationBodys/DevOps/DevOpsPreBody"
import { ActionExecutionContext, OpenAIActionSolutionsMapContext } from "@/app/Contexts"
import { ProviderId } from "@/lib/Integrations/Types"
import { OutLookDraft } from "./IntegrationBodys/Outlook/OutLookDraft"
import { DevOpsResponse } from "@/app/types/OpenAI"
import { JiraPreBody } from "./IntegrationBodys/Jira/JiraPreBody"



export const IntegrationBody = ({ IntegrationOption, onActionComplete }: { IntegrationOption: ProviderId; onActionComplete: () => void; }) => {
    const { OpenAISolutionsMap } = useContext(OpenAIActionSolutionsMapContext)
    const { isExecuting, isCompleted, executeAction } = useContext(ActionExecutionContext)
    const response = OpenAISolutionsMap.get(IntegrationOption)

    const handleCreate = async () => {
        if (isExecuting || isCompleted) return;

        // Signal parent that execution started (updates step circle)
        executeAction();

        try {
            const data = response?.content as DevOpsResponse
             if (IntegrationOption === "jira") {
                await fetch("/api/integrations/jira/createIssues", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        elements: data.elements,
                        cloudId: "", // TODO: read from user config
                        projectKey: "", // TODO: read from user config
                    })
                })
            } else {
            await fetch("/api/integrations/azure-devops/CreateWorkItems", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    elements: data.elements
                })
            })
        }
        } catch (err) {
            console.error("Action failed:", err)
        } finally {
            // Signal parent that execution finished (marks completed, advances step)
            onActionComplete();
        }
    }

    return (
        <>
            {response?.type === "devops_tasks" && (
                <>
                    <DevOpsPreBody integrationKey={IntegrationOption} />
                    <button
                        className={[
                            "ml-4 mt-3 p-2 px-7 rounded-2xl font-semibold transition-all duration-300 inline-flex items-center gap-2",
                            isCompleted
                                ? "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-300 cursor-default"
                                : isExecuting
                                    ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                                    : "bg-black text-white cursor-pointer hover:bg-gray-800",
                        ].join(" ")}
                        disabled={isExecuting || isCompleted}
                        onClick={handleCreate}
                    >
                        {isExecuting ? (
                            <>
                                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
                                    <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                                </svg>
                                Creating…
                            </>
                        ) : isCompleted ? (
                            <>
                                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none">
                                    <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                Performed
                            </>
                        ) : (
                            <>Create in {IntegrationOption}</>
                        )}
                    </button>
                </>
            )}
            {IntegrationOption === "outlook" && response?.type === "email_draft" && (
                <>
                    <OutLookDraft emailDraft={response.content} />
                </>
            )}
            {response?.type === "jira_tasks" && (
                <>
                    <JiraPreBody integrationKey={IntegrationOption} />
                    <button
                        className={[
                            "ml-4 mt-3 p-2 px-7 rounded-2xl font-semibold transition-all duration-300 inline-flex items-center gap-2",
                            isCompleted
                                ? "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-300 cursor-default"
                                : isExecuting
                                    ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                                    : "bg-black text-white cursor-pointer hover:bg-gray-800",
                        ].join(" ")}
                        disabled={isExecuting || isCompleted}
                        onClick={handleCreate}
                    >
                        {isExecuting ? (
                            <>
                                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
                                    <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                                </svg>
                                Creating…
                            </>
                        ) : isCompleted ? (
                            <>
                                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none">
                                    <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                Performed
                            </>
                        ) : (
                            <>Create in Jira</>
                        )}
                    </button>
                </>
            )}

        </>
    )
}