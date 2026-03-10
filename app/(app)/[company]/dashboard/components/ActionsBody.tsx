import { IntegrationBody } from "./IntegrationBody";
import { useContext, useState } from "react";
import { clientIsFromTeams, OpenAIActionSolutionsMapContext, ShowNotesBodyContext } from "@/app/Contexts";
import { NotesBody } from "./NotesBody";
import { Action } from "@/lib/Integrations/Types";


export const ActionsBody = ({ action, onActionComplete, isfromTeams }: { action: Action; onActionComplete: () => void; isfromTeams: boolean }) => {
    const { OpenAISolutionsMap } = useContext(OpenAIActionSolutionsMapContext)
    // const [fromTeams] = useState<boolean>()
    const { show } = useContext(ShowNotesBodyContext)

    if (show) {
        return <NotesBody></NotesBody>
    }
    if (action.integration) {
        return (
            <div>
                <clientIsFromTeams.Provider value={{ fromTeams: isfromTeams }}>
                    <IntegrationBody
                        IntegrationOption={action.integration}
                        responseType={action.responseType}  // ← ny prop
                        onActionComplete={onActionComplete}

                    />
                </clientIsFromTeams.Provider >
            </div >
        )
    }

    return <div>ActionsBody</div>;
}