// ============================================================================
// Audit, Reviews, OTPs & Outbox Events Seeder Module
// ============================================================================
import { eq as drizzleOrmEq } from 'drizzle-orm';
import { DrizzleDatabase } from '../../client';
import * as schema from '../../schema';

export async function seedAudit(
  db: DrizzleDatabase,
  branches: {
    branch1: typeof schema.branches.$inferSelect;
  },
  tables: {
    t1: typeof schema.tables.$inferSelect;
    t2: typeof schema.tables.$inferSelect;
    tableSession1: typeof schema.tableSessions.$inferSelect;
  },
  orders: {
    order1: typeof schema.orders.$inferSelect;
    order2: typeof schema.orders.$inferSelect;
    order3: typeof schema.orders.$inferSelect;
    order4: typeof schema.orders.$inferSelect;
    order6: typeof schema.orders.$inferSelect;
    order7: typeof schema.orders.$inferSelect;
  },
  users: {
    superAdmin: typeof schema.users.$inferSelect;
    manager1: typeof schema.users.$inferSelect;
    waiter1: typeof schema.users.$inferSelect;
    kitchen1: typeof schema.users.$inferSelect;
    cashier1: typeof schema.users.$inferSelect;
  },
  customers: {
    customer1: typeof schema.customers.$inferSelect;
    customer2: typeof schema.customers.$inferSelect;
  },
  billing: {
    payment1: typeof schema.payments.$inferSelect;
  },
  now: Date
) {
  console.log('⭐ Recording Customer Order Reviews & Ratings...');

  // 1. Order Reviews
  await db.insert(schema.orderReviews).values([
    {
      orderId: orders.order6.id,
      customerId: customers.customer2.id,
      rating: 5,
      comment: 'Best wood-fired pizza and wine pairing in the city! QR ordering was super fast.',
      isApproved: true,
    },
    {
      orderId: orders.order4.id,
      customerId: customers.customer1.id,
      rating: 5,
      comment: 'Prime ribeye was cooked to absolute perfection. Loved the smoked cocktail!',
      isApproved: false,
    },
    {
      orderId: orders.order3.id,
      customerId: customers.customer2.id,
      rating: 4,
      comment: 'Handmade tagliatelle was fresh and flavorful. Great atmosphere.',
      isApproved: true,
    },
  ]);

  // 2. Table Auth OTPs & Password Reset OTPs
  console.log('🔑 Provisioning Table Auth & Password Reset test OTPs...');
  await db.insert(schema.tableAuthOtps).values([
    {
      contact: 'customer@tavonza.ai',
      tableId: tables.t1.id,
      tableSessionId: tables.tableSession1.id,
      purpose: 'TABLE_AUTH',
      otp: '12345',
      expiresAt: new Date(now.getTime() + 24 * 3600 * 1000),
      verified: true,
    },
    {
      contact: '+1 (555) 777-8899',
      tableId: tables.t2.id,
      purpose: 'TABLE_AUTH',
      otp: '54321',
      expiresAt: new Date(now.getTime() + 24 * 3600 * 1000),
      verified: false,
    },
  ]);

  await db.insert(schema.passwordResetOtps).values([
    {
      email: 'customer@tavonza.ai',
      otp: '12345',
      type: 'password_reset',
      expiresAt: new Date(now.getTime() + 24 * 3600 * 1000),
    },
    {
      email: 'manager@tavonza.ai',
      otp: '67890',
      type: 'password_reset',
      expiresAt: new Date(now.getTime() + 24 * 3600 * 1000),
    },
  ]);

  // 3. Status Transition Logs
  console.log('📝 Logging Status transitions and operational audit entries...');
  await db.insert(schema.statusChangeLogs).values([
    {
      orderId: orders.order2.id,
      previousStatus: 'PENDING',
      newStatus: 'PREPARING',
      changedById: users.waiter1.id,
      note: 'Order approved and routed to Kitchen and Bar production stations',
    },
    {
      orderId: orders.order3.id,
      previousStatus: 'PREPARING',
      newStatus: 'READY',
      changedById: users.kitchen1.id,
      note: 'Dishes and drinks prepared, plated, and staged at pass for pickup',
    },
    {
      orderId: orders.order6.id,
      previousStatus: 'SERVED',
      newStatus: 'COMPLETED',
      changedById: users.cashier1.id,
      note: 'Payment settled in full and receipt issued',
    },
    {
      orderId: orders.order7.id,
      previousStatus: 'PENDING',
      newStatus: 'REJECTED',
      changedById: users.waiter1.id,
      note: 'Order rejected due to kitchen peak capacity rush',
    },
  ]);

  // 4. Order Item Status Change Logs
  const [steakItemOrder2] = await db
    .select()
    .from(schema.orderItems)
    .where(drizzleOrmEq(schema.orderItems.orderId, orders.order2.id));
  if (steakItemOrder2) {
    await db.insert(schema.orderItemStatusChangeLogs).values([
      {
        orderItemId: steakItemOrder2.id,
        previousStatus: 'PENDING',
        newStatus: 'PREPARING',
        changedById: users.kitchen1.id,
        note: 'Started preparation on grill',
      },
    ]);
  }

  // 5. Audit Logs
  await db.insert(schema.auditLogs).values([
    {
      branchId: branches.branch1.id,
      actorId: users.superAdmin.id,
      action: 'SYSTEM_CONFIGURATION_INITIALIZED',
      entityType: 'PlatformSystem',
      entityId: users.superAdmin.id,
      metadata: { roleAssigned: 'SuperAdmin wildcard authority (*)' },
    },
    {
      branchId: branches.branch1.id,
      actorId: users.manager1.id,
      action: 'BRANCH_SETTINGS_UPDATED',
      entityType: 'BranchSettings',
      entityId: branches.branch1.id,
      metadata: { update: 'Taxes, tip policy, and split-bill flags verified' },
    },
    {
      branchId: branches.branch1.id,
      actorId: users.waiter1.id,
      action: 'ORDER_ACCEPTED',
      entityType: 'Order',
      entityId: orders.order2.id,
      metadata: { orderNumber: 'ORD-1002' },
    },
    {
      branchId: branches.branch1.id,
      actorId: users.cashier1.id,
      action: 'PAYMENT_SETTLED',
      entityType: 'Payment',
      entityId: billing.payment1.id,
      metadata: { method: 'CARD', amount: 56.5, tip: 8.0 },
    },
  ]);

  // 6. Outbox Events
  console.log('📬 Populating Outbox Events for event-driven workers...');
  await db.insert(schema.outboxEvents).values([
    {
      aggregateType: 'Order',
      aggregateId: orders.order1.id,
      eventType: 'order.created',
      branchId: branches.branch1.id,
      payload: { orderNumber: 'ORD-1001', totalAmount: orders.order1.totalAmount, tableNumber: 'T-01' },
      status: 'PUBLISHED',
      retries: 0,
    },
    {
      aggregateType: 'Payment',
      aggregateId: billing.payment1.id,
      eventType: 'payment.succeeded',
      branchId: branches.branch1.id,
      payload: { paymentId: billing.payment1.id, amount: 56.5, method: 'CARD', orderId: orders.order6.id },
      status: 'PUBLISHED',
      retries: 0,
    },
    {
      aggregateType: 'Inventory',
      aggregateId: branches.branch1.id,
      eventType: 'inventory.low_stock',
      branchId: branches.branch1.id,
      payload: { itemSku: 'OIL-TRUF-004', currentStock: 1.2, threshold: 2.5 },
      status: 'PENDING',
      retries: 0,
    },
  ]);
}
