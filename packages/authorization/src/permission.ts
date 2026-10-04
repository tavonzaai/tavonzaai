export const Permission = {
  // Orders
  ORDERS_READ: 'orders.read',
  ORDERS_CREATE: 'orders.create',
  ORDERS_ACCEPT: 'orders.accept',
  ORDERS_REJECT: 'orders.reject',
  ORDERS_UPDATE: 'orders.update',
  ORDERS_SERVE: 'orders.serve',
  VIEW_ORDERS: 'orders.read',
  UPDATE_ORDER_STATUS: 'orders.update',

  // Tables & Reservations
  TABLES_READ: 'tables.read',
  TABLES_UPDATE: 'tables.update',
  MANAGE_TABLES: 'tables.update',
  MANAGE_RESERVATIONS: 'reservations.manage',

  // Payments & Billing
  PAYMENTS_READ: 'payments.read',
  PAYMENTS_CREATE: 'payments.create',
  PAYMENTS_REFUND: 'payments.refund',
  MANAGE_PAYMENTS: 'payments.manage',
  APPLY_DISCOUNTS: 'discounts.apply',

  // Menu & Catalog
  MENU_READ: 'menu.read',
  MENU_UPDATE: 'menu.update',
  MANAGE_MENU: 'menu.manage',

  // Staff & Administration
  STAFF_READ: 'staff.read',
  STAFF_MANAGE: 'staff.manage',
  MANAGE_STAFF: 'staff.manage',
  MANAGE_BRANCH_SETTINGS: 'branch_settings.manage',

  // Alerts & Notifications
  ALERTS_READ: 'alerts.read',
  ALERTS_ACKNOWLEDGE: 'alerts.acknowledge',
  ALERTS_RESOLVE: 'alerts.resolve',

  // Reports
  REPORTS_READ: 'reports.read',
  VIEW_REPORTS: 'reports.read',
} as const;

export type Permission = (typeof Permission)[keyof typeof Permission];
