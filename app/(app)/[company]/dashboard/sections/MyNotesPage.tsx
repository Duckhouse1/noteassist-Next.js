"use client";

import NoteCard from "@/app/Components/NoteCard";
import { useEffect, useState } from "react";

export interface Note {
  title: string | null;
  content: string;
}

function NotesSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="rounded-xl bg-white p-5 border border-slate-200 shadow-sm"
        >
          <div className="h-4 w-1/2 rounded bg-slate-100 animate-pulse mb-3" />
          <div className="space-y-2">
            <div className="h-3 w-full rounded bg-slate-100 animate-pulse" />
            <div className="h-3 w-5/6 rounded bg-slate-100 animate-pulse" />
            <div className="h-3 w-3/4 rounded bg-slate-100 animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function MyNotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const FetchUserNotes = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/user/notes", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });
        if (!response.ok) throw new Error("Failed to fetch notes");
        const data = await response.json();
        setNotes(data);
      } catch (error) {
        console.log("Failed to fetch notes: " + error);
      } finally {
        setLoading(false);
      }
    };
    FetchUserNotes();
  }, []);

  return (
    <div className="min-h-full bg-[#F4F5F7]">
      {/* Page header band */}
      <div className="bg-white border-b border-slate-200 px-8 py-5">
        <div className="mx-auto max-w-7xl 2xl:max-w-[1600px] flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">Workspace</p>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">My Notes</h1>
          </div>

          <div className="flex items-center gap-3">
            {loading ? (
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-slate-400 animate-pulse" />
                Fetching notes...
              </div>
            ) : (
              <span className="text-xs font-medium text-slate-400 tabular-nums">
                {notes.length} {notes.length === 1 ? "note" : "notes"}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-7xl 2xl:max-w-[1600px] px-8 py-8">
        {loading ? (
          <NotesSkeleton />
        ) : notes.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white py-20 text-center shadow-sm">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="12" y1="18" x2="12" y2="12" />
                <line x1="9" y1="15" x2="15" y2="15" />
              </svg>
            </div>
            <p className="text-sm font-semibold text-slate-800">No notes yet</p>
            <p className="mt-1 text-xs text-slate-500">
              Create your first note and it will appear here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {notes.map((note, index) => (
              <NoteCard key={index} note={note} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}