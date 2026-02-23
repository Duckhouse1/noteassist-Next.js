import { IntegrationConfigItem } from "@/app/(app)/[company]/dashboard/dashboardClient";


  export function buildUserConfigString(item: IntegrationConfigItem): string {
        switch (item.provider) {
            case "azure-devops": {
                const cfg = item.config;
                return `${cfg.defaultWorkItemTypes.join(", ")}`;
            }

            case "outlook": {
                const cfg = item.config;
                return `Outlook defaults:
- Meeting duration: ${cfg.meetingDurationDefault} minutes
- Default ending: ${cfg.sendAsAlias}`;
            }

            case "sharepoint": {
                // build whatever you need
                return `SharePoint defaults loaded.`;
            }

            case "jira": {
                return `Jira defaults loaded.`;
            }
        }
    }