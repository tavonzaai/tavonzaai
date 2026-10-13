// ============================================================================
// Role Service — Application logic for dynamic roles and permission matrices
// ============================================================================

import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { DrizzleRbacRepository } from '../../infrastructure/persistence/drizzle-rbac.repository';

export interface ModuleActionMatrix {
  [moduleName: string]: {
    read?: boolean;
    write?: boolean;
    update?: boolean;
    delete?: boolean;
    [action: string]: boolean | undefined;
  };
}

export interface RoleDetailWithMatrix {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  isSystem: boolean;
  userCount: number;
  permissionCount: number;
  matrix: ModuleActionMatrix;
  permissions: string[];
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class RoleService {
  constructor(private readonly rbacRepo: DrizzleRbacRepository) {}

  async getAllRoles() {
    return this.rbacRepo.findAllRoles();
  }

  async getRoleById(id: string) {
    const role = await this.rbacRepo.findRoleById(id);
    if (!role) {
      throw new NotFoundException(`Role with ID "${id}" not found`);
    }
    return role;
  }

  async getRoleDetailWithMatrix(id: string): Promise<RoleDetailWithMatrix> {
    const role = await this.getRoleById(id);
    const assignedPerms = await this.rbacRepo.findPermissionsByRoleId(id);
    const allDbPerms = await this.rbacRepo.findAllPermissions();
    const userCount = await this.rbacRepo.countRoleUsers(id);

    const assignedKeys = new Set<string>(assignedPerms.map((p: any) => p.permissionKey));
    const isWildcard = assignedKeys.has('*');

    // Build matrix
    const matrix: ModuleActionMatrix = {};
    for (const p of allDbPerms) {
      if (p.permissionKey === '*') continue;

      if (!matrix[p.moduleName]) {
        matrix[p.moduleName] = {};
      }

      const mod = matrix[p.moduleName];
      if (mod) {
        mod[p.action] = isWildcard || assignedKeys.has(p.permissionKey);
      }
    }

    return {
      id: role.id,
      name: role.name,
      slug: role.slug,
      description: role.description,
      isSystem: role.isSystem,
      userCount,
      permissionCount: assignedPerms.length,
      matrix,
      permissions: Array.from(assignedKeys) as string[],
      createdAt: role.createdAt,
      updatedAt: role.updatedAt,
    };
  }

  async getAllPermissions() {
    const permissions = await this.rbacRepo.findAllPermissions();

    // Group by module
    const grouped: Record<string, any[]> = {};
    for (const p of permissions) {
      if (!grouped[p.moduleName]) {
        grouped[p.moduleName] = [];
      }
      const group = grouped[p.moduleName];
      if (group) {
        group.push(p);
      }
    }

    return {
      total: permissions.length,
      grouped,
      permissions,
    };
  }

  async createRole(dto: {
    name: string;
    slug?: string;
    description?: string;
    permissionKeys?: string[];
    matrix?: ModuleActionMatrix;
  }) {
    const slug = dto.slug || this.slugify(dto.name);
    const role = await this.rbacRepo.createRole({
      name: dto.name,
      slug,
      description: dto.description,
    });

    const targetKeys = this.resolvePermissionKeys(dto.permissionKeys, dto.matrix);
    if (targetKeys.length > 0) {
      await this.syncRolePermissionKeys(role.id, targetKeys);
    }

    return this.getRoleDetailWithMatrix(role.id);
  }

  async updateRole(
    id: string,
    dto: {
      name?: string;
      slug?: string;
      description?: string;
      permissionKeys?: string[];
      matrix?: ModuleActionMatrix;
    },
  ) {
    const role = await this.getRoleById(id);

    if (role.isSystem && dto.slug && dto.slug !== role.slug) {
      throw new BadRequestException('System role slug cannot be changed');
    }

    await this.rbacRepo.updateRole(id, {
      name: dto.name,
      slug: dto.slug,
      description: dto.description,
    });

    if (dto.permissionKeys !== undefined || dto.matrix !== undefined) {
      const targetKeys = this.resolvePermissionKeys(dto.permissionKeys, dto.matrix);
      await this.syncRolePermissionKeys(id, targetKeys);
    }

    return this.getRoleDetailWithMatrix(id);
  }

  async deleteRole(id: string) {
    return this.rbacRepo.deleteRole(id);
  }

  async assignUserRole(userId: string, roleId: string, assignedBy?: string) {
    return this.rbacRepo.assignRoleToUser(userId, roleId, assignedBy);
  }

  async getUserRole(userId: string) {
    return this.rbacRepo.getUserRole(userId);
  }

  async getUserPermissions(userId: string) {
    return this.rbacRepo.getUserPermissions(userId);
  }

  async removeUserRole(userId: string) {
    return this.rbacRepo.removeUserRole(userId);
  }

  // ── Helper Methods ────────────────────────────────────────────────────────

  private slugify(text: string): string {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  private resolvePermissionKeys(
    permissionKeys?: string[],
    matrix?: ModuleActionMatrix,
  ): string[] {
    const keys = new Set<string>(permissionKeys ?? []);

    if (matrix) {
      for (const [moduleName, actions] of Object.entries(matrix)) {
        for (const [action, enabled] of Object.entries(actions)) {
          if (enabled) {
            keys.add(`${moduleName}:${action}`);
          }
        }
      }
    }

    return Array.from(keys);
  }

  private async syncRolePermissionKeys(roleId: string, keys: string[]): Promise<void> {
    const allDbPerms = await this.rbacRepo.findAllPermissions();
    const permMap = new Map<string, string>();
    for (const p of allDbPerms) {
      permMap.set(p.permissionKey, p.id);
    }

    const permissionIds: string[] = [];
    for (const key of keys) {
      const pId = permMap.get(key);
      if (pId) {
        permissionIds.push(pId);
      }
    }

    await this.rbacRepo.setRolePermissions(roleId, permissionIds);
  }
}
