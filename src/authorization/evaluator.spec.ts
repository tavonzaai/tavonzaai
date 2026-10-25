import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { ActorType } from './actor';
import { checkCapability, hasPermission } from './evaluator';
import {
  actorCanGrantPermissions,
  isAssignableStaffRole,
  normalizePermissionKey,
  toStoredPermissionAction,
} from './permission-aliases';

describe('normalizePermissionKey', () => {
  it('maps database actions, dotted names, and colon names to the same key', () => {
    assert.equal(normalizePermissionKey('MANAGE_MENU'), 'menu:manage');
    assert.equal(normalizePermissionKey('menu.manage'), 'menu:manage');
    assert.equal(normalizePermissionKey('menu:manage'), 'menu:manage');
    assert.equal(normalizePermissionKey('VIEW_ORDERS'), 'orders:read');
  });
});

describe('checkCapability', () => {
  it('matches MANAGE_MENU against menu:manage', () => {
    assert.equal(checkCapability(['MANAGE_MENU'], 'menu:manage'), true);
    assert.equal(checkCapability(['menu:manage'], 'MANAGE_MENU'), true);
  });

  it('lets module manage satisfy write/read', () => {
    assert.equal(checkCapability(['staff:manage'], 'staff:write'), true);
    assert.equal(checkCapability(['staff:manage'], 'staff:read'), true);
    assert.equal(checkCapability(['orders:read'], 'orders:write'), false);
  });
});

describe('staff assignment policy helpers', () => {
  it('accepts only fixed staff roles', () => {
    assert.equal(isAssignableStaffRole('WAITER'), true);
    assert.equal(isAssignableStaffRole('SUPER_ADMIN'), false);
    assert.equal(isAssignableStaffRole('ADMIN'), false);
  });

  it('stores only known permission actions', () => {
    assert.equal(toStoredPermissionAction('menu.manage'), 'MANAGE_MENU');
    assert.equal(toStoredPermissionAction('not-a-real-permission'), null);
  });

  it('prevents granting permissions the actor does not hold', () => {
    assert.equal(
      actorCanGrantPermissions(['VIEW_ORDERS'], ['MANAGE_STAFF']),
      false,
    );
    assert.equal(actorCanGrantPermissions(['MANAGE_STAFF'], ['staff:manage']), true);
    assert.equal(actorCanGrantPermissions(['*'], ['MANAGE_MENU']), true);
  });
});

describe('hasPermission scope', () => {
  it('denies a branch-scoped waiter from another branch', () => {
    const allowed = hasPermission(
      {
        actorType: ActorType.USER,
        actorId: 'waiter-1',
        role: 'WAITER',
        permissions: ['orders:read'],
        scopes: [{ type: 'branch', id: 'branch-a' }],
        organizationId: 'org-1',
      },
      'orders:read',
      { type: 'branch', id: 'branch-b' },
    );
    assert.equal(allowed, false);
  });

  it('allows an organization-scoped admin for a branch check', () => {
    const allowed = hasPermission(
      {
        actorType: ActorType.USER,
        actorId: 'admin-1',
        role: 'ADMIN',
        permissions: ['*'],
        scopes: [{ type: 'organization', id: 'org-1' }],
        organizationId: 'org-1',
      },
      'staff:write',
      { type: 'branch', id: 'branch-a' },
    );
    assert.equal(allowed, true);
  });
});
