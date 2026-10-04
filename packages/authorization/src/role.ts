import { Permission } from './permission';

export const GlobalRole = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  ADMIN: 'ADMIN',
  STAFF: 'STAFF',
  CUSTOMER: 'CUSTOMER'
} as const;

export type GlobalRole = (typeof GlobalRole)[keyof typeof GlobalRole];

export const StaffRole = {
  BRANCH_MANAGER: 'BRANCH_MANAGER',
  HOST: 'HOST',
  WAITER: 'WAITER',
  KITCHEN_STAFF: 'KITCHEN_STAFF',
  BARTENDER: 'BARTENDER',
  CASHIER: 'CASHIER'
} as const;

export type StaffRole = (typeof StaffRole)[keyof typeof StaffRole];

export const RoleLabel = {
  ...GlobalRole,
  ...StaffRole
} as const;

export type RoleLabel = (typeof RoleLabel)[keyof typeof RoleLabel];

export const STAFF_ROLE_DEFAULT_PERMISSIONS: Record<string, Permission[]> = {
  [StaffRole.BRANCH_MANAGER]: Object.values(Permission),
  [StaffRole.HOST]: [
    Permission.MANAGE_RESERVATIONS,
    Permission.MANAGE_TABLES,
    Permission.TABLES_READ,
    Permission.TABLES_UPDATE,
  ],
  [StaffRole.WAITER]: [
    Permission.VIEW_ORDERS,
    Permission.ORDERS_READ,
    Permission.ORDERS_CREATE,
    Permission.ORDERS_ACCEPT,
    Permission.ORDERS_REJECT,
    Permission.ORDERS_UPDATE,
    Permission.ORDERS_SERVE,
    Permission.UPDATE_ORDER_STATUS,
    Permission.TABLES_READ,
    Permission.TABLES_UPDATE,
    Permission.MANAGE_TABLES,
    Permission.ALERTS_READ,
    Permission.ALERTS_ACKNOWLEDGE,
    Permission.ALERTS_RESOLVE,
  ],
  [StaffRole.KITCHEN_STAFF]: [
    Permission.VIEW_ORDERS,
    Permission.ORDERS_READ,
    Permission.UPDATE_ORDER_STATUS,
    Permission.ORDERS_UPDATE,
    Permission.MENU_READ,
    Permission.MENU_UPDATE,
  ],
  [StaffRole.BARTENDER]: [
    Permission.VIEW_ORDERS,
    Permission.ORDERS_READ,
    Permission.UPDATE_ORDER_STATUS,
    Permission.ORDERS_UPDATE,
    Permission.MENU_READ,
    Permission.MENU_UPDATE,
  ],
  [StaffRole.CASHIER]: [
    Permission.VIEW_ORDERS,
    Permission.ORDERS_READ,
    Permission.MANAGE_PAYMENTS,
    Permission.PAYMENTS_READ,
    Permission.PAYMENTS_CREATE,
    Permission.PAYMENTS_REFUND,
    Permission.APPLY_DISCOUNTS,
  ],
};

export function resolveStaffPermissions(
  role: StaffRole,
  explicitPermissions: Permission[] = []
): Permission[] {
  const roleDefaults = STAFF_ROLE_DEFAULT_PERMISSIONS[role] ?? [];
  const set = new Set<Permission>([...roleDefaults, ...explicitPermissions]);
  return Array.from(set);
}

export function resolvePermissions(
  role: string,
  explicitPermissions: Permission[] = []
): Permission[] {
  if (
    role === GlobalRole.SUPER_ADMIN ||
    role === 'SUPER_ADMIN' ||
    role === GlobalRole.ADMIN ||
    role === 'ADMIN' ||
    role === 'RESTAURANT_OWNER'
  ) {
    return Object.values(Permission);
  }
  if (role in STAFF_ROLE_DEFAULT_PERMISSIONS) {
    return resolveStaffPermissions(role as StaffRole, explicitPermissions);
  }
  return explicitPermissions;
}
