// ============================================================================
// @tavonza/authorization — Engine: Scope Resolver
// ============================================================================
// Evaluates multi-tenant, organizational, and resource boundary containment.
// Framework and domain neutral.
// ============================================================================

import type { Actor } from '../core/actor';
import type { Resource } from '../core/resource';
import type { Scope } from '../core/scope';

export interface ScopeEvaluationResult {
  readonly allowed: boolean;
  readonly matchedScope?: Scope;
  readonly reason?: string;
}

export class ScopeResolver {
  /**
   * Evaluates whether an actor's granted scopes satisfy the target scope and boundaries.
   */
  evaluateScope(params: {
    actor: Actor;
    targetScope?: Scope;
    targetOrganizationId?: string | null;
    targetBranchId?: string | null;
    resource?: Resource;
  }): ScopeEvaluationResult {
    const { actor, targetScope, targetOrganizationId, targetBranchId, resource } = params;
    const actorScopes = actor.scopes ?? [];

    // 1. If actor holds a 'global' scope or wildcard id, access is unconditionally granted
    const globalScope = actorScopes.find(
      (s) => s.type === 'global' || s.id === '*' || s.type === '*',
    );
    if (globalScope) {
      return { allowed: true, matchedScope: globalScope };
    }

    // 2. If no target scope or boundary is specified, actor passes
    if (!targetScope && !targetOrganizationId && !targetBranchId && !resource?.scope) {
      return { allowed: true };
    }

    const effectiveTargetScope = targetScope ?? resource?.scope;
    const effectiveOrgId = targetOrganizationId ?? effectiveTargetScope?.id ?? resource?.organizationId;
    const effectiveBranchId = targetBranchId ?? effectiveTargetScope?.id ?? resource?.branchId;

    // 3. Organization boundary check (if target has organizationId)
    if (effectiveOrgId && actor.organizationId && actor.organizationId !== effectiveOrgId) {
      // Actor is bound to a different organization
      return {
        allowed: false,
        reason: `Cross-tenant access denied: actor org (${actor.organizationId}) does not match target org (${effectiveOrgId})`,
      };
    }

    // 4. Branch boundary check (if actor is strictly branch-bound)
    if (effectiveBranchId && actor.branchId && actor.branchId !== effectiveBranchId) {
      return {
        allowed: false,
        reason: `Branch isolation: actor branch (${actor.branchId}) does not match target branch (${effectiveBranchId})`,
      };
    }

    // 5. If specific target scope is requested, match against actor's scopes
    if (effectiveTargetScope) {
      for (const scope of actorScopes) {
        // Direct type match
        if (scope.type === effectiveTargetScope.type) {
          // If no specific id is required on target or IDs match
          if (!effectiveTargetScope.id || scope.id === effectiveTargetScope.id) {
            // Check resource IDs allowlist if restricted
            if (scope.resourceIds && scope.resourceIds.length > 0 && resource?.id) {
              if (!scope.resourceIds.includes(resource.id)) {
                continue; // This scope doesn't cover this specific resource ID
              }
            }
            return { allowed: true, matchedScope: scope };
          }
        }

        // Hierarchical inheritance: Organization scope covers Branch and Resource scopes
        if (
          scope.type === 'organization' &&
          (effectiveTargetScope.type === 'branch' || effectiveTargetScope.type === 'resource')
        ) {
          if (!scope.id || scope.id === effectiveOrgId || scope.id === actor.organizationId) {
            return { allowed: true, matchedScope: scope };
          }
        }

        // Branch scope covers Resource scope in that branch
        if (
          scope.type === 'branch' &&
          effectiveTargetScope.type === 'resource'
        ) {
          if (!scope.id || scope.id === effectiveBranchId || scope.id === actor.branchId) {
            if (scope.resourceIds && scope.resourceIds.length > 0 && resource?.id) {
              if (scope.resourceIds.includes(resource.id)) {
                return { allowed: true, matchedScope: scope };
              }
            } else {
              return { allowed: true, matchedScope: scope };
            }
          }
        }
      }

      // If actor has organizationId or branchId matching target without explicit scopes array
      if (
        (effectiveTargetScope.type === 'organization' && actor.organizationId === effectiveTargetScope.id) ||
        (effectiveTargetScope.type === 'branch' && actor.branchId === effectiveTargetScope.id)
      ) {
        return { allowed: true };
      }

      return {
        allowed: false,
        reason: `Required scope (${effectiveTargetScope.type}:${effectiveTargetScope.id ?? '*'}) not covered by actor scopes`,
      };
    }

    return { allowed: true };
  }
}
