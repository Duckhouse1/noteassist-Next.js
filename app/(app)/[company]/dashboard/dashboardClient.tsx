"use client";

import { useMemo, useCallback, useState, useEffect, useRef } from "react";
import { FrontPage } from "./sections/frontPage";
import ActionsPage from "./sections/ActionsPage";
import { ConfigurationPage, DEFAULT_CONFIG, type ConfigState, } from "./sections/ConfigurationPage";
import { ActionsMockData } from "./components/ActionsMockData";
import type { Action } from "./sections/frontPage";
import { CorporateLoader } from "@/app/Components/LoadingIcon";
import { LoadingContext, NotesContext, OpenAIActionSolutionsMapContext, OrganizationModeContext, UserConfigContext } from "@/app/Contexts";
import OpenAIService from "@/app/Services/OpenAIService";
import { OpenAIResponse } from "@/app/types/OpenAI";
import MyNotesPage from "./sections/MyNotesPage";
import Image from "next/image";
import { Toast } from "@/app/Components/Toast";
import { NavItem } from "@/app/Components/HeaderNavItem";
import { AzureDevopsSettings } from "./sections/configElements.tsx/AzureDevopsConfig";
import { OutlookSettings } from "./sections/configElements.tsx/OutlookConfig";
import { SharePointSettings } from "./sections/configElements.tsx/SharePointConfig";
import { buildUserConfigString } from "@/lib/Integrations/LLMConfigBuilder";
import { Header } from "./components/Header";

export type Pages = "frontpage" | "configurations" | "actions" | "MyNotes" | "Organisations";
export type OrganisationMode = "personal" | "company";

export interface IntegrationConnection {
    id: string;
    displayName: string;
    provider: string;
}
export type MemberShip = "owner" | "admin" | "member"

export type IntegrationConfigItem =
    | { connectionId: string; provider: "azure-devops"; displayName: string; config: AzureDevopsSettings }
    | { connectionId: string; provider: "outlook"; displayName: string; config: OutlookSettings }
    | { connectionId: string; provider: "sharepoint"; displayName: string; config: SharePointSettings }
    | { connectionId: string; provider: "jira"; displayName: string; config: Record<string, unknown> };

type UserConfigurationsResponse = {
    configs: IntegrationConfigItem[]
};

export default function DashboardClient({ company, mode, memberShip }: { company: string; mode: OrganisationMode, memberShip: string }) {
    const [selectedActions, setSelectedActions] = useState<Action[]>([]);
    const [currentPage, setCurrentPage] = useState<Pages>("frontpage");
    const [notes, setNotes] = useState<string>("");
    const [noteTitle, setNoteTitle] = useState("");
    const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);
    const [member] = useState<MemberShip>(memberShip as MemberShip)
    const [config, setConfig] = useState<ConfigState>(DEFAULT_CONFIG);
    const [userConfigs, setUserConfigs] = useState<IntegrationConfigItem[]>([]);
    const [IntegrationConnections, setIntegrationConnections] = useState<IntegrationConnection[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [actionAISolutions, setActionAISolutions] = useState<Map<string, OpenAIResponse>>(() => new Map());
    const isPersonalOrg = mode === "personal";

    const LoadUserConfigurations = async () => {
        try {
            const res = await fetch("/api/user/Configurations");
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data: UserConfigurationsResponse = await res.json();
            setUserConfigs(data.configs);
            setConfig((prev) => applyFetchedConfigsToState(prev, data.configs));
        } catch (error) {
            console.log("Error fetching user Configurations: " + error);
        }
    }

    function applyFetchedConfigsToState(
        cfgState: ConfigState,
        items: IntegrationConfigItem[]
    ): ConfigState {
        const next: ConfigState = {
            ...cfgState,
            azureDevops: { ...cfgState.azureDevops },
            outlook: { ...cfgState.outlook },
            sharePoint: { ...cfgState.sharePoint },
        };

        for (const item of items) {
            if (!item.config) continue;

            if (item.provider === "azure-devops") {
                next.azureDevops[item.connectionId] = item.config;
            } else if (item.provider === "outlook") {
                // adjust to match your OutlookSettings type!
                // (your current DTO differs; update server schema to match OutlookSettings)
                next.outlook[item.connectionId] = item.config // replace with real mapping
            } else if (item.provider === "sharepoint") {
                next.sharePoint[item.connectionId] = item.config;
            }
        }

        return next;
    }
    const showToast = (message: string, type: "success" | "error" | "info" = "info") => {
        setToast({ message, type });
        if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
        toastTimeoutRef.current = setTimeout(() => setToast(null), 2000);
    };
    const providerFromIntegration = (integration?: string) => {
        // normalize your UI labels to provider keys used in userConfigs
        if (!integration) return undefined;
        switch (integration) {
            case "Azure-Devops":
                return "azure-devops";
            case "jira":
                return "jira";
            case "ClickUp":
                return "clickup";
            case "outlook":
                return "outlook";
            default:
                return integration.toLowerCase();
        }
    };
    const onNewActionSelected = (action: Action) => {
        const provider = providerFromIntegration(action.integration);
        const item = userConfigs.find((x) => x.provider === provider);

        // If no provider or no config item found, just toggle without UserConfig
        const userConfigString = item ? buildUserConfigString(item) : undefined;

        setSelectedActions((prev) => {
            const match = (a: Action) => a.key === action.key && a.integration === action.integration;

            const exists = prev.some(match);

            if (exists) {
                // toggle off
                return prev.filter((a) => !match(a));
            }

            // toggle on + attach UserConfig
            const actionWithConfig: Action = {
                ...action,
                UserConfig: userConfigString, // string | undefined is fine
            };

            return [...prev, actionWithConfig];
        });
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
        const run = async () => {
            try {
                const res = await fetch("/api/user/IntegrationConnections");
                if (!res.ok) throw new Error(`HTTP ${res.status}`);

                const connections: IntegrationConnection[] = await res.json();
                setIntegrationConnections(connections);

                // call with the freshly fetched data (not stale state)
                await LoadUserConfigurations();
            } catch (err) {
                console.log("Error fetching IntegrationConnections:", err);
            }
        };

        run();
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
                <Header
                    company={company}
                    currentPage={currentPage}
                    setCurrentPage={setCurrentPage}
                    isPersonalOrg={isPersonalOrg}
                    member={member}
                />
                <LoadingContext.Provider value={{ isLoading, setIsLoading }}>
                    <OrganizationModeContext.Provider value={{ mode }}>
                        <UserConfigContext.Provider value={{ configs: userConfigs }}>
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
                                            setSelectedActions={(action) => onNewActionSelected(action)}
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
                        </UserConfigContext.Provider>
                    </OrganizationModeContext.Provider>
                </LoadingContext.Provider>
            </main>
        </OpenAIActionSolutionsMapContext.Provider>
    );
}