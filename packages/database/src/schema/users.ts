import {
  pgTable,
  uuid,
  varchar,
  text,
  boolean,
  timestamp,
  integer,
  jsonb,
  index,
  unique
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { globalRoleEnum, userStatusEnum, staffRoleEnum } from './enums';
import { branches } from './hierarchy';

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: varchar('email', { length: 255 }).unique().notNull(),
  contactNo: varchar('contact_no', { length: 50 }).unique(),
  password: varchar('password', { length: 255 }),
  fcmToken: text('fcm_token'),
  name: varchar('name', { length: 255 }).notNull(),
  role: globalRoleEnum('role').default('CUSTOMER'),
  avatar: text('avatar'),
  status: userStatusEnum('status').default('ACTIVE'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow()
}, (table) => ({
  roleIdx: index('users_role_idx').on(table.role)
}));

export const admins = pgTable('admins', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').unique().notNull().references(() => users.id, { onDelete: 'cascade' }),
  intro: text('intro').default(''),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow()
});

export const staff = pgTable('staff', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').unique().notNull().references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow()
});

export const owners = pgTable('owners', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').unique().notNull().references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow()
});

export const customers = pgTable('customers', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').unique().notNull().references(() => users.id, { onDelete: 'cascade' }),
  defaultAddress: jsonb('default_address'),
  loyaltyPoints: integer('loyalty_points').default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow()
});

export const staffAssignments = pgTable('staff_assignments', {
  id: uuid('id').defaultRandom().primaryKey(),
  staffId: uuid('staff_id').notNull().references(() => staff.id, { onDelete: 'cascade' }),
  branchId: uuid('branch_id').notNull().references(() => branches.id, { onDelete: 'cascade' }),
  role: staffRoleEnum('role').notNull(),
  permissions: text('permissions').array().default(sql`'{}'`).notNull(),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow()
}, (table) => ({
  staffBranchUnique: unique('staff_branch_unique').on(table.staffId, table.branchId),
  branchIdx: index('staff_assignments_branch_idx').on(table.branchId)
}));
