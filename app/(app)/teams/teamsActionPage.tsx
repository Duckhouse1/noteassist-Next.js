"use client";

import { useMemo, useState } from "react";
import { CorporateLoader } from "@/app/Components/LoadingIcon";
import { ActionsBody } from "@/app/(app)/[company]/dashboard/components/ActionsBody";
import { ActionExecutionContext, ShowNotesBodyContext } from "@/app/Contexts";
import { Action } from "@/lib/Integrations/Types";

export default function TeamsActionsPage({
  selectedActions,
  onGoToFrontPage,
}: {
  selectedActions: Action[];
  onGoToFrontPage: () => void;
}) {
  const total = selectedActions.length;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [executingIndex, setExecutingIndex] = useState<number | null>(null);
  const [completedActions, setCompletedActions] = useState<number[]>([]);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [showNotes, setShowNotes] = useState(false);

  const currentAction = useMemo(() => selectedActions[currentIndex], [selectedActions, currentIndex]);

  if (total === 0) {
    return (
      <div className="h-full flex items-center justify-center p-6">
        <div className="text-center">
          <p className="text-sm font-semibold text-slate-700 mb-1">No actions selected</p>
          <p className="text-xs text-slate-500 mb-4">Go back and select actions first.</p>
          <button
            onClick={onGoToFrontPage}
            className="px-4 py-2 rounded-xl bg-black text-white text-xs font-semibold cursor-pointer"
          >
            Go back
          </button>
        </div>
      </div>
    );
  }

  function markCompleted(index: number) {
    setCompletedActions((prev) => (prev.includes(index) ? prev : [...prev, index]));
  }

  function goNext() {
    setCurrentIndex((v) => Math.min(total - 1, v + 1));
  }

  async function executeCurrentAction() {
    setExecutingIndex(currentIndex);
  }

  function finishCurrentAction() {
    markCompleted(currentIndex);
    setExecutingIndex(null);
    if (currentIndex < total - 1) {
      goNext();
    } else {
      setStatusMessage("All actions completed!");
    }
  }

  const isCurrentExecuting = executingIndex === currentIndex;
  const isCurrentCompleted = completedActions.includes(currentIndex);

  return (
    <div className="h-full flex flex-col bg-[#F5F5F5] overflow-hidden">
      {/* Compact header */}
      <div className="bg-white px-4 pt-4 pb-3 border-b border-slate-100">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
              Step {currentIndex + 1} of {total}
            </p>
            <p className="text-sm font-bold text-slate-900 leading-tight">
              {currentAction?.title}
            </p>
          </div>

          {/* Step dots */}
          <div className="flex items-center gap-1.5">
            {selectedActions.map((_, i) => {
              const isActive = i === currentIndex;
              const isDone = completedActions.includes(i);
              const isExecuting = executingIndex === i;
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => { setShowNotes(false); setCurrentIndex(i); }}
                  disabled={isExecuting}
                  className={[
                    "flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-bold transition cursor-pointer",
                    isExecuting
                      ? "bg-amber-100 text-amber-600 ring-2 ring-amber-300 animate-pulse"
                      : isActive
                      ? "bg-black text-white"
                      : isDone
                      ? "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-300"
                      : "bg-slate-100 text-slate-500",
                  ].join(" ")}
                >
                  {isExecuting ? (
                    <svg className="h-3 w-3 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
                      <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                    </svg>
                  ) : isDone ? (
                    <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none">
                      <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ) : (
                    i + 1
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Notes / Action toggle */}
        <div className="flex gap-1.5">
          <button
            onClick={() => setShowNotes(false)}
            className={[
              "flex-1 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer",
              !showNotes ? "bg-black text-white" : "text-slate-500 border border-slate-200 bg-white",
            ].join(" ")}
          >
            Action
          </button>
          <button
            onClick={() => setShowNotes(true)}
            className={[
              "flex-1 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer",
              showNotes ? "bg-black text-white" : "text-slate-500 border border-slate-200 bg-white",
            ].join(" ")}
          >
            Notes
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {statusMessage ? (
          <div className="flex flex-col items-center justify-center h-full gap-4 p-6">
            <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center">
              <svg className="h-7 w-7 text-emerald-600" viewBox="0 0 24 24" fill="none">
                <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <p className="text-sm font-semibold text-slate-800">All done!</p>
            <button
              onClick={onGoToFrontPage}
              className="px-6 py-3 rounded-xl bg-black text-white text-sm font-semibold cursor-pointer"
            >
              New note
            </button>
          </div>
        ) : isCurrentExecuting ? (
          <div className="flex items-center justify-center h-full">
            <CorporateLoader
              size={140}
              className=""
              title={`Creating: ${currentAction?.createText ?? currentAction?.title}`}
            />
          </div>
        ) : (
          <div className="p-4">
            <ShowNotesBodyContext.Provider value={{ show: showNotes, setShowNoteBody: setShowNotes }}>
              <ActionExecutionContext.Provider
                value={{
                  isExecuting: isCurrentExecuting,
                  isCompleted: isCurrentCompleted,
                  executeAction: async () => { executeCurrentAction(); },
                }}
              >
                <ActionsBody
                  key={currentIndex}
                  action={currentAction}
                  onActionComplete={finishCurrentAction}
                  isfromTeams={true}
                />
              </ActionExecutionContext.Provider>
            </ShowNotesBodyContext.Provider>
          </div>
        )}
      </div>
    </div>
  );
}