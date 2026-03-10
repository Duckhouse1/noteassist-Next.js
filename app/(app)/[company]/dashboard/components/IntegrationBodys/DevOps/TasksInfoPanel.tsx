import { Assignee, DevOpsFeature, DevOpsPBI, DevOpsTask } from "@/app/types/OpenAI";
import { useContext, useState } from "react";
import { DevOpsArea, DevOpsIteration, DevOpsProjectsProps, SelectedElementProps } from "./DevOpsPreBody";
import { DevOpsAreaDropdown } from "./AreaDropDown";
import { useEffect, useRef } from "react";
import { clientIsFromTeams } from "@/app/Contexts";


type DevOpsTasksInfoPanelProps = {
    selectedElement: SelectedElementProps
    AvailableAreas: DevOpsArea | null
    AvailableProjects: DevOpsProjectsProps[]
    AvailableAssignees: Assignee[];
    AvailableIterations: DevOpsIteration[]
    DefaultElements: { DefaultProjectName: string, defaultOrganizationName: string }
    onProjectChange: (newProjectID: string) => void;
    onDataChange: (patch: Partial<DevOpsFeature & DevOpsPBI & DevOpsTask>) => void;
    // refetchData: () => void;
};
function findAreaInTreeById(root: DevOpsArea | null, id: number): DevOpsArea | undefined {
    if (!root) return undefined;
    if (root.id === id) return root;

    for (const child of root.children ?? []) {
        const found = findAreaInTreeById(child, id);
        if (found) return found;
    }
    return undefined;
}


export function DevOpsTasksInfoPanel({ DefaultElements, selectedElement, AvailableAreas, AvailableProjects, AvailableAssignees, AvailableIterations, onDataChange, onProjectChange }: DevOpsTasksInfoPanelProps) {

    const { fromTeams } = useContext(clientIsFromTeams);
    const s = (normal: string, small: string) => fromTeams ? small : normal;

    const hasTask = Boolean(selectedElement.type && selectedElement.data.title);
    const titleInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (selectedElement.data.title.startsWith("New") || selectedElement.data.title.length <= 0) {
            titleInputRef.current?.focus();
        }
    }, [selectedElement]);

    return (
        <div className="w-full h-full min-h-0 rounded-2xl flex flex-col">
            <div className={`flex-1 min-h-0 overflow-y-hidden pt-0 ${s("px-2 pb-6", "px-1 pb-3")}`}>
                <div className={`flex flex-col ${s("gap-3", "gap-2")}`}>

                    {/* Title */}
                    <div className={s("space-y-2", "space-y-1")}>
                        <label className={`font-medium text-slate-700 ${s("text-sm", "text-xs")}`}>
                            Title
                        </label>
                        <input
                            ref={titleInputRef}
                            value={selectedElement.data.title}
                            onChange={(e) => onDataChange({ title: e.target.value })}
                            className={`w-full rounded-lg border border-slate-200 bg-white text-slate-900 shadow-sm outline-none transition focus:border-slate-300 focus:ring-4 focus:ring-blue-100 disabled:bg-slate-50 disabled:text-slate-500 ${s("px-3 py-2.5 text-sm", "px-2 py-1.5 text-xs")}`}
                            placeholder="Title…"
                        />
                    </div>

                    {/* Meta */}
                    <div className={`rounded-xl border border-slate-200 bg-slate-50 ${s("p-2", "p-1.5")}`}>
                        <div className={`grid grid-cols-1 sm:grid-cols-3 ${s("gap-4", "gap-2")}`}>

                            {/* Project */}
                            <div className={s("space-y-1.5", "space-y-1")}>
                                <label className={`font-medium text-slate-500 ${s("text-xs", "text-xs")}`}>Project</label>
                                <select
                                    disabled={!hasTask}
                                    value={selectedElement.data.Project?.id ?? ""}
                                    onChange={(e) => onProjectChange(e.currentTarget.value)}
                                    className={`w-full rounded-lg border border-slate-200 bg-white text-slate-900 shadow-sm outline-none transition focus:border-slate-300 focus:ring-4 focus:ring-blue-100 disabled:bg-slate-50 disabled:text-slate-500 ${s("px-3 py-2 text-sm", "px-2 py-1 text-xs")}`}
                                >
                                    <option value="" disabled>Select project</option>
                                    {AvailableProjects.map((project) => (
                                        <option value={project.id} key={project.id}>{project.name}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Area */}
                            <div className={s("space-y-1.5", "space-y-1")}>
                                <label className={`font-medium text-slate-500 flex gap-1 ${s("text-xs", "text-xs")}`}>
                                    Area {!selectedElement.data.Project ? <p className="text-xs text-slate-400"> - Missing project</p> : ""}
                                </label>
                                <DevOpsAreaDropdown
                                    disabled={!hasTask || !selectedElement.data.Project}
                                    areas={AvailableAreas}
                                    value={selectedElement.data.Area?.id}
                                    valueKey="id"
                                    onChange={(newVal) => {
                                        const area = findAreaInTreeById(AvailableAreas, newVal);
                                        onDataChange({ Area: area });
                                    }}
                                    placeholder="Select area"
                                />
                            </div>

                            {/* Iteration */}
                            <div className={s("space-y-1.5", "space-y-1")}>
                                <label className={`font-medium text-slate-500 flex gap-1 ${s("text-xs", "text-xs")}`}>
                                    Iteration {!selectedElement.data.Project ? <p className="text-xs text-slate-400"> - Missing project</p> : ""}
                                </label>
                                <select
                                    disabled={!hasTask || !selectedElement.data.Project}
                                    className={`w-full rounded-lg border border-slate-200 bg-white text-slate-900 shadow-sm outline-none transition focus:border-slate-300 focus:ring-4 focus:ring-blue-100 disabled:bg-slate-50 disabled:text-slate-500 ${s("px-3 py-2 text-sm", "px-2 py-1 text-xs")}`}
                                    value={selectedElement.data.Iteration?.id ?? ""}
                                    onChange={(e) => {
                                        const selectedIteration = AvailableIterations.find((iteration) => iteration.id === e.currentTarget.value);
                                        onDataChange({ Iteration: selectedIteration });
                                    }}
                                >
                                    <option value="" disabled>Select iteration</option>
                                    {AvailableIterations.map((iteration) => (
                                        <option value={iteration.id} key={iteration.id}>{iteration.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Assignee */}
                    <div className={s("space-y-2", "space-y-1")}>
                        <label className={`font-medium text-slate-700 ${s("text-sm", "text-xs")}`}>
                            Assignee
                        </label>
                        <div className="relative">
                            <select
                                disabled={!hasTask || !selectedElement.data.Project}
                                aria-disabled={!selectedElement.data.Project}
                                className={`w-full appearance-none rounded-lg border border-slate-200 bg-white pr-9 text-slate-900 shadow-sm outline-none transition focus:border-slate-300 focus:ring-4 focus:ring-blue-100 disabled:bg-slate-50 disabled:text-slate-500 ${s("px-3 py-2.5 text-sm", "px-2 py-1.5 text-xs")}`}
                                value={selectedElement.data.Assignee?.identity.id ?? ""}
                                onChange={(e) => {
                                    const picked = AvailableAssignees.find((a) => a.identity.id === e.target.value);
                                    onDataChange({ Assignee: picked });
                                }}
                            >
                                <option value="">Unassigned</option>
                                {AvailableAssignees.map((a) => (
                                    <option value={a.identity.id} key={a.identity.id}>{a.identity.displayName}</option>
                                ))}
                            </select>

                            <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-slate-400">
                                <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z" clipRule="evenodd" />
                                </svg>
                            </div>
                        </div>

                        {!selectedElement.data.Project && (
                            <p className="text-xs text-slate-400">Select a project first to choose an assignee</p>
                        )}
                    </div>

                    {/* Description */}
                    <div>
                        <h3 className={`text-slate-900 ${s("text-sm", "text-xs")}`}>Description</h3>
                        <div className={s("pt-2", "pt-1")}>
                            <textarea
                                style={{ resize: "none" }}
                                disabled={!hasTask}
                                value={selectedElement.data.description}
                                onChange={(e) => onDataChange({ description: e.currentTarget.value })}
                                className={`w-full resize-y rounded-lg border border-slate-200 bg-white text-slate-900 shadow-sm outline-none transition focus:border-slate-300 focus:ring-4 focus:ring-blue-100 disabled:bg-slate-50 disabled:text-slate-500 ${s("min-h-[180px] px-3 py-2.5 text-sm", "min-h-[120px] px-2 py-1.5 text-xs")}`}
                                placeholder="Write a description…"
                            />
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}