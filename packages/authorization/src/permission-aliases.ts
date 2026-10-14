import { StaffRole } from './role';

/**
 * Database `permission_action` values stored on `staff_assignments.permissions`.
 * These are the only extra grants an Admin may attach to a branch assignment.
 */
export const STAFF_PERMISSION_ACTIONS = [
  'MANAGE_MENU',
  'MANAGE_TABLES',
  'MANAGE_STAFF',
  'MANAGE_RESERVATIONS',
  'VIEW_ORDERS',
  'UPDATE_ORDER_STATUS',
  'MANAGE_PAYMENTS',
  'APPLY_DISCOUNTS',
  'VIEW_REPORTS',
  'MANAGE_BRANCH_SETTINGS',
] as const;

export type StaffPermissionAction = (typeof STAFF_PERMISSION_ACTIONS)[number];

export const ASSIGNABLE_STAFF_ROLES = Object.values(StaffRole);

/** Maps persisted SCREAMING_SNAKE actions onto canonical `module:action` keys. */
export const PERMISSION_ACTION_TO_CANONICAL: Record<string, string> = {
  MANAGE_MENU: 'menu:manage',
  MANAGE_TABLES: 'tables:update',
  MANAGE_STAFF: 'staff:manage',
  MANAGE_RESERVATIONS: 'reservations:manage',
  VIEW_ORDERS: 'orders:read',
  UPDATE_ORDER_STATUS: 'orders:update',
  MANAGE_PAYMENTS: 'payments:manage',
  APPLY_DISCOUNTS: 'discounts:apply',
  VIEW_REPORTS: 'reports:read',
  MANAGE_BRANCH_SETTINGS: 'branch_settings:manage',
};

const CANONICAL_TO_ACTION: Record<string, StaffPermissionAction> = Object.fromEntries(
  Object.entries(PERMISSION_ACTION_TO_CANONICAL).map(([action, canonical]) => [
    canonical,
    action as StaffPermissionAction,
  ]),
) as Record<string, StaffPermissionAction>;

const MANAGE_IMPLIES = new Set([
  'read',
  'write',
  'update',
  'delete',
  'create',
  'manage',
  'accept',
  'reject',
  'serve',
  'refund',
  'apply',
  'acknowledge',
  'resolve',
  'assign_role',
]);

/**
 * Normalizes any accepted permission spelling to `module:action`.
 * Accepts `menu:manage`, `menu.manage`, and `MANAGE_MENU`.
 */
export function normalizePermissionKey(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return '';

  const screaming = trimmed.toUpperCase().replace(/[\s.:-]+/g, '_');
  if (PERMISSION_ACTION_TO_CANONICAL[screaming]) {
    return PERMISSION_ACTION_TO_CANONICAL[screaming];
  }

  return trimmed.toLowerCase().replace(/[._]/g, ':');
}

export function toStoredPermissionAction(raw: string): StaffPermissionAction | null {
  const canonical = normalizePermissionKey(raw);
  return CANONICAL_TO_ACTION[canonical] ?? null;
}

export function toStoredPermissionActions(raw: string[]): StaffPermissionAction[] {
  const next: StaffPermissionAction[] = [];
  for (const value of raw) {
    const stored = toStoredPermissionAction(value);
    if (stored && !next.includes(stored)) {
      next.push(stored);
    }
  }
  return next;
}

export function isAssignableStaffRole(role: string): role is StaffRole {
  return ASSIGNABLE_STAFF_ROLES.includes(role as StaffRole);
}

export function isPrivilegedGlobalRole(role: string | undefined | null): boolean {
  return (
    role === 'SUPER_ADMIN' || role === 'ADMIN' || role === 'RESTAURANT_OWNER'
  );
}

export function actorHoldsPermission(
  actorPermissions: string[],
  required: string,
): boolean {
  if (actorPermissions.includes('*') || actorPermissions.includes('*:*')) {
    return true;
  }

  const requiredKey = normalizePermissionKey(required);
  const [requiredModule, requiredAction] = requiredKey.split(':');

  for (const perm of actorPermissions) {
    const key = normalizePermissionKey(perm);
    if (key === requiredKey || perm === required) {
      return true;
    }
    if (requiredModule && key === `${requiredModule}:*`) {
      return true;
    }
    if (
      requiredModule &&
      requiredAction &&
      key === `${requiredModule}:manage` &&
      MANAGE_IMPLIES.has(requiredAction)
    ) {
      return true;
    }
  }

  return false;
}

export function actorCanGrantPermissions(
  actorPermissions: string[],
  granted: string[],
): boolean {
  return granted.every((perm) => actorHoldsPermission(actorPermissions, perm));
}
