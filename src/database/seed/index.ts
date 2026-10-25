// ============================================================================
// Modular Database Seeder Orchestrator
// ============================================================================
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from '../schema';
import { purgeDatabase } from './cleaner';
import { seedUsers } from './modules/users.seed';
import { seedRbac } from './modules/rbac.seed';
import { seedHierarchy } from './modules/hierarchy.seed';
import { seedTables } from './modules/tables.seed';
import { seedMenu } from './modules/menu.seed';
import { seedOrders } from './modules/orders.seed';
import { seedBilling } from './modules/billing.seed';
import { seedOperations } from './modules/operations.seed';
import { seedNotifications } from './modules/notifications.seed';
import { seedAudit } from './modules/audit.seed';

export async function runModularSeed(): Promise<void> {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not defined in environment');
  }

  console.log('⏳ Connecting to database for modular seeding...');
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(pool, { schema });

  try {
    console.log('🌱 Starting clean, modular Tavonza AI multi-tenant database seed...');
    const now = new Date();

    // Step 0: Purge existing data
    await purgeDatabase(db);

    // Step 1: Users (1-2 per role)
    const { users, staff, customers } = await seedUsers(db);

    // Step 2: Dynamic RBAC & Single-Role Assignments (Assigned by Super Admin)
    await seedRbac(db, users);

    // Step 3: Multi-Tenant Hierarchy (2 Orgs, 2 Restaurants, 3 Branches, Settings & Assignments)
    const hierarchy = await seedHierarchy(db, users, staff);

    // Step 4: Tables, Floor Layout, Waiter Assignments & Dining Sessions
    const tables = await seedTables(
      db,
      {
        branch1: hierarchy.branch1,
        branch2: hierarchy.branch2,
        branch3: hierarchy.branch3,
      },
      staff,
      customers,
      now
    );

    // Step 5: Menu Catalog, Dishes, Modifiers & Station Types
    const menu = await seedMenu(db, {
      restaurant1: hierarchy.restaurant1,
      restaurant2: hierarchy.restaurant2,
    });

    // Step 6: Orders & Line Items across all lifecycle states
    const orders = await seedOrders(
      db,
      {
        branch1: hierarchy.branch1,
        branch2: hierarchy.branch2,
      },
      tables,
      menu,
      staff,
      customers,
      now
    );

    // Step 7: Billing, Payments & Split-Bill Allocations
    const billing = await seedBilling(
      db,
      orders,
      tables,
      staff,
      now
    );

    // Step 8: Operations (Reservations, Shifts, Suppliers, Inventory with low stock alert)
    await seedOperations(
      db,
      {
        branch1: hierarchy.branch1,
        branch2: hierarchy.branch2,
        branch3: hierarchy.branch3,
      },
      tables,
      hierarchy,
      staff,
      now
    );

    // Step 9: Role-Targeted & User-Targeted Persistent Notifications
    await seedNotifications(
      db,
      { branch1: hierarchy.branch1 },
      tables,
      orders,
      users,
      now
    );

    // Step 10: Audit Logs, Customer Reviews, OTPs & Outbox Events
    await seedAudit(
      db,
      { branch1: hierarchy.branch1 },
      tables,
      orders,
      users,
      customers,
      billing,
      now
    );

    console.log('\n=================================================================');
    console.log('✅ MODULAR DATABASE SEEDING FINISHED WITH 100% INTEGRITY!');
    console.log('=================================================================');
    console.log('🏢 ORGANIZATIONS & TEST BRANCHES:');
    console.log(`  1. Tavonza Downtown Flagship: ${hierarchy.branch1.name} (ID: ${hierarchy.branch1.id})`);
    console.log(`  2. Tavonza Uptown Lounge:     ${hierarchy.branch2.name} (ID: ${hierarchy.branch2.id})`);
    console.log(`  3. Apex Midtown Flagship:     ${hierarchy.branch3.name} (ID: ${hierarchy.branch3.id})`);
    console.log('-----------------------------------------------------------------');
    console.log('🔑 ALL USER PERSONAS & CREDENTIALS (1-2 PER ROLE):');
    console.log('  App surface        Email                     Password');
    console.log('  ----------------   -----------------------   ----------------');
    console.log('  Superadmin         superadmin@tavonza.ai     SuperAdmin@1234');
    console.log('  Admin (owner)      owner@tavonza.ai          Owner@1234');
    console.log('  Admin (owner 2)    admin2@tavonza.ai         Owner@1234');
    console.log('  Manager            manager@tavonza.ai        Manager@1234');
    console.log('  Manager 2          manager2@tavonza.ai       Manager@1234');
    console.log('  Waiter             waiter@tavonza.ai         Waiter@1234');
    console.log('  Waiter 2           waiter2@tavonza.ai        Waiter@1234');
    console.log('  Kitchen            kitchen@tavonza.ai        Kitchen@1234');
    console.log('  Kitchen 2          kitchen2@tavonza.ai       Kitchen@1234');
    console.log('  Bartender          bartender@tavonza.ai      Bartender@1234');
    console.log('  Cashier            cashier@tavonza.ai        Cashier@1234');
    console.log('  Cashier 2          cashier2@tavonza.ai       Cashier@1234');
    console.log('  Host               host@tavonza.ai           Host@1234');
    console.log('  Customer           customer@tavonza.ai       Customer@1234');
    console.log('  Customer 2         customer2@tavonza.ai      Customer@1234');
    console.log('-----------------------------------------------------------------');
    console.log(`📦 Default branch ID (NEXT_PUBLIC_DEFAULT_BRANCH_ID): ${hierarchy.branch1.id}`);
    console.log('🛒 Registered customers have empty server carts ready for checkout.');
    console.log('-----------------------------------------------------------------');
    console.log('📱 DIRECT CUSTOMER QR URLS (Port 3100):');
    console.log('  • Table T-01 (Ordering):    http://localhost:3100/?qr=qr_tok_dt_t01');
    console.log('  • Table T-02 (Available):   http://localhost:3100/?qr=qr_tok_dt_t02');
    console.log('  • Table T-03 (Preparing):   http://localhost:3100/?qr=qr_tok_dt_t03');
    console.log('  • Table T-04 (Bill Split):  http://localhost:3100/?qr=qr_tok_dt_t04');
    console.log('  • Table T-06 (Serving):     http://localhost:3100/?qr=qr_tok_dt_t06');
    console.log('  • Table P-01 (Patio):       http://localhost:3100/?qr=qr_tok_dt_p01');
    console.log('  • Table W-01 (Uptown):      http://localhost:3100/?qr=qr_tok_uw_w01');
    console.log('=================================================================\n');
  } catch (error) {
    console.error('❌ Error executing modular database seed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}
