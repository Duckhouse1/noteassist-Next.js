import { DevOpsElement, DevOpsTaskTypes } from "@/app/types/OpenAI";
import { SelectedElementProps, RemoveAction } from "./DevOpsPreBody";
import { TypePill } from "./PillHelper";

import { useEffect, useId, useRef, useState } from "react";
import { RemoveIcon } from "./TaskDisplayPanel";
import { WorkItemType } from "@/app/api/integrations/azure-devops/WorkItem/GetWorkItemTypesByProject/route";

type DevOpsNodeProps = {
    node: DevOpsElement;
    indexLabel: string;
    depth?: number;
    selectedCardClass: string;

    isSelected: (type: DevOpsTaskTypes, id: string) => boolean;
    domIdFor: (type: DevOpsTaskTypes, id: string) => string;

    onClick: (displayedElement: SelectedElementProps) => void;
    onRemove: (action: RemoveAction) => void;
    onCreateNewElementClick: (type: string, ParentID: string | null) => void;

    availableTypes: WorkItemType[]; // <- you control this list
};

export const DevOpsNode = ({ node, indexLabel, depth = 0, selectedCardClass, isSelected, domIdFor, onClick,
    onRemove, onCreateNewElementClick, availableTypes, }: DevOpsNodeProps) => {

    const type = node.type as DevOpsTaskTypes;
    const selected = isSelected(type, node.id);
    const selectId = useId();
    const [createType, setCreateType] = useState<DevOpsTaskTypes | "">("");
    const shrinkPerLevel = 25; // pixels removed per depth level
    const maxShrink = 240;     // prevent collapsing too much
    const [openWIT, setOpenWIT] = useState(false);
    const dropdownRef = useRef<HTMLDivElement | null>(null);
    const widthStyle =
        depth === 0
            ? { width: "97%" }
            : {
                width: `calc(100% - ${Math.min(
                    depth * shrinkPerLevel,
                    maxShrink
                )}px)`,
            };
    const indentClass =
        depth === 0 ? "" :
            depth === 1 ? "pl-8" :
                depth === 2 ? "pl-12" :
                    depth === 3 ? "pl-16" : "pl-20";

    //Close on outside click from dropdown
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (!dropdownRef.current) return;
            if (!dropdownRef.current.contains(e.target as Node)) {
                setOpenWIT(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);
    return (
        <div className="space-y-3 mr-1">
            <div
                id={domIdFor(type, node.id)}
                style={widthStyle}
                className={[
                    "relative ml-auto rounded-lg border border-slate-200 cursor-pointer",
                    depth === 0 ? "max-w-4xl bg-slate-50/50 p-5" : "bg-slate-50/30 p-4",
                    openWIT ? "shadow-md" : "active:scale-95 transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-md hover:bg-slate-100/40 hover:border-slate-300",
                    selected ? selectedCardClass : "",
                ].join(" ")}
                onClick={() => onClick({ type, data: node })}
            >
                <RemoveIcon
                    onClick={(e) => {
                        e.stopPropagation();
                        onRemove({ id: node.id, type });
                    }}
                />

                <div className="flex items-end gap-3 min-w-0">
                    <span className="self-start flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-md bg-white border border-slate-200 text-sm font-semibold text-slate-700">
                        {indexLabel}
                    </span>

                    <div className="flex-1 min-w-0">
                        <div className="leading-none mb-1">
                            <TypePill type={type} />
                        </div>
                        <div className="font-semibold text-slate-900 truncate">{node.title}</div>
                    </div>

                    {/* Type picker (nice select) */}
                    <div
                        className="ml-auto relative"
                        onClick={(e) => e.stopPropagation()}
                        ref={dropdownRef}
                    >
                        <button
                            type="button"
                            onClick={() => setOpenWIT((v) => !v)}
                            className="px-2.5 py-1 text-xs font-medium rounded-md border border-gray-300 text-black bg-gray-50 hover:bg-gray-200"
                        >
                            + Add
                        </button>

                        {openWIT && (
                            <div
                                className="
  absolute right-0 mt-1 w-40
  rounded-lg border border-slate-200 bg-white shadow-lg
  z-50 overflow-hidden
  animate-in fade-in zoom-in-95 duration-100
"
                            >
                                {availableTypes.length === 0 ? (
                                    <div className="px-3 py-2 text-xs text-slate-500">
                                        No work item types
                                    </div>
                                ) : (
                                    availableTypes.map((wit) => (
                                        <button
                                            key={wit.referenceName}
                                            type="button"
                                            onClick={() => {
                                                onCreateNewElementClick(wit.name, node.id);
                                                setOpenWIT(false);
                                            }}
                                            className="
              w-full text-left px-3 py-2 text-sm text-slate-700
              hover:bg-blue-50 hover:text-blue-700
              transition
            "
                                        >
                                            <div className="flex items-center gap-2">
                                                <div
                                                    className="h-2.5 w-2.5 rounded-full"
                                                    style={{ backgroundColor: `#${wit.color}` }}
                                                />
                                                {wit.name}
                                            </div>
                                        </button>
                                    ))
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {node.children?.length > 0 && (
                <div className={[indentClass, "space-y-4"].join(" ")}>
                    {node.children.map((child, i) => (
                        <DevOpsNode
                            key={child.id}
                            node={child}
                            indexLabel={`${indexLabel}.${i + 1}`}
                            depth={depth + 1}
                            selectedCardClass={selectedCardClass}
                            isSelected={isSelected}
                            domIdFor={domIdFor}
                            onClick={onClick}
                            onRemove={onRemove}
                            onCreateNewElementClick={onCreateNewElementClick}
                            availableTypes={availableTypes}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};