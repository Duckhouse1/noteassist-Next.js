"use client";

import { useEffect, useCallback, useState, useContext } from "react";
import { IntegrationConnection } from "../../dashboardClient";
import { WorkItemType } from "@/app/api/integrations/azure-devops/WorkItem/GetWorkItemTypesByProject/route";
import { useSessionStorageState } from "@/app/Components/Hooks/useSessionStorage";
import { connect } from "http2";
import { SaveRequirredContext } from "@/app/Contexts";


/* ───────────────── Types ───────────────── */
type GetWorkItemTypesResponse = {
  types: WorkItemType[];
};
export type AzureDevopsSettings = {
  Defaultorganization: string;
  Defaultproject: string;
  defaultWorkItemTypes: string[];

};

export const DEFAULT_AZURE_DEVOPS_SETTINGS: AzureDevopsSettings = {
  Defaultorganization: "",
  Defaultproject: "",
  defaultWorkItemTypes: ["Task"],

};

interface AzureOrganization {
  accountId: string;
  name: string;
  organizationName: string;
  accountUri?: string;
}

interface AzureProject {
  id: string;
  name: string;
  description?: string;
  state: string;
}

interface AzureDevopsConfigProps {
  ADOconnection: IntegrationConnection;
  company: string;
  // settings: AzureDevopsSettings;
  // onChange: (next: AzureDevopsSettings) => void;
}
type GetADOConfigResponse = {
  defaultOrganization?: string;
  defaultProject?: string;
  defaultWorkItemTypes?: string[]; // ✅ must be array after API conversion
};
/* ───────────────── Component ───────────────── */

export function AzureDevopsConfig({ company, ADOconnection }: AzureDevopsConfigProps) {
  // ── Session-stored async state ──────────────────────────────────────────
  const [showSaveButton, setShowSaveButton] = useState(false)
  const { setRequirred } = useContext(SaveRequirredContext)

  const { value: ADOSettings, setValue: SetADOSettings } = useSessionStorageState<AzureDevopsSettings>({
    key: "ado-settings", initialValue: { Defaultorganization: "", Defaultproject: "", defaultWorkItemTypes: [] },
  })
  const { value: organizations, setValue: setOrganizations } = useSessionStorageState<AzureOrganization[]>({
    key: "ado-organizations",
    initialValue: [],
    version: 1,
  });

  const { value: orgsLoading, setValue: setOrgsLoading } = useSessionStorageState<boolean>({
    key: "ado-organizations-loading",
    initialValue: false,
    version: 1,
  });

  const { value: orgsError, setValue: setOrgsError } = useSessionStorageState<string | null>({
    key: "ado-organizations-error",
    initialValue: null,
    version: 1,
  });

  const { value: projects, setValue: setProjects } = useSessionStorageState<AzureProject[]>({
    key: `ado-projects-${ADOSettings.Defaultorganization}`,
    initialValue: [],
    version: 1,
  });

  const { value: projectsLoading, setValue: setProjectsLoading } = useSessionStorageState<boolean>({
    key: `ado-projects-loading-${ADOSettings.Defaultorganization}`,
    initialValue: false,
    version: 1,
  });

  const { value: projectsError, setValue: setProjectsError } = useSessionStorageState<string | null>({
    key: `ado-projects-error-${ADOSettings.Defaultorganization}`,
    initialValue: null,
    version: 1,
  });

  const { value: WorkItemTypes, setValue: setWorkItemTypes } = useSessionStorageState<WorkItemType[]>({
    key: `ado-wit-${ADOSettings.Defaultorganization}-${ADOSettings.Defaultproject}`,
    initialValue: [],
    version: 1,
  });

  const { value: WITLoading, setValue: setWITLoading } = useSessionStorageState<boolean>({
    key: `ado-wit-loading-${ADOSettings.Defaultorganization}-${ADOSettings.Defaultproject}`,
    initialValue: false,
    version: 1,
  });

  const { value: WITError, setValue: setWITError } = useSessionStorageState<string | null>({
    key: `ado-wit-error-${ADOSettings.Defaultorganization}-${ADOSettings.Defaultproject}`,
    initialValue: null,
    version: 1,
  });

  const SaveChanges = async () => {
    try {
      const response = await fetch(`/api/user/Configurations/azure-devops?connectionId=${ADOconnection.id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ADOSettings
        })
      })
      if (response.ok) {
        setShowSaveButton(false)
        setRequirred(false)

      }
    } catch (error) {
      console.log("Failed to save the new Config: " + error);
    }
  }
  const fetchUserADOConfig = useCallback(async () => {
    // if(ADOSettings)return;
    try {
      const response = await fetch(`/api/user/Configurations/azure-devops?connectionId=${ADOconnection.id}`)

      console.log("Her har vi ADO Config; ");
      const data: GetADOConfigResponse = await response.json();

      SetADOSettings((prev) => ({
        ...prev,
        Defaultorganization: data.defaultOrganization ?? "",
        Defaultproject: data.defaultProject ?? "",
        defaultWorkItemTypes: Array.isArray(data.defaultWorkItemTypes) ? data.defaultWorkItemTypes : [],
      }));
    } catch (error) {
      console.log("Error fetching ur ADO Config: " + error);
    }
  }, [ADOconnection.id, SetADOSettings])

  useEffect(() => {
    fetchUserADOConfig()
  }, [fetchUserADOConfig])
  // ── Fetch organizations on mount ────────────────────────────────────────
  const fetchOrganizations = useCallback(async () => {
    if (organizations.length > 0) return;

    setOrgsLoading(true);
    setOrgsError(null);
    try {
      const res = await fetch("/api/integrations/azure-devops/Organization");
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error ?? `Failed to fetch organizations (${res.status})`);
      }
      const data = await res.json();
      setOrganizations(data.organizations ?? []);
      fetchProjects()
    } catch (err) {
      setOrgsError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setOrgsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchOrganizations();
  }, [fetchOrganizations]);

  // ── Fetch projects when organization changes ────────────────────────────
  const fetchProjects = useCallback(async () => {
    if (!ADOSettings.Defaultorganization) return;
    if (projects.length > 0) return;

    setProjectsLoading(true);
    setProjectsError(null);
    try {
      const params = new URLSearchParams({ organization: ADOSettings.Defaultorganization });
      const res = await fetch(`/api/integrations/azure-devops/projects?${params}`);
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error ?? `Failed to fetch projects (${res.status})`);
      }
      const data = await res.json();
      setProjects(data.value ?? []);
    } catch (err) {
      setProjectsError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setProjectsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ADOSettings.Defaultorganization]);

  useEffect(() => {
    if (ADOSettings.Defaultorganization) {
      fetchProjects();
    }
  }, [ADOSettings.Defaultorganization, fetchProjects]);

  // ── Fetch work item types when project changes ──────────────────────────
  const fetchWorkItemTypes = useCallback(async (projectId: string) => {
    if (!projectId) return;
    if (WorkItemTypes.length > 0) return;

    setWITLoading(true);
    setWITError(null);
    try {
      const params = new URLSearchParams({ projectId, org: company });
      const res = await fetch(`/api/integrations/azure-devops/WorkItem/GetWorkItemTypesByProject?${params}`);
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error ?? `Failed to fetch work item types (${res.status})`);
      }
      const data: GetWorkItemTypesResponse = await res.json();
      setWorkItemTypes(data.types ?? []);
    } catch (err) {
      setWITError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setWITLoading(false);
    }
  }, [WorkItemTypes.length, company, setWorkItemTypes, setWITError, setWITLoading]);

  useEffect(() => {
    if (ADOSettings.Defaultproject) {
      fetchWorkItemTypes(ADOSettings.Defaultproject);
    }
  }, [ADOSettings.Defaultproject, fetchWorkItemTypes]);

  // ── Helpers ─────────────────────────────────────────────────────────────
  function update(patch: Partial<AzureDevopsSettings>) {
    // onChange({ ...ADOSettings, ...patch });
    SetADOSettings({ ...ADOSettings, ...patch })
    setShowSaveButton(true)
    setRequirred(true)
  }

  function handleOrganizationChange(orgName: string) {
    setProjects([]);
    setProjectsError(null);

    // also clear WIT cache
    setWorkItemTypes([]);
    setWITError(null);

    update({ Defaultorganization: orgName, Defaultproject: "", defaultWorkItemTypes: [] });
  }

  function handleProjectChange(projectId: string) {
    // Clear the cached work item types for previous project
    setWorkItemTypes([]);
    setWITError(null);

    update({ Defaultproject: projectId, defaultWorkItemTypes: [] });
  }
  function handleWorkItemTypesChange(next: string[]) {
    update({ defaultWorkItemTypes: next });
  }
  // ── Derived ─────────────────────────────────────────────────────────────
  const orgOptions = organizations.map((o) => ({ label: o.organizationName, value: o.name }));
  const projectOptions = projects.map((p) => ({ label: p.name, value: p.id }));
  const witOptions = WorkItemTypes.map((t) => ({ label: t.name, value: t.name }));

  useEffect(() => {
    console.log(ADOSettings.defaultWorkItemTypes)
  }, [ADOSettings.defaultWorkItemTypes])
  return (
    <div className="space-y-5">
      <section className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100">
          <h2 className="text-sm font-semibold text-slate-900">Tasks</h2>
          <p className="mt-0.5 text-xs text-slate-500">
            Pick what tasks you can see in the Actions page!
          </p>
          {/* <Row
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
          /> */}
        </div>
      </section>
      {/* Connection */}
      <section className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100">
          <h2 className="text-sm font-semibold text-slate-900">Connection</h2>
          <p className="mt-0.5 text-xs text-slate-500">
            Target organisation and project for work-item creation.
          </p>
        </div>
        <div className="px-6 py-5 space-y-5">
          {/* Organisation */}
          <FieldRow
            label="Default Organisation"
            hint="Your Azure DevOps organisation name."
          >
            {orgsError ? (
              <div className="flex items-center gap-2">
                <span className="text-xs text-red-500">{orgsError}</span>
                <button
                  type="button"
                  onClick={() => { setOrganizations([]); fetchOrganizations(); }}
                  className="text-xs text-[#1E3A5F] underline"
                >
                  Retry
                </button>
              </div>
            ) : (
              <SelectInput
                value={ADOSettings.Defaultorganization}
                onChange={handleOrganizationChange}
                options={orgOptions}
                placeholder={orgsLoading ? "Loading organisations…" : "Select an organisation"}
                disabled={orgsLoading}
              />
            )}
          </FieldRow>

          {/* Project */}
          <FieldRow
            label="Default Project"
            hint="Default project where work items will be created."
          >
            {projectsError ? (
              <div className="flex items-center gap-2">
                <span className="text-xs text-red-500">{projectsError}</span>
                <button
                  type="button"
                  onClick={() => { setProjects([]); fetchProjects(); }}
                  className="text-xs text-[#1E3A5F] underline"
                >
                  Retry
                </button>
              </div>
            ) : (
              <SelectInput
                value={ADOSettings.Defaultproject}
                onChange={handleProjectChange}
                options={projectOptions}
                placeholder={
                  !ADOSettings.Defaultorganization
                    ? "Select an organisation first"
                    : projectsLoading
                      ? "Loading projects…"
                      : "Select a project"
                }
                disabled={!ADOSettings.Defaultorganization || projectsLoading}
              />
            )}
          </FieldRow>
          <FieldRow label="Default Work item types:" hint="Choose which work item types the AI is allowed to create.">
            {WITError ? (
              <div className="flex items-center gap-2">
                <span className="text-xs text-red-500">{WITError}</span>
                <button
                  type="button"
                  onClick={() => {
                    setWorkItemTypes([]);
                    fetchWorkItemTypes(ADOSettings.Defaultproject);
                  }}
                  className="text-xs text-[#1E3A5F] underline"
                >
                  Retry
                </button>
              </div>
            ) : (
              <MultiSelectInput
                value={ADOSettings.defaultWorkItemTypes}
                onChange={handleWorkItemTypesChange}
                options={witOptions}
                placeholder={
                  !ADOSettings.Defaultproject
                    ? "Select a project first"
                    : WITLoading
                      ? "Loading work item types…"
                      : "Select work item types"
                }
                disabled={!ADOSettings.Defaultproject || WITLoading}
              />
            )}
          </FieldRow>
        </div>
      </section>
      {showSaveButton && (
        <div className="flex justify-end">
          <button
            className="cursor-pointer rounded-lg bg-[#1E3A5F] px-3.5 py-2 text-xs font-semibold 
        text-white shadow-sm transition hover:bg-[#16304F] focus:outline-none focus:ring-2 
        focus:ring-[#1E3A5F] focus:ring-offset-2 disabled:opacity-60"
            onClick={() => SaveChanges()}
          >
            Save changes
          </button>
        </div>
      )}

    </div>
  );
}

/* ───────────────── Shared primitives ───────────────── */

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
    <div className="flex items-center justify-between gap-4 px-6 py-4">
      <div>
        <p className="text-sm font-medium text-slate-900">{title}</p>
        <p className="mt-0.5 text-xs text-slate-500">{desc}</p>
      </div>
      <Toggle checked={checked} onChange={onChange} />
    </div>
  );
}

function FieldRow({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
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

function SelectInput({
  value,
  onChange,
  options,
  placeholder,
  disabled,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { label: string; value: string }[];
  placeholder?: string;
  disabled?: boolean;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 shadow-sm transition focus:border-[#1E3A5F] focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/20 appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {placeholder && (
        <option value="" disabled>
          {placeholder}
        </option>
      )}
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}
function MultiSelectInput({
  value,
  onChange,
  options,
  disabled,
  placeholder,
}: {
  value: string[];
  onChange: (v: string[]) => void;
  options: { label: string; value: string }[];
  disabled?: boolean;
  placeholder?: string;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="px-3 py-2 text-[11px] text-slate-500 border-b border-slate-100">
        {placeholder ?? "Select one or more"}
      </div>

      <div className="max-h-48 overflow-auto p-2 space-y-1">
        {options.length === 0 ? (
          <div className="px-2 py-2 text-xs text-slate-500">
            {disabled ? "Disabled" : "No options"}
          </div>
        ) : (
          options.map((o, index) => {
            const selected = Array.isArray(value) ? value : [];
            const checked = selected.includes(o.value);

            return (
              <label
                key={index}
                className={[
                  "flex items-center gap-2 rounded-md px-2 py-1.5 text-xs cursor-pointer",
                  checked ? "bg-slate-50" : "hover:bg-slate-50",
                  disabled ? "opacity-50 cursor-not-allowed" : "",
                ].join(" ")}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  disabled={disabled}
                  onChange={() => {
                    if (checked) onChange(selected.filter((x) => x !== o.value));
                    else onChange([...selected, o.value]);
                  }}
                />
                <span className="text-slate-900">{o.label}</span>
              </label>
            );
          })
        )}
      </div>
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