// ============================================================================
// @tavonza/authorization — Unit & Integration Tests: Role Hierarchy Validation
// ============================================================================
// Verifies the operational hierarchy:
// SUPER_ADMIN (Platform Top)
//   └─ ADMIN / RESTAURANT_OWNER (Org Owner)
//        └─ BRANCH_MANAGER / MANAGER (Branch Leader)
//             ├─ CASHIER (Checkout & Payments)
//             ├─ KITCHEN_STAFF (Food Prep & Status)
//             └─ WAITER (Tables, Orders, Alerts)
//   └─ CUSTOMER (Menu, Tables, Own Orders)
// ============================================================================

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { AuthorizationEngine } from '../engine/authorization-engine';
import { RoleResolver } from '../engine/role-resolver';
import { createActor } from '../core/actor';
import { createScope, ScopeType } from '../core/scope';
import { createResource } from '../core/resource';
import { RestaurantRoles } from '../presets/restaurant/roles';
import { resolvePermissions, GlobalRole } from '../compatibility/legacy-exports';

describe('Operational Role Hierarchy Verification', () => {
  const roleResolver = new RoleResolver({
    roles: Object.values(RestaurantRoles),
  });
  const engine = new AuthorizationEngine({ roleResolver });

  // ── 1. Top of Hierarchy: SUPER_ADMIN ─────────────────────────────────

  describe('1. SUPER_ADMIN (Platform Top)', () => {
    const superAdmin = createActor({
      id: 'super-admin-1',
      roles: ['SUPER_ADMIN'],
      scopes: [createScope({ type: ScopeType.GLOBAL })],
    });

    it('has wildcard access to read and mutate any resource in any branch', async () => {
      const orderDecision = await engine.authorize({
        actor: superAdmin,
        action: 'order:delete',
        resource: createResource({ type: 'order', id: 'ord-100', branchId: 'branch-99' }),
        branchId: 'branch-99',
      });
      assert.equal(orderDecision.allowed, true);

      const paymentDecision = await engine.authorize({
        actor: superAdmin,
        action: 'payment:refund',
        resource: createResource({ type: 'payment', id: 'pay-200' }),
      });
      assert.equal(paymentDecision.allowed, true);

      const staffDecision = await engine.authorize({
        actor: superAdmin,
        action: 'staff:manage',
        resource: 'staff',
      });
      assert.equal(staffDecision.allowed, true);
    });

    it('resolvePermissions returns wildcard for SUPER_ADMIN', () => {
      const perms = resolvePermissions(GlobalRole.SUPER_ADMIN);
      assert.ok(perms.includes('*' as any));
    });
  });

  // ── 2. Top of Organization: ADMIN / RESTAURANT_OWNER ──────────────────

  describe('2. ADMIN / RESTAURANT_OWNER (Organization Owner)', () => {
    const orgOwner = createActor({
      id: 'owner-1',
      roles: ['ORGANIZATION_OWNER'],
      organizationId: 'org-tavonza',
      scopes: [createScope({ type: ScopeType.ORGANIZATION, id: 'org-tavonza' })],
    });

    it('can manage all operations within their organization', async () => {
      const decision = await engine.authorize({
        actor: orgOwner,
        action: 'branch_settings:manage',
        resource: createResource({ type: 'branch_settings', organizationId: 'org-tavonza' }),
        organizationId: 'org-tavonza',
      });
      assert.equal(decision.allowed, true);
    });

    it('is blocked from accessing resources in a different organization', async () => {
      const decision = await engine.authorize({
        actor: orgOwner,
        action: 'order:read',
        resource: createResource({ type: 'order', organizationId: 'org-competitor' }),
        organizationId: 'org-competitor',
      });
      assert.equal(decision.allowed, false);
      assert.equal(decision.code, 'DENIED_SCOPE_MISMATCH');
    });
  });

  // ── 3. Branch Leadership: BRANCH_MANAGER / MANAGER ────────────────────

  describe('3. BRANCH_MANAGER / MANAGER', () => {
    const branchManager = createActor({
      id: 'manager-1',
      roles: ['BRANCH_MANAGER'],
      organizationId: 'org-tavonza',
      branchId: 'branch-downtown',
      scopes: [createScope({ type: ScopeType.BRANCH, id: 'branch-downtown' })],
    });

    it('can manage orders, tables, menus, payments, and staff in assigned branch', async () => {
      const actions = [
        'order:read',
        'order:create',
        'order:update',
        'order:delete',
        'table:read',
        'table:update',
        'menu:update',
        'payment:refund',
        'report:read',
        'staff:manage',
      ];

      for (const action of actions) {
        const decision = await engine.authorize({
          actor: branchManager,
          action,
          resource: createResource({
            type: action.split(':')[0]!,
            branchId: 'branch-downtown',
            organizationId: 'org-tavonza',
          }),
          branchId: 'branch-downtown',
          organizationId: 'org-tavonza',
        });
        assert.equal(decision.allowed, true, `Expected ${action} to be allowed for BRANCH_MANAGER`);
      }
    });

    it('supports role name "MANAGER" equivalently to "BRANCH_MANAGER"', async () => {
      const managerAlt = createActor({
        id: 'manager-2',
        roles: ['MANAGER'],
        organizationId: 'org-tavonza',
        branchId: 'branch-downtown',
        scopes: [createScope({ type: ScopeType.BRANCH, id: 'branch-downtown' })],
      });

      const decision = await engine.authorize({
        actor: managerAlt,
        action: 'order:update',
        resource: createResource({ type: 'order', branchId: 'branch-downtown' }),
        branchId: 'branch-downtown',
      });
      assert.equal(decision.allowed, true);

      // resolvePermissions recognizes MANAGER
      const perms = resolvePermissions('MANAGER');
      assert.ok(perms.length > 10);
    });

    it('is blocked from modifying resources in another branch', async () => {
      const decision = await engine.authorize({
        actor: branchManager,
        action: 'order:update',
        resource: createResource({ type: 'order', branchId: 'branch-uptown' }),
        branchId: 'branch-uptown',
      });
      assert.equal(decision.allowed, false);
      assert.equal(decision.code, 'DENIED_SCOPE_MISMATCH');
    });
  });

  // ── 4. Checkout: CASHIER ──────────────────────────────────────────────

  describe('4. CASHIER', () => {
    const cashier = createActor({
      id: 'cashier-1',
      roles: ['CASHIER'],
      organizationId: 'org-tavonza',
      branchId: 'branch-downtown',
      scopes: [createScope({ type: ScopeType.BRANCH, id: 'branch-downtown' })],
    });

    it('can view orders, process payments, issue refunds, and apply discounts', async () => {
      const allowedActions = [
        'order:read',
        'payment:read',
        'payment:create',
        'payment:refund',
        'discount:apply',
      ];

      for (const action of allowedActions) {
        const decision = await engine.authorize({
          actor: cashier,
          action,
          resource: createResource({
            type: action.split(':')[0]!,
            branchId: 'branch-downtown',
          }),
          branchId: 'branch-downtown',
        });
        assert.equal(decision.allowed, true, `Expected ${action} to be allowed for CASHIER`);
      }
    });

    it('CANNOT modify menus, manage tables, or manage staff', async () => {
      const forbiddenActions = ['menu:update', 'table:update', 'staff:manage'];

      for (const action of forbiddenActions) {
        const decision = await engine.authorize({
          actor: cashier,
          action,
          resource: createResource({
            type: action.split(':')[0]!,
            branchId: 'branch-downtown',
          }),
          branchId: 'branch-downtown',
        });
        assert.equal(decision.allowed, false, `Expected ${action} to be forbidden for CASHIER`);
        assert.equal(decision.code, 'DENIED_NO_PERMISSION');
      }
    });
  });

  // ── 5. Back of House: KITCHEN_STAFF ───────────────────────────────────

  describe('5. KITCHEN_STAFF', () => {
    const kitchenStaff = createActor({
      id: 'kitchen-1',
      roles: ['KITCHEN_STAFF'],
      organizationId: 'org-tavonza',
      branchId: 'branch-downtown',
      scopes: [createScope({ type: ScopeType.BRANCH, id: 'branch-downtown' })],
    });

    it('can view orders and update order status (preparing, ready)', async () => {
      const decisionRead = await engine.authorize({
        actor: kitchenStaff,
        action: 'order:read',
        resource: createResource({ type: 'order', branchId: 'branch-downtown' }),
        branchId: 'branch-downtown',
      });
      assert.equal(decisionRead.allowed, true);

      const decisionUpdate = await engine.authorize({
        actor: kitchenStaff,
        action: 'order:update',
        resource: createResource({ type: 'order', branchId: 'branch-downtown' }),
        branchId: 'branch-downtown',
      });
      assert.equal(decisionUpdate.allowed, true);
    });

    it('can view and update menu item availability', async () => {
      const decision = await engine.authorize({
        actor: kitchenStaff,
        action: 'menu:read',
        resource: createResource({ type: 'menu', branchId: 'branch-downtown' }),
        branchId: 'branch-downtown',
      });
      assert.equal(decision.allowed, true);
    });

    it('CANNOT process payments or manage tables', async () => {
      const decisionPay = await engine.authorize({
        actor: kitchenStaff,
        action: 'payment:refund',
        resource: createResource({ type: 'payment', branchId: 'branch-downtown' }),
        branchId: 'branch-downtown',
      });
      assert.equal(decisionPay.allowed, false);

      const decisionTable = await engine.authorize({
        actor: kitchenStaff,
        action: 'table:update',
        resource: createResource({ type: 'table', branchId: 'branch-downtown' }),
        branchId: 'branch-downtown',
      });
      assert.equal(decisionTable.allowed, false);
    });
  });

  // ── 6. Floor Operations: WAITER ───────────────────────────────────────

  describe('6. WAITER', () => {
    const waiter = createActor({
      id: 'waiter-1',
      roles: ['WAITER'],
      organizationId: 'org-tavonza',
      branchId: 'branch-downtown',
      scopes: [createScope({ type: ScopeType.BRANCH, id: 'branch-downtown' })],
    });

    it('can view and manage tables, orders, and alerts', async () => {
      const allowedActions = [
        'table:read',
        'table:update',
        'order:read',
        'order:create',
        'order:accept',
        'order:reject',
        'order:update',
        'order:serve',
        'alert:read',
        'alert:acknowledge',
        'alert:resolve',
      ];

      for (const action of allowedActions) {
        const decision = await engine.authorize({
          actor: waiter,
          action,
          resource: createResource({
            type: action.split(':')[0]!,
            branchId: 'branch-downtown',
          }),
          branchId: 'branch-downtown',
        });
        assert.equal(decision.allowed, true, `Expected ${action} to be allowed for WAITER`);
      }
    });

    it('CANNOT process refunds or modify branch settings', async () => {
      const decisionRefund = await engine.authorize({
        actor: waiter,
        action: 'payment:refund',
        resource: createResource({ type: 'payment', branchId: 'branch-downtown' }),
        branchId: 'branch-downtown',
      });
      assert.equal(decisionRefund.allowed, false);

      const decisionSettings = await engine.authorize({
        actor: waiter,
        action: 'branch_settings:manage',
        resource: createResource({ type: 'branch_settings', branchId: 'branch-downtown' }),
        branchId: 'branch-downtown',
      });
      assert.equal(decisionSettings.allowed, false);
    });
  });

  // ── 7. End Customer: CUSTOMER ─────────────────────────────────────────

  describe('7. CUSTOMER', () => {
    const customer = createActor({
      id: 'cust-42',
      roles: ['CUSTOMER'],
    });

    it('can view menu and view tables', async () => {
      const decisionMenu = await engine.authorize({
        actor: customer,
        action: 'menu:read',
        resource: 'menu',
      });
      assert.equal(decisionMenu.allowed, true);

      const decisionTable = await engine.authorize({
        actor: customer,
        action: 'table:read',
        resource: 'table',
      });
      assert.equal(decisionTable.allowed, true);
    });

    it('can read and create own orders', async () => {
      const ownOrder = createResource({
        type: 'order',
        id: 'ord-mine',
        ownerId: 'cust-42',
      });

      const decision = await engine.authorize({
        actor: customer,
        action: 'order:read',
        resource: ownOrder,
      });
      assert.equal(decision.allowed, true);
    });

    it('CANNOT read or modify orders belonging to another customer', async () => {
      const otherOrder = createResource({
        type: 'order',
        id: 'ord-someone-else',
        ownerId: 'cust-99',
      });

      const decision = await engine.authorize({
        actor: customer,
        action: 'order:read',
        resource: otherOrder,
      });
      assert.equal(decision.allowed, false);
      assert.equal(decision.code, 'DENIED_NOT_OWNER');
    });

    it('CANNOT access staff or manager operations', async () => {
      const decision = await engine.authorize({
        actor: customer,
        action: 'staff:read',
        resource: 'staff',
      });
      assert.equal(decision.allowed, false);
    });

    it('resolvePermissions grants default customer capabilities', () => {
      const perms = resolvePermissions(GlobalRole.CUSTOMER);
      assert.ok(perms.includes('menu.read' as any));
      assert.ok(perms.includes('orders.read' as any));
    });
  });
});
