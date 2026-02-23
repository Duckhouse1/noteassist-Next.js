import { Assignee, DevOpsFeature, DevOpsPBI, DevOpsTask } from "@/app/types/OpenAI";
import { useState } from "react";
import { DevOpsArea, DevOpsIteration, DevOpsProjectsProps, SelectedElementProps } from "./DevOpsPreBody";
import { DevOpsAreaDropdown } from "./AreaDropDown";
import { useEffect, useRef } from "react";


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
//VIGTIGIGG

//IMPLEMENTER SÅDAN AT HVIS INGEN AREAS, ASSIGNEES ELLER ITERATIONS, MEN SELECTED PROJECT ER DER; REFETCH DEM ALLE
export function DevOpsTasksInfoPanel({ DefaultElements, selectedElement, AvailableAreas, AvailableProjects, AvailableAssignees, AvailableIterations, onDataChange, onProjectChange }: DevOpsTasksInfoPanelProps) {

    const hasTask = Boolean(selectedElement.type && selectedElement.data.title);
    const titleInputRef = useRef<HTMLInputElement>(null);
    useEffect(() => {
        if (selectedElement.data.title.startsWith("New") || selectedElement.data.title.length <= 0) {
            titleInputRef.current?.focus();
        }
    }, [selectedElement]);

    // useEffect(() => {
    //     if(selectedElement.data.Project != null && AvailableAreas == null){
    //         refetchData();
    //     }
    // },[])

    return (
        <div className="w-full h-full min-h-0 rounded-2xl flex flex-col">
            {/* Header (fixed) */}
            {/* <div className="flex-shrink-0 p-6 pb-4 rounded-b-2xl border-gray-100 border-b-2">
                <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                        <h1 className="truncate text-lg font-semibold text-slate-900">
                            {hasTask ? (
                                <>
                                    <span className="text-slate-500">{selectedElement.type}</span>
                                    <span className="text-slate-300"> · </span>
                                    <span>{selectedElement.data.title}</span>
                                </>
                            ) : (
                                "Task info"
                            )}
                        </h1>
                        <p className="mt-1 text-xs text-slate-500">
                            {hasTask ? "" : "Select a task to see more details"}
                        </p>
                    </div>

                    {hasTask && (
                        <span className="flex-shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                            {selectedElement.type}
                        </span>
                    )}
                </div>
            </div> */}

            {/* Scroll area (everything below header) */}
            <div className="flex-1 min-h-0 overflow-y-hidden px-2 pb-6 pt-0">
                <div className="flex flex-col gap-3">
                    {/* Title */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">
                            Title
                        </label>

                        <input
                            ref={titleInputRef}
                            value={selectedElement.data.title}
                            onChange={(e) => onDataChange({ title: e.target.value })}
                            className="
                                    w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900
                                    shadow-sm outline-none transition
                                    focus:border-slate-300 focus:ring-4 focus:ring-blue-100
                                    disabled:bg-slate-50 disabled:text-slate-500
                                    "
                            placeholder="Title…"
                        />
                    </div>
                    {/* Meta */}
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-2">
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-slate-500">Project</label>
                                <select
                                    disabled={!hasTask}
                                    value={selectedElement.data.Project?.id ?? ""} // ✅ the real selected project
                                    onChange={(e) => onProjectChange(e.currentTarget.value)
                                    } className="
                                        w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900
                                        shadow-sm outline-none transition
                                        focus:border-slate-300 focus:ring-4 focus:ring-blue-100
                                        disabled:bg-slate-50 disabled:text-slate-500
                                    "
                                // defaultValue=""
                                >
                                    <option value="" disabled>
                                        Select project
                                    </option>
                                    {AvailableProjects.map((project) => (
                                        <option value={project.id} key={project.id}>
                                            {project.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-slate-500 flex gap-1">
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

                                {/* {!selectedElement.data.Project && (
                                    <p className="text-xs text-slate-400">
                                        Select a project first to choose an area
                                    </p>
                                )} */}
                            </div>


                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-slate-500 flex gap-1">
                                    Iteration {!selectedElement.data.Project ? <p className="text-xs text-slate-400"> - Missing project</p> : ""}
                                </label>
                                <select
                                    disabled={!hasTask || !selectedElement.data.Project}
                                    className="
                    w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900
                    shadow-sm outline-none transition
                    focus:border-slate-300 focus:ring-4 focus:ring-blue-100
                    disabled:bg-slate-50 disabled:text-slate-500
                  "
                                    value={selectedElement.data.Iteration?.id ?? ""}
                                    onChange={(e) => {
                                        const selectedIteration = AvailableIterations.find((iteration) => iteration.id === e.currentTarget.value)
                                        onDataChange({ Iteration: selectedIteration })
                                    }}
                                >
                                    <option value="" disabled>
                                        Select iteration
                                    </option>
                                    {AvailableIterations.map((iteration) => (
                                        <option value={iteration.id} key={iteration.id}>
                                            {iteration.name}
                                        </option>
                                    ))}
                                </select>
                                {/* {!selectedElement.data.Project && (
                                    <p className="text-xs text-slate-400">
                                        Select a project first to choose an Iteration
                                    </p>
                                )} */}
                            </div>
                        </div>
                    </div>

                    {/* Assignee */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">
                            Assignee
                        </label>

                        <div className="relative">
                            <select
                                disabled={!hasTask || !selectedElement.data.Project}
                                aria-disabled={!selectedElement.data.Project}
                                className="
                                w-full appearance-none rounded-lg border border-slate-200 bg-white
                                px-3 py-2.5 pr-9 text-sm text-slate-900 shadow-sm outline-none transition
                                focus:border-slate-300 focus:ring-4 focus:ring-blue-100
                                disabled:bg-slate-50 disabled:text-slate-500
                            "
                                value={selectedElement.data.Assignee?.identity.id ?? ""}
                                onChange={(e) => {
                                    const id = e.target.value;
                                    const picked = AvailableAssignees.find(
                                        (a) => a.identity.id === id
                                    );
                                    onDataChange({ Assignee: picked });
                                }}
                            >
                                <option value="">Unassigned</option>

                                {AvailableAssignees.map((a) => (
                                    <option value={a.identity.id} key={a.identity.id}>
                                        {a.identity.displayName}
                                    </option>
                                ))}
                            </select>

                            <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-slate-400">
                                <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                                    <path
                                        fillRule="evenodd"
                                        d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                            </div>
                        </div>

                        {/* Helper text when Project is missing */}
                        {!selectedElement.data.Project && (
                            <p className="text-xs text-slate-400">
                                Select a project first to choose an assignee
                            </p>
                        )}

                        {/* Existing status text */}
                        {/* <p className="text-xs text-slate-500">
                            {selectedElement.data.Assignee ? (
                                <>
                                    Currently assigned to{" "}
                                    <span className="font-medium text-slate-700">
                                        {selectedElement.data.Assignee.identity.displayName}
                                    </span>
                                </>
                            ) : (
                                "Currently unassigned"
                            )}
                        </p> */}
                    </div>


                    {/* Description */}
                    <div className="">
                        <div className="">
                            <h3 className="text-sm text-slate-900">Description</h3>
                        </div>

                        <div className="pt-2">
                            <textarea
                                style={{ resize: "none" }}
                                disabled={!hasTask}
                                value={selectedElement.data.description}
                                onChange={(e) => {
                                    onDataChange({ description: e.currentTarget.value })

                                }}
                                // onBlur={() => onChange({ description: draftDescription })}
                                className="
                  min-h-[180px] w-full resize-y rounded-lg border border-slate-200 bg-white px-3 py-2.5
                  text-sm text-slate-900 shadow-sm outline-none transition
                  focus:border-slate-300 focus:ring-4 focus:ring-blue-100
                  disabled:bg-slate-50 disabled:text-slate-500
                "
                                placeholder="Write a description…"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
