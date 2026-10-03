// ============================================================================
// DrizzleService — NestJS-Compatible Database Client
// ============================================================================
// Wraps the Drizzle instance for NestJS dependency injection.
//
// Unlike Prisma (which requires a generated client), Drizzle works directly
// with your TypeScript schema definitions — no codegen step needed.
//
// USAGE in any repository:
//   constructor(@Inject(DRIZZLE) private readonly db: DrizzleDatabase) {}
//   await this.db.select().from(menuItems).where(...)
//   await this.db.query.menuItems.findMany({ with: { category: true } })
// ============================================================================

import { drizzle, NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

/**
 * NestJS injection token for the Drizzle database instance.
 * Used with: @Inject(DRIZZLE) in repositories.
 */
export const DRIZZLE = Symbol('DRIZZLE');

/**
 * The typed Drizzle database instance.
 * Includes full schema awareness for the relational query builder.
 */
export type DrizzleDatabase = NodePgDatabase<typeof schema>;

/**
 * Create a Drizzle database instance connected to PostgreSQL.
 * Called once during module initialization.
 */
export function createDrizzleDatabase(connectionString: string): DrizzleDatabase {
  let cleanUrl = connectionString;
  let useSsl = false;

  try {
    const parsed = new URL(connectionString);
    const isRds = parsed.hostname.includes('rds.amazonaws.com');
    const sslParam = parsed.searchParams.get('ssl');
    const sslMode = parsed.searchParams.get('sslmode');

    useSsl =
      process.env.DATABASE_SSL === 'true' ||
      sslParam === 'true' ||
      (sslMode !== null && sslMode !== 'disable') ||
      isRds;

    if (useSsl) {
      parsed.searchParams.delete('ssl');
      parsed.searchParams.delete('sslmode');
      cleanUrl = parsed.toString();
    }
  } catch {
    useSsl = connectionString.includes('rds.amazonaws.com');
  }

  const pool = new Pool({
    connectionString: cleanUrl,
    ssl: useSsl ? { rejectUnauthorized: false } : undefined,
  });
  return drizzle(pool, { schema });
}
