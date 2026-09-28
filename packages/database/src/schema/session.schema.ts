// ============================================================================
// Drizzle Schema — Table Sessions, Customer Sessions, Payments, Feedback
// ============================================================================
//
// TABLE SESSION:
//   Created when a QR code is scanned. Represents a "dining session" at a table.
//   Multiple customers can join one table session (HostGuest feature).
//
// CUSTOMER SESSION:
//   One per customer per table session. Tracks who is at the table.
//   The first customer is the "host", others are "guests".
//
// PAYMENTS:
//   Figma: "Complete Payment" screen. Records payment for an order or session.
//
// FEEDBACK:
//   Figma: "Feedback / How Was Your Experience?" screen.
// ============================================================================

import {
  pgTable,
  uuid,
  text,
  numeric,
  timestamp,
  index,
  json,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { orders } from './order.schema';
import { users } from './user.schema';

// ─── Table Sessions ───────────────────────────────────────────────────
// Figma: QR Scan Screen → Splash Screen

export const tableSessions = pgTable(
  'table_sessions',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    branchId: uuid('branch_id').notNull(),
    tableId: uuid('table_id').notNull(),
    tableNumber: text('table_number').notNull(),
    status: text('status').default('active').notNull(), // 'active' | 'closed' | 'paying'
    shareCode: text('share_code').unique(), // 6-char code for HostGuest QR
    shareCodeExpiresAt: timestamp('share_code_expires_at'),
    openedAt: timestamp('opened_at').defaultNow().notNull(),
    closedAt: timestamp('closed_at'),
  },
  (table) => ({
    branchTableIdx: index('table_sessions_branch_table_idx').on(
      table.branchId,
      table.tableId,
      table.status,
    ),
    shareCodeIdx: index('table_sessions_share_code_idx').on(table.shareCode),
  }),
);

export const tableSessionsRelations = relations(tableSessions, ({ many }) => ({
  customerSessions: many(customerSessions),
}));

// ─── Customer Sessions ────────────────────────────────────────────────
// Figma: Guest menu screen → "You've joined the table as a Host Guest"

export const customerSessions = pgTable(
  'customer_sessions',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    tableSessionId: uuid('table_session_id')
      .notNull()
      .references(() => tableSessions.id, { onDelete: 'cascade' }),
    userId: uuid('user_id').references(() => users.id),
    displayName: text('display_name'), // for guests without account
    role: text('role').default('host').notNull(), // 'host' | 'guest'
    orderMode: text('order_mode').default('individual').notNull(), // 'individual' | 'together'
    joinedAt: timestamp('joined_at').defaultNow().notNull(),
    leftAt: timestamp('left_at'),
  },
  (table) => ({
    tableSessionIdx: index('customer_sessions_table_session_idx').on(
      table.tableSessionId,
    ),
    userIdx: index('customer_sessions_user_idx').on(table.userId),
  }),
);

export const customerSessionsRelations = relations(
  customerSessions,
  ({ one }) => ({
    tableSession: one(tableSessions, {
      fields: [customerSessions.tableSessionId],
      references: [tableSessions.id],
    }),
    user: one(users, {
      fields: [customerSessions.userId],
      references: [users.id],
    }),
  }),
);

// ─── Payments ─────────────────────────────────────────────────────────
// Figma: "Complete Payment" (card) → "Thank you!" receipt

export const payments = pgTable(
  'payments',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    orderId: uuid('order_id')
      .notNull()
      .references(() => orders.id),
    tableSessionId: uuid('table_session_id').references(() => tableSessions.id),
    customerSessionId: uuid('customer_session_id').references(
      () => customerSessions.id,
    ),
    method: text('method').notNull(), // 'card' | 'cash' | 'qr' | 'split'
    status: text('status').default('pending').notNull(), // 'pending' | 'completed' | 'failed' | 'refunded'
    amount: numeric('amount', { precision: 10, scale: 2 }).notNull(),
    currency: text('currency').default('USD').notNull(),
    // Card details (never store raw card — store token or last4 only)
    cardLast4: text('card_last4'),
    cardholderName: text('cardholder_name'),
    // Reference numbers
    transactionId: text('transaction_id').unique(), // Figma: #ID-22465476578390-3789
    receiptData: json('receipt_data').$type<{
      date: string;
      time: string;
      to: string;
      total: string;
    }>(),
    paidAt: timestamp('paid_at'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    orderIdx: index('payments_order_idx').on(table.orderId),
    tableSessionIdx: index('payments_table_session_idx').on(table.tableSessionId),
    transactionIdx: index('payments_transaction_idx').on(table.transactionId),
  }),
);

export const paymentsRelations = relations(payments, ({ one }) => ({
  order: one(orders, {
    fields: [payments.orderId],
    references: [orders.id],
  }),
  tableSession: one(tableSessions, {
    fields: [payments.tableSessionId],
    references: [tableSessions.id],
  }),
}));

// ─── Feedback ─────────────────────────────────────────────────────────
// Figma: "How Was Your Experience?" + star rating

export const feedback = pgTable(
  'feedback',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    orderId: uuid('order_id')
      .notNull()
      .references(() => orders.id),
    tableSessionId: uuid('table_session_id').references(() => tableSessions.id),
    customerSessionId: uuid('customer_session_id').references(
      () => customerSessions.id,
    ),
    userId: uuid('user_id').references(() => users.id),
    rating: text('rating').notNull(), // '1' - '5'
    comment: text('comment'), // "Share your experience.........."
    submittedAt: timestamp('submitted_at').defaultNow().notNull(),
  },
  (table) => ({
    orderIdx: index('feedback_order_idx').on(table.orderId),
  }),
);

export const feedbackRelations = relations(feedback, ({ one }) => ({
  order: one(orders, {
    fields: [feedback.orderId],
    references: [orders.id],
  }),
}));
