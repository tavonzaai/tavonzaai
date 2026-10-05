// ============================================================================
// @tavonza/authorization — Unit Tests: Dynamic ABAC Policies & Approvals
// ============================================================================

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { createPolicy, type PolicyContext } from '../core/policy';
import { PolicyEvaluator } from '../engine/policy-evaluator';
import { AuthorizationEngine } from '../engine/authorization-engine';
import { createActor } from '../core/actor';
import { createResource } from '../core/resource';
import { HighValueRefundApprovalPolicy } from '../presets/restaurant/policies';

describe('Dynamic ABAC Policies & Approvals', () => {
  it('allows action when policy condition succeeds', async () => {
    const policy = createPolicy({
      id: 'time_check',
      name: 'Working Hours Policy',
      evaluate: (_ctx: PolicyContext) => true,
    });

    const evaluator = new PolicyEvaluator({ policies: [policy] });
    const actor = createActor({ id: 'u1' });
    const resource = createResource({ type: 'item' });

    const result = await evaluator.evaluate({
      actor,
      action: 'item:read',
      resource,
    });

    assert.equal(result.effect, 'ALLOW');
  });

  it('denies action when policy condition fails', async () => {
    const policy = createPolicy({
      id: 'maintenance_block',
      name: 'Maintenance Lockout',
      evaluate: (ctx: PolicyContext) => {
        if (ctx.environment?.isMaintenanceMode) {
          return {
            effect: 'DENY',
            reason: 'System is in maintenance mode',
          };
        }
        return true;
      },
    });

    const evaluator = new PolicyEvaluator({ policies: [policy] });
    const actor = createActor({ id: 'u1' });
    const resource = createResource({ type: 'order' });

    const result = await evaluator.evaluate({
      actor,
      action: 'order:create',
      resource,
      environment: { isMaintenanceMode: true },
    });

    assert.equal(result.effect, 'DENY');
    assert.match(result.reason ?? '', /maintenance mode/);
  });

  it('triggers REQUIRES_APPROVAL status on high-value refund policy', async () => {
    const evaluator = new PolicyEvaluator({
      policies: [HighValueRefundApprovalPolicy],
    });

    const actor = createActor({
      id: 'cashier-1',
      attributes: { refundLimit: 50 },
    });

    const resource = createResource({
      type: 'payment',
      attributes: { amount: 150 },
    });

    const result = await evaluator.evaluate({
      actor,
      action: 'payment:refund',
      resource,
      environment: { amount: 150 },
    });

    assert.equal(result.effect, 'REQUIRES_APPROVAL');
    assert.equal(result.code, 'APPROVAL_REQUIRED');
    assert.match(result.reason ?? '', /Manager approval required/);
  });

  it('executes policies in priority order (lower number first)', async () => {
    const executionOrder: string[] = [];

    const policyA = createPolicy({
      id: 'pol-a',
      name: 'Policy A',
      priority: 200,
      evaluate: () => {
        executionOrder.push('A');
        return true;
      },
    });

    const policyB = createPolicy({
      id: 'pol-b',
      name: 'Policy B',
      priority: 10,
      evaluate: () => {
        executionOrder.push('B');
        return true;
      },
    });

    const evaluator = new PolicyEvaluator({ policies: [policyA, policyB] });
    const actor = createActor({ id: 'u1' });
    const resource = createResource({ type: 'res' });

    await evaluator.evaluate({ actor, action: 'test', resource });
    assert.deepEqual(executionOrder, ['B', 'A']);
  });

  it('engine integrates policy evaluator into full pipeline', async () => {
    const policyEvaluator = new PolicyEvaluator({
      policies: [HighValueRefundApprovalPolicy],
    });

    const engine = new AuthorizationEngine({
      policyEvaluator,
    });

    const cashier = createActor({
      id: 'cashier-1',
      permissions: ['payment:refund'],
      attributes: { refundLimit: 75 },
    });

    // Small refund under limit -> ALLOW
    const smallDecision = await engine.authorize({
      actor: cashier,
      action: 'payment:refund',
      resource: 'payment',
      environment: { amount: 30 },
    });
    assert.equal(smallDecision.allowed, true);
    assert.equal(smallDecision.status, 'ALLOW');

    // Large refund over limit -> REQUIRES_APPROVAL
    const largeDecision = await engine.authorize({
      actor: cashier,
      action: 'payment:refund',
      resource: 'payment',
      environment: { amount: 200 },
    });
    assert.equal(largeDecision.allowed, false);
    assert.equal(largeDecision.status, 'REQUIRES_APPROVAL');
    assert.equal(largeDecision.matchedPolicy, 'policy_high_value_refund_approval');
  });
});
