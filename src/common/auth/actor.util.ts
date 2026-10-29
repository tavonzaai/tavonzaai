import { ForbiddenException } from '@nestjs/common';
import { GlobalRole } from '@/authorization';
import type { JwtPayload } from '../../modules/identity/adapters/jwt.strategy';

const ADMIN_ALIASES = new Set([
  GlobalRole.ADMIN,
  GlobalRole.SUPER_ADMIN,
  'RESTAURANT_OWNER',
]);

export function isSuperAdmin(user: JwtPayload | undefined | null): boolean {
  if (!user) return false;
  return user.globalRole === GlobalRole.SUPER_ADMIN || user.role === GlobalRole.SUPER_ADMIN;
}

export function actorStaffRole(user: JwtPayload | undefined | null): string {
  if (!user) return '';
  return String(user.role || '').toUpperCase();
}

export function isWaiterActor(user: JwtPayload | undefined | null): boolean {
  return actorStaffRole(user) === 'WAITER';
}

export function isKitchenActor(user: JwtPayload | undefined | null): boolean {
  return actorStaffRole(user) === 'KITCHEN_STAFF';
}

export function isBartenderActor(user: JwtPayload | undefined | null): boolean {
  return actorStaffRole(user) === 'BARTENDER';
}

export function isOrgAdmin(user: JwtPayload | undefined | null): boolean {
  if (!user) return false;
  if (isSuperAdmin(user)) return true;
  const global = user.globalRole || user.role;
  return ADMIN_ALIASES.has(global);
}

export function organizationIdsFromActor(user: JwtPayload | undefined | null): string[] {
  if (!user) return [];
  const ids = new Set<string>();
  if (user.organizationId) {
    ids.add(user.organizationId);
  }
  for (const scope of user.scopes ?? []) {
    if (scope.type === 'organization' && scope.id) {
      ids.add(scope.id);
    }
  }
  return Array.from(ids);
}

export function hasOrganizationMembership(
  user: JwtPayload | undefined | null,
  organizationId: string,
): boolean {
  if (!user || !organizationId) return false;
  return organizationIdsFromActor(user).includes(organizationId);
}

export function assertCanManageOrganizations(user: JwtPayload): void {
  if (!isOrgAdmin(user)) {
    throw new ForbiddenException('Only SUPER_ADMIN and ADMIN can create or manage organizations');
  }
}

export function canAccessOrganization(
  user: JwtPayload,
  org: { id?: string; ownerId: string } | null,
): boolean {
  if (!org) return false;
  if (isSuperAdmin(user)) return true;
  if (org.ownerId === user.sub) return true;
  if (isOrgAdmin(user) && org.id && hasOrganizationMembership(user, org.id)) {
    return true;
  }
  return false;
}

export function assertCanAccessOrganization(
  user: JwtPayload,
  org: { id?: string; ownerId: string } | null,
): void {
  if (!org) return;
  if (!canAccessOrganization(user, org)) {
    throw new ForbiddenException('You do not have access to this organization');
  }
}

export function resolveRequestedOrganizationId(
  user: JwtPayload,
  accessibleIds: string[],
  requestedId?: string,
  options?: { requireForSuperAdmin?: boolean },
): string {
  const unique = [...new Set(accessibleIds.filter(Boolean))];

  if (isSuperAdmin(user)) {
    if (requestedId) return requestedId;
    if (options?.requireForSuperAdmin === false && unique[0]) {
      return unique[0];
    }
    throw new ForbiddenException('organizationId is required');
  }

  if (requestedId) {
    if (!unique.includes(requestedId)) {
      throw new ForbiddenException('You do not have access to this organization');
    }
    return requestedId;
  }

  const preferred =
    (user.organizationId && unique.includes(user.organizationId)
      ? user.organizationId
      : unique[0]) ?? null;
  if (!preferred) {
    throw new ForbiddenException('No organization is associated with this account');
  }
  return preferred;
}
