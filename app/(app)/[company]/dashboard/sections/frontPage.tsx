import { Dispatch, useContext, useEffect, useRef } from "react";
import { ActionKey, IntegrationOptions, IntegrationOptionsTitle } from "./ConfigurationPage";
import { LoadingContext } from "@/app/Contexts";

interface FrontPageProps {
    company: string;
    setCurrentPage: (page: "frontpage" | "configurations" | "actions") => void;
    setSelectedActions: Dispatch<React.SetStateAction<Action[]>>;
    selectedActions: Action[];
    actions: Action[];
    notes: string;
    setNotes: Dispatch<React.SetStateAction<string>>;
    onGoToActionsPageClick: () => void;

}

export type IntegrationTypes = "azure_devops" | "ClickUp" | "jira" | "outlook";
export interface Action {
    key: ActionKey;
    title: string;
    description: string;
    createText: string;
    /**
     * Only used when key === "integrations"
     */
    // IntegrationType?: IntegrationTypes;
    integration?: IntegrationOptionsTitle;
}

export const FrontPage: React.FC<FrontPageProps> = ({ company, setCurrentPage, setSelectedActions, selectedActions, actions, notes, setNotes, onGoToActionsPageClick }) => {
    const { setIsLoading } = useContext(LoadingContext);
    const actionsRef = useRef<HTMLDivElement>(null);
   

    const SaveNote = async () => {
        try {
            const response = await fetch("/api/notes", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text: notes, company:company }),
            });

            if(response.ok){
                console.log("note er gemt");
            }
        } catch (error) {
            console.log("Error during note saving: " + error);
        }
    }
    return (
        <main className="min-h-screen bg-slate-50">
            {/* Top bar */}

            {/* Floating left actions */}
            <div className="pointer-events-none fixed left-6 top-24 z-40 hidden md:block">
                <div className="pointer-events-auto flex flex-col gap-3">
                    {/* Record */}
                    <button
                        type="button"
                        aria-label="Start recording"
                        className="group inline-flex h-12 w-12 items-center justify-center rounded-full border border-slate-200 bg-white shadow-sm transition hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-blue-100"
                    >
                        {/* Microphone icon (inline SVG) */}
                        <svg
                            className="h-5 w-5 text-blue-900 transition group-hover:scale-105"
                            viewBox="0 0 24 24"
                            fill="none"
                            aria-hidden="true"
                        >
                            <path
                                d="M12 14a3 3 0 0 0 3-3V6a3 3 0 0 0-6 0v5a3 3 0 0 0 3 3Z"
                                stroke="currentColor"
                                strokeWidth="1.8"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                            <path
                                d="M19 11a7 7 0 0 1-14 0"
                                stroke="currentColor"
                                strokeWidth="1.8"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                            <path
                                d="M12 18v3"
                                stroke="currentColor"
                                strokeWidth="1.8"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                            <path
                                d="M8 21h8"
                                stroke="currentColor"
                                strokeWidth="1.8"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                    </button>
                    {/* Photo */}
                    <button
                        type="button"
                        aria-label="Add photo"
                        className="group inline-flex h-12 w-12 items-center justify-center rounded-full border border-slate-200 bg-white shadow-sm transition hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-blue-100"
                    >
                        {/* Camera icon (inline SVG) */}
                        <svg
                            className="h-5 w-5 text-blue-900 transition group-hover:scale-105"
                            viewBox="0 0 24 24"
                            fill="none"
                            aria-hidden="true"
                        >
                            <path
                                d="M20 7h-3l-2-2H9L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2Z"
                                stroke="currentColor"
                                strokeWidth="1.8"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                            <path
                                d="M12 18a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z"
                                stroke="currentColor"
                                strokeWidth="1.8"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                    </button>
                    {/* Tiny label rail */}
                    <div className="mt-1 text-center text-[11px] text-slate-500">
                        Actions
                    </div>
                </div>
            </div>
            {/* Content */}
            <div className="mx-auto w-full max-w-7xl 2xl:max-w-[1600px] px-4 sm:px-6 lg:px-8 py-8">
                {/* Page heading */}
                <div className="mb-6">
                    <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
                        Notes
                    </h1>
                    <p className="mt-1 text-sm text-slate-600">
                        Capture meeting notes, ideas, and attachments for{" "}
                        <span className="font-medium text-slate-800">{company}</span>.
                    </p>
                </div>
                {/* Layout: center note area, optional right rail */}
                <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
                    {/* Big note area */}
                    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
                            <div className="flex items-center gap-2">
                                <span className="inline-flex h-2 w-2 rounded-full bg-blue-900" />
                                <p className="text-sm font-semibold text-slate-900">
                                    New note
                                </p>
                            </div>

                            <div className="flex items-center gap-2">
                                {/* <button
                                    type="button"
                                    className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-blue-100"
                                >
                                    Clear
                                </button> */}
                                <button
                                    type="button"
                                    className="rounded-lg bg-blue-900 px-3 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-200"
                                    onClick={() => SaveNote()}
                                >
                                    Save
                                </button>
                            </div>
                        </div>

                        <div className="p-5">
                            <div className="rounded-2xl border border-slate-200 bg-slate-50/40 p-4">
                                {/* Big textarea */}
                                <textarea
                                    placeholder="Start typing… (Meeting notes, tasks, decisions, etc.)"
                                    className="min-h-105 w-full resize-y rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none placeholder:text-slate-400 focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                />
                                {/* Bottom helper row */}
                                <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
                                    <div className="flex items-center gap-2">
                                        <span className="rounded-full bg-white px-2 py-1 shadow-sm ring-1 ring-slate-200">
                                            Tip: use <span className="font-medium">#</span> for tags
                                        </span>
                                        <span className="rounded-full bg-white px-2 py-1 shadow-sm ring-1 ring-slate-200">
                                            <span className="font-medium">Ctrl</span> +{" "}
                                            <span className="font-medium">Enter</span> to save
                                        </span>
                                    </div>
                                    <div className="text-slate-500">Autosave: Off</div>
                                </div>
                            </div>
                        </div>
                    </section>
                    {/* Right rail (optional quick info / actions) */}
                    <aside className="space-y-4">
                        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                            <p className="text-xs font-medium text-slate-500">Workspace</p>
                            <p className="mt-2 text-base font-semibold text-slate-900">
                                {company}
                            </p>
                            <p className="mt-1 text-sm text-slate-600">
                                Keep notes organized per company.
                            </p>
                        </div>

                        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                            <p className="text-xs font-medium text-slate-500">Shortcuts</p>
                            <ul className="mt-3 space-y-2 text-sm text-slate-700">
                                <li className="flex items-center justify-between">
                                    <span>Save note</span>
                                    <span className="rounded-md bg-slate-50 px-2 py-1 text-xs text-slate-600 ring-1 ring-slate-200">
                                        Ctrl + Enter
                                    </span>
                                </li>
                                <li className="flex items-center justify-between">
                                    <span>Search</span>
                                    <span className="rounded-md bg-slate-50 px-2 py-1 text-xs text-slate-600 ring-1 ring-slate-200">
                                        Ctrl + K
                                    </span>
                                </li>
                            </ul>
                        </div>
                        <div >
                            {notes.length > 0 && (
                                <button type="button" className="inline-flex w-full items-center justify-center rounded-xl bg-blue-900 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-200"
                                    onClick={() => {

                                        window.gtag?.('event', 'select_actions_click', {
                                            button_text: 'Select actions!',
                                        });

                                        actionsRef.current?.scrollIntoView({ behavior: 'smooth' });
                                    }}
                                >
                                    Select actions!
                                </button>
                            )}
                        </div>
                    </aside>
                </div>
                {/*Actions section*/}
                {notes.length > 0 && (
                    <>
                        <div ref={actionsRef} className="mt-16 flex flex-col">

                            <div className="mb-4 grid grid-cols-3 items-end">
                                {/* Left spacer */}
                                <div />

                                {/* Center title */}
                                <h3 className="text-center text-lg font-semibold text-slate-900">
                                    Select actions:
                                </h3>

                                {/* Right text */}
                                <div className="text-right">
                                    <p className="mb-1 text-sm text-slate-500">
                                        Not what you were looking for?
                                    </p>
                                    <p className="text-xs font-medium text-slate-500">
                                        Find your actions in the{" "}
                                        <span
                                            onClick={() => {
                                                window.scrollTo({ top: 0, behavior: "instant" });
                                                setCurrentPage("configurations")
                                            }}
                                            className="cursor-pointer underline hover:text-slate-700"
                                        >
                                            configuration page
                                        </span>
                                        .
                                    </p>
                                </div>
                            </div>
                            <section className="mt-2 grid w-full grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                                {actions.map((action, index) => (
                                    <div key={index} onClick={() => {
                                        const isSelected = selectedActions.some(a => a.title === action.title && a.integration === action.integration && a.key === action.key);
                                        if (isSelected) {
                                            // Remove from selected actions
                                            setSelectedActions(prev => prev.filter(a => a.title !== action.title || a.integration !== action.integration || a.key !== action.key));
                                        } else {
                                            // Add to selected actions
                                            setSelectedActions(prev => [...prev, action]);
                                        }

                                    }} className={` mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-lg transition-shadow cursor-pointer ${selectedActions.includes(action) ? 'ring-2 ring-blue-500' : ''}`}>
                                        <h2 className="text-lg font-semibold text-slate-900">{action.title}</h2>
                                        <p className="mt-2 text-sm text-slate-700">{action.description}</p>
                                    </div>
                                ))}
                            </section>

                        </div>

                        <div>
                            {selectedActions.length > 0 && (
                                <button onClick={() => {
                                    onGoToActionsPageClick();

                                }} className="inline-flex w-full items-center justify-center rounded-xl bg-blue-900 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-200 cursor-pointer">
                                    Go to actions page
                                </button>
                            )}
                        </div>
                    </>
                )}

                {/* Spacer so you can see floating buttons while scrolling */}
                <div className="h-24" />
            </div>
        </main>
    )
};