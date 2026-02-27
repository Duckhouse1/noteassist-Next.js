"use client";

import { useContext, useMemo, useRef, useState } from "react";
import IntegrationOptionCard from "@/app/Components/IntegrationOptionCard";
import IntegrationOptionView from "@/app/Components/IntegrationOptionView";
import { AllIntegrationOptions } from "@/lib/Integrations/Catalog";
import type { IntegrationOption } from "@/lib/Integrations/Types";
import { DEFAULT_WORKSPACE_CONFIG, WorkspaceConfig } from "@/lib/Integrations/WorkSpaceConfig";
import { IntegrationStateContext } from "@/app/Contexts/IntegrationStateContext";
import { ProviderConfigItem } from "@/lib/Integrations/ProviderUserConfigs";

interface IntegrationPageProps {
  company: string;
}
type ProviderConfigItemOrNull = ProviderConfigItem | null;

export default function IntegrationsPage({ company }: IntegrationPageProps) {
  const [selectedCard, setSelectedCard] = useState<IntegrationOption | null>(null);
  const { integrationState, setIntegrationState } = useContext(IntegrationStateContext);

  const connections = integrationState?.connections ?? [];
  const workspaceCfg: WorkspaceConfig = integrationState?.workspace?.config ?? DEFAULT_WORKSPACE_CONFIG;

  const [dirty, setDirty] = useState(false);

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const savedRef = useRef<NodeJS.Timeout | null>(null);

  function updateConfigObject<T extends object>(cfg: T, key: string, value: unknown): T {
    return { ...(cfg as Record<string, unknown>), [key]: value } as T;
  }

  function updateSelectedProviderConfig(key: string, value: unknown) {
    if (!connectionForSelected) return;

    setDirty(true);
    setSaved(false);

    setIntegrationState((prev) => {
      if (!prev) return prev;

      const targetId = connectionForSelected.id;

      const nextConfigs = prev.configs.map((c) => {
        if (c.connectionId !== targetId) return c;

        switch (c.provider) {
          case "azure-devops":
            return { ...c, config: updateConfigObject(c.config, key, value) };
          case "outlook":
            return { ...c, config: updateConfigObject(c.config, key, value) };
          case "sharepoint":
            return { ...c, config: updateConfigObject(c.config, key, value) };
          case "jira":
            return { ...c, config: updateConfigObject(c.config, key, value) };
          default:
            // exhaustive safety (should never happen)
            return c;
        }
      });

      return { ...prev, configs: nextConfigs };
    });
  }

  const connectionForSelected = useMemo(() => {
    if (!selectedCard) return null;
    const ui = selectedCard.providerId.toLowerCase();
    return connections.find((c) => (c.provider ?? "").toLowerCase() === ui) ?? null;
  }, [connections, selectedCard]);

  function toggleAction(provider: IntegrationOption["providerId"], actionKey: string) {
    setDirty(true);
    setSaved(false);

    // update context state (source of truth)
    setIntegrationState((prev) => {
      if (!prev) return prev;

      const prevWs = prev.workspace?.config ?? DEFAULT_WORKSPACE_CONFIG;
      const providerMap = prevWs.enabledActions?.[provider] ?? {};
      const current = !!providerMap[actionKey];

      const nextWs: WorkspaceConfig = {
        ...prevWs,
        enabledActions: {
          ...prevWs.enabledActions,
          [provider]: {
            ...providerMap,
            [actionKey]: !current,
          },
        },
      };

      return {
        ...prev,
        workspace: {
          ...prev.workspace,
          config: nextWs,
        },
      };
    });
  }
  const configItemForSelected = useMemo<ProviderConfigItemOrNull>(() => {
    if (!integrationState || !connectionForSelected) return null;
    return (
      integrationState.configs.find((c) => c.connectionId === connectionForSelected.id) ?? null
    );
  }, [integrationState, connectionForSelected]);

  async function handleSave() {
    setSaving(true);
    try {
      // 1) Save workspace toggles
      const res = await fetch(`/api/user/workspace-config?org=${encodeURIComponent(company)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(workspaceCfg),
      });

      if (!res.ok) throw new Error(`Failed saving workspace config (${res.status})`);

      // 2) Save provider config (only if connected + we have a config item)
      if (connectionForSelected && configItemForSelected) {
        const res2 = await fetch(`/api/user/Integrations/userConfig?org=${encodeURIComponent(company)}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            connectionId: connectionForSelected.id,
            provider: configItemForSelected.provider, // typed union in ProviderConfigItem
            config: configItemForSelected.config,
          }),
        });

        if (!res2.ok) throw new Error(`Failed saving provider config (${res2.status})`);
      }

      setDirty(false);
      setSaved(true);
      if (savedRef.current) clearTimeout(savedRef.current);
      savedRef.current = setTimeout(() => setSaved(false), 3000);
    } finally {
      setSaving(false);
    }
  }

  // const configValues: Record<string, unknown> = useMemo(() => {
  //   const cfg = configItemForSelected?.config as unknown;
  //   return (typeof cfg === "object" && cfg !== null && !Array.isArray(cfg))
  //     ? (cfg as Record<string, unknown>)
  //     : {};
  // }, [configItemForSelected]);


  return (
    <div className="bg-white w-full h-full p-10 px-20 flex flex-col overflow-auto">
      <h1 className="text-4xl font-bold tracking-tighter">Integration Configurations</h1>
      <h2 className="text-gray-400">
        Connect Norbit to your other platforms and perform actions
        <br />
        directly from here!
      </h2>

      <div className="pt-10 flex items-start gap-10">
        {/* LEFT */}
        <div className="w-1/2">
          <h1 className="text-gray-400 mb-4">All integrations:</h1>

          <div className="border border-gray-200 rounded-2xl p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {AllIntegrationOptions.map((card) => (
                <IntegrationOptionCard
                  onClick={() => setSelectedCard(card)}
                  card={card}
                  key={card.title}
                />
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div className="w-full flex flex-col gap-4 -mt-2">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold tracking-tight pb-0 mb-0">
              {selectedCard ? `${selectedCard.title} Configurations` : ""}
            </h1>
            {dirty && (
              <div className="flex items-center gap-3">
                {saved && <span className="text-xs font-medium text-emerald-600">Saved</span>}
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={!dirty || saving}
                  className=" cursor-pointer rounded-xl bg-black text-xs font-medium text-white disabled:opacity-50 p-2 hover:bg-gray-800"
                >
                  {saving ? "Saving…" : "Save changes"}
                </button>
              </div>
            )}

          </div>

          {selectedCard ? (
            <IntegrationOptionView
              option={selectedCard}
              company={company}
              connection={connectionForSelected}
              enabledMap={workspaceCfg.enabledActions?.[selectedCard.providerId] ?? {}}
              onToggleAction={(actionKey) => toggleAction(selectedCard.providerId, actionKey)}
              onConfigChange={updateSelectedProviderConfig}
              configItem={configItemForSelected}
            />
          ) : (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-gradient-to-b from-slate-50/80 to-white py-32 px-8">
              <div className="flex items-center gap-1.5 mb-5 opacity-30">
                <div className="h-1 w-1 rounded-full bg-slate-900" />
                <div className="h-1 w-6 rounded-full bg-slate-900" />
                <div className="h-1 w-1 rounded-full bg-slate-900" />
              </div>
              <p className="text-[13px] font-medium tracking-tight text-slate-400">
                Select an integration to configure
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}