import { ActionKey } from "@/app/(app)/[company]/dashboard/sections/ConfigurationPage";

export type IntegrationOptionsTitle =
  | "Azure-Devops"
  | "Outlook"
  | "SharePoint"
  | "Jira"
  | "Notion";

  export type ProviderId = "azure-devops" | "outlook" | "sharepoint" | "jira" | "notion";
export interface IntegrationConnection {
  id: string;
  displayName: string;
  provider: string; // keep string because DB might store "azure-devops"
}
// This is NOT Prisma Action, NOT frontPage Action.
export interface Action {
    key: string;
    title: string;
    description: string;
    createText: string;
    integration?: ProviderId;
    UserConfig?: string
}

export interface IntegrationViewSection {
  title: string;
  description: string;
  imageUrl?: string;
}

export interface IntegrationOption {
  title: string;
  iconURL: string;
  description: string;
  connectionUrl: string;
  providerId: ProviderId;
  actions: Action[];
  needsProviderFetch:boolean
  UserConfigFields?: UserConfigField[];     // ✅ schema/metadata only
  sections: IntegrationViewSection[];
}

export type FieldType = "text" | "select" | "multiselect" | "boolean";

export interface UserConfigField {
  key: string;              // matches JSON key in IntegrationConfig
  title: string;
  description?: string;
  type: FieldType;
  // for selects
  options?: { label: string; value: string }[];

  // UX
  placeholder?: string;

  // validation / requirements
  required?: boolean;

  // for “select options come from API”
  optionsEndpoint?: string; // e.g. "/api/integrations/azure-devops/Organization"
  dependsOn?: string[];     // e.g. ["defaultOrganization"]
}
export interface IntegrationOptions {
  title: IntegrationOptionsTitle;
  connectionString: string;
}