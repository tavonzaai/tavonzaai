// ============================================================================
// Orders & Line Items Seeder Module (All Lifecycle States & Station Routing)
// ============================================================================
import { DrizzleDatabase } from '../../client';
import * as schema from '../../schema';
import { calcOrderTotals } from '../constants';

export async function seedOrders(
  db: DrizzleDatabase,
  branches: {
    branch1: typeof schema.branches.$inferSelect;
    branch2: typeof schema.branches.$inferSelect;
  },
  tables: {
    t1: typeof schema.tables.$inferSelect;
    t2: typeof schema.tables.$inferSelect;
    t3: typeof schema.tables.$inferSelect;
    t4: typeof schema.tables.$inferSelect;
    t5: typeof schema.tables.$inferSelect;
    t6: typeof schema.tables.$inferSelect;
    w1: typeof schema.tables.$inferSelect;
    waiterAssignmentsMap: Map<string, string>;
    tableSession1: typeof schema.tableSessions.$inferSelect;
    tableSession3: typeof schema.tableSessions.$inferSelect;
    tableSession4: typeof schema.tableSessions.$inferSelect;
    tableSession5: typeof schema.tableSessions.$inferSelect;
    tableSession6: typeof schema.tableSessions.$inferSelect;
    tableSessionW1: typeof schema.tableSessions.$inferSelect;
    guestSession1: typeof schema.guestSessions.$inferSelect;
    guestSession3Host: typeof schema.guestSessions.$inferSelect;
    guestSession4Host: typeof schema.guestSessions.$inferSelect;
    guestSession4Dwight: typeof schema.guestSessions.$inferSelect;
    guestSession5: typeof schema.guestSessions.$inferSelect;
    guestSession6: typeof schema.guestSessions.$inferSelect;
    guestSessionW1: typeof schema.guestSessions.$inferSelect;
  },
  menu: {
    itemBurger: typeof schema.menuItems.$inferSelect;
    itemSteak: typeof schema.menuItems.$inferSelect;
    itemSalmon: typeof schema.menuItems.$inferSelect;
    itemOldFashioned: typeof schema.menuItems.$inferSelect;
    itemFries: typeof schema.menuItems.$inferSelect;
    itemPizza: typeof schema.menuItems.$inferSelect;
    itemTagliatelle: typeof schema.menuItems.$inferSelect;
    itemMezcalita: typeof schema.menuItems.$inferSelect;
    itemWine: typeof schema.menuItems.$inferSelect;
    itemBeer: typeof schema.menuItems.$inferSelect;
    itemCalamari: typeof schema.menuItems.$inferSelect;
    itemLavaCake: typeof schema.menuItems.$inferSelect;
  },
  staff: {
    waiter1: typeof schema.staff.$inferSelect;
  },
  customers: {
    customer1: typeof schema.customers.$inferSelect;
    customer2: typeof schema.customers.$inferSelect;
  },
  now: Date
) {
  console.log('🏷️ Provisioning Promotional discounts and Orders across lifecycle states...');

  // 1. Promotional Discounts
  await db.insert(schema.discounts).values([
    {
      code: 'WELCOME10',
      type: 'PERCENTAGE',
      value: 10.0,
      isActive: true,
      validFrom: new Date(now.getTime() - 86400000),
      validUntil: new Date(now.getTime() + 30 * 86400000),
    },
    {
      code: 'FLAT5',
      type: 'FIXED_AMOUNT',
      value: 5.0,
      isActive: true,
      validFrom: new Date(now.getTime() - 86400000),
      validUntil: new Date(now.getTime() + 30 * 86400000),
    },
    {
      code: 'VIP20',
      type: 'PERCENTAGE',
      value: 20.0,
      isActive: true,
      validFrom: new Date(now.getTime() - 86400000),
      validUntil: new Date(now.getTime() + 30 * 86400000),
    },
    {
      code: 'EXPIRED50',
      type: 'PERCENTAGE',
      value: 50.0,
      isActive: false,
      validFrom: new Date(now.getTime() - 60 * 86400000),
      validUntil: new Date(now.getTime() - 1 * 86400000),
    },
  ]);

  // 2A. ORD-1001 on T-01: status PENDING (Awaiting Waiter Approval)
  const o1Totals = calcOrderTotals(64.0);
  const [order1] = await db.insert(schema.orders).values({
    orderNumber: 'ORD-1001',
    branchId: branches.branch1.id,
    tableId: tables.t1.id,
    customerId: customers.customer1.id,
    tableSessionId: tables.tableSession1.id,
    guestSessionId: tables.guestSession1.id,
    waiterAssignmentId: tables.waiterAssignmentsMap.get(tables.t1.id),
    channel: 'QR_SELF_ORDER',
    status: 'PENDING',
    subtotal: o1Totals.subtotal,
    taxAmount: o1Totals.taxAmount,
    serviceCharge: o1Totals.serviceCharge,
    totalAmount: o1Totals.totalAmount,
    paymentStatus: 'UNPAID',
    acceptanceMode: 'WAITER_APPROVAL',
    guestName: 'Sarah Jenkins',
    specialInstructions: 'Extra napkins and chipotle aioli on the side please',
  }).returning();
  if (!order1) throw new Error('Failed to create order1');

  await db.insert(schema.orderItems).values([
    {
      orderId: order1.id,
      productId: menu.itemBurger.id,
      productNameSnapshot: menu.itemBurger.name,
      unitPrice: 26.0,
      quantity: 2,
      subtotal: 52.0,
      stationType: 'KITCHEN',
      status: 'PENDING',
    },
    {
      orderId: order1.id,
      productId: menu.itemFries.id,
      productNameSnapshot: menu.itemFries.name,
      unitPrice: 12.0,
      quantity: 1,
      subtotal: 12.0,
      stationType: 'KITCHEN',
      status: 'PENDING',
    },
  ]);

  // 2B. ORD-1002 on T-03: status PREPARING (Cooking in Kitchen & Bar)
  const o2Totals = calcOrderTotals(98.5);
  const [order2] = await db.insert(schema.orders).values({
    orderNumber: 'ORD-1002',
    branchId: branches.branch1.id,
    tableId: tables.t3.id,
    tableSessionId: tables.tableSession3.id,
    guestSessionId: tables.guestSession3Host.id,
    waiterAssignmentId: tables.waiterAssignmentsMap.get(tables.t3.id),
    channel: 'QR_SELF_ORDER',
    status: 'PREPARING',
    acceptedById: staff.waiter1.id,
    acceptedAt: new Date(now.getTime() - 25 * 60 * 1000),
    subtotal: o2Totals.subtotal,
    taxAmount: o2Totals.taxAmount,
    serviceCharge: o2Totals.serviceCharge,
    totalAmount: o2Totals.totalAmount,
    paymentStatus: 'UNPAID',
    guestName: 'Alex Morgan',
  }).returning();
  if (!order2) throw new Error('Failed to create order2');

  await db.insert(schema.orderItems).values([
    {
      orderId: order2.id,
      productId: menu.itemSteak.id,
      productNameSnapshot: menu.itemSteak.name,
      unitPrice: 38.0,
      quantity: 1,
      subtotal: 38.0,
      stationType: 'KITCHEN',
      status: 'PREPARING',
      preparingAt: new Date(now.getTime() - 20 * 60 * 1000),
    },
    {
      orderId: order2.id,
      productId: menu.itemSalmon.id,
      productNameSnapshot: menu.itemSalmon.name,
      unitPrice: 28.5,
      quantity: 1,
      subtotal: 28.5,
      stationType: 'KITCHEN',
      status: 'PREPARING',
      preparingAt: new Date(now.getTime() - 20 * 60 * 1000),
    },
    {
      orderId: order2.id,
      productId: menu.itemOldFashioned.id,
      productNameSnapshot: menu.itemOldFashioned.name,
      unitPrice: 16.0,
      quantity: 2,
      subtotal: 32.0,
      stationType: 'BAR',
      status: 'PREPARING',
      preparingAt: new Date(now.getTime() - 20 * 60 * 1000),
    },
  ]);

  // 2C. ORD-1003 on T-06: status READY (Plated & ready for pickup)
  const o3Totals = calcOrderTotals(39.0);
  const [order3] = await db.insert(schema.orders).values({
    orderNumber: 'ORD-1003',
    branchId: branches.branch1.id,
    tableId: tables.t6.id,
    tableSessionId: tables.tableSession6.id,
    guestSessionId: tables.guestSession6.id,
    waiterAssignmentId: tables.waiterAssignmentsMap.get(tables.t6.id),
    channel: 'DINE_IN',
    status: 'READY',
    acceptedById: staff.waiter1.id,
    acceptedAt: new Date(now.getTime() - 35 * 60 * 1000),
    subtotal: o3Totals.subtotal,
    taxAmount: o3Totals.taxAmount,
    serviceCharge: o3Totals.serviceCharge,
    totalAmount: o3Totals.totalAmount,
    paymentStatus: 'UNPAID',
    guestName: 'Emily Blunt',
  }).returning();
  if (!order3) throw new Error('Failed to create order3');

  await db.insert(schema.orderItems).values([
    {
      orderId: order3.id,
      productId: menu.itemTagliatelle.id,
      productNameSnapshot: menu.itemTagliatelle.name,
      unitPrice: 24.0,
      quantity: 1,
      subtotal: 24.0,
      stationType: 'KITCHEN',
      status: 'READY',
      preparingAt: new Date(now.getTime() - 30 * 60 * 1000),
      readyAt: new Date(now.getTime() - 5 * 60 * 1000),
    },
    {
      orderId: order3.id,
      productId: menu.itemMezcalita.id,
      productNameSnapshot: menu.itemMezcalita.name,
      unitPrice: 15.0,
      quantity: 1,
      subtotal: 15.0,
      stationType: 'BAR',
      status: 'READY',
      preparingAt: new Date(now.getTime() - 30 * 60 * 1000),
      readyAt: new Date(now.getTime() - 8 * 60 * 1000),
    },
  ]);

  // 2D. ORD-1004 on T-04: status SERVED (Split-Bill Tab)
  const o4Totals = calcOrderTotals(192.5);
  const [order4] = await db.insert(schema.orders).values({
    orderNumber: 'ORD-1004',
    branchId: branches.branch1.id,
    tableId: tables.t4.id,
    tableSessionId: tables.tableSession4.id,
    guestSessionId: tables.guestSession4Host.id,
    waiterAssignmentId: tables.waiterAssignmentsMap.get(tables.t4.id),
    channel: 'QR_SELF_ORDER',
    status: 'SERVED',
    acceptedById: staff.waiter1.id,
    acceptedAt: new Date(now.getTime() - 75 * 60 * 1000),
    subtotal: o4Totals.subtotal,
    taxAmount: o4Totals.taxAmount,
    serviceCharge: o4Totals.serviceCharge,
    totalAmount: o4Totals.totalAmount,
    paymentStatus: 'PARTIALLY_PAID',
    amountPaid: 45.0,
    guestName: 'Michael Scott',
  }).returning();
  if (!order4) throw new Error('Failed to create order4');

  const [, order4ItemSteak2] = await db.insert(schema.orderItems).values([
    {
      orderId: order4.id,
      productId: menu.itemSteak.id,
      productNameSnapshot: menu.itemSteak.name,
      unitPrice: 38.0,
      quantity: 1,
      subtotal: 38.0,
      stationType: 'KITCHEN',
      status: 'SERVED',
      servedAt: new Date(now.getTime() - 30 * 60 * 1000),
    },
    {
      orderId: order4.id,
      productId: menu.itemSteak.id,
      productNameSnapshot: menu.itemSteak.name,
      unitPrice: 38.0,
      quantity: 1,
      subtotal: 38.0,
      stationType: 'KITCHEN',
      status: 'SERVED',
      servedAt: new Date(now.getTime() - 30 * 60 * 1000),
    },
    {
      orderId: order4.id,
      productId: menu.itemSalmon.id,
      productNameSnapshot: menu.itemSalmon.name,
      unitPrice: 28.5,
      quantity: 1,
      subtotal: 28.5,
      stationType: 'KITCHEN',
      status: 'SERVED',
      servedAt: new Date(now.getTime() - 30 * 60 * 1000),
    },
    {
      orderId: order4.id,
      productId: menu.itemOldFashioned.id,
      productNameSnapshot: menu.itemOldFashioned.name,
      unitPrice: 16.0,
      quantity: 3,
      subtotal: 48.0,
      stationType: 'BAR',
      status: 'SERVED',
      servedAt: new Date(now.getTime() - 40 * 60 * 1000),
    },
    {
      orderId: order4.id,
      productId: menu.itemLavaCake.id,
      productNameSnapshot: menu.itemLavaCake.name,
      unitPrice: 12.0,
      quantity: 2,
      subtotal: 24.0,
      stationType: 'KITCHEN',
      status: 'SERVED',
      servedAt: new Date(now.getTime() - 20 * 60 * 1000),
    },
    {
      orderId: order4.id,
      productId: menu.itemCalamari.id,
      productNameSnapshot: menu.itemCalamari.name,
      unitPrice: 16.0,
      quantity: 1,
      subtotal: 16.0,
      stationType: 'KITCHEN',
      status: 'SERVED',
      servedAt: new Date(now.getTime() - 55 * 60 * 1000),
    },
  ]).returning();

  // 2E. ORD-1005 on T-04: status CONFIRMED (Second round of drinks)
  const o5Totals = calcOrderTotals(16.0);
  const [order5] = await db.insert(schema.orders).values({
    orderNumber: 'ORD-1005',
    branchId: branches.branch1.id,
    tableId: tables.t4.id,
    tableSessionId: tables.tableSession4.id,
    guestSessionId: tables.guestSession4Dwight.id,
    waiterAssignmentId: tables.waiterAssignmentsMap.get(tables.t4.id),
    channel: 'QR_SELF_ORDER',
    status: 'CONFIRMED',
    acceptanceMode: 'AUTO_ACCEPT',
    acceptedById: staff.waiter1.id,
    acceptedAt: new Date(now.getTime() - 15 * 60 * 1000),
    subtotal: o5Totals.subtotal,
    taxAmount: o5Totals.taxAmount,
    serviceCharge: o5Totals.serviceCharge,
    totalAmount: o5Totals.totalAmount,
    paymentStatus: 'UNPAID',
    guestName: 'Dwight Schrute',
  }).returning();
  if (!order5) throw new Error('Failed to create order5');

  await db.insert(schema.orderItems).values([
    {
      orderId: order5.id,
      productId: menu.itemBeer.id,
      productNameSnapshot: menu.itemBeer.name,
      unitPrice: 8.0,
      quantity: 2,
      subtotal: 16.0,
      stationType: 'BAR',
      status: 'PENDING',
    },
  ]);

  // 2F. ORD-1006 on T-02: status COMPLETED (Settled Card Payment)
  const o6Totals = calcOrderTotals(50.0);
  const [order6] = await db.insert(schema.orders).values({
    orderNumber: 'ORD-1006',
    branchId: branches.branch1.id,
    tableId: tables.t2.id,
    customerId: customers.customer2.id,
    waiterAssignmentId: tables.waiterAssignmentsMap.get(tables.t2.id),
    channel: 'DINE_IN',
    status: 'COMPLETED',
    acceptedById: staff.waiter1.id,
    acceptedAt: new Date(now.getTime() - 180 * 60 * 1000),
    subtotal: o6Totals.subtotal,
    taxAmount: o6Totals.taxAmount,
    serviceCharge: o6Totals.serviceCharge,
    tipAmount: 8.0,
    totalAmount: o6Totals.totalAmount,
    amountPaid: Math.round((o6Totals.totalAmount + 8.0) * 100) / 100,
    paymentStatus: 'PAID',
    guestName: 'John Doe',
  }).returning();
  if (!order6) throw new Error('Failed to create order6');

  const [order6ItemPizza, order6ItemCalamari, order6ItemWine] = await db.insert(schema.orderItems).values([
    {
      orderId: order6.id,
      productId: menu.itemPizza.id,
      productNameSnapshot: menu.itemPizza.name,
      unitPrice: 19.0,
      quantity: 1,
      subtotal: 19.0,
      stationType: 'KITCHEN',
      status: 'SERVED',
      servedAt: new Date(now.getTime() - 140 * 60 * 1000),
    },
    {
      orderId: order6.id,
      productId: menu.itemCalamari.id,
      productNameSnapshot: menu.itemCalamari.name,
      unitPrice: 16.0,
      quantity: 1,
      subtotal: 16.0,
      stationType: 'KITCHEN',
      status: 'SERVED',
      servedAt: new Date(now.getTime() - 150 * 60 * 1000),
    },
    {
      orderId: order6.id,
      productId: menu.itemWine.id,
      productNameSnapshot: menu.itemWine.name,
      unitPrice: 15.0,
      quantity: 1,
      subtotal: 15.0,
      stationType: 'BAR',
      status: 'SERVED',
      servedAt: new Date(now.getTime() - 160 * 60 * 1000),
    },
  ]).returning();

  // 2G. ORD-1007 on T-05: status REJECTED (Kitchen Peak Rush)
  const o7Totals = calcOrderTotals(38.0);
  const [order7] = await db.insert(schema.orders).values({
    orderNumber: 'ORD-1007',
    branchId: branches.branch1.id,
    tableId: tables.t5.id,
    tableSessionId: tables.tableSession5.id,
    guestSessionId: tables.guestSession5.id,
    waiterAssignmentId: tables.waiterAssignmentsMap.get(tables.t5.id),
    channel: 'QR_SELF_ORDER',
    status: 'REJECTED',
    rejectedById: staff.waiter1.id,
    rejectedAt: new Date(now.getTime() - 8 * 60 * 1000),
    rejectionReasonCode: 'KITCHEN_CAPACITY',
    rejectionReason: 'Kitchen currently at maximum rush capacity. Please retry in 15 minutes.',
    subtotal: o7Totals.subtotal,
    taxAmount: o7Totals.taxAmount,
    serviceCharge: o7Totals.serviceCharge,
    totalAmount: o7Totals.totalAmount,
    paymentStatus: 'UNPAID',
    guestName: 'John Doe',
  }).returning();
  if (!order7) throw new Error('Failed to create order7');

  await db.insert(schema.orderItems).values([
    {
      orderId: order7.id,
      productId: menu.itemSteak.id,
      productNameSnapshot: menu.itemSteak.name,
      unitPrice: 38.0,
      quantity: 1,
      subtotal: 38.0,
      stationType: 'KITCHEN',
      status: 'CANCELLED',
      unavailableReason: 'Kitchen at maximum rush capacity',
    },
  ]);

  // 2H. ORD-1008 on T-01: status CANCELLED (Customer changed mind)
  const o8Totals = calcOrderTotals(16.0);
  const [order8] = await db.insert(schema.orders).values({
    orderNumber: 'ORD-1008',
    branchId: branches.branch1.id,
    tableId: tables.t1.id,
    tableSessionId: tables.tableSession1.id,
    guestSessionId: tables.guestSession1.id,
    waiterAssignmentId: tables.waiterAssignmentsMap.get(tables.t1.id),
    channel: 'QR_SELF_ORDER',
    status: 'CANCELLED',
    subtotal: o8Totals.subtotal,
    taxAmount: o8Totals.taxAmount,
    serviceCharge: o8Totals.serviceCharge,
    totalAmount: o8Totals.totalAmount,
    paymentStatus: 'UNPAID',
    specialInstructions: 'Customer changed mind before kitchen confirmed',
  }).returning();
  if (!order8) throw new Error('Failed to create order8');

  await db.insert(schema.orderItems).values([
    {
      orderId: order8.id,
      productId: menu.itemCalamari.id,
      productNameSnapshot: menu.itemCalamari.name,
      unitPrice: 16.0,
      quantity: 1,
      subtotal: 16.0,
      stationType: 'KITCHEN',
      status: 'CANCELLED',
    },
  ]);

  // 2I. ORD-2001 on W-01 (Uptown Lounge): status PENDING
  const o2001Totals = calcOrderTotals(41.0);
  const [order2001] = await db.insert(schema.orders).values({
    orderNumber: 'ORD-2001',
    branchId: branches.branch2.id,
    tableId: tables.w1.id,
    tableSessionId: tables.tableSessionW1.id,
    guestSessionId: tables.guestSessionW1.id,
    waiterAssignmentId: tables.waiterAssignmentsMap.get(tables.w1.id),
    channel: 'QR_SELF_ORDER',
    status: 'PENDING',
    subtotal: o2001Totals.subtotal,
    taxAmount: o2001Totals.taxAmount,
    serviceCharge: o2001Totals.serviceCharge,
    totalAmount: o2001Totals.totalAmount,
    paymentStatus: 'UNPAID',
    guestName: 'David Sterling',
  }).returning();
  if (order2001) {
    await db.insert(schema.orderItems).values([
      {
        orderId: order2001.id,
        productId: menu.itemBurger.id,
        productNameSnapshot: menu.itemBurger.name,
        unitPrice: 26.0,
        quantity: 1,
        subtotal: 26.0,
        stationType: 'KITCHEN',
        status: 'PENDING',
      },
      {
        orderId: order2001.id,
        productId: menu.itemWine.id,
        productNameSnapshot: menu.itemWine.name,
        unitPrice: 15.0,
        quantity: 1,
        subtotal: 15.0,
        stationType: 'BAR',
        status: 'PENDING',
      },
    ]);
  }

  return {
    order1,
    order2,
    order3,
    order4,
    order5,
    order6,
    order7,
    order8,
    order2001,
    order4ItemSteak2,
    order6ItemPizza,
    order6ItemCalamari,
    order6ItemWine,
  };
}
