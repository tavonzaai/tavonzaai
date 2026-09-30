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
  const isRds = connectionString.includes('rds.amazonaws.com');
  const useSsl =
    process.env.DATABASE_SSL === 'true' ||
    connectionString.includes('sslmode=require') ||
    connectionString.includes('ssl=true') ||
    isRds;

  const pool = new Pool({
    connectionString,
    ssl: useSsl ? { rejectUnauthorized: false } : undefined,
  });
  return drizzle(pool, { schema });
}
