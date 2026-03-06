"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { JiraElement } from "@/app/types/OpenAI";
import { SelectedElement } from "@/app/Components/Hooks/useElementTree";
import { JiraIssueNode } from "./JiraIssueNode";

interface JiraIssuePaneProps {
    elements: JiraElement[];
    availableTypes: string[];
    selectedElement: SelectedElement<JiraElement> | null;
    onClick: (el: SelectedElement<JiraElement>) => void;
    onRemove: (id: string) => void;
    onAddRoot: (type: string) => void;
    onAddChild: (parentId: string, type: string) => void;
}

export function JiraIssuePane({
    elements,
    availableTypes,
    selectedElement,
    onClick,
    onRemove,
    onAddRoot,
    onAddChild,
}: JiraIssuePaneProps) {
    const scrollAreaRef = useRef<HTMLDivElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const [openDropdown, setOpenDropdown] = useState(false);

    const selectedId = selectedElement?.data.id;
    const isSelected = (id: string) => selectedId === id;
    const domIdFor = (id: string) => `jira-issuepane-${id}`;
    const selectedDomId = useMemo(() => selectedId ? domIdFor(selectedId) : null, [selectedId]);

    useEffect(() => {
        if (!selectedDomId) return;
        const container = scrollAreaRef.current;
        if (!container) return;
        const el = container.querySelector<HTMLElement>(`#${CSS.escape(selectedDomId)}`);
        if (!el) return;
        const containerRect = container.getBoundingClientRect();
        const elRect = el.getBoundingClientRect();
        const elTopWithin = elRect.top - containerRect.top + container.scrollTop;
        container.scrollTo({ top: Math.max(0, elTopWithin - container.clientHeight / 2 + elRect.height / 2), behavior: "smooth" });
    }, [selectedDomId]);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (!dropdownRef.current?.contains(e.target as Node)) setOpenDropdown(false);
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const selectedCardClass =
        "ring-1 ring-black shadow-lg bg-gradient-to-r from-gray-200 to-white border-black " +
        "before:content-[''] before:absolute before:left-0 before:top-0 before:h-full before:w-0.5 before:rounded-l-lg before:bg-gray-600";

    return (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm w-full min-w-0 p-6 flex flex-col min-h-0 h-full">
            <h1 className="text-lg font-semibold text-slate-900 mb-2 flex-shrink-0">Jira Issues</h1>

            <div className="flex justify-end mb-2">
                <div className="relative inline-block" ref={dropdownRef}>
                    <button
                        type="button"
                        className="cursor-pointer px-3 py-1.5 text-sm font-medium rounded-md border border-gray-300 text-black bg-gray-50 hover:bg-gray-200"
                        onClick={() => setOpenDropdown((v) => !v)}
                    >
                        + New Issue
                    </button>
                    {openDropdown && (
                        <div className="absolute top-full left-0 mt-1 w-44 rounded-lg border border-slate-200 bg-white shadow-lg z-50 overflow-hidden">
                            {availableTypes.length === 0 ? (
                                <div className="px-3 py-2 text-xs text-slate-500">No issue types configured</div>
                            ) : (
                                availableTypes.map((t) => (
                                    <button key={t} type="button"
                                        onClick={() => { onAddRoot(t); setOpenDropdown(false); }}
                                        className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition"
                                    >
                                        <div className="flex items-center gap-2">
                                            <div className="h-2.5 w-2.5 rounded-full bg-blue-400" />
                                            {t}
                                        </div>
                                    </button>
                                ))
                            )}
                        </div>
                    )}
                </div>
            </div>

            {elements.length > 0 ? (
                <div ref={scrollAreaRef} className="flex-1 min-h-0 min-w-0 overflow-y-auto overflow-x-hidden space-y-6 pt-4 pb-5">
                    {elements.map((root, i) => (
                        <JiraIssueNode
                            key={root.id}
                            node={root}
                            indexLabel={`${i + 1}`}
                            depth={0}
                            selectedCardClass={selectedCardClass}
                            availableTypes={availableTypes}
                            isSelected={isSelected}
                            domIdFor={domIdFor}
                            onClick={onClick}
                            onRemove={onRemove}
                            onAddChild={onAddChild}
                        />
                    ))}
                </div>
            ) : (
                <div className="flex-1 flex items-center justify-center">
                    <p className="text-sm text-slate-500">No issues yet. Click &quot;+ New Issue&quot; to add one.</p>
                </div>
            )}
        </div>
    );
}