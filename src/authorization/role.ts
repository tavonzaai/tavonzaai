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
    Permission.TABLES_READ,
    Permission.RESERVATIONS_READ,
    Permission.RESERVATIONS_WRITE,
    Permission.RESERVATIONS_UPDATE,
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
    Permission.TABLES_READ,
  ],
  [StaffRole.BARTENDER]: [
    Permission.VIEW_ORDERS,
    Permission.ORDERS_READ,
    Permission.UPDATE_ORDER_STATUS,
    Permission.ORDERS_UPDATE,
    Permission.MENU_READ,
    Permission.MENU_UPDATE,
    Permission.TABLES_READ,
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

/** Reduced BRANCH_MANAGER template — no staff creation or branch settings. */
export const ASSISTANT_MANAGER_PERMISSIONS: Permission[] = [
  Permission.MANAGE_MENU,
  Permission.MANAGE_TABLES,
  Permission.MANAGE_RESERVATIONS,
  Permission.VIEW_ORDERS,
  Permission.UPDATE_ORDER_STATUS,
  Permission.MANAGE_PAYMENTS,
  Permission.APPLY_DISCOUNTS,
  Permission.VIEW_REPORTS,
  Permission.ORDERS_READ,
  Permission.ORDERS_CREATE,
  Permission.ORDERS_UPDATE,
  Permission.TABLES_READ,
  Permission.MENU_READ,
  Permission.MENU_WRITE,
  Permission.PAYMENTS_READ,
  Permission.ALERTS_READ,
];

export const STAFF_PERMISSION_TEMPLATES: Record<string, Permission[]> = {
  BRANCH_MANAGER: STAFF_ROLE_DEFAULT_PERMISSIONS[StaffRole.BRANCH_MANAGER],
  ASSISTANT_MANAGER: ASSISTANT_MANAGER_PERMISSIONS,
  HOST: STAFF_ROLE_DEFAULT_PERMISSIONS[StaffRole.HOST],
  WAITER: STAFF_ROLE_DEFAULT_PERMISSIONS[StaffRole.WAITER],
  KITCHEN_STAFF: STAFF_ROLE_DEFAULT_PERMISSIONS[StaffRole.KITCHEN_STAFF],
  BARTENDER: STAFF_ROLE_DEFAULT_PERMISSIONS[StaffRole.BARTENDER],
  CASHIER: STAFF_ROLE_DEFAULT_PERMISSIONS[StaffRole.CASHIER],
};

export function resolveStaffPermissions(
  role: StaffRole,
  explicitPermissions: Permission[] = []
): Permission[] {
  if (explicitPermissions.length > 0) {
    return Array.from(new Set(explicitPermissions));
  }
  return [...(STAFF_ROLE_DEFAULT_PERMISSIONS[role] ?? [])];
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
