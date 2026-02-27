"use client";

import { Dispatch, useContext } from "react";
import { ActionKey } from "./ConfigurationPage";
import { LoadingContext, OrganizationModeContext } from "@/app/Contexts";
import { ArrowRight, CheckIcon } from "@/app/Components/Icons/ButtonNCardsIcons";
import { Note } from "./MyNotesPage";
import { Action, IntegrationOptionsTitle } from "@/lib/Integrations/Types";
import { Pages } from "../dashboardClient";

interface FrontPageProps {
    company: string;
    setCurrentPage: (page: Pages) => void;
    selectedActions: Action[];
    notes: Note;
    setNotes: Dispatch<React.SetStateAction<Note>>;
    setNoteTitle: (title: string) => void;
    showToast: boolean;
    onSaveNote: () => void;
    onGoToActionsGallery: () => void;
    selectedCount: number;
    onGoToActionsPageClick: () => void;
}

export const FrontPage: React.FC<FrontPageProps> = ({
    onSaveNote, company, setCurrentPage, selectedActions, notes,
    setNotes, setNoteTitle, onGoToActionsGallery, selectedCount, onGoToActionsPageClick,
}) => {
    const { setIsLoading } = useContext(LoadingContext);
    const { mode } = useContext(OrganizationModeContext);
    const isPersonalMode = mode === "personal";
    const charCount = notes?.content.length ?? 0;

    return (
        <div className="bg-white w-full h-full flex flex-col overflow-auto">
            {/* Page header */}
            <div className="p-10 px-20 pb-0">
                <h1 className="text-4xl font-bold tracking-tighter">New Note</h1>
                <h2 className="text-gray-400">
                    Capture your meeting notes and turn them into actions
                </h2>
            </div>

            {/* Main content */}
            <div className="px-20 pt-8 pb-20">
                <div className="flex items-start gap-10">
                    {/* Note editor */}
                    <div className="flex-1 flex flex-col">
                        {/* Title input */}
                        <input
                            type="text"
                            placeholder="Untitled note..."
                            value={notes.title ?? ""}
                            onChange={(e) => setNoteTitle(e.currentTarget.value)}
                            className="text-lg font-semibold tracking-tight text-slate-900 outline-none placeholder:text-slate-300 mb-4"
                        />

                        {/* Textarea with toolbar */}
                        <div className="border border-gray-200 rounded-2xl overflow-hidden">
                            {/* Toolbar */}
                            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/60 px-5 py-2.5">
                                <span className="text-[11px] text-slate-400">Plain text</span>
                                <div className="flex items-center gap-3">
                                    <span className="text-xs text-slate-400 tabular-nums">{charCount} chars</span>
                                    <button
                                        type="button"
                                        onClick={onSaveNote}
                                        className="cursor-pointer rounded-xl bg-black text-xs font-medium text-white px-3 py-1.5 hover:bg-gray-800 transition-colors"
                                    >
                                        Save note
                                    </button>
                                </div>
                            </div>

                            {/* Textarea */}
                            <textarea
                                placeholder="Begin your note here — capture meeting highlights, decisions, action items, follow-ups..."
                                className="min-h-[420px] w-full resize-none bg-white px-6 py-5 text-sm leading-relaxed text-slate-800 outline-none placeholder:text-slate-300"
                                value={notes?.content}
                                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                                    const value = e.target.value;
                                    setNotes(prev => ({ ...prev, content: value }));
                                }}
                                style={{ fontFamily: "'Georgia', serif", fontSize: "14.5px", lineHeight: "1.8" }}
                            />
                        </div>
                    </div>

                    {/* Right rail */}
                    <div className="w-[280px] shrink-0 flex flex-col gap-4 mt-5">
                        {!isPersonalMode && (
                            <div className="border border-gray-200 rounded-2xl p-5">
                                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">Workspace</p>
                                <div className="flex items-center gap-2.5">
                                    <div className="h-8 w-8 rounded-lg bg-black flex items-center justify-center text-white text-xs font-bold">
                                        {company.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-slate-900">{company}</p>
                                        <p className="text-xs text-slate-400">Company workspace</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="border border-gray-200 rounded-2xl p-5">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">Tips</p>
                            <ul className="space-y-2.5">
                                {[
                                    "Include attendee names for better context",
                                    "List decisions and owners clearly",
                                    "Add follow-up dates where relevant",
                                ].map((tip, i) => (
                                    <li key={i} className="flex items-start gap-2 text-xs text-slate-500 leading-relaxed">
                                        <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                                            <CheckIcon />
                                        </span>
                                        {tip}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Select actions button — navigates to gallery */}
                        {notes?.content && notes.content.length > 0 && (
                            <button
                                type="button"
                                onClick={() => {
                                    window.gtag?.('event', 'select_actions_click', { button_text: 'Select actions!' });
                                    onGoToActionsGallery();
                                }}
                                className="cursor-pointer inline-flex w-full items-center justify-center gap-2 rounded-xl bg-black px-4 py-3 text-sm font-medium text-white transition hover:bg-gray-800"
                            >
                                Select actions
                                <ArrowRight />
                            </button>
                        )}

                        {/* Shortcut: if actions already selected, show process button */}
                        {selectedCount > 0 && notes?.content && notes.content.length > 0 && (
                            <div className="border border-gray-200 rounded-2xl p-4 flex flex-col gap-3">
                                <div className="flex items-center justify-between">
                                    <p className="text-xs font-medium text-slate-900">
                                        {selectedCount} action{selectedCount > 1 ? "s" : ""} selected
                                    </p>
                                    <button
                                        type="button"
                                        onClick={onGoToActionsGallery}
                                        className="cursor-pointer text-[10px] text-slate-400 hover:text-slate-600 transition-colors underline underline-offset-2"
                                    >
                                        Edit
                                    </button>
                                </div>
                                <button
                                    onClick={onGoToActionsPageClick}
                                    className="cursor-pointer inline-flex w-full items-center justify-center gap-2 rounded-xl bg-black px-4 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800"
                                >
                                    Process note
                                    <ArrowRight />
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};