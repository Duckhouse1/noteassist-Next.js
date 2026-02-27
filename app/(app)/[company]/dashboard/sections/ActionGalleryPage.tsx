"use client";

import { useMemo } from "react";
import { ArrowRight, CheckIcon } from "@/app/Components/Icons/ButtonNCardsIcons";
import { Action } from "@/lib/Integrations/Types";
import { AllIntegrationOptions } from "@/lib/Integrations/Catalog";
import { Pages } from "../dashboardClient";
import Image from "next/image";

interface ActionGalleryProps {
    actions: Action[];
    selectedActions: Action[];
    setSelectedActions: (action: Action) => void;
    onGoBack: () => void;
    onProcessNote: () => void;
    setCurrentPage: (page: Pages) => void;
}

type ProviderGroup = {
    providerId: string;
    title: string;
    iconURL: string;
    actions: Action[];
};

export default function ActionGalleryPage({
    actions,
    selectedActions,
    setSelectedActions,
    onGoBack,
    onProcessNote,
    setCurrentPage,
}: ActionGalleryProps) {

    // Group actions by provider
    const providerGroups = useMemo(() => {
        const groups: ProviderGroup[] = [];
        const catalog = AllIntegrationOptions;

        for (const card of catalog) {
            const providerActions = actions.filter((a) => a.integration === card.providerId);
            if (providerActions.length === 0) continue;
            groups.push({
                providerId: card.providerId,
                title: card.title,
                iconURL: card.iconURL,
                actions: providerActions,
            });
        }

        // Actions without a provider (if any)
        const ungrouped = actions.filter((a) => !a.integration);
        if (ungrouped.length > 0) {
            groups.push({
                providerId: "general",
                title: "General",
                iconURL: "",
                actions: ungrouped,
            });
        }

        return groups;
    }, [actions]);

    const selectedCount = selectedActions.length;

    return (
        <div className="bg-white w-full h-full flex flex-col animate-gallery-in overflow-x-hidden">
            {/* Header */}
            <div className="animate-gallery-in flex flex-col flex-1">
                <div className="p-10 px-20 pb-0">
                    <button
                        type="button"
                        onClick={onGoBack}
                        className="cursor-pointer inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-700 transition-colors mb-5 group"
                    >
                        <svg
                            width="15" height="15" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                            className="transition-transform group-hover:-translate-x-0.5"
                        >
                            <line x1="19" y1="12" x2="5" y2="12" />
                            <polyline points="12 19 5 12 12 5" />
                        </svg>
                        Back to note
                    </button>
                    <h1 className="text-4xl font-bold tracking-tighter">Action gallery</h1>
                    <div className=" flex justify-between">
                        <h2 className="text-gray-400">
                         Choose what actions to perform on your notes 
                        </h2>
                        {/* Manage link */}
                        {providerGroups.length > 0 && (
                            <div className="flex justify-start animate-gallery-child" style={{ animationDelay: "200ms" }}>
                                <button
                                    onClick={() => {
                                        window.scrollTo({ top: 0, behavior: "instant" });
                                        setCurrentPage("Integrations");
                                    }}
                                    className="cursor-pointer text-xs text-slate-400 hover:text-slate-600 transition-colors underline underline-offset-2"
                                >
                                    Manage available actions →
                                </button>
                            </div>
                        )}
                    </div>

                </div>

                {/* Content */}
                <div className="px-20 pt-10 pb-32 flex-1">
                    {providerGroups.length === 0 ? (
                        <div
                            className="flex flex-col items-center justify-center py-24 animate-gallery-child"
                            style={{ animationDelay: "60ms" }}
                        >
                            <div className="flex gap-1 mb-4">
                                <span className="h-1.5 w-1.5 rounded-full bg-slate-200" />
                                <span className="h-1.5 w-1.5 rounded-full bg-slate-300" />
                                <span className="h-1.5 w-1.5 rounded-full bg-slate-200" />
                            </div>
                            <p className="text-sm text-slate-400 mb-1">No actions available</p>
                            <p className="text-xs text-slate-300 mb-4">Enable integrations to see available actions</p>
                            <button
                                onClick={() => setCurrentPage("Integrations")}
                                className="cursor-pointer text-xs font-medium text-black underline underline-offset-2 hover:text-slate-600 transition-colors"
                            >
                                Go to Integrations
                            </button>
                        </div>
                    ) : (
                        <div
                            className="grid gap-8"
                            style={{
                                gridTemplateColumns: `repeat(${Math.min(providerGroups.length, 3)}, 1fr)`,
                            }}
                        >
                            {providerGroups.map((group, groupIdx) => (
                                <div
                                    key={group.providerId}
                                    className="flex flex-col animate-gallery-child"
                                    style={{ animationDelay: `${groupIdx * 80}ms` }}
                                >
                                    {/* Provider header */}
                                    <div className="flex items-center gap-3 mb-5 pb-4 border-b border-slate-100">
                                        {group.iconURL ? (
                                            <div className="h-9 w-9 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center p-1.5">
                                                <Image
                                                width={20}
                                                height={20}
                                                    src={group.iconURL}
                                                    alt={group.title}
                                                    className="h-full w-full object-contain"
                                                />
                                            </div>
                                        ) : (
                                            <div className="h-9 w-9 rounded-xl bg-black flex items-center justify-center">
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
                                    <div className="flex flex-col gap-3">
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
                                                        "cursor-pointer group relative flex flex-col items-start rounded-2xl border p-5 text-left transition-all duration-200",
                                                        isSelected
                                                            ? "border-black bg-black shadow-lg shadow-black/5"
                                                            : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm",
                                                    ].join(" ")}
                                                    style={{
                                                        animationDelay: `${groupIdx * 80 + actionIdx * 50 + 100}ms`,
                                                    }}
                                                >
                                                    {/* Selection indicator */}
                                                    <div className={[
                                                        "absolute top-4 right-4 h-5 w-5 rounded-full border-2 flex items-center justify-center transition-all duration-200",
                                                        isSelected
                                                            ? "border-white bg-white text-black scale-100"
                                                            : "border-slate-200 group-hover:border-slate-400 scale-100",
                                                    ].join(" ")}>
                                                        {isSelected && <CheckIcon />}
                                                    </div>

                                                    <h3 className={[
                                                        "text-sm font-semibold pr-8 mb-1 transition-colors duration-200",
                                                        isSelected ? "text-white" : "text-slate-900",
                                                    ].join(" ")}>
                                                        {action.title}
                                                    </h3>
                                                    <p className={[
                                                        "text-xs leading-relaxed transition-colors duration-200",
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
            </div>
            {/* Sticky footer bar */}
            {selectedCount > 0 && (
                <div className="sticky bottom-0 z-40">
                    <div className="mx-auto max-w-3xl px-6 pb-6">
                        <div className="flex items-center justify-between rounded-2xl border border-gray-200 bg-white px-6 py-4 shadow-lg shadow-black/5 backdrop-blur-sm">
                            <p className="text-sm font-medium text-slate-900">
                                {selectedCount} action{selectedCount > 1 ? "s" : ""} selected
                            </p>
                            <button
                                onClick={onProcessNote}
                                className="cursor-pointer inline-flex items-center gap-2 rounded-xl bg-black px-5 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800"
                            >
                                Process note
                                <ArrowRight />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style jsx>{`
                @keyframes galleryIn {
                    from {
                        opacity: 0;
                        transform: translateX(40px);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(0);
                    }
                }
                @keyframes galleryChildIn {
                    from {
                        opacity: 0;
                        transform: translateY(12px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                @keyframes footerSlideUp {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                .animate-gallery-in {
                    animation: galleryIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) both;
                }
                .animate-gallery-child {
                    animation: galleryChildIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) both;
                }
                .animate-footer-in {
                    animation: footerSlideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) both;
                }
            `}</style>
        </div>
    );
}