// ============================================================================
// @tavonza/authorization — Engine: Policy Evaluator
// ============================================================================
// Evaluates context-aware, dynamic ABAC policies and approval requirements.
// ============================================================================

import type { Policy, PolicyContext, PolicyEffect, PolicyResult } from '../core/policy';

export interface PolicyProvider {
  getPolicies(): Policy[] | Promise<Policy[]>;
}

export interface PolicyEvaluationOutcome {
  readonly effect: PolicyEffect;
  readonly matchedPolicy?: string;
  readonly reason?: string;
  readonly code?: string;
  readonly metadata?: Readonly<Record<string, unknown>>;
}

export class PolicyEvaluator {
  private readonly staticPolicies: Policy[] = [];
  private readonly externalProvider?: PolicyProvider;

  constructor(options?: { policies?: Policy[]; provider?: PolicyProvider }) {
    if (options?.policies) {
      this.staticPolicies.push(...options.policies);
    }
    this.externalProvider = options?.provider;
  }

  /**
   * Registers a dynamic policy.
   */
  registerPolicy(policy: Policy): void {
    this.staticPolicies.push(policy);
  }

  /**
   * Returns all active policies sorted by priority.
   */
  async getAllPolicies(): Promise<Policy[]> {
    const list = [...this.staticPolicies];
    if (this.externalProvider) {
      const ext = await this.externalProvider.getPolicies();
      list.push(...ext);
    }
    return list.sort((a, b) => (a.priority ?? 100) - (b.priority ?? 100));
  }

  /**
   * Evaluates all applicable policies for the given context.
   * Fail-closed: first DENY or REQUIRES_APPROVAL immediately terminates evaluation.
   */
  async evaluate(context: PolicyContext): Promise<PolicyEvaluationOutcome> {
    const policies = await this.getAllPolicies();

    for (const policy of policies) {
      const applies = await policy.appliesTo(context);
      if (!applies) continue;

      const evalResult = await policy.evaluate(context);
      const result: PolicyResult =
        typeof evalResult === 'boolean'
          ? {
              effect: evalResult ? 'ALLOW' : 'DENY',
              reason: evalResult ? undefined : `Denied by policy: ${policy.name}`,
            }
          : evalResult;

      if (result.effect === 'DENY') {
        return {
          effect: 'DENY',
          matchedPolicy: policy.id,
          reason: result.reason ?? `Action rejected by policy '${policy.name}'`,
          code: result.code ?? 'POLICY_DENIED',
          metadata: result.metadata,
        };
      }

      if (result.effect === 'REQUIRES_APPROVAL') {
        return {
          effect: 'REQUIRES_APPROVAL',
          matchedPolicy: policy.id,
          reason: result.reason ?? `Action requires authorization approval per policy '${policy.name}'`,
          code: result.code ?? 'APPROVAL_REQUIRED',
          metadata: result.metadata,
        };
      }
    }

    return {
      effect: 'ALLOW',
    };
  }
}
