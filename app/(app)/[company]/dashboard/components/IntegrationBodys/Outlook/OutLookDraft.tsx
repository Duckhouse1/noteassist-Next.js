import { ShowNotesBodyContext } from "@/app/Contexts";
import { EmailDraft } from "@/app/types/OpenAI";
import { useContext } from "react";
import { NotesBody } from "../../NotesBody";

export const OutLookDraft = ({ emailDraft }: { emailDraft: EmailDraft }) => {
    const {show} = useContext(ShowNotesBodyContext)
    const sendOutlookMail = () => {

    }
     if(show){
        return <NotesBody></NotesBody>
    }
    return (
        <div className="w-full h-[65vh] flex flex-col rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-6 py-4">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600">
                        <svg
                            className="h-6 w-6 text-white"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                            />
                        </svg>
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold text-slate-900">Email Draft</h2>
                        <p className="text-xs text-slate-500">Ready to send to Outlook</p>
                    </div>
                </div>
                <button 
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
                onClick={() => sendOutlookMail()}
                >
                    Send via Outlook
                </button>
            </div>

            {/* Email Form */}
            <div className="flex-1 overflow-y-auto p-6">
                <div className="space-y-4">
                    {/* Recipients */}
                    <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-700">
                            To
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {emailDraft.recipients.map((recipient, index) => (
                                <span
                                    key={index}
                                    className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700 border border-blue-200"
                                >
                                    {recipient}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Subject */}
                    <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-700">
                            Subject
                        </label>
                        <input
                            type="text"
                            value={emailDraft.subject}
                            readOnly
                            className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 shadow-sm outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                        />
                    </div>

                    {/* Body */}
                    <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-700">
                            Message
                        </label>
                        <textarea
                            value={emailDraft.body}
                            readOnly
                            rows={12}
                            className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100 resize-none"
                        />
                    </div>
                </div>
            </div>

            {/* Footer Actions */}
            <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-6 py-4">
                <div className="flex gap-2">
                   
                    <button className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50">
                        Copy
                    </button>
                </div>
                <button className="rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-600 shadow-sm transition hover:bg-red-50">
                    Discard
                </button>
            </div>
        </div>
    );
};