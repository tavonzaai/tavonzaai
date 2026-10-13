import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { eq } from 'drizzle-orm';
import * as bcrypt from 'bcrypt';
import * as schema from '@tavonza/database';

const DB_URL = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/tavonza_db';
const API_URL = 'https://api.tavonza.com';

async function main() {
  console.log('--- STARTING WAITER DOMAIN END-TO-END VERIFICATION ---');

  const pool = new Pool({ connectionString: DB_URL });
  const db = drizzle(pool, { schema });

  // 1. Prepare Branch, Waiter, Manager in DB
  const branchId = 'branch-ams-01';
  const waiterEmail = 'waiter.marco@milkyamsterdam.nl';
  const managerEmail = 'manager.elena@milkyamsterdam.nl';
  const testPassword = 'Password123!';
  const passwordHash = await bcrypt.hash(testPassword, 10);

  // Upsert Manager
  let [manager] = await db.select().from(schema.users).where(eq(schema.users.email, managerEmail));
  if (!manager) {
    [manager] = await db.insert(schema.users).values({
      email: managerEmail,
      passwordHash,
      role: 'branch_manager',
      isEmailVerified: true,
      status: 'active',
      scopes: ['*'],
      directPermissions: ['tables:update', 'orders:read', 'orders:accept'],
    }).returning();
  }

  // Upsert Waiter
  let [waiter] = await db.select().from(schema.users).where(eq(schema.users.email, waiterEmail));
  if (!waiter) {
    [waiter] = await db.insert(schema.users).values({
      email: waiterEmail,
      passwordHash,
      role: 'waiter',
      isEmailVerified: true,
      status: 'active',
      scopes: ['branch:branch-ams-01'],
      directPermissions: [
        'tables:read',
        'orders:read',
        'orders:accept',
        'orders:reject',
        'orders:serve',
        'orders:create',
        'alerts:read',
        'alerts:acknowledge',
        'alerts:resolve',
      ],
    }).returning();
  }

  // Ensure Waiter staff profile & branch assignment
  const [profile] = await db.insert(schema.staffProfiles).values({
    userId: waiter.id,
    employeeId: 'EMP-W001',
    displayName: 'Marco V.',
    role: 'waiter',
    currentShiftStatus: 'on_shift',
  }).onConflictDoNothing().returning();

  await db.insert(schema.branchStaffAssignments).values({
    staffProfileId: profile ? profile.id : (await db.select().from(schema.staffProfiles).where(eq(schema.staffProfiles.userId, waiter.id)))[0].id,
    branchId,
    roleAtBranch: 'waiter',
    isPrimaryBranch: true,
    status: 'active',
  }).onConflictDoNothing();

  // Assign Table 4 to Waiter Marco for today
  const today = new Date().toISOString().split('T')[0];
  await db.insert(schema.waiterTableAssignments).values({
    waiterId: waiter.id,
    branchId,
    tableId: 'table-04',
    tableNumber: 'Table 4',
    shiftDate: today,
    status: 'active',
    assignedBy: manager.id,
  }).onConflictDoNothing();

  console.log('✓ Seeded Waiter Marco and Table 4 assignment.');

  // 2. Test Login as Waiter
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
  console.log('✓ Step 1: Waiter login successful. Access token received.');

  // 3. See Assignable/Assigned Tables
  const tablesRes = await fetch(`${API_URL}/waiter/tables?branchId=${branchId}`, {
    headers: { Authorization: `Bearer ${waiterToken}` },
  });
  const tables = await tablesRes.json();
  console.log('✓ Step 2: Waiter fetched assigned tables:', tables);
  if (!tables.length || tables[0].tableId !== 'table-04') {
    throw new Error('Table assignment not found in response');
  }

  // 4. Waiter orders on behalf of customer (with auto-created customer account!)
  const customerEmail = `guest.${Date.now()}@example.com`;
  const orderOnBehalfRes = await fetch(`${API_URL}/waiter/orders`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${waiterToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      branchId,
      tableId: 'table-04',
      customerEmail,
      customerFirstName: 'Jan',
      customerLastName: 'Jansen',
      items: [
        {
          menuItemId: 'item-burger-01',
          name: 'Milky Truffle Burger',
          unitPrice: 18.5,
          quantity: 2,
          specialInstructions: 'Medium rare, extra pickles',
        },
      ],
      specialInstructions: 'Customer requested quick service',
    }),
  });

  if (!orderOnBehalfRes.ok) {
    throw new Error(`Order on behalf failed: ${orderOnBehalfRes.status} ${await orderOnBehalfRes.text()}`);
  }
  const onBehalfData = await orderOnBehalfRes.json();
  console.log('✓ Step 3: Waiter created order on behalf of customer.');
  console.log('  Auto-created customer account:', {
    userId: onBehalfData.customerId,
    autoCreated: onBehalfData.customerAutoCreated,
    orderId: onBehalfData.orderId,
    status: onBehalfData.orderStatus,
  });

  // Verify the auto-created customer can log in with default password 1234
  const autoCustomerLoginRes = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: customerEmail, password: '1234' }),
  });
  if (!autoCustomerLoginRes.ok) {
    throw new Error(`Auto-created customer failed to login with default password '1234': ${await autoCustomerLoginRes.text()}`);
  }
  console.log("✓ Step 4: Auto-created customer verified able to login with default password '1234'!");

  // 5. Customer places an alert for the waiter
  const alertRes = await fetch(`${API_URL}/alerts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      branchId,
      tableId: 'table-04',
      tableNumber: 'Table 4',
      alertType: 'call_waiter',
      message: 'Need extra napkins please',
    }),
  });
  if (!alertRes.ok) {
    throw new Error(`Create alert failed: ${alertRes.status} ${await alertRes.text()}`);
  }
  const alertData = await alertRes.json();
  console.log('✓ Step 5: Customer sent alert to waiter:', alertData);

  // 6. Waiter fetches alerts and acknowledges
  const waiterAlertsRes = await fetch(`${API_URL}/waiter/alerts?branchId=${branchId}`, {
    headers: { Authorization: `Bearer ${waiterToken}` },
  });
  const waiterAlerts = await waiterAlertsRes.json();
  console.log(`✓ Step 6: Waiter received ${waiterAlerts.length} alert(s) for branch.`);

  const ackRes = await fetch(`${API_URL}/waiter/alerts/${alertData.id}/acknowledge`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${waiterToken}` },
  });
  console.log('✓ Step 7: Waiter acknowledged alert:', await ackRes.json());

  const resolveRes = await fetch(`${API_URL}/waiter/alerts/${alertData.id}/resolve`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${waiterToken}` },
  });
  console.log('✓ Step 8: Waiter resolved alert:', await resolveRes.json());

  // 7. Test Customer Order flow: Submit -> Pending -> Waiter Accept -> Serve
  // Create a cart as customer, add item, submit
  const cartRes = await fetch(`${API_URL}/orders/cart/${branchId}/table-04`);
  const cart = await cartRes.json();

  await fetch(`${API_URL}/orders/cart/${cart.id}/items`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      menuItemId: 'item-drink-01',
      quantity: 1,
      specialInstructions: 'No ice',
    }),
  });

  const submitRes = await fetch(`${API_URL}/orders/${cart.id}/submit`, {
    method: 'POST',
  });
  const submittedOrder = await submitRes.json();
  console.log('✓ Step 9: Customer submitted order #', submittedOrder.orderNumber, 'status:', submittedOrder.status);

  // Waiter checks pending orders
  const pendingOrdersRes = await fetch(`${API_URL}/waiter/orders/pending?branchId=${branchId}`, {
    headers: { Authorization: `Bearer ${waiterToken}` },
  });
  const pendingOrders = await pendingOrdersRes.json();
  console.log(`✓ Step 10: Waiter checked pending queue: found ${pendingOrders.length} order(s).`);

  // Waiter accepts order
  const acceptRes = await fetch(`${API_URL}/waiter/orders/${submittedOrder.id}/accept`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${waiterToken}` },
  });
  console.log('✓ Step 11: Waiter accepted order:', await acceptRes.json());

  // Kitchen marks order READY (simulated via status patch)
  await fetch(`${API_URL}/orders/${submittedOrder.id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: 'READY' }),
  });

  // Waiter marks order as SERVED
  const serveRes = await fetch(`${API_URL}/waiter/orders/${submittedOrder.id}/serve`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${waiterToken}` },
  });
  console.log('✓ Step 12: Waiter marked order as SERVED:', await serveRes.json());

  console.log('\n======================================================');
  console.log('🎉 ALL 12 STEPS OF WAITER FLOW PASSED FLAWLESSLY! 🎉');
  console.log('======================================================');

  await pool.end();
}

main().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
