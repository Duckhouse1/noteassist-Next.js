import { createContext } from "react";
import { OpenAIResponse } from "./types/OpenAI";





interface LoadingContextProps {
    isLoading: boolean;
    setIsLoading: (loading: boolean) => void;
}
export const LoadingContext = createContext<LoadingContextProps>({
    isLoading: false,
    setIsLoading: () => {},
});


export type OpenAIActionSolutionsMapContextProps = {
  OpenAISolutionsMap: Map<string, OpenAIResponse>;
  setOpenAISolutionsMap: (key: string, value: OpenAIResponse) => void;
};

export const OpenAIActionSolutionsMapContext =
  createContext<OpenAIActionSolutionsMapContextProps>({
    OpenAISolutionsMap: new Map<string, OpenAIResponse>(),
    setOpenAISolutionsMap: () => {},
  });


interface NotesContextProps{
    notes: string
    setNotes: (notes:string) => void
}

export const NotesContext = createContext<NotesContextProps>({
    notes:"",
    setNotes:() => {}
})


interface ShowNotesBodyProps{
    show:boolean,
    setShowNoteBody: (show: boolean) => void
}

export const ShowNotesBodyContext = createContext<ShowNotesBodyProps>({
    show:false,
    setShowNoteBody: () => {}
})