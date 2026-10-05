// ============================================================================
// @tavonza/authorization — Integration Tests: End-to-End & HTTP Guard
// ============================================================================

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { AuthorizationEngine } from '../engine/authorization-engine';
import { RoleResolver } from '../engine/role-resolver';
import { createActor } from '../core/actor';
import { createScope, ScopeType } from '../core/scope';
import { createResource } from '../core/resource';
import {
  ApprovalRequiredError,
  OwnershipDeniedError,
  PermissionDeniedError,
  ScopeDeniedError,
} from '../core/errors';
import { GenericHttpAuthorizationGuard } from '../adapters/http/generic-guard';
import { hasPermission } from '../compatibility/legacy-exports';
import { RestaurantRoles } from '../presets/restaurant/roles';

describe('End-to-End Engine & HTTP Guard Integration', () => {
  const roleResolver = new RoleResolver({
    roles: Object.values(RestaurantRoles),
  });
  const engine = new AuthorizationEngine({ roleResolver });

  it('assertAuthorized throws PermissionDeniedError when permission is missing', async () => {
    const actor = createActor({ id: 'staff-1', roles: ['WAITER'] });

    await assert.rejects(
      async () => {
        await engine.assertAuthorized({
          actor,
          action: 'payment:refund', // Waiter cannot refund
          resource: 'payment',
        });
      },
      (err: any) => {
        assert.ok(err instanceof PermissionDeniedError);
        assert.equal(err.code, 'PERMISSION_DENIED');
        return true;
      },
    );
  });

  it('assertAuthorized throws ScopeDeniedError when branch does not match', async () => {
    const actor = createActor({
      id: 'staff-1',
      roles: ['WAITER'],
      branchId: 'branch-A',
      scopes: [createScope({ type: ScopeType.BRANCH, id: 'branch-A' })],
    });

    await assert.rejects(
      async () => {
        await engine.assertAuthorized({
          actor,
          action: 'order:create',
          resource: createResource({ type: 'order', branchId: 'branch-B' }),
          branchId: 'branch-B',
        });
      },
      (err: any) => {
        assert.ok(err instanceof ScopeDeniedError);
        assert.equal(err.code, 'SCOPE_DENIED');
        return true;
      },
    );
  });

  it('assertAuthorized throws OwnershipDeniedError for customer accessing other orders', async () => {
    const actor = createActor({
      id: 'customer-1',
      roles: ['CUSTOMER'],
    });

    await assert.rejects(
      async () => {
        await engine.assertAuthorized({
          actor,
          action: 'order:read',
          resource: createResource({ type: 'order', id: 'ord-9', ownerId: 'customer-2' }),
        });
      },
      (err: any) => {
        assert.ok(err instanceof OwnershipDeniedError);
        assert.equal(err.code, 'OWNERSHIP_DENIED');
        return true;
      },
    );
  });

  it('assertAuthorized throws ApprovalRequiredError when policy requires approval', async () => {
    const approvalEngine = new AuthorizationEngine();
    approvalEngine.getPolicyEvaluator().registerPolicy({
      id: 'pol-approval',
      name: 'Approval Policy',
      appliesTo: () => true,
      evaluate: () => ({ effect: 'REQUIRES_APPROVAL', reason: 'Manager signoff required' }),
    });

    const actor = createActor({ id: 'staff-1', permissions: ['doc:sign'] });

    await assert.rejects(
      async () => {
        await approvalEngine.assertAuthorized({
          actor,
          action: 'doc:sign',
          resource: 'doc',
        });
      },
      (err: any) => {
        assert.ok(err instanceof ApprovalRequiredError);
        assert.equal(err.code, 'APPROVAL_REQUIRED');
        return true;
      },
    );
  });

  it('evaluates HTTP requests through GenericHttpAuthorizationGuard', async () => {
    const guard = new GenericHttpAuthorizationGuard(engine);

    // Mock authorized request
    const authorizedReq = {
      user: {
        sub: 'user-waiter-1',
        role: 'WAITER',
        branchId: 'branch-1',
      },
      params: { branchId: 'branch-1' },
    };

    const allowedResult = await guard.checkAuthorization({
      request: authorizedReq,
      requiredPermissions: ['orders:read'],
    });
    assert.equal(allowedResult.authorized, true);

    // Mock unauthorized request (cashier trying to perform branch management)
    const unauthorizedReq = {
      user: {
        sub: 'user-cashier-1',
        role: 'CASHIER',
        branchId: 'branch-1',
      },
      params: { branchId: 'branch-1' },
    };

    const deniedResult = await guard.checkAuthorization({
      request: unauthorizedReq,
      requiredPermissions: ['branch_settings:manage'],
    });
    assert.equal(deniedResult.authorized, false);
    assert.match(deniedResult.reason ?? '', /lacks required permission/);
  });

  it('preserves legacy hasPermission behavior with upgraded wildcard capabilities', () => {
    // Legacy context with SUPER_ADMIN
    const superAdminCtx = {
      actorType: 'USER',
      actorId: 'admin-1',
      role: 'SUPER_ADMIN',
      permissions: ['*'] as any,
      scopes: [{ type: 'global' as any }],
    };

    assert.equal(hasPermission(superAdminCtx, 'orders.create' as any), true);
    assert.equal(hasPermission(superAdminCtx, 'payments.refund' as any), true);

    // Legacy context with specific waiter permissions
    const waiterCtx = {
      actorType: 'USER',
      actorId: 'waiter-1',
      role: 'WAITER',
      permissions: ['orders.read', 'tables.read'] as any,
      scopes: [{ type: 'branch' as any, id: 'b-1' }],
    };

    assert.equal(hasPermission(waiterCtx, 'orders.read' as any), true);
    assert.equal(hasPermission(waiterCtx, 'payments.refund' as any), false);
  });
});
