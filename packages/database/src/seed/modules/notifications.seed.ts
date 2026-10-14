// ============================================================================
// Notifications Seeder Module (Role-Targeted & User-Targeted Persistent Alerts)
// ============================================================================
import { DrizzleDatabase } from '../../client';
import * as schema from '../../schema';

export async function seedNotifications(
  db: DrizzleDatabase,
  branches: {
    branch1: typeof schema.branches.$inferSelect;
  },
  tables: {
    t4: typeof schema.tables.$inferSelect;
  },
  orders: {
    order1: typeof schema.orders.$inferSelect;
    order2: typeof schema.orders.$inferSelect;
    order3: typeof schema.orders.$inferSelect;
    order4: typeof schema.orders.$inferSelect;
    order6: typeof schema.orders.$inferSelect;
  },
  users: {
    customer1: typeof schema.users.$inferSelect;
  },
  now: Date
) {
  console.log('🔔 Populating Role-Targeted & User-Targeted Persistent Notifications...');

  await db.insert(schema.notifications).values([
    // Waiter notifications
    {
      branchId: branches.branch1.id,
      targetRole: 'WAITER',
      type: 'ORDER_READY',
      title: 'Order Ready for Service',
      message: 'Table T-06: Wild Mushroom Tagliatelle & Mezcalita are ready for pickup.',
      entityType: 'Order',
      entityId: orders.order3.id,
      isRead: false,
      metadata: { tableNumber: 'T-06', orderNumber: 'ORD-1003' },
    },
    {
      branchId: branches.branch1.id,
      targetRole: 'WAITER',
      type: 'WAITER_CALL',
      title: 'Customer Requested Assistance',
      message: 'Table T-04: Guest requested water refill & extra napkins.',
      entityType: 'Table',
      entityId: tables.t4.id,
      isRead: false,
      metadata: { tableNumber: 'T-04' },
    },
    {
      branchId: branches.branch1.id,
      targetRole: 'WAITER',
      type: 'ORDER_CREATED',
      title: 'New Order Received',
      message: 'Table T-01 placed Order ORD-1001 awaiting your approval.',
      entityType: 'Order',
      entityId: orders.order1.id,
      isRead: true,
      readAt: new Date(now.getTime() - 20 * 60 * 1000),
    },

    // Kitchen notifications
    {
      branchId: branches.branch1.id,
      targetRole: 'KITCHEN_STAFF',
      type: 'ORDER_CREATED',
      title: 'New Kitchen Ticket',
      message: 'Order ORD-1002 has 2 signature mains queued for cooking.',
      entityType: 'Order',
      entityId: orders.order2.id,
      isRead: false,
    },
    {
      branchId: branches.branch1.id,
      targetRole: 'KITCHEN_STAFF',
      type: 'ORDER_UPDATED',
      title: 'Ticket Priority Update',
      message: 'Order ORD-1004 has high priority: Table 4 split billing active.',
      entityType: 'Order',
      entityId: orders.order4.id,
      isRead: true,
      readAt: new Date(now.getTime() - 40 * 60 * 1000),
    },

    // Bartender notification
    {
      branchId: branches.branch1.id,
      targetRole: 'BARTENDER',
      type: 'ORDER_CREATED',
      title: 'New Bar Ticket',
      message: 'Order ORD-1002 has 2 Smoked Old Fashioned cocktails queued.',
      entityType: 'Order',
      entityId: orders.order2.id,
      isRead: false,
    },

    // Cashier notifications
    {
      branchId: branches.branch1.id,
      targetRole: 'CASHIER',
      type: 'BILL_REQUESTED',
      title: 'Bill Settlement Requested',
      message: `Table T-04 requested the bill. Remaining balance: $${Math.round((orders.order4.totalAmount - (orders.order4.amountPaid || 0)) * 100) / 100}.`,
      entityType: 'Order',
      entityId: orders.order4.id,
      isRead: false,
      metadata: { tableNumber: 'T-04', orderNumber: 'ORD-1004', balance: 172.53 },
    },
    {
      branchId: branches.branch1.id,
      targetRole: 'CASHIER',
      type: 'PAYMENT_RECEIVED',
      title: 'Payment Confirmed',
      message: 'Card payment of $56.50 (+ $8 tip) settled for Order ORD-1006.',
      entityType: 'Order',
      entityId: orders.order6.id,
      isRead: true,
      readAt: new Date(now.getTime() - 100 * 60 * 1000),
    },

    // Branch Manager notifications
    {
      branchId: branches.branch1.id,
      targetRole: 'BRANCH_MANAGER',
      type: 'LOW_STOCK_ALERT',
      title: 'Low Inventory Warning',
      message: 'Italian White Truffle Oil is below threshold (1.2 / 2.5 L remaining).',
      entityType: 'InventoryItem',
      isRead: false,
    },
    {
      branchId: branches.branch1.id,
      targetRole: 'BRANCH_MANAGER',
      type: 'DAILY_SUMMARY',
      title: 'Shift Opening Confirmed',
      message: 'Morning shift opening roster verified for Downtown HQ.',
      isRead: true,
      readAt: new Date(now.getTime() - 200 * 60 * 1000),
    },

    // Customer-targeted notification (Sarah Jenkins)
    {
      branchId: branches.branch1.id,
      userId: users.customer1.id,
      type: 'LOYALTY_POINTS_CREDITED',
      title: 'Loyalty Bonus Earned',
      message: 'You earned 150 loyalty points on your recent Tavonza dining visit!',
      isRead: false,
    },
  ]);
}
