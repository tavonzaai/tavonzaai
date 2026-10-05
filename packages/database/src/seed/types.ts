import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../schema';

export type Db = NodePgDatabase<typeof schema>;
export type Tx = Parameters<Parameters<Db['transaction']>[0]>[0];
export { schema };

/** Asserts a `.returning()` row exists and narrows its type. */
export const one = <T>(rows: T[], label: string): T => {
  const row = rows[0];
  if (!row) throw new Error(`Seed insert returned no row: ${label}`);
  return row;
};
