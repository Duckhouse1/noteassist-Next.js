import { EmailDraft } from "@/app/types/OpenAI";
import { IntegrationBody } from "./IntegrationBody";
import { OutLookDraft } from "./IntegrationBodys//Outlook/OutLookDraft";
import { useContext } from "react";
import { OpenAIActionSolutionsMapContext, ShowNotesBodyContext } from "@/app/Contexts";
import { NotesBody } from "./NotesBody";
import { Action } from "@/lib/Integrations/Types";


export const ActionsBody = ({ action, onActionComplete }: { action: Action; onActionComplete: () => void; }) => {
    const { OpenAISolutionsMap } = useContext(OpenAIActionSolutionsMapContext)
    const { show } = useContext(ShowNotesBodyContext)

    if (show) {
        return <NotesBody></NotesBody>
    }
    if (action.integration) {
        return (
            <div>
                <IntegrationBody IntegrationOption={action.integration} onActionComplete={onActionComplete} />
            </div >
        )
    }

    return <div>ActionsBody</div>;
}