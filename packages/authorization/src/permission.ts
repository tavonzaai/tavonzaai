// ============================================================================
// Permissions — Capability-based permissions from .agent/AUTHORIZATION.md
// ============================================================================

export const Permission = {
  // Menu capabilities
  MENU_READ: 'menu.read',
  MENU_UPDATE: 'menu.update',

  // Order capabilities
  ORDERS_CREATE: 'orders.create',
  ORDERS_READ: 'orders.read',
  ORDERS_ACCEPT: 'orders.accept',
  ORDERS_REJECT: 'orders.reject',
  ORDERS_UPDATE: 'orders.update',
  ORDERS_SERVE: 'orders.serve',

  // Table capabilities
  TABLES_READ: 'tables.read',
  TABLES_UPDATE: 'tables.update',

  // Session capabilities
  TABLE_SESSIONS_READ: 'table_sessions.read',
  TABLE_SESSIONS_JOIN: 'table_sessions.join',
  TABLE_SESSIONS_CLOSE: 'table_sessions.close',
  CUSTOMER_SESSIONS_READ: 'customer_sessions.read',
  CUSTOMER_SESSIONS_CREATE: 'customer_sessions.create',

  // Payment capabilities
  PAYMENTS_READ: 'payments.read',
  PAYMENTS_CREATE: 'payments.create',
  PAYMENTS_REFUND: 'payments.refund',

  // Kitchen operations
  KITCHEN_READ: 'kitchen.read',
  KITCHEN_UPDATE: 'kitchen.update',

  // Staff management
  STAFF_READ: 'staff.read',
  STAFF_MANAGE: 'staff.manage',

  // Analytics & reporting
  REPORTS_READ: 'reports.read',

  // Customer feedback
  FEEDBACK_CREATE: 'feedback.create',

  // Alert capabilities
  ALERTS_CREATE: 'alerts.create',
  ALERTS_READ: 'alerts.read',
  ALERTS_ACKNOWLEDGE: 'alerts.acknowledge',
  ALERTS_RESOLVE: 'alerts.resolve',

  // Customer management (waiter auto-creates customer accounts)
  CUSTOMERS_CREATE: 'customers.create',
} as const;

export type Permission = (typeof Permission)[keyof typeof Permission];
