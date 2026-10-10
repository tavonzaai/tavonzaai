import { execSync } from 'child_process';

const BASE_URL = process.env.API_URL || 'https://api.tavonza.com';

async function fetchJson(endpoint: string, options: any = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });
  const data = await res.json().catch(() => null);
  return { status: res.status, ok: res.ok, data };
}

async function main() {
  console.log('🚀 Starting Full E2E Customer -> Waiter Order Flow & Portal Verification...\n');

  // ── Step 0: Test Logins For All 6 Seeded Accounts ──────────────────────────
  console.log('0. Verifying Multi-Portal Logins for All 6 Required Users...');
  const users = [
    { email: 'owner@tavonza.ai', pass: 'Owner@1234', role: 'Owner (Admin)' },
    { email: 'manager@tavonza.ai', pass: 'Manager@1234', role: 'Manager' },
    { email: 'waiter@tavonza.ai', pass: 'Waiter@1234', role: 'Waiter' },
    { email: 'cashier@tavonza.ai', pass: 'Cashier@1234', role: 'Cashier' },
    { email: 'kitchen@tavonza.ai', pass: 'Kitchen@1234', role: 'Kitchen Staff' },
    { email: 'customer@tavonza.ai', pass: 'Customer@1234', role: 'Customer' },
  ];

  for (const u of users) {
    const res = await fetchJson('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: u.email, password: u.pass }),
    });
    if (!res.ok || !res.data?.accessToken) {
      throw new Error(`Login failed for ${u.email}: ${JSON.stringify(res.data)}`);
    }
    console.log(`✅ [${u.role}] ${u.email} authenticated successfully. Role: ${res.data.user?.role}`);
  }

  // ── Step 1: Waiter Login & Table Retrieval ────────────────────────────────
  console.log('\n1. Logging in as Waiter (waiter@tavonza.ai)...');
  const waiterLogin = await fetchJson('/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      email: 'waiter@tavonza.ai',
      password: 'Waiter@1234',
    }),
  });
  const waiterToken = waiterLogin.data.accessToken;
  const branchId = waiterLogin.data.user.branchId;
  console.log(`✅ Waiter authenticated. Branch ID: ${branchId}`);

  console.log('\n2. Fetching assigned tables for Waiter...');
  const tablesRes = await fetchJson(`/waiter/tables?branchId=${branchId}`, {
    headers: { Authorization: `Bearer ${waiterToken}` },
  });
  if (!tablesRes.ok || !Array.isArray(tablesRes.data) || tablesRes.data.length === 0) {
    throw new Error(`Failed to fetch tables: ${JSON.stringify(tablesRes.data)}`);
  }
  const testTable = tablesRes.data.find((t: any) => t.tableNumber === 'T-02') || tablesRes.data[0];
  const tableId = testTable.tableId;
  console.log(`✅ Table chosen for test: ${testTable.tableNumber} (ID: ${tableId})`);

  // ── Step 3: Customer QR Scan & Table OTP ──────────────────────────────────
  console.log('\n3. Customer scans QR & requests table OTP...');
  const otpReq = await fetchJson('/sessions/table-otp/request', {
    method: 'POST',
    body: JSON.stringify({
      branchId,
      tableId,
      contact: 'test-guest@tavonza.ai',
    }),
  });
  if (!otpReq.ok || !otpReq.data?.devOtp) {
    throw new Error(`OTP request failed: ${JSON.stringify(otpReq.data)}`);
  }
  const otpCode = otpReq.data.devOtp;
  console.log(`✅ OTP received (Dev OTP): ${otpCode}`);

  console.log('\n4. Customer verifies OTP to create Guest Session...');
  const verifyRes = await fetchJson('/sessions/table-otp/verify', {
    method: 'POST',
    body: JSON.stringify({
      branchId,
      tableId,
      contact: 'test-guest@tavonza.ai',
      code: otpCode,
      displayName: 'Alice (Host)',
      tableNumber: testTable.tableNumber,
    }),
  });
  if (!verifyRes.ok || !verifyRes.data?.accessToken) {
    throw new Error(`OTP verify failed: ${JSON.stringify(verifyRes.data)}`);
  }
  const customerToken = verifyRes.data.accessToken;
  const guestSessionId = verifyRes.data.guestSession?.id;
  const tableSessionId = verifyRes.data.session?.id;
  console.log(`✅ Guest session created! GuestSession: ${guestSessionId}, TableSession: ${tableSessionId}`);

  // ── Step 5: Backend Menu Searching & Filtering ────────────────────────────
  console.log('\n5. Verifying Backend Search & Filtering for Menu...');
  const catRes = await fetchJson('/menu-categories');
  if (!catRes.ok || !Array.isArray(catRes.data?.data) || catRes.data.data.length === 0) {
    throw new Error(`Failed to fetch menu categories: ${JSON.stringify(catRes.data)}`);
  }
  console.log(`✅ Real menu categories from DB: ${catRes.data.data.map((c: any) => c.name).join(', ')}`);

  const searchRes = await fetchJson('/menu-items?search=Burger');
  if (!searchRes.ok || !Array.isArray(searchRes.data?.data) || searchRes.data.data.length === 0) {
    throw new Error(`Failed backend search for 'Burger': ${JSON.stringify(searchRes.data)}`);
  }
  const foodItem = searchRes.data.data[0];
  console.log(`✅ Backend search('Burger') returned: "${foodItem.name}" ($${foodItem.basePrice || foodItem.price})`);

  const allMenu = await fetchJson(`/menus/${branchId}/items`);
  const drinkItem = allMenu.data.find((i: any) => /water|sparkling|drink/i.test(i.name)) || allMenu.data[allMenu.data.length - 1];
  console.log(`✅ Selected drink item: "${drinkItem.name}" ($${drinkItem.price || drinkItem.basePrice})`);

  // ── Step 6: Customer Cart Management ──────────────────────────────────────
  console.log('\n6. Customer adds items to Cart...');
  const cartRes = await fetchJson('/orders/cart', {
    headers: { Authorization: `Bearer ${customerToken}` },
  });
  if (!cartRes.ok || !cartRes.data?.id) {
    throw new Error(`Failed to get/create cart: ${JSON.stringify(cartRes.data)}`);
  }
  const cartId = cartRes.data.id;

  await fetchJson(`/orders/cart/${cartId}/items`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${customerToken}` },
    body: JSON.stringify({
      menuItemId: foodItem.id,
      quantity: 2,
      specialInstructions: 'Extra crispy, no onions',
    }),
  });

  const cartWithDrink = await fetchJson(`/orders/cart/${cartId}/items`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${customerToken}` },
    body: JSON.stringify({
      menuItemId: drinkItem.id,
      quantity: 2,
    }),
  });
  console.log(`✅ Cart populated with 2 items. Subtotal: $${cartWithDrink.data?.subtotal}, Total: $${cartWithDrink.data?.totalAmount}`);

  // ── Step 7: Customer Submits Order ────────────────────────────────────────
  console.log('\n7. Customer submits cart to waiter queue...');
  const submitRes = await fetchJson(`/orders/${cartId}/submit`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${customerToken}` },
  });
  if (!submitRes.ok || !submitRes.data?.orderNumber) {
    throw new Error(`Submit order failed: ${JSON.stringify(submitRes.data)}`);
  }
  const placedOrderNumber = submitRes.data.orderNumber;
  console.log(`✅ Order placed! OrderNumber: #${placedOrderNumber}, Status: ${submitRes.data.status}`);

  // ── Step 8: Waiter Queries Pending Orders via Backend Filter ──────────────
  console.log('\n8. Waiter searches pending orders via backend API...');
  const pendingOrdersRes = await fetchJson(`/waiter/orders?status=PENDING&search=${placedOrderNumber}`, {
    headers: { Authorization: `Bearer ${waiterToken}` },
  });
  if (!pendingOrdersRes.ok || !Array.isArray(pendingOrdersRes.data) || pendingOrdersRes.data.length === 0) {
    throw new Error(`Waiter could not find placed order in pending queue: ${JSON.stringify(pendingOrdersRes.data)}`);
  }
  const foundOrder = pendingOrdersRes.data[0];
  console.log(`✅ Waiter found incoming order #${foundOrder.orderNumber} for Table ${foundOrder.tableLabel || foundOrder.tableNumber}`);

  // ── Step 9: Waiter Accepts Order ──────────────────────────────────────────
  console.log('\n9. Waiter accepts the order...');
  const acceptRes = await fetchJson(`/waiter/orders/${foundOrder.id}/accept`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${waiterToken}` },
  });
  if (!acceptRes.ok) {
    throw new Error(`Accept order failed: ${JSON.stringify(acceptRes.data)}`);
  }
  console.log(`✅ Waiter successfully accepted the order! Message: ${acceptRes.data.message}`);

  // ── Step 10: Customer Tracks Order Status ─────────────────────────────────
  console.log('\n10. Customer tracks order status...');
  const trackRes = await fetchJson(`/orders/${cartId}/track`, {
    headers: { Authorization: `Bearer ${customerToken}` },
  });
  if (trackRes.data?.status !== 'CONFIRMED' && trackRes.data?.status !== 'ACCEPTED') {
    throw new Error(`Expected ACCEPTED/CONFIRMED status, got: ${trackRes.data?.status}`);
  }
  console.log(`✅ Order tracking verified: status is now "${trackRes.data?.status}"!`);

  // ── Step 11: Waiter Rejection Flow ────────────────────────────────────────
  console.log('\n11. Testing Order Rejection Flow...');
  // Customer creates a second cart
  const cart2Res = await fetchJson(`/orders/cart/${branchId}/${tableId}`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${customerToken}` },
  });
  const cart2Id = cart2Res.data.id;
  await fetchJson(`/orders/cart/${cart2Id}/items`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${customerToken}` },
    body: JSON.stringify({ menuItemId: foodItem.id, quantity: 1 }),
  });
  const submit2 = await fetchJson(`/orders/${cart2Id}/submit`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${customerToken}` },
  });
  const order2Number = submit2.data.orderNumber;

  const rejectRes = await fetchJson(`/waiter/orders/${cart2Id}/reject`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${waiterToken}` },
    body: JSON.stringify({
      reason: 'Kitchen is at maximum capacity for grilled items',
      reasonCode: 'KITCHEN_CAPACITY',
    }),
  });
  if (!rejectRes.ok) {
    throw new Error(`Reject order failed: ${JSON.stringify(rejectRes.data)}`);
  }
  console.log(`✅ Waiter rejected order #${order2Number} with reason "KITCHEN_CAPACITY".`);

  const trackReject = await fetchJson(`/orders/${cart2Id}/track`, {
    headers: { Authorization: `Bearer ${customerToken}` },
  });
  if (trackReject.data?.status !== 'REJECTED') {
    throw new Error(`Expected REJECTED status, got ${trackReject.data?.status}`);
  }
  console.log(`✅ Customer tracking verified: status is "REJECTED" with reason logged.`);

  // ── Step 12: Negative Security & Validation Tests ─────────────────────────
  console.log('\n12. Running Negative Security & Validation Tests...');

  // A. Unauthenticated order status change
  const unauthPatch = await fetchJson(`/orders/${cartId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status: 'SERVED' }),
  });
  if (unauthPatch.status !== 401) {
    throw new Error(`Expected 401 on unauthenticated status patch, got ${unauthPatch.status}`);
  }
  console.log('✅ Unauthenticated status patch blocked with 401 Unauthorized.');

  // B. Customer tries to call waiter status patch
  const customerPatch = await fetchJson(`/orders/${cartId}/status`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${customerToken}` },
    body: JSON.stringify({ status: 'SERVED' }),
  });
  if (customerPatch.status !== 403) {
    throw new Error(`Expected 403 when customer tries to update order status, got ${customerPatch.status}`);
  }
  console.log('✅ Customer blocked with 403 Forbidden from mutating order status.');

  // C. Accept already accepted order
  const doubleAccept = await fetchJson(`/waiter/orders/${foundOrder.id}/accept`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${waiterToken}` },
  });
  if (doubleAccept.status !== 400) {
    throw new Error(`Expected 400 on double accept, got ${doubleAccept.status}`);
  }
  console.log('✅ Double acceptance rejected with 400 Bad Request.');

  console.log('\n🎉 ALL E2E USER LOGIN, ORDER CREATION, WAITER ACCEPTANCE/REJECTION & SECURITY TESTS PASSED PERFECTLY!\n');
}

main().catch((err) => {
  console.error('\n❌ E2E Test Failed:\n', err);
  process.exit(1);
});
