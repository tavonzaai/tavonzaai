// ============================================================================
// PermissionsGuard — Authoritative capability & scope authorization guard
// ============================================================================
// Evaluates Actor + Permission + Scope + Resource according to .agent/AUTHORIZATION.md
// Roles are merely labels / convenience bundles; permissions and scopes govern access.
// ============================================================================

import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import {
  hasPermission,
  resolvePermissions,
  type Permission,
  type SecurityContext,
  ActorType,
} from '@tavonza/authorization';
import { PERMISSIONS_KEY } from '../decorators/require-permissions.decorator';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<Permission[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('User is not authenticated');
    }

    // Build canonical SecurityContext from request.user
    const securityContext: SecurityContext = {
      actorType: ActorType.USER,
      actorId: user.sub,
      role: user.role,
      permissions: user.permissions ?? resolvePermissions(user.role),
      scopes: user.scopes ?? [],
      organizationId: user.organizationId,
    };

    const hasAll = requiredPermissions.every((perm) =>
      hasPermission(securityContext, perm),
    );

    if (!hasAll) {
      throw new ForbiddenException(
        `Insufficient permissions. Required: ${requiredPermissions.join(', ')}`,
      );
    }

    return true;
  }
}
