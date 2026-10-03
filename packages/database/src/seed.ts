import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(__dirname, '../../../.env') });
config();

import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

// Verified Argon2 hashes:
// Manager@1234 / Owner@1234 / Waiter@1234 / Cashier@1234 / Kitchen@1234:
const STAFF_HASH = '$argon2id$v=19$m=65536,p=4,t=3$u+HBHYvNpgAHgXmHMADOwA$q7hqJhlDM178SsTjV9AsFP468F2NH28J+FVB3HxOxh4';
// Customer@1234:
const CUSTOMER_HASH = '$argon2id$v=19$m=65536,p=4,t=3$YNeJBXQxILidQtN97JbwYw$5GB6vgM3e/gN7PRHAXovdPQfZsFA2zYtuGVPTFlvJwQ';

const runSeed = async () => {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not defined');
  }

  console.log('⏳ Connecting to database for seeding...');
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(pool, { schema });

  try {
    console.log('🌱 Seeding database with realistic roles & entities...');

    // Clean existing tables in reverse dependency order
    await db.delete(schema.orderReviews);
    await db.delete(schema.orderItems);
    await db.delete(schema.orders);
    await db.delete(schema.tableAuthOtps);
    await db.delete(schema.guestSessions);
    await db.delete(schema.tableSessions);
    await db.delete(schema.waiterTableAssignments);
    await db.delete(schema.staffAssignments);
    await db.delete(schema.staff);
    await db.delete(schema.customers);
    await db.delete(schema.owners);
    await db.delete(schema.admins);
    await db.delete(schema.tables);
    await db.delete(schema.menuItems);
    await db.delete(schema.menuCategories);
    await db.delete(schema.branchSettings);
    await db.delete(schema.branches);
    await db.delete(schema.restaurants);
    await db.delete(schema.organizations);
    await db.delete(schema.users);

    // 1. Platform Admin / Owner User
    const [ownerUser] = await db.insert(schema.users).values({
      email: 'owner@tavonza.ai',
      name: 'Platform Owner',
      password: STAFF_HASH,
      role: 'ADMIN',
      status: 'ACTIVE',
    }).returning();
    if (!ownerUser) throw new Error('Failed to create owner user');

    // 2. Organization
    const [org] = await db.insert(schema.organizations).values({
      name: 'Tavonza Global',
      ownerId: ownerUser.id,
      slug: 'tavonza-global',
    }).returning();
    if (!org) throw new Error('Failed to create org');

    // 3. Restaurant
    const [restaurant] = await db.insert(schema.restaurants).values({
      organizationId: org.id,
      name: 'Tavonza Fine Dining',
      slug: 'tavonza-fine-dining',
    }).returning();
    if (!restaurant) throw new Error('Failed to create restaurant');

    // 4. Branch
    const [branch] = await db.insert(schema.branches).values({
      restaurantId: restaurant.id,
      name: 'Downtown HQ',
      address: { line1: '742 Evergreen Terrace', city: 'Metropolis', country: 'US' },
      phone: '+1 (555) 234-5678',
    }).returning();
    if (!branch) throw new Error('Failed to create branch');

    // 5. Branch Settings
    await db.insert(schema.branchSettings).values({
      branchId: branch.id,
      orderAcceptanceMode: 'WAITER_APPROVAL',
      currency: 'USD',
      taxPercent: 8.0,
      serviceChargePct: 5.0,
      allowSplitBill: true,
      allowGuestCheckoutWithoutAccount: true,
    });

    // 6. Branch Manager User & Assignment
    const [managerUser] = await db.insert(schema.users).values({
      email: 'manager@tavonza.ai',
      name: 'Marcus Vance',
      password: STAFF_HASH,
      role: 'STAFF',
      status: 'ACTIVE',
      contactNo: '+1 (555) 111-2233',
    }).returning();
    if (!managerUser) throw new Error('Failed to create manager user');

    const [managerStaff] = await db.insert(schema.staff).values({
      userId: managerUser.id,
    }).returning();
    if (!managerStaff) throw new Error('Failed to create manager staff');

    await db.insert(schema.staffAssignments).values({
      staffId: managerStaff.id,
      branchId: branch.id,
      role: 'BRANCH_MANAGER',
      permissions: [
        'MANAGE_MENU',
        'MANAGE_TABLES',
        'MANAGE_STAFF',
        'VIEW_ORDERS',
        'UPDATE_ORDER_STATUS',
        'MANAGE_PAYMENTS',
        'MANAGE_BRANCH_SETTINGS',
        'VIEW_REPORTS',
      ],
      isActive: true,
    });

    // 7. Customer User
    const [customerUser] = await db.insert(schema.users).values({
      email: 'customer@tavonza.ai',
      name: 'Sarah Jenkins',
      password: CUSTOMER_HASH,
      role: 'CUSTOMER',
      status: 'ACTIVE',
      contactNo: '+1234567890',
    }).returning();
    if (!customerUser) throw new Error('Failed to create customer user');

    await db.insert(schema.customers).values({
      userId: customerUser.id,
      loyaltyPoints: 120,
    });

    // 8. Waiter User
    const [waiterUser] = await db.insert(schema.users).values({
      email: 'waiter@tavonza.ai',
      name: 'David Chen',
      password: STAFF_HASH,
      role: 'STAFF',
      status: 'ACTIVE',
    }).returning();
    if (!waiterUser) throw new Error('Failed to create waiter user');

    const [waiterStaff] = await db.insert(schema.staff).values({
      userId: waiterUser.id,
    }).returning();
    if (!waiterStaff) throw new Error('Failed to create waiter staff');

    await db.insert(schema.staffAssignments).values({
      staffId: waiterStaff.id,
      branchId: branch.id,
      role: 'WAITER',
      permissions: ['VIEW_ORDERS', 'UPDATE_ORDER_STATUS'],
      isActive: true,
    });

    // 9. Cashier User
    const [cashierUser] = await db.insert(schema.users).values({
      email: 'cashier@tavonza.ai',
      name: 'Emma Watson',
      password: STAFF_HASH,
      role: 'STAFF',
      status: 'ACTIVE',
    }).returning();
    if (!cashierUser) throw new Error('Failed to create cashier user');

    const [cashierStaff] = await db.insert(schema.staff).values({
      userId: cashierUser.id,
    }).returning();
    if (!cashierStaff) throw new Error('Failed to create cashier staff');

    await db.insert(schema.staffAssignments).values({
      staffId: cashierStaff.id,
      branchId: branch.id,
      role: 'CASHIER',
      permissions: ['MANAGE_PAYMENTS', 'VIEW_ORDERS'],
      isActive: true,
    });

    // 10. Kitchen Staff User
    const [kitchenUser] = await db.insert(schema.users).values({
      email: 'kitchen@tavonza.ai',
      name: 'Chef Gordon',
      password: STAFF_HASH,
      role: 'STAFF',
      status: 'ACTIVE',
    }).returning();
    if (!kitchenUser) throw new Error('Failed to create kitchen user');

    const [kitchenStaff] = await db.insert(schema.staff).values({
      userId: kitchenUser.id,
    }).returning();
    if (!kitchenStaff) throw new Error('Failed to create kitchen staff');

    await db.insert(schema.staffAssignments).values({
      staffId: kitchenStaff.id,
      branchId: branch.id,
      role: 'KITCHEN_STAFF',
      permissions: ['VIEW_ORDERS', 'UPDATE_ORDER_STATUS'],
      isActive: true,
    });

    // 11. Tables
    await db.insert(schema.tables).values([
      { branchId: branch.id, label: 'T-01', capacity: 4, shape: 'SQUARE', serviceStatus: 'AVAILABLE' },
      { branchId: branch.id, label: 'T-02', capacity: 2, shape: 'CIRCLE', serviceStatus: 'AVAILABLE' },
      { branchId: branch.id, label: 'T-03', capacity: 4, shape: 'RECTANGLE', serviceStatus: 'AVAILABLE' },
      { branchId: branch.id, label: 'T-04', capacity: 6, shape: 'RECTANGLE', serviceStatus: 'AVAILABLE' },
      { branchId: branch.id, label: 'T-05', capacity: 4, shape: 'CIRCLE', serviceStatus: 'AVAILABLE' },
    ]);

    // 12. Menu Categories & Items
    const [catBurgers] = await db.insert(schema.menuCategories).values({
      restaurantId: restaurant.id,
      name: 'Burgers & Mains',
    }).returning();
    if (!catBurgers) throw new Error('Failed to create burgers category');

    const [catDrinks] = await db.insert(schema.menuCategories).values({
      restaurantId: restaurant.id,
      name: 'Drinks & Beverages',
    }).returning();
    if (!catDrinks) throw new Error('Failed to create drinks category');

    await db.insert(schema.menuItems).values([
      {
        restaurantId: restaurant.id,
        categoryId: catBurgers.id,
        name: 'Potato Corn Burger',
        description: 'Crispy potato patty with sweet corn and signature sauce',
        basePrice: 26.0,
        isAvailable: true,
      },
      {
        restaurantId: restaurant.id,
        categoryId: catBurgers.id,
        name: 'Grilled Salmon',
        description: 'Wild Alaskan salmon served with asparagus and lemon risotto',
        basePrice: 24.99,
        isAvailable: true,
      },
      {
        restaurantId: restaurant.id,
        categoryId: catBurgers.id,
        name: 'Ribeye Steak (14oz)',
        description: 'Prime cut ribeye with truffle herb butter',
        basePrice: 34.0,
        isAvailable: true,
      },
      {
        restaurantId: restaurant.id,
        categoryId: catDrinks.id,
        name: 'Smoked Bourbon Old Fashioned',
        description: 'Aged bourbon, bitters, and smoked orange peel',
        basePrice: 14.0,
        isAvailable: true,
      },
      {
        restaurantId: restaurant.id,
        categoryId: catDrinks.id,
        name: 'San Pellegrino Sparkling',
        description: 'Crisp natural sparkling mineral water',
        basePrice: 6.0,
        isAvailable: true,
      },
    ]);

    console.log('✅ Database seeded successfully!');
    console.log('───────────────────────────────────────────────────────');
    console.log('📋 CREATED LOGIN CREDENTIALS:');
    console.log('  Manager:  email: manager@tavonza.ai  password: Manager@1234');
    console.log('  Customer: email: customer@tavonza.ai password: Customer@1234');
    console.log('  Waiter:   email: waiter@tavonza.ai   password: Waiter@1234');
    console.log('  Cashier:  email: cashier@tavonza.ai  password: Cashier@1234');
    console.log('  Kitchen:  email: kitchen@tavonza.ai  password: Kitchen@1234');
    console.log('  Owner:    email: owner@tavonza.ai    password: Owner@1234');
    console.log('───────────────────────────────────────────────────────');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
};

runSeed();
