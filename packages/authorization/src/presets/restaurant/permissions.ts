// ============================================================================
// @tavonza/authorization — Restaurant Domain Preset: Permissions
// ============================================================================
// Application-specific permission definitions for the restaurant platform.
// The core authorization package remains domain-agnostic; these definitions
// are consumers of the generic engine.
// ============================================================================

export const RestaurantPermissions = {
  // Orders
  ORDER_READ: 'order:read',
  ORDER_CREATE: 'order:create',
  ORDER_UPDATE: 'order:update',
  ORDER_DELETE: 'order:delete',
  ORDER_ACCEPT: 'order:accept',
  ORDER_REJECT: 'order:reject',
  ORDER_SERVE: 'order:serve',
  ORDER_ALL: 'order:*',

  // Products & Menu
  PRODUCT_READ: 'product:read',
  PRODUCT_CREATE: 'product:create',
  PRODUCT_UPDATE: 'product:update',
  PRODUCT_DELETE: 'product:delete',
  MENU_READ: 'menu:read',
  MENU_UPDATE: 'menu:update',
  MENU_MANAGE: 'menu:manage',

  // Tables & Reservations
  TABLE_READ: 'table:read',
  TABLE_CREATE: 'table:create',
  TABLE_UPDATE: 'table:update',
  TABLE_DELETE: 'table:delete',
  TABLE_ALL: 'table:*',
  RESERVATION_MANAGE: 'reservation:manage',

  // Customers
  CUSTOMER_READ: 'customer:read',
  CUSTOMER_UPDATE: 'customer:update',

  // Payments & Billing
  PAYMENT_READ: 'payment:read',
  PAYMENT_CREATE: 'payment:create',
  PAYMENT_REFUND: 'payment:refund',
  PAYMENT_MANAGE: 'payment:manage',
  DISCOUNT_APPLY: 'discount:apply',

  // Reports & Analytics
  REPORT_READ: 'report:read',
  REPORT_EXPORT: 'report:export',

  // Staff & Branches
  STAFF_READ: 'staff:read',
  STAFF_MANAGE: 'staff:manage',
  BRANCH_SETTINGS_MANAGE: 'branch_settings:manage',

  // Alerts
  ALERT_READ: 'alert:read',
  ALERT_ACKNOWLEDGE: 'alert:acknowledge',
  ALERT_RESOLVE: 'alert:resolve',
} as const;

export type RestaurantPermission =
  (typeof RestaurantPermissions)[keyof typeof RestaurantPermissions];
