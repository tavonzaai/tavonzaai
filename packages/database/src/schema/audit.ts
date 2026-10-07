import {
  pgTable,
  uuid,
  varchar,
  text,
  boolean,
  timestamp,
  date,
  integer,
  jsonb,
  index
} from 'drizzle-orm/pg-core';
import { orderStatusEnum, orderItemStatusEnum, otpPurposeEnum } from './enums';
import { branches } from './hierarchy';
import { users, customers } from './users';
import { orders, orderItems } from './orders';
import { tables } from './tables';
import { tableSessions } from './sessions';

export const auditLogs = pgTable('audit_logs', {
  id: uuid('id').defaultRandom().primaryKey(),
  branchId: uuid('branch_id').references(() => branches.id, { onDelete: 'set null' }),
  actorId: uuid('actor_id').notNull().references(() => users.id, { onDelete: 'restrict' }),
  action: varchar('action', { length: 255 }).notNull(),
  entityType: varchar('entity_type', { length: 100 }).notNull(),
  entityId: uuid('entity_id').notNull(),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow()
}, (table) => ({
  branchIdx: index('audit_logs_branch_idx').on(table.branchId),
  actorIdx: index('audit_logs_actor_idx').on(table.actorId),
  entityIdx: index('audit_logs_entity_idx').on(table.entityType, table.entityId)
}));

export const orderReviews = pgTable('order_reviews', {
  id: uuid('id').defaultRandom().primaryKey(),
  orderId: uuid('order_id').unique().notNull().references(() => orders.id, { onDelete: 'cascade' }),
  customerId: uuid('customer_id').notNull().references(() => customers.id, { onDelete: 'cascade' }),
  rating: integer('rating').notNull(),
  comment: text('comment'),
  isApproved: boolean('is_approved').default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow()
}, (table) => ({
  customerIdx: index('order_reviews_customer_idx').on(table.customerId)
}));

export const statusChangeLogs = pgTable('status_change_logs', {
  id: uuid('id').defaultRandom().primaryKey(),
  orderId: uuid('order_id').notNull().references(() => orders.id, { onDelete: 'cascade' }),
  previousStatus: orderStatusEnum('previous_status').notNull(),
  newStatus: orderStatusEnum('new_status').notNull(),
  changedById: uuid('changed_by_id').notNull().references(() => users.id, { onDelete: 'restrict' }),
  note: text('note'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow()
});

export const orderItemStatusChangeLogs = pgTable('order_item_status_change_logs', {
  id: uuid('id').defaultRandom().primaryKey(),
  orderItemId: uuid('order_item_id').notNull().references(() => orderItems.id, { onDelete: 'cascade' }),
  previousStatus: orderItemStatusEnum('previous_status').notNull(),
  newStatus: orderItemStatusEnum('new_status').notNull(),
  changedById: uuid('changed_by_id').references(() => users.id, { onDelete: 'set null' }),
  note: text('note'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow()
});

export const branchOperatingHours = pgTable('branch_operating_hours', {
  id: uuid('id').defaultRandom().primaryKey(),
  branchId: uuid('branch_id').notNull().references(() => branches.id, { onDelete: 'cascade' }),
  dayOfWeek: integer('day_of_week').notNull(),
  openTime: varchar('open_time', { length: 10 }).notNull(),
  closeTime: varchar('close_time', { length: 10 }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow()
}, (table) => ({
  branchIdx: index('branch_operating_hours_branch_idx').on(table.branchId)
}));

export const branchHolidays = pgTable('branch_holidays', {
  id: uuid('id').defaultRandom().primaryKey(),
  branchId: uuid('branch_id').notNull().references(() => branches.id, { onDelete: 'cascade' }),
  date: date('date').notNull(),
  isClosed: boolean('is_closed').default(true),
  label: varchar('label', { length: 255 }),
  openTime: varchar('open_time', { length: 10 }),
  closeTime: varchar('close_time', { length: 10 }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow()
}, (table) => ({
  branchDateIdx: index('branch_holidays_branch_date_idx').on(table.branchId, table.date)
}));

export const passwordResetOtps = pgTable('password_reset_otps', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: varchar('email', { length: 255 }).unique().notNull(),
  otp: varchar('otp', { length: 20 }).notNull(),
  type: varchar('type', { length: 32 }).default('password_reset').notNull(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow()
});

export const tableAuthOtps = pgTable('table_auth_otps', {
  id: uuid('id').defaultRandom().primaryKey(),
  contact: varchar('contact', { length: 100 }).notNull(),
  tableId: uuid('table_id').notNull().references(() => tables.id, { onDelete: 'cascade' }),
  tableSessionId: uuid('table_session_id').references(() => tableSessions.id, { onDelete: 'set null' }),
  purpose: otpPurposeEnum('purpose').default('TABLE_AUTH'),
  otp: varchar('otp', { length: 20 }).notNull(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  verified: boolean('verified').default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow()
}, (table) => ({
  contactTableIdx: index('table_auth_otps_contact_table_idx').on(table.contact, table.tableId),
  sessionIdx: index('table_auth_otps_session_idx').on(table.tableSessionId)
}));
