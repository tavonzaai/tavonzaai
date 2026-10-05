// ============================================================================
// @tavonza/api — Authorization Service
// ============================================================================
// Central backend provider wrapping the framework-agnostic AuthorizationEngine
// configured with restaurant domain roles, policies, and audit hooks.
// ============================================================================

import { Injectable, Logger } from '@nestjs/common';
import {
  AuthorizationEngine,
  RoleResolver,
  RestaurantRoles,
  HighValueRefundApprovalPolicy,
  OperationalBranchIsolationPolicy,
  AiToolAuthorizer,
  type AiToolDefinition,
  type AuthorizationRequest,
  type AuthorizationDecision,
  type AuthorizationAuditEvent,
} from '@tavonza/authorization';

@Injectable()
export class AuthorizationService {
  private readonly logger = new Logger(AuthorizationService.name);
  private readonly engine: AuthorizationEngine;
  private readonly roleResolver: RoleResolver;

  constructor() {
    this.roleResolver = new RoleResolver({
      roles: Object.values(RestaurantRoles),
    });

    this.engine = new AuthorizationEngine({
      roleResolver: this.roleResolver,
      onDecision: (event: AuthorizationAuditEvent) => {
        this.logDecision(event);
      },
    });

    // Register active domain policies
    const policyEvaluator = this.engine.getPolicyEvaluator();
    policyEvaluator.registerPolicy(HighValueRefundApprovalPolicy);
    policyEvaluator.registerPolicy(OperationalBranchIsolationPolicy);
  }

  /**
   * Evaluates an authorization request and returns a structured decision.
   */
  async authorize(request: AuthorizationRequest): Promise<AuthorizationDecision> {
    return await this.engine.authorize(request);
  }

  /**
   * Evaluates an authorization request and throws a typed exception on denial.
   */
  async assertAuthorized(request: AuthorizationRequest): Promise<AuthorizationDecision> {
    return await this.engine.assertAuthorized(request);
  }

  /**
   * Returns the underlying framework-agnostic AuthorizationEngine.
   */
  getEngine(): AuthorizationEngine {
    return this.engine;
  }

  /**
   * Creates an AiToolAuthorizer configured with the current engine.
   */
  createAiToolAuthorizer(tools: AiToolDefinition[] = []): AiToolAuthorizer {
    return new AiToolAuthorizer(this.engine, tools);
  }

  private logDecision(event: AuthorizationAuditEvent): void {
    if (event.decision === 'DENY' || event.decision === 'REQUIRES_APPROVAL') {
      this.logger.warn(
        `Authorization ${event.decision}: Actor '${event.actorId}' (${event.actorType}) action '${event.action}' on '${event.resource}'. Reason: ${event.reason}`,
      );
    } else {
      this.logger.debug(
        `Authorization ALLOW: Actor '${event.actorId}' action '${event.action}' on '${event.resource}'`,
      );
    }
  }
}
