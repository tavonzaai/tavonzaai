import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  BRANCH_MANAGER_CREATABLE_ROLES,
  canAccessBranch,
  canCreateStaffRole,
} from './branch-access.policy.ts';

const branch = {
  branchId: 'b1',
  restaurantId: 'r1',
  organizationId: 'o1',
  organizationOwnerId: 'owner-1',
};

describe('branch-access.policy', () => {
  it('allows super admins and owning org admins', () => {
    assert.equal(
      canAccessBranch(
        { userId: 'x', isSuperAdmin: true, isOrganizationAdmin: false, scopes: [] },
        branch,
      ),
      true,
    );
    assert.equal(
      canAccessBranch(
        { userId: 'owner-1', isSuperAdmin: false, isOrganizationAdmin: true, scopes: [] },
        branch,
      ),
      true,
    );
  });

  it('requires a matching live scope for staff', () => {
    assert.equal(
      canAccessBranch(
        {
          userId: 'staff-1',
          isSuperAdmin: false,
          isOrganizationAdmin: false,
          scopes: [{ type: 'branch', id: 'other' }],
        },
        branch,
      ),
      false,
    );
    assert.equal(
      canAccessBranch(
        {
          userId: 'staff-1',
          isSuperAdmin: false,
          isOrganizationAdmin: false,
          scopes: [{ type: 'branch', id: 'b1' }],
        },
        branch,
      ),
      true,
    );
  });

  it('limits branch managers to waiter/cashier/kitchen roles', () => {
    assert.deepEqual([...BRANCH_MANAGER_CREATABLE_ROLES], ['WAITER', 'CASHIER', 'KITCHEN_STAFF']);
    assert.equal(canCreateStaffRole({ isPrivileged: false, managesBranch: true }, 'WAITER'), true);
    assert.equal(
      canCreateStaffRole({ isPrivileged: false, managesBranch: true }, 'BRANCH_MANAGER'),
      false,
    );
    assert.equal(
      canCreateStaffRole({ isPrivileged: true, managesBranch: false }, 'BRANCH_MANAGER'),
      true,
    );
  });
});
