// ============================================================================
// Drizzle Schema — Customer Alerts
// ============================================================================
//
// Customers can send alerts from their session UI:
//   - 'call_waiter'    → "Please come to my table"
//   - 'request_bill'   → "Bring me the bill"
//   - 'need_help'      → Generic help request
//   - 'custom'         → Free-text message
//
// Waiter receives real-time notification and can acknowledge/resolve.
// ============================================================================

import {
  pgTable,
  uuid,
  text,
  timestamp,
  index,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { tableSessions, customerSessions } from './session.schema';
import { users } from './user.schema';

export const customerAlerts = pgTable(
  'customer_alerts',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    branchId: uuid('branch_id').notNull(),
    tableId: uuid('table_id').notNull(),
    tableSessionId: uuid('table_session_id')
      .notNull()
      .references(() => tableSessions.id, { onDelete: 'cascade' }),
    customerSessionId: uuid('customer_session_id').references(
      () => customerSessions.id,
    ),
    // Alert type — validated at app layer
    type: text('type').notNull(),
    // 'call_waiter' | 'request_bill' | 'need_help' | 'custom'
    message: text('message'), // For type='custom' or extra context

    // Status lifecycle: pending → acknowledged → resolved
    status: text('status').notNull().default('pending'),
    // 'pending' | 'acknowledged' | 'resolved'

    acknowledgedById: uuid('acknowledged_by_id').references(() => users.id),
    acknowledgedAt: timestamp('acknowledged_at'),
    resolvedAt: timestamp('resolved_at'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    branchStatusIdx: index('customer_alerts_branch_status_idx').on(
      table.branchId,
      table.status,
    ),
    tableSessionStatusIdx: index('customer_alerts_table_session_status_idx').on(
      table.tableSessionId,
      table.status,
    ),
    createdAtIdx: index('customer_alerts_created_at_idx').on(table.createdAt),
  }),
);

export const customerAlertsRelations = relations(customerAlerts, ({ one }) => ({
  tableSession: one(tableSessions, {
    fields: [customerAlerts.tableSessionId],
    references: [tableSessions.id],
  }),
  customerSession: one(customerSessions, {
    fields: [customerAlerts.customerSessionId],
    references: [customerSessions.id],
  }),
  acknowledgedBy: one(users, {
    fields: [customerAlerts.acknowledgedById],
    references: [users.id],
  }),
}));
