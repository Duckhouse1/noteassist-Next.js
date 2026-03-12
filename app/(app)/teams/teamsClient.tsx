"use client";

import { useMemo, useCallback, useState, useEffect, useRef } from "react";
import { CorporateLoader } from "@/app/Components/LoadingIcon";
import {
    CurrentSiteContext,
    LoadingContext,
    NotesContext,
    OpenAIActionSolutionsMapContext,
    OrganizationModeContext,
    UserConfigContext,
} from "@/app/Contexts";
import OpenAIService from "@/app/Services/OpenAIService";
import { OpenAIResponse } from "@/app/types/OpenAI";
import { Note } from "@/app/(app)/[company]/dashboard/sections/MyNotesPage";
import { buildUserConfigString } from "@/lib/Integrations/LLMConfigBuilder";
import { IntegrationStateContext, IntegrationStateResponse } from "@/app/Contexts/IntegrationStateContext";
import { AllIntegrationOptions } from "@/lib/Integrations/Catalog";
import { ProviderConfigItem } from "@/lib/Integrations/ProviderUserConfigs";
import { WorkspaceConfig } from "@/lib/Integrations/WorkSpaceConfig";
import { Action, IntegrationConnection } from "@/lib/Integrations/Types";
import { OrganisationMode, Pages } from "@/app/(app)/[company]/dashboard/dashboardClient";
import TeamsActionGallery from "./teamsActionGallery";
import TeamsActionsPage from "./teamsActionPage";
import TeamsBottomNav from "./teamsBottomNav";
import TeamsFrontPage from "./teamsFrontpage";
import TeamsIntegrationsPage from "./teamsIntegrationPage";
import TeamsMyNotes from "./teamsMyNotes";
import * as microsoftTeams from "@microsoft/teams-js";



export default function TeamsClient({
    company,
    mode,
    memberShip,
}: {
    company: string;
    mode: OrganisationMode;
    memberShip: string;
}) {

    const [selectedActions, setSelectedActions] = useState<Action[]>([]);
    const [currentPage, setCurrentPage] = useState<Pages>("frontpage");
    const [notes, setNotes] = useState<Note>({ title: "", content: "", Transcript: "", id: null });
    const [integrationState, setIntegrationState] = useState<IntegrationStateResponse | null>(null);
    const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);
    const [config, setConfig] = useState(null);
    const [userConfigs, setUserConfigs] = useState<ProviderConfigItem[]>([]);
    const [workspaceConfig, setWorkspaceConfig] = useState<WorkspaceConfig | null>(null);
    const [IntegrationConnections, setIntegrationConnections] = useState<IntegrationConnection[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [actionAISolutions, setActionAISolutions] = useState<Map<string, OpenAIResponse[]>>(() => new Map());

    const LoadIntegrationState = async () => {
        try {
            const res = await fetch(`/api/user/Integrations/state?org=${encodeURIComponent(company)}`);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = (await res.json()) as IntegrationStateResponse;
            setIntegrationState(data);
            setUserConfigs(data.configs);
            setIntegrationConnections(data.connections);
            setWorkspaceConfig(data.workspace.config);
        } catch (error) {
            console.log("Error fetching integration state:", error);
        }
    };

    const showToast = (message: string, type: "success" | "error" | "info" = "info") => {
        setToast({ message, type });
        if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
        toastTimeoutRef.current = setTimeout(() => setToast(null), 2500);
    };

    const providerFromIntegration = (integration?: string) => {
        if (!integration) return undefined;
        const x = integration.trim().toLowerCase();
        if (x === "azure-devops") return "azure-devops";
        if (x === "outlook") return "outlook";
        if (x === "sharepoint") return "sharepoint";
        if (x === "jira") return "jira";
        return x;
    };

    const onNewActionSelected = (action: Action) => {
        const provider = providerFromIntegration(action.integration);
        const item = userConfigs.find((x) => x.provider === provider);
        const userConfigString = item ? buildUserConfigString(item) : undefined;

        setSelectedActions((prev) => {
            const match = (a: Action) => a.key === action.key && a.integration === action.integration;
            const exists = prev.some(match);
            if (exists) return prev.filter((a) => !match(a));
            return [...prev, { ...action, UserConfig: userConfigString }];
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
                body: JSON.stringify({ note: notes, company, title: notes.title }),
            });
            if (!response.ok) {
                showToast("Failed to save note.", "error");
                return;
            }
            showToast("Note saved!", "success");
        } catch (error) {
            showToast("Network error while saving.", "error");
        }
    };

    useEffect(() => {
        return () => {
            if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
        };
    }, []);

    useEffect(() => {
        const initTeams = async () => {
            await microsoftTeams.app.initialize();
            microsoftTeams.app.notifyAppLoaded();
            microsoftTeams.app.notifySuccess();
        }
        initTeams();
        LoadIntegrationState().catch((err) => console.log("Error fetching state:", err));
    }, []);

    const setSolutionForKey = useCallback((key: string, value: OpenAIResponse) => {
        setActionAISolutions((prev) => {
            const next = new Map(prev);
            const existing = next.get(key) ?? [];
            const updated = existing.some((r) => r.type === value.type)
                ? existing.map((r) => (r.type === value.type ? value : r))
                : [...existing, value];
            next.set(key, updated);
            return next;
        });
    }, []);

    const goToActionsPageClickHandler = () => {
        setIsLoading(true);
        if (!notes?.content) return;
        Promise.all(
            selectedActions.map((action) =>
                OpenAIService.extractInfoBasedOnAction(notes?.content, notes.Transcript, action).then((response) => ({
                    action,
                    response,
                }))
            )
        )
            .then((results) => {
                const responseMap = new Map<string, OpenAIResponse[]>();
                results.forEach(({ action, response }) => {
                    const key = action.integration ?? action.key;
                    const existing = responseMap.get(key) ?? [];
                    responseMap.set(key, [...existing, response]);
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
        const ws = integrationState?.workspace?.config;
        if (!ws) return [];
        const result: Action[] = [];
        for (const card of AllIntegrationOptions) {
            if (!ws.enabledProviders.includes(card.providerId)) continue;
            const enabledMap = ws.enabledActions?.[card.providerId] ?? {};
            for (const a of card.actions) {
                const isEnabled = enabledMap[a.key] !== false;
                if (!isEnabled) continue;
                result.push(a);
            }
        }
        return result;
    }, [integrationState]);

    // Bottom nav is only shown on main pages (not during action flow)
    const showBottomNav =
        currentPage === "frontpage" ||
        currentPage === "MyNotes" ||
        currentPage === "Integrations" ||
        currentPage === "Organisations";

    return (
        <OpenAIActionSolutionsMapContext.Provider
            value={{ OpenAISolutionsMap: actionAISolutions, setOpenAISolutionsMap: setSolutionForKey }}
        >
            <main className="h-screen bg-[#F5F5F5] overflow-hidden flex flex-col relative">
                {/* Toast notification */}
                {toast && (
                    <div
                        className={[
                            "fixed top-3 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-xl text-xs font-semibold shadow-lg transition-all",
                            toast.type === "success"
                                ? "bg-emerald-600 text-white"
                                : toast.type === "error"
                                    ? "bg-red-500 text-white"
                                    : "bg-slate-800 text-white",
                        ].join(" ")}
                    >
                        {toast.message}
                    </div>
                )}

                <IntegrationStateContext.Provider value={{ integrationState, setIntegrationState }}>
                    <LoadingContext.Provider value={{ isLoading, setIsLoading }}>
                        <OrganizationModeContext.Provider value={{ mode }}>
                            <UserConfigContext.Provider value={{ configs: userConfigs, setConfigs: setUserConfigs }}>
                                <NotesContext.Provider value={{ notes, setNotes }}>
                                    <CurrentSiteContext.Provider value={{ currentPage, setCurrentPage }}>

                                        {/* Loading overlay */}
                                        {isLoading && (
                                            <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/80">
                                                <CorporateLoader
                                                    size={160}
                                                    className=""
                                                    title="Processing notes..."
                                                />
                                            </div>
                                        )}

                                        {/* Page content — fills space above bottom nav */}
                                        <div className={`flex-1 overflow-hidden ${showBottomNav ? "pb-16" : ""}`}>
                                            {!isLoading && currentPage === "frontpage" && (
                                                <TeamsFrontPage
                                                    company={company}
                                                    notes={notes}
                                                    setNotes={setNotes}
                                                    setNoteTitle={(title) => setNotes((p) => ({ ...p, title }))}
                                                    onSaveNote={SaveNote}
                                                    selectedCount={selectedActions.length}
                                                    onGoToActionsGallery={() => setCurrentPage("ActionGallery")}
                                                    onGoToActionsPageClick={goToActionsPageClickHandler}
                                                />
                                            )}

                                            {!isLoading && currentPage === "ActionGallery" && (
                                                <TeamsActionGallery
                                                    actions={availableActions}
                                                    selectedActions={selectedActions}
                                                    setSelectedActions={onNewActionSelected}
                                                    onGoBack={() => setCurrentPage("frontpage")}
                                                    onProcessNote={goToActionsPageClickHandler}
                                                    onGoToIntegrations={() => setCurrentPage("Integrations")}
                                                />
                                            )}

                                            {!isLoading && currentPage === "actions" && (
                                                <TeamsActionsPage
                                                    selectedActions={selectedActions}
                                                    onGoToFrontPage={() => {
                                                        setCurrentPage("frontpage");
                                                        setSelectedActions([]);
                                                        setNotes({ title: "", content: "", Transcript: "", id: null });
                                                    }}
                                                />
                                            )}

                                            {currentPage === "MyNotes" && <TeamsMyNotes />}

                                            {currentPage === "Integrations" && (
                                                <TeamsIntegrationsPage company={company} />
                                            )}
                                        </div>

                                        {/* Bottom navigation */}
                                        {showBottomNav && (
                                            <TeamsBottomNav
                                                currentPage={currentPage}
                                                setCurrentPage={setCurrentPage}
                                            />
                                        )}
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