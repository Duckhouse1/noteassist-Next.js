"use client";

import { signOut } from "next-auth/react";
import { useContext, useState } from "react";
import { OrganizationModeContext } from "@/app/Contexts";
import { IntegrationOptionsTitle } from "@/lib/Integrations/Types";
import { AzureDevopsSettings } from "@/lib/Integrations/AzureDevops/Configuration";
import { OutlookSettings } from "@/lib/Integrations/Outlook/Configuration";
import { SharePointSettings } from "./configElements.tsx/SharePointConfig";

/* ───────────────── Types (kept for other imports) ───────────────── */

export type ActionKey = "integrations";

export type ConfigState = {
  enabledActions: Record<ActionKey, boolean>;
  enabledProviders: IntegrationOptionsTitle[];
  azureDevops: Record<string, AzureDevopsSettings>;
  outlook: Record<string, OutlookSettings>;
  sharePoint: Record<string, SharePointSettings>;
};

export const DEFAULT_CONFIG: ConfigState = {
  enabledActions: { integrations: true },
  enabledProviders: [],
  azureDevops: {},
  outlook: {},
  sharePoint: {},
};

/* ───────────────── Component ───────────────── */

interface AccountPageProps {
  company: string;
}

export function ConfigurationPage({ company }: AccountPageProps) {
  const { mode } = useContext(OrganizationModeContext);
  const [signingOut, setSigningOut] = useState(false);

  async function handleSignOut() {
    setSigningOut(true);
    await signOut({ callbackUrl: "/login" });
  }

  return (
    <div className="bg-white w-full h-full flex flex-col overflow-auto">
      {/* Page header */}
      <div className="p-10 px-20 pb-0">
        <h1 className="text-4xl font-bold tracking-tighter">Settings</h1>
        <h2 className="text-gray-400">
          Account preferences and session management
        </h2>
      </div>

      <div className="px-20 pt-8 pb-20">
        <div className="flex items-start gap-10">
          {/* Left: settings sections */}
          <div className="flex-1 flex flex-col gap-6">
            {/* Account info */}
            <div className="border border-gray-200 rounded-2xl overflow-hidden">
              <div className="border-b border-gray-100 bg-slate-50/60 px-6 py-3">
                <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Account</p>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-900">Workspace</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {mode === "personal" ? "Personal workspace" : company}
                    </p>
                  </div>
                  <span className="inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide bg-slate-100 text-slate-500">
                    {mode === "personal" ? "Personal" : "Company"}
                  </span>
                </div>
              </div>
            </div>

            {/* Danger zone */}
            <div className="border border-red-200 rounded-2xl overflow-hidden">
              <div className="border-b border-red-100 bg-red-50/60 px-6 py-3">
                <p className="text-[11px] font-bold uppercase tracking-widest text-red-400">Session</p>
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-900">Sign out</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      End your current session and return to the login page
                    </p>
                  </div>
                  <button
                    onClick={handleSignOut}
                    disabled={signingOut}
                    className="cursor-pointer rounded-xl bg-red-600 text-sm font-medium text-white px-4 py-2 hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {signingOut ? "Signing out…" : "Sign out"}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right: info sidebar */}
          <div className="w-[280px] shrink-0 flex flex-col gap-4">
            <div className="border border-gray-200 rounded-2xl p-5">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">Quick info</p>
              <ul className="space-y-3">
                <li className="flex items-start gap-2.5 text-xs text-slate-500 leading-relaxed">
                  <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                    <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </span>
                  Manage integrations from the Integrations tab
                </li>
                <li className="flex items-start gap-2.5 text-xs text-slate-500 leading-relaxed">
                  <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                    <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </span>
                  Organisation settings are available to workspace owners
                </li>
                <li className="flex items-start gap-2.5 text-xs text-slate-500 leading-relaxed">
                  <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                    <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </span>
                  Signing out will not delete any saved notes or configurations
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}