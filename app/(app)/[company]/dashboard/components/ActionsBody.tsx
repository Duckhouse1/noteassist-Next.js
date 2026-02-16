// import { ActionKey } from "../pages/ConfigurationPage";
import { EmailDraft, OpenAIResponse } from "@/app/types/OpenAI";
import { Action } from "../sections/frontPage";
import { IntegrationBody } from "./IntegrationBody";
import { OutLookDraft } from "./IntegrationBodys/OutLookDraft";
import { act, useContext } from "react";
import { NotesContext, OpenAIActionSolutionsMapContext, ShowNotesBodyContext } from "@/app/Contexts";
import { NotesBody } from "./NotesBody";






export const ActionsBody = ({ action }: { action: Action; }) => {
    const { OpenAISolutionsMap } = useContext(OpenAIActionSolutionsMapContext)
    const { show } = useContext(ShowNotesBodyContext)



    if (show) {
        return <NotesBody></NotesBody>
    }
    if (action.key === "integrations" && action.integration) {
        return (
            <div>
                <IntegrationBody IntegrationOption={action.integration} />
                <button className="ml-4 mt-3 p-2 px-7 cursor-pointer rounded-2xl bg-blue-950 text-white font-semibold">Create in {action.integration}</button>

            </div>
        )
    }
    if (action.key === "email_outlook_draft") {
        const emailDraft = OpenAISolutionsMap.get(action.key)?.content as EmailDraft;
        console.log("Dette er draftet", emailDraft);
        return (
            <OutLookDraft emailDraft={emailDraft} />
        )
    }
    return <div>ActionsBody</div>;
}