import { WorkItemType } from "@/app/api/integrations/azure-devops/WorkItem/GetWorkItemTypesByProject/route";

export type GetWorkItemTypesResponse = {
  types: WorkItemType[];
};

export type AzureDevopsSettings = {
  defaultOrganization: string;
  defaultProject: string;
  /** @deprecated Use projectWorkItemTypes instead. Kept for backwards compat during migration. */
  defaultWorkItemTypes: string[];
  /** Per-project WIT selections: { [projectId]: ["Epic", "Task", ...] } */
  projectWorkItemTypes: Record<string, string[]>;
};

export interface AzureOrganization {
  accountId: string;
  name: string;
  organizationName: string;
  accountUri?: string;
}

export interface AzureProject {
  id: string;
  name: string;
  description?: string;
  state: string;
}

export const DEFAULT_AZURE_DEVOPS_SETTINGS: AzureDevopsSettings = {
  defaultOrganization: "",
  defaultProject: "",
  defaultWorkItemTypes: [],
  projectWorkItemTypes: {},
};