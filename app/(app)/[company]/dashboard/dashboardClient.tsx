"use client";

import { useMemo, useCallback, useState, useEffect, useRef } from "react";
import { FrontPage } from "./sections/frontPage";
import ActionsPage from "./sections/ActionsPage";
import ActionGalleryPage from "./sections/ActionGalleryPage";
import { ConfigurationPage, DEFAULT_CONFIG, type ConfigState, } from "./sections/ConfigurationPage";
import { ActionsMockData } from "./components/ActionsMockData";
import { CorporateLoader } from "@/app/Components/LoadingIcon";
import { CurrentSiteContext, LoadingContext, NotesContext, OpenAIActionSolutionsMapContext, OrganizationModeContext, UserConfigContext } from "@/app/Contexts";
import OpenAIService from "@/app/Services/OpenAIService";
import { OpenAIResponse } from "@/app/types/OpenAI";
import MyNotesPage, { Note } from "./sections/MyNotesPage";
import { Toast } from "@/app/Components/Toast";
import { SharePointSettings } from "./sections/configElements.tsx/SharePointConfig";
import { buildUserConfigString } from "@/lib/Integrations/LLMConfigBuilder";
import { AzureDevopsSettings } from "@/lib/Integrations/AzureDevops/Configuration";
import IntegrationsPage from "./sections/IntegrationsPage";
import { Action, IntegrationConnection } from "@/lib/Integrations/Types";
import { IntegrationStateContext, IntegrationStateResponse } from "@/app/Contexts/IntegrationStateContext";
import { AllIntegrationOptions } from "@/lib/Integrations/Catalog";
import { ProviderConfigItem } from "@/lib/Integrations/ProviderUserConfigs";
import { WorkspaceConfig } from "@/lib/Integrations/WorkSpaceConfig";
import { OutlookSettings } from "@/lib/Integrations/Outlook/Configuration";
import { Header } from "@/app/Components/Header";
import OrganisationPage from "./sections/OrganizationPage";


export type Pages = "frontpage" | "configurations" | "actions" | "MyNotes" | "Organisations" | "Integrations" | "ActionGallery";
export type OrganisationMode = "personal" | "company";


export type MemberShip = "owner" | "admin" | "member"

export type IntegrationConfigItem =
    | { connectionId: string; provider: "azure-devops"; displayName: string; config: AzureDevopsSettings }
    | { connectionId: string; provider: "outlook"; displayName: string; config: OutlookSettings }
    | { connectionId: string; provider: "sharepoint"; displayName: string; config: SharePointSettings }
    | { connectionId: string; provider: "jira"; displayName: string; config: Record<string, unknown> };



export default function DashboardClient({ company, mode, memberShip }: { company: string; mode: OrganisationMode, memberShip: string }) {
    const [selectedActions, setSelectedActions] = useState<Action[]>([]);
    const [currentPage, setCurrentPage] = useState<Pages>("frontpage");
    const [notes, setNotes] = useState<Note>({ title: "", content: "", id: null });
    const [integrationState, setIntegrationState] = useState<IntegrationStateResponse | null>(null);
    const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);
    const [member] = useState<MemberShip>(memberShip as MemberShip)
    const [config, setConfig] = useState<ConfigState>(DEFAULT_CONFIG);
    const [userConfigs, setUserConfigs] = useState<ProviderConfigItem[]>([]);
    const [workspaceConfig, setWorkspaceConfig] = useState<WorkspaceConfig | null>(null);
    const [IntegrationConnections, setIntegrationConnections] = useState<IntegrationConnection[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [actionAISolutions, setActionAISolutions] = useState<Map<string, OpenAIResponse>>(() => new Map());
    const isPersonalOrg = mode === "personal";

    const LoadIntegrationState = async () => {
        try {
            const res = await fetch(`/api/user/Integrations/state?org=${encodeURIComponent(company)}`);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = (await res.json()) as IntegrationStateResponse;

            setIntegrationState(data);

            // optional: also keep old states in sync for existing code
            setUserConfigs(data.configs)
            setIntegrationConnections(data.connections);
            setWorkspaceConfig(data.workspace.config); // only if you still use userConfigs elsewhere
        } catch (error) {
            console.log("Error fetching integration state:", error);
        }
    };
 
    const showToast = (message: string, type: "success" | "error" | "info" = "info") => {
        setToast({ message, type });
        if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
        toastTimeoutRef.current = setTimeout(() => setToast(null), 2000);
    };
    const providerFromIntegration = (integration?: string) => {
        if (!integration) return undefined;
        const x = integration.trim().toLowerCase();

        if (x === "azure-devops" || x === "azure-devops") return "azure-devops";
        if (x === "outlook") return "outlook";
        if (x === "sharepoint") return "sharepoint";
        if (x === "jira") return "jira";

        return x;
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
            console.log("new action");
            console.log(actionWithConfig);
            return [...prev, actionWithConfig];
        });
    };

    const SaveNote = async () => {
        if (notes && notes.title?.trim() === "") {
            showToast("Please enter a title before saving.", "error");
            return;
        }
        try {
            const response = await fetch("/api/notes", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text: notes.content, company, title: notes.title }),
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
                await LoadIntegrationState()
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
        console.log(selectedActions);
        if (!notes?.content) return
        Promise.all(
            selectedActions.map((action) =>
                OpenAIService.extractInfoBasedOnAction(notes?.content, action).then((response) => ({ action, response }))
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
                console.log("Reponse map");
                console.log(responseMap);
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
        console.log("Fetcher available actions");
        const ws = integrationState?.workspace?.config;
        if (!ws) return [];
        console.log("Her er ws: ");
        console.log(ws);
        const result: Action[] = [];

        for (const card of AllIntegrationOptions) {
            // provider må være enabled
            if (!ws.enabledProviders.includes(card.providerId)) continue;

            const enabledMap = ws.enabledActions?.[card.providerId] ?? {};

            for (const a of card.actions) {
                console.log("action");
                console.log(a);
                // action må være enabled (default true hvis ikke findes)
                const isEnabled = enabledMap[a.key] !== false;
                if (!isEnabled) continue;

                // Push action metadata (fra catalog)
                result.push(a);
            }
        }
        console.log(result);
        return result;
    }, [integrationState]);;

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
                <IntegrationStateContext.Provider value={{ integrationState, setIntegrationState }}>

                    <LoadingContext.Provider value={{ isLoading, setIsLoading }}>
                        <OrganizationModeContext.Provider value={{ mode }}>
                            <UserConfigContext.Provider value={{ configs: userConfigs, setConfigs: setUserConfigs }}>
                                <NotesContext.Provider value={{ notes, setNotes }}>
                                    <CurrentSiteContext.Provider value={{ currentPage, setCurrentPage }}>
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
                                                    notes={notes}
                                                    setNotes={setNotes}
                                                    setNoteTitle={(value) => {
                                                        setNotes(prev => ({
                                                            ...prev,
                                                            title: value
                                                        }))
                                                    }}
                                                    showToast={toast != null}
                                                    onSaveNote={SaveNote}
                                                    onGoToActionsGallery={() => setCurrentPage("ActionGallery")}
                                                    selectedCount={selectedActions.length}
                                                    onGoToActionsPageClick={goToActionsPageClickHandler}
                                                />
                                            </div>
                                        )}

                                        {!isLoading && currentPage === "ActionGallery" && (
                                            <div className="h-full overflow-x-hidden">
                                                <ActionGalleryPage
                                                    actions={availableActions}
                                                    selectedActions={selectedActions}
                                                    setSelectedActions={(action) => onNewActionSelected(action)}
                                                    onGoBack={() => setCurrentPage("frontpage")}
                                                    onProcessNote={goToActionsPageClickHandler}
                                                    setCurrentPage={setCurrentPage}
                                                />
                                            </div>
                                        )}

                                        {currentPage === "configurations" && (
                                            <ConfigurationPage company={company} />
                                        )}

                                        {currentPage === "actions" && (
                                            <ActionsPage
                                                selectedActions={selectedActions}
                                                onGoToFrontPage={() => {
                                                    setCurrentPage("frontpage");
                                                    setSelectedActions([]);
                                                    setNotes({ title: "", content: "", id: null });
                                                }}
                                            />
                                        )}

                                        {currentPage === "Integrations" && (
                                            <IntegrationsPage company={company} />
                                        )}

                                        {currentPage === "Organisations" && (
                                            <OrganisationPage company={company} />
                                        )}

                                        {currentPage === "MyNotes" && <MyNotesPage />}
                                    </CurrentSiteContext.Provider>
                                </NotesContext.Provider>
                            </UserConfigContext.Provider>
                        </OrganizationModeContext.Provider>
                    </LoadingContext.Provider>
                </IntegrationStateContext.Provider>
            </main>
        </OpenAIActionSolutionsMapContext.Provider>
    );
}