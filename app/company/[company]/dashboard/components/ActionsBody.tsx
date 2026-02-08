// import { ActionKey } from "../pages/ConfigurationPage";
import { EmailDraft, OpenAIResponse } from "@/app/types/OpenAI";
import { Action } from "../pages/frontPage";
import { IntegrationBody } from "./IntegrationBody";
import { OutLookDraft } from "./IntegrationBodys/OutLookDraft";
import { useContext } from "react";
import { OpenAIActionSolutionsMapContext } from "@/app/Contexts";






export const ActionsBody = ({ action }: { action: Action; }) => {
    const {OpenAISolutionsMap} = useContext(OpenAIActionSolutionsMapContext)


    if (action.key === "integrations" && action.integration) {
        return (
            <IntegrationBody IntegrationOption={action.integration} />
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