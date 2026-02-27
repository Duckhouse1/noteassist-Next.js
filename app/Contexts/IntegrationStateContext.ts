"use client";
import { IntegrationConnection } from "@/lib/Integrations/Types";
import { createContext } from "react";
import { ProviderConfigItem } from "@/lib/Integrations/ProviderUserConfigs";
import { WorkspaceConfig } from "@/lib/Integrations/WorkSpaceConfig";


// export type ProviderConfigItem =
//   | {
//       connectionId: string;
//       provider: "azure-devops";
//       displayName: string;
//       schemaVersion: number;
//       updatedAt: string | null;
//       config: AzureDevopsSettings;
//     }
//   | {
//       connectionId: string;
//       provider: "outlook";
//       displayName: string;
//       schemaVersion: number;
//       updatedAt: string | null;
//       config: OutlookSettings;
//     }
//   | {
//       connectionId: string;
//       provider: "sharepoint";
//       displayName: string;
//       schemaVersion: number;
//       updatedAt: string | null;
//       config: SharePointSettings;
//     }
//   | {
//       connectionId: string;
//       provider: "jira";
//       displayName: string;
//       schemaVersion: number;
//       updatedAt: string | null;
//       config: Record<string, unknown>;
//     };

export type IntegrationStateResponse = {
    connections: IntegrationConnection[];
    configs: ProviderConfigItem[];
    workspace: {
        schemaVersion: number;
        updatedAt: string | null;
        config: WorkspaceConfig;
    };
};

export const IntegrationStateContext = createContext<{
    integrationState: IntegrationStateResponse | null;
    setIntegrationState: React.Dispatch<React.SetStateAction<IntegrationStateResponse | null>>
}>({
    integrationState: null,
    setIntegrationState: () => { },
});