// ============================================================================
// Drizzle Schema — Order Domain Tables
// ============================================================================
// Order status is stored as a plain text column — no DB-level enum.
// The application layer validates transitions via the domain state machine.
//
// WHY no pgEnum?
//   - Adding a new status doesn't require a migration
//   - Validation lives in the domain layer where it belongs
//   - More flexible for evolving business rules
// ============================================================================

import {
  pgTable,
  uuid,
  text,
  numeric,
  integer,
  boolean,
  timestamp,
  json,
  index,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { menuItems } from './menu.schema';

// ─── Orders ───────────────────────────────────────────────────────────

export const orders = pgTable(
  'orders',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    orderNumber: text('order_number').notNull(),
    branchId: uuid('branch_id').notNull(),
    tableId: uuid('table_id').notNull(),
    tableSessionId: uuid('table_session_id'),
    customerSessionId: uuid('customer_session_id'),
    status: text('status').default('DRAFT').notNull(), // validated at app layer
    subtotal: numeric('subtotal', { precision: 10, scale: 2 }).default('0').notNull(),
    serviceChargeRate: numeric('service_charge_rate', { precision: 4, scale: 2 })
      .default('0.05')
      .notNull(),
    serviceCharge: numeric('service_charge', { precision: 10, scale: 2 })
      .default('0')
      .notNull(),
    taxRate: numeric('tax_rate', { precision: 4, scale: 2 }).default('0.08').notNull(),
    tax: numeric('tax', { precision: 10, scale: 2 }).default('0').notNull(),
    total: numeric('total', { precision: 10, scale: 2 }).default('0').notNull(),
    estimatedPrepTime: integer('estimated_prep_time'), // minutes
    // ── Waiter tracking ──────────────────────────────────────────────
    // NULL = customer placed; set = waiter placed order on behalf of customer
    placedByWaiterId: uuid('placed_by_waiter_id'),
    // true = customer account was auto-created by waiter (no OTP gate required)
    customerAutoCreated: boolean('customer_auto_created').default(false).notNull(),
    // Waiter-supplied reason when rejecting an order
    rejectionReason: text('rejection_reason'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
    submittedAt: timestamp('submitted_at'),
    acceptedAt: timestamp('accepted_at'),
    readyAt: timestamp('ready_at'),
    servedAt: timestamp('served_at'),
  },
  (table) => ({
    orderNumberIdx: uniqueIndex('orders_order_number_idx').on(table.orderNumber),
    branchStatusIdx: index('orders_branch_status_idx').on(table.branchId, table.status),
    tableStatusIdx: index('orders_table_status_idx').on(table.tableId, table.status),
    tableSessionIdx: index('orders_table_session_idx').on(table.tableSessionId),
    waiterIdx: index('orders_placed_by_waiter_idx').on(table.placedByWaiterId),
  }),
);

export const ordersRelations = relations(orders, ({ many }) => ({
  items: many(orderItems),
}));

// ─── Order Items ──────────────────────────────────────────────────────

export const orderItems = pgTable(
  'order_items',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    orderId: uuid('order_id')
      .notNull()
      .references(() => orders.id, { onDelete: 'cascade' }),
    menuItemId: uuid('menu_item_id')
      .notNull()
      .references(() => menuItems.id),
    name: text('name').notNull(), // denormalized from menu item
    unitPrice: numeric('unit_price', { precision: 10, scale: 2 }).notNull(),
    quantity: integer('quantity').default(1).notNull(),
    specialInstructions: text('special_instructions'),
    addOns: json('add_ons').$type<Array<{ name: string; price: number }>>(),
    addOnsTotal: numeric('add_ons_total', { precision: 10, scale: 2 })
      .default('0')
      .notNull(),
    lineTotal: numeric('line_total', { precision: 10, scale: 2 }).notNull(),
  },
  (table) => ({
    orderIdx: index('order_items_order_idx').on(table.orderId),
  }),
);

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  menuItem: one(menuItems, {
    fields: [orderItems.menuItemId],
    references: [menuItems.id],
  }),
}));
