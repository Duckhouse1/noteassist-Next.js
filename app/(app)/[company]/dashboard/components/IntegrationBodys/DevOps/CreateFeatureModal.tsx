import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { DevOpsTaskTypes } from "./TaskDisplayPanel";

type CreateFeatureModalProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: { title: string; description: string }) => void;
  type: DevOpsTaskTypes
};

export function CreateDevopsElementModal({ open, onClose, onSubmit, type }: CreateFeatureModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");


  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("keydown", onKeyDown);
    // Optional: lock scroll when modal is open
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  
  if (!open) return null;


  const handleSubmit = (e: React.SubmitEvent) => {
  e.preventDefault();
  onSubmit({ title: title.trim(), description: description.trim() });
  setTitle("");
  setDescription("");
  onClose();
};

  const ModalContent = (
    <div className="fixed inset-0 z-50">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal panel */}
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div
          className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white shadow-xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Create {type}</h2>
                <p className="text-sm text-slate-500 mt-1">
                  Add a title and description for your new feature.
                </p>
              </div>

              <button
                onClick={onClose}
                className="rounded-md px-2 py-1 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Title
                </label>
                <input
                  autoFocus
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-900 outline-none focus:ring-2 focus:ring-blue-200"
                  placeholder="e.g. Improve onboarding flow"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="mt-1 w-full min-h-[120px] rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-900 outline-none focus:ring-2 focus:ring-blue-200"
                  placeholder="Short description of what this feature should accomplish…"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={!title.trim()}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(ModalContent, document.body);
}
