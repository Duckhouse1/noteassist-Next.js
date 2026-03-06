"use client";

import { useContext, useEffect, useRef, useState } from "react";
import { JiraElement } from "@/app/types/OpenAI";
import { UserConfigContext } from "@/app/Contexts";
import { useElementTree } from "@/app/Components/Hooks/useElementTree";
import { JiraIssuePane } from "./JiraIssuePane";
import { JiraIssueInfoPanel } from "./JiraIssueInfoPanel";
import { JiraCloudSite, JiraProject } from "@/lib/Integrations/Jira/Configuration";

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

    const jiraConfig = configs.find((c) => c.provider === "jira")?.config;
    const availableTypes: string[] = jiraConfig?.defaultIssueTypes ?? [];
    const defaultCloudId = jiraConfig?.defaultCloudId ?? "";
    const defaultProjectKey = jiraConfig?.defaultProjectKey ?? "";

    const [sites, setSites] = useState<JiraCloudSite[]>([]);
    const projectsCache = useRef<Map<string, JiraProject[]>>(new Map());
    const [currentProjects, setCurrentProjects] = useState<JiraProject[]>([]);
    const [loadingProjects, setLoadingProjects] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const tree = useElementTree<JiraElement>({
        integrationKey,
        storagePrefix: "jira",
        responseType: "jira_tasks",
        extractElements: (r) => (r.type === "jira_tasks" ? r.content.elements : []),
        buildResponse: (elements) => ({ type: "jira_tasks", content: { elements } }),
    });

    // Fetch sites once on mount
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

    // Pre-warm default site's project list
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

    // Load projects for the selected element's cloud
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

    const handleSiteChange = async (cloudId: string, cloudName: string) => {
        if (!tree.selectedElement) return;
        tree.update(tree.selectedElement.data.id, {
            cloudId,
            cloudName,
            projectKey: "",
            projectName: "",
        });

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

    const makeNewIssue = (type: string): JiraElement => {
        const defaultSite = sites.find((s) => s.id === defaultCloudId);
        const defaultProj = projectsCache.current.get(defaultCloudId)?.find(
            (p) => p.key === defaultProjectKey
        );
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

    return (
        <div className="w-full flex flex-row gap-2 items-stretch min-h-0 h-[clamp(320px,65vh,640px)]">

            <div className="flex-3 min-w-0 max-h-[calc(100vh-160px)]">
                <JiraIssuePane
                    elements={tree.elements}
                    availableTypes={availableTypes}
                    selectedElement={tree.selectedElement}
                    onClick={tree.select}
                    onRemove={(id) => tree.remove(id)}
                    onAddRoot={(type) => tree.addRoot(makeNewIssue(type))}
                    onAddChild={(parentId, type) => tree.addChild(parentId, makeNewIssue(type))}
                />
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm flex-[6] flex flex-col min-h-0">
                <div className="flex items-center gap-2 border-b border-slate-100 px-4 py-2.5 flex-shrink-0">
                    <div className="grid h-8 w-8 place-items-center rounded-lg">
                        <JiraMark />
                    </div>
                    <h2 className="text-base font-semibold text-slate-900">Jira</h2>
                </div>

                <div className="p-5 flex-1 min-h-0 flex flex-col">
                    {error && (
                        <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
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
                            <div className="flex max-w-sm flex-col items-center gap-4 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-8 text-center">
                                <JiraMark />
                                <div>
                                    <h3 className="text-sm font-semibold text-slate-900">Select an issue to get started</h3>
                                    <p className="mt-1 text-sm text-slate-600">Choose an issue from the list to view and edit its details.</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};