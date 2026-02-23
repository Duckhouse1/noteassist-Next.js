import { createContext } from "react";
import { OpenAIResponse } from "./types/OpenAI";
import { IntegrationConfigItem, OrganisationMode } from "./(app)/[company]/dashboard/dashboardClient";
import { ConfigState, DEFAULT_CONFIG } from "./(app)/[company]/dashboard/sections/ConfigurationPage";
// import { DevOpsProjectsProps } from "./Services/DevOpsServices/Fetchservice";
// import { DevOpsArea, DevOpsIteration } from "./(app)/[company]/dashboard/components/IntegrationBodys/DevOps/DevOpsPreBody";

// GENERAL -------------------------------------------------
interface UserConfigProps{
    configs: IntegrationConfigItem[]
}
export const UserConfigContext = createContext<UserConfigProps>({
    configs: []
})
interface OrganizationModeProp{
    mode: OrganisationMode
}
export const OrganizationModeContext = createContext<OrganizationModeProp>({
    mode: "personal"
})

interface SaveRequirredProp{
    requirred:boolean
    setRequirred: (requirred: boolean) => void
}

export const SaveRequirredContext = createContext<SaveRequirredProp>({
    requirred:false,
    setRequirred: () => {}
})
interface LoadingContextProps {
    isLoading: boolean;
    setIsLoading: (loading: boolean) => void;
}
export const LoadingContext = createContext<LoadingContextProps>({
    isLoading: false,
    setIsLoading: () => { },
});
//DEVOPS ----------------------------------------------------



export type OpenAIActionSolutionsMapContextProps = {
    OpenAISolutionsMap: Map<string, OpenAIResponse>;
    setOpenAISolutionsMap: (key: string, value: OpenAIResponse) => void;
};

export const OpenAIActionSolutionsMapContext =
    createContext<OpenAIActionSolutionsMapContextProps>({
        OpenAISolutionsMap: new Map<string, OpenAIResponse>(),
        setOpenAISolutionsMap: () => { },
    });

interface NotesContextProps {
    notes: string
    setNotes: (notes: string) => void
}

export const NotesContext = createContext<NotesContextProps>({
    notes: "",
    setNotes: () => { }
})

interface ShowNotesBodyProps {
    show: boolean,
    setShowNoteBody: (show: boolean) => void
}

export const ShowNotesBodyContext = createContext<ShowNotesBodyProps>({
    show: false,
    setShowNoteBody: () => { }
})


// JIRA -------------------------------------------------------------------------------