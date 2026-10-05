// ============================================================================
// @tavonza/authorization — Unit Tests: Wildcard Matching
// ============================================================================

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { matchesPermission } from '../core/permission';
import { PermissionResolver } from '../engine/permission-resolver';

describe('Wildcard Resolution', () => {
  it('global wildcard (*) matches any resource and action', () => {
    assert.equal(matchesPermission('*', 'order:read'), true);
    assert.equal(matchesPermission('*', 'payment:refund'), true);
    assert.equal(matchesPermission('*', 'anything:anyaction'), true);
  });

  it('resource wildcard (order:*) matches all actions on that resource', () => {
    assert.equal(matchesPermission('order:*', 'order:read'), true);
    assert.equal(matchesPermission('order:*', 'order:create'), true);
    assert.equal(matchesPermission('order:*', 'order:update'), true);
    assert.equal(matchesPermission('order:*', 'order:delete'), true);
    assert.equal(matchesPermission('order:*', 'order:custom_action'), true);

    // But does not grant access to different resources
    assert.equal(matchesPermission('order:*', 'payment:read'), false);
    assert.equal(matchesPermission('order:*', 'product:create'), false);
  });

  it('action wildcard (*:read) matches read on any resource', () => {
    assert.equal(matchesPermission('*:read', 'order:read'), true);
    assert.equal(matchesPermission('*:read', 'product:read'), true);
    assert.equal(matchesPermission('*:read', 'payment:read'), true);

    // But does not grant write actions
    assert.equal(matchesPermission('*:read', 'order:create'), false);
  });

  it('resolver prioritizes global wildcard first', () => {
    const resolver = new PermissionResolver();
    const result = resolver.match({
      grantedPermissions: ['order:read', '*', 'product:read'],
      requestedPermission: 'order:read',
    });
    assert.equal(result.matched, true);
    assert.equal(result.matchedPermission, '*');
  });

  it('resolver matches resource wildcard when exact match is absent', () => {
    const resolver = new PermissionResolver();
    const result = resolver.match({
      grantedPermissions: ['table:*', 'menu:read'],
      requestedPermission: 'table:update',
    });
    assert.equal(result.matched, true);
    assert.equal(result.matchedPermission, 'table:*');
  });

  it('respects wildcardsEnabled: false configuration', () => {
    const resolver = new PermissionResolver();
    const result = resolver.match({
      grantedPermissions: ['*'],
      requestedPermission: 'order:read',
      wildcardsEnabled: false,
    });
    // With wildcards disabled, '*' should not match 'order:read'
    assert.equal(result.matched, false);

    const resourceWildcardResult = resolver.match({
      grantedPermissions: ['order:*'],
      requestedPermission: 'order:read',
      wildcardsEnabled: false,
    });
    assert.equal(resourceWildcardResult.matched, false);
  });
});
