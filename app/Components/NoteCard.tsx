"use client";

import { useState } from "react";
import { Note } from "../(app)/[company]/dashboard/sections/MyNotesPage";

interface NoteCardProps {
  note: Note;
}

export default function NoteCard({ note }: NoteCardProps) {
  const [open, setOpen] = useState(false);

  const preview =
    note.content.length > 120
      ? note.content.slice(0, 120) + "..."
      : note.content;

  return (
    <>
      {/* Card */}
      <div
        onClick={() => setOpen(true)}
        className="w-64 cursor-pointer rounded-2xl bg-white p-5 shadow-md transition hover:shadow-xl hover:scale-[1.02] border border-gray-100"
      >
        <h2 className="text-lg font-semibold text-gray-800 mb-2">
          {note.title || "Untitled note"}
        </h2>

        <p className="text-sm text-gray-600 line-clamp-3">
          {preview}
        </p>
      </div>

      {/* Modal */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-[600px] max-w-[90%] rounded-2xl bg-white p-8 shadow-2xl"
          >
            <h2 className="text-2xl font-bold mb-4">
              {note.title || "Untitled note"}
            </h2>

            <p className="text-gray-700 whitespace-pre-wrap">
              {note.content}
            </p>

            <button
              onClick={() => setOpen(false)}
              className="mt-6 px-4 py-2 rounded-lg bg-black text-white hover:opacity-80 transition"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}
