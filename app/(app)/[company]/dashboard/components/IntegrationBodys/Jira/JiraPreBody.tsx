"use client";

import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { JiraElement } from "@/app/types/OpenAI";
import { UserConfigContext, clientIsFromTeams } from "@/app/Contexts";
import { useElementTree } from "@/app/Components/Hooks/useElementTree";
import { JiraIssuePane } from "./JiraIssuePane";
import { JiraIssueInfoPanel } from "./JiraIssueInfoPanel";
import { JiraCloudSite, JiraIssueType, JiraProject } from "@/lib/Integrations/Jira/Configuration";

function JiraMark() {
    return (
        <svg width="20" height="20" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15.89 1.68L8.3 9.27l-3.92 3.92a1.32 1.32 0 000 1.87l7.38 7.38 4.13 4.13a1.32 1.32 0 001.87 0l7.38-7.38 4.56-4.56a1.32 1.32 0 000-1.87L15.89 1.68z" fill="#2684FF" />
            <path d="M15.89 1.68A8.32 8.32 0 0115.82 13.5l-3.96 3.96 4.03 4.03a1.32 1.32 0 001.87 0l7.38-7.38 4.56-4.56a1.32 1.32 0 000-1.87L15.89 1.68z" fill="url(#jira_grad_1)" />
            <path d="M4.38 16.12a1.32 1.32 0 000 1.87l7.38 7.38 4.13 4.13a1.32 1.32 0 001.87 0l4.13-4.13-7.38-7.38a8.32 8.32 0 01-2.43-8.29L4.38 16.12z" fill="url(#jira_grad_2)" />
            <defs>
                <linearGradient id="jira_grad_1" x1="16.49" y1="9.78" x2="22.54" y2="3.73" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#0052CC" /><stop offset="100%" stopColor="#2684FF" />
                </linearGradient>
                <linearGradient id="jira_grad_2" x1="15.35" y1="17.78" x2="9.24" y2="23.89" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#0052CC" /><stop offset="100%" stopColor="#2684FF" />
                </linearGradient>
            </defs>
        </svg>
    );
}

export const JiraPreBody = ({ integrationKey }: { integrationKey: string }) => {
    const { configs } = useContext(UserConfigContext);
    const { fromTeams } = useContext(clientIsFromTeams);
    const s = (normal: string, small: string) => fromTeams ? small : normal;

    const jiraConfig = configs.find((c) => c.provider === "jira")?.config;
    const availableTypes: string[] = jiraConfig?.defaultIssueTypes ?? [];
    const defaultCloudId = jiraConfig?.defaultCloudId ?? "";
    const defaultProjectKey = jiraConfig?.defaultProjectKey ?? "";

    const [sites, setSites] = useState<JiraCloudSite[]>([]);
    const projectsCache = useRef<Map<string, JiraProject[]>>(new Map());
    const [currentProjects, setCurrentProjects] = useState<JiraProject[]>([]);
    const [loadingProjects, setLoadingProjects] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // ── Issue-type cache shared across all nodes ──────────────────────────────
    // Keyed by "cloudId::projectKey" → string[] of type names
    const issueTypeCache = useRef<Map<string, string[]>>(new Map());
    // A plain counter just to trigger re-renders when the cache gains a new entry
    const [, setIssueTypeCacheVersion] = useState(0);

    const fetchIssueTypes = useCallback(async (cloudId: string, projectKey: string) => {
    if (!cloudId || !projectKey) return;
    const key = `${cloudId}::${projectKey}`;
    if (issueTypeCache.current.has(key)) return;

    issueTypeCache.current.set(key, []); // ← mark as in-flight immediately
    try {
        const res = await fetch(
            `/api/integrations/jira/issueTypes?cloudId=${encodeURIComponent(cloudId)}&projectKey=${encodeURIComponent(projectKey)}`
        );
        if (!res.ok) return;
        const json = await res.json() as { types: JiraIssueType[] };
        const names = (json.types ?? []).map((t) => t.name);
        issueTypeCache.current.set(key, names);
        setIssueTypeCacheVersion((v) => v + 1);
    } catch {
        issueTypeCache.current.delete(key); // allow retry on error
    }
}, []);

    /** Returns cached project-specific types, or the global config fallback. */
    const getIssueTypesForElement = useCallback(
        (cloudId?: string, projectKey?: string): string[] => {
            if (!cloudId || !projectKey) return availableTypes;
            const key = `${cloudId}::${projectKey}`;
            const cached = issueTypeCache.current.get(key);
            if (cached && cached.length > 0) return cached;
            // Not cached yet — kick off a background fetch and return fallback for now
            fetchIssueTypes(cloudId, projectKey);
            return availableTypes;
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [availableTypes, fetchIssueTypes]
    );

    // ── Tree ──────────────────────────────────────────────────────────────────
    const tree = useElementTree<JiraElement>({
        integrationKey,
        storagePrefix: "jira",
        responseType: "jira_tasks",
        extractElements: (r) => (r.type === "jira_tasks" ? r.content.elements : []),
        buildResponse: (elements) => ({ type: "jira_tasks", content: { elements } }),
    });

    // ── Fetch sites once ──────────────────────────────────────────────────────
    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const res = await fetch("/api/integrations/jira/sites");
                if (!res.ok) throw new Error("Failed");
                const json = await res.json() as { sites: JiraCloudSite[] };
                if (!cancelled) setSites(json.sites ?? []);
            } catch {
                if (!cancelled) setError("Could not load Jira sites.");
            }
        })();
        return () => { cancelled = true; };
    }, []);

    // ── Pre-warm projects for default cloud ───────────────────────────────────
    useEffect(() => {
        if (!defaultCloudId || projectsCache.current.has(defaultCloudId)) return;
        (async () => {
            try {
                const res = await fetch(`/api/integrations/jira/projects?cloudId=${encodeURIComponent(defaultCloudId)}`);
                if (!res.ok) return;
                const json = await res.json() as JiraProject[];
                projectsCache.current.set(defaultCloudId, json ?? []);
            } catch { /* silent */ }
        })();
    }, [defaultCloudId]);

    // ── Pre-warm issue types for default project ──────────────────────────────
    useEffect(() => {
        if (defaultCloudId && defaultProjectKey) {
            fetchIssueTypes(defaultCloudId, defaultProjectKey);
        }
    }, [defaultCloudId, defaultProjectKey, fetchIssueTypes]);

    // ── Load projects when selected element's site changes ───────────────────
    const selectedCloudId = tree.selectedElement?.data.cloudId ?? "";
    useEffect(() => {
        if (!selectedCloudId) { setCurrentProjects([]); return; }
        const cached = projectsCache.current.get(selectedCloudId);
        if (cached) { setCurrentProjects(cached); return; }

        let cancelled = false;
        setLoadingProjects(true);
        (async () => {
            try {
                const res = await fetch(`/api/integrations/jira/projects?cloudId=${encodeURIComponent(selectedCloudId)}`);
                if (!res.ok) throw new Error("Failed");
                const json = await res.json() as JiraProject[];
                if (!cancelled) {
                    projectsCache.current.set(selectedCloudId, json ?? []);
                    setCurrentProjects(json ?? []);
                }
            } catch {
                if (!cancelled) setError("Could not load Jira projects.");
            } finally {
                if (!cancelled) setLoadingProjects(false);
            }
        })();
        return () => { cancelled = true; };
    }, [selectedCloudId]);

    // Also pre-warm issue types whenever a selected element has a full project set
    const selectedProjectKey = tree.selectedElement?.data.projectKey ?? "";
    useEffect(() => {
        if (selectedCloudId && selectedProjectKey) {
            fetchIssueTypes(selectedCloudId, selectedProjectKey);
        }
    }, [selectedCloudId, selectedProjectKey, fetchIssueTypes]);

    // ── Handlers ──────────────────────────────────────────────────────────────
    const handleSiteChange = async (cloudId: string, cloudName: string) => {
        if (!tree.selectedElement) return;
        tree.update(tree.selectedElement.data.id, { cloudId, cloudName, projectKey: "", projectName: "" });

        const cached = projectsCache.current.get(cloudId);
        if (cached) { setCurrentProjects(cached); return; }

        setLoadingProjects(true);
        try {
            const res = await fetch(`/api/integrations/jira/projects?cloudId=${encodeURIComponent(cloudId)}`);
            if (!res.ok) throw new Error("Failed");
            const json = await res.json() as JiraProject[];
            projectsCache.current.set(cloudId, json ?? []);
            setCurrentProjects(json ?? []);
        } catch {
            setError("Could not load Jira projects.");
        } finally {
            setLoadingProjects(false);
        }
    };

    /** New root issue — uses defaults from config. */
    const makeNewRootIssue = (type: string): JiraElement => {
        const defaultSite = sites.find((s) => s.id === defaultCloudId);
        const defaultProj = projectsCache.current.get(defaultCloudId)?.find((p) => p.key === defaultProjectKey);
        return {
            id: crypto.randomUUID(),
            type,
            title: `New ${type}`,
            description: "",
            children: [],
            cloudId: defaultSite?.id ?? "",
            cloudName: defaultSite?.name ?? "",
            projectKey: defaultProj?.key ?? "",
            projectName: defaultProj?.name ?? "",
        };
    };

    /** New child issue — inherits the parent element's cloud + project. */
    const makeNewChildIssue = (parentElement: JiraElement, type: string): JiraElement => ({
        id: crypto.randomUUID(),
        type,
        title: `New ${type}`,
        description: "",
        children: [],
        cloudId: parentElement.cloudId ?? "",
        cloudName: parentElement.cloudName ?? "",
        projectKey: parentElement.projectKey ?? "",
        projectName: parentElement.projectName ?? "",
    });

    return (
        <div className="w-full flex flex-col lg:flex-row gap-2 items-stretch lg:h-[64vh] min-h-0">

            <div className="min-w-0 lg:flex-[3] lg:max-h-[calc(100vh-160px)]">
                <JiraIssuePane
                    elements={tree.elements}
                    availableTypes={availableTypes}
                    getIssueTypesForElement={getIssueTypesForElement}
                    selectedElement={tree.selectedElement}
                    onClick={tree.select}
                    onRemove={(id) => tree.remove(id)}
                    onAddRoot={(type) => tree.addRoot(makeNewRootIssue(type))}
                    onAddChild={(parentElement, type) =>
                        tree.addChild(parentElement.id, makeNewChildIssue(parentElement, type))
                    }
                />
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm lg:flex-[6] flex flex-col min-h-0">
                <div className={`flex items-center gap-2 border-b border-slate-100 flex-shrink-0 ${s("px-4 py-2.5", "px-3 py-1.5")}`}>
                    <div className={`grid place-items-center rounded-lg ${s("h-8 w-8", "h-6 w-6")}`}>
                        <JiraMark />
                    </div>
                    <h2 className={`font-semibold text-slate-900 ${s("text-base", "text-sm")}`}>Jira</h2>
                </div>

                <div className={`flex-1 min-h-0 flex flex-col ${s("p-5", "p-3")}`}>
                    {error && (
                        <div className={`rounded-xl border border-rose-200 bg-rose-50 text-rose-700 ${s("mb-4 px-4 py-3 text-sm", "mb-2 px-3 py-2 text-xs")}`}>
                            {error}
                        </div>
                    )}

                    {tree.selectedElement ? (
                        <div className="mt-0 flex-1 min-h-0">
                            <JiraIssueInfoPanel
                                selectedElement={tree.selectedElement}
                                availableTypes={availableTypes}
                                sites={sites}
                                projects={currentProjects}
                                loadingProjects={loadingProjects}
                                onDataChange={(patch) => tree.update(tree.selectedElement!.data.id, patch)}
                                onSiteChange={handleSiteChange}
                            />
                        </div>
                    ) : (
                        <div className="flex flex-1 items-center justify-center">
                            <div className={`flex max-w-sm flex-col items-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 text-center ${s("gap-4 px-6 py-8", "gap-2 px-4 py-5")}`}>
                                <JiraMark />
                                <div>
                                    <h3 className={`font-semibold text-slate-900 ${s("text-sm", "text-xs")}`}>Select an issue to get started</h3>
                                    <p className={`mt-1 text-slate-600 ${s("text-sm", "text-xs")}`}>Choose an issue from the list to view and edit its details.</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};