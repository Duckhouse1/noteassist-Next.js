"use client";

import { useMemo } from "react";
import Image from "next/image";
import { Action } from "@/lib/Integrations/Types";
import { AllIntegrationOptions } from "@/lib/Integrations/Catalog";

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

const CheckIcon = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const ArrowRight = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);

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
      groups.push({ providerId: card.providerId, title: card.title, iconURL: card.iconURL, actions: providerActions });
    }
    const ungrouped = actions.filter((a) => !a.integration);
    if (ungrouped.length > 0) {
      groups.push({ providerId: "general", title: "General", iconURL: "", actions: ungrouped });
    }
    return groups;
  }, [actions]);

  const selectedCount = selectedActions.length;

  return (
    <div className="h-full flex flex-col bg-white overflow-hidden">

      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="px-4 sm:px-8 pt-5 pb-4 border-b border-slate-100 flex-shrink-0">
        <button
          onClick={onGoBack}
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-700 transition-colors mb-3 group cursor-pointer"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            className="transition-transform group-hover:-translate-x-0.5">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          Back to note
        </button>

        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">Action Gallery</h1>
            <p className="text-xs text-slate-400 mt-0.5">Choose what actions to perform on your notes</p>
          </div>
          {providerGroups.length > 0 && (
            <button
              onClick={onGoToIntegrations}
              className="text-[11px] text-slate-400 hover:text-slate-600 underline underline-offset-2 transition-colors cursor-pointer pb-0.5"
            >
              Manage →
            </button>
          )}
        </div>
      </div>

      {/* ── Content ────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-5">
        {providerGroups.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="flex gap-1 mb-4">
              <span className="h-1.5 w-1.5 rounded-full bg-slate-200" />
              <span className="h-1.5 w-1.5 rounded-full bg-slate-300" />
              <span className="h-1.5 w-1.5 rounded-full bg-slate-200" />
            </div>
            <p className="text-sm font-medium text-slate-600 mb-1">No actions available</p>
            <p className="text-xs text-slate-400 mb-5">Enable integrations to unlock actions</p>
            <button
              onClick={onGoToIntegrations}
              className="text-xs font-semibold bg-black text-white px-4 py-2.5 rounded-xl cursor-pointer"
            >
              Set up Integrations
            </button>
          </div>
        ) : (
          /*
           * Responsive grid:
           *   - xs  (<sm): 1 column  — full-width list, like the current Teams design
           *   - sm  (≥640): 2 columns — side-by-side providers
           *   - lg  (≥1024): one column per provider (up to 3), like the desktop app
           */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {providerGroups.map((group, groupIdx) => (
              <div
                key={group.providerId}
                className="flex flex-col animate-gallery-child"
                style={{ animationDelay: `${groupIdx * 60}ms` }}
              >
                {/* Provider header */}
                <div className="flex items-center gap-3 mb-4 pb-3 border-b border-slate-100">
                  {group.iconURL ? (
                    <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center p-1.5 flex-shrink-0">
                      <Image
                        src={group.iconURL}
                        alt={group.title}
                        width={20}
                        height={20}
                        className="object-contain"
                      />
                    </div>
                  ) : (
                    <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-xl bg-black flex items-center justify-center flex-shrink-0">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="3" />
                        <path d="M12 1v6m0 6v6m11-7h-6m-6 0H1" />
                      </svg>
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{group.title}</p>
                    <p className="text-[11px] text-slate-400">
                      {group.actions.length} action{group.actions.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                </div>

                {/* Action cards */}
                <div className="flex flex-col gap-2.5">
                  {group.actions.map((action, actionIdx) => {
                    const isSelected = selectedActions.some(
                      (a) => a.key === action.key && a.integration === action.integration
                    );
                    return (
                      <button
                        key={action.key}
                        type="button"
                        onClick={() => setSelectedActions(action)}
                        className={[
                          "group relative flex flex-col items-start rounded-xl sm:rounded-2xl border p-3.5 sm:p-5 text-left transition-all duration-200 cursor-pointer animate-gallery-child",
                          isSelected
                            ? "border-black bg-black shadow-lg shadow-black/5"
                            : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm",
                        ].join(" ")}
                        style={{ animationDelay: `${groupIdx * 60 + actionIdx * 40 + 80}ms` }}
                      >
                        {/* Selection circle */}
                        <div className={[
                          "absolute top-3.5 right-3.5 h-5 w-5 rounded-full border-2 flex items-center justify-center transition-all duration-200",
                          isSelected
                            ? "border-white bg-white text-black"
                            : "border-slate-200 group-hover:border-slate-400",
                        ].join(" ")}>
                          {isSelected && <CheckIcon />}
                        </div>

                        <h3 className={[
                          "text-xs sm:text-sm font-semibold pr-7 mb-1 transition-colors duration-200",
                          isSelected ? "text-white" : "text-slate-900",
                        ].join(" ")}>
                          {action.title}
                        </h3>
                        <p className={[
                          "text-[11px] sm:text-xs leading-relaxed transition-colors duration-200",
                          isSelected ? "text-slate-400" : "text-slate-500",
                        ].join(" ")}>
                          {action.description}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Sticky footer ──────────────────────────────────────── */}
      {selectedCount > 0 && (
        <div className="border-t border-slate-100 bg-white px-4 sm:px-8 py-3 flex-shrink-0">
          <div className="flex items-center justify-between">
            <p className="text-xs sm:text-sm font-medium text-slate-900">
              {selectedCount} action{selectedCount !== 1 ? "s" : ""} selected
            </p>
            <button
              onClick={onProcessNote}
              className="inline-flex items-center gap-2 rounded-xl bg-black px-4 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-medium text-white transition hover:bg-gray-800 cursor-pointer"
            >
              Process note
              <ArrowRight />
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes galleryChildIn {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .animate-gallery-child {
          animation: galleryChildIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) both;
        }
      `}</style>
    </div>
  );
}