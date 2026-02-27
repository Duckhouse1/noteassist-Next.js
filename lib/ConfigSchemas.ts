import { z } from "zod";
import { AzureDevopsSettings } from "./Integrations/AzureDevops/Configuration";
import { OutlookSettings } from "./Integrations/Outlook/Configuration";
import { JiraSettings } from "./Integrations/Jira/Configuration";

export const AzureDevopsConfigSchema: z.ZodType<AzureDevopsSettings> = z
  .object({
    defaultOrganization: z.string().default(""),
    defaultProject: z.string().default(""),
    defaultWorkItemTypes: z.array(z.string()).default([]),
    projectWorkItemTypes: z.record(z.string(), z.array(z.string())).default({}),
  })
  .transform((cfg) => {
    if (
      cfg.defaultProject &&
      cfg.defaultWorkItemTypes.length > 0 &&
      !cfg.projectWorkItemTypes[cfg.defaultProject]?.length
    ) {
      cfg.projectWorkItemTypes = {
        ...cfg.projectWorkItemTypes,
        [cfg.defaultProject]: cfg.defaultWorkItemTypes,
      };
    }
    return cfg;
  });

export const OutlookConfigSchema: z.ZodType<OutlookSettings> = z.object({
  defaultSignature: z.string().default(""),
  sendAsAlias: z.string().default(""),
  requestReadReceipts: z.boolean().default(false),
  autoCcEnabled: z.boolean().default(false),
  autoCcAddress: z.string().default(""),
  meetingDurationDefault: z
    .union([z.literal(15), z.literal(30), z.literal(60), z.literal(90)])
    .default(30),
  includeTeamsLink: z.boolean().default(false),
  outLookDraft: z.boolean().default(false),
  OutlookMeeting: z.boolean().default(false),
});

export const JiraConfigSchema: z.ZodType<JiraSettings> = z.object({
  defaultCloudId: z.string().default(""),
  defaultProjectKey: z.string().default(""),
  defaultIssueTypes: z.array(z.string()).default([]),
});

export const SharePointSchema: z.ZodType<JiraSettings> = z.object({
  defaultCloudId: z.string().default(""),
  defaultProjectKey: z.string().default(""),
  defaultIssueTypes: z.array(z.string()).default([]),
});

export const ProviderSchemas = {
  "azure-devops": AzureDevopsConfigSchema,
  outlook: OutlookConfigSchema,
  jira: JiraConfigSchema,
  sharepoint:SharePointSchema
} as const;

export type ProviderKey = keyof typeof ProviderSchemas;