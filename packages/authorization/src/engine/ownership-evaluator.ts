// ============================================================================
// @tavonza/authorization — Engine: Ownership Evaluator
// ============================================================================
// Evaluates resource ownership semantics (e.g. 'order:read:own' vs ':any').
// Domain-neutral.
// ============================================================================

import type { Actor } from '../core/actor';
import type { Resource } from '../core/resource';
import { parsePermission } from '../core/permission';

export interface OwnershipEvaluationResult {
  readonly allowed: boolean;
  readonly isOwner: boolean;
  readonly reason?: string;
}

export class OwnershipEvaluator {
  /**
   * Determines if the actor is considered the owner of the resource.
   */
  isOwner(actor: Actor, resource: Resource): boolean {
    if (!resource.ownerId) {
      return false;
    }
    return resource.ownerId === actor.id;
  }

  /**
   * Evaluates ownership criteria against granted permissions and resource state.
   */
  evaluate(params: {
    actor: Actor;
    resource: Resource;
    matchedPermission?: string;
    requireOwnership?: boolean;
  }): OwnershipEvaluationResult {
    const { actor, resource, matchedPermission, requireOwnership } = params;
    const isOwner = this.isOwner(actor, resource);

    // 1. If explicit caller required ownership, actor must be owner
    if (requireOwnership && !isOwner) {
      return {
        allowed: false,
        isOwner: false,
        reason: 'Operation strictly requires actor to be the resource owner',
      };
    }

    // 2. If the matched permission is restricted with ':own' qualifier
    if (matchedPermission) {
      const parsed = parsePermission(matchedPermission);
      if (parsed.qualifier === 'own') {
        if (!isOwner) {
          return {
            allowed: false,
            isOwner: false,
            reason: `Permission '${matchedPermission}' is restricted to resource owner`,
          };
        }
      }
    }

    return { allowed: true, isOwner };
  }
}
