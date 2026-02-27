"use client";

import { useContext, useState } from "react";
import { Note } from "../(app)/[company]/dashboard/sections/MyNotesPage";
import { CurrentSiteContext, NotesContext } from "../Contexts";

interface NoteCardProps {
  note: Note;
}

export default function NoteCard({ note }: NoteCardProps) {
  const [open, setOpen] = useState(false);
  const {setNotes} = useContext(NotesContext)
  const {setCurrentPage} = useContext(CurrentSiteContext)
  const preview =
    note.content.length > 140
      ? note.content.slice(0, 140) + "..."
      : note.content;

  const wordCount = note.content.trim().split(/\s+/).length;

  return (
    <>
      {/* Card */}
      <div
        onClick={() => setOpen(true)}
        className="group flex flex-col justify-between cursor-pointer rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-150 hover:shadow-md hover:border-slate-300"
      >
        <div>
          <h2 className="text-sm font-semibold text-slate-900 leading-snug mb-2.5 group-hover:text-[#1E3A5F] transition-colors">
            {note.title || "Untitled note"}
          </h2>
          <p className="text-xs text-slate-500 leading-relaxed line-clamp-4">
            {preview}
          </p>
        </div>
        <div className="mt-4 flex items-center justify-between">
          <span className="text-[10px] font-medium text-slate-400 tabular-nums">
            {wordCount} words
          </span>
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#1E3A5F] opacity-0 group-hover:opacity-100 transition-opacity">
            Open
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </span>
        </div>
      </div>

      {/* Modal */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-8"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative flex flex-col w-full max-w-[800px] max-h-[85vh] rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden"
          >
            {/* Modal header */}
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-7 py-5 shrink-0">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Note</p>
                <h2 className="text-lg font-bold text-slate-900 leading-snug">
                  {note.title || "Untitled note"}
                </h2>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:text-slate-700 hover:border-slate-300 transition-colors focus:outline-none"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Modal body — scrollable */}
            <div className="flex-1 overflow-y-auto px-7 py-6">
              <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed" style={{ fontFamily: "'Georgia', serif", lineHeight: "1.8" }}>
                {note.content}
              </p>
            </div>

            {/* Modal footer */}
            <div className="flex items-center justify-between border-t border-slate-100 px-7 py-4 shrink-0">
              <span className="text-xs text-slate-400 tabular-nums">{wordCount} words</span>
              <div className="gap-2 flex">
                <button
                  onClick={() => {
                    setNotes(note)
                    setCurrentPage("frontpage")
                  }}
                  className="cursor-pointer rounded-lg bg-black px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-gray-800 focus:outline-none focus:ring-offset-2"
                >
                  Continue writing
                </button>
                <button
                  onClick={() => setOpen(false)}
                  className="cursor-pointer rounded-lg bg-black px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-gray-800 focus:outline-none focus:ring-offset-2"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}