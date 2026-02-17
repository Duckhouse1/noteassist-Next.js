"use client";

import NoteCard from "@/app/Components/NoteCard";
import { useEffect, useState } from "react";

export interface Note {
  title: string | null;
  content: string;
}

function NotesSkeleton() {
  // show 6 placeholder cards
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="rounded-2xl bg-white p-5 shadow-md border border-gray-100"
        >
          <div className="h-5 w-2/3 rounded-lg bg-gray-200 animate-pulse" />
          <div className="mt-4 space-y-2">
            <div className="h-3 w-full rounded-lg bg-gray-200 animate-pulse" />
            <div className="h-3 w-11/12 rounded-lg bg-gray-200 animate-pulse" />
            <div className="h-3 w-4/5 rounded-lg bg-gray-200 animate-pulse" />
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
    <div className="p-8">
      <div className="flex items-end justify-between mb-6">
        <h1 className="text-3xl font-bold">My Notes</h1>

        {loading && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span className="inline-block h-2 w-2 rounded-full bg-gray-400 animate-pulse" />
            Loading notes...
          </div>
        )}
      </div>

      {loading ? (
        <NotesSkeleton />
      ) : notes.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center">
          <p className="text-lg font-semibold">No notes yet</p>
          <p className="text-gray-600 mt-1">
            Create your first note and it’ll show up here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {notes.map((note, index) => (
            <NoteCard key={index} note={note} />
          ))}
        </div>
      )}
    </div>
  );
}
