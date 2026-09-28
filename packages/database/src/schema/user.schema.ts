// ============================================================================
// Drizzle Schema — Identity / Users Domain Tables
// ============================================================================

import {
  pgTable,
  uuid,
  text,
  boolean,
  timestamp,
  index,
  jsonb,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import type { Scope } from '@tavonza/authorization';

// ─── Users ────────────────────────────────────────────────────────────
// In our platform:
// 1. Public registration is exclusively for customers (role = 'customer').
// 2. Roles are just labels / convenience bundles.
// 3. True authorization evaluates capabilities (permissions) and explicit scopes.

export const users = pgTable(
  'users',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    email: text('email').notNull().unique(),
    passwordHash: text('password_hash').notNull(),
    firstName: text('first_name').notNull(),
    lastName: text('last_name').notNull(),
    phone: text('phone'),
    role: text('role').default('customer').notNull(),
    permissions: text('permissions').array().default(sql`'{}'`).notNull(),
    scopes: jsonb('scopes').$type<Scope[]>().default(sql`'[]'::jsonb`).notNull(),
    organizationId: uuid('organization_id'),
    isActive: boolean('is_active').default(true).notNull(),
    isEmailVerified: boolean('is_email_verified').default(false).notNull(),
    isPhoneVerified: boolean('is_phone_verified').default(false).notNull(),
    refreshToken: text('refresh_token'), // hashed
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    emailIdx: index('users_email_idx').on(table.email),
    phoneIdx: index('users_phone_idx').on(table.phone),
    orgIdx: index('users_org_idx').on(table.organizationId),
  }),
);

// ─── OTP Codes (Email Verification & Password Reset) ─────────────────

export const otpCodes = pgTable(
  'otp_codes',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    code: text('code').notNull(), // 5-digit code (hashed)
    type: text('type').notNull(), // 'email_verification' | 'password_reset'
    expiresAt: timestamp('expires_at').notNull(),
    usedAt: timestamp('used_at'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    userTypeIdx: index('otp_codes_user_type_idx').on(table.userId, table.type),
  }),
);
