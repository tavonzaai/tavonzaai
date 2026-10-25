// ============================================================================
// Canonical Permissions & Backward Compatibility Aliases
// Format: module_name:action (e.g. users:read, orders:write)
// ============================================================================

export const Permission = {
  // Global Wildcard (System Admin / Super Admin)
  WILDCARD: '*',

  // Roles & RBAC Management
  ROLES_READ: 'roles:read',
  ROLES_WRITE: 'roles:write',
  ROLES_UPDATE: 'roles:update',
  ROLES_DELETE: 'roles:delete',
  PERMISSIONS_READ: 'permissions:read',
  USERS_ASSIGN_ROLE: 'users:assign_role',

  // Users & Identity
  USERS_READ: 'users:read',
  USERS_WRITE: 'users:write',
  USERS_UPDATE: 'users:update',
  USERS_DELETE: 'users:delete',
  STAFF_READ: 'staff:read',
  STAFF_WRITE: 'staff:write',
  STAFF_UPDATE: 'staff:update',
  STAFF_DELETE: 'staff:delete',
  STAFF_MANAGE: 'staff:manage',
  MANAGE_STAFF: 'staff:manage',

  // Organizations & Branches
  ORGANIZATIONS_READ: 'organizations:read',
  ORGANIZATIONS_WRITE: 'organizations:write',
  ORGANIZATIONS_UPDATE: 'organizations:update',
  ORGANIZATIONS_DELETE: 'organizations:delete',
  BRANCHES_READ: 'branches:read',
  BRANCHES_WRITE: 'branches:write',
  BRANCHES_UPDATE: 'branches:update',
  BRANCHES_DELETE: 'branches:delete',
  BRANCH_SETTINGS_MANAGE: 'branch_settings:manage',
  MANAGE_BRANCH_SETTINGS: 'branch_settings:manage',

  // Orders
  ORDERS_READ: 'orders:read',
  ORDERS_CREATE: 'orders:write',
  ORDERS_WRITE: 'orders:write',
  ORDERS_ACCEPT: 'orders:accept',
  ORDERS_REJECT: 'orders:reject',
  ORDERS_UPDATE: 'orders:update',
  ORDERS_SERVE: 'orders:serve',
  ORDERS_DELETE: 'orders:delete',
  VIEW_ORDERS: 'orders:read',
  UPDATE_ORDER_STATUS: 'orders:update',

  // Tables & Reservations
  TABLES_READ: 'tables:read',
  TABLES_WRITE: 'tables:write',
  TABLES_UPDATE: 'tables:update',
  TABLES_DELETE: 'tables:delete',
  MANAGE_TABLES: 'tables:update',
  RESERVATIONS_READ: 'reservations:read',
  RESERVATIONS_WRITE: 'reservations:write',
  RESERVATIONS_UPDATE: 'reservations:update',
  RESERVATIONS_DELETE: 'reservations:delete',
  MANAGE_RESERVATIONS: 'reservations:manage',

  // Menu & Catalog
  MENU_READ: 'menu:read',
  MENU_WRITE: 'menu:write',
  MENU_UPDATE: 'menu:update',
  MENU_DELETE: 'menu:delete',
  MANAGE_MENU: 'menu:manage',

  // Payments & Billing
  PAYMENTS_READ: 'payments:read',
  PAYMENTS_CREATE: 'payments:write',
  PAYMENTS_WRITE: 'payments:write',
  PAYMENTS_REFUND: 'payments:refund',
  PAYMENTS_MANAGE: 'payments:manage',
  MANAGE_PAYMENTS: 'payments:manage',
  APPLY_DISCOUNTS: 'discounts:apply',
  DISCOUNTS_MANAGE: 'discounts:manage',

  // Inventory & Suppliers
  INVENTORY_READ: 'inventory:read',
  INVENTORY_WRITE: 'inventory:write',
  INVENTORY_UPDATE: 'inventory:update',
  INVENTORY_DELETE: 'inventory:delete',
  SUPPLIERS_READ: 'suppliers:read',
  SUPPLIERS_WRITE: 'suppliers:write',

  // Work Shifts
  SHIFTS_READ: 'shifts:read',
  SHIFTS_WRITE: 'shifts:write',
  SHIFTS_UPDATE: 'shifts:update',
  SHIFTS_DELETE: 'shifts:delete',

  // Alerts & Notifications
  ALERTS_READ: 'alerts:read',
  ALERTS_ACKNOWLEDGE: 'alerts:acknowledge',
  ALERTS_RESOLVE: 'alerts:resolve',

  // Reports & Analytics
  REPORTS_READ: 'reports:read',
  VIEW_REPORTS: 'reports:read',
} as const;

export type Permission = (typeof Permission)[keyof typeof Permission] | string;
