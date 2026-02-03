import { useEffect, useMemo, useState } from "react";
import FetchService, { DevOpsSprintProps } from "../../../../../Services/Fetchservice";

export interface DevOpsProjectsProps {
    id: string;
    name: string;
}

export interface DevOpsTeamsProps {
    id: string;
    name: string;
}
const mockTasks = [
    { id: "T-101", title: "Set up sprint backlog" },
    { id: "T-102", title: "Review pipeline failures" },
    { id: "T-103", title: "Update deployment docs" },
];

export const DevOpsPreBody = () => {
    const [projects, setProjects] = useState<DevOpsProjectsProps[]>([]);
    const [selectedProject, setSelectedProject] = useState<DevOpsProjectsProps | null>(null);

    const [teams, setTeams] = useState<DevOpsTeamsProps[]>([]);
    const [selectedTeam, setSelectedTeam] = useState<DevOpsTeamsProps | null>(null);

    const [sprints, setSprints] = useState<DevOpsSprintProps[]>([]);
    const [selectedSprint, setSelectedSprint] = useState<DevOpsSprintProps | null>(null);

    const [loadingProjects, setLoadingProjects] = useState(false);
    const [loadingTeams, setLoadingTeams] = useState(false);
    const [loadingSprints, setLoadingSprints] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Fetch projects once
    useEffect(() => {
        let cancelled = false;

        (async () => {
            try {
                setError(null);
                setLoadingProjects(true);
                const p = await FetchService.FetchProjects();
                if (!cancelled) setProjects(p);
            } catch (e) {
                if (!cancelled) setError("Could not load projects. Check your DevOps connection.");
            } finally {
                if (!cancelled) setLoadingProjects(false);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, []);

    // Fetch teams when project changes
    useEffect(() => {
        if (!selectedProject) return;

        let cancelled = false;

        (async () => {
            try {
                setError(null);
                setLoadingTeams(true);
                const t = await FetchService.FetchAllTeamsByProjectID(selectedProject.id);
                if (!cancelled) setTeams(t);
            } catch (e) {
                if (!cancelled) setError("Could not load teams for that project.");
            } finally {
                if (!cancelled) setLoadingTeams(false);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [selectedProject?.id]);

    // Fetch sprints when team changes
    useEffect(() => {
        if (!selectedTeam) return;

        let cancelled = false;

        (async () => {
            try {
                setError(null);
                setLoadingSprints(true);
                const s = await FetchService.FetchSprintsByTeam(selectedTeam.id);
                if (!cancelled) setSprints(s);
            } catch (e) {
                if (!cancelled) setError("Could not load sprints for that team.");
            } finally {
                if (!cancelled) setLoadingSprints(false);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [selectedTeam?.id]);

    const canPickTeam = !!selectedProject && !loadingTeams;
    const canPickSprint = !!selectedTeam && !loadingSprints;

    const selectionSummary = useMemo(() => {
        return [
            { label: "Project", value: selectedProject?.name ?? "—" },
            { label: "Team", value: selectedTeam?.name ?? "—" },
            { label: "Sprint", value: selectedSprint?.name ?? "—" },
        ];
    }, [selectedProject, selectedTeam, selectedSprint]);

    return (
        <div className="w-full max-w-2xl md:max-w-4xl xl:max-w-5xl flex flex-row gap-2">
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm flex-2">
                {/* Header */}
                <div className="flex items-start justify-between gap-4 border-b border-slate-100 p-5">
                    <div>
                        <div className="flex items-center gap-2">
                            <div className="grid h-9 w-9 place-items-center rounded-xl bg-slate-900 text-white">
                                {/* simple icon */}
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                                    <path
                                        d="M12 2l7 4v8c0 5-7 8-7 8s-7-3-7-8V6l7-4Z"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinejoin="round"
                                    />
                                </svg>
                            </div>
                            <h2 className="text-lg font-semibold text-slate-900">Azure DevOps</h2>
                        </div>
                        <p className="mt-1 text-sm text-slate-600">
                            Choose a project, team, and sprint to scope your work.
                        </p>
                    </div>

                    <button
                        type="button"
                        className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
                        onClick={() => {
                            setSelectedProject(null);
                            setSelectedTeam(null);
                            setSelectedSprint(null);
                            setTeams([]);
                            setSprints([]);
                            setError(null);
                        }}
                    >
                        Reset
                    </button>
                </div>

                {/* Body */}
                <div className="p-5">
                    {error && (
                        <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                            {error}
                        </div>
                    )}

                    <div className="grid gap-4 md:grid-cols-3">
                        {/* Project */}
                        <Field
                            label="Project"
                            helper={loadingProjects ? "Loading projects…" : "Select the DevOps project."}
                            disabled={loadingProjects}
                        >
                            <select
                                className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition focus:border-slate-300 focus:ring-4 focus:ring-slate-100 disabled:bg-slate-50 disabled:text-slate-500"
                                value={selectedProject?.id ?? ""}
                                onChange={(e) => {
                                    const project = projects.find((p) => p.id === e.target.value) ?? null;
                                    setSelectedProject(project);

                                    // Reset downstream selections right here (best practice)
                                    setTeams([]);
                                    setSelectedTeam(null);
                                    setSprints([]);
                                    setSelectedSprint(null);
                                }}
                                disabled={loadingProjects}
                            >
                                <option value="" disabled>
                                    {loadingProjects ? "Loading…" : "No project selected"}
                                </option>
                                {projects.map((p) => (
                                    <option key={p.id} value={p.id}>
                                        {p.name}
                                    </option>
                                ))}
                            </select>
                        </Field>

                        {/* Team */}
                        <Field
                            label="Team"
                            helper={
                                !selectedProject
                                    ? "Pick a project first."
                                    : loadingTeams
                                        ? "Loading teams…"
                                        : "Select the team within the project."
                            }
                            disabled={!selectedProject}
                        >
                            <select
                                className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition focus:border-slate-300 focus:ring-4 focus:ring-slate-100 disabled:bg-slate-50 disabled:text-slate-500"
                                value={selectedTeam?.id ?? ""}
                                onChange={(e) => {
                                    const team = teams.find((t) => t.id === e.target.value) ?? null;
                                    setSelectedTeam(team);

                                    // Reset sprint when team changes
                                    setSprints([]);
                                    setSelectedSprint(null);
                                }}
                                disabled={!canPickTeam}
                            >
                                <option value="" disabled>
                                    {!selectedProject ? "Select a project first" : loadingTeams ? "Loading…" : "No team selected"}
                                </option>
                                {teams.map((t) => (
                                    <option key={t.id} value={t.id}>
                                        {t.name}
                                    </option>
                                ))}
                            </select>
                        </Field>

                        {/* Sprint */}
                        <Field
                            label="Sprint"
                            helper={
                                !selectedTeam
                                    ? "Pick a team first."
                                    : loadingSprints
                                        ? "Loading sprints…"
                                        : "Select the sprint/iteration."
                            }
                            disabled={!selectedTeam}
                        >
                            <select
                                className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition focus:border-slate-300 focus:ring-4 focus:ring-slate-100 disabled:bg-slate-50 disabled:text-slate-500"
                                value={selectedSprint?.id ?? ""}
                                onChange={(e) => {
                                    const sprint = sprints.find((s) => s.id === e.target.value) ?? null;
                                    setSelectedSprint(sprint);
                                }}
                                disabled={!canPickSprint}
                            >
                                <option value="" disabled>
                                    {!selectedTeam ? "Select a team first" : loadingSprints ? "Loading…" : "No sprint selected"}
                                </option>
                                {sprints.map((s) => (
                                    <option key={s.id} value={s.id}>
                                        {s.name}
                                    </option>
                                ))}
                            </select>
                        </Field>

                        {/* Summary */}
                        {/* <div className="col-span-full md:col-span-3">
                            <div className="flex h-full min-h-[88px] w-full flex-col justify-center rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                                <div className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                                    Selection
                                </div>

                                <div className="grid w-full grid-cols-1 gap-2 sm:grid-cols-3">
                                    {selectionSummary.map((row) => (
                                        <div
                                            key={row.label}
                                            className="flex flex-col rounded-md bg-white px-2 py-1.5 shadow-sm"
                                        >
                                            <div className="text-[10px] font-medium text-slate-400">
                                                {row.label}
                                            </div>
                                            <div className="truncate text-[11px] font-semibold text-slate-900 leading-tight">
                                                {row.value}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div> */}



                        {/* CTA
                        <button
                            type="button"
                            className="mt-2 inline-flex items-center justify-center rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-40"
                            disabled={!selectedProject || !selectedTeam || !selectedSprint}
                            onClick={() => {
                                // Use selections here
                                console.log("Selected:", { selectedProject, selectedTeam, selectedSprint });
                            }}
                        >
                            Continue
                        </button> */}


                        {selectedSprint && (
                            <div className="col-span-full md:col-span-3">
                                <div className="flex w-full flex-col rounded-lg border border-slate-200 bg-slate-50 px-3 py-4 pb-6">
                                    {/* Header */}
                                    <div className="flex items-center justify-end">
                                        <button className="rounded-md bg-slate-900 px-3 py-1 text-xs font-semibold text-white hover:bg-slate-800">
                                            NEW +
                                        </button>
                                    </div>

                                    {/* Body */}
                                    <div className="mt-2 grid w-full grid-cols-3 gap-2">
                                        {/* Left / Mid section */}
                                        <div className="col-span-2 flex flex-col gap-1.5">
                                            {mockTasks.map((task) => (
                                                <div
                                                    key={task.id}
                                                    className="flex items-center justify-between rounded-md border border-slate-200 bg-white px-2 py-1.5 text-xs shadow-sm"
                                                >
                                                    <span className="truncate font-medium text-slate-900">
                                                        {task.title}
                                                    </span>
                                                    <span className="ml-2 shrink-0 text-[10px] text-slate-400">
                                                        {task.id}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Right spacer / future content */}
                                        <div className="col-span-1" />
                                    </div>
                                </div>
                            </div>

                        )}

                    </div>
                </div>
            </div>
            {/* Task modal helper */}
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm flex-1 p-5 ">
                <h1 className="text-lg font-semibold text-slate-900">Action - Tasks</h1>
            </div>
        </div>
    );
};

// Small “design system” helper
function Field({
    label,
    helper,
    disabled,
    children,
}: {
    label: string;
    helper?: string;
    disabled?: boolean;
    children: React.ReactNode;
}) {
    return (
        <div className="grid gap-2 md:grid-cols-[220px,1fr] md:items-start md:gap-4">
            {/* Left: label + helper */}
            <div className="flex flex-col">
                <label className={`text-sm font-semibold ${disabled ? "text-slate-400" : "text-slate-900"}`}>
                    {label}
                </label>
                {helper && (
                    <span className={`mt-1 text-xs ${disabled ? "text-slate-400" : "text-slate-500"}`}>
                        {helper}
                    </span>
                )}
            </div>

            {/* Right: control */}
            <div className="min-w-0">{children}</div>
        </div>
    );
}
