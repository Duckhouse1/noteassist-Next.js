"use client";

import { IntegrationConnection } from "../../dashboardClient";

/* ───────────────── Types ───────────────── */

export type AzureDevopsSettings = {
  organization: string;
  project: string;
  defaultWorkItemType: "Task" | "Bug" | "User Story" | "Epic";
  autoLinkCommits: boolean;
  syncComments: boolean;
  notifyOnStatusChange: boolean;
};

export const DEFAULT_AZURE_DEVOPS_SETTINGS: AzureDevopsSettings = {
  organization: "",
  project: "",
  defaultWorkItemType: "Task",
  autoLinkCommits: true,
  syncComments: false,
  notifyOnStatusChange: true,
};

interface AzureDevopsConfigProps {
  connection: IntegrationConnection;
  settings: AzureDevopsSettings;
  onChange: (next: AzureDevopsSettings) => void;
}

/* ───────────────── Component ───────────────── */

export function AzureDevopsConfig({ connection, settings, onChange }: AzureDevopsConfigProps) {
  function update(patch: Partial<AzureDevopsSettings>) {
    onChange({ ...settings, ...patch });
  }

  return (
    <div className="space-y-5">
      {/* Connection info banner */}
      {/* <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50/50 px-5 py-3">
        <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0" />
        <div>
          <p className="text-xs font-semibold text-slate-800">{connection.displayName}</p>
          <p className="text-[10px] text-slate-500 mt-0.5">Connected · Azure DevOps</p>
        </div>
      </div> */}

      {/* Connection settings */}
      <section className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100">
          <h2 className="text-sm font-semibold text-slate-900">Connection</h2>
          <p className="mt-0.5 text-xs text-slate-500">Target organisation and project for work-item creation.</p>
        </div>
        <div className="px-6 py-5 space-y-5">
          <FieldRow label="Organisation" hint="Your Azure DevOps organisation name or URL.">
            <TextInput
              value={settings.organization}
              onChange={(v) => update({ organization: v })}
              placeholder="e.g. my-org"
            />
          </FieldRow>
          <FieldRow label="Project" hint="Default project where work items will be created.">
            <TextInput
              value={settings.project}
              onChange={(v) => update({ project: v })}
              placeholder="e.g. Backend Services"
            />
          </FieldRow>
          <FieldRow label="Default work-item type" hint="Type assigned to new items when not specified.">
            <SelectInput
              value={settings.defaultWorkItemType}
              onChange={(v) => update({ defaultWorkItemType: v as AzureDevopsSettings["defaultWorkItemType"] })}
              options={[
                { label: "Task", value: "Task" },
                { label: "Bug", value: "Bug" },
                { label: "User Story", value: "User Story" },
                { label: "Epic", value: "Epic" },
              ]}
            />
          </FieldRow>
        </div>
      </section>

      {/* Behaviour settings */}
      <section className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100">
          <h2 className="text-sm font-semibold text-slate-900">Behaviour</h2>
          <p className="mt-0.5 text-xs text-slate-500">Control how the integration interacts with your repository.</p>
        </div>
        <div className="divide-y divide-slate-100">
          <Row
            title="Auto-link commits"
            desc="Automatically link commits to related work items."
            checked={settings.autoLinkCommits}
            onChange={(v) => update({ autoLinkCommits: v })}
          />
          <Row
            title="Sync comments"
            desc="Mirror work-item comments back into the platform."
            checked={settings.syncComments}
            onChange={(v) => update({ syncComments: v })}
          />
          <Row
            title="Notify on status change"
            desc="Send a notification when a work item status changes."
            checked={settings.notifyOnStatusChange}
            onChange={(v) => update({ notifyOnStatusChange: v })}
          />
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

function FieldRow({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-1.5 sm:grid-cols-[180px_1fr] sm:items-start">
      <div className="pt-2">
        <p className="text-xs font-semibold text-slate-700">{label}</p>
        {hint && <p className="mt-0.5 text-[11px] text-slate-400 leading-snug">{hint}</p>}
      </div>
      <div>{children}</div>
    </div>
  );
}

function TextInput({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 shadow-sm transition focus:border-[#1E3A5F] focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/20"
    />
  );
}

function SelectInput({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: { label: string; value: string }[] }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 shadow-sm transition focus:border-[#1E3A5F] focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/20 appearance-none cursor-pointer"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
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