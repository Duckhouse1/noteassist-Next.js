import { useContext, useEffect, useRef, useState } from "react";
import { UserConfigContext, clientIsFromTeams } from "@/app/Contexts";
import { useSessionStorageState } from "@/app/Components/Hooks/useSessionStorage";
import { useElementTree } from "@/app/Components/Hooks/useElementTree";
import { ClickUpSpace, ClickUpList, ClickUpElements, ClickUpTaskType } from "@/lib/Integrations/ClickUp/Configuration";
import { ClickUpTaskPane } from "./ClickUpTaskPane";
import { ClickUpTaskInfoPanel } from "./ClickUpTaskInfoPanel";
import ClickUpFetchFunctions from "@/lib/Integrations/ClickUp/FetchFunctions";

export default function ClickUpPreBody({ integrationKey }: { integrationKey: string }) {
    const { configs } = useContext(UserConfigContext);
    const { fromTeams } = useContext(clientIsFromTeams);
    const s = (normal: string, small: string) => fromTeams ? small : normal;

    const [error, setError] = useState<string | null>(null);

    const clickUpConfig = configs.find(c => c.provider === "clickup")?.config;
    const defaultSpaceId = clickUpConfig?.DefaultSpaceID?.trim() ?? "";
    const defaultListId = clickUpConfig?.DefaultListID?.trim() ?? "";

    const tree = useElementTree<ClickUpElements>({
        integrationKey,
        storagePrefix: "clickup",
        responseType: "clickup_tasks",
        extractElements: (r) => r.type === "clickup_tasks" ? r.content.elements : [],
        buildResponse: (elements) => ({ type: "clickup_tasks", content: { elements } }),
    });

    const { value: spaces, setValue: setSpaces } = useSessionStorageState<ClickUpSpace[]>({
        key: `clickup:spaces:${integrationKey}`,
        initialValue: [],
    });
    const { value: lists, setValue: setLists } = useSessionStorageState<ClickUpList[]>({
        key: `clickup:lists:${integrationKey}`,
        initialValue: [],
    });

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                setError(null);
                const data = await ClickUpFetchFunctions.FetchClickUpWorkspaceSpaceLists();
                if (cancelled) return;
                setSpaces(data.spaces);
                setLists(data.lists);
            } catch {
                if (!cancelled) setError("Could not load ClickUp data.");
            }
        })();
        return () => { cancelled = true; };
    }, []);

    const didApplyDefaults = useRef(false);
    useEffect(() => {
        if (didApplyDefaults.current || spaces.length === 0) return;
        const defSpace = spaces.find(s => s.id === defaultSpaceId);
        const defList = lists.find(l => l.id === defaultListId);
        if (!defSpace && !defList) return;

        tree.applyToTree(n => ({
            ...n,
            space: n.space?.id ? n.space : defSpace ?? n.space,
            list: n.list?.id ? n.list : defList ?? n.list,
        }));
        didApplyDefaults.current = true;
    }, [spaces, lists]);

    const makeNewElement = (type: ClickUpTaskType): ClickUpElements => ({
        id: crypto.randomUUID(),
        type,
        title: `New ${type}`,
        description: "",
        children: [],
        space: spaces.find(s => s.id === defaultSpaceId),
        list: lists.find(l => l.id === defaultListId),
    });

    const onSpaceChange = async (spaceId: string) => {
        const picked = spaces.find(s => s.id === spaceId);
        if (!picked || !tree.selectedElement) return;
        tree.update(tree.selectedElement.data.id, { space: picked, list: undefined } as Partial<ClickUpElements>);
        try {
            const res = await fetch(`/api/integrations/ClickUp/lists?space=${encodeURIComponent(spaceId)}`);
            if (res.ok) {
                const json = await res.json();
                setLists(json?.lists?.map((l: { id: string; name: string }) => ({ id: String(l.id), name: l.name })) ?? []);
            }
        } catch { /* keep existing lists */ }
    };

    return (
        <div className="w-full flex flex-col lg:flex-row gap-2 items-stretch lg:h-[64vh] min-h-0">

            <div className="min-w-0 lg:flex-[3] lg:max-h-[calc(100vh-160px)]">
                <ClickUpTaskPane
                    elements={tree.elements}
                    onClick={tree.select}
                    onRemove={(a) => tree.remove(a.id)}
                    onAddTask={() => tree.addRoot(makeNewElement("Task"))}
                    onAddSubtask={(parentId) => tree.addChild(parentId, makeNewElement("subtask"))}
                    selectedElement={tree.selectedElement}
                />
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm lg:flex-[6] flex flex-col min-h-0">
                <div className={`flex items-center justify-between gap-2 border-b border-slate-100 flex-shrink-0 ${s("px-4 py-2.5", "px-3 py-1.5")}`}>
                    <div className="flex items-center gap-2">
                        <div className={`grid place-items-center rounded-lg ${s("h-8 w-8", "h-6 w-6")}`}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M3.5 17.5L7.5 13.5C9.5 16.5 14.5 16.5 16.5 13.5L20.5 17.5C17 22.5 7 22.5 3.5 17.5Z" fill="url(#cu_h_1)" />
                                <path d="M7.5 10.5L12 15L16.5 10.5L20 14C17 19 7 19 4 14L7.5 10.5Z" fill="url(#cu_h_2)" />
                                <path d="M12 3L4 11L7.5 14L12 9.5L16.5 14L20 11L12 3Z" fill="url(#cu_h_3)" />
                                <defs>
                                    <linearGradient id="cu_h_1" x1="12" y1="13" x2="12" y2="22" gradientUnits="userSpaceOnUse">
                                        <stop stopColor="#8930FD" />
                                        <stop offset="1" stopColor="#49CCF9" />
                                    </linearGradient>
                                    <linearGradient id="cu_h_3" x1="12" y1="3" x2="12" y2="14" gradientUnits="userSpaceOnUse">
                                        <stop stopColor="#FFB800" />
                                        <stop offset="1" stopColor="#FF5F6C" />
                                    </linearGradient>
                                </defs>
                            </svg>
                        </div>
                        <h2 className={`font-semibold text-slate-900 ${s("text-base", "text-sm")}`}>ClickUp</h2>
                    </div>

                    <button
                        title="Fetches latest data from your ClickUp"
                        className={`inline-flex items-center gap-1.5 rounded-lg border border-slate-200 font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 active:bg-slate-100 transition ${s("px-2.5 py-1.5 text-xs", "px-2 py-1 text-xs")}`}
                    >
                        Refresh ClickUp data
                    </button>
                </div>

                <div className={`flex-1 min-h-0 flex flex-col ${s("p-5", "p-3")}`}>
                    {error && (
                        <div className={`rounded-xl border border-rose-200 bg-rose-50 text-rose-700 ${s("mb-4 px-4 py-3 text-sm", "mb-2 px-3 py-2 text-xs")}`}>
                            {error}
                        </div>
                    )}
                    {tree.selectedElement ? (
                        <ClickUpTaskInfoPanel
                            selectedElement={tree.selectedElement}
                            availableSpaces={spaces}
                            availableLists={lists}
                            onDataChange={(patch) => tree.update(tree.selectedElement!.data.id, patch)}
                            onSpaceChange={onSpaceChange}
                        />
                    ) : (
                        <div className="flex flex-1 items-center justify-center">
                            <div className={`flex max-w-sm flex-col items-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 text-center ${s("gap-4 px-6 py-8", "gap-2 px-4 py-5")}`}>
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M3.5 17.5L7.5 13.5C9.5 16.5 14.5 16.5 16.5 13.5L20.5 17.5C17 22.5 7 22.5 3.5 17.5Z" fill="url(#cu_e_1)" />
                                    <path d="M12 3L4 11L7.5 14L12 9.5L16.5 14L20 11L12 3Z" fill="url(#cu_e_2)" />
                                    <defs>
                                        <linearGradient id="cu_e_1" x1="12" y1="13" x2="12" y2="22" gradientUnits="userSpaceOnUse">
                                            <stop stopColor="#8930FD" />
                                            <stop offset="1" stopColor="#49CCF9" />
                                        </linearGradient>
                                        <linearGradient id="cu_e_2" x1="12" y1="3" x2="12" y2="14" gradientUnits="userSpaceOnUse">
                                            <stop stopColor="#FFB800" />
                                            <stop offset="1" stopColor="#FF5F6C" />
                                        </linearGradient>
                                    </defs>
                                </svg>
                                <div>
                                    <h3 className={`font-semibold text-slate-900 ${s("text-sm", "text-xs")}`}>Select a task to get started</h3>
                                    <p className={`mt-1 text-slate-600 ${s("text-sm", "text-xs")}`}>Choose a Task or Subtask from the list to view and edit its details.</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}