import { useContext, useEffect, useRef, useState } from "react";
import FetchService from "@/app/Services/DevOpsServices/Fetchservice";
import { Assignee, DevOpsElement, DevOpsFeature, DevOpsPBI, DevOpsResponse, DevOpsTask } from "@/app/types/OpenAI";
import { DevOpsTaskTypes, TasksDisplayPanel } from "./TaskDisplayPanel";
import { CreateDevopsElementModal } from "./CreateFeatureModal";
import { OpenAIActionSolutionsMapContext, ShowNotesBodyContext, UserConfigContext } from "@/app/Contexts";
import { DevOpsTasksInfoPanel } from "./TasksInfoPanel";
import { useSessionStorageState } from "@/app/Components/Hooks/useSessionStorage";
import { AzureDevOpsMark } from "@/app/Components/Icons/AzureDevops";
import { defaultConfig } from "next/dist/server/config-shared";
import { WorkItemType } from "@/app/api/integrations/azure-devops/WorkItem/GetWorkItemTypesByProject/route";


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
    type: string;
    data: DevOpsFeature | DevOpsPBI | DevOpsTask;
    project?: DevOpsProjectsProps
}

export type RemoveAction = {
    id: string;
    type: string;
};

export const DevOpsPreBody = ({ integrationKey }: { integrationKey: string }) => {
    const { OpenAISolutionsMap, setOpenAISolutionsMap } = useContext(OpenAIActionSolutionsMapContext);
    const [selectedProject, setSelectedProject] = useState<DevOpsProjectsProps | null>(null);
    const { configs } = useContext(UserConfigContext)


    const [teams, setTeams] = useState<DevOpsTeamsProps[]>([]);

    const [selectedElement, setSelectedElement] = useState<SelectedElementProps | null>(null);
    // Pull initial features from the map (if any)
    const saved = OpenAISolutionsMap.get(integrationKey);
    const savedElements =
        saved?.type === "devops_tasks" ? saved.content.elements : [];
    console.log("saved features");
    console.log(savedElements);
    const projectId = selectedElement?.data.Project?.id ? selectedElement?.data.Project?.id : savedElements[0]?.Project?.id ?? selectedProject?.id ?? "";
    const { value: projects, setValue: setProjects } = useSessionStorageState<DevOpsProjectsProps[]>({
        key: `devops:projects:${integrationKey}`,
        initialValue: []
    });

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
    //ONLY MAYBE vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv
    const { value: elements, setValue: setElements } = useSessionStorageState<DevOpsElement[]>({
        key: `devops:aielements:${integrationKey}`,
        initialValue: savedElements
    })
    const [allWorkItemTypes, SetAllWorkItemTypes] = useState<WorkItemType[]>([])
    const [loadingProjects, setLoadingProjects] = useState(false);
    const [loadingTeams, setLoadingTeams] = useState(false);
    const [loadingSprints, setLoadingSprints] = useState(false);

    const [error, setError] = useState<string | null>(null);

    const [showCreateElement, setShowCreateElementModal] = useState(false);
    const defaultOrg = configs.find(c => c.provider === "azure-devops")?.config.defaultOrganization ?? "";
    const defaultProjectId = (configs.find(c => c.provider === "azure-devops")?.config.defaultProject ?? "").trim();
    const defaultProject = projects.find(p => p.id.trim().toLowerCase() === defaultProjectId.trim().toLowerCase()) ?? null;

    console.log("Default project id: ");
    console.log(defaultProjectId);
    const [creatingElement, setCreatingElement] = useState<{
        type: DevOpsTaskTypes;
        parentId: string | null;
    } | null>(null);
    // const isMounted = useSessionStorageState({
    //     key:`devops:ismounted`,
    //     initialValue:false
    // })
    const didApplyDefaultsRef = useRef(false);


    useEffect(() => {
        if (didApplyDefaultsRef.current) return;
        if (!defaultProject) return;

        setElements(prev => applyDefaultProjectToTree(prev, { id: defaultProject.id, name: defaultProject.name }));

        // ✅ if something is already selected and missing Project, patch that too
        setSelectedElement(prev => {
            if (!prev) return prev;
            if (prev.data.Project?.id) return prev;
            return {
                ...prev,
                data: { ...prev.data, Project: { id: defaultProject.id, name: defaultProject.name } },
            };
        });

        didApplyDefaultsRef.current = true;
    }, [defaultProject]);

    const applyDefaultProjectToTree = (
        nodes: DevOpsElement[],
        defaultProject: { id: string; name: string } | null
    ): DevOpsElement[] => {
        if (!defaultProject) return nodes;

        return nodes.map(n => {
            const hasProject = Boolean(n.Project?.id);

            const next: DevOpsElement = {
                ...n,
                Project: hasProject ? n.Project : { id: defaultProject.id, name: defaultProject.name },
                children: applyDefaultProjectToTree(n.children ?? [], defaultProject),
            };

            return next;
        });
    };
    const onActionTaskClick = (el: SelectedElementProps) => {
        setSelectedElement(el);
    };

    // ✅ If integrationKey changes (or you navigate between different integration keys),
    // re-hydrate local state from the map.
    useEffect(() => {
        didApplyDefaultsRef.current = false;  // ✅ allow defaults to apply again
        setElements(savedElements);
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
            content: { elements },
        });
    }, [elements, integrationKey, setOpenAISolutionsMap]);
    // Fetch projects once
    useEffect(() => {
        // if(isMounted)return
        let cancelled = false;
        // if (projects) return
        (async () => {
            try {
                setError(null);
                setLoadingProjects(true);

                const p = await FetchService.FetchProjects();
                if (cancelled) return;

                setProjects(p);

                // ✅ Apply default project (ONLY if non-empty)
                if (defaultProjectId !== "") {
                    const found = p.find(pr => pr.id === defaultProjectId) ?? null;
                    setSelectedProject(found);
                    const res = await fetch(
                        `/api/integrations/azure-devops/WorkItem/GetWorkItemTypesByProject?projectId=${defaultProjectId}&org=${defaultOrg}`
                    );

                    if (!res.ok) {
                        throw new Error("Failed to fetch work item types");
                    }

                    const data = await res.json();

                    console.log("All WIT:");
                    console.log(data);

                    SetAllWorkItemTypes(data.types);
                    if (found) {
                        // ✅ fetch project-scoped metadata
                        const [areas, iters, members] = await Promise.all([
                            FetchService.FetchAllAreasProjectID(found.id, defaultOrg),
                            FetchService.FetchAllIterationsByProjectID(found.id, defaultOrg),
                            FetchService.FetchAllTeamMembersByProjectID(found.id),
                        ]);

                        if (!cancelled) {
                            if (areas != null) setAllAreas(areas);
                            setIterations(iters ?? []);
                            setAssignees(members ?? []);
                        }
                    }
                }
            } catch {
                if (!cancelled) setError("Could not load projects. Check your DevOps connection.");
            } finally {
                if (!cancelled) setLoadingProjects(false);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [defaultProjectId]);

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
                // console.log("Assignees:");
                // console.log(TeamMembers);
                setAssignees(TeamMembers)
            } catch (error) {
                console.log("Erroe fetching Assignees: " + error);
            }
        })();
    }
    useEffect(() => {
        if (!selectedProject) return;
        // if(isMounted)return
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


    const removeNode = (
        nodes: DevOpsElement[],
        idToRemove: string
    ): DevOpsElement[] => {
        return nodes
            .filter(node => node.id !== idToRemove)
            .map(node => ({
                ...node,
                children: removeNode(node.children ?? [], idToRemove)
            }));
    };
    const handleRemove = (action: RemoveAction) => {
        setElements(prev =>
            prev ? removeNode(prev, action.id) : prev
        );
    };
    const addChildById = (
        nodes: DevOpsElement[],
        parentId: string,
        child: DevOpsElement
    ): DevOpsElement[] => {
        return nodes.map(n => {
            if (n.id === parentId) {
                return { ...n, children: [...(n.children ?? []), child] };
            }
            return { ...n, children: addChildById(n.children ?? [], parentId, child) };
        });
    };
    const onCreateNewElementClickHandler = (type: string, parentId: string | null) => {
        const newNode: DevOpsElement = {
            id: crypto.randomUUID(),
            type,
            title: `New ${type}`,
            description: "",
            children: [],
        };

        setElements(prev => {
            if (!parentId) {
                return [...prev, newNode];
            }
            return addChildById(prev, parentId, newNode);
        });

        setSelectedElement({ type, data: newNode });
    };

    const updateNodeById = (
        nodes: DevOpsElement[],
        id: string,
        patch: Partial<DevOpsElement>
    ): DevOpsElement[] => {
        return nodes.map(n => {
            if (n.id === id) return { ...n, ...patch };
            return { ...n, children: updateNodeById(n.children ?? [], id, patch) };
        });
    };
    const updateById = (id: string, patch: Partial<DevOpsElement>) => {
        setSelectedElement(prev => {
            if (!prev || prev.data.id !== id) return prev;
            return { ...prev, data: { ...prev.data, ...patch } };
        });

        setElements(prev => updateNodeById(prev, id, patch));
    };
    useEffect(() => {
        console.log("Selected element:");
        console.log(selectedElement);
    }, [selectedElement])


    const onProjectsChange = async (selectedProjectID: string) => {
        const picked = projects.find(p => p.id === selectedProjectID) ?? null;
        setSelectedProject(picked);

        // ✅ Update the selected element’s Project field
        if (picked && selectedElement) {
            updateById(selectedElement.data.id, {
                Project: { id: picked.id, name: picked.name },
            });
        }

        // ✅ Fetch metadata for dropdowns
        const [FetchedAreas, FetchedIterations] = await Promise.all([
            FetchService.FetchAllAreasProjectID(selectedProjectID, defaultOrg),
            FetchService.FetchAllIterationsByProjectID(selectedProjectID, defaultOrg),
        ]);

        if (FetchedAreas != null) setAllAreas(FetchedAreas);
        setIterations(FetchedIterations ?? []);
    };

    //This is for when the user clicks next or clicks the circles in the header to navigate between the actions
    //Then the meta data should refetch since this components unmounts
    const RefetchData = async () => {
        if (!projectId) return;

        try {
            const [FetchedAreas, FetchedIterations, FetchedAssignees] = await Promise.all([
                FetchService.FetchAllAreasProjectID(projectId, defaultOrg),
                FetchService.FetchAllIterationsByProjectID(projectId, defaultOrg),
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
            <div className="flex-3 min-w-0 max-h-[calc(100vh-160px)]">
                <TasksDisplayPanel
                    elements={elements}
                    onClick={onActionTaskClick}
                    onRemove={handleRemove}
                    onCreateNewElementClick={onCreateNewElementClickHandler}
                    selectedElement={selectedElement}
                    possibleWIT={allWorkItemTypes}
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
                                DefaultElements={{ DefaultProjectName: defaultProjectId ?? "", defaultOrganizationName: defaultOrg ?? "" }}
                                selectedElement={selectedElement}
                                AvailableAreas={allAreas}
                                AvailableAssignees={assignees}
                                AvailableProjects={projects}
                                AvailableIterations={iterations}
                                onDataChange={(patch) => updateById(selectedElement.data.id, patch)}
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
