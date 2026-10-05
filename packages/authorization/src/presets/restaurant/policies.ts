// ============================================================================
// @tavonza/authorization — Restaurant Domain Preset: Policies
// ============================================================================
// Real-world ABAC policy implementations for restaurant financial and operational safety.
// ============================================================================

import { createPolicy, type Policy, type PolicyContext, type PolicyResult } from '../../core/policy';

/**
 * Requires managerial approval for high-value refunds exceeding $100
 * or exceeding the actor's custom limit.
 */
export const HighValueRefundApprovalPolicy: Policy = createPolicy({
  id: 'policy_high_value_refund_approval',
  name: 'High Value Refund Approval Policy',
  description: 'Triggers approval required when refund amount exceeds limit ($100 by default)',
  priority: 10,
  appliesTo: (ctx: PolicyContext) => {
    const isRefund =
      ctx.action === 'payment:refund' ||
      ctx.action === 'payments.refund' ||
      ctx.action.endsWith(':refund');
    return isRefund;
  },
  evaluate: (ctx: PolicyContext): PolicyResult => {
    const amount = Number(ctx.environment?.amount ?? ctx.resource.attributes?.amount ?? 0);
    const actorLimit = Number(ctx.actor.attributes?.refundLimit ?? 100);

    if (amount > actorLimit) {
      return {
        effect: 'REQUIRES_APPROVAL',
        reason: `Refund amount ($${amount}) exceeds maximum threshold ($${actorLimit}). Manager approval required.`,
        code: 'APPROVAL_REQUIRED',
        metadata: {
          requestedAmount: amount,
          approvalThreshold: actorLimit,
        },
      };
    }

    return { effect: 'ALLOW' };
  },
});

/**
 * Enforces strict branch boundary containment for operational mutations.
 */
export const OperationalBranchIsolationPolicy: Policy = createPolicy({
  id: 'policy_branch_isolation',
  name: 'Operational Branch Isolation Policy',
  description: 'Prohibits branch staff from modifying orders or tables in other branches',
  priority: 20,
  appliesTo: (ctx: PolicyContext) => {
    return Boolean(ctx.actor.branchId && ctx.resource.branchId);
  },
  evaluate: (ctx: PolicyContext): PolicyResult => {
    // If actor is super admin or org owner, they may cross branches
    if (ctx.actor.roles?.includes('SUPER_ADMIN') || ctx.actor.roles?.includes('ADMIN')) {
      return { effect: 'ALLOW' };
    }

    if (ctx.actor.branchId !== ctx.resource.branchId) {
      return {
        effect: 'DENY',
        reason: `Branch mismatch: Staff assigned to branch '${ctx.actor.branchId}' cannot access branch '${ctx.resource.branchId}'`,
        code: 'DENIED_SCOPE_MISMATCH',
      };
    }

    return { effect: 'ALLOW' };
  },
});
