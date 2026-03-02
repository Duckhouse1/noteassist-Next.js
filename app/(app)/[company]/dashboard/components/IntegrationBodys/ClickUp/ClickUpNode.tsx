import { ClickUpElements } from "@/lib/Integrations/ClickUp/Configuration";
import { TypePill } from "../DevOps/PillHelper";
import { RemoveIcon } from "../DevOps/TaskDisplayPanel";
import { SelectedElement } from "@/app/Components/Hooks/useElementTree";

type ClickUpNodeProps = {
    node: ClickUpElements;
    indexLabel: string;
    depth?: number;
    selectedCardClass: string;

    isSelected: (id: string) => boolean;
    domIdFor: (id: string) => string;

    onClick: (el: SelectedElement<ClickUpElements>) => void;
    onRemove: (action: { id: string }) => void;
    onAddSubtask: (parentId: string) => void;
};

export const ClickUpNode = ({
    node,
    indexLabel,
    depth = 0,
    selectedCardClass,
    isSelected,
    domIdFor,
    onClick,
    onRemove,
    onAddSubtask,
}: ClickUpNodeProps) => {
    const selected = isSelected(node.id);
    const shrinkPerLevel = 25;
    const maxShrink = 240;

    const widthStyle =
        depth === 0
            ? { width: "97%" }
            : {
                width: `calc(100% - ${Math.min(depth * shrinkPerLevel, maxShrink)}px)`,
            };

    const indentClass =
        depth === 0 ? "" :
            depth === 1 ? "pl-8" :
                depth === 2 ? "pl-12" :
                    depth === 3 ? "pl-16" : "pl-20";

    const displayType = depth === 0 ? "Task" : "Subtask";

    return (
        <div className="space-y-3 mr-1">
            <div
                id={domIdFor(node.id)}
                style={widthStyle}
                className={[
                    "relative ml-auto rounded-lg border border-slate-200 cursor-pointer",
                    depth === 0 ? "max-w-4xl bg-slate-50/50 p-5" : "bg-slate-50/30 p-4",
                    "active:scale-95 transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-md hover:bg-slate-100/40 hover:border-slate-300",
                    selected ? selectedCardClass : "",
                ].join(" ")}
                onClick={() => onClick({ data: node })}
            >
                <RemoveIcon
                    onClick={(e) => {
                        e.stopPropagation();
                        onRemove({ id: node.id });
                    }}
                />

                <div className="flex items-end gap-3 min-w-0">
                    <span className="self-start flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-md bg-white border border-slate-200 text-sm font-semibold text-slate-700">
                        {indexLabel}
                    </span>

                    <div className="flex-1 min-w-0">
                        <div className="leading-none mb-1">
                            <TypePill type={displayType} />
                        </div>
                        <div className="font-semibold text-slate-900 truncate">{node.title}</div>
                    </div>

                    {/* Add subtask button */}
                    <div
                        className="ml-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            type="button"
                            onClick={() => onAddSubtask(node.id)}
                            className="px-2.5 py-1 text-xs font-medium rounded-md border border-gray-300 text-black bg-gray-50 hover:bg-gray-200"
                        >
                            + Subtask
                        </button>
                    </div>
                </div>
            </div>

            {node.children?.length > 0 && (
                <div className={[indentClass, "space-y-4"].join(" ")}>
                    {node.children.map((child, i) => (
                        <ClickUpNode
                            key={child.id}
                            node={child}
                            indexLabel={`${indexLabel}.${i + 1}`}
                            depth={depth + 1}
                            selectedCardClass={selectedCardClass}
                            isSelected={isSelected}
                            domIdFor={domIdFor}
                            onClick={onClick}
                            onRemove={onRemove}
                            onAddSubtask={onAddSubtask}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};