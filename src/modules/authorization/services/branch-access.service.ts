// ============================================================================
// BranchAccessService — tenant boundary check for branch-scoped resources
// ============================================================================
// Resolves branch → restaurant → organization from the database and evaluates
// the actor's live scopes. Use it whenever an endpoint acts on a resource that
// belongs to a branch (tables, orders, staff, sessions).
// ============================================================================

import { ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DRIZZLE, type DrizzleDatabase, branches, organizations, restaurants } from '@/database';
import { isPrivilegedGlobalRole } from '@/authorization';
import { DrizzleRbacRepository } from '../repositories/drizzle-rbac.repository';
import { canAccessBranch, type BranchOwnership } from './branch-access.policy';
import { isOrgAdmin, isSuperAdmin } from '../../../common/auth/actor.util';
import type { JwtPayload } from '../../identity/adapters/jwt.strategy';

@Injectable()
export class BranchAccessService {
  constructor(
    @Inject(DRIZZLE) private readonly db: DrizzleDatabase,
    private readonly rbacRepo: DrizzleRbacRepository,
  ) {}

  async findOwnership(branchId: string): Promise<BranchOwnership | null> {
    const [row] = await this.db
      .select({
        branchId: branches.id,
        restaurantId: restaurants.id,
        organizationId: organizations.id,
        organizationOwnerId: organizations.ownerId,
      })
      .from(branches)
      .innerJoin(restaurants, eq(restaurants.id, branches.restaurantId))
      .innerJoin(organizations, eq(organizations.id, restaurants.organizationId))
      .where(eq(branches.id, branchId))
      .limit(1);
    return row ?? null;
  }

  async canAccess(user: JwtPayload | null | undefined, branchId: string): Promise<boolean> {
    if (!user || user.typ === 'guest') return false;
    const ownership = await this.findOwnership(branchId);
    if (!ownership) return false;
    return this.evaluate(user, ownership);
  }

  /** Throws 404 for unknown branches and 403 when the actor is outside the branch's tenant. */
  async assertAccess(user: JwtPayload | null | undefined, branchId: string): Promise<BranchOwnership> {
    if (!user || user.typ === 'guest') {
      throw new ForbiddenException('You do not have access to this branch');
    }
    const ownership = await this.findOwnership(branchId);
    if (!ownership) {
      throw new NotFoundException(`Branch with ID "${branchId}" not found`);
    }
    if (!(await this.evaluate(user, ownership))) {
      throw new ForbiddenException('You do not have access to this branch');
    }
    return ownership;
  }

  /** True when the actor holds an active staff assignment (not just org ownership) for the branch. */
  async isAssignedToBranch(user: JwtPayload, branchId: string): Promise<boolean> {
    const live = await this.rbacRepo.getEffectivePermissions(user.sub);
    return live.scopes.some((scope) => scope.type === 'branch' && scope.id === branchId);
  }

  isPrivileged(user: JwtPayload): boolean {
    return isSuperAdmin(user) || isPrivilegedGlobalRole(user.globalRole) || isPrivilegedGlobalRole(user.role);
  }

  private async evaluate(user: JwtPayload, ownership: BranchOwnership): Promise<boolean> {
    const superAdmin = isSuperAdmin(user);
    const live = superAdmin ? { scopes: [] } : await this.rbacRepo.getEffectivePermissions(user.sub);
    return canAccessBranch(
      {
        userId: user.sub,
        isSuperAdmin: superAdmin,
        isOrganizationAdmin: isOrgAdmin(user),
        scopes: live.scopes,
      },
      ownership,
    );
  }
}
