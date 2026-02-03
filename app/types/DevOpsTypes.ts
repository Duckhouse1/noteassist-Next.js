/* ─────────────────────────────────────────────
   Azure DevOps – Work Items in Iteration (200)
   ───────────────────────────────────────────── */

export interface AzureDevOpsIterationWorkItemsResponse {
  workItemRelations: AzureDevOpsWorkItemRelation[];
  url: string;
  _links: AzureDevOpsIterationWorkItemsLinks;
}

/* ───────────── Relations ───────────── */

export interface AzureDevOpsWorkItemRelation {
  /** Relation type (null for root items) */
  rel: AzureDevOpsWorkItemRelationType | null;

  /** Source work item (null when root) */
  source: AzureDevOpsWorkItemRef | null;

  /** Target work item */
  target: AzureDevOpsWorkItemRef;
}

/* ───────────── Work item reference ───────────── */

export interface AzureDevOpsWorkItemRef {
  id: number;
  url: string;
}

/* ───────────── Relation types ───────────── */
/**
 * Common relation values.
 * Keep as string union but allow unknowns.
 */
export type AzureDevOpsWorkItemRelationType =
  | "System.LinkTypes.Hierarchy-Forward"
  | "System.LinkTypes.Hierarchy-Reverse"
  | "System.LinkTypes.Dependency-Forward"
  | "System.LinkTypes.Dependency-Reverse"
  | string;

/* ───────────── Links ───────────── */

export interface AzureDevOpsIterationWorkItemsLinks {
  self: AzureDevOpsLink;
  iteration: AzureDevOpsLink;
}

export interface AzureDevOpsLink {
  href: string;
}
