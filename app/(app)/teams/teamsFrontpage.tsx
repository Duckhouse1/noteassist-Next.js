"use client";

import { Dispatch, useState } from "react";
import { Note } from "@/app/(app)/[company]/dashboard/sections/MyNotesPage";

type NoteType = "Notes" | "Transcript";

interface TeamsFrontPageProps {
  company: string;
  notes: Note;
  setNotes: Dispatch<React.SetStateAction<Note>>;
  setNoteTitle: (title: string) => void;
  onSaveNote: () => void;
  selectedCount: number;
  onGoToActionsGallery: () => void;
  onGoToActionsPageClick: () => void;
}

export default function TeamsFrontPage({
  company,
  notes,
  setNotes,
  setNoteTitle,
  onSaveNote,
  selectedCount,
  onGoToActionsGallery,
  onGoToActionsPageClick,
}: TeamsFrontPageProps) {
  const [noteType, setNoteType] = useState<NoteType>("Notes");
  const [showClearModal, setShowClearModal] = useState(false);

  const showTranscript = noteType === "Transcript";
  const hasContent = (notes?.content?.length ?? 0) > 0;
  const charCount = showTranscript
    ? (notes?.Transcript?.length ?? 0)
    : (notes?.content?.length ?? 0);

  const clearNotes = () => {
    setNoteTitle("");
    setNotes({ title: "", content: "", Transcript: "", id: null });
    setShowClearModal(false);
  };

  return (
    <div className="h-full flex flex-col bg-white overflow-hidden">
      {/* Clear modal */}
      {showClearModal && (
        <>
          <div className="fixed inset-0 bg-black/20 z-40" onClick={() => setShowClearModal(false)} />
          <div className="fixed z-50 bottom-24 left-4 right-4 bg-white rounded-2xl p-5 shadow-2xl border border-slate-100">
            <p className="text-sm font-semibold text-slate-900 mb-1">Clear note?</p>
            <p className="text-xs text-slate-500 mb-4">This will remove your title and all content.</p>
            <div className="flex gap-3">
              <button
                onClick={clearNotes}
                className="flex-1 py-2 rounded-xl bg-black text-white text-sm font-medium cursor-pointer"
              >
                Clear
              </button>
              <button
                onClick={() => setShowClearModal(false)}
                className="flex-1 py-2 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </>
      )}

      {/* Compact header */}
      <div className="px-4 pt-4 pb-2 border-b border-slate-100 bg-white">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-base font-bold tracking-tight text-slate-900">New Note</h1>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-slate-400 tabular-nums">{charCount}c</span>
            <button
              onClick={() => setShowClearModal(true)}
              className="text-[10px] text-slate-400 px-2 py-1 border border-slate-200 rounded-lg cursor-pointer"
            >
              Clear
            </button>
            <button
              onClick={onSaveNote}
              className="text-[10px] font-semibold bg-black text-white px-2.5 py-1 rounded-lg cursor-pointer"
            >
              Save
            </button>
          </div>
        </div>

        {/* Title input */}
        <input
          type="text"
          placeholder="Untitled note..."
          value={notes.title ?? ""}
          onChange={(e) => setNoteTitle(e.currentTarget.value)}
          className="w-full text-sm font-medium text-slate-900 outline-none placeholder:text-slate-300 bg-transparent"
        />
      </div>

      {/* Notes / Transcript toggle */}
      <div className="flex px-4 pt-2 pb-1 gap-2 bg-white">
        <button
          onClick={() => setNoteType("Notes")}
          className={[
            "px-3 py-1 text-xs font-medium rounded-lg transition-all cursor-pointer",
            !showTranscript ? "bg-black text-white" : "text-slate-500 border border-slate-200",
          ].join(" ")}
        >
          Notes
        </button>
        <button
          onClick={() => setNoteType("Transcript")}
          className={[
            "px-3 py-1 text-xs font-medium rounded-lg transition-all cursor-pointer",
            showTranscript ? "bg-black text-white" : "text-slate-500 border border-slate-200",
          ].join(" ")}
        >
          Transcript
        </button>
      </div>

      {/* Text area - fills remaining space */}
      <div className="flex-1 overflow-hidden px-4 pb-2">
        <textarea
          className="w-full h-full resize-none focus:outline-none text-sm text-slate-800 font-serif leading-relaxed placeholder:text-slate-300 bg-white"
          placeholder={
            showTranscript
              ? "Paste your meeting transcript here..."
              : "Start writing your meeting notes..."
          }
          value={showTranscript ? (notes.Transcript ?? "") : (notes.content ?? "")}
          onChange={(e) =>
            showTranscript
              ? setNotes((p) => ({ ...p, Transcript: e.target.value }))
              : setNotes((p) => ({ ...p, content: e.target.value }))
          }
        />
      </div>

      {/* Action bar - shown when there's content */}
      {hasContent && (
        <div className="px-4 pb-4 pt-2 border-t border-slate-100 bg-white">
          {selectedCount > 0 ? (
            <div className="flex gap-2">
              <button
                onClick={onGoToActionsGallery}
                className="flex-1 py-3 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 cursor-pointer"
              >
                {selectedCount} action{selectedCount !== 1 ? "s" : ""} selected · Edit
              </button>
              <button
                onClick={onGoToActionsPageClick}
                className="flex-1 py-3 rounded-xl bg-black text-white text-xs font-semibold cursor-pointer flex items-center justify-center gap-1.5"
              >
                Process note
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </button>
            </div>
          ) : (
            <button
              onClick={onGoToActionsGallery}
              className="w-full py-3 rounded-xl bg-black text-white text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
            >
              Select actions
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </button>
          )}
        </div>
      )}
    </div>
  );
}