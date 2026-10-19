import { expect, test, type APIRequestContext } from '@playwright/test';
import { apiBaseUrl } from './helpers';

const DEFAULT_BRANCH_ID = process.env.E2E_BRANCH_ID || 'ce7b4318-5e2e-4fcd-a459-0e1bc80a6f27';

const accounts = {
  owner: {
    email: process.env.ADMIN_E2E_EMAIL || 'owner@tavonza.ai',
    password: process.env.ADMIN_E2E_PASSWORD || 'Owner@1234',
  },
  manager: {
    email: process.env.MANAGER_E2E_EMAIL || 'manager@tavonza.ai',
    password: process.env.MANAGER_E2E_PASSWORD || 'Manager@1234',
  },
  waiter: {
    email: process.env.WAITER_E2E_EMAIL || 'waiter@tavonza.ai',
    password: process.env.WAITER_E2E_PASSWORD || 'Waiter@1234',
  },
  cashier: {
    email: process.env.CASHIER_E2E_EMAIL || 'cashier@tavonza.ai',
    password: process.env.CASHIER_E2E_PASSWORD || 'Cashier@1234',
  },
  kitchen: {
    email: process.env.KITCHEN_E2E_EMAIL || 'kitchen@tavonza.ai',
    password: process.env.KITCHEN_E2E_PASSWORD || 'Kitchen@1234',
  },
  bartender: {
    email: process.env.BARTENDER_E2E_EMAIL || 'bartender@tavonza.ai',
    password: process.env.BARTENDER_E2E_PASSWORD || 'Bartender@1234',
  },
};

async function login(
  request: APIRequestContext,
  email: string,
  password: string,
): Promise<{ token: string; branchId: string | null; body: any }> {
  const response = await request.post(`${apiBaseUrl}/auth/login`, {
    data: { email, password },
  });
  expect(response.ok(), `login failed for ${email}: ${response.status()}`).toBeTruthy();
  const body = await response.json();
  const token = body.accessToken || body.data?.accessToken;
  expect(token).toBeTruthy();
  const payload = JSON.parse(Buffer.from(String(token).split('.')[1], 'base64url').toString('utf8'));
  return { token, branchId: payload.branchId || null, body };
}

function auth(token: string) {
  return { Authorization: `Bearer ${token}` };
}

test.describe('Role requirements (API)', () => {
  test('analytics endpoints return KPIs for each role surface', async ({ request }) => {
    const owner = await login(request, accounts.owner.email, accounts.owner.password);
    const overview = await request.get(`${apiBaseUrl}/analytics/overview`, {
      headers: auth(owner.token),
    });
    expect(overview.ok()).toBeTruthy();
    const overviewBody = await overview.json();
    expect(overviewBody).toMatchObject({
      restaurantsCount: expect.any(Number),
      branchesCount: expect.any(Number),
      paidRevenue: expect.any(Number),
    });

    const manager = await login(request, accounts.manager.email, accounts.manager.password);
    const managerBranchId = manager.branchId || DEFAULT_BRANCH_ID;
    const branchDash = await request.get(
      `${apiBaseUrl}/analytics/branch-dashboard?branchId=${managerBranchId}`,
      { headers: auth(manager.token) },
    );
    expect(branchDash.ok(), await branchDash.text()).toBeTruthy();

    const roleCalls: Array<{ email: string; password: string; path: string }> = [
      { ...accounts.waiter, path: 'waiter-dashboard' },
      { ...accounts.cashier, path: 'cashier-dashboard' },
      { ...accounts.kitchen, path: 'kitchen-dashboard' },
      { ...accounts.bartender, path: 'bartender-dashboard' },
    ];

    for (const role of roleCalls) {
      const session = await login(request, role.email, role.password);
      const branchId = session.branchId || DEFAULT_BRANCH_ID;
      const res = await request.get(
        `${apiBaseUrl}/analytics/${role.path}?branchId=${branchId}`,
        { headers: auth(session.token) },
      );
      expect(res.ok(), `${role.path} → ${res.status()} ${await res.text()}`).toBeTruthy();
    }
  });

  test('waiter orders stay scoped to assigned tables even with ALL_TABLES', async ({ request }) => {
    const waiter = await login(request, accounts.waiter.email, accounts.waiter.password);
    const branchId = waiter.branchId || DEFAULT_BRANCH_ID;

    const tablesRes = await request.get(`${apiBaseUrl}/waiter/tables?branchId=${branchId}`, {
      headers: auth(waiter.token),
    });
    expect(tablesRes.ok()).toBeTruthy();
    const tables = await tablesRes.json();
    // GET /waiter/tables rows use assignment `id`; the real table UUID is `tableId`
    // (also mirrored on nested assignedTables[].id).
    const assignedIds = new Set<string>();
    for (const row of Array.isArray(tables) ? tables : []) {
      if (row?.tableId) assignedIds.add(row.tableId);
      for (const t of row?.assignedTables || []) {
        if (t?.id) assignedIds.add(t.id);
        if (t?.tableId) assignedIds.add(t.tableId);
      }
    }
    expect(assignedIds.size).toBeGreaterThan(0);

    const mine = await request.get(
      `${apiBaseUrl}/waiter/orders?branchId=${branchId}&scope=MY_TABLES`,
      { headers: auth(waiter.token) },
    );
    expect(mine.ok()).toBeTruthy();
    const mineOrders = await mine.json();
    expect(Array.isArray(mineOrders)).toBeTruthy();
    for (const order of mineOrders) {
      expect(assignedIds.has(order.tableId)).toBeTruthy();
    }

    const allScope = await request.get(
      `${apiBaseUrl}/waiter/orders?branchId=${branchId}&scope=ALL_TABLES`,
      { headers: auth(waiter.token) },
    );
    expect(allScope.ok()).toBeTruthy();
    const allOrders = await allScope.json();
    expect(allOrders).toHaveLength(mineOrders.length);
    for (const order of allOrders) {
      expect(assignedIds.has(order.tableId)).toBeTruthy();
    }

    const foreignTableId = '00000000-0000-4000-8000-000000000099';
    const foreign = await request.get(
      `${apiBaseUrl}/waiter/orders?branchId=${branchId}&tableId=${foreignTableId}`,
      { headers: auth(waiter.token) },
    );
    expect(foreign.ok()).toBeTruthy();
    expect(await foreign.json()).toEqual([]);
  });

  test('branch manager cannot create BRANCH_MANAGER staff', async ({ request }) => {
    const manager = await login(request, accounts.manager.email, accounts.manager.password);
    const branchId = manager.branchId || DEFAULT_BRANCH_ID;
    const stamp = Date.now();
    const res = await request.post(`${apiBaseUrl}/branches/${branchId}/staff`, {
      headers: auth(manager.token),
      data: {
        name: 'Peer Manager Attempt',
        email: `e2e.peer.mgr.${stamp}@tavonza.ai`,
        password: 'TempPass123!',
        role: 'BRANCH_MANAGER',
      },
    });
    expect([400, 403]).toContain(res.status());
    const body = await res.json().catch(() => ({}));
    const message = String(body.message || body.error || JSON.stringify(body)).toLowerCase();
    expect(message).toMatch(
      /may only create|branch managers may only|not allowed|forbidden|cannot assign|creatable/i,
    );
    expect(message).not.toMatch(/organization/);
  });

  test('branch manager creates menu category with restaurantId', async ({ request }) => {
    const manager = await login(request, accounts.manager.email, accounts.manager.password);
    const branchId = manager.branchId || DEFAULT_BRANCH_ID;

    const branchRes = await request.get(`${apiBaseUrl}/branches/${branchId}`, {
      headers: auth(manager.token),
    });
    expect(branchRes.ok(), await branchRes.text()).toBeTruthy();
    const branch = await branchRes.json();
    const restaurantId = branch.restaurantId || branch.data?.restaurantId;
    expect(restaurantId).toBeTruthy();

    const bad = await request.post(`${apiBaseUrl}/menus/categories`, {
      headers: auth(manager.token),
      data: { name: `E2E Bad ${Date.now()}`, restaurantId: branchId },
    });
    // restaurantId must be a real restaurant UUID; using branchId must fail validation/FK.
    expect(bad.ok()).toBeFalsy();

    const name = `E2E Cat ${Date.now()}`;
    const created = await request.post(`${apiBaseUrl}/menus/categories`, {
      headers: auth(manager.token),
      data: { restaurantId, name, displayOrder: 99 },
    });
    expect(created.ok(), await created.text()).toBeTruthy();
    const cat = await created.json();
    const catId = cat.id || cat.data?.id;
    expect(catId).toBeTruthy();

    if (catId) {
      await request.delete(`${apiBaseUrl}/menus/categories/${catId}`, {
        headers: auth(manager.token),
      });
    }
  });
});
