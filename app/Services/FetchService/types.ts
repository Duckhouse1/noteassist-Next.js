// FetchService/types.ts
import { FetchedADOData } from "@/lib/Integrations/AzureDevops/ADOFetchfunctions";
import { FetchedJiraData } from "@/lib/Integrations/Jira/FetchFunctions";

export type ProviderFetchResult =
  | { provider: "azure-devops"; data: FetchedADOData }
  | { provider: "jira"; data: FetchedJiraData }
  | { provider: "Outlook"; data: unknown }
  | { provider: "Sharepoint"; data: unknown };