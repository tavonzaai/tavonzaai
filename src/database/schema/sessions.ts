import {
  pgTable,
  uuid,
  varchar,
  boolean,
  timestamp,
  integer,
  index
} from 'drizzle-orm/pg-core';
import { tableSessionStatusEnum, guestSessionStatusEnum } from './enums';
import { tables } from './tables';
import { branches } from './hierarchy';
import { staff, customers } from './users';

export const tableSessions = pgTable('table_sessions', {
  id: uuid('id').defaultRandom().primaryKey(),
  tableId: uuid('table_id').notNull().references(() => tables.id, { onDelete: 'cascade' }),
  branchId: uuid('branch_id').notNull().references(() => branches.id, { onDelete: 'cascade' }),
  joinCode: varchar('join_code', { length: 20 }),
  partySize: integer('party_size'),
  startedAt: timestamp('started_at', { withTimezone: true }).defaultNow(),
  endedAt: timestamp('ended_at', { withTimezone: true }),
  status: tableSessionStatusEnum('status').default('ACTIVE'),
  openedByStaffId: uuid('opened_by_staff_id').references(() => staff.id, { onDelete: 'set null' }),
  closedByStaffId: uuid('closed_by_staff_id').references(() => staff.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow()
}, (table) => ({
  tableStatusIdx: index('table_sessions_table_status_idx').on(table.tableId, table.status),
  branchStatusIdx: index('table_sessions_branch_status_idx').on(table.branchId, table.status)
}));

export const guestSessions = pgTable('guest_sessions', {
  id: uuid('id').defaultRandom().primaryKey(),
  tableSessionId: uuid('table_session_id').notNull().references(() => tableSessions.id, { onDelete: 'cascade' }),
  customerId: uuid('customer_id').references(() => customers.id, { onDelete: 'set null' }),
  displayName: varchar('display_name', { length: 100 }),
  contact: varchar('contact', { length: 100 }),
  seatLabel: varchar('seat_label', { length: 50 }),
  otpVerifiedAt: timestamp('otp_verified_at', { withTimezone: true }),
  isHostGuest: boolean('is_host_guest').default(false),
  joinedAt: timestamp('joined_at', { withTimezone: true }).defaultNow(),
  leftAt: timestamp('left_at', { withTimezone: true }),
  status: guestSessionStatusEnum('status').default('ACTIVE'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow()
}, (table) => ({
  tableSessionStatusIdx: index('guest_sessions_table_session_status_idx').on(table.tableSessionId, table.status),
  customerIdx: index('guest_sessions_customer_idx').on(table.customerId)
}));
