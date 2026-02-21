"use client";

import { signOut } from "next-auth/react";
import { ActionKey, ConfigState, IntegrationOptions } from "../ConfigurationPage";

/* ───────────────── Types ───────────────── */

interface GeneralConfigProps {
    value: ConfigState;
    setActionEnabled: (key: ActionKey, enabled: boolean) => void;
    toggleProvider: (provider: IntegrationOptions) => void;
    providers: IntegrationOptions[];
    connectedSet: Set<string>;  // add this
}

/* ───────────────── Component ───────────────── */

export function GeneralConfig({ value, setActionEnabled, toggleProvider, providers, connectedSet }: GeneralConfigProps) {
    return (
        <div className="space-y-5">
            {/* Integrations section */}
            <section className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                <div className="flex items-center justify-between gap-4 px-6 py-5 border-b border-slate-100">
                    <div>
                        <h2 className="text-sm font-semibold text-slate-900">Integrations</h2>
                        <p className="mt-0.5 text-xs text-slate-500">Allow users to push notes into external tools.</p>
                    </div>
                    <Toggle
                        checked={value.enabledActions.integrations}
                        onChange={(v) => setActionEnabled("integrations", v)}
                    />
                </div>

                <div className="px-6 py-5">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">
                        Providers
                    </p>
                    <div
                        className={[
                            "grid gap-2 sm:grid-cols-2 transition-opacity",
                            value.enabledActions.integrations ? "opacity-100" : "opacity-40 pointer-events-none",
                        ].join(" ")}
                    >
                        {providers.filter(p => connectedSet.has(p.title)).map((provider) => {
                            const active = value.enabledProviders.includes(provider.title);
                            return (
                                <button
                                    key={provider.title}
                                    type="button"
                                    onClick={() => {
                                        if (!value.enabledActions.integrations) return;
                                        toggleProvider(provider);
                                    }}
                                    className={[
                                        "flex items-center justify-between rounded-lg border px-4 py-3 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#1E3A5F] focus:ring-offset-1",
                                        active
                                            ? "border-[#1E3A5F] bg-[#1E3A5F] text-white shadow-sm"
                                            : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 shadow-sm",
                                    ].join(" ")}
                                >
                                    <span className="font-medium text-xs">{provider.title}</span>
                                    <span
                                        className={[
                                            "rounded-full px-2 py-0.5 text-[10px] font-semibold",
                                            active ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500",
                                        ].join(" ")}
                                    >
                                        {active ? "Enabled" : "Off"}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Actions section */}
            <section className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                <div className="px-6 py-5 border-b border-slate-100">
                    <h2 className="text-sm font-semibold text-slate-900">Actions</h2>
                    <p className="mt-0.5 text-xs text-slate-500">Enable the tools users can select from.</p>
                </div>

                <div className="divide-y divide-slate-100">
                    <Row
                        title="Create Outlook draft email"
                        desc="Generate a structured email draft from notes."
                        checked={value.enabledActions.email_outlook_draft}
                        onChange={(v) => setActionEnabled("email_outlook_draft", v)}
                    />
                    <Row
                        title="Schedule Outlook meeting"
                        desc="Create a scheduled meeting in Outlook."
                        checked={value.enabledActions.schedule_outlook_meeting}
                        onChange={(v) => setActionEnabled("schedule_outlook_meeting", v)}
                    />
                </div>
            </section>
            <section className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                <div className="px-6 py-5 border-b border-slate-100">
                    <h2 className="text-sm font-semibold text-slate-900">Account</h2>
                    <p className="mt-0.5 text-xs text-slate-500">Manage your account settings.</p>
                </div>
                <div className="px-6 py-4 flex-col">
                    <button
                        type="button"
                        className="flex justify-self-end rounded-lg border border-red-200 bg-white px-4 py-2 text-xs font-semibold text-red-600 shadow-sm transition hover:bg-red-50 hover:border-red-300 focus:outline-none focus:ring-2 focus:ring-red-300 focus:ring-offset-1"
                        onClick={() => signOut()}
                    >
                        Log out
                    </button>
                </div>
            </section>
        </div>
    );
}

/* ───────────────── Shared primitives ───────────────── */

function Row({ title, desc, checked, onChange }: { title: string; desc: string; checked: boolean; onChange: (v: boolean) => void }) {
    return (
        <div className="flex items-center justify-between gap-4 px-6 py-4">
            <div>
                <p className="text-sm font-medium text-slate-900">{title}</p>
                <p className="mt-0.5 text-xs text-slate-500">{desc}</p>
            </div>
            <Toggle checked={checked} onChange={onChange} />
        </div>
    );
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
    return (
        <button
            type="button"
            role="switch"
            aria-checked={checked}
            onClick={() => onChange(!checked)}
            className={[
                "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#1E3A5F] focus:ring-offset-2",
                checked ? "bg-[#1E3A5F]" : "bg-slate-200",
            ].join(" ")}
        >
            <span
                className={[
                    "inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform",
                    checked ? "translate-x-6" : "translate-x-1",
                ].join(" ")}
            />
        </button>
    );
}