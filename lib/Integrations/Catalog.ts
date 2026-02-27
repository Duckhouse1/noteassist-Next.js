import { AllADOActions } from "./AzureDevops/AllActions";
import { AllOutlookActions } from "./Outlook/AllActions";
import { AllJiraActions } from "./Jira/AllActions";
import { IntegrationOption } from "./Types";
import { AllSharePointActions } from "./Sharepoint/AllActions";

export const AllIntegrationOptions: IntegrationOption[] = [
  {
    title: "Azure DevOps",
    description: "Connect to Azure Devops!",
    iconURL: "/10261-icon-service-Azure-DevOps.svg",
    connectionUrl: "/api/integrations/azure-devops/connect",
    providerId: "azure-devops",
    actions: AllADOActions,
    needsProviderFetch: true,
    sections: [
      {
        title: "What this integration can do",
        description:
          "Create and update work items (User Stories, Tasks, Bugs) in selected projects, including Area Path and Iteration Path.",
      },
      {
        title: "Required access and why",
        description:
          "We request access to read org/project metadata and to create/update work items. This is required to pick project/team, validate Area/Iteration, and create items you request.",
      },
      {
        title: "Scopes (permissions) explained",
        description:
          "Typical scopes: Work Items (read/write) and Project/Team metadata (read). Creating work items requires write access.",
      },
      {
        title: "Data we access",
        description:
          "Only selected org/project metadata and the work items you create/update through Norbit. We don't scan unrelated projects unless you select them.",
      },
      {
        title: "Security and token handling",
        description:
          "Tokens are used only to call Azure DevOps APIs on your behalf. You can revoke access at any time in your connected apps.",
      },
      {
        title: "Common setup issues",
        description:
          "If you can't see a project or create items, your ADO permissions or granted scopes are likely insufficient. Reconnect and ensure Work Items (read/write).",
      },
    ],
  },
  {
    title: "Outlook",
    description: "Connect to your Outlook",
    iconURL: "/Microsoft_Office_Outlook_(2018–2024).svg.png",
    connectionUrl: "/api/integrations/microsoft-graph/connect",
    providerId: "outlook",
    needsProviderFetch: false,
    actions: AllOutlookActions,
    sections: [
      { title: "Mail sending", description: "Send emails directly from Norbit." },
      { title: "Schedule meetings!", description: "Have AI pre write your email and subject, and send directly from Norbit!" },
    ],
  },
  {
    title: "SharePoint",
    description: "Connect to SharePoint",
    iconURL: "/Microsoft_Office_SharePoint_(2019–2025).svg.png",
    connectionUrl: "/api/integrations/microsoft-graph/connect",
    providerId: "sharepoint",
    actions: AllSharePointActions,
    needsProviderFetch: true,
    sections: [
      { title: "Document access", description: "Browse and reference SharePoint documents." },
    ],
  },
  {
    title: "Jira",
    description: "Connect to Atlassian Jira",
    iconURL: "/jira-icon.svg",
    connectionUrl: "/api/integrations/jira/connect",
    providerId: "jira",
    actions: AllJiraActions,
    needsProviderFetch: true,
    sections: [
      {
        title: "What this integration can do",
        description:
          "Extract tasks from your meeting notes and create Jira issues (Epics, Stories, Tasks, Bugs) in your selected project.",
      },
      {
        title: "Required access and why",
        description:
          "We request read/write access to Jira work items and read access to user data. This lets us list your projects, issue types, and create issues on your behalf.",
      },
      {
        title: "Scopes (permissions) explained",
        description:
          "Scopes: read:jira-work, write:jira-work, read:jira-user. We also request offline_access to refresh your token without re-authenticating.",
      },
      {
        title: "Data we access",
        description:
          "Only project metadata and the issues you create through Norbit. We do not scan or read existing issues unless you explicitly ask.",
      },
    ],
  },
];