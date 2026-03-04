import { OpenAIActionSolutionsMapContext, ShowNotesBodyContext } from "@/app/Contexts";
import { useContext, useState } from "react";
import { NotesBody } from "../../NotesBody";

export const OutLookDraft = ({ integrationKey, responseType }: { integrationKey: string; responseType: string }) => {
    const { show } = useContext(ShowNotesBodyContext);
    const { OpenAISolutionsMap, setOpenAISolutionsMap } = useContext(OpenAIActionSolutionsMapContext);

    const [editingRecipients, setEditingRecipients] = useState(false);
    const [recipientInput, setRecipientInput] = useState("");
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [sendResult, setSendResult] = useState<{ ok: boolean; message: string } | null>(null);

    // ✅ Tidlig return KUN efter alle hooks
    const responses = OpenAISolutionsMap.get(integrationKey) ?? [];
    const match = responses.find(r => r.type === responseType);
    if (!match || match.type !== "email_draft") return null;
    const draft = match.content;
    const startEditing = () => {
        setRecipientInput(draft.recipients.join(", "));
        setEditingRecipients(true);
    };

    const saveRecipients = () => {
        const parsed = recipientInput
            .split(",")
            .map((r) => r.trim())
            .filter(Boolean);
        const current = OpenAISolutionsMap.get(integrationKey);
        const emailDraft = current?.find((Solution) => Solution.type === "email_draft")
        if (emailDraft) {
            setOpenAISolutionsMap(integrationKey, {
                ...emailDraft,
                content: { ...emailDraft.content, recipients: parsed },
            });
        }
        setEditingRecipients(false);
    };

    const handleSendConfirmed = async () => {
        setIsSending(true);
        setSendResult(null);
        try {
            const res = await fetch("/api/integrations/Outlook/SendEmail", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    recipients: draft.recipients,
                    contentHtml: draft.body,
                    subject: draft.subject,
                }),
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
                setSendResult({ ok: false, message: data?.error ?? `Failed to send (${res.status})` });
            } else {
                setSendResult({ ok: true, message: "Email sent successfully!" });
            }
        } catch (err) {
            setSendResult({ ok: false, message: err instanceof Error ? err.message : "Unknown error" });
        } finally {
            setIsSending(false);
            setShowConfirmModal(false);
        }
    };

    if (show) return <NotesBody />;

    return (
        <>
            <div className="w-full h-[65vh] flex flex-col rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-6 py-4">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600">
                            <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-slate-900">Email Draft</h2>
                            <p className="text-xs text-slate-500">Ready to send to Outlook</p>
                        </div>
                    </div>
                    <button
                        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:opacity-60"
                        onClick={() => setShowConfirmModal(true)}
                        disabled={isSending}
                    >
                        Send via Outlook
                    </button>
                </div>

                {/* Send result banner */}
                {sendResult && (
                    <div className={`px-6 py-3 text-sm font-medium flex items-center gap-2 ${sendResult.ok ? "bg-green-50 text-green-700 border-b border-green-100" : "bg-red-50 text-red-700 border-b border-red-100"}`}>
                        <span>{sendResult.ok ? "✓" : "✕"}</span>
                        <span>{sendResult.message}</span>
                        <button onClick={() => setSendResult(null)} className="ml-auto text-xs underline opacity-60 hover:opacity-100">
                            Dismiss
                        </button>
                    </div>
                )}

                {/* Email Form */}
                <div className="flex-1 overflow-y-auto p-6">
                    <div className="space-y-4">
                        {/* Recipients */}
                        <div>
                            <label className="mb-2 block text-sm font-semibold text-slate-700">To</label>
                            <div className="flex items-center gap-2">
                                {editingRecipients ? (
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="text"
                                            value={recipientInput}
                                            onChange={(e) => setRecipientInput(e.target.value)}
                                            onKeyDown={(e) => e.key === "Enter" && saveRecipients()}
                                            className="rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                            style={{ width: `${Math.max(recipientInput.length, 20)}ch` }}
                                            placeholder="email1@example.com, email2@example.com"
                                            autoFocus
                                        />
                                        <button onClick={saveRecipients} className="shrink-0 rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700">
                                            Save
                                        </button>
                                        <button onClick={() => setEditingRecipients(false)} className="shrink-0 rounded-md px-3 py-1.5 text-sm font-medium text-gray-500 hover:text-gray-700">
                                            Cancel
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <div className="flex flex-wrap gap-2">
                                            {draft.recipients.map((recipient, index) => (
                                                <span key={index} className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700 border border-blue-200">
                                                    {recipient}
                                                </span>
                                            ))}
                                        </div>
                                        <button onClick={startEditing} className="shrink-0 rounded-md p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100" title="Edit recipients">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                                                <path d="m15 5 4 4" />
                                            </svg>
                                        </button>
                                        <button className="hover:bg-gray-100 hover:text-black px-2 py-0.5 rounded-m text-gray-400">+</button>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Subject */}
                        <div>
                            <label className="mb-2 block text-sm font-semibold text-slate-700">Subject</label>
                            <input
                                type="text"
                                value={draft.subject}
                                readOnly
                                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 shadow-sm outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                            />
                        </div>

                        {/* Body */}
                        <div>
                            <label className="mb-2 block text-sm font-semibold text-slate-700">Message</label>
                            <textarea
                                value={draft.body}
                                readOnly
                                rows={12}
                                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100 resize-none"
                            />
                        </div>
                    </div>
                </div>

                {/* Footer */}
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

            {/* Confirmation Modal */}
            {showConfirmModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                    <div className="w-full max-w-md mx-4 rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden">
                        <div className="flex items-center gap-3 border-b border-slate-100 bg-slate-50 px-6 py-4">
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600">
                                <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <h3 className="text-base font-semibold text-slate-900">Send Email</h3>
                        </div>
                        <div className="px-6 py-5">
                            <p className="text-sm text-slate-700 mb-4">Are you sure you want to send this email?</p>
                            <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 space-y-1.5">
                                <div className="flex gap-2 text-sm">
                                    <span className="font-medium text-slate-500 w-14 shrink-0">To:</span>
                                    <span className="text-slate-800 truncate">{draft.recipients.join(", ")}</span>
                                </div>
                                <div className="flex gap-2 text-sm">
                                    <span className="font-medium text-slate-500 w-14 shrink-0">Subject:</span>
                                    <span className="text-slate-800 truncate">{draft.subject}</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-3 border-t border-slate-100 px-6 py-4">
                            <button onClick={() => setShowConfirmModal(false)} disabled={isSending} className="flex-1 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-50">
                                Cancel
                            </button>
                            <button onClick={handleSendConfirmed} disabled={isSending} className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:opacity-60 flex items-center justify-center gap-2">
                                {isSending ? (
                                    <>
                                        <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                                        </svg>
                                        Sending...
                                    </>
                                ) : "Yes, Send"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};