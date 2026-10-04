import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  doublePrecision,
  jsonb,
  index,
  integer
} from 'drizzle-orm/pg-core';
import {
  orderChannelEnum,
  orderStatusEnum,
  paymentStatusEnum,
  orderAcceptanceModeEnum,
  orderRejectionReasonEnum,
  orderItemStatusEnum,
  stationTypeEnum
} from './enums';
import { branches } from './hierarchy';
import { tables, waiterTableAssignments } from './tables';
import { customers, staff } from './users';
import { tableSessions, guestSessions } from './sessions';
import { discounts } from './billing';
import { menuItems } from './menu';

export const orders = pgTable('orders', {
  id: uuid('id').defaultRandom().primaryKey(),
  orderNumber: varchar('order_number', { length: 50 }).unique().notNull(),
  branchId: uuid('branch_id').notNull().references(() => branches.id, { onDelete: 'cascade' }),
  tableId: uuid('table_id').references(() => tables.id, { onDelete: 'set null' }),
  customerId: uuid('customer_id').references(() => customers.id, { onDelete: 'set null' }),
  tableSessionId: uuid('table_session_id').references(() => tableSessions.id, { onDelete: 'set null' }),
  guestSessionId: uuid('guest_session_id').references(() => guestSessions.id, { onDelete: 'set null' }),
  channel: orderChannelEnum('channel').default('DINE_IN'),
  status: orderStatusEnum('status').default('PENDING'),
  subtotal: doublePrecision('subtotal').notNull(),
  discountAmount: doublePrecision('discount_amount').default(0),
  taxAmount: doublePrecision('tax_amount').default(0),
  serviceCharge: doublePrecision('service_charge').default(0),
  tipAmount: doublePrecision('tip_amount').default(0),
  totalAmount: doublePrecision('total_amount').notNull(),
  paymentStatus: paymentStatusEnum('payment_status').default('UNPAID'),
  amountPaid: doublePrecision('amount_paid').default(0),
  discountId: uuid('discount_id').references(() => discounts.id, { onDelete: 'set null' }),
  discountCodeSnapshot: varchar('discount_code_snapshot', { length: 50 }),
  discountAppliedById: uuid('discount_applied_by_id').references(() => staff.id, { onDelete: 'set null' }),
  waiterAssignmentId: uuid('waiter_assignment_id').references(() => waiterTableAssignments.id, { onDelete: 'set null' }),
  acceptanceMode: orderAcceptanceModeEnum('acceptance_mode').default('WAITER_APPROVAL'),
  acceptedById: uuid('accepted_by_id').references(() => staff.id, { onDelete: 'set null' }),
  acceptedAt: timestamp('accepted_at', { withTimezone: true }),
  rejectedById: uuid('rejected_by_id').references(() => staff.id, { onDelete: 'set null' }),
  rejectedAt: timestamp('rejected_at', { withTimezone: true }),
  rejectionReasonCode: orderRejectionReasonEnum('rejection_reason_code'),
  rejectionReason: text('rejection_reason'),
  placedByStaffId: uuid('placed_by_staff_id').references(() => staff.id, { onDelete: 'set null' }),
  specialInstructions: text('special_instructions'),
  resubmittedFromId: uuid('resubmitted_from_id'),
  guestName: varchar('guest_name', { length: 255 }),
  guestPhone: varchar('guest_phone', { length: 50 }),
  deliveryAddress: jsonb('delivery_address'),
  pickupAt: timestamp('pickup_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow()
}, (table) => ({
  branchStatusIdx: index('orders_branch_status_idx').on(table.branchId, table.status),
  tableIdx: index('orders_table_idx').on(table.tableId),
  customerIdx: index('orders_customer_idx').on(table.customerId),
  tableSessionIdx: index('orders_table_session_idx').on(table.tableSessionId),
  guestSessionIdx: index('orders_guest_session_idx').on(table.guestSessionId),
  createdAtIdx: index('orders_created_at_idx').on(table.createdAt)
}));

export const orderItems = pgTable('order_items', {
  id: uuid('id').defaultRandom().primaryKey(),
  orderId: uuid('order_id').notNull().references(() => orders.id, { onDelete: 'cascade' }),
  productId: uuid('product_id').notNull().references(() => menuItems.id, { onDelete: 'restrict' }),
  productNameSnapshot: varchar('product_name_snapshot', { length: 255 }).notNull(),
  unitPrice: doublePrecision('unit_price').notNull(),
  quantity: integer('quantity').notNull(),
  subtotal: doublePrecision('subtotal').notNull(),
  stationType: stationTypeEnum('station_type').notNull(),
  status: orderItemStatusEnum('status').default('PENDING'),
  preparingAt: timestamp('preparing_at', { withTimezone: true }),
  readyAt: timestamp('ready_at', { withTimezone: true }),
  servedAt: timestamp('served_at', { withTimezone: true }),
  unavailableReason: text('unavailable_reason'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow()
}, (table) => ({
  orderStatusIdx: index('order_items_order_status_idx').on(table.orderId, table.status),
  orderStationStatusIdx: index('order_items_order_station_status_idx').on(table.orderId, table.stationType, table.status)
}));
