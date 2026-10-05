// ============================================================================
// @tavonza/authorization — HTTP Adapter: Generic HTTP Guard
// ============================================================================
// Framework-agnostic HTTP request authorization logic.
// Can be called by NestJS CanActivate guards, Express middleware, or Fastify preHandlers.
// ============================================================================

import type { Actor } from '../../core/actor';
import { createActor, ActorType } from '../../core/actor';
import type { AuthorizationDecision } from '../../core/decision';
import type { AuthorizationEngine } from '../../engine/authorization-engine';
import type { AuthorizationRuleOptions } from './decorators';
import type { ActorExtractor, HttpRequestLike } from './http-types';

export interface GuardEvaluationRequest {
  request: HttpRequestLike;
  requiredPermissions?: string[];
  authorizationRule?: AuthorizationRuleOptions;
}

export class GenericHttpAuthorizationGuard {
  private readonly actorExtractor: ActorExtractor;

  constructor(
    private readonly engine: AuthorizationEngine,
    customActorExtractor?: ActorExtractor,
  ) {
    this.actorExtractor = customActorExtractor ?? this.defaultActorExtractor;
  }

  /**
   * Default extractor mapping standard JWT user payload into an Actor.
   */
  defaultActorExtractor(req: HttpRequestLike): Actor | undefined {
    const user = req.user;
    if (!user) return undefined;

    return createActor({
      id: user.sub ?? user.id,
      type: user.actorType ?? ActorType.USER,
      roles: user.role ? [user.role] : [],
      permissions: user.permissions ?? [],
      scopes: user.scopes ?? [],
      organizationId: user.organizationId ?? null,
      branchId: user.branchId ?? null,
      attributes: {
        email: user.email,
        globalRole: user.globalRole,
      },
    });
  }

  /**
   * Evaluates the HTTP request against required permissions or rules.
   */
  async checkAuthorization(
    evalReq: GuardEvaluationRequest,
  ): Promise<{ authorized: boolean; decision?: AuthorizationDecision; reason?: string }> {
    const { request, requiredPermissions = [], authorizationRule } = evalReq;

    // If route requires no permissions and has no rules, access is allowed
    if (requiredPermissions.length === 0 && !authorizationRule) {
      return { authorized: true };
    }

    const actor = this.actorExtractor(request);
    if (!actor) {
      return {
        authorized: false,
        reason: 'User is not authenticated or could not be resolved into an actor',
      };
    }

    // 1. Evaluate explicit permission list (all required)
    for (const perm of requiredPermissions) {
      const decision = await this.engine.authorize({
        actor,
        action: perm,
        resource: '*',
        organizationId: request.params?.organizationId ?? actor.organizationId,
        branchId: request.params?.branchId ?? actor.branchId,
      });

      if (!decision.allowed) {
        return {
          authorized: false,
          decision,
          reason: decision.reason ?? `Insufficient permissions: '${perm}' required`,
        };
      }
    }

    // 2. Evaluate structured authorization rule if present
    if (authorizationRule) {
      const targetResourceId = request.params?.id ?? request.params?.resourceId ?? null;
      const decision = await this.engine.authorize({
        actor,
        action: authorizationRule.action,
        resource: {
          type: authorizationRule.resource,
          id: targetResourceId,
          ownerId: authorizationRule.requireOwnership ? request.params?.ownerId : undefined,
          organizationId: request.params?.organizationId ?? actor.organizationId,
          branchId: request.params?.branchId ?? actor.branchId,
        },
      });

      if (!decision.allowed) {
        return {
          authorized: false,
          decision,
          reason: decision.reason ?? 'Rule authorization failed',
        };
      }
    }

    return { authorized: true };
  }
}
