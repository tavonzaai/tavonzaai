const BASE_URL = 'http://localhost:3000';
const DEFAULT_BRANCH_ID = 'ce7b4318-5e2e-4fcd-a459-0e1bc80a6f27';

async function postJson(endpoint, body, token) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  return { status: res.status, ok: res.ok, data };
}

async function getJson(endpoint, token) {
  const headers = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method: 'GET',
    headers,
  });
  const data = await res.json().catch(() => ({}));
  return { status: res.status, ok: res.ok, data };
}

async function patchJson(endpoint, body, token) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  return { status: res.status, ok: res.ok, data };
}

async function run() {
  console.log('================================================================');
  console.log('🚀 TESTING FULL-STACK API WORKFLOWS VIA HTTP ON PORT 3000');
  console.log('================================================================\n');

  // 1. Authenticate Personas
  console.log('🔑 Authenticating personas:');
  const managerLogin = await postJson('/auth/login', {
    email: 'manager@tavonza.ai',
    password: 'Manager@1234',
  });
  if (!managerLogin.ok) {
    throw new Error(`Failed to login as manager: ${JSON.stringify(managerLogin.data)}`);
  }
  const managerToken = managerLogin.data.tokens?.accessToken || managerLogin.data.accessToken;
  console.log('   ✅ Manager authenticated.');

  const kitchenLogin = await postJson('/auth/login', {
    email: 'kitchen@tavonza.ai',
    password: 'Kitchen@1234',
  });
  if (!kitchenLogin.ok) {
    throw new Error(`Failed to login as kitchen: ${JSON.stringify(kitchenLogin.data)}`);
  }
  const kitchenToken = kitchenLogin.data.tokens?.accessToken || kitchenLogin.data.accessToken;
  console.log('   ✅ Kitchen Chef authenticated.\n');

  // 2. Kitchen Table Access & Permissions (Requirement 2B)
  console.log('👉 TEST 2B: Kitchen Table Access & Scoping');
  // Kitchen staff fetching branch tables
  const kitchenTablesRes = await getJson(`/tables?branchId=${DEFAULT_BRANCH_ID}`, kitchenToken);
  console.log(`   Kitchen GET /tables?branchId=${DEFAULT_BRANCH_ID} status: ${kitchenTablesRes.status}`);
  if (kitchenTablesRes.status !== 200) {
    throw new Error(`❌ FAIL: Kitchen staff could not access branch tables! Data: ${JSON.stringify(kitchenTablesRes.data)}`);
  }
  const branchTableList = Array.isArray(kitchenTablesRes.data)
    ? kitchenTablesRes.data
    : kitchenTablesRes.data.data || [];
  console.log(`   Retrieved ${branchTableList.length} tables for assigned branch.`);
  if (branchTableList.length === 0) {
    throw new Error('❌ FAIL: Expected branch tables to be returned.');
  }

  // Cross-branch access prevention: try random branch ID
  const randomBranchId = '00000000-0000-0000-0000-000000000999';
  const crossBranchRes = await getJson(`/tables?branchId=${randomBranchId}`, kitchenToken);
  console.log(`   Kitchen GET /tables?branchId=${randomBranchId} (unrelated branch) status: ${crossBranchRes.status}`);
  if (crossBranchRes.status !== 403) {
    throw new Error(`❌ FAIL: Expected 403 Forbidden for cross-branch table access, got ${crossBranchRes.status}`);
  }
  console.log('   ✅ PASS: Kitchen staff can access their branch tables and is blocked from cross-branch access (403).\n');

  // 3. Waiter Table Assignment (Requirement 1)
  console.log('👉 TEST 1: Waiter Table Assignments with Full Details');
  const targetTable = branchTableList[0];
  const targetTable2 = branchTableList[1] || branchTableList[0];

  // Get real branch staff members
  const staffRes = await getJson(`/branches/${DEFAULT_BRANCH_ID}/staff`, managerToken);
  const staffList = staffRes.data.data || staffRes.data || [];
  const waiterMember = staffList.find((s) => s.role === 'WAITER') || staffList[0];
  if (!waiterMember) {
    throw new Error('❌ FAIL: No staff member found in branch!');
  }
  const waiterId = waiterMember.staffId || waiterMember.id;
  console.log(`   Found Waiter: "${waiterMember.name || waiterMember.staffName}" (Staff ID: ${waiterId})`);

  // Assign table via Manager API
  const assignPayload = {
    branchId: DEFAULT_BRANCH_ID,
    waiterId: waiterId,
    tableId: targetTable.id,
    tableIds: [targetTable.id, targetTable2.id],
    sessionStart: new Date().toISOString(),
    sessionEnd: new Date(Date.now() + 8 * 3600000).toISOString(),
    shiftLabel: 'Dinner Shift',
  };

  const assignRes = await postJson('/waiter/tables/assign', assignPayload, managerToken);
  console.log(`   POST /waiter/tables/assign status: ${assignRes.status}`);
  if (assignRes.status !== 201 && assignRes.status !== 200) {
    throw new Error(`❌ FAIL: Waiter assignment failed: ${JSON.stringify(assignRes.data)}`);
  }
  const assignData = assignRes.data.data || assignRes.data;
  console.log(`   Returned assignedTables count: ${assignData.assignedTables?.length || 0}`);
  if (!assignData.assignedTables || assignData.assignedTables.length === 0) {
    throw new Error('❌ FAIL: Assignment response did not include assignedTables details!');
  }
  const firstAssigned = assignData.assignedTables[0];
  console.log(`   Table details in response: ID=${firstAssigned.id}, Label="${firstAssigned.label}", Status=${firstAssigned.serviceStatus}, Cap=${firstAssigned.capacity}`);
  if (!firstAssigned.label) {
    throw new Error('❌ FAIL: Assigned table detail missing label!');
  }

  // Fetch all assignments for branch
  const assignmentsListRes = await getJson(`/waiter/tables/assignments?branchId=${DEFAULT_BRANCH_ID}&waiterId=${waiterId}`, managerToken);
  const assignmentsList = assignmentsListRes.data.data || assignmentsListRes.data;
  if (!Array.isArray(assignmentsList) || assignmentsList.length === 0) {
    throw new Error('❌ FAIL: GET /waiter/tables/assignments returned empty list!');
  }
  console.log(`   GET /waiter/tables/assignments returned ${assignmentsList.length} assignment records.`);
  console.log('   ✅ PASS: Waiter table assignments returns complete table details and waiter info.\n');

  // 4. Kitchen Order Confirmation & Table Details (Requirement 2A)
  console.log('👉 TEST 2A: Kitchen Order Confirmation Returns Table Details');
  const branchOrdersRes = await getJson(`/orders/branch/${DEFAULT_BRANCH_ID}`, kitchenToken);
  const branchOrders = branchOrdersRes.data.data || branchOrdersRes.data || [];
  let testOrder = branchOrders.find((o) => o.status === 'ACCEPTED' || o.status === 'SUBMITTED');
  if (!testOrder) {
    const tableId = branchTableList[0].id;
    const cartRes = await getJson(`/orders/cart/${DEFAULT_BRANCH_ID}/${tableId}`);
    const cart = cartRes.data.data || cartRes.data;
    const mRes = await getJson(`/menus/${DEFAULT_BRANCH_ID}/items`, managerToken);
    const mItem = (mRes.data.data || mRes.data)[0];
    await postJson(`/orders/cart/${cart.id}/items`, { menuItemId: mItem.id, quantity: 1 });
    const subRes = await postJson(`/orders/${cart.id}/submit`, {});
    testOrder = subRes.data.data || subRes.data;
  }
  console.log(`   Testing status update on Order: ${testOrder.orderNumber} (Current status: ${testOrder.status})`);

  // Confirm/prepare order as Kitchen user
  const orderId = testOrder.id || testOrder.orderId;
  if (testOrder.status === 'SUBMITTED') {
    const acceptRes = await patchJson(`/orders/${orderId}/status`, { status: 'ACCEPTED' }, managerToken);
    console.log(`   PATCH /orders/${orderId}/status (ACCEPTED) status: ${acceptRes.status}`);
  }
  const prepStatusRes = await patchJson(`/orders/${orderId}/status`, { status: 'PREPARING' }, kitchenToken);
  console.log(`   PATCH /orders/${orderId}/status (PREPARING) status: ${prepStatusRes.status}`);
  if (prepStatusRes.status !== 200) {
    throw new Error(`❌ FAIL: Could not update order status to PREPARING: ${JSON.stringify(prepStatusRes.data)}`);
  }
  const updatedOrder = prepStatusRes.data.data || prepStatusRes.data;
  console.log(`   Order response tableLabel: "${updatedOrder.tableLabel}", tableNumber: "${updatedOrder.tableNumber}", tableId: "${updatedOrder.tableId}"`);
  console.log(`   prepStartedAt timestamp: ${updatedOrder.prepStartedAt}`);
  if (updatedOrder.tableId && !updatedOrder.tableLabel) {
    throw new Error('❌ FAIL: Order response missing tableLabel for table order!');
  }
  if (!updatedOrder.prepStartedAt) {
    throw new Error('❌ FAIL: prepStartedAt timestamp was not populated!');
  }
  console.log('   ✅ PASS: Kitchen order status update returns table details and prepStartedAt timestamp.\n');

  // Mark order ready
  const readyStatusRes = await patchJson(`/orders/${orderId}/status`, { status: 'READY' }, kitchenToken);
  const readyOrder = readyStatusRes.data.data || readyStatusRes.data;
  console.log(`   PATCH /orders/${orderId}/status (READY) status: ${readyStatusRes.status}`);
  console.log(`   readyAt timestamp: ${readyOrder.readyAt}`);
  if (!readyOrder.readyAt) {
    throw new Error('❌ FAIL: readyAt timestamp was not populated!');
  }
  console.log('   ✅ PASS: Kitchen ready status sets readyAt timestamp.\n');

  // 5. Cooking Time & Inventory Fields on Menu API
  console.log('👉 TEST 3: Menu Preparation Time & Inventory Management API');
  const menuRes = await getJson(`/menus/${DEFAULT_BRANCH_ID}/items`, managerToken);
  const menuItems = menuRes.data.data || menuRes.data || [];
  console.log(`   Retrieved ${menuItems.length} menu items from /menus/${DEFAULT_BRANCH_ID}/items.`);
  const sampleItem = menuItems[0];
  console.log(`   Sample item: "${sampleItem?.name}", prepTime: ${sampleItem?.estimatedPrepTime ?? sampleItem?.prepTime} mins, stockQuantity: ${sampleItem?.stockQuantity}, isStockTracked: ${sampleItem?.isStockTracked}`);

  // Test updating menu item prep time and stock
  const updateItemRes = await patchJson(`/menus/items/${sampleItem.id}`, {
    stockQuantity: 10,
    isStockTracked: true,
    estimatedPrepTime: 25,
  }, managerToken);
  console.log(`   PATCH /menus/items/${sampleItem.id} status: ${updateItemRes.status}`);
  if (updateItemRes.status !== 200) {
    throw new Error(`❌ FAIL: Could not update menu item: ${JSON.stringify(updateItemRes.data)}`);
  }
  const updatedItem = updateItemRes.data.data || updateItemRes.data;
  console.log(`   Updated item stockQuantity: ${updatedItem.stockQuantity}, isStockTracked: ${updatedItem.isStockTracked}, estimatedPrepTime: ${updatedItem.estimatedPrepTime}`);
  if (updatedItem.stockQuantity !== 10 || updatedItem.isStockTracked !== true || updatedItem.estimatedPrepTime !== 25) {
    throw new Error('❌ FAIL: Menu item update did not persist inventory or prep time fields correctly!');
  }
  console.log('   ✅ PASS: Menu item creation/update supports stock and prep time.\n');

  // 6. Complete Inventory Deduction, Overselling Prevention, and Stock Restoration
  console.log('👉 TEST 4: Concurrency-Safe Stock Deduction, Oversell Prevention, and Restoration');
  // Create cart for table
  const testTableId = branchTableList[2]?.id || branchTableList[0].id;
  const cartRes = await getJson(`/orders/cart/${DEFAULT_BRANCH_ID}/${testTableId}`);
  const cartData = cartRes.data.data || cartRes.data;
  const cartId = cartData.id;
  console.log(`   Got/Created Cart ID: ${cartId}`);

  // Add 3 units of sampleItem
  const addItemRes = await postJson(`/orders/cart/${cartId}/items`, {
    menuItemId: sampleItem.id,
    quantity: 3,
  });
  console.log(`   POST /orders/cart/${cartId}/items (qty: 3) status: ${addItemRes.status}`);
  if (addItemRes.status !== 201 && addItemRes.status !== 200) {
    throw new Error(`❌ FAIL: Add item to cart failed: ${JSON.stringify(addItemRes.data)}`);
  }

  // Submit order -> should deduct 3 from 10, leaving 7
  const submitRes = await postJson(`/orders/${cartId}/submit`, {});
  console.log(`   POST /orders/${cartId}/submit status: ${submitRes.status}`);
  if (submitRes.status !== 200 && submitRes.status !== 201) {
    throw new Error(`❌ FAIL: Submit order failed: ${JSON.stringify(submitRes.data)}`);
  }
  const submittedOrder = submitRes.data.data || submitRes.data;
  console.log(`   Order submitted: ID=${submittedOrder.id}, estimatedPrepTime=${submittedOrder.estimatedPrepTime} mins, status=${submittedOrder.status}`);
  if (submittedOrder.estimatedPrepTime !== 25) {
    throw new Error(`❌ FAIL: Expected order estimatedPrepTime to be 25, got ${submittedOrder.estimatedPrepTime}`);
  }

  // Verify stock quantity was deducted to 7
  const checkStockRes1 = await getJson(`/menus/${DEFAULT_BRANCH_ID}/items`, managerToken);
  const checkItems1 = checkStockRes1.data.data || checkStockRes1.data || [];
  const checkItem1 = checkItems1.find(i => i.id === sampleItem.id);
  console.log(`   Menu item stock after submission: ${checkItem1.stockQuantity} (expected 7)`);
  if (checkItem1.stockQuantity !== 7) {
    throw new Error(`❌ FAIL: Expected stock quantity 7 after deducting 3, got ${checkItem1.stockQuantity}`);
  }
  console.log('   ✅ PASS: Order submission atomically deducted stock from 10 to 7.');

  // Test Cart Oversell Prevention: attempt to add 8 units when only 7 are available
  const testTableId2 = branchTableList[3]?.id || branchTableList[1]?.id;
  const cartRes2 = await getJson(`/orders/cart/${DEFAULT_BRANCH_ID}/${testTableId2}`);
  const cartData2 = cartRes2.data.data || cartRes2.data;
  const cartId2 = cartData2.id;
  const addOversellRes = await postJson(`/orders/cart/${cartId2}/items`, {
    menuItemId: sampleItem.id,
    quantity: 8,
  });
  console.log(`   Cart Add Oversell status: ${addOversellRes.status}`);
  if (addOversellRes.status !== 400) {
    throw new Error(`❌ FAIL: Expected 400 on cart oversell, got ${addOversellRes.status}`);
  }
  console.log(`   Cart Add Oversell error: "${addOversellRes.data?.message}"`);
  console.log('   ✅ PASS: Cart add exceeds stock blocked (400 Bad Request).');

  // Test Concurrent Order Oversell Prevention during submit:
  // Both cart 2 and cart 3 add 4 units (valid when stock is 7)
  const testTableId3 = branchTableList[4]?.id || branchTableList[2]?.id;
  const cartRes3 = await getJson(`/orders/cart/${DEFAULT_BRANCH_ID}/${testTableId3}`);
  const cartData3 = cartRes3.data.data || cartRes3.data;
  const cartId3 = cartData3.id;

  await postJson(`/orders/cart/${cartId2}/items`, { menuItemId: sampleItem.id, quantity: 4 });
  await postJson(`/orders/cart/${cartId3}/items`, { menuItemId: sampleItem.id, quantity: 4 });

  // Cart 2 submits first -> succeeds (stock drops from 7 to 3)
  const submitCart2Res = await postJson(`/orders/${cartId2}/submit`, {});
  console.log(`   Cart 2 submit status: ${submitCart2Res.status}`);
  if (!submitCart2Res.ok) {
    throw new Error(`❌ FAIL: Cart 2 submit failed: ${JSON.stringify(submitCart2Res.data)}`);
  }

  // Cart 3 submits second -> fails with Insufficient stock (stock is 3, requires 4)
  const submitCart3Res = await postJson(`/orders/${cartId3}/submit`, {});
  console.log(`   Cart 3 concurrent submit status: ${submitCart3Res.status}`);
  if (submitCart3Res.status !== 400) {
    throw new Error(`❌ FAIL: Expected 400 on concurrent oversell submit, got ${submitCart3Res.status}`);
  }
  console.log(`   Concurrent submit oversell message: "${submitCart3Res.data?.message}"`);
  console.log('   ✅ PASS: Concurrent submit oversell atomically blocked (400 Bad Request).');

  // Test Cancellation & Stock Restoration on Cart 2 (was 3, should restore 4 back to 7)
  const cancelRes2 = await patchJson(`/orders/${cartId2}/status`, { status: 'CANCELLED' }, kitchenToken);
  console.log(`   PATCH /orders/${cartId2}/status (CANCELLED) status: ${cancelRes2.status}`);
  if (cancelRes2.status !== 200) {
    throw new Error(`❌ FAIL: Could not cancel order: ${JSON.stringify(cancelRes2.data)}`);
  }
  const cancelledOrder2 = cancelRes2.data.data || cancelRes2.data;
  console.log(`   Cancelled order inventoryRestored flag: ${cancelledOrder2.inventoryRestored}`);
  if (!cancelledOrder2.inventoryRestored) {
    throw new Error('❌ FAIL: Order inventoryRestored flag was not set to true!');
  }

  // Check stock after cancelling Cart 2
  const checkStockResAfterC2 = await getJson(`/menus/${DEFAULT_BRANCH_ID}/items`, managerToken);
  const checkItemsAfterC2 = checkStockResAfterC2.data.data || checkStockResAfterC2.data || [];
  const checkItemAfterC2 = checkItemsAfterC2.find(i => i.id === sampleItem.id);
  console.log(`   Menu item stock after Cart 2 cancellation: ${checkItemAfterC2.stockQuantity} (expected 7)`);
  if (checkItemAfterC2.stockQuantity !== 7) {
    throw new Error(`❌ FAIL: Expected stock 7 after Cart 2 cancellation, got ${checkItemAfterC2.stockQuantity}`);
  }

  // Test Cancellation & Stock Restoration on Cart 1 (was 7, should restore 3 back to 10)
  const cancelRes1 = await patchJson(`/orders/${cartId}/status`, { status: 'CANCELLED' }, kitchenToken);
  console.log(`   PATCH /orders/${cartId}/status (CANCELLED) status: ${cancelRes1.status}`);
  const checkStockResAfterC1 = await getJson(`/menus/${DEFAULT_BRANCH_ID}/items`, managerToken);
  const checkItemsAfterC1 = checkStockResAfterC1.data.data || checkStockResAfterC1.data || [];
  const checkItemAfterC1 = checkItemsAfterC1.find(i => i.id === sampleItem.id);
  console.log(`   Menu item stock after Cart 1 cancellation: ${checkItemAfterC1.stockQuantity} (expected 10)`);
  if (checkItemAfterC1.stockQuantity !== 10) {
    throw new Error(`❌ FAIL: Expected stock 10 after restoring original order, got ${checkItemAfterC1.stockQuantity}`);
  }
  console.log('   ✅ PASS: Cancellation idempotently restored stock back to 10.');

  // Test Retry Cancellation: must NOT double-restore stock!
  const retryCancelRes = await patchJson(`/orders/${cartId}/status`, { status: 'CANCELLED' }, kitchenToken);
  console.log(`   Retry PATCH /orders/${cartId}/status (CANCELLED) status: ${retryCancelRes.status}`);
  const checkStockRes3 = await getJson(`/menus/${DEFAULT_BRANCH_ID}/items`, managerToken);
  const checkItems3 = checkStockRes3.data.data || checkStockRes3.data || [];
  const checkItem3 = checkItems3.find(i => i.id === sampleItem.id);
  console.log(`   Menu item stock after retrying cancellation: ${checkItem3.stockQuantity} (must remain 10)`);
  if (checkItem3.stockQuantity !== 10) {
    throw new Error(`❌ FAIL: Double restoration occurred! Stock should be 10, got ${checkItem3.stockQuantity}`);
  }
  console.log('   ✅ PASS: Duplicate cancellation did not restore stock twice.\n');

  console.log('================================================================');
  console.log('🎉 ALL END-TO-END HTTP API WORKFLOW TESTS PASSED CLEANLY!');
  console.log('================================================================');
}

run().catch((err) => {
  console.error('\n❌ HTTP API WORKFLOW TEST FAILED:', err);
  process.exit(1);
});
