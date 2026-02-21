// Azure DevOps default process work item types

// -----------------------------
// Work item type unions
// -----------------------------

/**
 * Agile (Default) process
 * (Note: Agile uses "User Story" — not "Product Backlog Item")
 */
export type AgileDefaultWorkItemType =
  | "Epic"
  | "Feature"
  | "User Story"
  | "Bug"
  | "Task"
  | "Issue"
  | "Test Case";

/**
 * Scrum process
 * (Note: Scrum uses "Product Backlog Item" (PBI))
 */
export type ScrumDefaultWorkItemType =
  | "Epic"
  | "Feature"
  | "Product Backlog Item"
  | "Bug"
  | "Task"
  | "Impediment"
  | "Test Case";

/**
 * Basic process
 */
export type BasicDefaultWorkItemType = "Epic" | "Issue" | "Task";

// -----------------------------
// Processor types
// -----------------------------

export type ProcessorTitle = "Scrum" | "Agile" | "Basic";

export type ProcessWorkItemTypeMap = {
  Scrum: ScrumDefaultWorkItemType;
  Agile: AgileDefaultWorkItemType;
  Basic: BasicDefaultWorkItemType;
};

export type Processor<TTitle extends ProcessorTitle> = {
  processorTitle: TTitle;
  workItems: ProcessWorkItemTypeMap[TTitle][];
};

// -----------------------------
// Processor constants
// -----------------------------

// Keep the exact name you asked for (including the typo: "Proccesor")
export const ScrumProccesorDefaultWorkItems: Processor<"Scrum"> = {
  processorTitle: "Scrum",
  workItems: [
    "Epic",
    "Feature",
    "Product Backlog Item",
    "Bug",
    "Task",
    "Impediment",
    "Test Case",
  ],
};

export const AgileProcessorDefaultWorkItems: Processor<"Agile"> = {
  processorTitle: "Agile",
  workItems: ["Epic", "Feature", "User Story", "Bug", "Task", "Issue", "Test Case"],
};

export const BasicProcessorDefaultWorkItems: Processor<"Basic"> = {
  processorTitle: "Basic",
  workItems: ["Epic", "Issue", "Task"],
};

// Optional: convenient list of all processors
export const DefaultWorkItemProcessors = [
  ScrumProccesorDefaultWorkItems,
  AgileProcessorDefaultWorkItems,
  BasicProcessorDefaultWorkItems,
] as const;