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
} from '@/authorization';
import type { JwtPayload } from '../../identity/adapters/jwt.strategy';
import {
  BRANCH_MANAGER_CREATABLE_ROLES,
  canCreateStaffRole,
} from './branch-access.policy';

export function assertAssignableStaffRole(role: string): void {
  if (!isAssignableStaffRole(role)) {
    throw new BadRequestException(
      `Invalid staff role. Allowed: ${ASSIGNABLE_STAFF_ROLES.join(', ')}`,
    );
  }
}

export function assertAssignablePermissions(permissions?: string[]): string[] {
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
  options?: {
    /** When false, only BRANCH_MANAGER_CREATABLE_ROLES may be assigned (never BRANCH_MANAGER). */
    privilegedActor?: boolean;
  },
): { role?: string; permissions?: string[] } {
  if (input.role) {
    if (isPrivilegedGlobalRole(input.role) || input.role === 'CUSTOMER' || input.role === 'STAFF') {
      throw new ForbiddenException('Cannot assign a privileged or non-staff role through staff management');
    }
    assertAssignableStaffRole(input.role);

    const privileged = options?.privilegedActor === true
      || isPrivilegedGlobalRole(actor.globalRole)
      || isPrivilegedGlobalRole(actor.role);
    if (!privileged && !canCreateStaffRole({ isPrivileged: false, managesBranch: true }, input.role)) {
      throw new ForbiddenException(
        `Branch managers may only create ${BRANCH_MANAGER_CREATABLE_ROLES.join(', ')} staff in their own branch`,
      );
    }
  }

  const permissions = assertAssignablePermissions(input.permissions);
  assertActorCanGrant(actor, permissions);

  return {
    role: input.role,
    permissions: input.permissions ? permissions : undefined,
  };
}
