import { AllIntegrationOptions } from "./Catalog";
import { IntegrationOptionsTitle, ProviderId } from "./Types";



export type IntegrationActionToggles = Record<string, boolean>;



export type IntegrationActionTogglesByProvider = Partial<
  Record<ProviderId, IntegrationActionToggles>
>;

// export type WorkspaceConfig = {
//   enabledProviders: IntegrationOptionsTitle[];
//   enabledIntegrationActions: IntegrationActionTogglesByProvider;
// };

export function buildDefaultActionToggles(): IntegrationActionTogglesByProvider {
  const next: IntegrationActionTogglesByProvider = {};
  for (const card of AllIntegrationOptions) {
    next[card.providerId] = Object.fromEntries(card.actions.map(a => [a.key, false]));
  }
  return next;
}

export const DEFAULT_WORKSPACE_CONFIG: WorkspaceConfig = {
  enabledProviders: [],
  enabledActions: buildDefaultActionToggles(),
};

export type WorkspaceConfig = {
  enabledProviders: ProviderId[];
  enabledActions: Partial<Record<ProviderId, Record<string, boolean>>>;
};
