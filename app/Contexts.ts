import { createContext, Dispatch, SetStateAction } from "react";
import { OpenAIResponse } from "./types/OpenAI";
import { OrganisationMode, Pages } from "./(app)/[company]/dashboard/dashboardClient";
import { Note } from "./(app)/[company]/dashboard/sections/MyNotesPage";
import { ProviderConfigItem } from "@/lib/Integrations/ProviderUserConfigs";
// import { DevOpsProjectsProps } from "./Services/DevOpsServices/Fetchservice";
// import { DevOpsArea, DevOpsIteration } from "./(app)/[company]/dashboard/components/IntegrationBodys/DevOps/DevOpsPreBody";

// GENERAL -------------------------------------------------
interface UserConfigProps {
  configs: ProviderConfigItem[];
  setConfigs: React.Dispatch<React.SetStateAction<ProviderConfigItem[]>>;
}

export const UserConfigContext = createContext<UserConfigProps>({
  configs: [],
  setConfigs: () => {},
});
interface OrganizationModeProp {
    mode: OrganisationMode
}
export const OrganizationModeContext = createContext<OrganizationModeProp>({
    mode: "personal"
})

interface SaveRequirredProp {
    requirred: boolean
    setRequirred: (requirred: boolean) => void
}

export const SaveRequirredContext = createContext<SaveRequirredProp>({
    requirred: false,
    setRequirred: () => { }
})
interface LoadingContextProps {
    isLoading: boolean;
    setIsLoading: (loading: boolean) => void;
}
export const LoadingContext = createContext<LoadingContextProps>({
    isLoading: false,
    setIsLoading: () => { },
});


interface CurrentSite{
    currentPage: Pages,
    setCurrentPage: Dispatch<SetStateAction<Pages>>
}
export const CurrentSiteContext = createContext<CurrentSite>({
    currentPage: "frontpage",
    setCurrentPage: () => {}
})
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
    notes: Note | null
    setNotes: (notes: Note) => void
}

export const NotesContext = createContext<NotesContextProps>({
    notes: {title:"",content:"",id:null},
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


// ACTION EXECUTION -------------------------------------------------------------------
interface ActionExecutionContextProps {
    isExecuting: boolean;
    isCompleted: boolean;
    executeAction: () => Promise<void>;
}

export const ActionExecutionContext = createContext<ActionExecutionContextProps>({
    isExecuting: false,
    isCompleted: false,
    executeAction: async () => {},
});

// JIRA -------------------------------------------------------------------------------