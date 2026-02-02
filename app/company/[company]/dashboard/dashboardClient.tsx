"use client";

import { useMemo, useState } from "react";
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
import { LoadingContext } from "@/app/Contexts";

export type Pages = "frontpage" | "configurations" | "actions";

export default function DashboardClient({ company }: { company: string }) {
    const [selectedActions, setSelectedActions] = useState<Action[]>([]);
    const [currentPage, setCurrentPage] = useState<Pages>("frontpage");
    const [notes, setNotes] = useState<string>("");
    const [config, setConfig] = useState<ConfigState>(DEFAULT_CONFIG);
    const [isLoading, setIsLoading] = useState<boolean>(false);
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
        <main className="min-h-screen bg-slate-50">
            {/* Top navigation stays white */}
            <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white backdrop-blur">
                <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
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
                {isLoading && <CorporateLoader size={220} className="absolute inset-0 z-50 m-auto" title="Mapping notes into actions" />}
                {/* Pages */}
                {!isLoading && currentPage === "frontpage" && (
                    <div className="mx-auto max-w-6xl bg-slate-50 px-6 py-0">
                        <FrontPage
                            company={company}
                            setCurrentPage={setCurrentPage}
                            selectedActions={selectedActions}
                            setSelectedActions={setSelectedActions}
                            actions={availableActions}   // ✅ pass filtered actions
                            notes={notes}
                            setNotes={setNotes}
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

                {currentPage === "actions" && <ActionsPage selectedActions={selectedActions} onGoToFrontPage={() => {

                    setCurrentPage("frontpage")
                    setSelectedActions([])
                    setNotes("")
                }}
                />}


            </LoadingContext.Provider>
        </main>
    );
}
