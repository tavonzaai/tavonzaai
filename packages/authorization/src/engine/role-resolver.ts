// ============================================================================
// @tavonza/authorization — Engine: Role Resolver
// ============================================================================
// Resolves role inheritance hierarchies, expands nested role permissions,
// and protects against cyclic inheritance graphs.
// ============================================================================

import type { Role } from '../core/role';

export interface RoleProvider {
  getRole(name: string): Role | undefined | Promise<Role | undefined>;
}

export class RoleResolver {
  private readonly staticRoles = new Map<string, Role>();
  private readonly externalProvider?: RoleProvider;

  constructor(options?: { roles?: Role[]; provider?: RoleProvider }) {
    if (options?.roles) {
      for (const role of options.roles) {
        this.staticRoles.set(role.name.toUpperCase(), role);
      }
    }
    this.externalProvider = options?.provider;
  }

  /**
   * Registers a role in the in-memory resolver.
   */
  registerRole(role: Role): void {
    this.staticRoles.set(role.name.toUpperCase(), role);
  }

  /**
   * Retrieves a single role definition.
   */
  async getRole(roleName: string): Promise<Role | undefined> {
    const key = roleName.trim().toUpperCase();
    const staticRole = this.staticRoles.get(key);
    if (staticRole) return staticRole;

    if (this.externalProvider) {
      return await this.externalProvider.getRole(roleName);
    }
    return undefined;
  }

  /**
   * Recursively expands an array of role names into all flattened permissions
   * and maps each permission to the role that granted it.
   */
  async resolvePermissionsForRoles(roleNames: readonly string[]): Promise<{
    permissions: string[];
    permissionToRoleMap: Map<string, string>;
  }> {
    const permissionsSet = new Set<string>();
    const permissionToRoleMap = new Map<string, string>();
    const visitedRoles = new Set<string>();

    const traverse = async (name: string): Promise<void> => {
      const key = name.trim().toUpperCase();
      if (visitedRoles.has(key)) return;
      visitedRoles.add(key);

      const role = await this.getRole(name);
      if (!role) return;

      for (const perm of role.permissions) {
        if (!permissionsSet.has(perm)) {
          permissionsSet.add(perm);
          permissionToRoleMap.set(perm, role.name);
        }
      }

      if (role.inherits && role.inherits.length > 0) {
        for (const inherited of role.inherits) {
          await traverse(inherited);
        }
      }
    };

    for (const name of roleNames) {
      await traverse(name);
    }

    return {
      permissions: Array.from(permissionsSet),
      permissionToRoleMap,
    };
  }
}
