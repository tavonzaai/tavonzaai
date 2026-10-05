import { config } from 'dotenv';
import { resolve } from 'path';

// Load root .env then local .env if available
config({ path: resolve(__dirname, '../../../.env') });
config();

import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';
import { seedBilling } from './seed/billing';
import { seedFloor } from './seed/floor';
import { resolveSeedDatabaseUrl } from './seed/guard';
import { seedHierarchyAndIdentity } from './seed/identity';
import { seedMenu } from './seed/menu';
import { seedOperations } from './seed/operations';
import { seedOrders } from './seed/orders';
import { resetDatabase } from './seed/reset';
import { printSeedSummary } from './seed/summary';

export const runSeed = async () => {
  const dbUrl = resolveSeedDatabaseUrl();
  let cleanUrl = dbUrl;
  let useSsl = false;
  try {
    const parsed = new URL(dbUrl);
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
    useSsl = dbUrl.includes('rds.amazonaws.com');
  }

  const pool = new Pool({
    connectionString: cleanUrl,
    ssl: useSsl ? { rejectUnauthorized: false } : undefined,
  });
  const db = drizzle(pool, { schema });

  const now = new Date();

  try {
    console.log('🌱 Starting database seed transaction...');
    await db.transaction(async (tx) => {
      // 1. Reset
      await resetDatabase(tx);

      // 2. Identity & Hierarchy
      const idContext = await seedHierarchyAndIdentity(tx);

      // 3. Menu
      const menuContext = await seedMenu(tx, idContext.restaurantId);

      // 4. Floor & Tables
      const floorContext = await seedFloor(tx, idContext, now);

      // 5. Orders & Lifecycle
      const ordersContext = await seedOrders(tx, idContext, floorContext, menuContext, now);

      // 6. Billing, Payments & Reviews
      await seedBilling(tx, idContext, floorContext, ordersContext, now);

      // 7. Operations, Shifts, Reservations & Inventory
      await seedOperations(tx, idContext, floorContext, now);

      // 8. Print Summary
      printSeedSummary(idContext, floorContext, ordersContext);
    });

    console.log('✅ Seeding completed cleanly!');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
};

if (require.main === module) {
  runSeed();
}
