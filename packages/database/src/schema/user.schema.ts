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
  pgEnum,
} from 'drizzle-orm/pg-core';

// ─── Enums ────────────────────────────────────────────────────────────

export const userRoleEnum = pgEnum('user_role', [
  'super_admin',
  'owner',
  'manager',
  'staff',
  'kitchen',
]);

// ─── Users ────────────────────────────────────────────────────────────

export const users = pgTable(
  'users',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    email: text('email').notNull().unique(),
    passwordHash: text('password_hash').notNull(),
    firstName: text('first_name').notNull(),
    lastName: text('last_name').notNull(),
    phone: text('phone'),
    role: userRoleEnum('role').default('staff').notNull(),
    organizationId: uuid('organization_id'),
    isActive: boolean('is_active').default(true).notNull(),
    isEmailVerified: boolean('is_email_verified').default(false).notNull(),
    refreshToken: text('refresh_token'), // hashed
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    emailIdx: index('users_email_idx').on(table.email),
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
