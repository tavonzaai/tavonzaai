// ============================================================================
// Drizzle RBAC Repository — Persistent Role-Based Access Control Storage
// ============================================================================

import { Injectable, Inject, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { eq, and, sql } from 'drizzle-orm';
import { DRIZZLE, schema } from '@tavonza/database';
import type { DeclaredPermission, SystemRoleDefinition } from '../../domain/system-permissions';

type DrizzleDb = any;

export interface RoleWithCounts {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  isSystem: boolean;
  userCount: number;
  permissionCount: number;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class DrizzleRbacRepository {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDb) {}

  // ==========================================================================
  // Synchronization (Bootstrap)
  // ==========================================================================

  async syncDeclaredPermissions(declaredPermissions: DeclaredPermission[]): Promise<void> {
    // Ensure wildcard exists
    await this.db
      .insert(schema.permissions)
      .values({
        moduleName: 'global',
        action: '*',
        permissionKey: '*',
        description: 'Global administrator wildcard access granting all capabilities',
        isActive: true,
      })
      .onConflictDoUpdate({
        target: [schema.permissions.permissionKey],
        set: { isActive: true, updatedAt: new Date() },
      });

    // Bulk upsert declared permissions
    for (const perm of declaredPermissions) {
      await this.db
        .insert(schema.permissions)
        .values({
          moduleName: perm.moduleName,
          action: perm.action,
          permissionKey: perm.permissionKey,
          description: perm.description,
          isActive: true,
        })
        .onConflictDoUpdate({
          target: [schema.permissions.permissionKey],
          set: {
            moduleName: perm.moduleName,
            action: perm.action,
            description: perm.description,
            isActive: true,
            updatedAt: new Date(),
          },
        });
    }
  }

  async syncSystemRoles(systemRoles: SystemRoleDefinition[]): Promise<void> {
    const allDbPermissions = await this.db.select().from(schema.permissions);
    const permMap = new Map<string, string>();
    for (const p of allDbPermissions) {
      permMap.set(p.permissionKey, p.id);
    }

    for (const def of systemRoles) {
      // 1. Upsert role
      const [role] = await this.db
        .insert(schema.roles)
        .values({
          name: def.name,
          slug: def.slug,
          description: def.description,
          isSystem: def.isSystem,
        })
        .onConflictDoUpdate({
          target: [schema.roles.slug],
          set: {
            name: def.name,
            description: def.description,
            isSystem: def.isSystem,
            updatedAt: new Date(),
          },
        })
        .returning();

      if (!role) continue;

      // 2. Map permission keys to IDs
      const targetPermissionIds: string[] = [];
      for (const key of def.permissionKeys) {
        const permId = permMap.get(key);
        if (permId) {
          targetPermissionIds.push(permId);
        }
      }

      // 3. Sync role_permissions
      await this.setRolePermissions(role.id, targetPermissionIds);
    }
  }

  // ==========================================================================
  // Role Queries & Mutations
  // ==========================================================================

  async findAllRoles(): Promise<RoleWithCounts[]> {
    const rolesList = await this.db
      .select({
        id: schema.roles.id,
        name: schema.roles.name,
        slug: schema.roles.slug,
        description: schema.roles.description,
        isSystem: schema.roles.isSystem,
        createdAt: schema.roles.createdAt,
        updatedAt: schema.roles.updatedAt,
      })
      .from(schema.roles)
      .orderBy(schema.roles.name);

    // Get counts
    const results: RoleWithCounts[] = [];
    for (const role of rolesList) {
      const [userCountRes] = await this.db
        .select({ count: sql<number>`count(*)::int` })
        .from(schema.userRoles)
        .where(eq(schema.userRoles.roleId, role.id));

      const [permCountRes] = await this.db
        .select({ count: sql<number>`count(*)::int` })
        .from(schema.rolePermissions)
        .where(eq(schema.rolePermissions.roleId, role.id));

      results.push({
        ...role,
        userCount: userCountRes?.count ?? 0,
        permissionCount: permCountRes?.count ?? 0,
      });
    }

    return results;
  }

  async countRoleUsers(roleId: string): Promise<number> {
    const [res] = await this.db
      .select({ count: sql<number>`count(*)::int` })
      .from(schema.userRoles)
      .where(eq(schema.userRoles.roleId, roleId));
    return res?.count ?? 0;
  }

  async findRoleById(id: string) {
    const [role] = await this.db
      .select()
      .from(schema.roles)
      .where(eq(schema.roles.id, id))
      .limit(1);
    return role ?? null;
  }

  async findRoleBySlug(slug: string) {
    const [role] = await this.db
      .select()
      .from(schema.roles)
      .where(eq(schema.roles.slug, slug))
      .limit(1);
    return role ?? null;
  }

  async createRole(data: { name: string; slug: string; description?: string }) {
    const existing = await this.findRoleBySlug(data.slug);
    if (existing) {
      throw new ConflictException(`Role with slug "${data.slug}" already exists`);
    }

    const [role] = await this.db
      .insert(schema.roles)
      .values({
        name: data.name,
        slug: data.slug,
        description: data.description,
        isSystem: false,
      })
      .returning();

    return role;
  }

  async updateRole(id: string, data: { name?: string; slug?: string; description?: string }) {
    const role = await this.findRoleById(id);
    if (!role) {
      throw new NotFoundException(`Role with ID "${id}" not found`);
    }

    if (data.slug && data.slug !== role.slug) {
      const existing = await this.findRoleBySlug(data.slug);
      if (existing && existing.id !== id) {
        throw new ConflictException(`Role with slug "${data.slug}" already exists`);
      }
    }

    const [updated] = await this.db
      .update(schema.roles)
      .set({
        name: data.name ?? role.name,
        slug: data.slug ?? role.slug,
        description: data.description !== undefined ? data.description : role.description,
        updatedAt: new Date(),
      })
      .where(eq(schema.roles.id, id))
      .returning();

    return updated;
  }

  async deleteRole(id: string) {
    const role = await this.findRoleById(id);
    if (!role) {
      throw new NotFoundException(`Role with ID "${id}" not found`);
    }

    if (role.isSystem) {
      throw new BadRequestException(`System role "${role.name}" cannot be deleted`);
    }

    // Check if users are assigned
    const [usersAssigned] = await this.db
      .select({ count: sql<number>`count(*)::int` })
      .from(schema.userRoles)
      .where(eq(schema.userRoles.roleId, id));

    if (usersAssigned && usersAssigned.count > 0) {
      throw new ConflictException(
        `Cannot delete role "${role.name}" because it is currently assigned to ${usersAssigned.count} user(s)`,
      );
    }

    await this.db.delete(schema.roles).where(eq(schema.roles.id, id));
    return { success: true, message: `Role "${role.name}" deleted successfully` };
  }

  // ==========================================================================
  // Permissions Queries
  // ==========================================================================

  async findAllPermissions() {
    return this.db
      .select()
      .from(schema.permissions)
      .where(eq(schema.permissions.isActive, true))
      .orderBy(schema.permissions.moduleName, schema.permissions.action);
  }

  async findPermissionsByRoleId(roleId: string) {
    const rows = await this.db
      .select({
        id: schema.permissions.id,
        moduleName: schema.permissions.moduleName,
        action: schema.permissions.action,
        permissionKey: schema.permissions.permissionKey,
        description: schema.permissions.description,
      })
      .from(schema.rolePermissions)
      .innerJoin(schema.permissions, eq(schema.rolePermissions.permissionId, schema.permissions.id))
      .where(
        and(
          eq(schema.rolePermissions.roleId, roleId),
          eq(schema.permissions.isActive, true),
        ),
      );

    return rows;
  }

  async setRolePermissions(roleId: string, permissionIds: string[]): Promise<void> {
    const role = await this.findRoleById(roleId);
    if (!role) {
      throw new NotFoundException(`Role with ID "${roleId}" not found`);
    }

    // Atomic wipe and re-insert of role permissions
    await this.db.transaction(async (tx: any) => {
      await tx
        .delete(schema.rolePermissions)
        .where(eq(schema.rolePermissions.roleId, roleId));

      if (permissionIds.length > 0) {
        const values = permissionIds.map((pId) => ({
          roleId,
          permissionId: pId,
        }));
        await tx.insert(schema.rolePermissions).values(values);
      }
    });
  }

  // ==========================================================================
  // User Role Assignment (SINGLE ROLE INVARIANT)
  // ==========================================================================

  async assignRoleToUser(userId: string, roleId: string, assignedBy?: string) {
    const role = await this.findRoleById(roleId);
    if (!role) {
      throw new NotFoundException(`Role with ID "${roleId}" not found`);
    }

    const [user] = await this.db
      .select({ id: schema.users.id, email: schema.users.email })
      .from(schema.users)
      .where(eq(schema.users.id, userId))
      .limit(1);

    if (!user) {
      throw new NotFoundException(`User with ID "${userId}" not found`);
    }

    // Atomic upsert: user_roles_user_unique ensures only ONE role per user
    const [assigned] = await this.db
      .insert(schema.userRoles)
      .values({
        userId,
        roleId,
        assignedBy: assignedBy ?? null,
      })
      .onConflictDoUpdate({
        target: [schema.userRoles.userId],
        set: {
          roleId,
          assignedAt: new Date(),
          assignedBy: assignedBy ?? null,
        },
      })
      .returning();

    return {
      userId,
      roleId,
      roleName: role.name,
      roleSlug: role.slug,
      assignedAt: assigned.assignedAt,
    };
  }

  async getUserRole(userId: string) {
    const [userRole] = await this.db
      .select({
        roleId: schema.roles.id,
        roleName: schema.roles.name,
        roleSlug: schema.roles.slug,
        isSystem: schema.roles.isSystem,
        assignedAt: schema.userRoles.assignedAt,
      })
      .from(schema.userRoles)
      .innerJoin(schema.roles, eq(schema.userRoles.roleId, schema.roles.id))
      .where(eq(schema.userRoles.userId, userId))
      .limit(1);

    return userRole ?? null;
  }

  async getUserPermissions(userId: string): Promise<string[]> {
    const userRole = await this.getUserRole(userId);
    if (!userRole) {
      return [];
    }

    // Check if role has wildcard
    const permissions = await this.findPermissionsByRoleId(userRole.roleId);
    const keys = permissions.map((p: any) => p.permissionKey);

    return keys;
  }

  async removeUserRole(userId: string): Promise<boolean> {
    const result = await this.db
      .delete(schema.userRoles)
      .where(eq(schema.userRoles.userId, userId));
    return result.rowCount > 0;
  }
}
