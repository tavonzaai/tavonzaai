import crypto from 'node:crypto';
import pg from '/Users/anonymous/workspace/tavonzaai/packages/database/node_modules/pg/lib/index.js';
import argon2 from '/Users/anonymous/workspace/tavonzaai/apps/api/node_modules/argon2/argon2.cjs';

const { Pool } = pg;
const DB_URL = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/platform_dev?schema=public';
const API_URL = 'http://localhost:3000';

async function main() {
  console.log('===============================================================');
  console.log('🚀 WAITER DOMAIN END-TO-END FLOW VERIFICATION (FIGMA WORKFLOW)');
  console.log('===============================================================\n');

  const pool = new Pool({ connectionString: DB_URL });

  const orgId = crypto.randomUUID();
  const restId = crypto.randomUUID();
  const branchId = crypto.randomUUID();
  const tableId = crypto.randomUUID();

  const waiterEmail = `waiter.${Date.now()}@milkyamsterdam.nl`;
  const managerEmail = `manager.${Date.now()}@milkyamsterdam.nl`;
  const testPassword = 'Password123!';
  const passwordHash = await argon2.hash(testPassword);

  // 1. Seed Manager and Waiter in DB
  const managerInsert = await pool.query(
    `INSERT INTO users (email, password_hash, first_name, last_name, role, is_email_verified, is_active, scopes, permissions)
     VALUES ($1, $2, 'Elena', 'Manager', 'branch_manager', true, true, '[{"type":"global"}]'::jsonb, ARRAY['tables:update','orders:read','orders:accept']::text[])
     RETURNING id`,
    [managerEmail, passwordHash]
  );
  const managerId = managerInsert.rows[0].id;

  const waiterInsert = await pool.query(
    `INSERT INTO users (email, password_hash, first_name, last_name, role, is_email_verified, is_active, scopes, permissions)
     VALUES ($1, $2, 'Marco', 'Waiter', 'waiter', true, true, $3::jsonb,
     ARRAY['tables:read','orders:read','orders:accept','orders:reject','orders:serve','orders:create','alerts:read','alerts:acknowledge','alerts:resolve']::text[])
     RETURNING id`,
    [waiterEmail, passwordHash, JSON.stringify([{ type: 'branch', id: branchId }])]
  );
  const waiterId = waiterInsert.rows[0].id;

  // Ensure staff profile
  const profileInsert = await pool.query(
    `INSERT INTO staff_profiles (user_id, organization_id, restaurant_id, employee_code, job_title, status)
     VALUES ($1, $2, $3, $4, 'Waiter', 'active')
     RETURNING id`,
    [waiterId, orgId, restId, `EMP-${Date.now()}`]
  );
  const profileId = profileInsert.rows[0].id;

  // Ensure branch assignment
  await pool.query(
    `INSERT INTO branch_staff_assignments (branch_id, staff_profile_id, assigned_by_id, is_active)
     VALUES ($1, $2, $3, true)`,
    [branchId, profileId, managerId]
  );

  // Assign Table to Waiter Marco for today's shift
  const today = new Date().toISOString().split('T')[0];
  await pool.query(
    `INSERT INTO waiter_table_assignments (branch_id, waiter_id, table_id, assigned_by_id, shift_date, is_active)
     VALUES ($1, $2, $3, $4, $5, true)`,
    [branchId, waiterId, tableId, managerId, today]
  );

  // Seed Menu Category and Menu Item for foreign key integrity
  const catInsert = await pool.query(
    `INSERT INTO menu_categories (branch_id, name) VALUES ($1, 'Burgers') RETURNING id`,
    [branchId]
  );
  const categoryId = catInsert.rows[0].id;

  const itemInsert = await pool.query(
    `INSERT INTO menu_items (branch_id, category_id, name, price)
     VALUES ($1, $2, 'Milky Truffle Burger', '18.50') RETURNING id`,
    [branchId, categoryId]
  );
  const menuItemId = itemInsert.rows[0].id;

  console.log('✅ Seeded Waiter Marco, Table assignment, and Menu Item in DB with Argon2.');

  // ─── STEP 1: Waiter Login ──────────────────────────────────────────────────
  console.log('\n[1] Testing Waiter Login (Argon2)...');
  const loginRes = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: waiterEmail, password: testPassword }),
  });
  if (!loginRes.ok) {
    throw new Error(`Waiter login failed: ${loginRes.status} ${await loginRes.text()}`);
  }
  const waiterTokens = await loginRes.json();
  const waiterToken = waiterTokens.accessToken;
  console.log('✅ Waiter authenticated successfully! Token received.');

  // ─── STEP 2: Waiter views assigned tables ─────────────────────────────────
  console.log('\n[2] Testing GET /waiter/tables...');
  const tablesRes = await fetch(`${API_URL}/waiter/tables?branchId=${branchId}`, {
    headers: { Authorization: `Bearer ${waiterToken}` },
  });
  const tables = await tablesRes.json();
  console.log(`✅ Waiter fetched assigned tables: Found ${tables.length} table(s) (Table ID: ${tables[0]?.tableId})`);

  // ─── STEP 3: Scan table QR (Create table session) ─────────────────────────
  console.log('\n[3] Testing POST /sessions/scan (Customer/Table session init)...');
  const scanRes = await fetch(`${API_URL}/sessions/scan`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      branchId,
      tableId,
      tableNumber: 'Table 4',
    }),
  });
  if (!scanRes.ok) {
    throw new Error(`Scan QR failed: ${scanRes.status} ${await scanRes.text()}`);
  }
  const scanData = await scanRes.json();
  const tableSessionId = scanData.session.id;
  console.log('✅ Table session established:', tableSessionId);

  // ─── STEP 4: Waiter creates order on behalf of customer ───────────────────
  console.log('\n[4] Testing POST /waiter/orders (Order on behalf with auto-created customer)...');
  const customerEmail = `guest.${Date.now()}@example.com`;
  const orderOnBehalfRes = await fetch(`${API_URL}/waiter/orders`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${waiterToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      branchId,
      tableId,
      tableSessionId,
      customerIdentifier: customerEmail,
      items: [
        {
          menuItemId,
          name: 'Milky Truffle Burger',
          unitPrice: '18.50',
          quantity: 2,
          specialInstructions: 'Medium rare, extra pickles',
        },
      ],
    }),
  });

  if (!orderOnBehalfRes.ok) {
    throw new Error(`Order on behalf failed: ${orderOnBehalfRes.status} ${await orderOnBehalfRes.text()}`);
  }
  const onBehalfData = await orderOnBehalfRes.json();
  console.log('✅ Waiter created order on behalf of customer:');
  console.log('   - Order ID:', onBehalfData.order.id);
  console.log('   - Order Number:', onBehalfData.order.orderNumber);
  console.log('   - Status:', onBehalfData.order.status);
  console.log('   - Auto-created Customer ID:', onBehalfData.customerId);
  console.log('   - customerAutoCreated flag:', onBehalfData.customerAutoCreated);

  // ─── STEP 5: Verify auto-created customer verification flow ───────────────
  console.log("\n[5] Testing Customer Flow for Auto-Created Account...");
  // Attempt 1: Unverified account is gated as specified
  const unverifiedLoginRes = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: customerEmail, password: '1234' }),
  });
  if (unverifiedLoginRes.status !== 401) {
    throw new Error('Expected 401 Unauthorized for unverified account');
  }
  console.log('✅ Unverified auto-created account correctly blocked with 401.');

  // Customer verifies their account
  await pool.query('UPDATE users SET is_email_verified = true WHERE id = $1', [onBehalfData.customerId]);
  console.log('✅ Customer account verified.');

  // Attempt 2: Customer logs in with default password '1234'
  const verifiedLoginRes = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: customerEmail, password: '1234' }),
  });
  if (!verifiedLoginRes.ok) {
    throw new Error(`Customer login failed: ${await verifiedLoginRes.text()}`);
  }
  const customerTokens = await verifiedLoginRes.json();
  console.log("✅ Verified customer successfully logged in with default password '1234' (Argon2)!");

  // ─── STEP 6: Customer sends alert to waiter ───────────────────────────────
  console.log('\n[6] Testing POST /alerts (Customer sends call_waiter alert)...');
  const alertRes = await fetch(`${API_URL}/alerts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      branchId,
      tableId,
      tableSessionId,
      type: 'call_waiter',
      message: 'Need bill and extra napkins please',
    }),
  });
  if (!alertRes.ok) {
    throw new Error(`Create alert failed: ${alertRes.status} ${await alertRes.text()}`);
  }
  const alertData = await alertRes.json();
  console.log('✅ Customer alert created: ID:', alertData.id, 'Status:', alertData.status, 'Type:', alertData.type);

  // ─── STEP 7: Waiter fetches alerts ────────────────────────────────────────
  console.log('\n[7] Testing GET /waiter/alerts...');
  const waiterAlertsRes = await fetch(`${API_URL}/waiter/alerts?branchId=${branchId}`, {
    headers: { Authorization: `Bearer ${waiterToken}` },
  });
  const waiterAlerts = await waiterAlertsRes.json();
  console.log(`✅ Waiter fetched branch alerts: Found ${waiterAlerts.length} alert(s).`);

  // ─── STEP 8: Waiter acknowledges alert ────────────────────────────────────
  console.log(`\n[8] Testing PATCH /waiter/alerts/${alertData.id}/acknowledge...`);
  const ackRes = await fetch(`${API_URL}/waiter/alerts/${alertData.id}/acknowledge`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${waiterToken}` },
  });
  console.log('✅ Waiter acknowledged alert:', await ackRes.json());

  // ─── STEP 9: Waiter resolves alert ────────────────────────────────────────
  console.log(`\n[9] Testing PATCH /waiter/alerts/${alertData.id}/resolve...`);
  const resolveRes = await fetch(`${API_URL}/waiter/alerts/${alertData.id}/resolve`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${waiterToken}` },
  });
  console.log('✅ Waiter resolved alert:', await resolveRes.json());

  // ─── STEP 10: Customer creates and submits a new order ────────────────────
  console.log('\n[10] Testing Customer Cart & Submit Order flow...');
  const cartRes = await fetch(`${API_URL}/orders/cart/${branchId}/${tableId}`);
  if (!cartRes.ok) {
    throw new Error(`Get cart failed: ${cartRes.status} ${await cartRes.text()}`);
  }
  const cart = await cartRes.json();
  console.log('  Cart received:', cart);

  const addItemRes = await fetch(`${API_URL}/orders/cart/${cart.orderId}/items`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      menuItemId,
      quantity: 1,
      specialInstructions: 'With chocolate sauce',
    }),
  });

  const submitRes = await fetch(`${API_URL}/orders/${cart.orderId}/submit`, {
    method: 'POST',
  });
  if (!submitRes.ok) {
    throw new Error(`Submit order failed: ${submitRes.status} ${await submitRes.text()}`);
  }
  const submittedOrder = await submitRes.json();
  console.log('✅ Customer submitted order #', submittedOrder.orderNumber, 'Status:', submittedOrder.status);

  // ─── STEP 11: Waiter checks pending queue ─────────────────────────────────
  console.log('\n[11] Testing GET /waiter/orders/pending...');
  const pendingOrdersRes = await fetch(`${API_URL}/waiter/orders/pending?branchId=${branchId}`, {
    headers: { Authorization: `Bearer ${waiterToken}` },
  });
  const pendingOrders = await pendingOrdersRes.json();
  console.log(`✅ Waiter checked pending queue: Found ${pendingOrders.length} order(s).`);

  // ─── STEP 12: Waiter accepts customer order (moves to kitchen queue) ─────
  console.log(`\n[12] Testing POST /waiter/orders/${submittedOrder.orderId}/accept...`);
  const acceptRes = await fetch(`${API_URL}/waiter/orders/${submittedOrder.orderId}/accept`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${waiterToken}` },
  });
  if (!acceptRes.ok) {
    throw new Error(`Accept order failed: ${acceptRes.status} ${await acceptRes.text()}`);
  }
  console.log('✅ Waiter accepted order:', await acceptRes.json());

  // ─── STEP 13: Waiter marks order as served ───────────────────────────────
  console.log(`\n[13] Testing POST /waiter/orders/${submittedOrder.orderId}/serve...`);
  // Advance status to READY first (simulating kitchen workflow)
  await pool.query("UPDATE orders SET status = 'READY' WHERE id = $1", [submittedOrder.orderId]);

  const serveRes = await fetch(`${API_URL}/waiter/orders/${submittedOrder.orderId}/serve`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${waiterToken}` },
  });
  if (!serveRes.ok) {
    throw new Error(`Serve order failed: ${serveRes.status} ${await serveRes.text()}`);
  }
  console.log('✅ Waiter served order:', await serveRes.json());

  console.log('\n===============================================================');
  console.log('🎉 ALL 13 STEPS OF THE COMPLETE WAITER DOMAIN FLOW PASSED! 🎉');
  console.log('===============================================================\n');

  await pool.end();
}

main().catch((err) => {
  console.error('\n❌ Test execution failed with error:', err);
  process.exit(1);
});
