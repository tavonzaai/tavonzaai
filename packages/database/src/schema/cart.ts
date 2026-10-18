import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  integer,
  index,
  unique,
  check
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { branches } from './hierarchy';
import { customers } from './users';
import { guestSessions } from './sessions';
import { menuItems } from './menu';

/**
 * Pre-order basket. Owned by exactly one registered customer, or by a guest
 * session for diners who verified a table OTP without an account.
 * `branchId` is set by the first item and cleared when the cart empties.
 */
export const carts = pgTable('carts', {
  id: uuid('id').defaultRandom().primaryKey(),
  customerId: uuid('customer_id').unique().references(() => customers.id, { onDelete: 'cascade' }),
  guestSessionId: uuid('guest_session_id').unique().references(() => guestSessions.id, { onDelete: 'cascade' }),
  branchId: uuid('branch_id').references(() => branches.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow()
}, (table) => ({
  singleOwner: check(
    'carts_single_owner',
    sql`(${table.customerId} IS NOT NULL) <> (${table.guestSessionId} IS NOT NULL)`
  )
}));

export const cartItems = pgTable('cart_items', {
  id: uuid('id').defaultRandom().primaryKey(),
  cartId: uuid('cart_id').notNull().references(() => carts.id, { onDelete: 'cascade' }),
  menuItemId: uuid('menu_item_id').notNull().references(() => menuItems.id, { onDelete: 'cascade' }),
  /** Deterministic key of menu item + sorted modifiers + instructions; merges identical lines. */
  lineKey: varchar('line_key', { length: 64 }).notNull(),
  quantity: integer('quantity').notNull(),
  modifierIds: uuid('modifier_ids').array().default(sql`'{}'`).notNull(),
  specialInstructions: text('special_instructions'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow()
}, (table) => ({
  cartLineUnique: unique('cart_items_cart_line_unique').on(table.cartId, table.lineKey),
  cartIdx: index('cart_items_cart_idx').on(table.cartId),
  quantityPositive: check('cart_items_quantity_positive', sql`${table.quantity} > 0`)
}));
