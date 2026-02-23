// components/TasksDisplayPanel.tsx
import { DevOpsElement, DevOpsFeature, DevOpsPBI, DevOpsTask } from "@/app/types/OpenAI";
import { SelectedElementProps, RemoveAction } from "./DevOpsPreBody";
import { useEffect, useMemo, useRef } from "react";
import { TypePill } from "./PillHelper";
import { DevOpsNode } from "./DevOpsNode";
import { WorkItemType } from "@/app/api/integrations/azure-devops/WorkItem/GetWorkItemTypesByProject/route";

export type DevOpsTaskTypes = "Feature" | "PBI" | "Task" | "Bug" | "Epic";

interface TasksDisplayPanelProps {
  elements: DevOpsElement[] | null;
  onClick: (displayedElement: SelectedElementProps) => void;
  onRemove: (action: RemoveAction) => void;
  onCreateNewElementClick: (type: string, ParentID: string | null) => void;
  selectedElement: SelectedElementProps | null;
  possibleWIT: WorkItemType[]
}

export const TasksDisplayPanel = ({ elements, onClick, onRemove, onCreateNewElementClick, selectedElement, possibleWIT }: TasksDisplayPanelProps) => {

  /** Scroll container ref */
  const scrollAreaRef = useRef<HTMLDivElement | null>(null);

  /** Selected element info */
  const selectedId = selectedElement?.data.id;
  const selectedType = selectedElement?.type;

  /** Helpers */
  const isSelected = (type: string, id: string) =>
    selectedId === id && selectedType === type;

  const domIdFor = (type: string, id: string) =>
    `taskpanel-${type}-${id}`;

  const selectedDomId = useMemo(() => {
    if (!selectedId || !selectedType) return null;
    return domIdFor(selectedType, selectedId);
  }, [selectedId, selectedType]);

  /** Scroll ONLY the panel when selection changes */
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

  /** Selected card UI */
  const selectedCardClass =
    "ring-2 ring-blue-500/40 shadow-lg bg-gradient-to-r from-blue-50 to-white border-blue-300 " +
    "before:content-[''] before:absolute before:left-0 before:top-0 before:h-full before:w-1 before:rounded-l-lg before:bg-blue-500";

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm w-full min-w-0 p-6 flex flex-col min-h-[64vh] max-h-[64vh]">
      <h1 className="text-lg font-semibold text-slate-900 mb-2 flex-shrink-0">
        Work items
      </h1>

      <div className="flex justify-end mb-2">
        <button
          className="mr-4 cursor-pointer px-3 py-1.5 text-sm font-medium rounded-md border border-blue-200 text-blue-600 bg-blue-50 hover:bg-blue-100 hover:border-blue-300"
          onClick={() => onCreateNewElementClick("Feature", null)}
        >
          + New Feature
        </button>
      </div>

      {elements ? (
        <div
          ref={scrollAreaRef}
          className="flex-1 min-h-0 min-w-0 overflow-y-auto overflow-x-hidden space-y-6 pt-4 pb-5"
        >
          {elements.map((root, i) => (
            <DevOpsNode
              key={root.id}
              node={root}
              indexLabel={`${i + 1}`}
              selectedCardClass={selectedCardClass}
              isSelected={isSelected}
              domIdFor={domIdFor}
              onClick={onClick}
              onRemove={onRemove}
              onCreateNewElementClick={onCreateNewElementClick}
              availableTypes={possibleWIT} />
          ))}
         
        </div>
      ) : (
        <p className="mt-4 text-sm text-slate-600">
          Select a sprint to see suggested tasks here.
        </p>
      )}
    </div>
  );
};

// Remove Icon Helper Component
export const RemoveIcon = ({ onClick }: { onClick: (e: React.MouseEvent) => void }) => {
  return (
    <button
      onClick={onClick}
      className="absolute -top-3 -left-3 z-10 flex items-center justify-center w-6 h-6 rounded-full bg-slate-200 hover:bg-red-200 transition-colors group border-2 border-white shadow-sm"
      aria-label="Remove"
    >
      <span className="text-slate-600 group-hover:text-red-400 text-sm font-semibold">
        ×
      </span>
    </button>
  );
};
