import { ProviderConfigItem } from "./ProviderUserConfigs";

export function buildUserConfigString(item: ProviderConfigItem): string {
  switch (item.provider) {
    case "azure-devops": {
      const cfg = item.config;
      const wits =
        (cfg.defaultProject && cfg.projectWorkItemTypes?.[cfg.defaultProject]) || [];
      return wits.join(", ");
    }

    case "outlook": {
      const cfg = item.config;
      return `Default ending: ${cfg.defaultSignature}`;
    }

    case "sharepoint": {
      return `SharePoint defaults loaded.`;
    }

    case "jira": {
      const cfg = item.config;
      const types = cfg.defaultIssueTypes ?? [];
      return types.length > 0 ? types.join(", ") : "Jira defaults loaded.";
    }

    case "notion": {
      return "Notion default loaded";
    }
  }
}