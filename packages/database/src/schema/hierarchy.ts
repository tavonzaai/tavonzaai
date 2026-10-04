import {
  pgTable,
  uuid,
  varchar,
  text,
  boolean,
  timestamp,
  jsonb,
  doublePrecision,
  integer,
  index
} from 'drizzle-orm/pg-core';
import { orderAcceptanceModeEnum } from './enums';
import { users } from './users';

export const organizations = pgTable('organizations', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  ownerId: uuid('owner_id').notNull().references(() => users.id),
  slug: varchar('slug', { length: 255 }).unique().notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow()
});

export const restaurants = pgTable('restaurants', {
  id: uuid('id').defaultRandom().primaryKey(),
  organizationId: uuid('organization_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).unique().notNull(),
  logoUrl: text('logo_url'),
  description: text('description'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow()
}, (table) => ({
  orgIdx: index('restaurants_org_idx').on(table.organizationId)
}));

export const branches = pgTable('branches', {
  id: uuid('id').defaultRandom().primaryKey(),
  restaurantId: uuid('restaurant_id').notNull().references(() => restaurants.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 255 }).notNull(),
  address: jsonb('address').notNull(),
  phone: varchar('phone', { length: 50 }),
  timezone: varchar('timezone', { length: 50 }).default('UTC'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow()
}, (table) => ({
  restaurantIdx: index('branches_restaurant_idx').on(table.restaurantId)
}));

export const branchSettings = pgTable('branch_settings', {
  id: uuid('id').defaultRandom().primaryKey(),
  branchId: uuid('branch_id').unique().notNull().references(() => branches.id, { onDelete: 'cascade' }),
  orderAcceptanceMode: orderAcceptanceModeEnum('order_acceptance_mode').default('WAITER_APPROVAL'),
  backupAccepterRoles: text('backup_accepter_roles').array(),
  hideUnavailableItems: boolean('hide_unavailable_items').default(false),
  allowMultipleGuestSessions: boolean('allow_multiple_guest_sessions').default(true),
  requireOtpPerGuest: boolean('require_otp_per_guest').default(true),
  allowSplitBill: boolean('allow_split_bill').default(true),
  allowGuestCheckoutWithoutAccount: boolean('allow_guest_checkout_without_account').default(true),
  autoCloseIdleSessionMins: integer('auto_close_idle_session_mins'),
  currency: varchar('currency', { length: 10 }).default('USD'),
  taxPercent: doublePrecision('tax_percent').default(0),
  serviceChargePct: doublePrecision('service_charge_pct').default(0),
  tipEnabled: boolean('tip_enabled').default(true),
  reservationsEnabled: boolean('reservations_enabled').default(true),
  waitlistEnabled: boolean('waitlist_enabled').default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow()
});
