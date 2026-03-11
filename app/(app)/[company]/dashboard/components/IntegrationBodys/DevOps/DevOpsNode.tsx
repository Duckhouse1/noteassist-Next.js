import { DevOpsElement, DevOpsTaskTypes } from "@/app/types/OpenAI";
import { SelectedElementProps, RemoveAction } from "./DevOpsPreBody";
import { TypePill } from "./PillHelper";

import { useContext, useEffect, useId, useRef, useState } from "react";
import { RemoveIcon } from "./TaskDisplayPanel";
import { WorkItemType } from "@/app/api/integrations/azure-devops/WorkItem/GetWorkItemTypesByProject/route";
import { clientIsFromTeams } from "@/app/Contexts";

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

// ... (type stays the same)

export const DevOpsNode = ({ node, indexLabel, depth = 0, selectedCardClass, isSelected, domIdFor, onClick,
    onRemove, onCreateNewElementClick, availableTypes, }: DevOpsNodeProps) => {

    const { fromTeams } = useContext(clientIsFromTeams);
    const s = (normal: string, small: string) => fromTeams ? small : normal;

    const type = node.type as DevOpsTaskTypes;
    const selected = isSelected(type, node.id);
    const selectId = useId();
    const [createType, setCreateType] = useState<DevOpsTaskTypes | "">("");
    const [openWIT, setOpenWIT] = useState(false);
    const dropdownRef = useRef<HTMLDivElement | null>(null);

    const shrinkPerLevel = fromTeams ? 18 : 25;
    const maxShrink = fromTeams ? 160 : 240;

    const widthStyle =
        depth === 0
            ? { width: "97%" }
            : { width: `calc(100% - ${Math.min(depth * shrinkPerLevel, maxShrink)}px)` };

    const indentClass =
        depth === 0 ? "" :
        depth === 1 ? s("pl-8", "pl-5") :
        depth === 2 ? s("pl-12", "pl-8") :
        depth === 3 ? s("pl-16", "pl-10") : s("pl-20", "pl-12");

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (!dropdownRef.current) return;
            if (!dropdownRef.current.contains(e.target as Node)) setOpenWIT(false);
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className={s("space-y-3 mr-1", "space-y-2 mr-0.5")}>
            <div
                id={domIdFor(type, node.id)}
                style={widthStyle}
                className={[
                    "relative ml-auto rounded-lg border border-slate-200 cursor-pointer",
                    depth === 0
                        ? s("max-w-4xl bg-slate-50/50 p-5", "max-w-4xl bg-slate-50/50 p-3")
                        : s("bg-slate-50/30 p-4", "bg-slate-50/30 p-2.5"),
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

                <div className={`flex items-end min-w-0 ${s("gap-3", "gap-2")}`}>
                    <span className={`self-start flex-shrink-0 flex items-center justify-center rounded-md bg-white border border-slate-200 font-semibold text-slate-700 ${s("w-8 h-8 text-sm", "w-6 h-6 text-xs")}`}>
                        {indexLabel}
                    </span>

                    <div className="flex-1 min-w-0">
                        <div className={s("leading-none mb-1", "leading-none mb-0.5")}>
                            <TypePill type={type} />
                        </div>
                        <div className={`font-semibold text-slate-900 truncate ${s("", "text-xs")}`}>
                            {node.title}
                        </div>
                    </div>

                    <div
                        className="ml-auto relative"
                        onClick={(e) => e.stopPropagation()}
                        ref={dropdownRef}
                    >
                        <button
                            type="button"
                            onClick={() => setOpenWIT((v) => !v)}
                            className={`font-medium rounded-md border border-gray-300 text-black bg-gray-50 hover:bg-gray-200 ${s("px-2.5 py-1 text-xs", "px-1.5 py-0.5 text-xs")}`}
                        >
                            + Add
                        </button>

                        {openWIT && (
                            <div className={`absolute right-0 mt-1 rounded-lg border border-slate-200 bg-white shadow-lg z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100 ${s("w-40", "w-32")}`}>
                                {availableTypes.length === 0 ? (
                                    <div className={`text-slate-500 ${s("px-3 py-2 text-xs", "px-2 py-1 text-xs")}`}>
                                        No work item types
                                    </div>
                                ) : (
                                    availableTypes.map((wit) => (
                                        <button
                                            key={wit.referenceName}
                                            type="button"
                                            onClick={() => { onCreateNewElementClick(wit.name, node.id); setOpenWIT(false); }}
                                            className={`w-full text-left text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition ${s("px-3 py-2 text-sm", "px-2 py-1 text-xs")}`}
                                        >
                                            <div className={`flex items-center ${s("gap-2", "gap-1.5")}`}>
                                                <div
                                                    className={`rounded-full ${s("h-2.5 w-2.5", "h-2 w-2")}`}
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
                <div className={[indentClass, s("space-y-4", "space-y-2")].join(" ")}>
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