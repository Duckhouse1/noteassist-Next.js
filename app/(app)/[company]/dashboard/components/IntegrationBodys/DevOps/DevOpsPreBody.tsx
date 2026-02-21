import { useContext, useEffect, useRef, useState } from "react";
import FetchService from "@/app/Services/DevOpsServices/Fetchservice";
import { Assignee, DevOpsFeature, DevOpsPBI, DevOpsTask } from "@/app/types/OpenAI";
import { DevOpsTaskTypes, TasksDisplayPanel } from "./TaskDisplayPanel";
import { CreateDevopsElementModal } from "./CreateFeatureModal";
import { OpenAIActionSolutionsMapContext, ShowNotesBodyContext } from "@/app/Contexts";
import { DevOpsTasksInfoPanel } from "./TasksInfoPanel";
import { useSessionStorageState } from "@/app/Components/Hooks/useSessionStorage";
import { AzureDevOpsMark } from "@/app/Components/Icons/AzureDevops";


export interface DevOpsProjectsProps {
    id: string;
    name: string;
}
export interface DevOpsArea {
    id: number; // or number
    identifier: string;
    name: string;
    structureType: string;
    path: string;
    hasChildren: boolean;
    children?: DevOpsArea[]
}
export interface DevOpsTeamsProps {
    id: string;
    name: string;
}
export interface DevOpsIteration {
    id: string;
    name: string;
    path: string;
    url: string;
}
export interface DevOpsIterationResponds {
    count: number;
    value: DevOpsIteration[]
}
export interface SelectedElementProps {
    type: DevOpsTaskTypes;
    data: DevOpsFeature | DevOpsPBI | DevOpsTask;
    project?: DevOpsProjectsProps
}

export type RemoveAction =
    | { type: "Feature"; featureId: string }
    | { type: "PBIS"; featureId: string; pbiId: string }
    | { type: "Tasks"; featureId: string; pbiId: string; taskId: string };

export const DevOpsPreBody = ({ integrationKey }: { integrationKey: string }) => {
    const { OpenAISolutionsMap, setOpenAISolutionsMap } = useContext(OpenAIActionSolutionsMapContext);

    const [projects, setProjects] = useState<DevOpsProjectsProps[]>([]);
    const [selectedProject, setSelectedProject] = useState<DevOpsProjectsProps | null>(null);

    const [teams, setTeams] = useState<DevOpsTeamsProps[]>([]);
    // const [selectedTeam, setSelectedTeam] = useState<DevOpsTeamsProps | null>(null);
    // const [sprints, setSprints] = useState<DevOpsSprintProps[]>([]);
    // const [selectedSprint, setSelectedSprint] = useState<DevOpsSprintProps | null>(null);
    // ✅ Needed (you use setDisplayedElement)
    const [selectedElement, setSelectedElement] = useState<SelectedElementProps | null>(null);
    // Pull initial features from the map (if any)
    const saved = OpenAISolutionsMap.get(integrationKey);
    const savedFeatures =
        saved?.type === "devops_tasks" ? saved.content.features : [];
    console.log("saved features");
    console.log(savedFeatures);
    const projectId = selectedElement?.data.Project?.id ? selectedElement?.data.Project?.id : savedFeatures[0]?.Project?.id ?? selectedProject?.id ?? "";

    const { value: allAreas, setValue: setAllAreas } = useSessionStorageState<DevOpsArea | null>({
        key: `devops:areas:${projectId}`,
        initialValue: null,
    });

    const { value: iterations, setValue: setIterations } = useSessionStorageState<DevOpsIteration[]>({
        key: `devops:iterations:${projectId}`,
        initialValue: [],
    });

    const { value: assignees, setValue: setAssignees } = useSessionStorageState<Assignee[]>({
        key: `devops:assignees:${projectId}`,
        initialValue: [],
    });

    // const { show } = useContext(ShowNotesBodyContext);
    // Local editable state
    const [features, setFeatures] = useState<DevOpsFeature[]>(() => savedFeatures);

    const [loadingProjects, setLoadingProjects] = useState(false);
    const [loadingTeams, setLoadingTeams] = useState(false);
    const [loadingSprints, setLoadingSprints] = useState(false);

    const [error, setError] = useState<string | null>(null);

    const [showCreateElement, setShowCreateElementModal] = useState(false);

    const [creatingElement, setCreatingElement] = useState<{
        type: DevOpsTaskTypes;
        parentId: string | null;
    } | null>(null);

    const onActionTaskClick = (el: SelectedElementProps) => {
        setSelectedElement(el);
    };

    // ✅ If integrationKey changes (or you navigate between different integration keys),
    // re-hydrate local state from the map.
    useEffect(() => {
        setFeatures(savedFeatures);
        // Also clear any selected panel state when switching integration
        setSelectedElement(null);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [integrationKey]);

    // ✅ Avoid overwriting map immediately on first mount if you want to treat
    // the map as the source of truth. This prevents a “wipe” if something is not ready.
    const didHydrateRef = useRef(false);

    // When features change, persist back into the map
    useEffect(() => {
        if (!didHydrateRef.current) {
            didHydrateRef.current = true;
            return;
        }

        setOpenAISolutionsMap(integrationKey, {
            type: "devops_tasks",
            content: { features },
        });
    }, [features, integrationKey, setOpenAISolutionsMap]);
    // Fetch projects once
    useEffect(() => {
        let cancelled = false;

        (async () => {
            try {
                setError(null);
                setLoadingProjects(true);
                const p = await FetchService.FetchProjects();
                if (!cancelled) setProjects(p);
            } catch {
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
    const FetchAllTeamsByProjectID = (ProjectID: string) => {
        if (!selectedProject) return;
        (async () => {
            try {
                setError(null);
                setLoadingTeams(true);
                const teams = await FetchService.FetchAllTeamsByProjectID(selectedProject.id);
                setTeams(teams);
            } catch {
                setError("Could not load teams for that project.");
            } finally {
                setLoadingTeams(false);
            }
        })();
    }
    const FetchAllAssigneesByProjectID = (ProjectID: string) => {
        if (!selectedProject) return;

        (async () => {
            try {
                const TeamMembers = await FetchService.FetchAllTeamMembersByProjectID(selectedProject.id)
                console.log("Assignees:");
                console.log(TeamMembers);
                setAssignees(TeamMembers)
            } catch (error) {
                console.log("Erroe fetching Assignees: " + error);
            }
        })();
    }
    useEffect(() => {
        if (!selectedProject) return;

        let cancelled = false;

        (async () => {
            try {
                setError(null);
                setLoadingTeams(true);
                const teams = await FetchService.FetchAllTeamsByProjectID(selectedProject.id);

                if (!cancelled) setTeams(teams);
            } catch {
                if (!cancelled) setError("Could not load teams for that project.");
            } finally {
                if (!cancelled) setLoadingTeams(false);
            }
        })();
        (async () => {
            try {
                const TeamMembers = await FetchService.FetchAllTeamMembersByProjectID(selectedProject.id)
                console.log("Team members:");
                console.log(TeamMembers);
                setAssignees(TeamMembers)
            } catch (error) {
                console.log("Erroe fetching TeamMembers: " + error);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [selectedProject]);
    // Fetch sprints when team changes
    // useEffect(() => {
    //     if (!selectedTeam) return;

    //     let cancelled = false;

    //     (async () => {
    //         try {
    //             setError(null);
    //             setLoadingSprints(true);
    //             const s = await FetchService.FetchSprintsByTeam(selectedTeam.id);
    //             if (!cancelled) setSprints(s);
    //         } catch {
    //             if (!cancelled) setError("Could not load sprints for that team.");
    //         } finally {
    //             if (!cancelled) setLoadingSprints(false);
    //         }
    //     })();

    //     return () => {
    //         cancelled = true;
    //     };
    // }, [selectedTeam]);

    const onTaskRemove = (action: RemoveAction) => {
        setFeatures((prev) => {
            switch (action.type) {
                case "Feature":
                    if (action.featureId === selectedElement?.data.id) {
                        setSelectedElement(null)
                    }
                    return prev.filter((f) => f.id !== action.featureId);

                case "PBIS":
                    if (action.pbiId === selectedElement?.data.id) {
                        setSelectedElement(null)
                    }
                    return prev.map((f) =>
                        f.id !== action.featureId ? f : { ...f, pbis: f.pbis.filter((p) => p.id !== action.pbiId) }
                    );

                case "Tasks":
                    if (action.taskId === selectedElement?.data.id) {
                        setSelectedElement(null)
                    }
                    return prev.map((f) =>
                        f.id !== action.featureId
                            ? f
                            : {
                                ...f,
                                pbis: f.pbis.map((p) =>
                                    p.id !== action.pbiId ? p : { ...p, tasks: p.tasks.filter((t) => t.id !== action.taskId) }
                                ),
                            }
                    );
            }
        });
    };

    const onCreateNewElementClickHandler = (type: DevOpsTaskTypes, parentId: string | null) => {
        setCreatingElement({ type, parentId });
        if (type === "Feature") {
            const newFeature: DevOpsFeature = {
                id: crypto.randomUUID(),
                title: "New Feature",
                description: "",
                pbis: []
            }
            features.push(newFeature)
            setSelectedElement({ type: "Feature", data: newFeature })
        } else if (type === "PBI") {
            const newPBI: DevOpsPBI = {
                id: crypto.randomUUID(),
                title: "New PBI",
                description: "",
                tasks: []
            }
            features.find((f) => f.id === parentId)?.pbis.push(newPBI)
            setSelectedElement({ type: "PBI", data: newPBI })
        } else {
            const newTask: DevOpsTask = {
                id: crypto.randomUUID(),
                title: "New Task",
                description: "",
            }
            features.find((f) => f.pbis.find((pbi) => pbi.id === parentId)?.tasks.push(newTask))
            setSelectedElement({ type: "Task", data: newTask })

        }
    };

    const CreateNewDevOpsElement = (title: string, description: string) => {
        setFeatures((prev) => {
            // Create Feature
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
            // Create PBI under Feature
            if (creatingElement?.type === "PBI") {
                const newPBI: DevOpsPBI = {
                    id: crypto.randomUUID(),
                    title,
                    description,
                    tasks: [],
                };
                return prev.map((feature) =>
                    feature.id === creatingElement.parentId
                        ? { ...feature, pbis: [...feature.pbis, newPBI] }
                        : feature
                );
            }
            // Create Task under PBI (parentId = PBI id)
            if (creatingElement?.type === "Task") {
                const newTask: DevOpsTask = {
                    id: crypto.randomUUID(),
                    title,
                    description,
                };
                return prev.map((feature) => ({
                    ...feature,
                    pbis: feature.pbis.map((pbi) =>
                        pbi.id === creatingElement.parentId
                            ? { ...pbi, tasks: [...pbi.tasks, newTask] }
                            : pbi
                    ),
                }));
            }
            return prev;
        });
    };
    const updateElementById = (patch: Partial<DevOpsFeature & DevOpsPBI & DevOpsTask>) => {
        // keep right panel in sync
        if (selectedElement == null) return
        setSelectedElement(prev => {
            if (!prev || prev.data.id !== selectedElement.data.id) return prev;
            return { ...prev, data: { ...prev.data, ...patch } };
        });
        // persist into the features tree
        setFeatures(prev => {
            const id = selectedElement.data.id;
            if (selectedElement.type === "Feature") {
                return prev.map(f => (f.id === id ? { ...f, ...patch } : f));
            }
            if (selectedElement.type === "PBI") {
                return prev.map(f => ({
                    ...f,
                    pbis: f.pbis.map(p => (p.id === id ? { ...p, ...patch } : p)),
                }));
            }
            // Task
            return prev.map(f => ({
                ...f,
                pbis: f.pbis.map(p => ({
                    ...p,
                    tasks: p.tasks.map(t => (t.id === id ? { ...t, ...patch } : t)),
                })),
            }));
        });
    };
    useEffect(() => {
        console.log("Selected element:");
        console.log(selectedElement);
    }, [selectedElement])

    //Spørgsmål til ørbæk;
    // - Bruger i nogensinde epic som work item type?
    // - 

    const onProjectsChange = async (selectedProjectID: string) => {
        console.log("selected project id:" + selectedProjectID);
        const selectedProject: DevOpsProjectsProps | null = projects.find((project) => project.id === selectedProjectID) ?? null
        setSelectedProject(selectedProject)
        updateElementById({ Project: { name: selectedProject!.name, id: selectedProject!.id } })
        const FetchedAreas = await FetchService.FetchAllAreasProjectID(selectedProjectID)
        if (FetchedAreas != null) {
            setAllAreas(FetchedAreas)
        }
        const FetchedIterations = await FetchService.FetchAllIterationsByProjectID(selectedProjectID)
        setIterations(FetchedIterations)
    }

    //This is so that areas, iterations and Assignees are persisten (gider ikke til at have dem i parent)
    // useEffect(() => {
    //     console.log("persist areas, iterations and assignees useEffect");
    //     const projectId = selectedElement?.data?.Project?.id;
    //     if (!projectId) return;

    //     // Ensure selectedProject is set so the "teams effect" runs (assignees)
    //     const p = projects.find(pr => pr.id === projectId) ?? null;
    //     setSelectedProject(p);

    //     // Fetch areas + iterations directly (since these are project-scoped)
    //     (async () => {
    //         try {
    //             console.log("fethcing it all");
    //             const [FetchedAreas, FetchedIterations] = await Promise.all([
    //                 FetchService.FetchAllAreasProjectID(projectId),
    //                 FetchService.FetchAllIterationsByProjectID(projectId),
    //             ]);
    //             setAllAreas(FetchedAreas);
    //             setIterations(FetchedIterations);
    //         } catch (e) {
    //             console.log("Error rehydrating project-scoped data:", e);
    //         }
    //     })();
    // }, [selectedElement?.data?.Project?.id, projects]);'

    //This is for when the user clicks next or clicks the circles in the header to navigate between the actions
    //Then the meta data should refetch since this components unmounts
    const RefetchData = async () => {
        if (!projectId) return;

        try {
            const [FetchedAreas, FetchedIterations, FetchedAssignees] = await Promise.all([
                FetchService.FetchAllAreasProjectID(projectId),
                FetchService.FetchAllIterationsByProjectID(projectId),
                FetchService.FetchAllTeamMembersByProjectID(projectId),
            ]);

            setAllAreas(FetchedAreas);
            setIterations(FetchedIterations);
            setAssignees(FetchedAssignees);
        } catch (e) {
            console.log("Error reFetching data:", e);
        }
    };

    return (
        <div className="w-full flex flex-row gap-2 items-stretch h-[64vh] min-h-0">
            {/* {showCreateElement && creatingElement && (
                <CreateDevopsElementModal
                    type={creatingElement.type}
                    onClose={() => setShowCreateElementModal(false)}
                    open={showCreateElement}
                    onSubmit={(data: { title: string; description: string }) =>
                        CreateNewDevOpsElement(data.title, data.description)
                    }
                />
            )} */}
            <div className="flex-3 min-w-0 min-h-0 max-h-[calc(100vh-160px)]">
                <TasksDisplayPanel
                    features={features}
                    onClick={onActionTaskClick}
                    onRemove={onTaskRemove}
                    onCreateNewElementClick={onCreateNewElementClickHandler}
                    selectedElement={selectedElement}
                />
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm flex-[6] flex flex-col min-h-0">
                {/* Header */}
                <div className="flex items-center justify-between gap-2 border-b border-slate-100 px-4 py-2.5 flex-shrink-0">
                    <div className="flex items-center gap-2">
                        <div className="grid h-8 w-8 place-items-center rounded-lg text-white">
                            <AzureDevOpsMark />
                        </div>
                        <h2 className="text-base font-semibold text-slate-900">
                            Azure DevOps
                        </h2>
                    </div>

                    <button
                        title="Fetches latest data from your Azure DevOps"
                        className="
      inline-flex items-center gap-1.5
      rounded-lg border border-slate-200
      px-2.5 py-1.5
      text-xs font-medium text-slate-600
      hover:bg-slate-50 hover:text-slate-900
      active:bg-slate-100
      transition
    "
                    >
                        Refresh DevOps data
                    </button>
                </div>

                {/* Body */}
                <div className="p-5 flex-1 min-h-0 flex flex-col">
                    {error && (
                        <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                            {error}
                        </div>
                    )}

                    {selectedElement ? (
                        <div className="mt-0 flex-1 min-h-0">
                            <DevOpsTasksInfoPanel
                                selectedElement={selectedElement}
                                AvailableAreas={allAreas}
                                AvailableAssignees={assignees}
                                AvailableProjects={projects}
                                AvailableIterations={iterations}
                                onDataChange={updateElementById}
                                onProjectChange={onProjectsChange}
                            // refetchData={() => RefetchData()}
                            />
                        </div>
                    ) : (
                        <div className="flex flex-1 items-center justify-center">
                            <div className="flex max-w-sm flex-col items-center gap-4 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-8 text-center">
                                {/* Icon */}
                                <AzureDevOpsMark />

                                {/* Text */}
                                <div>
                                    <h3 className="text-sm font-semibold text-slate-900">
                                        Select an item to get started
                                    </h3>
                                    <p className="mt-1 text-sm text-slate-600">
                                        Choose a Feature, PBI, or Task from the list to view and edit its
                                        metadata.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
