"use client";

import { useMemo } from "react";
import { Action } from "@/lib/Integrations/Types";
import { AllIntegrationOptions } from "@/lib/Integrations/Catalog";
import Image from "next/image";

interface TeamsActionGalleryProps {
  actions: Action[];
  selectedActions: Action[];
  setSelectedActions: (action: Action) => void;
  onGoBack: () => void;
  onProcessNote: () => void;
  onGoToIntegrations: () => void;
}

type ProviderGroup = {
  providerId: string;
  title: string;
  iconURL: string;
  actions: Action[];
};

export default function TeamsActionGallery({
  actions,
  selectedActions,
  setSelectedActions,
  onGoBack,
  onProcessNote,
  onGoToIntegrations,
}: TeamsActionGalleryProps) {
  const providerGroups = useMemo(() => {
    const groups: ProviderGroup[] = [];
    for (const card of AllIntegrationOptions) {
      const providerActions = actions.filter((a) => a.integration === card.providerId);
      if (providerActions.length === 0) continue;
      groups.push({
        providerId: card.providerId,
        title: card.title,
        iconURL: card.iconURL,
        actions: providerActions,
      });
    }
    const ungrouped = actions.filter((a) => !a.integration);
    if (ungrouped.length > 0) {
      groups.push({ providerId: "general", title: "General", iconURL: "", actions: ungrouped });
    }
    return groups;
  }, [actions]);

  const selectedCount = selectedActions.length;

  return (
    <div className="h-full flex flex-col bg-[#F5F5F5] overflow-hidden">
      {/* Header */}
      <div className="bg-white px-4 pt-4 pb-3 border-b border-slate-100">
        <button
          onClick={onGoBack}
          className="flex items-center gap-1 text-xs text-slate-500 mb-2 cursor-pointer"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          Back to note
        </button>
        <div className="flex items-center justify-between">
          <h1 className="text-base font-bold tracking-tight text-slate-900">Action Gallery</h1>
          <button
            onClick={onGoToIntegrations}
            className="text-[10px] text-slate-400 underline underline-offset-2 cursor-pointer"
          >
            Manage →
          </button>
        </div>
        <p className="text-xs text-slate-400 mt-0.5">Choose actions to perform on your note</p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-3">
        {providerGroups.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mb-3">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3" />
                <path d="M12 1v6m0 6v6m11-7h-6m-6 0H1" />
              </svg>
            </div>
            <p className="text-sm font-medium text-slate-600 mb-1">No actions available</p>
            <p className="text-xs text-slate-400 mb-4">Enable integrations to unlock actions</p>
            <button
              onClick={onGoToIntegrations}
              className="text-xs font-semibold bg-black text-white px-4 py-2 rounded-xl cursor-pointer"
            >
              Set up Integrations
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {providerGroups.map((group) => (
              <div key={group.providerId}>
                {/* Provider label */}
                <div className="flex items-center gap-2 mb-2 px-1">
                  {group.iconURL ? (
                    <div className="h-5 w-5 rounded-md bg-slate-50 border border-slate-100 flex items-center justify-center p-0.5">
                      <Image
                        src={group.iconURL}
                        alt={group.title}
                        width={14}
                        height={14}
                        className="object-contain"
                      />
                    </div>
                  ) : (
                    <div className="h-5 w-5 rounded-md bg-black flex items-center justify-center">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="3" />
                        <path d="M12 1v6m0 6v6m11-7h-6m-6 0H1" />
                      </svg>
                    </div>
                  )}
                  <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    {group.title}
                  </span>
                </div>

                {/* Action cards - compact list */}
                <div className="flex flex-col gap-2">
                  {group.actions.map((action) => {
                    const isSelected = selectedActions.some(
                      (a) => a.key === action.key && a.integration === action.integration
                    );
                    return (
                      <button
                        key={action.key}
                        type="button"
                        onClick={() => setSelectedActions(action)}
                        className={[
                          "w-full flex items-center gap-3 rounded-xl p-3 text-left transition-all cursor-pointer",
                          isSelected
                            ? "bg-black"
                            : "bg-white border border-slate-200",
                        ].join(" ")}
                      >
                        {/* Checkbox */}
                        <div
                          className={[
                            "flex-shrink-0 h-5 w-5 rounded-full border-2 flex items-center justify-center transition-all",
                            isSelected
                              ? "border-white bg-white"
                              : "border-slate-300",
                          ].join(" ")}
                        >
                          {isSelected && (
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M20 6L9 17l-5-5" />
                            </svg>
                          )}
                        </div>

                        {/* Text */}
                        <div className="flex-1 min-w-0">
                          <p className={`text-xs font-semibold truncate ${isSelected ? "text-white" : "text-slate-900"}`}>
                            {action.title}
                          </p>
                          <p className={`text-[10px] mt-0.5 leading-relaxed line-clamp-2 ${isSelected ? "text-slate-300" : "text-slate-500"}`}>
                            {action.description}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Sticky process button */}
      {selectedCount > 0 && (
        <div className="bg-white border-t border-slate-100 px-4 py-3">
          <button
            onClick={onProcessNote}
            className="w-full py-3 rounded-xl bg-black text-white text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer"
          >
            Process note · {selectedCount} action{selectedCount !== 1 ? "s" : ""}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}