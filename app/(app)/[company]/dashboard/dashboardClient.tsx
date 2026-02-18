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
import { LoadingContext, NotesContext, OpenAIActionSolutionsMapContext, OrganizationModeContext } from "@/app/Contexts";
import OpenAIService from "@/app/Services/OpenAIService";
import { OpenAIResponse } from "@/app/types/OpenAI";
import MyNotesPage from "./sections/MyNotesPage";
import Image from "next/image";
import { Toast } from "@/app/Components/Toast";
import { AuthService } from "@/app/Services/AuthServices/AuthService";

export type Pages = "frontpage" | "configurations" | "actions" | "MyNotes" | "Organisation";
export type OrganisationMode = "personal" | "company";

export interface IntegrationConnection {
    id:string;
    displayName: string;
    provider: string;
}
export type MemberShip = "owner" | "admin" | "member"
const NavItem = ({
    label,
    active,
    onClick,
}: {
    label: string;
    active?: boolean;
    onClick: () => void;
}) => (
    <button
        onClick={onClick}
        className={[
            " cursor-pointer relative px-1 py-1 text-sm font-medium transition-colors",
            active
                ? "text-[#1E3A5F]"
                : "text-slate-500 hover:text-slate-800",
        ].join(" ")}
    >
        {label}
        {active && (
            <span className="absolute inset-x-0 -bottom-[17px] h-[2px] bg-[#1E3A5F] rounded-full" />
        )}
    </button>
);

export default function DashboardClient({ company, mode, memberShip}: { company: string; mode: OrganisationMode, memberShip : string }) {
    const [selectedActions, setSelectedActions] = useState<Action[]>([]);
    const [currentPage, setCurrentPage] = useState<Pages>("frontpage");
    const [notes, setNotes] = useState<string>("");
    const [noteTitle, setNoteTitle] = useState("");
    const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);
    const [member] = useState<MemberShip>(memberShip as MemberShip)
    const [config, setConfig] = useState<ConfigState>(DEFAULT_CONFIG);
    const [IntegrationConnections, setIntegrationConnections] = useState<IntegrationConnection[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [actionAISolutions, setActionAISolutions] = useState<Map<string, OpenAIResponse>>(() => new Map());
    const isPersonalOrg = mode === "personal";


    const showToast = (message: string, type: "success" | "error" | "info" = "info") => {
        setToast({ message, type });
        if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
        toastTimeoutRef.current = setTimeout(() => setToast(null), 2000);
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
                body: JSON.stringify({ text: notes, company, title: noteTitle }),
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

    useEffect(() => {
        const GetIntegrationConnections = async () => {
            try {
                const response = await fetch("/api/user/IntegrationConnections", {
                    method: "GET",
                    headers: { "Content-Type": "application/json" },
                });
                const data = await response.json();
                setIntegrationConnections(data);
            } catch (error) {
                console.log("Error fetching IntegrationConnections: " + error);
            }
        };
        GetIntegrationConnections();
    }, []);

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
            selectedActions.map((action) =>
                OpenAIService.extractInfoBasedOnAction(notes, action).then((response) => ({ action, response }))
            )
        )
            .then((results) => {
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
        <OpenAIActionSolutionsMapContext.Provider
            value={{ OpenAISolutionsMap: actionAISolutions, setOpenAISolutionsMap: setSolutionForKey }}
        >
            <main className="h-screen bg-[#F4F5F7] overflow-hidden flex flex-col">
                <Toast
                    message={toast?.message ?? ""}
                    type={toast?.type ?? "info"}
                    onClose={() => setToast(null)}
                />

                {/* Header */}
                <header className="sticky top-0 z-40 bg-white border-b border-slate-200/80">
                    <div className=" w-full 2xl:max-w-[1550px] px-4 sm:px-6 lg:px-8 ml-4">
                        <div className="flex h-14 justify-between">

                            {/* Left: logo + brand */}
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => setCurrentPage("frontpage")}
                                    className="flex items-center gap-2.5 focus:outline-none"
                                >
                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1E3A5F]">
                                        <Image
                                            src="/actionNotes-Logo-alone.svg"
                                            alt="ActionNotes"
                                            width={20}
                                            height={20}
                                        />
                                    </div>
                                    <div className="leading-none">
                                        <p className="text-sm font-bold tracking-tight text-slate-900">ActionNotes</p>
                                        {!isPersonalOrg && (
                                            <p className="text-[10px] text-slate-400 font-medium">{company}</p>
                                        )}
                                    </div>
                                </button>

                                {/* Divider */}
                                <div className="ml-3 h-5 w-px bg-slate-200" />

                                {/* Nav links */}
                                <nav className="flex items-center gap-5 ml-2">
                                    <NavItem
                                        label="Note"
                                        active={currentPage === "frontpage"}
                                        onClick={() => setCurrentPage("frontpage")}
                                    />
                                    <NavItem
                                        label="My Notes"
                                        active={currentPage === "MyNotes"}
                                        onClick={() => setCurrentPage("MyNotes")}
                                    />
                                    {member == "owner" && (
                                        <NavItem 
                                        label="Organisation"
                                        active={currentPage === "Organisation"}
                                        onClick={() => setCurrentPage("Organisation")}
                                        />
                                    )}
                                </nav>
                            </div>

                            {/* Right: settings + avatar */}
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => setCurrentPage("configurations")}
                                    className={[
                                        "cursor-pointer inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all focus:outline-none",
                                        currentPage === "configurations"
                                            ? "border-[#1E3A5F] bg-[#1E3A5F] text-white"
                                            : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900",
                                    ].join(" ")}
                                >
                                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <circle cx="12" cy="12" r="3" />
                                        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
                                    </svg>
                                    Configuration
                                </button>

                                {/* Avatar */}
                                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-slate-300 to-slate-400 ring-2 ring-white" />
                            </div>
                        </div>
                    </div>
                </header>

                <LoadingContext.Provider value={{ isLoading, setIsLoading }}>
                    <OrganizationModeContext.Provider value={{ mode }}>
                        <NotesContext.Provider value={{ notes, setNotes }}>
                            {isLoading && (
                                <CorporateLoader
                                    size={220}
                                    className="absolute inset-0 z-50 m-auto"
                                    title="Mapping notes into actions"
                                />
                            )}

                            {!isLoading && currentPage === "frontpage" && (
                                <div className="h-full overflow-auto">
                                    <FrontPage
                                        company={company}
                                        setCurrentPage={setCurrentPage}
                                        selectedActions={selectedActions}
                                        setSelectedActions={setSelectedActions}
                                        actions={availableActions}
                                        notes={notes}
                                        setNotes={setNotes}
                                        NoteTitle={noteTitle}
                                        setNoteTitle={setNoteTitle}
                                        showToast={toast != null}
                                        onSaveNote={SaveNote}
                                        onGoToActionsPageClick={goToActionsPageClickHandler}
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
                                            console.log("save config", cfg);
                                        }}
                                    />
                                </div>
                            )}

                            {currentPage === "actions" && (
                                <ActionsPage
                                    selectedActions={selectedActions}
                                    onGoToFrontPage={() => {
                                        setCurrentPage("frontpage");
                                        setSelectedActions([]);
                                        setNotes("");
                                    }}
                                />
                            )}

                            {currentPage === "MyNotes" && <MyNotesPage />}
                        </NotesContext.Provider>
                    </OrganizationModeContext.Provider>
                </LoadingContext.Provider>
            </main>
        </OpenAIActionSolutionsMapContext.Provider>
    );
}