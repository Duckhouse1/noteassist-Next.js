import { ClickUpElements } from "@/lib/Integrations/ClickUp/Configuration";
import { SelectedElement } from "@/app/Components/Hooks/useElementTree";
import { useEffect, useMemo, useRef } from "react";
import { ClickUpNode } from "./ClickUpNode";

interface ClickUpTaskPaneProps {
    elements: ClickUpElements[];
    onClick: (el: SelectedElement<ClickUpElements>) => void;
    onRemove: (action: { id: string }) => void;
    onAddTask: () => void;
    onAddSubtask: (parentId: string) => void;
    selectedElement: SelectedElement<ClickUpElements> | null;
}

export const ClickUpTaskPane = ({
    elements,
    onClick,
    onRemove,
    onAddTask,
    onAddSubtask,
    selectedElement,
}: ClickUpTaskPaneProps) => {
    const scrollAreaRef = useRef<HTMLDivElement | null>(null);

    const selectedId = selectedElement?.data.id;

    const isSelected = (id: string) => selectedId === id;
    const domIdFor = (id: string) => `clickup-taskpanel-${id}`;

    const selectedDomId = useMemo(() => {
        if (!selectedId) return null;
        return domIdFor(selectedId);
    }, [selectedId]);

    /** Scroll to selected element */
    useEffect(() => {
        if (!selectedDomId) return;

        const container = scrollAreaRef.current;
        if (!container) return;

        const el = container.querySelector<HTMLElement>(
            `#${CSS.escape(selectedDomId)}`
        );
        if (!el) return;

        const containerRect = container.getBoundingClientRect();
        const elRect = el.getBoundingClientRect();

        const elTopWithinContainer =
            elRect.top - containerRect.top + container.scrollTop;

        const targetScrollTop =
            elTopWithinContainer -
            container.clientHeight / 2 +
            elRect.height / 2;

        container.scrollTo({
            top: Math.max(0, targetScrollTop),
            behavior: "smooth",
        });
    }, [selectedDomId]);

    const selectedCardClass =
        "ring-1 ring-black shadow-lg bg-gradient-to-r from-gray-200 to-white border-black " +
        "before:content-[''] before:absolute before:left-0 before:top-0 before:h-full before:w-0.5 before:rounded-l-lg before:bg-gray-600";

    return (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm w-full min-w-0 p-6 flex flex-col min-h-[64vh] max-h-[64vh]">
            <h1 className="text-lg font-semibold text-slate-900 mb-2 flex-shrink-0">
                Tasks
            </h1>

            <div className="flex justify-end mb-2">
                <button
                    className="cursor-pointer px-3 py-1.5 text-sm font-medium rounded-md border border-gray-300 text-black bg-gray-50 hover:bg-gray-200"
                    onClick={onAddTask}
                    type="button"
                >
                    + New Task
                </button>
            </div>

            {elements.length > 0 ? (
                <div
                    ref={scrollAreaRef}
                    className="flex-1 min-h-0 min-w-0 overflow-y-auto overflow-x-hidden space-y-6 pt-4 pb-5"
                >
                    {elements.map((root, i) => (
                        <ClickUpNode
                            key={root.id}
                            node={root}
                            indexLabel={`${i + 1}`}
                            selectedCardClass={selectedCardClass}
                            isSelected={isSelected}
                            domIdFor={domIdFor}
                            onClick={onClick}
                            onRemove={onRemove}
                            onAddSubtask={onAddSubtask}
                        />
                    ))}
                </div>
            ) : (
                <div className="flex-1 flex items-center justify-center">
                    <p className="text-sm text-slate-500">
                        No tasks yet. Click &quot;+ New Task&quot; to add one.
                    </p>
                </div>
            )}
        </div>
    );
};