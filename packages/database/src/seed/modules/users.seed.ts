// ============================================================================
// Users Seeder Module (Aligned with frontend apps: 1-2 users per role)
// ============================================================================
import { DrizzleDatabase } from '../../client';
import * as schema from '../../schema';
import {
  SUPERADMIN_HASH,
  OWNER_HASH,
  MANAGER_HASH,
  WAITER_HASH,
  KITCHEN_HASH,
  BARTENDER_HASH,
  CASHIER_HASH,
  HOST_HASH,
  CUSTOMER_HASH,
} from '../constants';

export async function seedUsers(db: DrizzleDatabase) {
  console.log('👤 Provisioning frontend-aligned user personas (1-2 users per role)...');

  // 1A. Platform Super Administrator (Root Security Authority, Wildcard *)
  const [superAdmin] = await db.insert(schema.users).values({
    email: 'superadmin@tavonza.ai',
    name: 'Alexander Cross',
    password: SUPERADMIN_HASH,
    role: 'SUPER_ADMIN',
    status: 'ACTIVE',
    isEmailVerified: true,
    contactNo: '+1 (555) 000-0001',
  }).returning();
  if (!superAdmin) throw new Error('Failed to create superAdmin');

  await db.insert(schema.admins).values({
    userId: superAdmin.id,
    intro: 'Tavonza SaaS Global Super Administrator (* Wildcard Authority)',
  });

  // 1B. Organization Admins / Owners (frontend/admin - 2 users)
  const [owner1] = await db.insert(schema.users).values({
    email: 'owner@tavonza.ai',
    name: 'Victoria Vance',
    password: OWNER_HASH,
    role: 'ADMIN',
    status: 'ACTIVE',
    isEmailVerified: true,
    contactNo: '+1 (555) 000-0002',
  }).returning();
  if (!owner1) throw new Error('Failed to create owner1');
  await db.insert(schema.owners).values({ userId: owner1.id });

  const [owner2] = await db.insert(schema.users).values({
    email: 'admin2@tavonza.ai',
    name: 'David Sterling',
    password: OWNER_HASH,
    role: 'ADMIN',
    status: 'ACTIVE',
    isEmailVerified: true,
    contactNo: '+1 (555) 000-0003',
  }).returning();
  if (!owner2) throw new Error('Failed to create owner2');
  await db.insert(schema.owners).values({ userId: owner2.id });

  // 1C. Branch Managers (frontend/manager - 2 users)
  const [manager1] = await db.insert(schema.users).values({
    email: 'manager@tavonza.ai',
    name: 'Marcus Vance',
    password: MANAGER_HASH,
    role: 'STAFF',
    status: 'ACTIVE',
    isEmailVerified: true,
    contactNo: '+1 (555) 111-2233',
  }).returning();
  if (!manager1) throw new Error('Failed to create manager1');
  const [managerStaff1] = await db.insert(schema.staff).values({ userId: manager1.id }).returning();

  const [manager2] = await db.insert(schema.users).values({
    email: 'manager2@tavonza.ai',
    name: 'Sarah Connor',
    password: MANAGER_HASH,
    role: 'STAFF',
    status: 'ACTIVE',
    isEmailVerified: true,
    contactNo: '+1 (555) 111-2234',
  }).returning();
  if (!manager2) throw new Error('Failed to create manager2');
  const [managerStaff2] = await db.insert(schema.staff).values({ userId: manager2.id }).returning();

  // 1D. Waiters (frontend/waiter - 2 users)
  const [waiter1] = await db.insert(schema.users).values({
    email: 'waiter@tavonza.ai',
    name: 'David Chen',
    password: WAITER_HASH,
    role: 'STAFF',
    status: 'ACTIVE',
    isEmailVerified: true,
    contactNo: '+1 (555) 222-3344',
  }).returning();
  if (!waiter1) throw new Error('Failed to create waiter1');
  const [waiterStaff1] = await db.insert(schema.staff).values({ userId: waiter1.id }).returning();

  const [waiter2] = await db.insert(schema.users).values({
    email: 'waiter2@tavonza.ai',
    name: 'Emily Blunt',
    password: WAITER_HASH,
    role: 'STAFF',
    status: 'ACTIVE',
    isEmailVerified: true,
    contactNo: '+1 (555) 222-3345',
  }).returning();
  if (!waiter2) throw new Error('Failed to create waiter2');
  const [waiterStaff2] = await db.insert(schema.staff).values({ userId: waiter2.id }).returning();

  // 1E. Kitchen Staff & Chefs (frontend/kitchen - 2 users)
  const [kitchen1] = await db.insert(schema.users).values({
    email: 'kitchen@tavonza.ai',
    name: 'Chef Gordon Ramsay',
    password: KITCHEN_HASH,
    role: 'STAFF',
    status: 'ACTIVE',
    isEmailVerified: true,
    contactNo: '+1 (555) 333-4455',
  }).returning();
  if (!kitchen1) throw new Error('Failed to create kitchen1');
  const [kitchenStaff1] = await db.insert(schema.staff).values({ userId: kitchen1.id }).returning();

  const [kitchen2] = await db.insert(schema.users).values({
    email: 'kitchen2@tavonza.ai',
    name: 'Chef Marco Pierre White',
    password: KITCHEN_HASH,
    role: 'STAFF',
    status: 'ACTIVE',
    isEmailVerified: true,
    contactNo: '+1 (555) 333-4456',
  }).returning();
  if (!kitchen2) throw new Error('Failed to create kitchen2');
  const [kitchenStaff2] = await db.insert(schema.staff).values({ userId: kitchen2.id }).returning();

  // 1F. Bartender (frontend/kitchen Bar Station - 1 user)
  const [bartender1] = await db.insert(schema.users).values({
    email: 'bartender@tavonza.ai',
    name: 'Alex Rivera',
    password: BARTENDER_HASH,
    role: 'STAFF',
    status: 'ACTIVE',
    isEmailVerified: true,
    contactNo: '+1 (555) 444-5566',
  }).returning();
  if (!bartender1) throw new Error('Failed to create bartender1');
  const [bartenderStaff1] = await db.insert(schema.staff).values({ userId: bartender1.id }).returning();

  // 1G. Cashiers (frontend/cashier - 2 users)
  const [cashier1] = await db.insert(schema.users).values({
    email: 'cashier@tavonza.ai',
    name: 'Emma Watson',
    password: CASHIER_HASH,
    role: 'STAFF',
    status: 'ACTIVE',
    isEmailVerified: true,
    contactNo: '+1 (555) 555-6677',
  }).returning();
  if (!cashier1) throw new Error('Failed to create cashier1');
  const [cashierStaff1] = await db.insert(schema.staff).values({ userId: cashier1.id }).returning();

  const [cashier2] = await db.insert(schema.users).values({
    email: 'cashier2@tavonza.ai',
    name: 'Liam Neeson',
    password: CASHIER_HASH,
    role: 'STAFF',
    status: 'ACTIVE',
    isEmailVerified: true,
    contactNo: '+1 (555) 555-6678',
  }).returning();
  if (!cashier2) throw new Error('Failed to create cashier2');
  const [cashierStaff2] = await db.insert(schema.staff).values({ userId: cashier2.id }).returning();

  // 1H. Front of House / Host (1 user)
  const [host1] = await db.insert(schema.users).values({
    email: 'host@tavonza.ai',
    name: 'Sophia Loren',
    password: HOST_HASH,
    role: 'STAFF',
    status: 'ACTIVE',
    isEmailVerified: true,
    contactNo: '+1 (555) 666-7788',
  }).returning();
  if (!host1) throw new Error('Failed to create host1');
  const [hostStaff1] = await db.insert(schema.staff).values({ userId: host1.id }).returning();

  // 1I. Customers (frontend/customer - 2 users)
  const [customer1] = await db.insert(schema.users).values({
    email: 'customer@tavonza.ai',
    name: 'Sarah Jenkins',
    password: CUSTOMER_HASH,
    role: 'CUSTOMER',
    status: 'ACTIVE',
    isEmailVerified: true,
    contactNo: '+1 (555) 777-8899',
  }).returning();
  if (!customer1) throw new Error('Failed to create customer1');
  const [customerEntity1] = await db.insert(schema.customers).values({
    userId: customer1.id,
    loyaltyPoints: 150,
    defaultAddress: { line1: '123 Park Avenue', city: 'Metropolis', country: 'US' },
  }).returning();

  const [customer2] = await db.insert(schema.users).values({
    email: 'customer2@tavonza.ai',
    name: 'John Doe',
    password: CUSTOMER_HASH,
    role: 'CUSTOMER',
    status: 'ACTIVE',
    isEmailVerified: true,
    contactNo: '+1 (555) 888-9900',
  }).returning();
  if (!customer2) throw new Error('Failed to create customer2');
  const [customerEntity2] = await db.insert(schema.customers).values({
    userId: customer2.id,
    loyaltyPoints: 40,
    defaultAddress: { line1: '456 Broadway Blvd', city: 'Metropolis', country: 'US' },
  }).returning();

  if (!managerStaff1 || !managerStaff2 || !waiterStaff1 || !waiterStaff2 ||
      !kitchenStaff1 || !kitchenStaff2 || !bartenderStaff1 ||
      !cashierStaff1 || !cashierStaff2 || !hostStaff1 ||
      !customerEntity1 || !customerEntity2) {
    throw new Error('Failed to initialize staff/customer persona entities');
  }

  return {
    users: {
      superAdmin,
      owner1,
      owner2,
      manager1,
      manager2,
      waiter1,
      waiter2,
      kitchen1,
      kitchen2,
      bartender1,
      cashier1,
      cashier2,
      host1,
      customer1,
      customer2,
    },
    staff: {
      manager1: managerStaff1,
      manager2: managerStaff2,
      waiter1: waiterStaff1,
      waiter2: waiterStaff2,
      kitchen1: kitchenStaff1,
      kitchen2: kitchenStaff2,
      bartender1: bartenderStaff1,
      cashier1: cashierStaff1,
      cashier2: cashierStaff2,
      host1: hostStaff1,
    },
    customers: {
      customer1: customerEntity1,
      customer2: customerEntity2,
    },
  };
}
