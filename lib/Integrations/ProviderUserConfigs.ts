// src/lib/Integrations/ProviderTypes.ts
import type { AzureDevopsSettings } from "@/lib/Integrations/AzureDevops/Configuration";
import type { SharePointSettings } from "@/app/(app)/[company]/dashboard/sections/configElements.tsx/SharePointConfig";
import { OutlookSettings } from "./Outlook/Configuration";
import { JiraSettings } from "./Jira/Configuration";

export type ProviderId = "azure-devops" | "outlook" | "sharepoint" | "jira" | "notion";

export type ProviderConfigByProviderId = {
  "azure-devops": AzureDevopsSettings;
  outlook: OutlookSettings;
  sharepoint: SharePointSettings;
  jira: JiraSettings;
  notion: Record<string, unknown>;
};

export type ProviderConfigItem =
  {
    [P in ProviderId]: {
      provider: P;
      connectionId: string;
      displayName: string;
      schemaVersion: number;
      updatedAt: string | null;
      config: ProviderConfigByProviderId[P];
    }
  }[ProviderId];