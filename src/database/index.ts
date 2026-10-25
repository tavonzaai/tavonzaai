/**
 * @tavonza/database
 * Database connection, schema definitions, and migration tooling (Drizzle ORM)
 */

// Client + injection token
export { DRIZZLE, createDrizzleDatabase } from './client';
export type { DrizzleDatabase } from './client';

// NestJS module
export { DatabaseModule } from './database.module';

// Schema (tables + relations) — so repositories can import table references
export * from './schema';
export * as schema from './schema';

export * from './tenant-repository';
export * from './outbox.service';
