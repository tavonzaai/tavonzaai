// ============================================================================
// Branch access policy — pure decision used by BranchAccessService
// ============================================================================

export interface AccessScope {
  type: string;
  id?: string;
}

export interface BranchOwnership {
  branchId: string;
  restaurantId: string;
  organizationId: string;
  organizationOwnerId: string;
}

export interface BranchAccessActor {
  userId: string;
  isSuperAdmin: boolean;
  /** ADMIN / RESTAURANT_OWNER global role (owner of organizations). */
  isOrganizationAdmin: boolean;
  /** Live scopes from the RBAC repository. */
  scopes: readonly AccessScope[];
}

export function canAccessBranch(actor: BranchAccessActor, branch: BranchOwnership): boolean {
  if (actor.isSuperAdmin) return true;
  if (actor.isOrganizationAdmin && branch.organizationOwnerId === actor.userId) return true;

  return actor.scopes.some((scope) => {
    if (scope.type === 'global') return true;
    if (scope.type === 'organization') return scope.id === branch.organizationId;
    if (scope.type === 'restaurant') return scope.id === branch.restaurantId;
    if (scope.type === 'branch') return scope.id === branch.branchId;
    return false;
  });
}

/** Staff roles a branch-scoped manager may create inside their own branch. */
/** Roles a branch manager may create in their own branch. Never BRANCH_MANAGER. */
export const BRANCH_MANAGER_CREATABLE_ROLES = [
  'WAITER',
  'CASHIER',
  'KITCHEN_STAFF',
  'BARTENDER',
  'HOST',
] as const;

export function canCreateStaffRole(
  actor: { isPrivileged: boolean; managesBranch: boolean },
  role: string,
): boolean {
  if (actor.isPrivileged) return true;
  if (!actor.managesBranch) return false;
  return (BRANCH_MANAGER_CREATABLE_ROLES as readonly string[]).includes(role);
}
