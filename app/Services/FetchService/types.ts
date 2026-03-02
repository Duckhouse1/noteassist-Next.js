// FetchService/types.ts
import { FetchedADOData } from "@/lib/Integrations/AzureDevops/ADOFetchfunctions";
import { FetchedClickUpData } from "@/lib/Integrations/ClickUp/FetchFunctions";
import { FetchedJiraData } from "@/lib/Integrations/Jira/FetchFunctions";
import { data } from "framer-motion/client";

export type ProviderFetchResult =
  | { provider: "azure-devops"; data: FetchedADOData }
  | { provider: "jira"; data: FetchedJiraData }
  | { provider: "Outlook"; data: unknown }
  | { provider: "Sharepoint"; data: unknown }
  | {provider: "clickup"; data: FetchedClickUpData}