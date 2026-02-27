"use client";

import Image from "next/image";
import Link from "next/link";
import { Row } from "../(app)/[company]/dashboard/sections/configElements.tsx/GeneralConfig";
import { useEffect, useState, type ReactNode } from "react";
import { IntegrationOption, IntegrationConnection } from "@/lib/Integrations/Types";
import { FetchProviderData } from "../Services/FetchService/FetchService";
import { ProviderFetchResult } from "../Services/FetchService/types";
import AzureDevopsConfigPanel from "../(app)/[company]/dashboard/sections/configElements.tsx/AzureDevopsConfigSection";
import { ProviderConfigItem } from "@/lib/Integrations/ProviderUserConfigs";
import OutlookConfigPanel from "../(app)/[company]/dashboard/sections/configElements.tsx/OutlookConfig";
import { AzureDevopsSettings } from "@/lib/Integrations/AzureDevops/Configuration";
import { OutlookSettings } from "@/lib/Integrations/Outlook/Configuration";
import { ConfigSkeletonGrid } from "./2x2SkeletonGrid";
import JiraConfigPanel from "../(app)/[company]/dashboard/sections/configElements.tsx/JiraConfigSection";
import { JiraSettings } from "@/lib/Integrations/Jira/Configuration";


type ConfigFieldValue = string | string[] | boolean | number | Record<string, string[]>;

interface IntegrationOptionViewProps {
  option: IntegrationOption;
  company: string;
  connection: IntegrationConnection | null;
  enabledMap: Record<string, boolean>;
  onToggleAction: (actionKey: string) => void;
  onConfigChange: (key: string, value: ConfigFieldValue) => void;
  configItem: ProviderConfigItem | null;
}

export default function IntegrationOptionView({
  option,
  company,
  connection,
  enabledMap,
  onToggleAction,
  onConfigChange,
  configItem,
}: IntegrationOptionViewProps) {
  const [providerData, setProviderData] = useState<ProviderFetchResult | null>(null);
  const [isFetchingProviderData, setIsFetchingProviderData] = useState(false);

  // Animation key — forces re-mount of animated wrapper when selection changes
  const [animKey, setAnimKey] = useState(0);
  useEffect(() => {
    setAnimKey((k) => k + 1);
  }, [option.providerId]);

  useEffect(() => {
    if (!connection || !option.needsProviderFetch) {
      setProviderData(null);
      setIsFetchingProviderData(false);
      return;
    }

    let cancelled = false;
    const controller = new AbortController();

    (async () => {
      setIsFetchingProviderData(true);
      try {
        const res = await FetchProviderData(option.providerId);
        if (!cancelled) setProviderData(res);
      } catch (e) {
        if (!cancelled) console.log("Error fetching Provider data:", e);
      } finally {
        if (!cancelled) setIsFetchingProviderData(false);
      }
    })();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [option.providerId, option.needsProviderFetch, connection]);

  const connectHref = () => {
    const returnTo = `/${company}/dashboard`;
    return `${option.connectionUrl}?returnTo=${encodeURIComponent(returnTo)}&provider=${option.providerId}`;
  };

  const isConnected = connection != null;
  const showSkeleton = isConnected && option.needsProviderFetch && isFetchingProviderData;

  return (
    <div key={animKey} className="rounded-2xl w-full gap-5 flex flex-col animate-view-in">
      {/* ── Connection header ── */}
      <div className="flex items-start gap-4 rounded-2xl border border-gray-300 p-6" style={{ animationDelay: "0ms" }}>
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-50 border border-slate-200">
          <Image
            width={28}
            height={28}
            src={option.iconURL}
            alt={`${option.title} icon`}
            className="object-contain"
          />
        </div>

        <div className="flex-1">
          <h1 className="text-xl font-semibold text-gray-900 leading-tight">
            {option.title}
          </h1>
          <p className="text-sm text-gray-500 mt-1">{option.description}</p>
          <p className="text-xs text-gray-400 mt-2">
            {isConnected ? "active" : "Not connected yet"}
          </p>
        </div>

        {!isConnected ? (
          <Link
            className="cursor-pointer rounded-md border border-gray-200 bg-black p-2 px-4 text-m font-medium text-white hover:bg-gray-800 transition"
            href={connectHref()}
          >
            Connect
          </Link>
        ) : (
          <p className="bg-white text-green-600 p-2 rounded-md border border-green-600">
            Connected
          </p>
        )}
      </div>

      {/* ── Actions ── */}
      <div className="animate-view-in-child" style={{ animationDelay: "60ms" }}>
        <IntegrationOptionContainer connected={isConnected}>
          <h1 className="font-bold mb-4">Actions</h1>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-4">
            {option.actions.map((action, index) => (
              <Row
                key={index}
                title={action.title}
                desc={action.description}
                checked={!!enabledMap[action.key]}
                onChange={() => onToggleAction(action.key)}
              />
            ))}
          </div>
        </IntegrationOptionContainer>
      </div>

      {/* ── Configurations ── */}
      <div className="animate-view-in-child" style={{ animationDelay: "120ms" }}>
        <IntegrationOptionContainer connected={isConnected}>
          <h1 className="font-bold mb-4">Configurations</h1>

          {showSkeleton ? (
            <ConfigSkeletonGrid />
          ) : (
            <div className={!isConnected ? "opacity-40 pointer-events-none" : ""}>
              {option.providerId === "azure-devops" && (
                <AzureDevopsConfigPanel
                  config={
                    configItem?.provider === "azure-devops"
                      ? (configItem.config as AzureDevopsSettings)
                      : undefined
                  }
                  data={
                    providerData?.provider === "azure-devops"
                      ? providerData.data
                      : null
                  }
                  onPatch={(patch) => {
                    if (!isConnected) return;
                    for (const [k, v] of Object.entries(patch)) onConfigChange(k, v);
                  }}
                />
              )}

              {option.providerId === "outlook" && (
                <OutlookConfigPanel
                  config={
                    configItem?.provider === "outlook"
                      ? (configItem.config as OutlookSettings)
                      : undefined
                  }
                  onPatch={(patch) => {
                    if (!isConnected) return;
                    for (const [k, v] of Object.entries(patch)) onConfigChange(k, v);
                  }}
                />
              )}
              {option.providerId === "jira" && (
              <JiraConfigPanel
                config={
                  configItem?.provider === "jira"
                    ? (configItem.config as JiraSettings)
                    : undefined
                }
                data={
                  providerData?.provider === "jira"
                    ? providerData.data
                    : null
                }
                onPatch={(patch) => {
                  if (!isConnected) return;
                  for (const [k, v] of Object.entries(patch)) onConfigChange(k, v);
                }}
              />
            )}
            </div>
          )}
        </IntegrationOptionContainer>
      </div>

      {/* ── Details ── */}
      <div className="animate-view-in-child" style={{ animationDelay: "180ms" }}>
        <IntegrationOptionContainer connected={true}>
          <h1 className="font-bold mb-4">Details</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {option.sections.map((section) => (
              <div
                key={section.title}
                className="rounded-2xl border border-gray-200 bg-white p-4"
              >
                <h2 className="text-sm font-semibold text-gray-900">
                  {section.title}
                </h2>
                <p className="mt-1 text-sm text-gray-600 leading-relaxed">
                  {section.description}
                </p>
              </div>
            ))}
          </div>
        </IntegrationOptionContainer>
      </div>

      {/* Inline styles for the animation */}
      <style jsx>{`
        @keyframes viewIn {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-view-in {
          animation: viewIn 0.3s ease-out both;
        }

        .animate-view-in-child {
          opacity: 0;
          animation: viewIn 0.35s ease-out both;
        }
      `}</style>
    </div>
  );
}

function IntegrationOptionContainer({ children, connected }: { children: ReactNode; connected: boolean }) {
  return (
    <div className="relative rounded-2xl border border-gray-200 p-5 bg-white">
      {!connected && (
        <div className="absolute inset-0 rounded-2xl bg-white/50 pointer-events-none" />
      )}
      <div className={!connected ? "pointer-events-none" : ""}>
        {children}
      </div>
    </div>
  );
}