// ============================================================================
// Billing & Payments Seeder Module (Settlements & Split Allocations)
// ============================================================================
import { DrizzleDatabase } from '../../client';
import * as schema from '../../schema';

export async function seedBilling(
  db: DrizzleDatabase,
  orders: {
    order2: typeof schema.orders.$inferSelect;
    order4: typeof schema.orders.$inferSelect;
    order6: typeof schema.orders.$inferSelect;
    order4ItemSteak2?: typeof schema.orderItems.$inferSelect;
    order6ItemPizza?: typeof schema.orderItems.$inferSelect;
    order6ItemCalamari?: typeof schema.orderItems.$inferSelect;
    order6ItemWine?: typeof schema.orderItems.$inferSelect;
  },
  tables: {
    tableSession3: typeof schema.tableSessions.$inferSelect;
    tableSession4: typeof schema.tableSessions.$inferSelect;
    guestSession3Host: typeof schema.guestSessions.$inferSelect;
    guestSession4Dwight: typeof schema.guestSessions.$inferSelect;
  },
  staff: {
    cashier1: typeof schema.staff.$inferSelect;
  },
  now: Date
) {
  console.log('💳 Generating Settled Payments & Split-Bill Allocations...');

  // 1. Payment 1: Full Card Settlement for Order 1006
  const [payment1] = await db.insert(schema.payments).values({
    orderId: orders.order6.id,
    scope: 'ORDER',
    amount: orders.order6.totalAmount,
    tipAmount: 8.0,
    method: 'CARD',
    status: 'PAID',
    transactionRef: 'ch_live_test_card_1006',
    paidAt: new Date(now.getTime() - 110 * 60 * 1000),
    settledById: staff.cashier1.id,
    collectedById: staff.cashier1.id,
  }).returning();
  if (!payment1) throw new Error('Failed to create payment1');

  if (orders.order6ItemPizza && orders.order6ItemCalamari && orders.order6ItemWine) {
    await db.insert(schema.paymentAllocations).values([
      { paymentId: payment1.id, orderId: orders.order6.id, orderItemId: orders.order6ItemPizza.id, amount: 21.47 },
      { paymentId: payment1.id, orderId: orders.order6.id, orderItemId: orders.order6ItemCalamari.id, amount: 18.08 },
      { paymentId: payment1.id, orderId: orders.order6.id, orderItemId: orders.order6ItemWine.id, amount: 16.95 },
    ]);
  }

  // 2. Payment 2: Cash Settlement for Dwight's split on Table 4 ($45.00 cash)
  const [payment2] = await db.insert(schema.payments).values({
    orderId: orders.order4.id,
    tableSessionId: tables.tableSession4.id,
    payerGuestSessionId: tables.guestSession4Dwight.id,
    scope: 'GUEST_SESSION',
    amount: 45.0,
    tipAmount: 5.0,
    method: 'CASH',
    status: 'PAID',
    transactionRef: 'cash_reg_tx_002',
    paidAt: new Date(now.getTime() - 10 * 60 * 1000),
    settledById: staff.cashier1.id,
    collectedById: staff.cashier1.id,
  }).returning();
  if (!payment2) throw new Error('Failed to create payment2');

  if (orders.order4ItemSteak2) {
    await db.insert(schema.paymentAllocations).values([
      { paymentId: payment2.id, orderId: orders.order4.id, orderItemId: orders.order4ItemSteak2.id, amount: 45.0 },
    ]);
  }

  // 3. Payment 3: Online Stripe PaymentIntent
  await db.insert(schema.payments).values({
    orderId: orders.order2.id,
    tableSessionId: tables.tableSession3.id,
    payerGuestSessionId: tables.guestSession3Host.id,
    scope: 'ORDER',
    amount: orders.order2.totalAmount,
    tipAmount: 15.0,
    method: 'ONLINE_GATEWAY',
    status: 'UNPAID',
    transactionRef: 'pi_3Mv_test_online_gateway_intent',
  });

  return {
    payment1,
    payment2,
  };
}
