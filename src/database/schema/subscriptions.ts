import {
  pgTable,
  uuid,
  varchar,
  text,
  boolean,
  timestamp,
  jsonb,
  doublePrecision,
  index,
} from 'drizzle-orm/pg-core';
import { organizations } from './hierarchy';

export const platformPlans = pgTable('platform_plans', {
  id: uuid('id').defaultRandom().primaryKey(),
  code: varchar('code', { length: 50 }).unique().notNull(),
  name: varchar('name', { length: 100 }).notNull(),
  description: text('description'),
  interval: varchar('interval', { length: 20 }).default('month').notNull(),
  amount: doublePrecision('amount').notNull(),
  currency: varchar('currency', { length: 10 }).default('USD').notNull(),
  features: jsonb('features').$type<string[]>().default([]),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

export const organizationSubscriptions = pgTable('organization_subscriptions', {
  id: uuid('id').defaultRandom().primaryKey(),
  organizationId: uuid('organization_id')
    .unique()
    .notNull()
    .references(() => organizations.id, { onDelete: 'cascade' }),
  planId: uuid('plan_id')
    .notNull()
    .references(() => platformPlans.id),
  status: varchar('status', { length: 20 }).default('ACTIVE').notNull(),
  currentPeriodStart: timestamp('current_period_start', { withTimezone: true }),
  currentPeriodEnd: timestamp('current_period_end', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

export const subscriptionInvoices = pgTable('subscription_invoices', {
  id: uuid('id').defaultRandom().primaryKey(),
  organizationId: uuid('organization_id')
    .notNull()
    .references(() => organizations.id, { onDelete: 'cascade' }),
  subscriptionId: uuid('subscription_id').references(() => organizationSubscriptions.id, {
    onDelete: 'set null',
  }),
  number: varchar('number', { length: 50 }).notNull(),
  amount: doublePrecision('amount').notNull(),
  currency: varchar('currency', { length: 10 }).default('USD').notNull(),
  status: varchar('status', { length: 20 }).default('PAID').notNull(),
  periodStart: timestamp('period_start', { withTimezone: true }),
  periodEnd: timestamp('period_end', { withTimezone: true }),
  issuedAt: timestamp('issued_at', { withTimezone: true }).defaultNow(),
  paidAt: timestamp('paid_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
}, (table) => ({
  orgIdx: index('subscription_invoices_org_idx').on(table.organizationId),
}));
