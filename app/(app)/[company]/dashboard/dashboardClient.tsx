"use client";

import { useMemo, useCallback, useState, useEffect, useRef } from "react";
import { FrontPage } from "./sections/frontPage";
import ActionsPage from "./sections/ActionsPage";
import { SettingsHoverMenu } from "./components/ConfigDropDown";
import {
    ConfigurationPage,
    DEFAULT_CONFIG,
    IntegrationOptionsTitle,
    type ConfigState,
} from "./sections/ConfigurationPage";
import { ActionsMockData } from "./components/ActionsMockData";
import type { Action } from "./sections/frontPage";
import { CorporateLoader } from "@/app/Components/LoadingIcon";
import { LoadingContext, NotesContext, OpenAIActionSolutionsMapContext } from "@/app/Contexts";
import OpenAIService from "@/app/Services/OpenAIService";
import { OpenAIResponse } from "@/app/types/OpenAI";
import MyNotesPage from "./sections/MyNotesPage";
import Image from "next/image";
import { Toast } from "@/app/Components/Toast";

export type Pages = "frontpage" | "configurations" | "actions" | "MyNotes";

export type DashboardMode = "personal" | "company"

export interface IntegrationConnection {
    displayName: string;
    provider: string;
}

export default function DashboardClient({ company, mode }: { company: string, mode: DashboardMode }) {
    const [selectedActions, setSelectedActions] = useState<Action[]>([]);
    const [currentPage, setCurrentPage] = useState<Pages>("frontpage");
    const [notes, setNotes] = useState<string>("");
    const [noteTitle, setNoteTitle] = useState("")
    const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);

    const [config, setConfig] = useState<ConfigState>(DEFAULT_CONFIG);
    const [IntegrationConnections, setIntegrationConnections] = useState<IntegrationConnection[]>([])
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [actionAISolutions, setActionAISolutions] = useState<Map<string, OpenAIResponse>>(() => new Map());
    const isPersonalOrg = mode === "personal"
    const showToast = (message: string, type: "success" | "error" | "info" = "info") => {
        setToast({ message, type });

        if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);

        toastTimeoutRef.current = setTimeout(() => {
            setToast(null);
        }, 2000);
    };

    const SaveNote = async () => {
        if (noteTitle.trim() === "") {
            showToast("Please enter a title before saving.", "error");
            return;
        }

        try {
            const response = await fetch("/api/notes", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text: notes, company: company, title: noteTitle }),
            });

            if (!response.ok) {
                showToast("Failed to save note. Please try again.", "error");
                return;
            }

            showToast("Note saved successfully", "success");
        } catch (error) {
            console.log("Error during note saving: " + error);
            showToast("Network error while saving note.", "error");
        }
    };

    useEffect(() => {
        return () => {
            if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
        };
    }, []);
    //Fetch user IntegrationConnections
    useEffect(() => {
        const GetIntegrationConnections = async () => {
            try {
                const response = await fetch("/api/user/IntegrationConnections", {
                    method: "GET",
                    headers: { "Content-Type": "application/json" },
                })
                console.log("dette er Integration Connections:");
                // console.log(await response.json());
                setIntegrationConnections(await response.json())
            } catch (error) {
                console.log("Error fetching IntegrationConnections: " + error);
            }
        }
        GetIntegrationConnections();
    }, [])

    const setSolutionForKey = useCallback((key: string, value: OpenAIResponse) => {
        setActionAISolutions((prev) => {
            const next = new Map(prev);
            next.set(key, value);
            return next;
        });
    }, []);


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
    

    useEffect(() => {
        return () => {
            if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
        };
    }, []);
    return (
        <OpenAIActionSolutionsMapContext.Provider
            value={{ OpenAISolutionsMap: actionAISolutions, setOpenAISolutionsMap: setSolutionForKey, }}>
            <main className="h-screen bg-slate-50 overflow-hidden flex flex-col">
                <Toast
                    message={toast?.message ?? ""}
                    type={toast?.type ?? "info"}
                    onClose={() => setToast(null)}
                />
                {/* Top navigation stays white */}
                <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white backdrop-blur">
                    <div className="mx-auto w-full flex items-center justify-between
                max-w-7xl 2xl:max-w-[1550px]
                px-4 sm:px-6 lg:px-8 py-4">
                        <div className="flex items-center gap-3">
                            <Image
                                src="/actionNotes-Logo-alone.svg"
                                alt="ActionNotes"
                                width={50}
                                height={50}
                                className="cursor-pointer"
                                onClick={() => setCurrentPage("frontpage")}
                            />

                            <div>
                                <p className="text-sm font-semibold tracking-tight text-slate-900">
                                    ActionNotes
                                </p>
                                <p className="text-xs text-slate-500">Workspace</p>
                            </div>

                        </div>
                        <div />
                        <div />
                        <div className="">
                            <button
                                className="
                                    relative cursor-pointer
                                    px-3 py-1 mr-5
                                    text-gray-500
                                    font-medium
                                    text-m
                                    transition-colors
                                    hover:text-black
                                    group
                                "
                                onClick={() => setCurrentPage("MyNotes")}>
                                My notes
                                <span
                                    className="
                                        absolute left-0 -bottom-1
                                        h-[2px] w-full
                                        bg-black
                                        scale-x-0
                                        origin-left
                                        transition-transform duration-300 ease-out
                                        group-hover:scale-x-100
                                        "
                                />
                            </button>
                        </div>
                        <div className="flex items-center gap-5">
                            {/* <div className="mr-8 flex gap-5"> */}

                            <SettingsHoverMenu onConfigurations={() => setCurrentPage("configurations")} />
                            {/* </div> */}
                            {!isPersonalOrg && (
                                <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-700">
                                    {company}
                                </span>
                            )}

                            <div className="h-9 w-9 rounded-full bg-slate-200" />
                        </div>
                    </div>
                </header>
                <LoadingContext.Provider value={{ isLoading, setIsLoading }}>
                    <NotesContext.Provider value={{ notes: notes, setNotes: setNotes }}>
                        {isLoading && <CorporateLoader size={220} className="absolute inset-0 z-50 m-auto" title="Mapping notes into actions" />}
                        {/* Pages */}
                        {!isLoading && currentPage === "frontpage" && (
                            <div className="h-full overflow-auto pb-0">
                                <FrontPage
                                    company={company}
                                    setCurrentPage={setCurrentPage}
                                    selectedActions={selectedActions}
                                    setSelectedActions={setSelectedActions}
                                    actions={availableActions}   // ✅ pass filtered actions
                                    notes={notes}
                                    setNotes={setNotes}
                                    NoteTitle={noteTitle}
                                    setNoteTitle={setNoteTitle}
                                    showToast={toast != null}
                                    onSaveNote={SaveNote}
                                    onGoToActionsPageClick={() => {
                                        goToActionsPageClickHandler();
                                    }
                                    }
                                />
                            </div>
                        )}

                        {currentPage === "configurations" && (
                            <div className="h-full overflow-auto">
                                <ConfigurationPage
                                    value={config}
                                    connections={IntegrationConnections}
                                    onChange={setConfig}
                                    company={company}
                                    onSave={(cfg) => {
                                        // later: persist per company
                                        console.log("save config", cfg);
                                    }}
                                />
                            </div>
                        )}
                        {currentPage === "actions" &&
                            <ActionsPage selectedActions={selectedActions} onGoToFrontPage={() => {
                                setCurrentPage("frontpage")
                                setSelectedActions([])
                                setNotes("")
                            }}
                            />}
                        {currentPage === "MyNotes" &&
                            <MyNotesPage />
                        }
                    </NotesContext.Provider>
                </LoadingContext.Provider>
            </main>
        </OpenAIActionSolutionsMapContext.Provider>
    );
}
