// ============================================================================
// Roles — Role labels as convenience bundles (Rule 5: Capability over Roles)
// ============================================================================
// Roles are just labels / convenience bundles for permissions and scopes.
// Public user registration is EXCLUSIVELY for customers.
// ============================================================================

import { Permission } from './permission';

export const RoleLabel = {
  CUSTOMER: 'customer',
  WAITER: 'waiter',
  KITCHEN: 'kitchen',
  CASHIER: 'cashier',
  MANAGER: 'manager',
  OWNER: 'owner',
  SUPER_ADMIN: 'super_admin',
} as const;

export type RoleLabel = (typeof RoleLabel)[keyof typeof RoleLabel];

/**
 * Default permission bundles associated with role labels.
 * Actual runtime access is evaluated against capabilities and scopes.
 */
export const ROLE_DEFAULT_PERMISSIONS: Record<string, Permission[]> = {
  [RoleLabel.CUSTOMER]: [
    Permission.MENU_READ,
    Permission.ORDERS_CREATE,
    Permission.ORDERS_READ,
    Permission.TABLE_SESSIONS_JOIN,
    Permission.TABLE_SESSIONS_READ,
    Permission.PAYMENTS_CREATE,
    Permission.FEEDBACK_CREATE,
    Permission.CUSTOMER_SESSIONS_READ,
    Permission.CUSTOMER_SESSIONS_CREATE,
  ],
  [RoleLabel.WAITER]: [
    Permission.MENU_READ,
    Permission.ORDERS_READ,
    Permission.ORDERS_ACCEPT,
    Permission.ORDERS_REJECT,
    Permission.ORDERS_SERVE,
    Permission.TABLES_READ,
    Permission.TABLES_UPDATE,
    Permission.TABLE_SESSIONS_READ,
  ],
  [RoleLabel.KITCHEN]: [
    Permission.ORDERS_READ,
    Permission.KITCHEN_READ,
    Permission.KITCHEN_UPDATE,
  ],
  [RoleLabel.CASHIER]: [
    Permission.ORDERS_READ,
    Permission.PAYMENTS_READ,
    Permission.PAYMENTS_CREATE,
    Permission.TABLE_SESSIONS_READ,
    Permission.TABLE_SESSIONS_CLOSE,
  ],
  [RoleLabel.MANAGER]: [
    Permission.MENU_READ,
    Permission.MENU_UPDATE,
    Permission.ORDERS_READ,
    Permission.ORDERS_ACCEPT,
    Permission.ORDERS_REJECT,
    Permission.ORDERS_UPDATE,
    Permission.ORDERS_SERVE,
    Permission.TABLES_READ,
    Permission.TABLES_UPDATE,
    Permission.TABLE_SESSIONS_READ,
    Permission.TABLE_SESSIONS_CLOSE,
    Permission.PAYMENTS_READ,
    Permission.PAYMENTS_CREATE,
    Permission.PAYMENTS_REFUND,
    Permission.STAFF_READ,
    Permission.REPORTS_READ,
  ],
  [RoleLabel.OWNER]: Object.values(Permission),
  [RoleLabel.SUPER_ADMIN]: Object.values(Permission),
};

/**
 * Resolves the effective permissions for an actor by combining their
 * role's default bundle with any explicitly granted permissions.
 */
export function resolvePermissions(
  role: string,
  explicitPermissions: string[] = [],
): Permission[] {
  const roleDefaults = ROLE_DEFAULT_PERMISSIONS[role] ?? [];
  const set = new Set<Permission>([...roleDefaults, ...(explicitPermissions as Permission[])]);
  return Array.from(set);
}
