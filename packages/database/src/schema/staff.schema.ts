// ============================================================================
// Drizzle Schema — Staff Domain Tables
// ============================================================================
//
// STAFF PROFILE:
//   Extra operational data for users who are staff (waiter, kitchen, cashier,
//   manager, owner). Staff accounts live in `users` with the appropriate role
//   label; this table holds HR/operational metadata.
//
// BRANCH STAFF ASSIGNMENT:
//   A staff member may be assigned to work at one or more branches.
//   Assignments are made by a manager/owner and govern which branch-scoped
//   resources the staff member can access.
// ============================================================================

import {
  pgTable,
  uuid,
  text,
  boolean,
  date,
  timestamp,
  index,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from './user.schema';

// ─── Staff Profiles ───────────────────────────────────────────────────

export const staffProfiles = pgTable(
  'staff_profiles',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .unique()
      .references(() => users.id, { onDelete: 'cascade' }),
    organizationId: uuid('organization_id').notNull(),
    restaurantId: uuid('restaurant_id').notNull(),
    employeeCode: text('employee_code').unique(), // HR reference (optional)
    jobTitle: text('job_title').notNull().default('Staff'), // e.g. 'Waiter', 'Head Waiter'
    status: text('status').notNull().default('active'),
    // 'active' | 'suspended' | 'offboarded'
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    orgRestaurantIdx: index('staff_profiles_org_restaurant_idx').on(
      table.organizationId,
      table.restaurantId,
    ),
    userIdx: index('staff_profiles_user_idx').on(table.userId),
  }),
);

export const staffProfilesRelations = relations(staffProfiles, ({ one, many }) => ({
  user: one(users, {
    fields: [staffProfiles.userId],
    references: [users.id],
  }),
  branchAssignments: many(branchStaffAssignments),
}));

// ─── Branch Staff Assignments ─────────────────────────────────────────
// A staff member is assigned to a branch by a manager.
// They can only operate within assigned branches.

export const branchStaffAssignments = pgTable(
  'branch_staff_assignments',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    branchId: uuid('branch_id').notNull(),
    staffProfileId: uuid('staff_profile_id')
      .notNull()
      .references(() => staffProfiles.id, { onDelete: 'cascade' }),
    assignedById: uuid('assigned_by_id')
      .notNull()
      .references(() => users.id),
    isActive: boolean('is_active').default(true).notNull(),
    assignedAt: timestamp('assigned_at').defaultNow().notNull(),
    revokedAt: timestamp('revoked_at'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    branchActiveIdx: index('branch_staff_assignments_branch_active_idx').on(
      table.branchId,
      table.isActive,
    ),
    staffActiveIdx: index('branch_staff_assignments_staff_active_idx').on(
      table.staffProfileId,
      table.isActive,
    ),
    // One active assignment per branch per staff member
    uniqueActiveBranchStaff: uniqueIndex('branch_staff_assignments_unique_active_idx').on(
      table.branchId,
      table.staffProfileId,
    ),
  }),
);

export const branchStaffAssignmentsRelations = relations(
  branchStaffAssignments,
  ({ one }) => ({
    staffProfile: one(staffProfiles, {
      fields: [branchStaffAssignments.staffProfileId],
      references: [staffProfiles.id],
    }),
    assignedBy: one(users, {
      fields: [branchStaffAssignments.assignedById],
      references: [users.id],
    }),
  }),
);

// ─── Waiter Table Assignments ─────────────────────────────────────────
// Branch manager assigns specific tables to a waiter for a shift/day.
// Only one active waiter may own a table at a time (partial unique index).

export const waiterTableAssignments = pgTable(
  'waiter_table_assignments',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    branchId: uuid('branch_id').notNull(),
    waiterId: uuid('waiter_id')
      .notNull()
      .references(() => users.id),
    tableId: uuid('table_id').notNull(), // FK to tables.id — loose ref (tables module)
    assignedById: uuid('assigned_by_id')
      .notNull()
      .references(() => users.id),
    shiftDate: date('shift_date').notNull(), // Which day this assignment is for
    isActive: boolean('is_active').default(true).notNull(),
    assignedAt: timestamp('assigned_at').defaultNow().notNull(),
    releasedAt: timestamp('released_at'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    branchWaiterActiveIdx: index('waiter_table_assignments_branch_waiter_idx').on(
      table.branchId,
      table.waiterId,
      table.isActive,
    ),
    branchTableActiveIdx: index('waiter_table_assignments_branch_table_idx').on(
      table.branchId,
      table.tableId,
      table.isActive,
    ),
  }),
);

export const waiterTableAssignmentsRelations = relations(
  waiterTableAssignments,
  ({ one }) => ({
    waiter: one(users, {
      fields: [waiterTableAssignments.waiterId],
      references: [users.id],
    }),
    assignedBy: one(users, {
      fields: [waiterTableAssignments.assignedById],
      references: [users.id],
    }),
  }),
);
