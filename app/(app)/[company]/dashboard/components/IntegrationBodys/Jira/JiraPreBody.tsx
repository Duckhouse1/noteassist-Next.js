"use client";

import { useContext } from "react";
import { DevOpsElement, DevOpsResponse } from "@/app/types/OpenAI";
import { OpenAIActionSolutionsMapContext } from "@/app/Contexts";

export const JiraPreBody = ({ integrationKey }: { integrationKey: string }) => {
    const { OpenAISolutionsMap } = useContext(OpenAIActionSolutionsMapContext);
    const response = OpenAISolutionsMap.get(integrationKey);

    if (response?.type !== "jira_tasks") return null;

    const data = response.content as DevOpsResponse;
    const elements = data.elements ?? [];

    if (elements.length === 0) {
        return (
            <div className="flex items-center justify-center rounded-2xl border border-dashed border-slate-200 py-16 text-sm text-slate-400">
                No issues were extracted from your notes.
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 mb-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
                    <svg className="h-4 w-4 text-white" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M11.53 2.232a1.003 1.003 0 0 1 .94 0l9 4.855a1 1 0 0 1 .004 1.756l-9 4.995a1.003 1.003 0 0 1-.948.004l-9-4.855a1 1 0 0 1-.006-1.76z" />
                        <path d="m2.466 12.632 9.06 4.888a1.003 1.003 0 0 0 .948 0l9.06-5.03a.5.5 0 0 1 .5.866l-9.06 5.03a2.005 2.005 0 0 1-1.898-.004l-9.06-4.888a.5.5 0 0 1 .45-.862z" />
                    </svg>
                </div>
                <div>
                    <p className="text-sm font-semibold text-slate-900">Jira Issues Preview</p>
                    <p className="text-xs text-slate-400">
                        {countAll(elements)} issue{countAll(elements) !== 1 ? "s" : ""} extracted
                    </p>
                </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden divide-y divide-slate-100">
                {elements.map((el) => (
                    <JiraElementNode key={el.id} element={el} depth={0} />
                ))}
            </div>
        </div>
    );
};

function JiraElementNode({ element, depth }: { element: DevOpsElement; depth: number }) {
    const indent = depth * 24;

    return (
        <>
            <div
                className="flex items-start gap-3 px-5 py-3 hover:bg-slate-50/50 transition-colors"
                style={{ paddingLeft: `${20 + indent}px` }}
            >
                <span className="mt-0.5 inline-flex shrink-0 rounded-md bg-blue-50 border border-blue-200 px-2 py-0.5 text-[10px] font-bold text-blue-700 uppercase tracking-wide">
                    {element.type}
                </span>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 leading-snug">{element.title}</p>
                    {element.description && (
                        <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">{element.description}</p>
                    )}
                </div>
            </div>
            {element.children?.map((child) => (
                <JiraElementNode key={child.id} element={child} depth={depth + 1} />
            ))}
        </>
    );
}

function countAll(elements: DevOpsElement[]): number {
    let count = 0;
    for (const el of elements) {
        count += 1;
        if (el.children) count += countAll(el.children);
    }
    return count;
}