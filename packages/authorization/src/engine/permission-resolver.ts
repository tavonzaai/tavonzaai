// ============================================================================
// @tavonza/authorization — Engine: Permission Resolver
// ============================================================================
// Normalizes permissions, merges direct and role-derived grants, deduplicates,
// and executes deterministic wildcard matching.
// ============================================================================

import type { Actor } from '../core/actor';
import {
  ACTION_ALL,
  normalizePermission,
  parsePermission,
  WILDCARD_ALL,
} from '../core/permission';
import type { RoleResolver } from './role-resolver';

export interface PermissionMatchResult {
  readonly matched: boolean;
  readonly matchedPermission?: string;
  readonly matchedRole?: string;
  readonly requiresOwnership?: boolean;
}

export class PermissionResolver {
  constructor(private readonly roleResolver?: RoleResolver) {}

  /**
   * Resolves and normalizes all permissions for a given actor, merging:
   * 1. Direct explicit permissions from actor.permissions
   * 2. Role-derived permissions via RoleResolver
   */
  async resolveActorPermissions(actor: Actor): Promise<{
    permissions: string[];
    permissionToRoleMap: Map<string, string>;
  }> {
    const permissionsSet = new Set<string>();
    const permissionToRoleMap = new Map<string, string>();

    // 1. Resolve role-based permissions
    if (this.roleResolver && actor.roles && actor.roles.length > 0) {
      const roleResult = await this.roleResolver.resolvePermissionsForRoles(actor.roles);
      for (const perm of roleResult.permissions) {
        const norm = normalizePermission(perm);
        permissionsSet.add(norm);
        const role = roleResult.permissionToRoleMap.get(perm);
        if (role) permissionToRoleMap.set(norm, role);
      }
    }

    // 2. Resolve direct explicit actor permissions
    if (actor.permissions && actor.permissions.length > 0) {
      for (const perm of actor.permissions) {
        const norm = normalizePermission(perm);
        permissionsSet.add(norm);
        // Direct permissions take precedence or don't overwrite role mapping
        if (!permissionToRoleMap.has(norm)) {
          permissionToRoleMap.set(norm, 'DIRECT');
        }
      }
    }

    return {
      permissions: Array.from(permissionsSet),
      permissionToRoleMap,
    };
  }

  /**
   * Evaluates if a set of granted permissions satisfies the requested permission.
   * Deterministic search order:
   * 1. Global wildcard '*'
   * 2. Resource wildcard 'resource:*'
   * 3. Action wildcard '*:action'
   * 4. Exact permission 'resource:action' or ownership qualified matches
   */
  match(params: {
    grantedPermissions: readonly string[];
    requestedPermission: string;
    permissionToRoleMap?: Map<string, string>;
    isOwner?: boolean;
    wildcardsEnabled?: boolean;
  }): PermissionMatchResult {
    const {
      grantedPermissions,
      requestedPermission,
      permissionToRoleMap,
      isOwner,
      wildcardsEnabled = true,
    } = params;
    const normalizedRequested = normalizePermission(requestedPermission);

    if (grantedPermissions.length === 0) {
      return { matched: false };
    }

    // Pass 1: Global wildcard (if enabled)
    if (wildcardsEnabled) {
      for (const granted of grantedPermissions) {
        if (granted === WILDCARD_ALL) {
          const role = permissionToRoleMap?.get(granted);
          return {
            matched: true,
            matchedPermission: WILDCARD_ALL,
            matchedRole: role !== 'DIRECT' ? role : undefined,
          };
        }
      }
    }

    let requiresOwnership = false;
    let ownershipMatchedPermission: string | undefined;
    let ownershipMatchedRole: string | undefined;

    // Pass 2: Resource and action matchers
    for (const granted of grantedPermissions) {
      // If wildcards disabled, ignore wildcard grants
      if (!wildcardsEnabled && (granted.includes('*') || granted === WILDCARD_ALL)) {
        continue;
      }

      const parsedGranted = parsePermission(granted);
      const parsedRequested = parsePermission(normalizedRequested);

      const resourceMatches =
        parsedGranted.resource === WILDCARD_ALL ||
        parsedGranted.resource === parsedRequested.resource ||
        parsedGranted.resource === `${parsedRequested.resource}s` ||
        `${parsedGranted.resource}s` === parsedRequested.resource;

      const actionMatches =
        parsedGranted.action === ACTION_ALL ||
        parsedGranted.action === parsedRequested.action;

      if (resourceMatches && actionMatches) {
        if (parsedGranted.qualifier === 'own' && !isOwner) {
          requiresOwnership = true;
          ownershipMatchedPermission = granted;
          ownershipMatchedRole = permissionToRoleMap?.get(granted);
          continue; // keep checking in case another permission matches unrestricted
        }

        const role = permissionToRoleMap?.get(granted);
        return {
          matched: true,
          matchedPermission: granted,
          matchedRole: role !== 'DIRECT' ? role : undefined,
        };
      }
    }

    if (requiresOwnership) {
      return {
        matched: false,
        requiresOwnership: true,
        matchedPermission: ownershipMatchedPermission,
        matchedRole: ownershipMatchedRole !== 'DIRECT' ? ownershipMatchedRole : undefined,
      };
    }

    return { matched: false };
  }
}
