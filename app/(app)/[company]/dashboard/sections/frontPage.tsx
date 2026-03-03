"use client";

import { Dispatch, useContext, useEffect, useRef } from "react";
import { ActionKey } from "./ConfigurationPage";
import { LoadingContext, OrganizationModeContext } from "@/app/Contexts";
import { ArrowRight, CheckIcon } from "@/app/Components/Icons/ButtonNCardsIcons";
import { Note } from "./MyNotesPage";
import { Action, IntegrationOptionsTitle } from "@/lib/Integrations/Types";
import { Pages } from "../dashboardClient";

/* ─────────────────────────────────────────────
   Rich Note Editor
   Supports:
     (title:1)   → big bold heading; Enter exits back to normal
     (*) + space → clean bullet with indent; Enter continues bullets,
                   empty bullet + Enter exits bullet mode
───────────────────────────────────────────── */

const EDITOR_STYLES = `
  .note-editor .note-heading {
    font-size: 20px;
    font-weight: 700;
    line-height: 1.4;
    color: #0f172a;
    margin: 2px 0;
  }
  .note-editor .note-bullet {
    padding-left: 18px;
    position: relative;
  }
  .note-editor .note-bullet::before {
    content: '•';
    position: absolute;
    left: 2px;
    color: #0f172a;
    font-size: 14.5px;
    line-height: 1.8;
  }
  .note-editor:focus { outline: none; }
  .note-editor > div:focus { outline: none; }
`;

function RichNoteEditor({
    value,
    onChange,
}: {
    value: string;
    onChange: (v: string) => void;
}) {
    const editorRef = useRef<HTMLDivElement>(null);
    const initializedRef = useRef(false);

    // Hydrate initial content once on mount
    useEffect(() => {
        if (editorRef.current && !initializedRef.current) {
            initializedRef.current = true;
            if (value) editorRef.current.innerText = value;
        }
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    /** Walk up from the cursor's anchor node to find the direct child of the editor. */
    const getCurrentBlock = (): Element | null => {
        const sel = window.getSelection();
        if (!sel?.rangeCount) return null;

        let node: Node | null = sel.anchorNode;

        // Walk up until we're a direct child of the editor
        while (node && node.parentNode !== editorRef.current) {
            node = node.parentNode;
        }

        if (!node || node === editorRef.current) return null;

        // If it's a bare text node directly inside the editor, wrap it
        if (node.nodeType === Node.TEXT_NODE) {
            const div = document.createElement("div");
            node.parentNode?.insertBefore(div, node);
            div.appendChild(node);
            return div;
        }

        return node as Element;
    };

    const moveCursorToEnd = (el: Element) => {
        const sel = window.getSelection();
        const range = document.createRange();
        range.selectNodeContents(el);
        range.collapse(false);
        sel?.removeAllRanges();
        sel?.addRange(range);
    };

    const moveCursorToStart = (el: Element) => {
        const sel = window.getSelection();
        const range = document.createRange();
        range.setStart(el, 0);
        range.collapse(true);
        sel?.removeAllRanges();
        sel?.addRange(range);
    };

    /** Check the current block for trigger patterns and transform it. */
    const applyTransformations = () => {
        const block = getCurrentBlock();
        if (!block) return;

        const text = block.textContent ?? "";

        // (title:1) → heading
        const titleMatch = text.match(/^\(title:1\)(.*)/);
        if (titleMatch) {
            block.textContent = titleMatch[1];
            block.className = "note-heading";
            moveCursorToEnd(block);
            return;
        }

        // (*) followed by a space → bullet
        const bulletMatch = text.match(/^\(\*\)\s(.*)/);
        if (bulletMatch) {
            block.textContent = bulletMatch[1];
            block.className = "note-bullet";
            moveCursorToEnd(block);
            return;
        }
    };

    const handleInput = () => {
        applyTransformations();
        if (editorRef.current) {
            onChange(editorRef.current.innerText);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
        const block = getCurrentBlock();
        if (!block) return;

        if (e.key === "Enter") {
            // ── Heading: Enter exits back to normal text ──
            if (block.classList.contains("note-heading")) {
                e.preventDefault();
                const newDiv = document.createElement("div");
                newDiv.innerHTML = "<br>";
                block.after(newDiv);
                moveCursorToStart(newDiv);
                onChange(editorRef.current?.innerText ?? "");
                return;
            }

            // ── Bullet: empty bullet exits; non-empty continues ──
            if (block.classList.contains("note-bullet")) {
                if (!block.textContent?.trim()) {
                    // Exit bullet mode on double-Enter
                    e.preventDefault();
                    block.className = "";
                    block.innerHTML = "<br>";
                    moveCursorToStart(block);
                } else {
                    // Continue bullet on next line
                    e.preventDefault();
                    const newDiv = document.createElement("div");
                    newDiv.className = "note-bullet";
                    newDiv.innerHTML = "<br>";
                    block.after(newDiv);
                    moveCursorToStart(newDiv);
                }
                onChange(editorRef.current?.innerText ?? "");
            }
        }

        // Backspace on an empty formatted block → strip the format
        if (e.key === "Backspace") {
            const isFormatted =
                block.classList.contains("note-heading") ||
                block.classList.contains("note-bullet");
            if (isFormatted && !block.textContent?.trim()) {
                e.preventDefault();
                block.className = "";
                block.innerHTML = "<br>";
                moveCursorToStart(block);
                onChange(editorRef.current?.innerText ?? "");
            }
        }
    };

    return (
        <>
            <style>{EDITOR_STYLES}</style>
            <div
                ref={editorRef}
                contentEditable
                suppressContentEditableWarning
                onInput={handleInput}
                onKeyDown={handleKeyDown}
                className="note-editor min-h-[420px] w-full bg-white px-6 py-5 text-sm leading-relaxed text-slate-800 outline-none"
                style={{
                    fontFamily: "'Georgia', serif",
                    fontSize: "14.5px",
                    lineHeight: "1.8",
                }}
            />
        </>
    );
}

/* ─────────────────────────────────────────────
   FrontPage
───────────────────────────────────────────── */

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

                        {/* Editor with toolbar */}
                        <div className="border border-gray-200 rounded-2xl overflow-hidden">
                            {/* Toolbar */}
                            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/60 px-5 py-2.5">
                                <div className="flex items-center gap-3 text-[11px] text-slate-400">
                                    <span>Plain text</span>
                                    <span className="text-slate-200">·</span>
                                    <span className="text-slate-300 font-mono">(title:1)</span>
                                    <span className="text-slate-200">→</span>
                                    <span className="text-slate-300">heading</span>
                                    <span className="text-slate-200">·</span>
                                    <span className="text-slate-300 font-mono">(*)</span>
                                    <span className="text-slate-200">→</span>
                                    <span className="text-slate-300">bullet</span>
                                </div>
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

                            {/* Rich text editor */}
                            <RichNoteEditor
                                value={notes?.content ?? ""}
                                onChange={(v) => setNotes(prev => ({ ...prev, content: v }))}
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