import ADOFetchFunctions, { FetchedADOData } from "@/lib/Integrations/AzureDevops/ADOFetchfunctions";
import ClickUpFetchFunctions, { FetchedClickUpData } from "@/lib/Integrations/ClickUp/FetchFunctions";
import JiraFetchFunctions, { FetchedJiraData } from "@/lib/Integrations/Jira/FetchFunctions";
import { ProviderId } from "@/lib/Integrations/ProviderUserConfigs";

type ProviderFetchResult =
  | { provider: "azure-devops"; data: FetchedADOData }
  | { provider: "jira"; data: FetchedJiraData }
  | { provider: "clickup"; data: FetchedClickUpData }

const fetchers: Partial<Record<ProviderId, () => Promise<ProviderFetchResult>>> = {
  "azure-devops": async () => ({
    provider: "azure-devops",
    data: await ADOFetchFunctions.FetchADOData(),
  }),
  jira: async () => ({
    provider: "jira",
    data: await JiraFetchFunctions.FetchJiraData(),
  }),
  clickup: async () => ({
    provider:"clickup",
    data: await ClickUpFetchFunctions.FetchClickUpWorkspaceSpaceLists()
  })
};

export async function FetchProviderData(provider: ProviderId): Promise<ProviderFetchResult> {
  const fn = fetchers[provider];
  if (!fn) throw new Error(`Unsupported provider: ${provider}`);
  return fn();
}

const FetchService = {
    FetchProviderData
}

export default FetchService