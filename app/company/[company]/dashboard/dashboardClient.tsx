"use client";

import { useMemo, useRef, useState } from "react";
import { FrontPage } from "./pages/frontPage";
import ActionsPage from "./pages/ActionsPage";
import { SettingsHoverMenu } from "./components/ConfigDropDown";
import {
    ConfigurationPage,
    DEFAULT_CONFIG,
    type ConfigState,
} from "./pages/ConfigurationPage";
import { ActionsMockData } from "./components/ActionsMockData";
import type { Action } from "./pages/frontPage";
import { CorporateLoader } from "@/app/Components/LoadingIcon";
import { LoadingContext, NotesContext, OpenAIActionSolutionsMapContext } from "@/app/Contexts";
import OpenAIService from "@/app/Services/OpenAIService";
import { OpenAIResponse } from "@/app/types/OpenAI";

export type Pages = "frontpage" | "configurations" | "actions";

export default function DashboardClient({ company }: { company: string }) {
    const [selectedActions, setSelectedActions] = useState<Action[]>([]);
    const [currentPage, setCurrentPage] = useState<Pages>("frontpage");
    const [notes, setNotes] = useState<string>("");
    const [config, setConfig] = useState<ConfigState>(DEFAULT_CONFIG);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    // In DashboardClient
    // const [openAIResponses, setOpenAIResponses] = useState<OpenAIResponse[]>([]);
    const [actionAISolutions, setActionAISolutions] = useState<Map<string, OpenAIResponse>>(new Map());


    const goToActionsPageClickHandler = () => {
        setIsLoading(true);

        Promise.all(
            selectedActions.map(action =>
                OpenAIService.extractInfoBasedOnAction(notes, action).then(response => ({
                    action,
                    response
                }))
            )
        )
            .then((results) => {
                console.log("OpenAI results", results);
                // Create a map of action key to response
                const responseMap = new Map<string, OpenAIResponse>();
                results.forEach(({ action, response }) => {
                    if (action.integration != null) {
                        responseMap.set(action.integration, response);
                    } else {
                        responseMap.set(action.key, response);
                    }
                });

                setActionAISolutions(responseMap);
                setIsLoading(false);
                setCurrentPage("actions");
            })
            .catch((error) => {
                console.error("Error extracting tasks:", error);
                setIsLoading(false);
            });
    };
    // ✅ Derive the actions that should be visible on the frontpage
    const availableActions = useMemo(() => {
        return ActionsMockData.filter((action) => {
            if (action.key === "integrations") {
                return (
                    config.enabledActions.integrations &&
                    !!action.integration &&
                    config.enabledProviders.includes(action.integration)
                );
            }
            return config.enabledActions[action.key];
        });
    }, [config]);

    return (
        <OpenAIActionSolutionsMapContext.Provider value={{ OpenAISolutionsMap: actionAISolutions, setOpenAISolutionsMap: setActionAISolutions }}>
            <main className="min-h-screen bg-slate-50">
                {/* Top navigation stays white */}
                <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white backdrop-blur">
                    <div className="mx-auto w-full flex items-center justify-between
                max-w-7xl 2xl:max-w-[1550px]
                px-4 sm:px-6 lg:px-8 py-4">
                        <div className="flex items-center gap-3">
                            <div
                                className="h-9 w-9 cursor-pointer rounded-xl bg-blue-900 shadow-sm"
                                onClick={() => setCurrentPage("frontpage")}
                            />
                            <div>
                                <p className="text-sm font-semibold tracking-tight text-slate-900">
                                    ActionNotes
                                </p>
                                <p className="text-xs text-slate-500">Workspace</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <SettingsHoverMenu onConfigurations={() => setCurrentPage("configurations")} />
                            <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-700">
                                {company}
                            </span>
                            <div className="h-9 w-9 rounded-full bg-slate-200" />
                        </div>
                    </div>
                </header>
                <LoadingContext.Provider value={{ isLoading, setIsLoading }}>
                    <NotesContext.Provider value={{ notes: notes, setNotes: setNotes }}>
                        {isLoading && <CorporateLoader size={220} className="absolute inset-0 z-50 m-auto" title="Mapping notes into actions" />}
                        {/* Pages */}
                        {!isLoading && currentPage === "frontpage" && (
                            <div className="mx-auto w-full max-w-7xl 2xl:max-w-[1600px] bg-slate-50 px-4 sm:px-6 lg:px-8 py-0">
                                <FrontPage
                                    company={company}
                                    setCurrentPage={setCurrentPage}
                                    selectedActions={selectedActions}
                                    setSelectedActions={setSelectedActions}
                                    actions={availableActions}   // ✅ pass filtered actions
                                    notes={notes}
                                    setNotes={setNotes}
                                    onGoToActionsPageClick={() => {
                                        goToActionsPageClickHandler();
                                    }
                                    }
                                />
                            </div>
                        )}

                        {currentPage === "configurations" && (
                            <ConfigurationPage
                                value={config}
                                onChange={setConfig}
                                onSave={(cfg) => {
                                    // later: persist per company
                                    console.log("save config", cfg);
                                }}
                            />
                        )}

                        {currentPage === "actions" &&
                            <ActionsPage selectedActions={selectedActions} onGoToFrontPage={() => {

                                setCurrentPage("frontpage")
                                setSelectedActions([])
                                setNotes("")
                            }}
                            />}

                    </NotesContext.Provider>
                </LoadingContext.Provider>
            </main>
        </OpenAIActionSolutionsMapContext.Provider>
    );
}
