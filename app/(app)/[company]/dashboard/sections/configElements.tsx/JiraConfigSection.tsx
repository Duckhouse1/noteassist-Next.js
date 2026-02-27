import { JiraSettings, JiraIssueType } from "@/lib/Integrations/Jira/Configuration";
import { FetchedJiraData } from "@/lib/Integrations/Jira/FetchFunctions";
import { useEffect, useRef, useState } from "react";

type Props = {
    config: JiraSettings | undefined;
    data: FetchedJiraData | null;
    onPatch: (patch: Partial<JiraSettings>) => void;
};

export default function JiraConfigPanel({ config, data, onPatch }: Props) {
    const siteOptions = data?.sites ?? [];
    const projectOptions = data?.projects ?? [];

    const currentCloudId = config?.defaultCloudId?.trim() ?? "";
    const currentProjectKey = config?.defaultProjectKey?.trim() ?? "";
    const currentIssueTypes = config?.defaultIssueTypes ?? [];

    const [allIssueTypes, setAllIssueTypes] = useState<string[]>([]);
    const [loadingTypes, setLoadingTypes] = useState(false);

    // Cache
    const cache = useRef<Map<string, string[]>>(new Map());

    useEffect(() => {
        if (!currentCloudId || !currentProjectKey) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setAllIssueTypes([]);
            return;
        }

        const key = `${currentCloudId}|${currentProjectKey}`;
        const cached = cache.current.get(key);
        if (cached) {
            setAllIssueTypes(cached);
            return;
        }

        let cancelled = false;
        setLoadingTypes(true);

        (async () => {
            const params = new URLSearchParams({ cloudId: currentCloudId, projectKey: currentProjectKey });
            const res = await fetch(`/api/integrations/jira/issueTypes?${params}`);
            if (!res.ok) return;
            const json = (await res.json()) as { types: JiraIssueType[] };
            const names = json.types.filter((t) => !t.subtask).map((t) => t.name);
            if (!cancelled) {
                cache.current.set(key, names);
                setAllIssueTypes(names);
            }
        })()
            .catch((e) => console.error(e))
            .finally(() => { if (!cancelled) setLoadingTypes(false); });

        return () => { cancelled = true; };
    }, [currentCloudId, currentProjectKey]);

    function handleSiteChange(nextCloudId: string) {
        onPatch({ defaultCloudId: nextCloudId, defaultProjectKey: "", defaultIssueTypes: [] });
    }

    function handleProjectChange(nextKey: string) {
        onPatch({ defaultProjectKey: nextKey });
    }

    function toggleIssueType(name: string) {
        const next = currentIssueTypes.includes(name)
            ? currentIssueTypes.filter((t) => t !== name)
            : [...currentIssueTypes, name];
        onPatch({ defaultIssueTypes: next });
    }

    return (
        <div className="flex flex-col gap-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <ConfigField label="Jira Cloud Site" hint="The Atlassian cloud site to use.">
                    <select
                        className="w-full appearance-none rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 shadow-sm outline-none transition focus:border-gray-400 focus:ring-1 focus:ring-gray-300"
                        value={currentCloudId}
                        onChange={(e) => handleSiteChange(e.target.value)}
                    >
                        <option value="">Select…</option>
                        {siteOptions.map((s) => (
                            <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                    </select>
                </ConfigField>

                <ConfigField label="Default Project" hint="New issues will be created in this project.">
                    <select
                        className="w-full appearance-none rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 shadow-sm outline-none transition focus:border-gray-400 focus:ring-1 focus:ring-gray-300"
                        value={currentProjectKey}
                        onChange={(e) => handleProjectChange(e.target.value)}
                    >
                        <option value="">Select…</option>
                        {projectOptions.map((p) => (
                            <option key={p.key} value={p.key}>{p.name} ({p.key})</option>
                        ))}
                    </select>
                </ConfigField>
            </div>

            <div className="border-t border-gray-100" />

            <ConfigField label="Issue Types" hint="Choose which issue types to use when creating issues.">
                {loadingTypes ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {[0, 1, 2, 3].map((i) => (
                            <div key={i} className="h-9 rounded-lg bg-gray-100 animate-pulse" />
                        ))}
                    </div>
                ) : allIssueTypes.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                        {allIssueTypes.map((name) => {
                            const selected = currentIssueTypes.includes(name);
                            return (
                                <button
                                    key={name}
                                    type="button"
                                    onClick={() => toggleIssueType(name)}
                                    className={[
                                        "cursor-pointer rounded-lg border px-3 py-1.5 text-sm font-medium transition-all",
                                        selected
                                            ? "border-black bg-black text-white"
                                            : "border-gray-200 bg-white text-gray-700 hover:border-gray-400",
                                    ].join(" ")}
                                >
                                    {name}
                                </button>
                            );
                        })}
                    </div>
                ) : (
                    <div className="flex items-center gap-2 rounded-lg border border-dashed border-gray-200 bg-gray-50/60 px-4 py-6 text-sm text-gray-400">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                            <circle cx="12" cy="12" r="10" />
                            <path d="M12 16v-4" />
                            <path d="M12 8h.01" />
                        </svg>
                        {currentCloudId && currentProjectKey
                            ? "No issue types found for this project."
                            : "Select a site and project above to load issue types."}
                    </div>
                )}
            </ConfigField>
        </div>
    );
}

function ConfigField({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
    return (
        <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-800">{label}</label>
            {hint && <p className="text-xs text-gray-400 leading-snug -mt-0.5">{hint}</p>}
            <div className="mt-0.5">{children}</div>
        </div>
    );
}