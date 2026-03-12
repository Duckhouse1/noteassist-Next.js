"use client";

import { useEffect, useRef, useState } from "react";
import { JiraElement } from "@/app/types/OpenAI";
import { SelectedElement } from "@/app/Components/Hooks/useElementTree";

type JiraIssueNodeProps = {
    node: JiraElement;
    indexLabel: string;
    depth?: number;
    selectedCardClass: string;
    /** Returns the project-specific issue types for a given cloud+project, or the global fallback. */
    getIssueTypesForElement: (cloudId?: string, projectKey?: string) => string[];
    isSelected: (id: string) => boolean;
    domIdFor: (id: string) => string;
    onClick: (el: SelectedElement<JiraElement>) => void;
    onRemove: (id: string) => void;
    onAddChild: (parentElement: JiraElement, type: string) => void;
};

export function JiraIssueNode({
    node, indexLabel, depth = 0, selectedCardClass, getIssueTypesForElement,
    isSelected, domIdFor, onClick, onRemove, onAddChild,
}: JiraIssueNodeProps) {
    const selected = isSelected(node.id);
    const [openDropdown, setOpenDropdown] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Types specific to this node's project
    const childTypes = getIssueTypesForElement(node.cloudId, node.projectKey);

    const shrinkPerLevel = 24;
    const widthStyle = depth === 0
        ? { width: "97%" }
        : { width: `calc(100% - ${Math.min(depth * shrinkPerLevel, 200)}px)` };

    const indentClass = depth === 0 ? "" : depth === 1 ? "pl-6" : depth === 2 ? "pl-10" : depth === 3 ? "pl-14" : "pl-16";

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (!dropdownRef.current?.contains(e.target as Node)) setOpenDropdown(false);
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    return (
        <div className="space-y-3 mr-1">
            <div
                id={domIdFor(node.id)}
                style={widthStyle}
                className={[
                    "relative ml-auto rounded-lg border border-slate-200 cursor-pointer",
                    depth === 0 ? "max-w-4xl bg-slate-50/50 p-5" : "bg-slate-50/30 p-4",
                    openDropdown ? "shadow-md" : "active:scale-95 transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-md hover:bg-slate-100/40 hover:border-slate-300",
                    selected ? selectedCardClass : "",
                ].join(" ")}
                onClick={() => onClick({ data: node })}
            >
                <button
                    onClick={(e) => { e.stopPropagation(); onRemove(node.id); }}
                    className="absolute -top-3 -left-3 z-10 flex items-center justify-center w-6 h-6 rounded-full bg-slate-200 hover:bg-red-200 transition-colors group border-2 border-white shadow-sm"
                >
                    <span className="text-slate-600 group-hover:text-red-400 text-sm font-semibold">×</span>
                </button>

                <div className="flex items-start gap-3 min-w-0">
                    <span className="mt-0.5 flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-md bg-white border border-slate-200 text-sm font-semibold text-slate-700">
                        {indexLabel}
                    </span>
                    <div className="flex-1 min-w-0">
                        <div className="leading-none mb-1">
                            <span className="inline-flex rounded-md bg-blue-50 border border-blue-200 px-2 py-0.5 text-[10px] font-bold text-blue-700 uppercase tracking-wide">
                                {node.type}
                            </span>
                        </div>
                        <div className="font-semibold text-slate-900 truncate">{node.title}</div>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                            {(node.cloudName || node.projectName) && (
                                <span className="text-xs text-slate-400 truncate">
                                    {[node.cloudName, node.projectName].filter(Boolean).join(" · ")}
                                </span>
                            )}
                            {node.assigneeName && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 border border-slate-200 px-2 py-0.5 text-[11px] text-slate-500">
                                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                                    </svg>
                                    {node.assigneeName}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* + Add child — uses this node's project types */}
                    {childTypes.length > 0 && (
                        <div className="ml-auto shrink-0 relative" onClick={(e) => e.stopPropagation()} ref={dropdownRef}>
                            <button
                                type="button"
                                onClick={() => setOpenDropdown((v) => !v)}
                                className="px-2.5 py-1 text-xs font-medium rounded-md border border-gray-300 text-black bg-gray-50 hover:bg-gray-200"
                            >
                                + Add
                            </button>
                            {openDropdown && (
                                <div className="absolute right-0 mt-1 w-44 rounded-lg border border-slate-200 bg-white shadow-lg z-50 overflow-hidden">
                                    <div className="px-3 py-1.5 border-b border-slate-100">
                                        <p className="text-[10px] uppercase tracking-wider text-slate-400">
                                            {node.projectName || node.projectKey
                                                ? `${node.projectName || node.projectKey} types`
                                                : "Child type"}
                                        </p>
                                    </div>
                                    {childTypes.map((t) => (
                                        <button key={t} type="button"
                                            onClick={() => { onAddChild(node, t); setOpenDropdown(false); }}
                                            className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition"
                                        >
                                            <div className="flex items-center gap-2">
                                                <div className="h-2.5 w-2.5 rounded-full bg-blue-400" />
                                                {t}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {node.children?.length > 0 && (
                <div className={[indentClass, "space-y-4"].join(" ")}>
                    {node.children.map((child, i) => (
                        <JiraIssueNode
                            key={child.id} node={child} indexLabel={`${indexLabel}.${i + 1}`}
                            depth={depth + 1} selectedCardClass={selectedCardClass}
                            getIssueTypesForElement={getIssueTypesForElement}
                            isSelected={isSelected} domIdFor={domIdFor}
                            onClick={onClick} onRemove={onRemove} onAddChild={onAddChild}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}