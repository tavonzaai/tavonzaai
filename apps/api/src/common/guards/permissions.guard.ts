// ============================================================================
// PermissionsGuard — Authoritative capability & scope authorization guard
// ============================================================================
// Evaluates Actor + Permission + Scope + Resource according to .agent/AUTHORIZATION.md
// Roles are merely labels / convenience bundles; permissions and scopes govern access.
// Backed by the generic @tavonza/authorization engine.
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
  createActor,
} from '@tavonza/authorization';
import { PERMISSIONS_KEY } from '../decorators/require-permissions.decorator';
import { AuthorizationService } from '../../modules/authorization/authorization.service';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    @Optional() private readonly authService?: AuthorizationService,
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

    // If modern AuthorizationService is available in DI, use the central AuthorizationEngine
    if (this.authService) {
      const actor = createActor({
        id: user.sub,
        type: user.actorType ?? ActorType.USER,
        roles: user.role ? [user.role] : [],
        permissions: user.permissions ?? resolvePermissions(user.role),
        scopes: user.scopes ?? [],
        organizationId: user.organizationId ?? null,
        branchId: user.branchId ?? null,
        attributes: {
          email: user.email,
          globalRole: user.globalRole,
        },
      });

      for (const perm of requiredPermissions) {
        const decision = await this.authService.authorize({
          actor,
          action: perm,
          resource: '*',
          organizationId: request.params?.organizationId ?? actor.organizationId,
          branchId: request.params?.branchId ?? actor.branchId,
        });

        if (!decision.allowed) {
          throw new ForbiddenException(
            decision.reason ?? `Insufficient permissions. Required: ${requiredPermissions.join(', ')}`,
          );
        }
      }

      return true;
    }

    // Fallback path using upgraded hasPermission compatibility function
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
