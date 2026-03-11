"use client";

import { useEffect, useState, useContext } from "react";
import { Note } from "@/app/(app)/[company]/dashboard/sections/MyNotesPage";
import { NotesContext, CurrentSiteContext } from "@/app/Contexts";

function Skeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="bg-white rounded-xl p-3 border border-slate-100 animate-pulse">
          <div className="h-3 w-1/3 bg-slate-100 rounded mb-2" />
          <div className="h-2 w-full bg-slate-100 rounded mb-1" />
          <div className="h-2 w-4/5 bg-slate-100 rounded" />
        </div>
      ))}
    </div>
  );
}

export default function TeamsMyNotes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const { setNotes: setActiveNote } = useContext(NotesContext);
  const { setCurrentPage } = useContext(CurrentSiteContext);

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/user/notes");
        if (!res.ok) throw new Error("Failed");
        const data = await res.json();
        setNotes(data);
      } catch {
        // silent fail
      } finally {
        setLoading(false);
      }
    };
    fetchNotes();
  }, []);

  const onDelete = async (noteId: string) => {
    try {
      const res = await fetch("/api/user/notes", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: noteId }),
      });
      if (!res.ok) throw new Error("Failed to delete");
      setNotes((prev) => prev.filter((n) => n.id !== noteId));
      setConfirmDeleteId(null);
    } catch {
      // silent fail
    }
  };

  const openNote = (note: Note) => {
    setActiveNote(note);
    setCurrentPage("frontpage");
  };

  return (
    <div className="h-full flex flex-col bg-[#F5F5F5] overflow-hidden">
      {/* Header */}
      <div className="bg-white px-4 pt-4 pb-3 border-b border-slate-100">
        <div className="flex items-center justify-between">
          <h1 className="text-base font-bold tracking-tight text-slate-900">Saved Notes</h1>
          {!loading && (
            <span className="text-xs text-slate-400 tabular-nums">
              {notes.length} {notes.length === 1 ? "note" : "notes"}
            </span>
          )}
        </div>
      </div>

      {/* Confirm delete overlay */}
      {confirmDeleteId && (
        <>
          <div className="fixed inset-0 bg-black/20 z-40" onClick={() => setConfirmDeleteId(null)} />
          <div className="fixed z-50 bottom-24 left-4 right-4 bg-white rounded-2xl p-5 shadow-2xl border border-slate-100">
            <p className="text-sm font-semibold text-slate-900 mb-1">Delete this note?</p>
            <p className="text-xs text-slate-500 mb-4">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button
                onClick={() => onDelete(confirmDeleteId)}
                className="flex-1 py-2 rounded-xl bg-red-500 text-white text-sm font-medium cursor-pointer"
              >
                Delete
              </button>
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="flex-1 py-2 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </>
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-3">
        {loading ? (
          <Skeleton />
        ) : notes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mb-3">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
            </div>
            <p className="text-sm font-medium text-slate-600 mb-1">No saved notes yet</p>
            <p className="text-xs text-slate-400">Create a note and save it to see it here</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {notes.map((note) => {
              const isExpanded = expandedId === note.id;
              return (
                <div
                  key={note.id}
                  className="bg-white rounded-xl border border-slate-100 overflow-hidden"
                >
                  {/* Note header row */}
                  <button
                    type="button"
                    className="w-full flex items-start justify-between p-3 text-left cursor-pointer"
                    onClick={() => setExpandedId(isExpanded ? null : (note.id ?? null))}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-slate-900 truncate">
                        {note.title || "Untitled note"}
                      </p>
                      {!isExpanded && note.content && (
                        <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">
                          {note.content}
                        </p>
                      )}
                    </div>
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#94a3b8"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className={`ml-2 mt-0.5 flex-shrink-0 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                    >
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </button>

                  {/* Expanded content */}
                  {isExpanded && (
                    <div className="px-3 pb-3 border-t border-slate-50">
                      {note.content && (
                        <p className="text-xs text-slate-600 mt-2 leading-relaxed line-clamp-6">
                          {note.content}
                        </p>
                      )}
                      <div className="flex gap-2 mt-3">
                        <button
                          onClick={() => openNote(note)}
                          className="flex-1 py-2 rounded-lg bg-black text-white text-[10px] font-semibold cursor-pointer"
                        >
                          Open &amp; Edit
                        </button>
                        <button
                          onClick={() => setConfirmDeleteId(note.id ?? null)}
                          className="py-2 px-3 rounded-lg border border-red-200 text-red-500 text-[10px] font-semibold cursor-pointer"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}