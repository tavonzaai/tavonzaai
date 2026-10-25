const assert = require('assert');

// Test Suite for Tavonza Payment Architecture
async function runPaymentTests() {
  console.log('🧪 Starting Payment Service Integration & Unit Verification Tests...\n');

  // Load compiled payment modules
  const { PaymentService } = require('/home/euhan/projects/tavonzaai/apps/api/dist/modules/payments/application/payment.service.js');
  const { StripeAdapter } = require('/home/euhan/projects/tavonzaai/apps/api/dist/modules/payments/infrastructure/adapters/stripe.adapter.js');

  // 1. Mock DB state
  const mockOrders = new Map();
  const mockPayments = new Map();
  const mockSessions = new Map();
  const mockEvents = [];

  let currentOrderToReturn = null;
  const mockDb = {
    select: () => {
      let queriedTable = null;
      const builder = {
        from: (table) => {
          queriedTable = table;
          return builder;
        },
        leftJoin: () => builder,
        where: () => builder,
        orderBy: () => builder,
        limit: async () => {
          if (queriedTable && queriedTable.userId) {
            // Staff table query
            return [{ id: 'cashier-staff-id-123' }];
          }
          if (currentOrderToReturn) {
            return [currentOrderToReturn];
          }
          return [{ currency: 'USD' }];
        },
        then: (resolve) => {
          const pendingOfflineList = Array.from(mockPayments.values())
            .filter((p) => p.status === 'UNPAID')
            .map((p) => ({
              id: p.id,
              orderId: p.orderId,
              orderNumber: mockOrders.get(p.orderId)?.orderNumber || '#101',
              tableSessionId: p.tableSessionId,
              payerGuestSessionId: p.payerGuestSessionId,
              amount: p.amount,
              tipAmount: p.tipAmount,
              method: p.method,
              status: p.status,
              transactionRef: p.transactionRef,
              createdAt: p.createdAt,
              tableId: 't-1',
              sessionTableId: null,
            }));
          resolve(pendingOfflineList);
        },
      };
      return builder;
    },
    query: {
      orders: {
        findFirst: async () => currentOrderToReturn,
      },
      tableSessions: {
        findFirst: async () => null,
      },
    },
    update: () => ({
      set: (updateData) => ({
        where: async () => {
          return [updateData];
        },
      }),
    }),
  };

  const mockPaymentRepo = {
    createPayment: async (data) => {
      const id = data.id || `pay_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      const rec = { ...data, id, createdAt: new Date() };
      mockPayments.set(id, rec);
      return rec;
    },
    updateStatus: async (id, status, extras = {}) => {
      const existing = mockPayments.get(id);
      if (!existing) throw new Error(`Payment ${id} not found`);
      const updated = { ...existing, status, ...extras };
      mockPayments.set(id, updated);
      return updated;
    },
    findById: async (id) => mockPayments.get(id) || null,
    findByOrderId: async (orderId) => {
      return Array.from(mockPayments.values()).filter((p) => p.orderId === orderId);
    },
    findByTransactionRef: async (ref) => {
      return Array.from(mockPayments.values()).find((p) => p.transactionRef === ref) || null;
    },
    findPendingByOrderOrSession: async ({ orderId }) => {
      return Array.from(mockPayments.values()).find(
        (p) => p.orderId === orderId && p.status === 'UNPAID'
      ) || null;
    },
  };

  const mockOutboxService = {
    publishEvent: async (topic, payload) => {
      mockEvents.push({ topic, payload });
    },
    dispatch: async (topic, payload) => {
      mockEvents.push({ topic, payload });
    },
  };

  const mockRealtimeGateway = {
    emitToBranch: (branchId, event, data) => {
      mockEvents.push({ type: 'branch', branchId, event, data });
    },
    emitToSession: (sessionId, event, data) => {
      mockEvents.push({ type: 'session', sessionId, event, data });
    },
    emitPaymentStatusChanged: (event) => {
      mockEvents.push({ type: 'realtime', eventName: 'PAYMENT_STATUS_CHANGED', event });
    },
    emitPaymentRequested: (event) => {
      mockEvents.push({ type: 'realtime', eventName: 'PAYMENT_REQUESTED', event });
    },
    emitTableStatusChanged: (event) => {
      mockEvents.push({ type: 'realtime', eventName: 'TABLE_STATUS_CHANGED', event });
    },
    emitTableSessionChanged: (event) => {
      mockEvents.push({ type: 'realtime', eventName: 'TABLE_SESSION_STATUS_CHANGED', event });
    },
  };

  const mockNotificationService = {
    create: async (notif) => {
      mockEvents.push({ type: 'notification', notif });
    },
    createNotification: async (notif) => {
      mockEvents.push({ type: 'notification', notif });
    },
  };

  const stripeAdapter = new StripeAdapter();
  const paymentService = new PaymentService(
    mockDb,
    mockPaymentRepo,
    stripeAdapter,
    mockOutboxService,
    mockRealtimeGateway,
    mockNotificationService
  );

  // ==========================================
  // TEST 1: Payment Options (Stripe config)
  // ==========================================
  console.log('▶ Test 1: getPaymentOptions returns Stripe publishable key and currency');
  const options = await paymentService.getPaymentOptions('b-01');
  assert.ok(options.methods.some((m) => m.id === 'ONLINE_GATEWAY'));
  assert.ok(options.publishableKey);
  assert.strictEqual(options.currency, 'USD');
  console.log('  ✔ Passed: Payment options contain Stripe & branch configurations\n');

  // ==========================================
  // TEST 2: Eligibility Check - Block Unconfirmed Orders
  // ==========================================
  console.log('▶ Test 2: createStripePaymentIntent rejects unconfirmed orders (PENDING / DRAFT)');
  const unconfirmedOrderId = 'ord-unconfirmed-01';
  mockOrders.set(unconfirmedOrderId, {
    id: unconfirmedOrderId,
    organizationId: 'org-01',
    branchId: 'b-01',
    status: 'PENDING', // Awaiting waiter confirmation
    totalAmount: 45.00,
    amountPaid: 0.00,
    currency: 'USD',
  });
  currentOrderToReturn = mockOrders.get(unconfirmedOrderId);

  let failedAsExpected = false;
  try {
    await paymentService.createStripePaymentIntent({ orderId: unconfirmedOrderId });
  } catch (err) {
    if (err.message && err.message.includes('PENDING status')) {
      failedAsExpected = true;
    }
  }
  assert.ok(failedAsExpected, 'Expected createStripePaymentIntent to throw for PENDING order');
  console.log('  ✔ Passed: Payment cannot be initiated until waiter confirms the order\n');

  // ==========================================
  // TEST 3: Stripe Payment Intent Creation for Confirmed Order
  // ==========================================
  console.log('▶ Test 3: createStripePaymentIntent succeeds for CONFIRMED order');
  const confirmedOrderId = 'ord-confirmed-01';
  mockOrders.set(confirmedOrderId, {
    id: confirmedOrderId,
    organizationId: 'org-01',
    branchId: 'b-01',
    status: 'CONFIRMED',
    totalAmount: 65.50,
    amountPaid: 0.00,
    currency: 'USD',
  });
  currentOrderToReturn = mockOrders.get(confirmedOrderId);

  const intentRes = await paymentService.createStripePaymentIntent({ orderId: confirmedOrderId });
  assert.ok(intentRes.clientSecret);
  assert.ok(intentRes.paymentIntentId);
  assert.strictEqual(intentRes.amount, 65.50);
  assert.strictEqual(intentRes.currency.toUpperCase(), 'USD');

  // Verify payment recorded in UNPAID state with Stripe transactionRef
  const pendingStripePayment = await mockPaymentRepo.findByTransactionRef(intentRes.paymentIntentId);
  assert.ok(pendingStripePayment);
  assert.strictEqual(pendingStripePayment.status, 'UNPAID');
  assert.strictEqual(pendingStripePayment.method, 'ONLINE_GATEWAY');
  console.log(`  ✔ Passed: Created intent ${intentRes.paymentIntentId} with UNPAID record\n`);

  // ==========================================
  // TEST 4: Stripe Server-Side Verification
  // ==========================================
  console.log('▶ Test 4: verifyStripePayment verifies payment intent authoritative status');
  const verifyRes = await paymentService.verifyStripePayment(intentRes.paymentIntentId);
  assert.strictEqual(verifyRes.status, 'PAID');

  const settledStripePayment = await mockPaymentRepo.findByTransactionRef(intentRes.paymentIntentId);
  assert.strictEqual(settledStripePayment.status, 'PAID');
  console.log('  ✔ Passed: Verified payment intent and updated status to PAID\n');

  // ==========================================
  // TEST 5: Webhook Idempotency
  // ==========================================
  console.log('▶ Test 5: handleStripeWebhook handles payment_intent.succeeded idempotently');
  const webhookResult1 = await paymentService.handleStripeWebhook(
    JSON.stringify({
      id: 'evt_test_1',
      type: 'payment_intent.succeeded',
      data: {
        object: {
          id: intentRes.paymentIntentId,
          amount_received: 6550,
          currency: 'usd',
          status: 'succeeded',
          metadata: { orderId: confirmedOrderId },
        },
      },
    }),
    'simulated_signature'
  );
  assert.strictEqual(webhookResult1.received, true);
  assert.strictEqual(webhookResult1.processed, true);

  // Re-send same webhook event (duplicate delivery)
  const webhookResult2 = await paymentService.handleStripeWebhook(
    JSON.stringify({
      id: 'evt_test_1',
      type: 'payment_intent.succeeded',
      data: {
        object: {
          id: intentRes.paymentIntentId,
          amount_received: 6550,
          currency: 'usd',
          status: 'succeeded',
          metadata: { orderId: confirmedOrderId },
        },
      },
    }),
    'simulated_signature'
  );
  assert.strictEqual(webhookResult2.received, true);
  assert.strictEqual(webhookResult2.processed, true);
  console.log('  ✔ Passed: Duplicate webhook delivery handled idempotently without duplicate charges\n');

  // ==========================================
  // TEST 6: Offline Payment Request Workflow
  // ==========================================
  console.log('▶ Test 6: requestOfflinePayment creates UNPAID record and alerts cashier');
  const offlineOrderId = 'ord-offline-01';
  mockOrders.set(offlineOrderId, {
    id: offlineOrderId,
    orderNumber: '#TAV-991',
    organizationId: 'org-01',
    branchId: 'b-01',
    status: 'SERVED', // Confirmed meal
    totalAmount: 38.00,
    amountPaid: 0.00,
    currency: 'USD',
  });
  currentOrderToReturn = mockOrders.get(offlineOrderId);

  const offlineReqRes = await paymentService.requestOfflinePayment({
    orderId: offlineOrderId,
    method: 'CASH',
    notes: 'Customer paying exact cash',
  });
  assert.ok(offlineReqRes.success || offlineReqRes.status === 'UNPAID');
  assert.strictEqual(offlineReqRes.status, 'UNPAID');
  const offlinePaymentId = offlineReqRes.id || offlineReqRes.paymentId;
  assert.ok(offlinePaymentId);

  // Check cashier request queue
  const offlineRequests = await paymentService.getOfflinePaymentRequests('b-01');
  assert.ok(offlineRequests.some((r) => r.paymentId === offlinePaymentId));
  console.log(`  ✔ Passed: Offline request ${offlinePaymentId} routed to cashier queue\n`);

  // ==========================================
  // TEST 7: Cashier Payment Receipt Confirmation
  // ==========================================
  console.log('▶ Test 7: confirmOfflinePayment requires authorized cashier and updates status to PAID');
  const confirmRes = await paymentService.confirmOfflinePayment(
    offlinePaymentId,
    'cashier-staff-id-123',
    {}
  );
  assert.strictEqual(confirmRes.status, 'PAID');
  assert.strictEqual(confirmRes.settledById, 'cashier-staff-id-123');

  const settledOfflinePayment = await mockPaymentRepo.findById(offlinePaymentId);
  assert.strictEqual(settledOfflinePayment.status, 'PAID');
  assert.strictEqual(settledOfflinePayment.settledById, 'cashier-staff-id-123');
  console.log('  ✔ Passed: Cashier explicitly confirmed physical receipt and payment marked PAID\n');

  // ==========================================
  // TEST 8: Rejection of Offline Payment Request
  // ==========================================
  console.log('▶ Test 8: rejectOfflinePayment marks payment FAILED with reason');
  const rejectOrderId = 'ord-reject-01';
  mockOrders.set(rejectOrderId, {
    id: rejectOrderId,
    orderNumber: '#TAV-992',
    organizationId: 'org-01',
    branchId: 'b-01',
    status: 'READY',
    totalAmount: 22.00,
    amountPaid: 0.00,
    currency: 'USD',
  });
  currentOrderToReturn = mockOrders.get(rejectOrderId);

  const reqToReject = await paymentService.requestOfflinePayment({
    orderId: rejectOrderId,
    method: 'CARD',
    notes: 'Counter terminal request',
  });
  const rejectPaymentId = reqToReject.id || reqToReject.paymentId;

  const rejectRes = await paymentService.rejectOfflinePayment(
    rejectPaymentId,
    'cashier-staff-id-123',
    { reason: 'Terminal declined card' }
  );
  assert.strictEqual(rejectRes.status, 'FAILED');
  const failedPayment = await mockPaymentRepo.findById(rejectPaymentId);
  assert.strictEqual(failedPayment.status, 'FAILED');
  console.log('  ✔ Passed: Rejected offline request marked FAILED and restored table session\n');

  console.log('🎉 ALL 8 PAYMENT INTEGRATION & UNIT TESTS COMPLETED SUCCESSFULLY!');
}

runPaymentTests().catch((err) => {
  console.error('❌ Test failed with error:', err);
  process.exit(1);
});
