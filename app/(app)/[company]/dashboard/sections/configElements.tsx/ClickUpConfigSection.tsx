import { FetchedClickUpData } from "@/lib/Integrations/ClickUp/FetchFunctions"
import { ConfigField } from "./JiraConfigSection"
import { ClickUpSettings } from "@/lib/Integrations/ClickUp/Configuration";


interface ClickUpConfigSectionProps {
    config: ClickUpSettings |undefined
    data: FetchedClickUpData | null;
    onPatch: (patch: Partial<ClickUpSettings>) => void;
}



export default function ClickUpConfigs({ config, data, onPatch }: ClickUpConfigSectionProps) {

    const currentWorkSpace = config?.DefaultWorkSpaceID?.trim() ?? ""
    const currentSpace = config?.DefaultSpaceID?.trim() ?? ""

    const workspaceOptions = data?.workspaces ?? []
    const spaceOptions = data?.spaces?? []
    return (
        <div className="flex flex-col gap-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <ConfigField label="ClickUp Workspace" hint="The default workspace to use">
                    <select
                        className="w-full appearance-none rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 shadow-sm outline-none transition focus:border-gray-400 focus:ring-1 focus:ring-gray-300"
                        value={currentWorkSpace}
                        onChange={(e) => console.log("object")}
                    >
                        <option value="">Select…</option>
                        {workspaceOptions.map((s) => (
                            <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                    </select>
                </ConfigField>

                <ConfigField label="Default Space" hint="Default space to use">
                    <select
                        className="w-full appearance-none rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 shadow-sm outline-none transition focus:border-gray-400 focus:ring-1 focus:ring-gray-300"
                        value={currentSpace}
                        onChange={(e) => console.log("object")}
                    >
                        <option value="">Select…</option>
                        {spaceOptions.map((space) => (
                            <option key={space.id} value={space.id}>{space.name}</option>
                        ))}
                    </select>
                </ConfigField>
            </div>

        </div>
    )
}   