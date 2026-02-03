"use client";

import { useEffect, useMemo, useState } from "react";
import type { Action } from "./frontPage";
import { CorporateLoader } from "@/app/Components/LoadingIcon";
import { Pages } from "../dashboardClient";
import { ActionsBody } from "../components/ActionsBody";

export default function ActionsPage({ selectedActions, onGoToFrontPage }: { selectedActions: Action[]; onGoToFrontPage: () => void }) {
    const total = selectedActions.length;

    const [currentIndex, setCurrentIndex] = useState(0);
    const [isLoading, setIsLoading] = useState(false);

    // track completion by index (your current approach)
    const [completedActions, setCompletedActions] = useState<number[]>([]);
    const [statusMessage, setStatusMessage] = useState<string | null>(null);

    const currentAction = useMemo(() => {
        return selectedActions[currentIndex];
    }, [selectedActions, currentIndex]);

    // useEffect(() => {
    //     if (completedActions.length === total && total > 0) {
    //         setStatusMessage("All actions completed! 🎉");
    //     }
    // }, [completedActions, total]);
    // If no actions selected
    if (total === 0) {
        return (
            <div className="mx-auto max-w-6xl px-6 py-10">
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <h1 className="text-xl font-semibold text-slate-900">
                        No actions selected
                    </h1>
                    <p className="mt-2 text-sm text-slate-600">
                        Go back and select at least one action to continue.
                    </p>
                </div>
            </div>
        );
    }

    function markCompleted(index: number) {
        setCompletedActions((prev) => (prev.includes(index) ? prev : [...prev, index]));
    }

    // function findNextIncomplete(fromIndex: number) {
    //     for (let i = fromIndex + 1; i < total; i++) {
    //         if (!completedActions.includes(i)) return i;
    //     }
    //     return null;
    // }

    // function findPrevIncomplete(fromIndex: number) {
    //     for (let i = fromIndex - 1; i >= 0; i--) {
    //         if (!completedActions.includes(i)) return i;
    //     }
    //     return null;
    // }

    function goNext() {
        setCurrentIndex((v) => Math.min(total - 1, v + 1));
    }

    function goBack() {
        setCurrentIndex((v) => Math.max(0, v - 1));
    }

    async function runCurrentAction(currentAction: Action) {
        setIsLoading(true);

        setTimeout(() => {
            setIsLoading(false);
            markCompleted(currentIndex);
            goNext();
        }, 2000);
    }


    return (
        <div className="mx-auto max-w-6xl px-6 py-8">
            {/* Top row */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-[1fr_auto_1fr] md:items-start">
                {/* Left: current action */}
                <div className="inline-flex max-w-xs flex-col gap-1 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
                    <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
                        Current action
                    </p>
                    <h2 className="text-sm font-semibold text-slate-900">
                        {currentAction?.title}
                    </h2>
                </div>

                {/* Center: step circles */}
                <div className="flex items-center justify-center">
                    <nav aria-label="Action steps" className="flex items-center gap-2">
                        {selectedActions.map((_, i) => {
                            const isActive = i === currentIndex;
                            const isDone = completedActions.includes(i);

                            return (
                                <div key={i} className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setStatusMessage(null);
                                            setCurrentIndex(i);
                                        }}
                                        className={[
                                            "flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold transition",
                                            isActive
                                                ? "bg-blue-900 text-white shadow-sm ring-4 ring-blue-100"
                                                : isDone
                                                    ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 hover:bg-emerald-100"
                                                    : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50",
                                        ].join(" ")}
                                        aria-current={isActive ? "step" : undefined}
                                        aria-label={isDone ? `Step ${i + 1} completed` : `Step ${i + 1}`}
                                    >
                                        {isDone ? (
                                            // ✅ Checkmark instead of number
                                            <svg
                                                className="h-5 w-5"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                aria-hidden="true"
                                            >
                                                <path
                                                    d="M20 6L9 17l-5-5"
                                                    stroke="currentColor"
                                                    strokeWidth="2"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                />
                                            </svg>
                                        ) : (
                                            i + 1
                                        )}
                                    </button>

                                    {/* Connector */}
                                    {i !== total - 1 && (
                                        <div
                                            className={[
                                                "h-px w-8",
                                                completedActions.includes(i) ? "bg-emerald-200" : "bg-slate-200",
                                            ].join(" ")}
                                            aria-hidden="true"
                                        />
                                    )}
                                </div>
                            );
                        })}
                    </nav>
                </div>

                {/* Right spacer (optional) */}
                <div />
            </div>

            {/* Status message */}
            {statusMessage && (
                <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800 shadow-sm flex justify-center">
                    <span className="inline-flex items-center gap-2">
                        {statusMessage}
                        {statusMessage.includes("All actions completed") && (
                            <button
                                onClick={onGoToFrontPage}
                                className="ml-2 rounded-lg border border-blue-200 bg-blue-100 px-3 py-1 text-blue-800 font-semibold hover:bg-blue-200"
                            >
                                Go to front page
                            </button>

                        )}
                    </span>
                </div>

            )}

            {/* Loader */}
            {isLoading && (
                <CorporateLoader
                    size={220}
                    className="absolute inset-0 z-50 m-auto"
                    title={`Executing: ${currentAction.createText}`}
                />
            )}

            {!isLoading && (
                <>
                    <div className="mt-8 mx-auto w-full max-w-3xl md:max-w-5xl xl:max-w-6xl rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
                        <ActionsBody action={currentAction} />

                    </div>
                    {/* Content
                    <div className="mt-8">
                        <div className="mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
                            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
                                Content body
                            </h1>
                            <p className="mt-2 text-sm text-slate-600">
                                This is where you’ll render the UI for the selected action:
                                <span className="font-medium text-slate-800">
                                    {" "}
                                    {currentAction.title}
                                </span>
                                .
                            </p>

                            <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50/40 p-10 text-center text-sm text-slate-600">
                                Action-specific component goes here.
                            </div>
                            {completedActions.includes(currentIndex) ? (
                                <div className="mt-6 flex justify-end gap-2">

                                    <p className="mt-4 text-sm font-medium text-emerald-700">
                                        This action is completed.
                                    </p>
                                </div>
                            ) : (
                                <div className="mt-6 flex justify-end gap-2">
                                    <button
                                        type="button"
                                        onClick={() => runCurrentAction(currentAction)}
                                        className="rounded-xl bg-blue-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-800"
                                    >
                                        {currentAction.createText}
                                    </button>
                                </div>
                            )}

                        </div>
                    </div> */}

                    {/* Nav buttons */}
                    <div className="flex items-center justify-center gap-2 pt-6">
                        <button
                            type="button"
                            onClick={goBack}
                            disabled={currentIndex === 0}
                            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            Back
                        </button>

                        <button
                            type="button"
                            onClick={goNext}
                            disabled={currentIndex === total - 1}
                            className="rounded-xl bg-blue-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            Next
                        </button>
                    </div>

                </>
            )}
        </div>
    );
}
