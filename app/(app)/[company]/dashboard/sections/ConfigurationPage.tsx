"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { IntegrationConnection } from "../dashboardClient";
import {
  AzureDevopsSettings,
  DEFAULT_AZURE_DEVOPS_SETTINGS,
  AzureDevopsConfig,
} from "./configElements.tsx/AzureDevopsConfig";
import { GeneralConfig } from "./configElements.tsx/GeneralConfig";
import {
  OutlookSettings,
  DEFAULT_OUTLOOK_SETTINGS,
  OutlookConfig,
} from "./configElements.tsx/OutlookConfig";
import {
  SharePointSettings,
  DEFAULT_SHAREPOINT_SETTINGS,
  SharePointConfig,
} from "./configElements.tsx/SharePointConfig";
import { SaveRequirredContext } from "@/app/Contexts";

/* ───────────────── Types ───────────────── */
export interface IntegrationOptions {
  title: IntegrationOptionsTitle;
  connectionString: string;
}
export type IntegrationOptionsTitle =
  | "Azure-Devops"
  | "Outlook"
  | "SharePoint"
  | "Jira"
  | "Notion";

export type ConfigTabs = IntegrationConnection | "General";

export type ActionKey =
  | "integrations"
  | "email_outlook_draft"
  | "schedule_outlook_meeting";

export type ConfigState = {
  enabledActions: Record<ActionKey, boolean>;
  enabledProviders: IntegrationOptionsTitle[];
  azureDevops: Record<string, AzureDevopsSettings>;
  outlook: Record<string, OutlookSettings>;
  sharePoint: Record<string, SharePointSettings>;
};

/* ───────────────── Defaults ───────────────── */

export const DEFAULT_CONFIG: ConfigState = {
  enabledActions: {
    integrations: true,
    email_outlook_draft: true,
    schedule_outlook_meeting: false,
  },
  enabledProviders: ["Azure-Devops", "Outlook"],
  azureDevops: {},
  outlook: {},
  sharePoint: {},
};

/* ───────────────── Utils ───────────────── */

function getAzureSettings(value: ConfigState, id: string): AzureDevopsSettings {
  return value.azureDevops[id] ?? DEFAULT_AZURE_DEVOPS_SETTINGS;
}
function getOutlookSettings(value: ConfigState, id: string): OutlookSettings {
  return value.outlook[id] ?? DEFAULT_OUTLOOK_SETTINGS;
}
function getSharePointSettings(value: ConfigState, id: string): SharePointSettings {
  return value.sharePoint[id] ?? DEFAULT_SHAREPOINT_SETTINGS;
}
function toggleInArray<T>(arr: T[], item: T) {
  return arr.includes(item)
    ? arr.filter((x) => x !== item)
    : [...arr, item];
}

/* ───────────────── Component ───────────────── */

export function ConfigurationPage({ value, onChange, onSave, company, connections, }: {
  value: ConfigState; onChange: (next: ConfigState) => void; onSave?:
  (config: ConfigState) => void; company: string; connections: IntegrationConnection[];
}) {
  const [saveRequirred, setSaveRequirred] = useState(false)
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const savedRef = useRef<NodeJS.Timeout | null>(null);
  const [currentConfig, setCurrentConfig] = useState<ConfigTabs>("General");

  const providers: IntegrationOptions[] = useMemo(() => [
    { title: "Azure-Devops", connectionString: "/api/integrations/azure-devops/connect", },
    { title: "Outlook", connectionString: "/api/integrations/microsoft-graph/connect", },
    { title: "SharePoint", connectionString: "/api/integrations/microsoft-graph/connect", },
    { title: "Jira", connectionString: "" },
    { title: "Notion", connectionString: "" },
  ], []);

  const connectedSet = useMemo(
    () => new Set(connections.map((c) => c.provider)),
    [connections]
  );

  const connectHref = (p: IntegrationOptions) => {
    const returnTo = `/${company}/dashboard`;
    return `${p.connectionString}?returnTo=${encodeURIComponent(returnTo)}&provider=${p.title}`;
  };

  function setActionEnabled(key: ActionKey, enabled: boolean) {
    setSaved(false);
    onChange({
      ...value,
      enabledActions: { ...value.enabledActions, [key]: enabled },
    });
  }

  function toggleProvider(provider: IntegrationOptions) {
    setSaved(false);
    onChange({
      ...value,
      enabledProviders: toggleInArray(value.enabledProviders, provider.title),
    });
  }

  async function handleSave() {
    setSaving(true);
    try {
      // Persist Azure DevOps configs for each connection
      const azureConnections = connections.filter(
        (c) => c.provider === "Azure-Devops"
      );
      await Promise.all(
        azureConnections.map(async (conn) => {
          const settings = value.azureDevops[conn.id];
          if (!settings) return;
          await fetch(
            "/api/integrations/azure-devops/Configuration",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                org: company,
                connectionId: conn.id,
                config: settings,
              }),
            }
          );
        })
      );

      onSave?.(value);
      setSaved(true);
      if (savedRef.current) clearTimeout(savedRef.current);
      savedRef.current = setTimeout(() => setSaved(false), 3000);
    } finally {
      setSaving(false);
    }
  }

  const onTabSwitch = (newTab: ConfigTabs) => {
    if(saveRequirred){
      //show user he has to save first
      return;
    }
    setCurrentConfig(newTab)
  }

  const activeId = currentConfig === "General" ? "General" : currentConfig.id;
  const enabledCount = Object.values(value.enabledActions).filter(Boolean).length;

  return (
    <div className="min-h-full bg-[#F4F5F7]">
      {/* Page header */}
      <div className="bg-white border-b border-slate-200 px-8 py-5">
        <div className="mx-auto max-w-7xl 2xl:max-w-[1600px] flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">
              Workspace
            </p>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              Configuration
            </h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-6xl px-8 py-8">
        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          {/* Left column */}
          <div className="space-y-5">
            {/* Tab bar */}

            <div className="flex items-center gap-2 flex-wrap">
              <button
                className={[
                  "rounded-lg px-4 py-1.5 text-xs font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-[#1E3A5F] focus:ring-offset-1",
                  activeId === "General"
                    ? "bg-[#1E3A5F] text-white shadow-sm"
                    : "bg-white border border-slate-200 text-slate-600 hover:border-slate-300 shadow-sm",
                ].join(" ")}
                onClick={() => onTabSwitch("General")}
              >
                General
              </button>

              {connections.map((connect) => (
                <button
                  key={connect.id}
                  className={[
                    "rounded-lg px-4 py-1.5 text-xs font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-[#1E3A5F] focus:ring-offset-1",
                    activeId === connect.id
                      ? "bg-[#1E3A5F] text-white shadow-sm"
                      : "bg-white border border-slate-200 text-slate-600 hover:border-slate-300 shadow-sm",
                  ].join(" ")}
                  onClick={() => onTabSwitch(connect)}
                >
                  {connect.displayName}
                </button>
              ))}

              <div className="ml-auto flex items-center gap-3">
                {saved && (
                  <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-600">
                    <svg
                      width="13"
                      height="13"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    Saved
                  </span>
                )}
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="cursor-pointer rounded-lg bg-[#1E3A5F] px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-[#16304F] focus:outline-none focus:ring-2 focus:ring-[#1E3A5F] focus:ring-offset-2 disabled:opacity-60"
                >
                  {saving ? "Saving…" : "Save changes"}
                </button>
              </div>
            </div>

            {/* Tab panels */}
            {currentConfig === "General" && (
              <GeneralConfig
                value={value}
                setActionEnabled={setActionEnabled}
                toggleProvider={toggleProvider}
                providers={providers}
                connectedSet={connectedSet}
              />
            )}
            <SaveRequirredContext.Provider value={{ requirred: saveRequirred, setRequirred: setSaveRequirred }}>

              {currentConfig !== "General" &&
                currentConfig.provider === "Azure-Devops" && (
                  <AzureDevopsConfig
                    // settings={getAzureSettings(value, currentConfig.id)}
                    ADOconnection={connections.find((conn) => conn.provider === "Azure-Devops" as IntegrationOptionsTitle)!}
                    company={company}
                  // onChange={(next) => {
                  //   setSaved(false);
                  //   onChange({
                  //     ...value,
                  //     azureDevops: {
                  //       ...value.azureDevops,
                  //       [currentConfig.id]: next,
                  //     },
                  //   });
                  // }}
                  />
                )}

              {currentConfig !== "General" &&
                currentConfig.provider === "Outlook" && (
                  <OutlookConfig
                    connection={currentConfig}
                    settings={getOutlookSettings(value, currentConfig.id)}
                    onChange={(next) => {
                      setSaved(false);
                      onChange({
                        ...value,
                        outlook: {
                          ...value.outlook,
                          [currentConfig.id]: next,
                        },
                      });
                    }}
                  />
                )}

              {currentConfig !== "General" &&
                currentConfig.provider === "SharePoint" && (
                  <SharePointConfig
                    connection={currentConfig}
                    settings={getSharePointSettings(value, currentConfig.id)}
                    onChange={(next) => {
                      setSaved(false);
                      onChange({
                        ...value,
                        sharePoint: {
                          ...value.sharePoint,
                          [currentConfig.id]: next,
                        },
                      });
                    }}
                  />
                )}
            </SaveRequirredContext.Provider>

          </div>
          {/* Right column */}
          <aside className="space-y-4">
            {/* Summary card */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-4">
                Summary
              </p>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs text-slate-600">Enabled actions</span>
                <span className="text-sm font-bold text-slate-900 tabular-nums">
                  {enabledCount}
                </span>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">
                  Active providers
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {(value.enabledActions.integrations
                    ? value.enabledProviders
                    : []
                  ).map((p) => (
                    <span
                      key={p}
                      className="inline-flex items-center gap-1 rounded-full border border-[#1E3A5F]/20 bg-[#1E3A5F]/5 px-2.5 py-1 text-[10px] font-semibold text-[#1E3A5F]"
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-[#1E3A5F]" />
                      {p}
                    </span>
                  ))}
                  {value.enabledActions.integrations &&
                    value.enabledProviders.length === 0 && (
                      <span className="text-xs text-slate-400">
                        No providers selected.
                      </span>
                    )}
                  {!value.enabledActions.integrations && (
                    <span className="text-xs text-slate-400">
                      Integrations disabled.
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Connections card */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">
                Connections
              </p>
              <p className="text-xs text-slate-500 mb-4">
                Connect your workspace to external tools.
              </p>
              <div className="flex flex-col gap-2">
                {providers.map((p) => {
                  const isConnected = connectedSet.has(p.title);
                  return (
                    <div
                      key={p.title}
                      className={[
                        "flex items-center justify-between rounded-lg border px-4 py-3",
                        isConnected
                          ? "border-emerald-200 bg-emerald-50/50"
                          : "border-slate-200 bg-white",
                      ].join(" ")}
                    >
                      <div className="flex items-center gap-2.5">
                        <span
                          className={[
                            "h-2 w-2 rounded-full",
                            isConnected ? "bg-emerald-500" : "bg-slate-300",
                          ].join(" ")}
                        />
                        <div>
                          <span className="text-xs font-semibold text-slate-800">
                            {p.title}
                          </span>
                          <p className="text-[10px] text-slate-500 mt-0.5">
                            {isConnected ? "Ready to use" : "Not connected"}
                          </p>
                        </div>
                      </div>
                      {isConnected ? (
                        <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wide">
                          Connected
                        </span>
                      ) : (
                        <Link
                          href={connectHref(p)}
                          className="rounded-md bg-[#1E3A5F] px-3 py-1.5 text-[10px] font-bold text-white uppercase tracking-wide shadow-sm transition hover:bg-[#16304F] focus:outline-none focus:ring-2 focus:ring-[#1E3A5F] focus:ring-offset-1"
                        >
                          Connect
                        </Link>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div >
  );
}