// import { ActionKey } from "../pages/ConfigurationPage";
import { Action } from "../pages/frontPage";
import { IntegrationBody } from "./IntegrationBody";






export const ActionsBody = ({ action }: { action: Action }) => {


    if (action.key === "integrations" && action.integration) {
        return (
            <IntegrationBody IntegrationOption={action.integration} />
        )
    }
    if (action.key === "email_outlook_draft") {
        return (
            <div>
                Email Outlook Draft ActionsBody
            </div>
        )
    }
    return <div>ActionsBody</div>;
}