import {
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import {
  ASSIGNABLE_STAFF_ROLES,
  actorCanGrantPermissions,
  isAssignableStaffRole,
  isPrivilegedGlobalRole,
  toStoredPermissionAction,
  toStoredPermissionActions,
  type StaffPermissionAction,
} from '@tavonza/authorization';
import type { JwtPayload } from '../../identity/infrastructure/adapters/jwt.strategy';

export function assertAssignableStaffRole(role: string): void {
  if (!isAssignableStaffRole(role)) {
    throw new BadRequestException(
      `Invalid staff role. Allowed: ${ASSIGNABLE_STAFF_ROLES.join(', ')}`,
    );
  }
}

export function assertAssignablePermissions(permissions?: string[]): StaffPermissionAction[] {
  if (!permissions || permissions.length === 0) {
    return [];
  }

  const stored = toStoredPermissionActions(permissions);
  const unrecognized = permissions.filter((value) => !toStoredPermissionAction(value));
  if (unrecognized.length > 0) {
    throw new BadRequestException(
      `Unrecognized permission(s): ${unrecognized.join(', ')}. Use the platform permission actions.`,
    );
  }

  return stored;
}

export function assertActorCanGrant(
  actor: JwtPayload,
  granted: string[],
): void {
  if (granted.length === 0) {
    return;
  }

  if (isPrivilegedGlobalRole(actor.globalRole) || isPrivilegedGlobalRole(actor.role)) {
    return;
  }

  const actorPermissions = actor.permissions ?? [];
  if (!actorCanGrantPermissions(actorPermissions, granted)) {
    throw new ForbiddenException(
      'You cannot grant permissions that are not in your effective access',
    );
  }
}

export function assertStaffAssignmentInput(
  actor: JwtPayload,
  input: { role?: string; permissions?: string[] },
): { role?: string; permissions?: StaffPermissionAction[] } {
  if (input.role) {
    if (isPrivilegedGlobalRole(input.role) || input.role === 'CUSTOMER' || input.role === 'STAFF') {
      throw new ForbiddenException('Cannot assign a privileged or non-staff role through staff management');
    }
    assertAssignableStaffRole(input.role);
  }

  const permissions = assertAssignablePermissions(input.permissions);
  assertActorCanGrant(actor, permissions);

  return {
    role: input.role,
    permissions: input.permissions ? permissions : undefined,
  };
}
