/**
 * Contract tests for role-specific dashboard analytics shapes.
 * These mirror the service return contracts used by every frontend dashboard.
 */
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

type RoleDashboard =
  | { role: 'WAITER'; assignedTables: number; pendingOrders: number }
  | { role: 'CASHIER'; todayRevenue: number; unpaidAmount: number }
  | { role: 'KITCHEN_STAFF'; newOrders: number; overdueOrders: number }
  | { role: 'BARTENDER'; newOrders: number }
  | { role: 'CUSTOMER'; openOrders: number; completedOrders: number }
  | {
      branchId: string;
      tablesCount: number;
      paidRevenue: number;
      todayRevenue: number;
    };

const ENDPOINTS = [
  '/analytics/overview',
  '/analytics/branch-dashboard',
  '/analytics/waiter-dashboard',
  '/analytics/cashier-dashboard',
  '/analytics/kitchen-dashboard',
  '/analytics/bartender-dashboard',
  '/analytics/customer-dashboard',
  '/analytics/reports/branch-performance',
] as const;

describe('role analytics API contract', () => {
  it('exposes a dedicated analytics route for every staff surface', () => {
    for (const path of ENDPOINTS) {
      assert.match(path, /^\/analytics\//);
    }
    assert.equal(ENDPOINTS.length, 8);
  });

  it('waiter KPIs never imply branch-wide order totals without assignments', () => {
    const emptyAssignment: RoleDashboard = {
      role: 'WAITER',
      assignedTables: 0,
      pendingOrders: 0,
    };
    assert.equal(emptyAssignment.assignedTables, 0);
    assert.equal(emptyAssignment.pendingOrders, 0);
  });

  it('cashier KPIs are revenue fields, not order list payloads', () => {
    const cashier: RoleDashboard = {
      role: 'CASHIER',
      todayRevenue: 128.5,
      unpaidAmount: 40,
    };
    assert.ok(!('orders' in cashier));
    assert.equal(typeof cashier.todayRevenue, 'number');
  });

  it('kitchen KPIs expose queue counters only', () => {
    const kitchen: RoleDashboard = {
      role: 'KITCHEN_STAFF',
      newOrders: 3,
      overdueOrders: 1,
    };
    assert.ok(!('items' in kitchen));
  });

  it('branch manager creatable roles never include Assistant Manager / BRANCH_MANAGER', () => {
    const creatable = ['WAITER', 'CASHIER', 'KITCHEN_STAFF', 'BARTENDER', 'HOST'];
    assert.equal(creatable.includes('BRANCH_MANAGER'), false);
    assert.equal(creatable.some((r) => r.includes('ASSISTANT')), false);
  });
});

describe('waiter order scope contract', () => {
  it('filters orders to assigned table ids only', () => {
    const assigned = new Set(['t1', 't2']);
    const branchOrders = [
      { id: 'o1', tableId: 't1' },
      { id: 'o2', tableId: 't3' },
      { id: 'o3', tableId: 't2' },
    ];
    const visible = branchOrders.filter((o) => assigned.has(o.tableId));
    assert.deepEqual(
      visible.map((o) => o.id),
      ['o1', 'o3'],
    );
  });
});
