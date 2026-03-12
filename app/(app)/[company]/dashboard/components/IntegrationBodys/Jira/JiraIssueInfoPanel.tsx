"use client";

import { useContext, useEffect, useRef, useState } from "react";
import { JiraElement } from "@/app/types/OpenAI";
import { SelectedElement } from "@/app/Components/Hooks/useElementTree";
import { JiraCloudSite, JiraIssueType, JiraProject } from "@/lib/Integrations/Jira/Configuration";
import { clientIsFromTeams } from "@/app/Contexts";

type JiraUser = {
    accountId: string;
    displayName: string;
    avatarUrl: string;
    active: boolean;
};

type JiraIssueInfoPanelProps = {
    selectedElement: SelectedElement<JiraElement>;
    availableTypes: string[]; // global fallback from config (used only when no project selected)
    sites: JiraCloudSite[];
    projects: JiraProject[];
    loadingProjects: boolean;
    onDataChange: (patch: Partial<JiraElement>) => void;
    onSiteChange: (cloudId: string, cloudName: string) => void;
};

export function JiraIssueInfoPanel({
    selectedElement,
    availableTypes,
    sites,
    projects,
    loadingProjects,
    onDataChange,
    onSiteChange,
}: JiraIssueInfoPanelProps) {
    const { fromTeams } = useContext(clientIsFromTeams);
    const s = (normal: string, small: string) => (fromTeams ? small : normal);

    const titleInputRef = useRef<HTMLInputElement>(null);

    // Per-project issue types
    const [projectIssueTypes, setProjectIssueTypes] = useState<JiraIssueType[]>([]);
    const [loadingTypes, setLoadingTypes] = useState(false);
    const issueTypeCache = useRef<Map<string, JiraIssueType[]>>(new Map());

    // Per-project assignees
    const [assignees, setAssignees] = useState<JiraUser[]>([]);
    const [loadingAssignees, setLoadingAssignees] = useState(false);
    const assigneeCache = useRef<Map<string, JiraUser[]>>(new Map());

    const currentCloudId = selectedElement.data.cloudId ?? "";
    const currentProjectKey = selectedElement.data.projectKey ?? "";
    const cacheKey = `${currentCloudId}::${currentProjectKey}`;

    // Focus title on new issues
    useEffect(() => {
        if (selectedElement.data.title.startsWith("New") || selectedElement.data.title.length <= 0) {
            titleInputRef.current?.focus();
        }
    }, [selectedElement]);

    // Fetch issue types when project changes
    useEffect(() => {
        if (!currentCloudId || !currentProjectKey) {
            setProjectIssueTypes([]);
            return;
        }

        const cached = issueTypeCache.current.get(cacheKey);
        if (cached) {
            setProjectIssueTypes(cached);
            return;
        }

        let cancelled = false;
        setLoadingTypes(true);
        (async () => {
            try {
                const res = await fetch(
                    `/api/integrations/jira/issueTypes?cloudId=${encodeURIComponent(currentCloudId)}&projectKey=${encodeURIComponent(currentProjectKey)}`
                );
                if (!res.ok) return;
                const json = await res.json() as { types: JiraIssueType[] };
                const types = json.types ?? [];
                issueTypeCache.current.set(cacheKey, types);
                if (!cancelled) setProjectIssueTypes(types);
            } catch {
                // silent
            } finally {
                if (!cancelled) setLoadingTypes(false);
            }
        })();
        return () => { cancelled = true; };
    }, [cacheKey, currentCloudId, currentProjectKey]);

    // Fetch assignees when project changes
    useEffect(() => {
        if (!currentCloudId || !currentProjectKey) {
            setAssignees([]);
            return;
        }

        const cached = assigneeCache.current.get(cacheKey);
        if (cached) {
            setAssignees(cached);
            return;
        }

        let cancelled = false;
        setLoadingAssignees(true);
        (async () => {
            try {
                const res = await fetch(
                    `/api/integrations/jira/assignees?cloudId=${encodeURIComponent(currentCloudId)}&projectKey=${encodeURIComponent(currentProjectKey)}`
                );
                if (!res.ok) return;
                const json = await res.json() as { users: JiraUser[] };
                const users = json.users ?? [];
                assigneeCache.current.set(cacheKey, users);
                if (!cancelled) setAssignees(users);
            } catch {
                // silent
            } finally {
                if (!cancelled) setLoadingAssignees(false);
            }
        })();
        return () => { cancelled = true; };
    }, [cacheKey, currentCloudId, currentProjectKey]);

    // Decide which issue types to show: project-specific if available, otherwise global config fallback
    const displayTypes = projectIssueTypes.length > 0
        ? projectIssueTypes.map((t) => t.name)
        : availableTypes;

    const inputClass = `w-full rounded-lg border border-slate-200 bg-white text-slate-900 shadow-sm outline-none transition focus:border-slate-300 focus:ring-4 focus:ring-blue-100 ${s("px-3 py-2.5 text-sm", "px-2 py-1.5 text-xs")}`;
    const selectClass = `w-full rounded-lg border border-slate-200 bg-white text-slate-900 shadow-sm outline-none transition focus:border-slate-300 focus:ring-4 focus:ring-blue-100 ${s("px-3 py-2 text-sm", "px-2 py-1 text-xs")}`;
    const labelClass = `font-medium text-slate-700 ${s("text-sm", "text-xs")}`;

    return (
        <div className="w-full h-full min-h-0 rounded-2xl flex flex-col">
            <div className={`flex-1 min-h-0 overflow-y-auto pt-0 ${s("px-2 pb-6", "px-1 pb-3")}`}>
                <div className={`flex flex-col ${s("gap-4", "gap-2.5")}`}>

                    {/* Title */}
                    <div className={s("space-y-1.5", "space-y-1")}>
                        <label className={labelClass}>Title</label>
                        <input
                            ref={titleInputRef}
                            value={selectedElement.data.title}
                            onChange={(e) => onDataChange({ title: e.target.value })}
                            className={inputClass}
                            placeholder="Issue title…"
                        />
                    </div>

                    {/* Site + Project */}
                    <div className={`rounded-xl border border-slate-200 bg-slate-50 ${s("p-3", "p-2")}`}>
                        <div className={`grid grid-cols-1 sm:grid-cols-2 ${s("gap-3", "gap-2")}`}>
                            <div className={s("space-y-1.5", "space-y-1")}>
                                <label className="text-xs font-medium text-slate-500">Site</label>
                                <select
                                    value={currentCloudId}
                                    onChange={(e) => {
                                        const site = sites.find((s) => s.id === e.target.value);
                                        if (site) onSiteChange(site.id, site.name);
                                    }}
                                    className={selectClass}
                                >
                                    <option value="">Select site…</option>
                                    {sites.map((s) => (
                                        <option key={s.id} value={s.id}>{s.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className={s("space-y-1.5", "space-y-1")}>
                                <label className="text-xs font-medium text-slate-500 flex gap-1">
                                    Project
                                    {!currentCloudId && <span className="text-slate-400">— select a site first</span>}
                                </label>
                                <select
                                    disabled={!currentCloudId || loadingProjects}
                                    value={currentProjectKey}
                                    onChange={(e) => {
                                        const proj = projects.find((p) => p.key === e.target.value);
                                        // Reset type/assignee when project changes since types differ per project
                                        onDataChange({
                                            projectKey: proj?.key ?? "",
                                            projectName: proj?.name ?? "",
                                            assigneeId: "",
                                            assigneeName: "",
                                        });
                                    }}
                                    className={`${selectClass} disabled:bg-slate-50 disabled:text-slate-400`}
                                >
                                    <option value="">{loadingProjects ? "Loading…" : "Select project…"}</option>
                                    {projects.map((p) => (
                                        <option key={p.key} value={p.key}>{p.name} ({p.key})</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Issue Type — per-project once a project is picked */}
                    <div className={s("space-y-1.5", "space-y-1")}>
                        <label className={labelClass}>
                            Issue Type
                            {loadingTypes && (
                                <span className="ml-2 text-xs font-normal text-slate-400">Loading…</span>
                            )}
                        </label>
                        {displayTypes.length > 0 ? (
                            <select
                                value={selectedElement.data.type}
                                onChange={(e) => onDataChange({ type: e.target.value })}
                                className={selectClass}
                                disabled={loadingTypes}
                            >
                                {displayTypes.map((t) => (
                                    <option key={t} value={t}>{t}</option>
                                ))}
                            </select>
                        ) : (
                            <input
                                value={selectedElement.data.type}
                                onChange={(e) => onDataChange({ type: e.target.value })}
                                className={inputClass}
                                placeholder="Issue type…"
                            />
                        )}
                        {projectIssueTypes.length > 0 && (
                            <p className="text-[11px] text-slate-400">
                                Showing types available in <strong>{currentProjectKey}</strong>
                            </p>
                        )}
                    </div>

                    {/* Assignee */}
                    <div className={s("space-y-1.5", "space-y-1")}>
                        <label className={labelClass}>
                            Assignee
                            {loadingAssignees && (
                                <span className="ml-2 text-xs font-normal text-slate-400">Loading…</span>
                            )}
                            {!currentProjectKey && (
                                <span className="ml-2 text-xs font-normal text-slate-400">— select a project first</span>
                            )}
                        </label>
                        <select
                            disabled={!currentProjectKey || loadingAssignees}
                            value={selectedElement.data.assigneeId ?? ""}
                            onChange={(e) => {
                                const user = assignees.find((u) => u.accountId === e.target.value);
                                onDataChange({
                                    assigneeId: user?.accountId ?? "",
                                    assigneeName: user?.displayName ?? "",
                                });
                            }}
                            className={`${selectClass} disabled:bg-slate-50 disabled:text-slate-400`}
                        >
                            <option value="">
                                {loadingAssignees ? "Loading…" : "Unassigned"}
                            </option>
                            {assignees.map((u) => (
                                <option key={u.accountId} value={u.accountId}>
                                    {u.displayName}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Description */}
                    <div className={s("space-y-1.5", "space-y-1")}>
                        <label className={labelClass}>Description</label>
                        <textarea
                            style={{ resize: "none" }}
                            value={selectedElement.data.description}
                            onChange={(e) => onDataChange({ description: e.target.value })}
                            className={`w-full rounded-lg border border-slate-200 bg-white text-slate-900 shadow-sm outline-none transition focus:border-slate-300 focus:ring-4 focus:ring-blue-100 ${s("min-h-[160px] px-3 py-2.5 text-sm", "min-h-[100px] px-2 py-1.5 text-xs")}`}
                            placeholder="Write a description…"
                        />
                    </div>

                </div>
            </div>
        </div>
    );
}