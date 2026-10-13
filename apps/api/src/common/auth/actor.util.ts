import { ForbiddenException } from '@nestjs/common';
import { GlobalRole } from '@tavonza/authorization';
import type { JwtPayload } from '../../modules/identity/infrastructure/adapters/jwt.strategy';

const ADMIN_ALIASES = new Set([
  GlobalRole.ADMIN,
  GlobalRole.SUPER_ADMIN,
  'RESTAURANT_OWNER',
]);

export function isSuperAdmin(user: JwtPayload | undefined | null): boolean {
  if (!user) return false;
  return user.globalRole === GlobalRole.SUPER_ADMIN || user.role === GlobalRole.SUPER_ADMIN;
}

export function isOrgAdmin(user: JwtPayload | undefined | null): boolean {
  if (!user) return false;
  if (isSuperAdmin(user)) return true;
  const global = user.globalRole || user.role;
  return ADMIN_ALIASES.has(global);
}

export function assertCanManageOrganizations(user: JwtPayload): void {
  if (!isOrgAdmin(user)) {
    throw new ForbiddenException('Only SUPER_ADMIN and ADMIN can create or manage organizations');
  }
}

export function assertCanAccessOrganization(
  user: JwtPayload,
  org: { ownerId: string } | null,
): void {
  if (!org) return;
  if (isSuperAdmin(user)) return;
  if (!isOrgAdmin(user) || org.ownerId !== user.sub) {
    throw new ForbiddenException('You do not have access to this organization');
  }
}
