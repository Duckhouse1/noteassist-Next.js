// components/TasksDisplayPanel.tsx
import { DevOpsFeature, DevOpsPBI, DevOpsTask } from "@/app/types/OpenAI";
import { SelectedElementProps, RemoveAction } from "./DevOpsPreBody";
import { useEffect, useMemo, useRef } from "react";
import { TypePill } from "./PillHelper";

export type DevOpsTaskTypes = "Feature" | "PBI" | "Task";

interface TasksDisplayPanelProps {
  features: DevOpsFeature[] | null;
  onClick: (displayedElement: SelectedElementProps) => void;
  onRemove: (action: RemoveAction) => void;
  onCreateNewElementClick: (type: DevOpsTaskTypes, ParentID: string | null) => void;
  selectedElement: SelectedElementProps | null;
}

export const TasksDisplayPanel = ({ features, onClick, onRemove, onCreateNewElementClick, selectedElement, }: TasksDisplayPanelProps) => {
  /** Scroll container ref */
  const scrollAreaRef = useRef<HTMLDivElement | null>(null);

  /** Selected element info */
  const selectedId = selectedElement?.data.id;
  const selectedType = selectedElement?.type;

  /** Helpers */
  const isSelected = (type: DevOpsTaskTypes, id: string) =>
    selectedId === id && selectedType === type;

  const domIdFor = (type: DevOpsTaskTypes, id: string) =>
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
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm w-full min-w-0 p-6 flex flex-col min-h-0 max-h-[64vh]">
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

      {features ? (
        <div
          ref={scrollAreaRef}
          className="flex-1 min-h-0 min-w-0 overflow-y-auto overflow-x-hidden space-y-6 pt-4"
        >
          {features.map((feature, featureIndex) => {
            const featureSelected = isSelected("Feature", feature.id);

            return (
              <div key={feature.id} className="space-y-4">
                {/* Feature */}
                <div
                  id={domIdFor("Feature", feature.id)}
                  className={[
                    "w-[97%] max-w-4xl ml-auto relative rounded-lg bg-slate-50/50 border border-slate-200 p-5 cursor-pointer",
                    "active:scale-95 transition-all duration-300 ease-out",
                    "hover:-translate-y-1 hover:shadow-md hover:bg-slate-100/60 hover:border-slate-300",
                    featureSelected ? selectedCardClass : "",
                  ].join(" ")}
                  aria-selected={featureSelected}
                  onClick={() =>
                    onClick({ type: "Feature", data: feature })
                  }
                >
                  <RemoveIcon
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemove({
                        type: "Feature",
                        featureId: feature.id,
                      });
                    }}
                  />

                  <div className="flex items-end gap-3 min-w-0">
                    <span className="self-start flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-md bg-white border border-slate-200 text-sm font-semibold text-slate-700">
                      {featureIndex + 1}
                    </span>

                    <div className="flex-1 min-w-0">
                      <div className="leading-none mb-1">
                        <TypePill type="Feature" />
                      </div>
                      <h2 className="font-semibold text-slate-900 truncate">
                        {feature.title}
                      </h2>
                    </div>


                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onCreateNewElementClick("PBI", feature.id);
                      }}
                      className="ml-auto cursor-pointer px-3 py-1.5 text-sm font-medium rounded-md border border-blue-200 text-blue-600 bg-blue-50 hover:bg-blue-100 hover:border-blue-300"
                    >
                      + Add PBI
                    </button>
                  </div>
                </div>

                {/* PBIs */}
                <div className="pl-8 space-y-4">
                  {feature.pbis.map((pbi, pbiIndex) => {
                    const pbiSelected = isSelected("PBI", pbi.id);

                    return (
                      <div key={pbi.id} className="space-y-3">
                        <div
                          id={domIdFor("PBI", pbi.id)}
                          className={[
                            "relative rounded-lg bg-slate-50/30 border border-slate-200 p-4 cursor-pointer",
                            "active:scale-95 transition-all duration-300 ease-out",
                            "hover:-translate-y-1 hover:shadow-md hover:bg-slate-100/40 hover:border-slate-300",
                            pbiSelected ? selectedCardClass : "",
                          ].join(" ")}
                          aria-selected={pbiSelected}
                          onClick={() =>
                            onClick({ type: "PBI", data: pbi })
                          }
                        >
                          <RemoveIcon
                            onClick={(e) => {
                              e.stopPropagation();
                              onRemove({
                                type: "PBIS",
                                pbiId: pbi.id,
                                featureId: feature.id,
                              });
                            }}
                          />

                          <div className="flex items-end gap-3 min-w-0">
                            <span className="self-start flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-md bg-white border border-slate-200 text-sm font-semibold text-slate-700">
                              {featureIndex + 1}.{pbiIndex + 1}
                            </span>

                            <div className="flex-1 min-w-0">
                              <div className="leading-none mb-1">
                                <TypePill type="PBI" />
                              </div>
                              <h3 className="font-semibold text-slate-800 text-sm truncate">
                                {pbi.title}
                              </h3>
                            </div>


                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onCreateNewElementClick("Task", pbi.id);
                              }}
                              className="ml-auto cursor-pointer px-3 py-1.5 text-xs font-medium rounded-md border border-blue-200 text-blue-600 bg-blue-50 hover:bg-blue-100 hover:border-blue-300"
                            >
                              + Add Task
                            </button>
                          </div>
                        </div>

                        {/* Tasks */}
                        <div className="pl-8 space-y-2">
                          {pbi.tasks.map((task, taskIndex) => {
                            const taskSelected = isSelected(
                              "Task",
                              task.id
                            );

                            return (
                              <div
                                key={task.id}
                                id={domIdFor("Task", task.id)}
                                className={[
                                  "relative w-full min-w-0 rounded-lg bg-white border border-slate-200 p-4 cursor-pointer",
                                  "active:scale-95 transition-all duration-300 ease-out",
                                  "hover:-translate-y-1 hover:shadow-lg hover:bg-slate-50 hover:border-blue-300",
                                  taskSelected ? selectedCardClass : "",
                                ].join(" ")}
                                aria-selected={taskSelected}
                                onClick={() =>
                                  onClick({
                                    type: "Task",
                                    data: task,
                                  })
                                }
                              >
                                <RemoveIcon
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onRemove({
                                      type: "Tasks",
                                      taskId: task.id,
                                      pbiId: pbi.id,
                                      featureId: feature.id,
                                    });
                                  }}
                                />
                                <div className="flex items-start gap-3 min-w-0">
                                  <span className="flex-shrink-0 flex items-center justify-center px-2 h-6 rounded bg-slate-50 border border-slate-200 text-xs font-medium text-slate-600">
                                    {featureIndex + 1}.{pbiIndex + 1}.
                                    {taskIndex + 1}
                                  </span>
                                  <div className="flex-1 min-w-0">
                                    <div className="leading-none mb-1">
                                      <TypePill type="Task" />
                                    </div>
                                    <p className="min-w-0 truncate whitespace-nowrap font-semibold text-slate-800 text-sm">
                                      {task.title}
                                    </p>
                                  </div>

                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
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
const RemoveIcon = ({ onClick }: { onClick: (e: React.MouseEvent) => void }) => {
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
