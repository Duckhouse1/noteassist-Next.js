// components/TasksDisplayPanel.tsx
import { DevOpsElement, DevOpsFeature, DevOpsPBI, DevOpsTask } from "@/app/types/OpenAI";
import { SelectedElementProps, RemoveAction } from "./DevOpsPreBody";
import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { TypePill } from "./PillHelper";
import { DevOpsNode } from "./DevOpsNode";
import { WorkItemType } from "@/app/api/integrations/azure-devops/WorkItem/GetWorkItemTypesByProject/route";
import { clientIsFromTeams } from "@/app/Contexts";

export type DevOpsTaskTypes = "Feature" | "PBI" | "Task" | "Bug" | "Epic";

interface TasksDisplayPanelProps {
  elements: DevOpsElement[] | null;
  onClick: (displayedElement: SelectedElementProps) => void;
  onRemove: (action: RemoveAction) => void;
  onCreateNewElementClick: (type: string, ParentID: string | null) => void;
  selectedElement: SelectedElementProps | null;
  possibleWIT: WorkItemType[];
}

export const TasksDisplayPanel = ({ elements, onClick, onRemove, onCreateNewElementClick, selectedElement, possibleWIT }: TasksDisplayPanelProps) => {
  const { fromTeams } = useContext(clientIsFromTeams)
  const scrollAreaRef = useRef<HTMLDivElement | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const [openWIT, setOpenWIT] = useState(false);

  const s = (normal: string, small: string) => fromTeams ? small : normal;

  const selectedId = selectedElement?.data.id;
  const selectedType = selectedElement?.type;

  const isSelected = (type: string, id: string) =>
    selectedId === id && selectedType === type;

  const domIdFor = (type: string, id: string) =>
    `taskpanel-${type}-${id}`;

  const selectedDomId = useMemo(() => {
    if (!selectedId || !selectedType) return null;
    return domIdFor(selectedType, selectedId);
  }, [selectedId, selectedType]);

  useEffect(() => {
    if (!selectedDomId) return;
    const container = scrollAreaRef.current;
    if (!container) return;
    const el = container.querySelector<HTMLElement>(`#${CSS.escape(selectedDomId)}`);
    if (!el) return;
    const containerRect = container.getBoundingClientRect();
    const elRect = el.getBoundingClientRect();
    const elTopWithinContainer = elRect.top - containerRect.top + container.scrollTop;
    const targetScrollTop = elTopWithinContainer - container.clientHeight / 2 + elRect.height / 2;
    container.scrollTo({ top: Math.max(0, targetScrollTop), behavior: "smooth" });
  }, [selectedDomId]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!dropdownRef.current) return;
      if (!dropdownRef.current.contains(e.target as Node)) setOpenWIT(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedCardClass =
    "ring-1 ring-black shadow-lg bg-gradient-to-r from-gray-200 to-white border-black " +
    "before:content-[''] before:absolute before:left-0 before:top-0 before:h-full before:w-0.5 before:rounded-l-lg before:bg-gray-600";

  return (
    <div className={`rounded-2xl border border-slate-200 bg-white shadow-sm w-full min-w-0 flex flex-col ${s("p-3 lg:p-6 min-h-[40vh] max-h-[40vh] lg:min-h-[64vh] lg:max-h-[64vh]", "p-2 min-h-[35vh] max-h-[35vh]")}`}>
      <h1 className={`font-semibold text-slate-900 flex-shrink-0 ${s("text-sm lg:text-lg mb-1.5 lg:mb-2", "text-xs mb-1")}`}>
        Work items
      </h1>

      <div className={`flex justify-end ${s("mb-1.5 lg:mb-2", "mb-1")}`}>
        <div className="relative inline-block" ref={dropdownRef}>
          <button
            className={`cursor-pointer font-medium rounded-md border border-gray-300 text-black bg-gray-50 hover:bg-gray-200 ${s("px-2 py-1 lg:px-3 lg:py-1.5 text-xs lg:text-sm", "px-1.5 py-0.5 text-xs")}`}
            onClick={() => setOpenWIT((v) => !v)}
            type="button"
          >
            + Top parent
          </button>

          {openWIT && (
            <div className={`absolute top-full left-0 mt-1 rounded-lg border border-slate-200 bg-white shadow-lg z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100 ${s("w-36 lg:w-40", "w-32")}`}>
              {possibleWIT.length === 0 ? (
                <div className={`text-slate-500 ${s("px-2 py-1.5 lg:px-3 lg:py-2 text-xs", "px-2 py-1 text-xs")}`}>
                  No work item types
                </div>
              ) : (
                possibleWIT.map((wit) => (
                  <button
                    key={wit.referenceName}
                    type="button"
                    onClick={() => { onCreateNewElementClick(wit.name, null); setOpenWIT(false); }}
                    className={`w-full text-left text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition ${s("px-2 py-1.5 lg:px-3 lg:py-2 text-xs lg:text-sm", "px-2 py-1 text-xs")}`}
                  >
                    <div className={`flex items-center ${s("gap-1.5 lg:gap-2", "gap-1")}`}>
                      <div
                        className={`rounded-full ${s("h-2 w-2 lg:h-2.5 lg:w-2.5", "h-1.5 w-1.5")}`}
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

      {elements ? (
        <div
          ref={scrollAreaRef}
          className={`flex-1 min-h-0 min-w-0 overflow-y-auto overflow-x-hidden ${s("space-y-3 lg:space-y-6 pt-2 lg:pt-4 pb-3 lg:pb-5", "space-y-2 pt-3 pb-2")}`}
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
              availableTypes={possibleWIT}
            />
          ))}
        </div>
      ) : (
        <p className={`text-slate-600 ${s("mt-3 lg:mt-4 text-xs lg:text-sm", "mt-2 text-xs")}`}>
          Select a sprint to see suggested tasks here.
        </p>
      )}
    </div>
  );
};

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