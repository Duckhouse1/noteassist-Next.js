import { AllIntegrationOptions } from "./Catalog";
import type { ProviderId } from "./ProviderUserConfigs";

/**
 * Canonical provider IDs derived from the catalog.
 * Adding a new entry to AllIntegrationOptions is all you need —
 * every normalizer picks it up automatically.
 */
const CANONICAL_IDS = new Set<string>(
  AllIntegrationOptions.map((c) => c.providerId)
);

/**
 * Legacy / alternate strings that should map to a canonical ProviderId.
 * Only add entries here for OLD data already in the DB.
 * New integrations only need an entry in the Catalog.
 */
const LEGACY_ALIASES: Record<string, ProviderId> = {
  azuredevops: "azure-devops",
  "azure-devops": "azure-devops", // already canonical, but handles mixed-case after toLowerCase
  // add more only if you find old rows with non-canonical strings
};

/**
 * Resolve any provider string to its canonical ProviderId.
 *
 * Resolution order:
 *  1. Lowercase + trim → check if it's already a canonical catalog id
 *  2. Check the legacy alias map
 *  3. Throw (strict) or return null (lenient)
 */
export function normalizeProviderId(raw: string): ProviderId {
  const key = raw.trim().toLowerCase();
  if (CANONICAL_IDS.has(key)) return key as ProviderId;
  if (key in LEGACY_ALIASES) return LEGACY_ALIASES[key];
  throw new Error(`Unsupported provider: "${raw}"`);
}

/**
 * Same as normalizeProviderId but returns null instead of throwing.
 * Useful for filtering lists where unknown entries should be silently dropped.
 */
export function normalizeProviderIdSafe(raw: string): ProviderId | null {
  try {
    return normalizeProviderId(raw);
  } catch {
    return null;
  }
}