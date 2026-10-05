// ============================================================================
// @tavonza/authorization — Unit Tests: Permissions & Normalization
// ============================================================================

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  matchesPermission,
  normalizePermission,
  parsePermission,
  createPermissionString,
} from '../core/permission';
import { PermissionResolver } from '../engine/permission-resolver';
import { createActor } from '../core/actor';

describe('Permissions & Normalization', () => {
  it('normalizes dot notation to colon notation', () => {
    assert.equal(normalizePermission('orders.read'), 'orders:read');
    assert.equal(normalizePermission('payments.refund'), 'payments:refund');
    assert.equal(normalizePermission('  MENU.UPDATE  '), 'menu:update');
  });

  it('preserves global wildcard as *', () => {
    assert.equal(normalizePermission('*'), '*');
  });

  it('parses standard permission strings', () => {
    const parsed = parsePermission('order:read');
    assert.equal(parsed.resource, 'order');
    assert.equal(parsed.action, 'read');
    assert.equal(parsed.qualifier, undefined);
    assert.equal(parsed.isWildcard, false);
  });

  it('parses ownership-qualified permissions', () => {
    const parsed = parsePermission('order:read:own');
    assert.equal(parsed.resource, 'order');
    assert.equal(parsed.action, 'read');
    assert.equal(parsed.qualifier, 'own');
    assert.equal(parsed.isWildcard, false);

    const parsedAny = parsePermission('order:update:any');
    assert.equal(parsedAny.qualifier, 'any');
  });

  it('correctly builds canonical permission strings', () => {
    assert.equal(createPermissionString('Order', 'Read'), 'order:read');
    assert.equal(createPermissionString('Order', 'Read', 'own'), 'order:read:own');
  });

  it('matches exact permissions', () => {
    assert.equal(matchesPermission('order:read', 'order:read'), true);
    assert.equal(matchesPermission('order:read', 'order:create'), false);
    assert.equal(matchesPermission('order:read', 'product:read'), false);
  });

  it('resolves and deduplicates actor permissions via PermissionResolver', async () => {
    const resolver = new PermissionResolver();
    const actor = createActor({
      id: 'user-1',
      permissions: ['order:read', 'orders.read', 'order:create', 'ORDER:READ'],
    });

    const result = await resolver.resolveActorPermissions(actor);
    assert.deepEqual(result.permissions.sort(), ['order:create', 'order:read', 'orders:read'].sort());
  });

  it('matches permission with dot or colon delimiter interchangeably', () => {
    const resolver = new PermissionResolver();
    const match = resolver.match({
      grantedPermissions: ['order:read'],
      requestedPermission: 'order.read',
    });
    assert.equal(match.matched, true);
    assert.equal(match.matchedPermission, 'order:read');
  });
});
