"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { IntegrationConnection } from "../../dashboardClient";
import { WorkItemType } from "@/app/api/integrations/azure-devops/WorkItem/GetWorkItemTypesByProject/route";

/* ───────────────── Types ───────────────── */

type GetWorkItemTypesResponse = {
  types: WorkItemType[];
};

export type AzureDevopsSettings = {
  defaultOrganization: string;
  defaultProject: string;
  defaultWorkItemTypes: string[];
};

export const DEFAULT_AZURE_DEVOPS_SETTINGS: AzureDevopsSettings = {
  defaultOrganization: "",
  defaultProject: "",
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

  // ✅ controlled config
  settings: AzureDevopsSettings;
  onChange: (next: AzureDevopsSettings) => void;
}

/* ───────────────── Component ───────────────── */

export function AzureDevopsConfig({ company, ADOconnection,settings,onChange,}: AzureDevopsConfigProps) {
  // Cache-ish UI state (NOT user config)
  const [organizations, setOrganizations] = useState<AzureOrganization[]>([]);
  const [orgsLoading, setOrgsLoading] = useState(false);
  const [orgsError, setOrgsError] = useState<string | null>(null);

  const [projects, setProjects] = useState<AzureProject[]>([]);
  const [projectsLoading, setProjectsLoading] = useState(false);
  const [projectsError, setProjectsError] = useState<string | null>(null);

  const [workItemTypes, setWorkItemTypes] = useState<WorkItemType[]>([]);
  const [witLoading, setWitLoading] = useState(false);
  const [witError, setWitError] = useState<string | null>(null);

  // ── Fetch organizations on mount ────────────────────────────────────────
  const fetchOrganizations = useCallback(async () => {
    setOrgsLoading(true);
    setOrgsError(null);

    try {
      const res = await fetch("/api/integrations/azure-devops/Organization");
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(body?.error ?? `Failed to fetch organizations (${res.status})`);
      }
      const data = (await res.json()) as { organizations?: AzureOrganization[] };
      setOrganizations(data.organizations ?? []);
    } catch (err: unknown) {
      setOrgsError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setOrgsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (organizations.length === 0) fetchOrganizations();
  }, [fetchOrganizations, organizations.length]);

  // ── Fetch projects when organization changes ────────────────────────────
  const fetchProjects = useCallback(async (orgName: string) => {
    if (!orgName) return;

    setProjectsLoading(true);
    setProjectsError(null);

    try {
      const params = new URLSearchParams({ organization: orgName });
      const res = await fetch(`/api/integrations/azure-devops/projects?${params}`);

      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(body?.error ?? `Failed to fetch projects (${res.status})`);
      }

      const data = (await res.json()) as { value?: AzureProject[] };
      setProjects(data.value ?? []);
    } catch (err: unknown) {
      setProjectsError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setProjectsLoading(false);
    }
  }, []);

  useEffect(() => {
    // whenever settings.defaultOrganization changes, refresh projects list
    setProjects([]);
    setProjectsError(null);
    setWorkItemTypes([]);
    setWitError(null);

    if (settings.defaultOrganization) {
      void fetchProjects(settings.defaultOrganization);
    }
  }, [settings.defaultOrganization, fetchProjects]);

  // ── Fetch work item types when project changes ──────────────────────────
  const fetchWorkItemTypes = useCallback(
    async (projectId: string) => {
      if (!projectId) return;

      setWitLoading(true);
      setWitError(null);

      try {
        const params = new URLSearchParams({ projectId, org: company });
        const res = await fetch(
          `/api/integrations/azure-devops/WorkItem/GetWorkItemTypesByProject?${params}`
        );

        if (!res.ok) {
          const body = (await res.json().catch(() => ({}))) as { error?: string };
          throw new Error(body?.error ?? `Failed to fetch work item types (${res.status})`);
        }

        const data = (await res.json()) as GetWorkItemTypesResponse;
        setWorkItemTypes(data.types ?? []);
      } catch (err: unknown) {
        setWitError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setWitLoading(false);
      }
    },
    [company]
  );

  useEffect(() => {
    // whenever settings.defaultProject changes, refresh work item types list
    setWorkItemTypes([]);
    setWitError(null);

    if (settings.defaultProject) {
      void fetchWorkItemTypes(settings.defaultProject);
    }
  }, [settings.defaultProject, fetchWorkItemTypes]);

  // ── Controlled updates ─────────────────────────────────────────────────
  function update(patch: Partial<AzureDevopsSettings>) {
    onChange({ ...settings, ...patch });
  }

  function handleOrganizationChange(orgName: string) {
    // When org changes: clear project + types in SETTINGS
    update({ defaultOrganization: orgName, defaultProject: "", defaultWorkItemTypes: [] });
  }

  function handleProjectChange(projectId: string) {
    // When project changes: clear types in SETTINGS
    update({ defaultProject: projectId, defaultWorkItemTypes: [] });
  }

  function handleWorkItemTypesChange(next: string[]) {
    update({ defaultWorkItemTypes: next });
  }

  // ── Derived options ─────────────────────────────────────────────────────
  const orgOptions = useMemo(
    () => organizations.map((o) => ({ label: o.organizationName, value: o.name })),
    [organizations]
  );

  const projectOptions = useMemo(
    () => projects.map((p) => ({ label: p.name, value: p.id })),
    [projects]
  );

  const witOptions = useMemo(
    () => workItemTypes.map((t) => ({ label: t.name, value: t.name })),
    [workItemTypes]
  );

  return (
    <div className="space-y-5">
      {/* Connection */}
      <section className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100">
          <h2 className="text-sm font-semibold text-slate-900">Connection</h2>
          <p className="mt-0.5 text-xs text-slate-500">
            Target organisation and project for work-item creation.
          </p>
          <p className="mt-2 text-[11px] text-slate-400">
            Connection: <span className="font-medium">{ADOconnection.displayName}</span>
          </p>
        </div>

        <div className="px-6 py-5 space-y-5">
          {/* Organisation */}
          <FieldRow label="Default Organisation" hint="Your Azure DevOps organisation name.">
            {orgsError ? (
              <div className="flex items-center gap-2">
                <span className="text-xs text-red-500">{orgsError}</span>
                <button
                  type="button"
                  onClick={() => {
                    setOrganizations([]);
                    void fetchOrganizations();
                  }}
                  className="text-xs text-[#1E3A5F] underline"
                >
                  Retry
                </button>
              </div>
            ) : (
              <SelectInput
                value={settings.defaultOrganization}
                onChange={handleOrganizationChange}
                options={orgOptions}
                placeholder={orgsLoading ? "Loading organisations…" : "Select an organisation"}
                disabled={orgsLoading}
              />
            )}
          </FieldRow>

          {/* Project */}
          <FieldRow label="Default Project" hint="Default project where work items will be created.">
            {projectsError ? (
              <div className="flex items-center gap-2">
                <span className="text-xs text-red-500">{projectsError}</span>
                <button
                  type="button"
                  onClick={() => {
                    setProjects([]);
                    void fetchProjects(settings.defaultOrganization);
                  }}
                  className="text-xs text-[#1E3A5F] underline"
                >
                  Retry
                </button>
              </div>
            ) : (
              <SelectInput
                value={settings.defaultProject}
                onChange={handleProjectChange}
                options={projectOptions}
                placeholder={
                  !settings.defaultOrganization
                    ? "Select an organisation first"
                    : projectsLoading
                      ? "Loading projects…"
                      : "Select a project"
                }
                disabled={!settings.defaultOrganization || projectsLoading}
              />
            )}
          </FieldRow>

          {/* Work Item Types */}
          <FieldRow
            label="Default Work item types"
            hint="Choose which work item types the AI is allowed to create."
          >
            {witError ? (
              <div className="flex items-center gap-2">
                <span className="text-xs text-red-500">{witError}</span>
                <button
                  type="button"
                  onClick={() => {
                    setWorkItemTypes([]);
                    void fetchWorkItemTypes(settings.defaultProject);
                  }}
                  className="text-xs text-[#1E3A5F] underline"
                >
                  Retry
                </button>
              </div>
            ) : (
              <MultiSelectInput
                value={settings.defaultWorkItemTypes}
                onChange={handleWorkItemTypesChange}
                options={witOptions}
                placeholder={
                  !settings.defaultProject
                    ? "Select a project first"
                    : witLoading
                      ? "Loading work item types…"
                      : "Select work item types"
                }
                disabled={!settings.defaultProject || witLoading}
              />
            )}
          </FieldRow>
        </div>
      </section>
    </div>
  );
}

/* ───────────────── Shared primitives ───────────────── */

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
          options.map((o) => {
            const checked = value.includes(o.value);

            return (
              <label
                key={o.value}
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
                    if (checked) onChange(value.filter((x) => x !== o.value));
                    else onChange([...value, o.value]);
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