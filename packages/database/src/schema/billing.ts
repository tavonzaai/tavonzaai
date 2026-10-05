import {
  pgTable,
  uuid,
  varchar,
  boolean,
  timestamp,
  doublePrecision,
  integer,
  index
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { paymentScopeEnum, paymentMethodEnum, paymentStatusEnum, discountTypeEnum } from './enums';
import { orders, orderItems } from './orders';
import { tableSessions, guestSessions } from './sessions';
import { staff } from './users';

export const payments = pgTable('payments', {
  id: uuid('id').defaultRandom().primaryKey(),
  orderId: uuid('order_id').references(() => orders.id, { onDelete: 'set null' }),
  tableSessionId: uuid('table_session_id').references(() => tableSessions.id, { onDelete: 'set null' }),
  payerGuestSessionId: uuid('payer_guest_session_id').references(() => guestSessions.id, { onDelete: 'set null' }),
  paidForGuestIds: uuid('paid_for_guest_ids').array().default(sql`'{}'`),
  scope: paymentScopeEnum('scope').default('ORDER'),
  amount: doublePrecision('amount').notNull(),
  tipAmount: doublePrecision('tip_amount').default(0),
  method: paymentMethodEnum('method').notNull(),
  status: paymentStatusEnum('status').default('UNPAID'),
  transactionRef: varchar('transaction_ref', { length: 255 }),
  paidAt: timestamp('paid_at', { withTimezone: true }),
  settledById: uuid('settled_by_id').references(() => staff.id, { onDelete: 'set null' }),
  collectedById: uuid('collected_by_id').references(() => staff.id, { onDelete: 'set null' }),
  refundedAt: timestamp('refunded_at', { withTimezone: true }),
  refundRef: varchar('refund_ref', { length: 255 }),
  refundAmount: doublePrecision('refund_amount'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow()
}, (table) => ({
  orderIdx: index('payments_order_idx').on(table.orderId),
  sessionIdx: index('payments_session_idx').on(table.tableSessionId),
  guestIdx: index('payments_guest_idx').on(table.payerGuestSessionId),
  statusIdx: index('payments_status_idx').on(table.status)
}));

export const paymentAllocations = pgTable('payment_allocations', {
  id: uuid('id').defaultRandom().primaryKey(),
  paymentId: uuid('payment_id').notNull().references(() => payments.id, { onDelete: 'cascade' }),
  orderId: uuid('order_id').references(() => orders.id, { onDelete: 'set null' }),
  orderItemId: uuid('order_item_id').references(() => orderItems.id, { onDelete: 'set null' }),
  amount: doublePrecision('amount').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow()
}, (table) => ({
  paymentIdx: index('payment_allocations_payment_idx').on(table.paymentId),
  orderIdx: index('payment_allocations_order_idx').on(table.orderId),
  orderItemIdx: index('payment_allocations_order_item_idx').on(table.orderItemId)
}));

export const discounts = pgTable('discounts', {
  id: uuid('id').defaultRandom().primaryKey(),
  code: varchar('code', { length: 50 }).unique().notNull(),
  type: discountTypeEnum('type').notNull(),
  value: doublePrecision('value').notNull(),
  isActive: boolean('is_active').default(true),
  validFrom: timestamp('valid_from', { withTimezone: true }),
  validUntil: timestamp('valid_until', { withTimezone: true }),
  usageLimit: integer('usage_limit'),
  timesUsed: integer('times_used').default(0)
});
