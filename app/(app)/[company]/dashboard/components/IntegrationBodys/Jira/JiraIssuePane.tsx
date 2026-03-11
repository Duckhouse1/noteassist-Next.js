"use client";

import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { JiraElement } from "@/app/types/OpenAI";
import { SelectedElement } from "@/app/Components/Hooks/useElementTree";
import { JiraIssueNode } from "./JiraIssueNode";
import { clientIsFromTeams } from "@/app/Contexts";

interface JiraIssuePaneProps {
    elements: JiraElement[];
    availableTypes: string[];
    selectedElement: SelectedElement<JiraElement> | null;
    onClick: (el: SelectedElement<JiraElement>) => void;
    onRemove: (id: string) => void;
    onAddRoot: (type: string) => void;
    onAddChild: (parentId: string, type: string) => void;
}


export function JiraIssuePane({ elements, availableTypes, selectedElement, onClick, onRemove, onAddRoot, onAddChild }: JiraIssuePaneProps) {
    const { fromTeams } = useContext(clientIsFromTeams);
    const s = (normal: string, small: string) => fromTeams ? small : normal;

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
        // <div className={`rounded-2xl border border-slate-200 bg-white shadow-sm w-full min-w-0 flex flex-col min-h-0 h-full ${s("p-6", "p-3")}`}>
            <div className={`rounded-2xl border border-slate-200 bg-white shadow-sm w-full min-w-0 p-3 lg:p-6 flex flex-col min-h-[40vh] max-h-[40vh] lg:min-h-[64vh] lg:max-h-[64vh] ${s("p-6", "p-3")}`}>

            <h1 className={`font-semibold text-slate-900 flex-shrink-0 ${s("text-lg mb-2", "text-sm mb-1")}`}>Jira Issues</h1>

            <div className={s("flex justify-end mb-2", "flex justify-end mb-1")}>
                <div className="relative inline-block" ref={dropdownRef}>
                    <button
                        type="button"
                        className={`cursor-pointer font-medium rounded-md border border-gray-300 text-black bg-gray-50 hover:bg-gray-200 ${s("px-3 py-1.5 text-sm", "px-2 py-1 text-xs")}`}
                        onClick={() => setOpenDropdown((v) => !v)}
                    >
                        + New Issue
                    </button>
                    {openDropdown && (
                        <div className={`absolute top-full left-0 mt-1 rounded-lg border border-slate-200 bg-white shadow-lg z-50 overflow-hidden ${s("w-44", "w-36")}`}>
                            {availableTypes.length === 0 ? (
                                <div className={`text-slate-500 ${s("px-3 py-2 text-xs", "px-2 py-1 text-xs")}`}>No issue types configured</div>
                            ) : (
                                availableTypes.map((t) => (
                                    <button key={t} type="button"
                                        onClick={() => { onAddRoot(t); setOpenDropdown(false); }}
                                        className={`w-full text-left text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition ${s("px-3 py-2 text-sm", "px-2 py-1 text-xs")}`}
                                    >
                                        <div className={`flex items-center ${s("gap-2", "gap-1.5")}`}>
                                            <div className={`rounded-full bg-blue-400 ${s("h-2.5 w-2.5", "h-2 w-2")}`} />
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
                <div ref={scrollAreaRef} className={`flex-1 min-h-0 min-w-0 overflow-y-auto overflow-x-hidden ${s("space-y-6 pt-4 pb-5", "space-y-3 pt-2 pb-3")}`}>
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
                    <p className={`text-slate-500 ${s("text-sm", "text-xs")}`}>No issues yet. Click &quot;+ New Issue&quot; to add one.</p>
                </div>
            )}
        </div>
    );
}