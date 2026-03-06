"use client";

import { useEffect, useRef } from "react";
import { JiraElement } from "@/app/types/OpenAI";
import { SelectedElement } from "@/app/Components/Hooks/useElementTree";
import { JiraCloudSite, JiraProject } from "@/lib/Integrations/Jira/Configuration";

type JiraIssueInfoPanelProps = {
    selectedElement: SelectedElement<JiraElement>;
    availableTypes: string[];
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
    const titleInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (selectedElement.data.title.startsWith("New") || selectedElement.data.title.length <= 0) {
            titleInputRef.current?.focus();
        }
    }, [selectedElement]);

    const currentCloudId = selectedElement.data.cloudId ?? "";
    const currentProjectKey = selectedElement.data.projectKey ?? "";

    return (
        <div className="w-full h-full min-h-0 rounded-2xl flex flex-col">
            <div className="flex-1 min-h-0 overflow-y-auto px-2 pb-6 pt-0">
                <div className="flex flex-col gap-3">

                    {/* Title */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Title</label>
                        <input
                            ref={titleInputRef}
                            value={selectedElement.data.title}
                            onChange={(e) => onDataChange({ title: e.target.value })}
                            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900
                                shadow-sm outline-none transition focus:border-slate-300 focus:ring-4 focus:ring-blue-100"
                            placeholder="Issue title…"
                        />
                    </div>

                    {/* Site + Project */}
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-2">
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-slate-500">Site</label>
                                <select
                                    value={currentCloudId}
                                    onChange={(e) => {
                                        const site = sites.find((s) => s.id === e.target.value);
                                        if (site) onSiteChange(site.id, site.name);
                                    }}
                                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900
                                        shadow-sm outline-none transition focus:border-slate-300 focus:ring-4 focus:ring-blue-100"
                                >
                                    <option value="">Select site…</option>
                                    {sites.map((s) => (
                                        <option key={s.id} value={s.id}>{s.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-slate-500 flex gap-1">
                                    Project
                                    {!currentCloudId && <span className="text-slate-400">— select a site first</span>}
                                </label>
                                <select
                                    disabled={!currentCloudId || loadingProjects}
                                    value={currentProjectKey}
                                    onChange={(e) => {
                                        const proj = projects.find((p) => p.key === e.target.value);
                                        onDataChange({ projectKey: proj?.key ?? "", projectName: proj?.name ?? "" });
                                    }}
                                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900
                                        shadow-sm outline-none transition focus:border-slate-300 focus:ring-4 focus:ring-blue-100
                                        disabled:bg-slate-50 disabled:text-slate-400"
                                >
                                    <option value="">{loadingProjects ? "Loading…" : "Select project…"}</option>
                                    {projects.map((p) => (
                                        <option key={p.key} value={p.key}>{p.name} ({p.key})</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Issue Type */}
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-slate-700">Issue Type</label>
                        {availableTypes.length > 0 ? (
                            <select
                                value={selectedElement.data.type}
                                onChange={(e) => onDataChange({ type: e.target.value })}
                                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900
                                    shadow-sm outline-none transition focus:border-slate-300 focus:ring-4 focus:ring-blue-100"
                            >
                                {availableTypes.map((t) => (
                                    <option key={t} value={t}>{t}</option>
                                ))}
                            </select>
                        ) : (
                            <input
                                value={selectedElement.data.type}
                                onChange={(e) => onDataChange({ type: e.target.value })}
                                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900
                                    shadow-sm outline-none transition focus:border-slate-300 focus:ring-4 focus:ring-blue-100"
                                placeholder="Issue type…"
                            />
                        )}
                    </div>

                    {/* Description */}
                    <div>
                        <h3 className="text-sm text-slate-900">Description</h3>
                        <div className="pt-2">
                            <textarea
                                style={{ resize: "none" }}
                                value={selectedElement.data.description}
                                onChange={(e) => onDataChange({ description: e.target.value })}
                                className="min-h-[180px] w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5
                                    text-sm text-slate-900 shadow-sm outline-none transition
                                    focus:border-slate-300 focus:ring-4 focus:ring-blue-100"
                                placeholder="Write a description…"
                            />
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}