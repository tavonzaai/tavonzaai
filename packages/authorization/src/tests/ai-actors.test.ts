// ============================================================================
// @tavonza/authorization — Unit Tests: AI Actors & Tool Authorization
// ============================================================================

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { createActor, ActorType } from '../core/actor';
import { AuthorizationEngine } from '../engine/authorization-engine';
import { AiToolAuthorizer } from '../adapters/ai/ai-tool-authorizer';
import { createScope, ScopeType } from '../core/scope';

describe('AI Actors & Tool Authorization', () => {
  const engine = new AuthorizationEngine();
  const authorizer = new AiToolAuthorizer(engine, [
    {
      name: 'get_menu',
      resource: 'menu',
      action: 'read',
      riskTier: 'read_only',
    },
    {
      name: 'get_table_status',
      resource: 'table',
      action: 'read',
      riskTier: 'read_only',
    },
    {
      name: 'create_order',
      resource: 'order',
      action: 'create',
      riskTier: 'mutation',
    },
    {
      name: 'refund_payment',
      resource: 'payment',
      action: 'refund',
      riskTier: 'high_risk_approval',
      requiresApproval: true,
    },
  ]);

  it('allows AI agent with valid permission to execute read-only tool', async () => {
    const aiActor = createActor({
      id: 'waiter_ai_agent_v1',
      type: ActorType.AI_AGENT,
      permissions: ['menu:read', 'table:read'],
      organizationId: 'org-1',
      branchId: 'branch-1',
    });

    const decision = await authorizer.authorizeToolCall({
      actor: aiActor,
      tool: 'get_menu',
    });

    assert.equal(decision.allowed, true);
    assert.equal(decision.status, 'ALLOW');
    assert.equal(decision.matchedPermission, 'menu:read');
  });

  it('denies AI agent attempting to call tool without permission', async () => {
    const aiActor = createActor({
      id: 'customer_ai_agent_v1',
      type: ActorType.AI_AGENT,
      permissions: ['menu:read'],
    });

    // Customer AI tries to create order without order:create permission
    const decision = await authorizer.authorizeToolCall({
      actor: aiActor,
      tool: 'create_order',
    });

    assert.equal(decision.allowed, false);
    assert.equal(decision.status, 'DENY');
    assert.match(decision.reason ?? '', /lacks required permission/);
  });

  it('triggers REQUIRES_APPROVAL for high-risk tool execution by AI', async () => {
    const aiActor = createActor({
      id: 'manager_ai_agent_v1',
      type: ActorType.AI_AGENT,
      permissions: ['payment:refund'],
    });

    const decision = await authorizer.authorizeToolCall({
      actor: aiActor,
      tool: 'refund_payment',
      args: { orderId: 'ord-100', amount: 50 },
    });

    assert.equal(decision.allowed, false);
    assert.equal(decision.status, 'REQUIRES_APPROVAL');
    assert.match(decision.reason ?? '', /High-risk tool.*requires.*approval/);
  });

  it('rejects unregistered tool call fail-closed', async () => {
    const aiActor = createActor({
      id: 'agent-1',
      type: ActorType.AI_AGENT,
      permissions: ['*'],
    });

    const decision = await authorizer.authorizeToolCall({
      actor: aiActor,
      tool: 'drop_database',
    });

    assert.equal(decision.allowed, false);
    assert.equal(decision.status, 'DENY');
    assert.match(decision.reason ?? '', /Unknown tool/);
  });

  it('enforces branch isolation on AI agent', async () => {
    const aiActor = createActor({
      id: 'branch_1_agent',
      type: ActorType.AI_AGENT,
      permissions: ['menu:read'],
      branchId: 'branch-1',
      scopes: [createScope({ type: ScopeType.BRANCH, id: 'branch-1' })],
    });

    const decision = await authorizer.authorizeToolCall({
      actor: aiActor,
      tool: 'get_menu',
      branchId: 'branch-2', // AI attempts to query another branch
    });

    assert.equal(decision.allowed, false);
    assert.equal(decision.status, 'DENY');
    assert.match(decision.reason ?? '', /Branch isolation/);
  });
});
