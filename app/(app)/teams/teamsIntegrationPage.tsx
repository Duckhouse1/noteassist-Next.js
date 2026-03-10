"use client";

import { useContext, useMemo, useRef, useState } from "react";
import { AllIntegrationOptions } from "@/lib/Integrations/Catalog";
import type { IntegrationOption } from "@/lib/Integrations/Types";
import { DEFAULT_WORKSPACE_CONFIG, WorkspaceConfig } from "@/lib/Integrations/WorkSpaceConfig";
import { IntegrationStateContext } from "@/app/Contexts/IntegrationStateContext";
import { ProviderConfigItem } from "@/lib/Integrations/ProviderUserConfigs";
import IntegrationOptionView from "@/app/Components/IntegrationOptionView";
import Image from "next/image";

interface TeamsIntegrationsPageProps {
  company: string;
}

export default function TeamsIntegrationsPage({ company }: TeamsIntegrationsPageProps) {
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

  const connectionForSelected = useMemo(() => {
    if (!selectedCard) return null;
    const ui = selectedCard.providerId.toLowerCase();
    return connections.find((c) => (c.provider ?? "").toLowerCase() === ui) ?? null;
  }, [connections, selectedCard]);

  const configItemForSelected = useMemo<ProviderConfigItem | null>(() => {
    if (!integrationState || !connectionForSelected) return null;
    return integrationState.configs.find((c) => c.connectionId === connectionForSelected.id) ?? null;
  }, [integrationState, connectionForSelected]);

  function toggleAction(provider: IntegrationOption["providerId"], actionKey: string) {
    setDirty(true);
    setSaved(false);
    setIntegrationState((prev) => {
      if (!prev) return prev;
      const prevWs = prev.workspace?.config ?? DEFAULT_WORKSPACE_CONFIG;
      const providerMap = prevWs.enabledActions?.[provider] ?? {};
      const current = !!providerMap[actionKey];
      const nextWs: WorkspaceConfig = {
        ...prevWs,
        enabledActions: {
          ...prevWs.enabledActions,
          [provider]: { ...providerMap, [actionKey]: !current },
        },
      };
      return { ...prev, workspace: { ...prev.workspace, config: nextWs } };
    });
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
          case "clickup":
            return { ...c, config: updateConfigObject(c.config, key, value) };
          default:
            return c;
        }
      }) as ProviderConfigItem[];
      return { ...prev, configs: nextConfigs };
    });
  }

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch(`/api/user/workspace-config?org=${encodeURIComponent(company)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(workspaceCfg),
      });
      if (!res.ok) throw new Error("Failed saving workspace config");

      if (connectionForSelected && configItemForSelected) {
        const res2 = await fetch(`/api/user/Integrations/userConfig?org=${encodeURIComponent(company)}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            connectionId: connectionForSelected.id,
            provider: configItemForSelected.provider,
            config: configItemForSelected.config,
          }),
        });
        if (!res2.ok) throw new Error("Failed saving provider config");
      }

      setDirty(false);
      setSaved(true);
      if (savedRef.current) clearTimeout(savedRef.current);
      savedRef.current = setTimeout(() => setSaved(false), 3000);
    } finally {
      setSaving(false);
    }
  }

  const onDisconnectClick = async () => {
    try {
      const response = await fetch("/api/user/IntegrationConnections", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider: selectedCard?.providerId }),
      });
      if (!response.ok) throw Error("Error disconnecting");
      const newConnections =
        integrationState?.connections.filter((c) => c.provider !== selectedCard?.providerId) ?? [];
      setIntegrationState((prev) => (prev ? { ...prev, connections: newConnections } : prev));
      setSelectedCard(null);
    } catch (error) {
      console.log("Error disconnecting: " + error);
    }
  };

  return (
    <div className="h-full flex flex-col bg-[#F5F5F5] overflow-hidden">
      {/* Header */}
      <div className="bg-white px-4 pt-4 pb-3 border-b border-slate-100">
        {selectedCard ? (
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSelectedCard(null)}
              className="flex items-center gap-1 text-xs text-slate-500 cursor-pointer"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 19 5 12 12 5" />
              </svg>
              All integrations
            </button>
            {dirty && (
              <button
                onClick={handleSave}
                disabled={saving}
                className="text-xs bg-black text-white px-3 py-1.5 rounded-lg font-semibold cursor-pointer disabled:opacity-50"
              >
                {saving ? "Saving…" : saved ? "Saved ✓" : "Save"}
              </button>
            )}
            {!dirty && saved && (
              <span className="text-xs text-emerald-600 font-medium">Saved ✓</span>
            )}
          </div>
        ) : (
          <div>
            <h1 className="text-base font-bold tracking-tight text-slate-900">Integrations</h1>
            <p className="text-xs text-slate-400 mt-0.5">Connect your tools to unlock actions</p>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {!selectedCard ? (
          /* Integration list */
          <div className="px-4 py-3 flex flex-col gap-2">
            {AllIntegrationOptions.map((card) => {
              const isConnected = connections.some(
                (c) => (c.provider ?? "").toLowerCase() === card.providerId.toLowerCase()
              );
              return (
                <button
                  key={card.providerId}
                  type="button"
                  onClick={() => setSelectedCard(card)}
                  className="w-full flex items-center gap-3 bg-white rounded-xl border border-slate-100 p-3 text-left cursor-pointer"
                >
                  {card.iconURL ? (
                    <div className="h-9 w-9 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center p-1.5 flex-shrink-0">
                      <Image
                        src={card.iconURL}
                        alt={card.title}
                        width={22}
                        height={22}
                        className="object-contain"
                      />
                    </div>
                  ) : (
                    <div className="h-9 w-9 rounded-xl bg-black flex items-center justify-center flex-shrink-0">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="3" />
                        <path d="M12 1v6m0 6v6m11-7h-6m-6 0H1" />
                      </svg>
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-900">{card.title}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5 truncate">
                      {card.actions.length} action{card.actions.length !== 1 ? "s" : ""} available
                    </p>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span
                      className={[
                        "text-[9px] font-semibold px-2 py-0.5 rounded-full",
                        isConnected
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-slate-100 text-slate-500",
                      ].join(" ")}
                    >
                      {isConnected ? "Connected" : "Not connected"}
                    </span>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          /* Selected integration detail view */
          <div className="px-4 py-3">
            <div className="flex items-center gap-2 mb-3">
              {selectedCard.iconURL ? (
                <div className="h-8 w-8 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center p-1">
                  <Image src={selectedCard.iconURL} alt={selectedCard.title} width={18} height={18} className="object-contain" />
                </div>
              ) : (
                <div className="h-8 w-8 rounded-xl bg-black flex items-center justify-center">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="3" />
                    <path d="M12 1v6m0 6v6m11-7h-6m-6 0H1" />
                  </svg>
                </div>
              )}
              <p className="text-sm font-bold text-slate-900">{selectedCard.title}</p>
            </div>

            <IntegrationOptionView
              option={selectedCard}
              company={company}
              connection={connectionForSelected}
              enabledMap={workspaceCfg.enabledActions?.[selectedCard.providerId] ?? {}}
              onToggleAction={(actionKey) => toggleAction(selectedCard.providerId, actionKey)}
              onConfigChange={updateSelectedProviderConfig}
              configItem={configItemForSelected}
              onDisconnect={onDisconnectClick}
            />
          </div>
        )}
      </div>
    </div>
  );
}