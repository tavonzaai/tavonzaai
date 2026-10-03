import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(__dirname, '../../../.env') });
config();

import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

const runSeed = async () => {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not defined');
  }
  
  console.log('⏳ Connecting to database for seeding...');
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(pool, { schema });

  try {
    console.log('🌱 Seeding database...');

    // 1. Create a platform owner user
    const [ownerUser] = await db.insert(schema.users).values({
      email: 'owner@tavonza.ai',
      name: 'Platform Owner',
      password: 'hashed_password_here',
      role: 'ADMIN',
      status: 'ACTIVE'
    }).returning();

    if (!ownerUser) throw new Error('Failed to create owner user');

    // 2. Create organization
    const [org] = await db.insert(schema.organizations).values({
      name: 'Tavonza Global',
      ownerId: ownerUser.id,
      slug: 'tavonza-global'
    }).returning();

    if (!org) throw new Error('Failed to create org');

    // 3. Create restaurant
    const [restaurant] = await db.insert(schema.restaurants).values({
      organizationId: org.id,
      name: 'Tavonza Fine Dining',
      slug: 'tavonza-fine-dining'
    }).returning();

    if (!restaurant) throw new Error('Failed to create restaurant');

    // 4. Create branch
    const [branch] = await db.insert(schema.branches).values({
      restaurantId: restaurant.id,
      name: 'Downtown HQ',
      address: { line1: '123 Main St', city: 'Metropolis', country: 'US' },
      phone: '+1234567890'
    }).returning();

    if (!branch) throw new Error('Failed to create branch');

    // 5. Create branch settings
    await db.insert(schema.branchSettings).values({
      branchId: branch.id,
      currency: 'USD',
      taxPercent: 8.5
    });

    // 6. Create menu category and item
    const [category] = await db.insert(schema.menuCategories).values({
      restaurantId: restaurant.id,
      name: 'Main Course'
    }).returning();

    if (!category) throw new Error('Failed to create category');

    await db.insert(schema.menuItems).values({
      restaurantId: restaurant.id,
      categoryId: category.id,
      name: 'Grilled Salmon',
      basePrice: 24.99,
      isAvailable: true
    });

    // 7. Create tables
    await db.insert(schema.tables).values([
      { branchId: branch.id, label: 'T-01', capacity: 4 },
      { branchId: branch.id, label: 'T-02', capacity: 2 }
    ]);

    console.log('✅ Database seeded successfully!');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
};

runSeed();
