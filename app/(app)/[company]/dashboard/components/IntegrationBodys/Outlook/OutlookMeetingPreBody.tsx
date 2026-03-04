"use client";

import { useContext, useState } from "react";
import { OutlookMeeting } from "@/app/types/OpenAI";
import { OpenAIActionSolutionsMapContext, ShowNotesBodyContext } from "@/app/Contexts";
import { NotesBody } from "../../NotesBody";

/* ─── tiny helpers ─── */
function toLocalDateTimeValue(iso: string) {
    // datetime-local input expects "YYYY-MM-DDTHH:MM"
    try { return iso.slice(0, 16); } catch { return ""; }
}
function fromLocalDateTimeValue(val: string) {
    // store as "YYYY-MM-DDTHH:MM:00" (no timezone — Graph interprets as UTC)
    return val.length >= 16 ? `${val}:00` : val;
}
function formatDisplayDateTime(iso: string) {
    try {
        return new Date(iso).toLocaleString(undefined, {
            weekday: "short", year: "numeric", month: "short",
            day: "numeric", hour: "2-digit", minute: "2-digit",
        });
    } catch { return iso; }
}
function durationMinutes(start: string, end: string) {
    try {
        const diff = (new Date(end).getTime() - new Date(start).getTime()) / 60000;
        if (diff < 60) return `${diff} min`;
        const h = Math.floor(diff / 60), m = diff % 60;
        return m > 0 ? `${h}h ${m}min` : `${h}h`;
    } catch { return ""; }
}

/* ─── Attendee pill ─── */
function AttendeePill({ email, onRemove }: { email: string; onRemove: () => void }) {
    return (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700">
            {email}
            <button
                onClick={onRemove}
                className="ml-0.5 rounded-full text-blue-400 hover:text-blue-600"
                title="Remove"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 6 6 18M6 6l12 12" />
                </svg>
            </button>
        </span>
    );
}

/* ─── Toggle ─── */
function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
    return (
        <label className="flex cursor-pointer items-center gap-3">
            <button
                type="button"
                role="switch"
                aria-checked={checked}
                onClick={() => onChange(!checked)}
                className={[
                    "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
                    checked ? "bg-blue-600" : "bg-slate-200",
                ].join(" ")}
            >
                <span className={[
                    "inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform",
                    checked ? "translate-x-6" : "translate-x-1",
                ].join(" ")} />
            </button>
            <span className="text-sm font-medium text-slate-700">{label}</span>
        </label>
    );
}

/* ─── Confirm modal ─── */
function ScheduleConfirmModal({
    meeting,
    onConfirm,
    onCancel,
    isScheduling,
}: {
    meeting: OutlookMeeting;
    onConfirm: () => void;
    onCancel: () => void;
    isScheduling: boolean;
}) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="w-full max-w-md mx-4 rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden">
                <div className="flex items-center gap-3 border-b border-slate-100 bg-slate-50 px-6 py-4">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600">
                        <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    </div>
                    <h3 className="text-base font-semibold text-slate-900">Schedule Meeting</h3>
                </div>

                <div className="px-6 py-5">
                    <p className="text-sm text-slate-700 mb-4">Are you sure you want to schedule this meeting in Outlook?</p>
                    <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 space-y-2">
                        <Row label="Title" value={meeting.title} />
                        <Row label="Start" value={formatDisplayDateTime(meeting.startDateTime)} />
                        <Row label="End" value={formatDisplayDateTime(meeting.endDateTime)} />
                        {meeting.attendees.length > 0 && (
                            <Row label="Attendees" value={meeting.attendees.join(", ")} />
                        )}
                        {meeting.isOnlineMeeting && (
                            <Row label="Online" value="Teams meeting will be created" />
                        )}
                    </div>
                </div>

                <div className="flex gap-3 border-t border-slate-100 px-6 py-4">
                    <button
                        onClick={onCancel}
                        disabled={isScheduling}
                        className="flex-1 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isScheduling}
                        className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-60 flex items-center justify-center gap-2"
                    >
                        {isScheduling ? (
                            <>
                                <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                                </svg>
                                Scheduling…
                            </>
                        ) : "Yes, Schedule"}
                    </button>
                </div>
            </div>
        </div>
    );
}

function Row({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex gap-2 text-sm">
            <span className="font-medium text-slate-500 w-20 shrink-0">{label}:</span>
            <span className="text-slate-800">{value}</span>
        </div>
    );
}

/* ─── Main component ─── */
export const OutlookMeetingPreBody = ({ integrationKey, responseType }: { integrationKey: string; responseType: string }) => {

    const { show } = useContext(ShowNotesBodyContext);
    const { OpenAISolutionsMap, setOpenAISolutionsMap } = useContext(OpenAIActionSolutionsMapContext);

    const [showConfirm, setShowConfirm] = useState(false);
    const [isScheduling, setIsScheduling] = useState(false);
    const [result, setResult] = useState<{
        ok: boolean;
        message: string;
        webLink?: string;
        teamsUrl?: string;
    } | null>(null);

    const [newAttendeeInput, setNewAttendeeInput] = useState("");
    const [attendeeEditMode, setAttendeeEditMode] = useState(false);

    // Henter data selv fra context — ingen meeting prop nødvendig
     const responses = OpenAISolutionsMap.get(integrationKey) ?? [];
    const match = responses.find(r => r.type === responseType);
    if (!match || match.type !== "outlook_meeting") return null;

    const content: OutlookMeeting = match.content
    const patch = (partial: Partial<OutlookMeeting>) => {
        setOpenAISolutionsMap(integrationKey, {
            type: "outlook_meeting",
            content: { ...content, ...partial },
        });
    };

    const addAttendee = () => {
        const email = newAttendeeInput.trim();
        if (!email || content.attendees.includes(email)) return;
        patch({ attendees: [...content.attendees, email] });
        setNewAttendeeInput("");
    };

    const removeAttendee = (email: string) => {
        patch({ attendees: content.attendees.filter((a) => a !== email) });
    };

    const handleScheduleConfirmed = async () => {
        setIsScheduling(true);
        setResult(null);
        try {
            const res = await fetch("/api/integrations/Outlook/ScheduleMeeting", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(content),
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
                setResult({ ok: false, message: data?.error ?? `Failed (${res.status})` });
            } else {
                setResult({
                    ok: true,
                    message: "Meeting scheduled successfully!",
                    webLink: data.webLink,
                    teamsUrl: data.onlineMeetingUrl,
                });
            }
        } catch (err) {
            setResult({ ok: false, message: err instanceof Error ? err.message : "Unknown error" });
        } finally {
            setIsScheduling(false);
            setShowConfirm(false);
        }
    };

    if (show) return <NotesBody />;

    return (
        <>
            <div className="w-full h-[65vh] flex flex-col rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">

                {/* ── Header ── */}
                <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-6 py-4">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600">
                            <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-slate-900">Meeting Proposal</h2>
                            <p className="text-xs text-slate-500">Review and schedule in Outlook Calendar</p>
                        </div>
                    </div>
                    <button
                        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:opacity-60"
                        onClick={() => setShowConfirm(true)}
                        disabled={isScheduling}
                    >
                        Schedule via Outlook
                    </button>
                </div>

                {/* ── Result banner ── */}
                {result && (
                    <div className={`px-6 py-3 text-sm font-medium flex items-center gap-2 ${result.ok ? "bg-green-50 text-green-700 border-b border-green-100" : "bg-red-50 text-red-700 border-b border-red-100"}`}>
                        <span>{result.ok ? "✓" : "✕"}</span>
                        <span>{result.message}</span>
                        {result.ok && result.webLink && (
                            <a href={result.webLink} target="_blank" rel="noopener noreferrer" className="ml-2 underline text-blue-600">
                                Open in Outlook
                            </a>
                        )}
                        {result.ok && result.teamsUrl && (
                            <a href={result.teamsUrl} target="_blank" rel="noopener noreferrer" className="ml-2 underline text-blue-600">
                                Join Teams link
                            </a>
                        )}
                        <button onClick={() => setResult(null)} className="ml-auto text-xs underline opacity-60 hover:opacity-100">
                            Dismiss
                        </button>
                    </div>
                )}

                {/* ── Body ── */}
                <div className="flex-1 overflow-y-auto p-6">
                    <div className="space-y-5">

                        {/* Title */}
                        <div>
                            <label className="mb-1.5 block text-sm font-semibold text-slate-700">Meeting Title</label>
                            <input
                                type="text"
                                value={content.title}
                                onChange={(e) => patch({ title: e.target.value })}
                                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 shadow-sm outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                            />
                        </div>

                        {/* Date + time row */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="mb-1.5 block text-sm font-semibold text-slate-700">Start</label>
                                <input
                                    type="datetime-local"
                                    value={toLocalDateTimeValue(content.startDateTime)}
                                    onChange={(e) => patch({ startDateTime: fromLocalDateTimeValue(e.target.value) })}
                                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                                />
                            </div>
                            <div>
                                <label className="mb-1.5 block text-sm font-semibold text-slate-700">End</label>
                                <input
                                    type="datetime-local"
                                    value={toLocalDateTimeValue(content.endDateTime)}
                                    onChange={(e) => patch({ endDateTime: fromLocalDateTimeValue(e.target.value) })}
                                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                                />
                            </div>
                        </div>

                        {/* Duration hint */}
                        {content.startDateTime && content.endDateTime && (
                            <p className="text-xs text-slate-400 -mt-2">
                                Duration: {durationMinutes(content.startDateTime, content.endDateTime)}
                            </p>
                        )}

                        {/* Location */}
                        <div>
                            <label className="mb-1.5 block text-sm font-semibold text-slate-700">Location <span className="text-slate-400 font-normal">(optional)</span></label>
                            <input
                                type="text"
                                value={content.location ?? ""}
                                onChange={(e) => patch({ location: e.target.value })}
                                placeholder="e.g. Conference Room B or leave blank"
                                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 shadow-sm outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                            />
                        </div>

                        {/* Online meeting toggle */}
                        <Toggle
                            checked={content.isOnlineMeeting}
                            onChange={(v) => patch({ isOnlineMeeting: v })}
                            label="Add Teams meeting link"
                        />

                        {/* Attendees */}
                        <div>
                            <label className="mb-2 block text-sm font-semibold text-slate-700">Attendees</label>
                            <div className="flex flex-wrap gap-2 mb-3">
                                {content.attendees.map((email) => (
                                    <AttendeePill key={email} email={email} onRemove={() => removeAttendee(email)} />
                                ))}
                                {content.attendees.length === 0 && (
                                    <p className="text-xs text-slate-400">No attendees added yet.</p>
                                )}
                            </div>
                            <div className="flex items-center gap-2">
                                <input
                                    type="email"
                                    value={newAttendeeInput}
                                    onChange={(e) => setNewAttendeeInput(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && addAttendee()}
                                    placeholder="Add attendee email…"
                                    className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                                />
                                <button
                                    onClick={addAttendee}
                                    className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-700"
                                >
                                    Add
                                </button>
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <label className="mb-1.5 block text-sm font-semibold text-slate-700">Agenda / Description</label>
                            <textarea
                                value={content.description}
                                onChange={(e) => patch({ description: e.target.value })}
                                rows={5}
                                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100 resize-none"
                            />
                        </div>
                    </div>
                </div>

                {/* ── Footer ── */}
                <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-6 py-4">
                    <p className="text-xs text-slate-400">
                        Changes are saved automatically to the proposal
                    </p>
                    <button className="rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-600 shadow-sm transition hover:bg-red-50">
                        Discard
                    </button>
                </div>
            </div>

            {/* Confirm modal */}
            {showConfirm && (
                <ScheduleConfirmModal
                    meeting={content}
                    onConfirm={handleScheduleConfirmed}
                    onCancel={() => setShowConfirm(false)}
                    isScheduling={isScheduling}
                />
            )}
        </>
    );
};