// ============================================================================
// @tavonza/authorization — Compatibility Layer
// ============================================================================
// Guarantees 100% backwards compatibility for existing consumers:
// - Existing Permission constant & type
// - Existing GlobalRole, StaffRole, RoleLabel
// - Existing resolvePermissions & resolveStaffPermissions
// - Existing SecurityContext interface
// - Existing hasPermission evaluator function
// ============================================================================

import type { Scope as CoreScope } from '../core/scope';
import { PermissionResolver } from '../engine/permission-resolver';
import { ScopeResolver } from '../engine/scope-resolver';
import { createActor } from '../core/actor';
import type { RequiredScopeCheck } from '../core/scope';

export type { RequiredScopeCheck };

// ── 1. Legacy Permission Enum & Type ──────────────────────────────────

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

export type Permission = (typeof Permission)[keyof typeof Permission] | (string & {});

// ── 2. Legacy Roles ───────────────────────────────────────────────────

export const GlobalRole = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  ADMIN: 'ADMIN',
  STAFF: 'STAFF',
  CUSTOMER: 'CUSTOMER',
} as const;

export type GlobalRole = (typeof GlobalRole)[keyof typeof GlobalRole];

export const StaffRole = {
  BRANCH_MANAGER: 'BRANCH_MANAGER',
  HOST: 'HOST',
  WAITER: 'WAITER',
  KITCHEN_STAFF: 'KITCHEN_STAFF',
  BARTENDER: 'BARTENDER',
  CASHIER: 'CASHIER',
} as const;

export type StaffRole = (typeof StaffRole)[keyof typeof StaffRole];

export const RoleLabel = {
  ...GlobalRole,
  ...StaffRole,
} as const;

export type RoleLabel = (typeof RoleLabel)[keyof typeof RoleLabel];

export const CUSTOMER_DEFAULT_PERMISSIONS: Permission[] = [
  Permission.MENU_READ,
  Permission.TABLES_READ,
  Permission.ORDERS_READ,
  Permission.ORDERS_CREATE,
  Permission.PAYMENTS_READ,
];

export const STAFF_ROLE_DEFAULT_PERMISSIONS: Record<string, Permission[]> = {
  [StaffRole.BRANCH_MANAGER]: Object.values(Permission),
  MANAGER: Object.values(Permission),
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
  role: StaffRole | string,
  explicitPermissions: Permission[] = [],
): Permission[] {
  const roleDefaults = STAFF_ROLE_DEFAULT_PERMISSIONS[role] ?? [];
  const set = new Set<Permission>([...roleDefaults, ...explicitPermissions]);
  return Array.from(set);
}

export function resolvePermissions(
  role: string,
  explicitPermissions: Permission[] = [],
): Permission[] {
  if (
    role === GlobalRole.SUPER_ADMIN ||
    role === 'SUPER_ADMIN' ||
    role === GlobalRole.ADMIN ||
    role === 'ADMIN' ||
    role === 'RESTAURANT_OWNER'
  ) {
    return ['*' as Permission, ...Object.values(Permission)];
  }
  if (role === 'BRANCH_MANAGER' || role === 'MANAGER') {
    return resolveStaffPermissions(StaffRole.BRANCH_MANAGER, explicitPermissions);
  }
  if (role === GlobalRole.CUSTOMER || role === 'CUSTOMER') {
    const set = new Set<Permission>([...CUSTOMER_DEFAULT_PERMISSIONS, ...explicitPermissions]);
    return Array.from(set);
  }
  if (role in STAFF_ROLE_DEFAULT_PERMISSIONS) {
    return resolveStaffPermissions(role as StaffRole, explicitPermissions);
  }
  return explicitPermissions;
}

// ── 3. Legacy Security Context ────────────────────────────────────────

export interface SecurityContext {
  actorType: any;
  actorId: string;
  role: string;
  permissions: Permission[];
  scopes: CoreScope[];
  organizationId?: string | null;
  restaurantId?: string | null;
  branchId?: string | null;
}

// ── 4. Upgraded Legacy Evaluator ──────────────────────────────────────

const internalPermissionResolver = new PermissionResolver();
const internalScopeResolver = new ScopeResolver();

/**
 * Backwards-compatible permission check with upgraded wildcard and scope resolution.
 */
export function hasPermission(
  context: SecurityContext,
  requiredPermission: Permission,
  requiredScope?: RequiredScopeCheck,
): boolean {
  // 1. Permission check (with wildcard and delimiter normalization)
  const matchResult = internalPermissionResolver.match({
    grantedPermissions: context.permissions,
    requestedPermission: requiredPermission,
  });

  if (!matchResult.matched) {
    return false;
  }

  // 2. If no scope constraint is requested, capability alone satisfies
  if (!requiredScope) {
    return true;
  }

  // 3. Convert legacy SecurityContext to Actor for scope evaluation
  const actor = createActor({
    id: context.actorId,
    type: context.actorType,
    roles: [context.role],
    permissions: context.permissions,
    scopes: context.scopes,
    organizationId: context.organizationId,
    branchId: context.branchId,
  });

  const scopeResult = internalScopeResolver.evaluateScope({
    actor,
    targetScope: {
      type: requiredScope.type,
      id: requiredScope.id,
      resourceIds: requiredScope.resourceId ? [requiredScope.resourceId] : undefined,
    },
    targetOrganizationId: requiredScope.type === 'organization' ? requiredScope.id : undefined,
    targetBranchId: requiredScope.type === 'branch' ? requiredScope.id : undefined,
  });

  return scopeResult.allowed;
}
