// ============================================================================
// @tavonza/authorization — Core Permission Model
// ============================================================================
// Standardized resource:action capability representation with wildcard,
// singular/plural resource matching, and ownership support.
// ============================================================================

export const WILDCARD_ALL = '*';
export const ACTION_ALL = '*';

export type PermissionScopeQualifier = 'own' | 'any';

/**
 * Deconstructed representation of a permission string.
 */
export interface ParsedPermission {
  readonly raw: string;
  readonly resource: string;
  readonly action: string;
  readonly qualifier?: PermissionScopeQualifier;
  readonly isWildcard: boolean;
}

/**
 * Normalizes a raw permission string into canonical format:
 * - Replaces dots with colons (orders.read -> orders:read)
 * - Converts to lower-case
 * - Trims whitespace
 */
export function normalizePermission(raw: string): string {
  if (!raw || typeof raw !== 'string') return '';
  const trimmed = raw.trim().toLowerCase();
  if (trimmed === WILDCARD_ALL) return WILDCARD_ALL;

  // Replace dots with colons for backward compatibility
  const normalized = trimmed.replace(/\./g, ':');
  return normalized;
}

/**
 * Parses a permission string into its constituent parts:
 * format: resource:action[:qualifier] (e.g. order:read or order:read:own)
 */
export function parsePermission(permissionStr: string): ParsedPermission {
  const normalized = normalizePermission(permissionStr);

  if (normalized === WILDCARD_ALL) {
    return {
      raw: normalized,
      resource: WILDCARD_ALL,
      action: ACTION_ALL,
      isWildcard: true,
    };
  }

  const parts = normalized.split(':');
  const resource = parts[0] || '';
  const action = parts[1] || '';
  const qualifierStr = parts[2];
  const qualifier: PermissionScopeQualifier | undefined =
    qualifierStr === 'own' || qualifierStr === 'any' ? qualifierStr : undefined;

  const isWildcard =
    resource === WILDCARD_ALL ||
    action === ACTION_ALL ||
    action === '';

  return {
    raw: normalized,
    resource,
    action: action || ACTION_ALL,
    qualifier,
    isWildcard,
  };
}

/**
 * Determines whether a granted permission satisfies a requested permission check.
 *
 * Rules:
 * 1. Global wildcard '*' matches everything.
 * 2. Resource check matches exact or singular/plural forms (order <-> orders).
 * 3. Resource wildcard 'resource:*' matches any action on that resource.
 * 4. Cross-resource wildcard '*:action' matches that action on any resource.
 * 5. Exact match 'resource:action' matches requested 'resource:action'.
 * 6. Ownership qualifier:
 *    - If granted has ':own', it only matches when isOwner is true.
 *    - If granted has ':any' or no qualifier, it matches regardless of ownership.
 */
export function matchesPermission(
  grantedPermission: string,
  requestedPermission: string,
  isOwner?: boolean,
): boolean {
  const granted = parsePermission(grantedPermission);
  const requested = parsePermission(requestedPermission);

  // 1. Global wildcard granted
  if (granted.raw === WILDCARD_ALL) {
    return true;
  }

  // 2. Resource check (supports singular/plural normalization: order <-> orders)
  const resourceMatches =
    granted.resource === WILDCARD_ALL ||
    granted.resource === requested.resource ||
    granted.resource === `${requested.resource}s` ||
    `${granted.resource}s` === requested.resource;

  if (!resourceMatches) {
    return false;
  }

  // 3. Action check
  const actionMatches =
    granted.action === ACTION_ALL ||
    granted.action === requested.action;

  if (!actionMatches) {
    return false;
  }

  // 4. Ownership qualifier check
  if (granted.qualifier === 'own') {
    // Granted only allows own resources
    return isOwner === true;
  }

  if (requested.qualifier === 'own') {
    // The check requires ownership, but granted has 'any' or unrestricted -> allowed
    return true;
  }

  return true;
}

/**
 * Helper to build a canonical permission string.
 */
export function createPermissionString(
  resource: string,
  action: string,
  qualifier?: PermissionScopeQualifier,
): string {
  const res = resource.trim().toLowerCase();
  const act = action.trim().toLowerCase();
  if (qualifier) {
    return `${res}:${act}:${qualifier}`;
  }
  return `${res}:${act}`;
}
