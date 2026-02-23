import { z } from "zod";
import type { OutlookSettings } from "@/app/(app)/[company]/dashboard/sections/configElements.tsx/OutlookConfig";
import type { AzureDevopsSettings } from "@/app/(app)/[company]/dashboard/sections/configElements.tsx/AzureDevopsConfig";
// import type { SharePointSettings } from "@/app/(app)/[company]/dashboard/sections/configElements.tsx/SharePointConfig";

export const AzureDevopsSchema: z.ZodType<AzureDevopsSettings> = z.object({
  defaultOrganization: z.string().default(""),
  defaultProject: z.string().default(""),
  defaultWorkItemTypes: z.array(z.string()).default([]),
});

export const OutlookSchema: z.ZodType<OutlookSettings> = z.object({
  defaultSignature: z.string().default(""),
  sendAsAlias: z.string().default(""),
  requestReadReceipts: z.boolean().default(false),
  autoCcEnabled: z.boolean().default(false),
  autoCcAddress: z.string().default(""),
  meetingDurationDefault: z.union([z.literal(15), z.literal(30), z.literal(60), z.literal(90)]).default(30),
  includeTeamsLink: z.boolean().default(true),
  outLookDraft: z.boolean().default(true),
  OutlookMeeting: z.boolean().default(true),
});

// Example for later:
// export const SharePointSchema: z.ZodType<SharePointSettings> = z.object({ ... });

export const ProviderSchemas = {
  "azure-devops": AzureDevopsSchema,
  outlook: OutlookSchema,
  // sharepoint: SharePointSchema,
} as const;

export type ProviderKey = keyof typeof ProviderSchemas;