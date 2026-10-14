// ============================================================================
// PermissionsGuard — Authoritative capability & scope authorization guard
// ============================================================================
// Evaluates Actor + Permission + Scope + Resource according to .agent/AUTHORIZATION.md
// Resolves dynamic database-backed permissions from DrizzleRbacRepository with
// graceful backward-compatible fallback to resolvePermissions(user.role).
// ============================================================================

import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Optional,
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
import { DrizzleRbacRepository } from '../../modules/authorization/infrastructure/persistence/drizzle-rbac.repository';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    @Optional() private readonly rbacRepo?: DrizzleRbacRepository,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
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

    // 1. Super Admin bypasses all checks immediately
    if (user.role === 'SUPER_ADMIN' || user.globalRole === 'SUPER_ADMIN') {
      return true;
    }

    // 2. Resolve dynamic permissions
    let effectivePermissions: string[] = user.permissions ?? [];

    if (this.rbacRepo && user.sub) {
      try {
        const dbPerms = await this.rbacRepo.getUserPermissions(user.sub);
        if (dbPerms && dbPerms.length > 0) {
          effectivePermissions = dbPerms;
        }
      } catch {
        // Fallback to token permissions on repository error
      }
    }

    // 3. Fallback to legacy static permissions if none resolved from database
    if (!effectivePermissions || effectivePermissions.length === 0) {
      effectivePermissions = resolvePermissions(user.role) as string[];
    }

    // 4. Build canonical SecurityContext
    const securityContext: SecurityContext = {
      actorType: ActorType.USER,
      actorId: user.sub,
      role: user.role,
      permissions: effectivePermissions,
      scopes: user.scopes ?? [],
      organizationId: user.organizationId,
    };

    // 5. Evaluate capabilities
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
