// ============================================================================
// Full database wipe — truncates every table in the Drizzle schema.
// Prefer `pnpm db:seed` afterward (seed also purges, then loads test data).
// ============================================================================
import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(__dirname, '../../../.env') });
config();

import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { reset } from 'drizzle-seed';
import * as schema from './schema';

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not defined');
  }

  console.log('⏳ Connecting to wipe all schema tables...');
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(pool, { schema });

  try {
    await reset(db, schema);
    console.log('✅ All schema tables emptied. Run `pnpm db:seed` to reload test data.');
  } finally {
    await pool.end();
  }
}

main().catch((err) => {
  console.error('❌ Database reset failed:', err);
  process.exit(1);
});
