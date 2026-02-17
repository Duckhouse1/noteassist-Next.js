"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { IntegrationConnection } from "../dashboardClient";

/* ───────────────── Types ───────────────── */
export interface IntegrationOptions {
  title: IntegrationOptionsTitle;
  connectionString: string;
}
export type IntegrationOptionsTitle =
  | "Azure DevOps"
  // | "ClickUp"
  // | "SharePoint"
  // | "Jira"
  | "Outlook"
// | "Notion";

export type ActionKey =
  | "integrations"
  | "email_outlook_draft"
  | "schedule_outlook_meeting"
// | "meeting_summary"
// | "task_list"
// | "attach_photo";

export type ConfigState = {
  enabledActions: Record<ActionKey, boolean>;
  enabledProviders: IntegrationOptionsTitle[]; // ✅ store ids
};

/* ───────────────── Defaults ───────────────── */

export const DEFAULT_CONFIG: ConfigState = {
  enabledActions: {
    integrations: true,
    email_outlook_draft: true,
    schedule_outlook_meeting: false,
    // meeting_summary: true,
    // task_list: true,
    // attach_photo: false,
  },
  enabledProviders: ["Azure DevOps", "Outlook"],
};

/* ───────────────── Utils ───────────────── */

function toggleInArray<T>(arr: T[], item: T) {
  return arr.includes(item) ? arr.filter((x) => x !== item) : [...arr, item];
}

 
/* ───────────────── Component ───────────────── */

export function ConfigurationPage({ value, onChange, onSave, company, connections }: { value: ConfigState; onChange: (next: ConfigState) => void; onSave?: (config: ConfigState) => void; company: string, connections: IntegrationConnection[] }) {
  const [saved, setSaved] = useState(false);
  // const [activeConfigSetting, setActiveConfigSetting] = useState<IntegrationOptions>("Azure DevOps")
  const providers: IntegrationOptions[] = useMemo(
    () => [
      { title: "Azure DevOps", connectionString: "/api/integrations/azure-devops/connect" },
      // { title: "Jira", connectionString: "" },
      { title: "Outlook", connectionString: "/api/integrations/microsoft-graph/connect" },
      // { title: "ClickUp", connectionString: "/api/integrations/clickup/connect" },
    ],
    []
  );
  const connectedSet = useMemo(
    () => new Set(connections.map((c) => c.provider)),
    [connections]
  );

  const connectHref = (p: IntegrationOptions) => {
    const returnTo = `/${company}/dashboard`;
    return `${p.connectionString}?returnTo=${encodeURIComponent(returnTo)}&provider=${encodeURIComponent(p.title)}`;
  };
  const [connectedIntegrations, setConnectedIntegrations] = useState<IntegrationConnection[]>(connections)
  function setActionEnabled(key: ActionKey, enabled: boolean) {
    setSaved(false);
    onChange({
      ...value,
      enabledActions: {
        ...value.enabledActions,
        [key]: enabled,
      },
    });
  }

  function toggleProvider(provider: IntegrationOptions) {
    setSaved(false);
    onChange({
      ...value,
      enabledProviders: toggleInArray(value.enabledProviders, provider.title),
    });
  }

  function handleSave() {
    onSave?.(value);
    setSaved(true);
  }

  function reset() {
    setSaved(false);
    onChange(DEFAULT_CONFIG);
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Configuration
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Choose what actions users can select on the front page.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={reset}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-blue-100"
          >
            Reset
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="rounded-xl bg-blue-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-200"
          >
            Save changes
          </button>
        </div>
      </div>

      {saved && (
        <div className="mb-6 rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-900">
          Saved.
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        {/* Left */}
        <div className="space-y-6">
          {/* Integrations */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-sm font-semibold text-slate-900">
                  Integrations
                </h2>
                <p className="mt-1 text-sm text-slate-600">
                  Allow users to push notes into external tools.
                </p>
              </div>

              <Toggle
                checked={value.enabledActions.integrations}
                onChange={(v) => setActionEnabled("integrations", v)}
              />
            </div>

            {/* Providers */}
            <div className="mt-4">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Providers
              </p>
              <div
                className={[
                  "mt-3 grid gap-2 sm:grid-cols-2",
                  value.enabledActions.integrations ? "" : "opacity-50",
                ].join(" ")}
              >
                {providers.map((provider) => {
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
                        "flex items-center justify-between rounded-xl border px-3 py-2 text-sm shadow-sm transition",
                        active
                          ? "border-blue-200 bg-blue-50 text-blue-900"
                          : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
                      ].join(" ")}
                    >
                      <span className="font-medium">{provider.title}</span>
                      <span
                        className={[
                          "rounded-full px-2 py-0.5 text-xs font-medium",
                          active
                            ? "bg-blue-100 text-blue-900"
                            : "bg-slate-100 text-slate-600",
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

          {/* Actions */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-900">Actions</h2>
            <p className="mt-1 text-sm text-slate-600">
              Enable the tools users can select from.
            </p>

            <div className="mt-4 divide-y divide-slate-200">
              <Row
                title="Create Outlook draft email"
                desc="Generate a structured email draft from notes."
                checked={value.enabledActions.email_outlook_draft}
                onChange={(v) =>
                  setActionEnabled("email_outlook_draft", v)
                }
              />
              <Row
                title="Schedule Outlook meeting"
                desc="Create a scheduled meeting in Outlook."
                checked={value.enabledActions.schedule_outlook_meeting}
                onChange={(v) =>
                  setActionEnabled("schedule_outlook_meeting", v)
                }
              />
              {/* <Row
                title="Meeting summary"
                desc="Summarize key points and decisions."
                checked={value.enabledActions.meeting_summary}
                onChange={(v) =>
                  setActionEnabled("meeting_summary", v)
                }
              />
              <Row
                title="Task list"
                desc="Extract tasks, owners, and due dates."
                checked={value.enabledActions.task_list}
                onChange={(v) => setActionEnabled("task_list", v)}
              />
              <Row
                title="Attach photo"
                desc="Allow photo attachments as input."
                checked={value.enabledActions.attach_photo}
                onChange={(v) =>
                  setActionEnabled("attach_photo", v)
                }
              /> */}
            </div>
          </section>
        </div>

        {/* Right */}
        <aside className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-medium text-slate-500">Summary</p>
            <p className="mt-2 text-sm text-slate-700">
              Enabled actions:
              <span className="ml-2 font-semibold text-slate-900">
                {Object.values(value.enabledActions).filter(Boolean).length}
              </span>
            </p>

            <div className="mt-4">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Enabled providers
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {(value.enabledActions.integrations
                  ? value.enabledProviders
                  : []
                ).map((p) => (
                  <span
                    key={p}
                    className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-700"
                  >
                    {p}
                  </span>
                ))}

                {value.enabledActions.integrations &&
                  value.enabledProviders.length === 0 && (
                    <span className="text-xs text-slate-500">
                      No providers selected.
                    </span>
                  )}

                {!value.enabledActions.integrations && (
                  <span className="text-xs text-slate-500">
                    Integrations disabled.
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-medium text-slate-500">Connections</p>
            <p className="mt-1 text-sm text-slate-600">
              Connect your workspace to external tools.
            </p>

            <div className="mt-4 flex flex-col gap-3">
              {providers.map((p) => {
                const isConnected = connectedSet.has(p.title);

                return (
                  <div
                    key={p.title}
                    className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={[
                          "h-2.5 w-2.5 rounded-full",
                          isConnected ? "bg-green-500" : "bg-slate-300",
                        ].join(" ")}
                      />

                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-slate-800">
                          {p.title}
                        </span>
                        <span className="text-xs text-slate-500">
                          {isConnected ? "Ready to use" : "Not connected"}
                        </span>
                      </div>
                    </div>

                    {isConnected ? (
                      <span className="text-xs font-medium text-green-600">
                        Connected
                      </span>
                    ) : (
                      <Link
                        href={connectHref(p)}
                        className="rounded-lg bg-blue-900 px-3 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-200"
                      >
                        Connect
                      </Link>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

/* ───────────────── Small components ───────────────── */

function Row({
  title,
  desc,
  checked,
  onChange,
}: {
  title: string;
  desc: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-4">
      <div>
        <p className="text-sm font-medium text-slate-900">{title}</p>
        <p className="mt-1 text-sm text-slate-600">{desc}</p>
      </div>
      <Toggle checked={checked} onChange={onChange} />
    </div>
  );
}

function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={[
        "relative inline-flex h-7 w-12 items-center rounded-full transition focus:outline-none focus:ring-4",
        checked
          ? "bg-blue-900 focus:ring-blue-200"
          : "bg-slate-200 focus:ring-blue-100",
      ].join(" ")}
    >
      <span
        className={[
          "inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition",
          checked ? "translate-x-6" : "translate-x-1",
        ].join(" ")}
      />
    </button>
  );
}
