import {
  pgTable,
  uuid,
  varchar,
  text,
  boolean,
  timestamp,
  index,
  unique,
} from 'drizzle-orm/pg-core';
import { users } from './users';

// ============================================================================
// 1. Roles Table
// ============================================================================
export const roles = pgTable(
  'roles',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    name: varchar('name', { length: 100 }).notNull(),
    slug: varchar('slug', { length: 100 }).notNull(),
    description: text('description'),
    isSystem: boolean('is_system').default(false).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    rolesNameUnique: unique('roles_name_unique').on(table.name),
    rolesSlugUnique: unique('roles_slug_unique').on(table.slug),
  }),
);

// ============================================================================
// 2. Permissions Table
// ============================================================================
export const permissions = pgTable(
  'permissions',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    moduleName: varchar('module_name', { length: 100 }).notNull(),
    action: varchar('action', { length: 50 }).notNull(),
    permissionKey: varchar('permission_key', { length: 150 }).notNull(),
    description: text('description'),
    isActive: boolean('is_active').default(true).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    permissionsKeyUnique: unique('permissions_key_unique').on(table.permissionKey),
    permissionsModuleActionUnique: unique('permissions_module_action_unique').on(
      table.moduleName,
      table.action,
    ),
    permissionsModuleIdx: index('permissions_module_idx').on(table.moduleName),
  }),
);

// ============================================================================
// 3. Role Permissions (Many-to-Many Join Table)
// ============================================================================
export const rolePermissions = pgTable(
  'role_permissions',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    roleId: uuid('role_id')
      .notNull()
      .references(() => roles.id, { onDelete: 'cascade' }),
    permissionId: uuid('permission_id')
      .notNull()
      .references(() => permissions.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    rolePermissionsUnique: unique('role_permissions_role_perm_unique').on(
      table.roleId,
      table.permissionId,
    ),
    rolePermissionsRoleIdx: index('role_permissions_role_idx').on(table.roleId),
    rolePermissionsPermIdx: index('role_permissions_perm_idx').on(table.permissionId),
  }),
);

// ============================================================================
// 4. User Roles (Single-Role per User Invariant)
// ============================================================================
export const userRoles = pgTable(
  'user_roles',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    roleId: uuid('role_id')
      .notNull()
      .references(() => roles.id, { onDelete: 'restrict' }),
    assignedAt: timestamp('assigned_at', { withTimezone: true }).defaultNow().notNull(),
    assignedBy: uuid('assigned_by').references(() => users.id, { onDelete: 'set null' }),
  },
  (table) => ({
    // CRITICAL ENFORCEMENT: Unique constraint on user_id enforces exactly ONE role per user
    userRolesUserUnique: unique('user_roles_user_unique').on(table.userId),
    userRolesRoleIdx: index('user_roles_role_idx').on(table.roleId),
  }),
);
