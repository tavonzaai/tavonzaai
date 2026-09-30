// ============================================================================
// Authorization Evaluator — Runtime capability and scope validation
// ============================================================================

import type { Permission } from './permission';
import type { ScopeType } from './scope';
import type { SecurityContext } from './security-context';

export interface RequiredScopeCheck {
  type: ScopeType;
  id?: string;
  resourceId?: string;
}

/**
 * Checks whether an actor has the required permission and meets the scope criteria.
 */
export function hasPermission(
  context: SecurityContext,
  requiredPermission: Permission,
  requiredScope?: RequiredScopeCheck,
): boolean {
  // 1. Permission check
  const hasCapability = context.permissions.includes(requiredPermission);
  if (!hasCapability) {
    return false;
  }

  // 2. If no scope constraint is requested, capability alone satisfies
  if (!requiredScope) {
    return true;
  }

  // 3. Global scope satisfies any scope check
  const hasGlobalScope = context.scopes.some((s) => s.type === 'global');
  if (hasGlobalScope) {
    return true;
  }

  // 4. Validate matching scope
  return context.scopes.some((scope) => {
    // Organization scope matches if IDs match or organization owns the target
    if (requiredScope.type === 'organization') {
      return scope.type === 'organization' && scope.id === requiredScope.id;
    }

    // Branch scope matches if IDs match
    if (requiredScope.type === 'branch') {
      return (
        (scope.type === 'branch' && scope.id === requiredScope.id) ||
        (scope.type === 'organization' && scope.id === context.organizationId)
      );
    }

    // Session scope matches
    if (requiredScope.type === 'session') {
      return scope.type === 'session' && (!requiredScope.id || scope.id === requiredScope.id);
    }

    // Resource / Table level check
    if (requiredScope.type === 'resource') {
      if (scope.type === 'branch' && scope.id === requiredScope.id) {
        if (!scope.resourceIds || scope.resourceIds.length === 0) return true;
        return requiredScope.resourceId
          ? scope.resourceIds.includes(requiredScope.resourceId)
          : true;
      }
      return scope.type === 'resource' && (!requiredScope.id || scope.id === requiredScope.id);
    }

    return scope.type === requiredScope.type && scope.id === requiredScope.id;
  });
}
