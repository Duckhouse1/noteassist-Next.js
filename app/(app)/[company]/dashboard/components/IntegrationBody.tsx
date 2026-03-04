import { useContext } from "react";
import { ActionExecutionContext, OpenAIActionSolutionsMapContext } from "@/app/Contexts";
import { ProviderId } from "@/lib/Integrations/ProviderUserConfigs";
import { integrationRegistry } from "./IntegrationBodys/Integrationregistry";


export const IntegrationBody = ({ IntegrationOption, responseType, onActionComplete, }: {
    IntegrationOption: ProviderId;
    responseType?: string;
    onActionComplete: () => void;
}) => {

    const { OpenAISolutionsMap } = useContext(OpenAIActionSolutionsMapContext);
    const { isExecuting, isCompleted, executeAction } = useContext(ActionExecutionContext);

    const response = OpenAISolutionsMap.get(IntegrationOption);
    const entries = integrationRegistry[IntegrationOption] ?? [];

    // Find den entry hvis responseType matcher det AI returnerede
    const responses = OpenAISolutionsMap.get(IntegrationOption) ?? [];
    const matchedEntries = entries.filter(entry =>
        responses.some(r => r.type === entry.responseType) &&
        (responseType ? entry.responseType === responseType : true)
    );

    if (matchedEntries.length === 0) return null;

    return (
        <>
            {matchedEntries.map((entry) => {
                const response = responses.find(r => r.type === entry.responseType)!;

                const handleCreate = async () => {
                    if (isExecuting || isCompleted) return;
                    executeAction();
                    try {
                        await entry.createFn?.(response);
                    } catch (err) {
                        console.error("Action failed:", err);
                    } finally {
                        onActionComplete();
                    }
                };

                const PreBody = entry.component;

                return (
                    <div key={entry.responseType}>
                        <PreBody integrationKey={IntegrationOption} responseType={entry.responseType} />
                        {entry.showCreateButton && (
                            <CreateButton
                                isExecuting={isExecuting}
                                isCompleted={isCompleted}
                                onClick={handleCreate}
                                label={entry.createLabel ?? `Create in ${IntegrationOption}`}
                            />
                        )}
                    </div>
                );
            })}
        </>
    );
}
type CreateButtonProps = {
    isExecuting: boolean;
    isCompleted: boolean;
    onClick: () => void;
    label: string;
};

export function CreateButton({ isExecuting, isCompleted, onClick, label }: CreateButtonProps) {
    return (
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
            onClick={onClick}
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
                <>{label}</>
            )}
        </button>
    );
}
