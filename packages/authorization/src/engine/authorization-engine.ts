// ============================================================================
// @tavonza/authorization — Central Authorization Engine
// ============================================================================
// Single, authoritative decision point for all access checks across HTTP, AI,
// background workers, and internal services.
// Framework-agnostic and fail-closed by design.
// ============================================================================

import type { Actor } from '../core/actor';
import type { AuthorizationRequest, NormalizedAuthorizationContext } from '../core/context';
import { normalizeAuthorizationRequest } from '../core/context';
import type { AuthorizationDecision } from '../core/decision';
import { allow, deny, requiresApproval } from '../core/decision';
import {
  ApprovalRequiredError,
  OwnershipDeniedError,
  PermissionDeniedError,
  PolicyDeniedError,
  ScopeDeniedError,
} from '../core/errors';
import type { PolicyContext } from '../core/policy';
import type { Scope } from '../core/scope';
import type { AuthorizationAuditEvent } from '../audit/audit-record';
import type { AuditSink, DecisionHook } from '../audit/audit-sink';
import { CompositeAuditSink } from '../audit/audit-sink';
import { OwnershipEvaluator } from './ownership-evaluator';
import { PermissionResolver } from './permission-resolver';
import { PolicyEvaluator } from './policy-evaluator';
import { RoleResolver } from './role-resolver';
import { ScopeResolver } from './scope-resolver';

export interface AuthorizationEngineOptions {
  roleResolver?: RoleResolver;
  permissionResolver?: PermissionResolver;
  scopeResolver?: ScopeResolver;
  ownershipEvaluator?: OwnershipEvaluator;
  policyEvaluator?: PolicyEvaluator;
  auditSink?: AuditSink;
  onDecision?: DecisionHook;
  wildcardsEnabled?: boolean;
  ownershipEnabled?: boolean;
  policiesEnabled?: boolean;
}

export class AuthorizationEngine {
  private readonly roleResolver: RoleResolver;
  private readonly permissionResolver: PermissionResolver;
  private readonly scopeResolver: ScopeResolver;
  private readonly ownershipEvaluator: OwnershipEvaluator;
  private readonly policyEvaluator: PolicyEvaluator;
  private readonly compositeAuditSink: CompositeAuditSink;
  private readonly decisionHooks: DecisionHook[] = [];
  private readonly wildcardsEnabled: boolean;
  private readonly ownershipEnabled: boolean;
  private readonly policiesEnabled: boolean;

  constructor(options?: AuthorizationEngineOptions) {
    this.roleResolver = options?.roleResolver ?? new RoleResolver();
    this.permissionResolver =
      options?.permissionResolver ?? new PermissionResolver(this.roleResolver);
    this.scopeResolver = options?.scopeResolver ?? new ScopeResolver();
    this.ownershipEvaluator = options?.ownershipEvaluator ?? new OwnershipEvaluator();
    this.policyEvaluator = options?.policyEvaluator ?? new PolicyEvaluator();

    this.compositeAuditSink = new CompositeAuditSink();
    if (options?.auditSink) {
      this.compositeAuditSink.addSink(options.auditSink);
    }
    if (options?.onDecision) {
      this.decisionHooks.push(options.onDecision);
    }

    this.wildcardsEnabled = options?.wildcardsEnabled ?? true;
    this.ownershipEnabled = options?.ownershipEnabled ?? true;
    this.policiesEnabled = options?.policiesEnabled ?? true;
  }

  /**
   * Registers an external audit sink for persistence or SIEM forwarding.
   */
  addAuditSink(sink: AuditSink): void {
    this.compositeAuditSink.addSink(sink);
  }

  /**
   * Registers an inline hook called whenever an authorization decision is finalized.
   */
  onDecision(hook: DecisionHook): void {
    this.decisionHooks.push(hook);
  }

  /**
   * Exposes the active RoleResolver for adding custom roles.
   */
  getRoleResolver(): RoleResolver {
    return this.roleResolver;
  }

  /**
   * Exposes the active PolicyEvaluator for adding custom ABAC policies.
   */
  getPolicyEvaluator(): PolicyEvaluator {
    return this.policyEvaluator;
  }

  /**
   * Authorizes an incoming request.
   * Central evaluation pipeline:
   *   Actor -> Roles -> Permissions -> Wildcards -> Scope -> Ownership -> Policies -> Decision
   *
   * Guaranteed to fail-closed on any runtime error.
   */
  async authorize(request: AuthorizationRequest): Promise<AuthorizationDecision> {
    let ctx: NormalizedAuthorizationContext;
    try {
      ctx = normalizeAuthorizationRequest(request);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Invalid authorization request';
      return deny({
        reason: `Malformed request: ${errorMsg}`,
        code: 'ERROR_FAIL_CLOSED',
      });
    }

    let decision: AuthorizationDecision;

    try {
      decision = await this.evaluatePipeline(ctx);
    } catch (err: unknown) {
      // Fail closed on unhandled engine exception
      const errorMsg = err instanceof Error ? err.message : 'Unknown evaluation exception';
      decision = deny({
        reason: `Internal authorization failure: ${errorMsg}`,
        code: 'ERROR_FAIL_CLOSED',
        scope: ctx.scope,
      });
    }

    // Emit audit record
    await this.dispatchAudit(decision, ctx);

    return decision;
  }

  /**
   * Evaluates the request and throws a typed AuthorizationError if not allowed.
   */
  async assertAuthorized(request: AuthorizationRequest): Promise<AuthorizationDecision> {
    const decision = await this.authorize(request);
    if (!decision.allowed) {
      if (decision.status === 'REQUIRES_APPROVAL') {
        throw new ApprovalRequiredError(
          decision.reason ?? 'Approval required for this action',
          (decision.metadata as any)?.approvalRequestId,
          decision,
        );
      }

      switch (decision.code) {
        case 'DENIED_SCOPE_MISMATCH':
          throw new ScopeDeniedError(decision.reason ?? 'Scope boundary mismatch', decision);
        case 'DENIED_NOT_OWNER':
          throw new OwnershipDeniedError(
            decision.reason ?? 'Resource ownership required',
            decision,
          );
        case 'DENIED_POLICY':
          throw new PolicyDeniedError(
            decision.reason ?? 'Denied by dynamic policy',
            decision.matchedPolicy,
            decision,
          );
        case 'DENIED_NO_PERMISSION':
        default:
          throw new PermissionDeniedError(
            decision.reason ?? 'Insufficient permissions',
            decision.matchedPermission,
            decision,
          );
      }
    }

    return decision;
  }

  /**
   * Simplified capability check for fast evaluation in legacy call sites.
   */
  async hasPermission(
    actor: Actor,
    permission: string,
    scope?: Scope,
  ): Promise<boolean> {
    const decision = await this.authorize({
      actor,
      action: permission,
      resource: '*',
      scope,
    });
    return decision.allowed;
  }

  // ── Private Pipeline ──────────────────────────────────────────────────

  private async evaluatePipeline(
    ctx: NormalizedAuthorizationContext,
  ): Promise<AuthorizationDecision> {
    // 1. Resolve actor permissions
    const { permissions: actorPermissions, permissionToRoleMap } =
      await this.permissionResolver.resolveActorPermissions(ctx.actor);

    // 2. Determine initial ownership status for permission evaluation
    const isOwner = this.ownershipEvaluator.isOwner(ctx.actor, ctx.resource);

    // 3. Permission & Wildcard matching
    const matchResult = this.permissionResolver.match({
      grantedPermissions: actorPermissions,
      requestedPermission: ctx.requiredPermission,
      permissionToRoleMap,
      isOwner,
      wildcardsEnabled: this.wildcardsEnabled,
    });

    if (!matchResult.matched) {
      if (matchResult.requiresOwnership) {
        return deny({
          reason: `Permission '${matchResult.matchedPermission}' is restricted to resource owner`,
          code: 'DENIED_NOT_OWNER',
          matchedPermission: matchResult.matchedPermission,
          matchedRole: matchResult.matchedRole,
          scope: ctx.scope,
        });
      }

      return deny({
        reason: `Actor lacks required permission '${ctx.requiredPermission}'`,
        code: 'DENIED_NO_PERMISSION',
        matchedPermission: undefined,
        scope: ctx.scope,
      });
    }

    // 4. Scope evaluation
    const scopeResult = this.scopeResolver.evaluateScope({
      actor: ctx.actor,
      targetScope: ctx.scope,
      targetOrganizationId: ctx.organizationId,
      targetBranchId: ctx.branchId,
      resource: ctx.resource,
    });

    if (!scopeResult.allowed) {
      return deny({
        reason: scopeResult.reason ?? 'Scope constraints not satisfied',
        code: 'DENIED_SCOPE_MISMATCH',
        matchedPermission: matchResult.matchedPermission,
        matchedRole: matchResult.matchedRole,
        scope: ctx.scope,
      });
    }

    // 5. Ownership evaluation
    if (this.ownershipEnabled) {
      const ownershipResult = this.ownershipEvaluator.evaluate({
        actor: ctx.actor,
        resource: ctx.resource,
        matchedPermission: matchResult.matchedPermission,
      });

      if (!ownershipResult.allowed) {
        return deny({
          reason: ownershipResult.reason ?? 'Ownership criteria not met',
          code: 'DENIED_NOT_OWNER',
          matchedPermission: matchResult.matchedPermission,
          matchedRole: matchResult.matchedRole,
          scope: ctx.scope,
        });
      }
    }

    // 6. Dynamic ABAC Policy evaluation
    if (this.policiesEnabled) {
      const policyCtx: PolicyContext = {
        actor: ctx.actor,
        action: ctx.action,
        resource: ctx.resource,
        scope: ctx.scope,
        environment: ctx.environment,
        metadata: ctx.metadata,
      };

      const policyOutcome = await this.policyEvaluator.evaluate(policyCtx);

      if (policyOutcome.effect === 'DENY') {
        return deny({
          reason: policyOutcome.reason ?? 'Denied by dynamic policy',
          code: 'DENIED_POLICY',
          matchedPermission: matchResult.matchedPermission,
          matchedRole: matchResult.matchedRole,
          matchedPolicy: policyOutcome.matchedPolicy,
          scope: ctx.scope,
          metadata: policyOutcome.metadata ? { ...policyOutcome.metadata } : undefined,
        });
      }

      if (policyOutcome.effect === 'REQUIRES_APPROVAL') {
        return requiresApproval({
          reason: policyOutcome.reason ?? 'Action requires authorization approval',
          matchedPermission: matchResult.matchedPermission,
          matchedPolicy: policyOutcome.matchedPolicy,
          scope: ctx.scope,
          metadata: policyOutcome.metadata ? { ...policyOutcome.metadata } : undefined,
        });
      }
    }

    // 7. Allowed
    return allow({
      reason: 'Authorized',
      matchedPermission: matchResult.matchedPermission,
      matchedRole: matchResult.matchedRole,
      scope: scopeResult.matchedScope ?? ctx.scope,
    });
  }

  private async dispatchAudit(
    decision: AuthorizationDecision,
    ctx: NormalizedAuthorizationContext,
  ): Promise<void> {
    const auditEvent: AuthorizationAuditEvent = {
      actorId: ctx.actor.id,
      actorType: ctx.actor.type,
      action: ctx.action,
      resource: ctx.resource.type,
      resourceId: ctx.resource.id,
      scope: decision.scope ?? ctx.scope,
      organizationId: ctx.organizationId,
      branchId: ctx.branchId,
      decision: decision.status,
      reason: decision.reason,
      matchedPermission: decision.matchedPermission,
      matchedRole: decision.matchedRole,
      matchedPolicy: decision.matchedPolicy,
      timestamp: new Date(decision.timestamp).toISOString(),
      requestId: ctx.requestId,
      metadata: decision.metadata,
    };

    // Forward to sinks
    try {
      await this.compositeAuditSink.record(auditEvent);
    } catch {
      // Never crash on audit failure
    }

    // Call inline decision hooks
    for (const hook of this.decisionHooks) {
      try {
        await hook(auditEvent);
      } catch {
        // Safe hook execution
      }
    }
  }
}
