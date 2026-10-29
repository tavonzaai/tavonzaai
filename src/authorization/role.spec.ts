import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  ASSISTANT_MANAGER_PERMISSIONS,
  Permission,
  StaffRole,
  resolveStaffPermissions,
} from './index';

describe('resolveStaffPermissions', () => {
  it('uses role defaults when no template is stored', () => {
    const permissions = resolveStaffPermissions(StaffRole.WAITER);
    assert.equal(permissions.includes(Permission.ORDERS_CREATE), true);
    assert.equal(permissions.includes(Permission.TABLES_READ), true);
  });

  it('lets an explicit assistant-manager template replace manager defaults', () => {
    const permissions = resolveStaffPermissions(
      StaffRole.BRANCH_MANAGER,
      ASSISTANT_MANAGER_PERMISSIONS,
    );
    assert.equal(permissions.includes(Permission.MANAGE_STAFF), false);
    assert.equal(permissions.includes(Permission.BRANCH_SETTINGS_MANAGE), false);
    assert.equal(permissions.includes(Permission.VIEW_ORDERS), true);
    assert.equal(permissions.includes(Permission.ROLES_WRITE), false);
  });
});
