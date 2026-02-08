// components/TasksDisplayPanel.tsx
import { DevOpsFeature, DevOpsResponse, OpenAIResponse } from "@/app/types/OpenAI";
import { DisplayedElementProps, RemoveAction } from "./IntegrationBodys/DevOpsPreBody";
import { useState } from "react";

export type DevOpsTaskTypes = "Feature" | "PBI" | "Task";

interface TasksDisplayPanelProps {
    features: DevOpsFeature[] | null;
    onClick: (displayedElement: DisplayedElementProps) => void;
    onRemove: (action: RemoveAction) => void;
    onCreateNewElementClick: (type: DevOpsTaskTypes, ParentID:string |null) => void;
}



export const TasksDisplayPanel = ({ features, onClick, onRemove, onCreateNewElementClick }: TasksDisplayPanelProps) => {

    return (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm
             w-full min-w-0 p-6
             flex flex-col min-h-0
             max-h-[80vh]
            ">
            <h1 className="text-lg font-semibold text-slate-900 mb-6 flex-shrink-0">
                Action - Tasks
            </h1>
            <div className="flex justify-end">
                <button
                    className=" justify-end mr-4 cursor-pointer
                    px-3 py-1.5 text-sm font-medium
                    rounded-md border border-blue-200
                    text-blue-600 bg-blue-50
                    hover:bg-blue-100 hover:border-blue-300"
                    onClick={() => onCreateNewElementClick("Feature",null)}
                    >
                        
                    + New Feature
                </button>
            </div>
            {features ? (
                // ✅ ONLY THIS PART SCROLLS
                <div className="flex-1 min-h-0 overflow-y-auto space-y-6 pt-4">
                    {features.map((feature, featureIndex) => (
                        <div key={feature.id} className="space-y-4 ">
                            {/* Feature Card */}
                            <div
                                className="w-[97%] max-w-4xl ml-auto relative rounded-lg bg-slate-50/50 border border-slate-200 p-5 cursor-pointer active:scale-95 transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-md hover:bg-slate-100/60 hover:border-slate-300"
                                onClick={() => onClick({ type: "Feature", data: feature })}
                            >
                                <RemoveIcon
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onRemove({ type: "Feature", featureId: feature.id });
                                    }}
                                />
                                <div className="flex items-end gap-3">
                                    <span
                                        className="
      self-start
      flex-shrink-0 flex items-center justify-center
      w-8 h-8 rounded-md
      bg-white border border-slate-200
      text-sm font-semibold text-slate-700
    "
                                    >
                                        {featureIndex + 1}
                                    </span>

                                    <div className="flex-1 min-w-0">
                                        <h2 className="font-semibold text-slate-900">
                                            Feature: {feature.title}
                                        </h2>
                                        {/* <p className="text-sm text-slate-500 mt-0.5">
                                            Capability / deliverable
                                        </p> */}
                                    </div>

                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onCreateNewElementClick("PBI",feature.id)
                                        }}
                                        className=" ml-auto cursor-pointer
                                            px-3 py-1.5 text-sm font-medium
                                            rounded-md border border-blue-200
                                            text-blue-600 bg-blue-50
                                            hover:bg-blue-100 hover:border-blue-300
                                            "
                                    >
                                        + Add PBI
                                    </button>
                                </div>

                            </div>

                            {/* PBIs */}
                            <div className="pl-8 space-y-4">
                                {feature.pbis.map((pbi, pbiIndex) => (
                                    <div key={pbi.id} className="space-y-3">
                                        {/* PBI Card */}
                                        <div
                                            className="relative rounded-lg bg-slate-50/30 border border-slate-200 p-4 cursor-pointer active:scale-95 transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-md hover:bg-slate-100/40 hover:border-slate-300"
                                            onClick={() => onClick({ type: "PBI", data: pbi })}
                                        >
                                            <RemoveIcon
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onRemove({ type: "PBIS", pbiId: pbi.id, featureId: feature.id });
                                                }}
                                            />

                                            <div className="flex items-end gap-3">
                                                <span className="  self-start
      flex-shrink-0 flex items-center justify-center
      w-8 h-8 rounded-md
      bg-white border border-slate-200
      text-sm font-semibold text-slate-700
    ">
                                                    {featureIndex + 1}.{pbiIndex + 1}
                                                </span>

                                                <div className="flex-1 min-w-0">
                                                    <h3 className="font-semibold text-slate-800 text-sm">
                                                        PBI: {pbi.title}
                                                    </h3>
                                                    {/* <p className="text-xs text-slate-500 mt-0.5">
                                                        Requirement item
                                                    </p> */}
                                                </div>

                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onCreateNewElementClick("Task", pbi.id)
                                                    }}
                                                    className="
                                                    cursor-pointer
                                                        ml-auto
                                                        px-3 py-1.5 text-xs font-medium
                                                        rounded-md border border-blue-200
                                                        text-blue-600 bg-blue-50
                                                        hover:bg-blue-100 hover:border-blue-300
                                                    "
                                                >
                                                    + Add Task
                                                </button>
                                            </div>
                                        </div>


                                        {/* Tasks */}
                                        <div className="pl-8 space-y-2">
                                            {pbi.tasks.map((task, taskIndex) => (
                                                <div
                                                    key={task.id}
                                                    className="relative rounded-lg bg-white border border-slate-200 p-4 cursor-pointer active:scale-95 transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-lg hover:bg-slate-50 hover:border-blue-300"
                                                    onClick={() => onClick({ type: "Task", data: task })}
                                                >
                                                    <RemoveIcon
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            onRemove({ type: "Tasks", taskId: task.id, pbiId: pbi.id, featureId: feature.id });
                                                        }}
                                                    />
                                                    <div className="flex items-start gap-3">
                                                        <span className="flex-shrink-0 flex items-center justify-center px-2 h-6 rounded bg-slate-50 border border-slate-200 text-xs font-medium text-slate-600">
                                                            {featureIndex + 1}.{pbiIndex + 1}.{taskIndex + 1}
                                                        </span>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="font-semibold text-slate-800 text-sm">Task: {task.title}</p>
                                                            {/* <p className="text-xs text-slate-500 mt-0.5">Implementation step</p> */}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="mt-4 text-sm text-slate-600">Select a sprint to see suggested tasks here.</p>
            )}
        </div>
    );
};
// Remove Icon Helper Component
const RemoveIcon = ({ onClick }: { onClick: (e: React.MouseEvent) => void }) => {
    return (
        <button
            onClick={onClick}
            className="absolute -top-3 -left-3 z-10 flex items-center justify-center w-6 h-6 rounded-full bg-slate-200 hover:bg-red-200 transition-colors group border-2 border-white shadow-sm"
            aria-label="Remove"
        >
            <span className="text-slate-600 group-hover:text-red-400 text-sm font-semibold">×</span>
        </button>
    );
};