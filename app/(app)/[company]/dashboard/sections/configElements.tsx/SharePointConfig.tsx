"use client";

import { IntegrationConnection } from "../../dashboardClient";

/* ───────────────── Types ───────────────── */

export type SharePointSettings = {
  siteUrl: string;
  defaultLibrary: string;
  autoUploadNotes: boolean;
  versioningEnabled: boolean;
  checkOutRequired: boolean;
  folderStructure: "flat" | "by-date" | "by-project";
};

export const DEFAULT_SHAREPOINT_SETTINGS: SharePointSettings = {
  siteUrl: "",
  defaultLibrary: "Documents",
  autoUploadNotes: false,
  versioningEnabled: true,
  checkOutRequired: false,
  folderStructure: "by-project",
};

interface SharePointConfigProps {
  connection: IntegrationConnection;
  settings: SharePointSettings;
  onChange: (next: SharePointSettings) => void;
}

/* ───────────────── Component ───────────────── */

export function SharePointConfig({ connection, settings, onChange }: SharePointConfigProps) {
  function update(patch: Partial<SharePointSettings>) {
    onChange({ ...settings, ...patch });
  }

  return (
    <div className="space-y-5">
      {/* Connection info banner */}
      {/* <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50/50 px-5 py-3">
        <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0" />
        <div>
          <p className="text-xs font-semibold text-slate-800">{connection.displayName}</p>
          <p className="text-[10px] text-slate-500 mt-0.5">Connected · SharePoint</p>
        </div>
      </div> */}

      {/* Connection settings */}
      <section className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100">
          <h2 className="text-sm font-semibold text-slate-900">Connection</h2>
          <p className="mt-0.5 text-xs text-slate-500">Target site and library for document storage.</p>
        </div>
        <div className="px-6 py-5 space-y-5">
          <FieldRow label="Site URL" hint="Full URL of your SharePoint site.">
            <TextInput
              value={settings.siteUrl}
              onChange={(v) => update({ siteUrl: v })}
              placeholder="https://company.sharepoint.com/sites/mysite"
            />
          </FieldRow>
          <FieldRow label="Default library" hint="Document library where files will be saved.">
            <TextInput
              value={settings.defaultLibrary}
              onChange={(v) => update({ defaultLibrary: v })}
              placeholder="e.g. Documents"
            />
          </FieldRow>
          <FieldRow label="Folder structure" hint="How uploaded files are organised within the library.">
            <SelectInput
              value={settings.folderStructure}
              onChange={(v) => update({ folderStructure: v as SharePointSettings["folderStructure"] })}
              options={[
                { label: "Flat (no folders)", value: "flat" },
                { label: "Organised by date", value: "by-date" },
                { label: "Organised by project", value: "by-project" },
              ]}
            />
          </FieldRow>
        </div>
      </section>

      {/* Document behaviour */}
      <section className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100">
          <h2 className="text-sm font-semibold text-slate-900">Document Behaviour</h2>
          <p className="mt-0.5 text-xs text-slate-500">Control how documents are managed once uploaded.</p>
        </div>
        <div className="divide-y divide-slate-100">
          <Row
            title="Auto-upload notes"
            desc="Automatically save finalised notes to SharePoint."
            checked={settings.autoUploadNotes}
            onChange={(v) => update({ autoUploadNotes: v })}
          />
          <Row
            title="Versioning"
            desc="Keep a version history for every uploaded document."
            checked={settings.versioningEnabled}
            onChange={(v) => update({ versioningEnabled: v })}
          />
          <Row
            title="Require check-out"
            desc="Users must check out a document before editing."
            checked={settings.checkOutRequired}
            onChange={(v) => update({ checkOutRequired: v })}
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