// ============================================================================
// @tavonza/authorization — Unit Tests: Resource Ownership
// ============================================================================

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { createActor } from '../core/actor';
import { createResource } from '../core/resource';
import { OwnershipEvaluator } from '../engine/ownership-evaluator';
import { AuthorizationEngine } from '../engine/authorization-engine';
import { createRole } from '../core/role';
import { RoleResolver } from '../engine/role-resolver';

describe('Resource Ownership', () => {
  const evaluator = new OwnershipEvaluator();

  it('correctly identifies resource owner', () => {
    const actor = createActor({ id: 'user-100' });
    const ownedResource = createResource({ type: 'order', id: 'ord-1', ownerId: 'user-100' });
    const otherResource = createResource({ type: 'order', id: 'ord-2', ownerId: 'user-200' });

    assert.equal(evaluator.isOwner(actor, ownedResource), true);
    assert.equal(evaluator.isOwner(actor, otherResource), false);
  });

  it('fails ownership check when permission is restricted to :own and actor is not owner', () => {
    const actor = createActor({ id: 'user-100' });
    const resource = createResource({ type: 'order', id: 'ord-2', ownerId: 'user-999' });

    const result = evaluator.evaluate({
      actor,
      resource,
      matchedPermission: 'order:read:own',
    });

    assert.equal(result.allowed, false);
    assert.equal(result.isOwner, false);
    assert.match(result.reason ?? '', /restricted to resource owner/);
  });

  it('passes ownership check when permission is :own and actor is owner', () => {
    const actor = createActor({ id: 'user-100' });
    const resource = createResource({ type: 'order', id: 'ord-1', ownerId: 'user-100' });

    const result = evaluator.evaluate({
      actor,
      resource,
      matchedPermission: 'order:read:own',
    });

    assert.equal(result.allowed, true);
    assert.equal(result.isOwner, true);
  });

  it('end-to-end engine ownership evaluation for CUSTOMER role', async () => {
    const roleResolver = new RoleResolver({
      roles: [
        createRole({
          name: 'CUSTOMER',
          permissions: ['order:read:own', 'order:create'],
        }),
      ],
    });

    const engine = new AuthorizationEngine({ roleResolver });

    const customer = createActor({
      id: 'customer-1',
      roles: ['CUSTOMER'],
    });

    const ownOrder = createResource({
      type: 'order',
      id: 'ord-1',
      ownerId: 'customer-1',
    });

    const foreignOrder = createResource({
      type: 'order',
      id: 'ord-2',
      ownerId: 'customer-2',
    });

    // Reading own order -> ALLOW
    const ownDecision = await engine.authorize({
      actor: customer,
      action: 'read',
      resource: ownOrder,
    });
    assert.equal(ownDecision.allowed, true);
    assert.equal(ownDecision.status, 'ALLOW');

    // Reading another customer order -> DENY
    const foreignDecision = await engine.authorize({
      actor: customer,
      action: 'read',
      resource: foreignOrder,
    });
    assert.equal(foreignDecision.allowed, false);
    assert.equal(foreignDecision.status, 'DENY');
    assert.equal(foreignDecision.code, 'DENIED_NOT_OWNER');
  });
});
