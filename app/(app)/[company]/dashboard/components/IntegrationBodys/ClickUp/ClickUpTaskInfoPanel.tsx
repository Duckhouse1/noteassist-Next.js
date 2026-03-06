import { SelectedElement } from "@/app/Components/Hooks/useElementTree";
import { ClickUpElements, ClickUpSpace, ClickUpList } from "@/lib/Integrations/ClickUp/Configuration";
import { useEffect, useRef } from "react";

type ClickUpTaskInfoPanelProps = {
    selectedElement: SelectedElement<ClickUpElements>;
    availableSpaces: ClickUpSpace[];
    availableLists: ClickUpList[];
    onDataChange: (patch: Partial<ClickUpElements>) => void;
    onSpaceChange: (spaceId: string) => void;
};

export function ClickUpTaskInfoPanel({
    selectedElement,
    availableSpaces,
    availableLists,
    onDataChange,
    onSpaceChange,
}: ClickUpTaskInfoPanelProps) {
    const hasTask = Boolean(selectedElement.data.title);
    const titleInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (selectedElement.data.title.startsWith("New") || selectedElement.data.title.length <= 0) {
            titleInputRef.current?.focus();
        }
    }, [selectedElement]);

    return (
        <div className="w-full h-full min-h-0 rounded-2xl flex flex-col">
            <div className="flex-1 min-h-0 overflow-y-hidden px-2 pb-6 pt-0">
                <div className="flex flex-col gap-3">
                    {/* Title */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">
                            Title
                        </label>
                        <input
                            ref={titleInputRef}
                            value={selectedElement.data.title}
                            onChange={(e) => onDataChange({ title: e.target.value })}
                            className="
                                w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900
                                shadow-sm outline-none transition
                                focus:border-slate-300 focus:ring-4 focus:ring-blue-100
                                disabled:bg-slate-50 disabled:text-slate-500
                            "
                            placeholder="Title…"
                        />
                    </div>

                    {/* Meta: Space + List */}
                    {selectedElement.data.type == "Task" && (
                        <div className="rounded-xl border border-slate-200 bg-slate-50 p-2">
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                {/* Space */}
                                <div className="space-y-1.5">
                                    <label className="text-xs font-medium text-slate-500">Space</label>
                                    <select
                                        disabled={!hasTask}
                                        value={selectedElement.data.space?.id ?? ""}
                                        onChange={(e) => onSpaceChange(e.currentTarget.value)}
                                        className="
                                        w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900
                                        shadow-sm outline-none transition
                                        focus:border-slate-300 focus:ring-4 focus:ring-blue-100
                                        disabled:bg-slate-50 disabled:text-slate-500
                                    "
                                    >
                                        <option value="" disabled>
                                            Select space
                                        </option>
                                        {availableSpaces.map((space) => (
                                            <option value={space.id} key={space.id}>
                                                {space.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* List */}
                                <div className="space-y-1.5">
                                    <label className="text-xs font-medium text-slate-500 flex gap-1">
                                        List {!selectedElement.data.space ? <p className="text-xs text-slate-400"> - Select a space first</p> : ""}
                                    </label>
                                    <select
                                        disabled={!hasTask || !selectedElement.data.space}
                                        value={selectedElement.data.list?.id ?? ""}
                                        onChange={(e) => {
                                            const picked = availableLists.find((l) => l.id === e.currentTarget.value);
                                            if (picked) onDataChange({ list: picked });
                                        }}
                                        className="
                                        w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900
                                        shadow-sm outline-none transition
                                        focus:border-slate-300 focus:ring-4 focus:ring-blue-100
                                        disabled:bg-slate-50 disabled:text-slate-500
                                    "
                                    >
                                        <option value="" disabled>
                                            Select list
                                        </option>
                                        {availableLists.map((list) => (
                                            <option value={list.id} key={list.id}>
                                                {list.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>
                     )} 


                    {/* Description */}
                    <div>
                        <h3 className="text-sm text-slate-900">Description</h3>
                        <div className="pt-2">
                            <textarea
                                style={{ resize: "none" }}
                                disabled={!hasTask}
                                value={selectedElement.data.description}
                                onChange={(e) => onDataChange({ description: e.currentTarget.value })}
                                className="
                                    min-h-[180px] w-full resize-y rounded-lg border border-slate-200 bg-white px-3 py-2.5
                                    text-sm text-slate-900 shadow-sm outline-none transition
                                    focus:border-slate-300 focus:ring-4 focus:ring-blue-100
                                    disabled:bg-slate-50 disabled:text-slate-500
                                "
                                placeholder="Write a description…"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}