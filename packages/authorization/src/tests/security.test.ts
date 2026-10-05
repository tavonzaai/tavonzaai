// ============================================================================
// @tavonza/authorization — Unit Tests: Security & Negative Scenarios
// ============================================================================

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { AuthorizationEngine } from '../engine/authorization-engine';
import { createActor } from '../core/actor';
import { createScope, ScopeType } from '../core/scope';
import { InMemoryAuditSink } from '../audit/audit-sink';

describe('Security Invariants & Negative Scenarios', () => {
  it('fails closed when request is completely invalid or missing parameters', async () => {
    const engine = new AuthorizationEngine();

    const decision1 = await engine.authorize(null as any);
    assert.equal(decision1.allowed, false);
    assert.equal(decision1.status, 'DENY');
    assert.equal(decision1.code, 'ERROR_FAIL_CLOSED');

    const decision2 = await engine.authorize({} as any);
    assert.equal(decision2.allowed, false);
    assert.equal(decision2.status, 'DENY');
  });

  it('fails closed for unknown actor without roles or permissions', async () => {
    const engine = new AuthorizationEngine();
    const ghostActor = createActor({ id: 'ghost' });

    const decision = await engine.authorize({
      actor: ghostActor,
      action: 'order:create',
      resource: 'order',
    });

    assert.equal(decision.allowed, false);
    assert.equal(decision.status, 'DENY');
    assert.equal(decision.code, 'DENIED_NO_PERMISSION');
  });

  it('prevents scope escalation when actor attempts to act outside assigned branch', async () => {
    const engine = new AuthorizationEngine();
    const actor = createActor({
      id: 'local-staff',
      permissions: ['order:read'],
      branchId: 'branch-10',
      scopes: [createScope({ type: ScopeType.BRANCH, id: 'branch-10' })],
    });

    // Attacker tries to read order from branch-20
    const decision = await engine.authorize({
      actor,
      action: 'order:read',
      resource: {
        type: 'order',
        id: 'ord-999',
        branchId: 'branch-20',
      },
    });

    assert.equal(decision.allowed, false);
    assert.equal(decision.status, 'DENY');
    assert.equal(decision.code, 'DENIED_SCOPE_MISMATCH');
  });

  it('prevents cross-tenant organization escalation', async () => {
    const engine = new AuthorizationEngine();
    const actor = createActor({
      id: 'org-admin',
      permissions: ['*'], // Wildcard permissions, but tenant-scoped!
      organizationId: 'tenant-alpha',
      scopes: [createScope({ type: ScopeType.ORGANIZATION, id: 'tenant-alpha' })],
    });

    // Attacker has wildcard within tenant-alpha, attempts to query tenant-beta
    const decision = await engine.authorize({
      actor,
      action: 'order:read',
      resource: 'order',
      organizationId: 'tenant-beta',
    });

    assert.equal(decision.allowed, false);
    assert.equal(decision.status, 'DENY');
    assert.equal(decision.code, 'DENIED_SCOPE_MISMATCH');
  });

  it('dispatches structured, non-repudiable audit event on every decision', async () => {
    const auditSink = new InMemoryAuditSink();
    const engine = new AuthorizationEngine({ auditSink });

    const actor = createActor({
      id: 'audited-user',
      permissions: ['order:read'],
      organizationId: 'org-1',
      branchId: 'branch-1',
    });

    // Trigger an authorized decision
    await engine.authorize({
      actor,
      action: 'order:read',
      resource: { type: 'order', id: 'ord-123' },
      requestId: 'req-trace-42',
    });

    // Trigger a denied decision
    await engine.authorize({
      actor,
      action: 'payment:delete',
      resource: { type: 'payment', id: 'pay-456' },
      requestId: 'req-trace-43',
    });

    assert.equal(auditSink.events.length, 2);

    const firstEvent = auditSink.events[0];
    assert.ok(firstEvent);
    assert.equal(firstEvent.actorId, 'audited-user');
    assert.equal(firstEvent.action, 'order:read');
    assert.equal(firstEvent.resource, 'order');
    assert.equal(firstEvent.resourceId, 'ord-123');
    assert.equal(firstEvent.decision, 'ALLOW');
    assert.equal(firstEvent.requestId, 'req-trace-42');

    const secondEvent = auditSink.events[1];
    assert.ok(secondEvent);
    assert.equal(secondEvent.decision, 'DENY');
    assert.equal(secondEvent.requestId, 'req-trace-43');
    assert.match(secondEvent.reason ?? '', /lacks required permission/);
  });
});
