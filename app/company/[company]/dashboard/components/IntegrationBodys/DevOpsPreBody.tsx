import { useContext, useEffect, useMemo, useState } from "react";
import FetchService, { DevOpsSprintProps } from "../../../../../Services/Fetchservice";
import { Assignee, DevOpsFeature, DevOpsPBI, DevOpsResponse, DevOpsTask, OpenAIResponse } from "@/app/types/OpenAI";
import { DevOpsTaskTypes, TasksDisplayPanel } from "../TaskDisplayPanel";
import { CreateDevopsElementModal } from "./CreateFeatureModal";
import { ShowNotesBodyContext } from "@/app/Contexts";
import { NotesBody } from "../NotesBody";
import { title } from "process";

export interface DevOpsProjectsProps {
    id: string;
    name: string;
}

export interface DevOpsTeamsProps {
    id: string;
    name: string;
}

export interface DisplayedElementProps {
    type: DevOpsTaskTypes;
    data: DevOpsFeature | DevOpsPBI | DevOpsTask;
}

export interface newDevOpsElement {
    type: DevOpsTaskTypes;
    id: string;
    parentID: string | null
    title: string;
    description: string;
    assignees?: Assignee[]
}
export type RemoveAction =
    | { type: "Feature"; featureId: string }
    | { type: "PBIS"; featureId: string; pbiId: string }
    | { type: "Tasks"; featureId: string; pbiId: string; taskId: string };


export const DevOpsPreBody = ({ aiSolution }: { aiSolution: DevOpsResponse }) => {
    const [projects, setProjects] = useState<DevOpsProjectsProps[]>([]);
    const [selectedProject, setSelectedProject] = useState<DevOpsProjectsProps | null>(null);

    const [teams, setTeams] = useState<DevOpsTeamsProps[]>([]);
    const [selectedTeam, setSelectedTeam] = useState<DevOpsTeamsProps | null>(null);

    const [sprints, setSprints] = useState<DevOpsSprintProps[]>([]);
    const [selectedSprint, setSelectedSprint] = useState<DevOpsSprintProps | null>(null);

    const { show } = useContext(ShowNotesBodyContext)

    const [displayedElement, setDisplayedElement] = useState<DisplayedElementProps | null>(null);
    const [features, setFeatures] = useState(aiSolution.features)
    const [loadingProjects, setLoadingProjects] = useState(false);
    const [loadingTeams, setLoadingTeams] = useState(false);
    const [loadingSprints, setLoadingSprints] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [showFeatureModal, setShowFeatureModal] = useState(false)

    const [creatingElement, setCreatingElement] = useState<{ type: DevOpsTaskTypes; parentId: string | null; } | null>(null);

    const onActionTaskClick = (displayedElement: DisplayedElementProps) => {
        setDisplayedElement(displayedElement);
        console.log("Clicked task type:", displayedElement.type, "with ID:", displayedElement.data.id, "Title:", displayedElement.data.title, "Description:", displayedElement.data.description);
    }
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
    }, [selectedTeam]);

    const canPickTeam = !!selectedProject && !loadingTeams;
    const canPickSprint = !!selectedTeam && !loadingSprints;



    const onTaskRemove = (action: RemoveAction) => {
        setFeatures(prev => {
            if (!prev) return prev;

            switch (action.type) {
                case "Feature":
                    return prev.filter(f => f.id !== action.featureId);

                case "PBIS":
                    return prev.map(f =>
                        f.id !== action.featureId
                            ? f
                            : { ...f, pbis: f.pbis.filter(p => p.id !== action.pbiId) }
                    );

                case "Tasks":
                    return prev.map(f =>
                        f.id !== action.featureId
                            ? f
                            : {
                                ...f,
                                pbis: f.pbis.map(p =>
                                    p.id !== action.pbiId
                                        ? p
                                        : { ...p, tasks: p.tasks.filter(t => t.id !== action.taskId) }
                                ),
                            }
                    );
            }
        });
    };



    const onCreateNewElementClickHandler = (type: DevOpsTaskTypes, parentId: string | null) => {
        setCreatingElement({ type, parentId, });
        setShowFeatureModal(true);
    };

    useEffect(() => {
        console.log("Dette er features");
        console.log(features);
    }, [features, setFeatures])

    const CreateNewDevOpsElement = (title: string, description: string) => {
        console.log(creatingElement?.type);
        console.log(creatingElement?.parentId);
        setFeatures(prev => {
            // 1) Create Feature (top-level)
            if (creatingElement?.parentId === null) {
                return [
                    ...prev,
                    {
                        id: crypto.randomUUID(),
                        title,
                        description,
                        pbis: [],
                    },
                ];
            }

            // 2) Create PBI under a Feature
            if (creatingElement?.type === "PBI") {
                const newPBI: DevOpsPBI = {
                    id: crypto.randomUUID(),
                    title,
                    description,
                    tasks: [],
                };

                return prev.map(feature =>
                    feature.id === creatingElement.parentId
                        ? { ...feature, pbis: [...feature.pbis, newPBI] }
                        : feature
                );
            }

            // 3) Create Task under a PBI (parentId should be the PBI id)
            if (creatingElement?.type === "Task") {
                const newTask: DevOpsTask = {
                    id: crypto.randomUUID(),
                    title,
                    description,
                    // add other required fields here
                };

                return prev.map(feature => ({
                    ...feature,
                    pbis: feature.pbis.map(pbi =>
                        pbi.id === creatingElement.parentId
                            ? { ...pbi, tasks: [...pbi.tasks, newTask] }
                            : pbi
                    ),
                }));
            }

            return prev;
        });
    };

    if (show) {
        return <NotesBody />
    }
    return (
        <div className="w-full flex flex-row gap-2 items-stretch min-h-0 max-h-[80vh]">

            {showFeatureModal &&
                <CreateDevopsElementModal
                    type={creatingElement!.type}
                    onClose={() => setShowFeatureModal(false)}
                    open={showFeatureModal}
                    onSubmit={(data: { title: string; description: string; }) => CreateNewDevOpsElement(data.title, data.description)} />}



            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm flex-[2] flex flex-col min-h-0">
                {/* Header */}
                <div className="flex items-start justify-between gap-4 border-b border-slate-100 p-5 flex-shrink-0">
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
                <div className="p-5 flex-1 min-h-0 flex flex-col">
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
                    </div>
                    {displayedElement && (
                        <div className="mt-4 flex-1 min-h-0">

                            <DevOpsTasksInfoPanel
                                type={displayedElement.type}
                                title={displayedElement.data.title}
                                description={displayedElement.data.description}
                                asignee={displayedElement.data.Assignee}

                            />
                        </div>

                    )}
                </div>

            </div>
            <div className="flex-1 min-h-0 max-h-[calc(100vh-160px)]">
                <TasksDisplayPanel features={features} onClick={onActionTaskClick} onRemove={(type) => onTaskRemove(type)} onCreateNewElementClick={(type, parentId) => onCreateNewElementClickHandler(type, parentId)} />
            </div>
        </div>
    );
};


function DevOpsTasksInfoPanel({ type, title, description, asignee }: { type: string; title: string; description: string; asignee: Assignee | undefined }) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm w-full h-full flex flex-col p-6 min-h-0">

            {/* Header */}
            <h1 className="text-lg font-semibold text-slate-900 mb-6 flex-shrink-0">
                {type} - {title}
            </h1>

            {/* Scrollable content */}
            <div className="flex-1 min-h-0 overflow-y-auto">
                <div className="space-y-4">
                    {type && title ? (
                        <>
                            <div>
                                <span className="inline-block px-2 py-1 text-xs font-medium text-slate-600 bg-slate-100 rounded">
                                    {type}
                                </span>
                            </div>

                            {/* <h2 className="text-base font-semibold text-slate-900">
                                {title}
                            </h2> */}
                        </>
                    ) : (
                        <p className="text-sm text-slate-500">
                            Select a task from the list to see more details here.
                        </p>
                    )}

                    <div className="mt-4 pt-4 border-t border-slate-200">
                        <h3 className="text-sm font-semibold text-slate-900 mb-2">
                            Description
                        </h3>
                        <p className="text-sm text-slate-600 leading-relaxed">
                            {description}
                        </p>
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-slate-700">
                            {asignee ? "Assignee" : "Choose assignee"}
                        </label>

                        <div className="relative">
                            <select
                                className="
                                    w-full appearance-none rounded-lg border border-slate-200
                                    bg-white px-3 py-2.5 pr-9 text-sm text-slate-900
                                    shadow-sm outline-none transition
                                    focus:border-slate-300 focus:ring-4 focus:ring-blue-100
                                    disabled:bg-slate-50 disabled:text-slate-500
                                "
                                defaultValue=""
                            >
                                <option value="" disabled>
                                    Select assignee
                                </option>
                                {/* map assignees here */}
                            </select>

                            {/* Chevron icon */}
                            <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-slate-400">
                                <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                                    <path
                                        fillRule="evenodd"
                                        d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                            </div>
                        </div>

                        {asignee && (
                            <p className="text-xs text-slate-500">
                                Currently assigned to <span className="font-medium">No asignee</span>
                            </p>
                        )}
                        <div>
                            <select name="" id="">
                                <option value="">
                                    Select Work Item Type
                                </option>
                            </select>
                        </div>
                    </div>
                    

                </div>
            </div>
        </div>
    );
}


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
