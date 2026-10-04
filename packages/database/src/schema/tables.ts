import {
  pgTable,
  uuid,
  varchar,
  text,
  boolean,
  timestamp,
  integer,
  index
} from 'drizzle-orm/pg-core';
import { tableServiceStatusEnum, tableOperationalFlagEnum, shapeEnum, reservationStatusEnum } from './enums';
import { branches } from './hierarchy';
import { customers, staff } from './users';
import { tableSessions } from './sessions';

export const tables = pgTable('tables', {
  id: uuid('id').defaultRandom().primaryKey(),
  branchId: uuid('branch_id').notNull().references(() => branches.id, { onDelete: 'cascade' }),
  label: varchar('label', { length: 50 }).notNull(),
  capacity: integer('capacity').notNull(),
  serviceStatus: tableServiceStatusEnum('service_status').default('AVAILABLE'),
  operationalFlag: tableOperationalFlagEnum('operational_flag').default('NORMAL'),
  qrCodeToken: varchar('qr_code_token', { length: 255 }).unique(),
  shape: shapeEnum('shape').default('SQUARE'),
  floor: integer('floor').default(1),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow()
}, (table) => ({
  branchIdx: index('tables_branch_idx').on(table.branchId),
  branchStatusIdx: index('tables_branch_status_idx').on(table.branchId, table.serviceStatus)
}));

export const reservations = pgTable('reservations', {
  id: uuid('id').defaultRandom().primaryKey(),
  branchId: uuid('branch_id').notNull().references(() => branches.id, { onDelete: 'cascade' }),
  tableId: uuid('table_id').references(() => tables.id, { onDelete: 'set null' }),
  customerId: uuid('customer_id').references(() => customers.id, { onDelete: 'set null' }),
  tableSessionId: uuid('table_session_id').unique().references(() => tableSessions.id, { onDelete: 'set null' }),
  guestName: varchar('guest_name', { length: 255 }).notNull(),
  guestPhone: varchar('guest_phone', { length: 50 }).notNull(),
  partySize: integer('party_size').notNull(),
  reservedFor: timestamp('reserved_for', { withTimezone: true }).notNull(),
  durationMins: integer('duration_mins').default(90),
  status: reservationStatusEnum('status').default('PENDING'),
  specialRequest: text('special_request'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow()
}, (table) => ({
  branchDateIdx: index('reservations_branch_date_idx').on(table.branchId, table.reservedFor),
  tableIdx: index('reservations_table_idx').on(table.tableId),
  statusIdx: index('reservations_status_idx').on(table.status)
}));

export const waiterTableAssignments = pgTable('waiter_table_assignments', {
  id: uuid('id').defaultRandom().primaryKey(),
  branchId: uuid('branch_id').notNull().references(() => branches.id, { onDelete: 'restrict' }),
  tableId: uuid('table_id').notNull().references(() => tables.id, { onDelete: 'restrict' }),
  waiterId: uuid('waiter_id').notNull().references(() => staff.id, { onDelete: 'restrict' }),
  assignedById: uuid('assigned_by_id').notNull().references(() => staff.id, { onDelete: 'restrict' }),
  sessionStart: timestamp('session_start', { withTimezone: true }).notNull(),
  sessionEnd: timestamp('session_end', { withTimezone: true }).notNull(),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow()
}, (table) => ({
  tableSessionIdx: index('waiter_table_assignments_table_session_idx').on(table.tableId, table.sessionStart, table.sessionEnd),
  waiterSessionIdx: index('waiter_table_assignments_waiter_session_idx').on(table.waiterId, table.sessionStart)
}));
