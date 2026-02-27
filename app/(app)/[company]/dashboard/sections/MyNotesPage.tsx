"use client";

import NoteCard from "@/app/Components/NoteCard";
import { useEffect, useState } from "react";

export interface Note {
  title: string | null;
  content: string;
  id: string | null;
}

function NotesSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="rounded-2xl bg-white p-5 border border-gray-200"
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
    <div className="bg-white w-full h-full flex flex-col overflow-auto">
      {/* Page header */}
      <div className="p-10 px-20 pb-0">
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tighter">My Notes</h1>
            <h2 className="text-gray-400">
              All your saved notes in one place
            </h2>
          </div>
          {!loading && (
            <span className="text-xs font-medium text-slate-400 tabular-nums">
              {notes.length} {notes.length === 1 ? "note" : "notes"}
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="px-20 pt-8 pb-20">
        {loading ? (
          <NotesSkeleton />
        ) : notes.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 py-28 px-8">
            <div className="flex items-center gap-1.5 mb-5 opacity-30">
              <div className="h-1 w-1 rounded-full bg-slate-900" />
              <div className="h-1 w-6 rounded-full bg-slate-900" />
              <div className="h-1 w-1 rounded-full bg-slate-900" />
            </div>
            <p className="text-[13px] font-medium tracking-tight text-slate-400">
              No notes yet — create one to get started
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