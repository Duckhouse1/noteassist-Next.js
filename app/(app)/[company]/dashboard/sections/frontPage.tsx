"use client";

import { Dispatch, useContext, useEffect, useRef, useState } from "react";
import { ActionKey, IntegrationOptions, IntegrationOptionsTitle } from "./ConfigurationPage";
import { LoadingContext, OrganizationModeContext, UserConfigContext } from "@/app/Contexts";
import { Note } from "./MyNotesPage";
import { IntegrationConfigItem } from "../dashboardClient";

interface FrontPageProps {
    company: string;
    setCurrentPage: (page: "frontpage" | "configurations" | "actions") => void;
    setSelectedActions: (newAction: Action) => void;
    selectedActions: Action[];
    actions: Action[];
    notes: string;
    setNotes: Dispatch<React.SetStateAction<string>>;
    NoteTitle: string;
    setNoteTitle: (title: string) => void;
    showToast: boolean;
    onSaveNote: () => void;
    onGoToActionsPageClick: () => void;
}

export interface Action {
    key: ActionKey;
    title: string;
    description: string;
    createText: string;
    integration?: IntegrationOptionsTitle;
    UserConfig?: string
}

const PenIcon = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
);

const ChevronDown = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="6 9 12 15 18 9" />
    </svg>
);

const CheckIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
    </svg>
);

const ArrowRight = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="5" y1="12" x2="19" y2="12" />
        <polyline points="12 5 19 12 12 19" />
    </svg>
);

export const FrontPage: React.FC<FrontPageProps> = ({ onSaveNote, company, setCurrentPage, setSelectedActions, selectedActions, actions, notes,
    setNotes, onGoToActionsPageClick, NoteTitle, setNoteTitle, }) => {

    const { setIsLoading } = useContext(LoadingContext);
    const actionsRef = useRef<HTMLDivElement>(null);
    const { mode } = useContext(OrganizationModeContext);
    const isPersonalMode = mode === "personal";
    const wordCount = notes.trim() ? notes.trim().split(/\s+/).length : 0;
    const charCount = notes.length;
    return (
        <div className="min-h-full bg-[#F4F5F7] flex flex-col">
            {/* Page header band */}
            <div className="bg-white border-b border-slate-200 px-8 py-5">
                <div className="mx-auto w-full max-w-7xl 2xl:max-w-[1600px] flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">Workspace</span>
                            {!isPersonalMode && (
                                <>
                                    <span className="text-slate-300">/</span>
                                    <span className="text-[11px] font-semibold uppercase tracking-widest text-[#1E3A5F]">{company}</span>
                                </>
                            )}
                        </div>
                        <h1 className="text-xl font-bold tracking-tight text-slate-900">New Note</h1>
                    </div>
                    <div className="flex items-center gap-3 mr-10">
                        <span className="text-xs text-slate-400 tabular-nums">{wordCount} words</span>
                        <div className="h-4 w-px bg-slate-200" />
                        <button
                            type="button"
                            onClick={onSaveNote}
                            className="cursor-pointer inline-flex items-center gap-2 rounded-lg bg-[#1E3A5F] px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#16304F] focus:outline-none focus:ring-2 focus:ring-[#1E3A5F] focus:ring-offset-2"
                        >
                            <PenIcon />
                            Save note
                        </button>
                    </div>
                </div>
            </div>

            {/* Main content */}
            <div className="mx-auto w-full max-w-7xl 2xl:max-w-[1600px] px-8 py-5">
                <div className="grid gap-6 lg:grid-cols-[1fr_300px]">

                    {/* Note editor */}
                    <div className="flex flex-col gap-0 rounded-xl overflow-hidden border border-slate-200 bg-white shadow-sm">
                        {/* Editor toolbar */}
                        <div className="flex items-center gap-3 border-b border-slate-100 bg-slate-50/80 px-5 py-3">
                            <div className="flex items-center gap-2 flex-1">
                                <span className="text-slate-400">
                                    <PenIcon />
                                </span>
                                <input
                                    type="text"
                                    placeholder="Untitled note..."
                                    value={NoteTitle}
                                    onChange={(e) => setNoteTitle(e.currentTarget.value)}
                                    className=" flex-1 bg-transparent text-sm font-semibold text-slate-800 outline-none placeholder:text-slate-400"
                                />
                            </div>
                            <div className="flex items-center gap-2 text-xs text-slate-400 tabular-nums">
                                <span>{charCount} chars</span>
                            </div>
                        </div>

                        {/* Textarea */}
                        <textarea
                            placeholder="Begin your note here — capture meeting highlights, decisions, action items, follow-ups..."
                            className="min-h-[420px] w-full resize-none bg-white px-6 py-5 text-sm leading-relaxed text-slate-800 outline-none placeholder:text-slate-300 font-[inherit]"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            style={{ fontFamily: "'Georgia', serif", fontSize: "14.5px", lineHeight: "1.8" }}
                        />

                        {/* Footer bar */}
                        <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/80 px-5 py-2.5">
                            <span className="text-[11px] text-slate-400">Plain text · Auto-formatting off</span>
                            {notes.length > 0 && (
                                <button
                                    type="button"
                                    onClick={() => actionsRef.current?.scrollIntoView({ behavior: "smooth" })}
                                    className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#1E3A5F] hover:text-[#16304F] transition-colors"
                                >
                                    Jump to actions
                                    <ChevronDown />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Right rail */}
                    <aside className="flex flex-col gap-4">
                        {!isPersonalMode && (
                            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">Workspace</p>
                                <div className="flex items-center gap-2.5">
                                    <div className="h-8 w-8 rounded-lg bg-[#1E3A5F] flex items-center justify-center text-white text-xs font-bold">
                                        {company.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-slate-900">{company}</p>
                                        <p className="text-xs text-slate-500">Company workspace</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Note tips */}
                        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">Tips</p>
                            <ul className="space-y-2.5">
                                {[
                                    "Include attendee names for better context",
                                    "List decisions and owners clearly",
                                    "Add follow-up dates where relevant",
                                ].map((tip, i) => (
                                    <li key={i} className="flex items-start gap-2 text-xs text-slate-600 leading-relaxed">
                                        <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#EEF2F8] text-[#1E3A5F]">
                                            <CheckIcon />
                                        </span>
                                        {tip}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {notes.length > 0 && (
                            <button
                                type="button"
                                onClick={() => {
                                    window.gtag?.('event', 'select_actions_click', { button_text: 'Select actions!' });
                                    actionsRef.current?.scrollIntoView({ behavior: 'smooth' });
                                }}
                                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#1E3A5F] px-4 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#16304F] focus:outline-none focus:ring-2 focus:ring-[#1E3A5F] focus:ring-offset-2"
                            >
                                Select actions
                                <ArrowRight />
                            </button>
                        )}
                    </aside>
                </div>

                {/* Actions section */}
                {notes.length > 0 && (
                    <div ref={actionsRef} className="mt-16">
                        {/* Section header */}
                        <div className="mb-8 flex items-end justify-between border-b border-slate-200 pb-4">
                            <div>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Step 2</p>
                                <h2 className="text-lg font-bold text-slate-900">Choose your actions</h2>
                                <p className="text-sm text-slate-500 mt-0.5">Select what youd like to do with this note</p>
                            </div>
                            <button
                                onClick={() => {
                                    window.scrollTo({ top: 0, behavior: "instant" });
                                    setCurrentPage("configurations");
                                }}
                                className="cursor-pointer text-xs text-slate-400 hover:text-slate-600 transition-colors underline underline-offset-2"
                            >
                                Manage available actions →
                            </button>
                        </div>

                        {/* Action cards */}
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {actions.map((action, index) => {
                                const isSelected = selectedActions.some(
                                    (a) => a.title === action.title && a.integration === action.integration && a.key === action.key
                                );
                                return (
                                    <button
                                        key={index}
                                        type="button"
                                        onClick={() => setSelectedActions(action)} // ✅ toggle handled by parent
                                        className={[
                                            "group relative flex flex-col items-start rounded-xl border p-5 text-left transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[#1E3A5F] focus:ring-offset-2",
                                            isSelected
                                                ? "border-[#1E3A5F] bg-[#1E3A5F] shadow-md"
                                                : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-md shadow-sm",
                                        ].join(" ")}
                                    >
                                        {/* Selection indicator */}
                                        <div className={[
                                            "absolute top-4 right-4 h-5 w-5 rounded-full border-2 flex items-center justify-center transition-all",
                                            isSelected
                                                ? "border-white bg-white text-[#1E3A5F]"
                                                : "border-slate-300 group-hover:border-slate-400",
                                        ].join(" ")}>
                                            {isSelected && <CheckIcon />}
                                        </div>

                                        <h3 className={[
                                            "text-sm font-semibold pr-6 mb-2",
                                            isSelected ? "text-white" : "text-slate-900",
                                        ].join(" ")}>
                                            {action.title}
                                        </h3>
                                        <p className={[
                                            "text-xs leading-relaxed",
                                            isSelected ? "text-blue-100" : "text-slate-500",
                                        ].join(" ")}>
                                            {action.description}
                                        </p>

                                        {action.integration && (
                                            <span className={[
                                                "mt-3 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                                                isSelected ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500",
                                            ].join(" ")}>
                                                {action.integration}
                                            </span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>

                        {/* CTA */}
                        {selectedActions.length > 0 && (
                            <div className="mt-8 flex items-center justify-between rounded-xl border border-[#1E3A5F]/20 bg-[#1E3A5F]/5 px-6 py-4">
                                <div>
                                    <p className="text-sm font-semibold text-slate-900">
                                        {selectedActions.length} action{selectedActions.length > 1 ? "s" : ""} selected
                                    </p>
                                    <p className="text-xs text-slate-500 mt-0.5">Ready to process your note</p>
                                </div>
                                <button
                                    onClick={onGoToActionsPageClick}
                                    className="inline-flex items-center gap-2 rounded-lg bg-[#1E3A5F] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#16304F] focus:outline-none focus:ring-2 focus:ring-[#1E3A5F] focus:ring-offset-2"
                                >
                                    Process note
                                    <ArrowRight />
                                </button>
                            </div>
                        )}
                    </div>
                )}

                <div className="h-24" />
            </div>
        </div>
    );
};