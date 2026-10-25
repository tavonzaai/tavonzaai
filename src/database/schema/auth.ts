import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  index
} from 'drizzle-orm/pg-core';
import { users } from './users';

/**
 * One row per signed-in device/app. Access tokens carry the session id (`sid`)
 * so revoking the session invalidates both its refresh and access tokens.
 */
export const authSessions = pgTable('auth_sessions', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  client: varchar('client', { length: 32 }).notNull(),
  userAgent: text('user_agent'),
  ipAddress: varchar('ip_address', { length: 64 }),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  lastRotatedAt: timestamp('last_rotated_at', { withTimezone: true }),
  revokedAt: timestamp('revoked_at', { withTimezone: true }),
  revokedReason: varchar('revoked_reason', { length: 32 }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
}, (table) => ({
  userIdx: index('auth_sessions_user_idx').on(table.userId),
}));

/**
 * Refresh tokens are single-use: each refresh rotates to a new row. Only a
 * SHA-256 hash of the token is stored.
 */
export const refreshTokens = pgTable('refresh_tokens', {
  id: uuid('id').primaryKey(),
  sessionId: uuid('session_id').notNull().references(() => authSessions.id, { onDelete: 'cascade' }),
  tokenHash: varchar('token_hash', { length: 64 }).notNull(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  rotatedAt: timestamp('rotated_at', { withTimezone: true }),
  replacedById: uuid('replaced_by_id'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
}, (table) => ({
  sessionIdx: index('refresh_tokens_session_idx').on(table.sessionId),
}));
