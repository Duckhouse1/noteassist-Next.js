import {
  AzureDevopsSettings,
  GetWorkItemTypesResponse,
} from "@/lib/Integrations/AzureDevops/Configuration";
import { FetchedADOData } from "@/lib/Integrations/AzureDevops/ADOFetchfunctions";
import { useEffect, useMemo, useRef, useState } from "react";

import { WITHierarchyPicker } from "@/app/Components/WITPicker";

type Props = {
  config: AzureDevopsSettings | undefined;
  data: FetchedADOData | null;
  onPatch: (patch: Partial<AzureDevopsSettings>) => void;
};

export default function AzureDevopsConfigPanel({
  config,
  data,
  onPatch,
}: Props) {
  const orgOptions = data?.Organizations ?? [];
  const projectOptions = data?.projects ?? [];

  const currentOrg = config?.defaultOrganization?.trim() ?? "";
  const currentProject = config?.defaultProject?.trim() ?? "";

  // WITs for the current project — read directly from config
  const currentWITs = currentProject
    ? (config?.projectWorkItemTypes?.[currentProject] ?? [])
    : [];

  // Cache fetched WIT type lists so switching projects doesn't re-fetch
  const witTypesCache = useRef<Map<string, string[]>>(new Map());
  const mkKey = (org: string, project: string) => `${org}|${project}`;
const inFlight = useRef(new Map<string, Promise<string[]>>());

  const [allWIT, setAllWIT] = useState<string[]>([]);
  const [loadingWIT, setLoadingWIT] = useState(false);


  // Fetch available WIT types when org+project change
  useEffect(() => {
    if (!currentOrg || !currentProject) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setAllWIT([]);
      return;
    }

    const key = mkKey(currentOrg, currentProject);
    const cached = witTypesCache.current.get(key);
    if (cached) {
      setAllWIT(cached);
      return;
    }

    const controller = new AbortController();
    let cancelled = false;
    setLoadingWIT(true);

    (async () => {
      const params = new URLSearchParams({ projectId: currentProject, org: currentOrg });
      const res = await fetch(
        `/api/integrations/azure-devops/WorkItem/GetWorkItemTypesByProject?${params}`,
        { signal: controller.signal }
      );
      if (!res.ok) return;
      const json = (await res.json()) as GetWorkItemTypesResponse;
      const types = json.types.map((t) => t.name);
      if (!cancelled) {
        witTypesCache.current.set(key, types);
        setAllWIT(types);
      }
    })()
      .catch((e) => { if (e.name !== "AbortError") console.error(e); })
      .finally(() => { if (!cancelled) setLoadingWIT(false); });

    return () => { cancelled = true; controller.abort(); };
  }, [currentOrg, currentProject]);

  // Only show WITs that actually exist in the current project's type list
  const selectedForProject = useMemo(
    () => currentWITs.filter((name) => allWIT.includes(name)),
    [currentWITs, allWIT]
  );

  function handleOrgChange(nextOrg: string) {
    onPatch({
      defaultOrganization: nextOrg,
      defaultProject: "",
      // Don't touch projectWorkItemTypes — all per-project selections are preserved
    });
  }

  function handleProjectChange(nextProject: string) {
    onPatch({
      defaultProject: nextProject,
      // No need to clear WITs — each project has its own entry in projectWorkItemTypes
    });
  }

  function handleWITChange(next: string[]) {
    if (!currentProject) return;
    onPatch({
      projectWorkItemTypes: {
        ...(config?.projectWorkItemTypes ?? {}),
        [currentProject]: next,
      },
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <ConfigField label="Default Organization" hint="The Azure DevOps organization used by default.">
          <select
            className="w-full appearance-none rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 shadow-sm outline-none transition focus:border-gray-400 focus:ring-1 focus:ring-gray-300"
            value={currentOrg}
            onChange={(e) => handleOrgChange(e.target.value)}
          >
            <option value="">Select…</option>
            {orgOptions.map((o) => (
              <option key={o.name} value={o.name}>{o.name}</option>
            ))}
          </select>
        </ConfigField>

        <ConfigField label="Default Project" hint="New work items will be created in this project.">
          <select
            className="w-full appearance-none rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 shadow-sm outline-none transition focus:border-gray-400 focus:ring-1 focus:ring-gray-300"
            value={currentProject}
            onChange={(e) => handleProjectChange(e.target.value)}
          >
            <option value="">Select…</option>
            {projectOptions.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </ConfigField>
      </div>

      <div className="border-t border-gray-100" />

      <ConfigField
        label="Default Work Item Types"
        hint="Choose which work item types are available when creating items."
      >
        {loadingWIT ? (
          <WITSkeletonRow />
        ) : allWIT.length > 0 ? (
          <WITHierarchyPicker
            allWit={allWIT}
            selected={selectedForProject}
            onChange={handleWITChange}
          />
        ) : (
          <div className="flex items-center gap-2 rounded-lg border border-dashed border-gray-200 bg-gray-50/60 px-4 py-6 text-sm text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 16v-4" />
              <path d="M12 8h.01" />
            </svg>
            {currentOrg && currentProject
              ? "No work item types found for this project."
              : "Select an organization and project above to load work item types."}
          </div>
        )}
      </ConfigField>
    </div>
  );
}

function ConfigField({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-gray-800">{label}</label>
      {hint && <p className="text-xs text-gray-400 leading-snug -mt-0.5">{hint}</p>}
      <div className="mt-0.5">{children}</div>
    </div>
  );
}

function WITSkeletonRow() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="h-9 rounded-lg bg-gray-100 animate-pulse" />
      ))}
    </div>
  );
}