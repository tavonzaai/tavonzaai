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
import { DrizzleRbacRepository } from '../../modules/authorization/repositories/drizzle-rbac.repository';
import { AuthCacheService } from '../../modules/identity/services/auth-cache.service';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    @Optional() private readonly rbacRepo?: DrizzleRbacRepository,
    @Optional() private readonly authCache?: AuthCacheService,
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
    let liveLookupSucceeded = false;

    if (this.rbacRepo && user.sub) {
      try {
        let live = await this.authCache?.getEffectivePermissions(user.sub);
        if (!live) {
          live = await this.rbacRepo.getEffectivePermissions(user.sub);
          if (live) {
            await this.authCache?.setEffectivePermissions(user.sub, live);
          }
        }
        effectivePermissions = live?.permissions ?? [];
        scopes = live?.scopes ?? [];
        liveLookupSucceeded = true;
      } catch {
        // Fall back to token permissions if the live lookup fails (e.g. database down)
        liveLookupSucceeded = false;
      }
    }

    if (!liveLookupSucceeded) {
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
          id: this.resolveScopeId(request, requiredScope),
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

  private resolveScopeId(
    request: any,
    requiredScope?: RequiredScopeMetadata,
  ): string | undefined {
    if (!requiredScope) return undefined;
    const param = requiredScope.param || 'id';

    // 1. Explicit named parameter from route path params (e.g. :id or :branchId)
    if (request.params?.[param]) {
      return request.params[param];
    }

    // 2. Type-specific parameter from route path params
    const typeKey = requiredScope.type === 'organization' ? 'organizationId' : 'branchId';
    if (request.params?.[typeKey]) {
      return request.params[typeKey];
    }

    // 3. Type-specific parameter from request body
    if (request.body?.[typeKey]) {
      return request.body[typeKey];
    }

    // 4. Type-specific parameter from query string
    if (request.query?.[typeKey]) {
      return request.query[typeKey];
    }

    return undefined;
  }
}
