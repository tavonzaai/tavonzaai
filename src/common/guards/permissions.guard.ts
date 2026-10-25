// ============================================================================
// PermissionsGuard — Authoritative capability & scope authorization guard
// ============================================================================
// Evaluates Actor + Permission + Scope + Resource according to .agent/AUTHORIZATION.md
// Resolves live database-backed permissions (RBAC + staff assignments) so
// revoked grants take effect without waiting for token expiry.
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
} from '@/authorization';
import { PERMISSIONS_KEY } from '../decorators/require-permissions.decorator';
import {
  SCOPE_KEY,
  type RequiredScopeMetadata,
} from '../decorators/require-scope.decorator';
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

    if (user.role === 'SUPER_ADMIN' || user.globalRole === 'SUPER_ADMIN') {
      return true;
    }

    let effectivePermissions: string[] = [];
    let scopes = user.scopes ?? [];

    if (this.rbacRepo && user.sub) {
      try {
        const live = await this.rbacRepo.getEffectivePermissions(user.sub);
        if (live.permissions.length > 0) {
          effectivePermissions = live.permissions;
        }
        if (live.scopes.length > 0) {
          scopes = live.scopes;
        }
      } catch {
        // Fall back to token permissions if the live lookup fails
      }
    }

    if (effectivePermissions.length === 0) {
      effectivePermissions =
        user.permissions?.length > 0
          ? user.permissions
          : (resolvePermissions(user.role) as string[]);
    }

    const securityContext: SecurityContext = {
      actorType: ActorType.USER,
      actorId: user.sub,
      role: user.role,
      permissions: effectivePermissions,
      scopes,
      organizationId: user.organizationId,
      branchId: user.branchId,
    };

    const requiredScope = this.reflector.getAllAndOverride<RequiredScopeMetadata>(
      SCOPE_KEY,
      [context.getHandler(), context.getClass()],
    );
    const scopeCheck = requiredScope
      ? {
          type: requiredScope.type,
          id: this.resolveScopeId(request, requiredScope.param),
        }
      : undefined;

    const hasAll = requiredPermissions.every((perm) =>
      hasPermission(securityContext, perm, scopeCheck),
    );

    if (!hasAll) {
      throw new ForbiddenException(
        `Insufficient permissions. Required: ${requiredPermissions.join(', ')}`,
      );
    }

    return true;
  }

  private resolveScopeId(request: any, param = 'id'): string | undefined {
    return (
      request.params?.[param] ||
      request.params?.branchId ||
      request.query?.branchId ||
      request.body?.branchId ||
      request.params?.organizationId ||
      request.query?.organizationId ||
      request.body?.organizationId
    );
  }
}
