// ============================================================================
// Multi-Tenant Hierarchy Seeder (Organizations, Restaurants, Branches, Settings)
// ============================================================================
import { DrizzleDatabase } from '../../client';
import * as schema from '../../schema';
import { DEFAULT_BRANCH_ID } from '../constants';

export async function seedHierarchy(
  db: DrizzleDatabase,
  users: {
    owner1: typeof schema.users.$inferSelect;
    owner2: typeof schema.users.$inferSelect;
  },
  staff: {
    manager1: typeof schema.staff.$inferSelect;
    manager2: typeof schema.staff.$inferSelect;
    waiter1: typeof schema.staff.$inferSelect;
    waiter2: typeof schema.staff.$inferSelect;
    kitchen1: typeof schema.staff.$inferSelect;
    kitchen2: typeof schema.staff.$inferSelect;
    bartender1: typeof schema.staff.$inferSelect;
    cashier1: typeof schema.staff.$inferSelect;
    cashier2: typeof schema.staff.$inferSelect;
    host1: typeof schema.staff.$inferSelect;
  }
) {
  console.log('🏢 Provisioning 2 Organizations, 2 Restaurants, and 3 Branches...');

  // 1. Organization 1 (Tavonza Global Hospitality)
  const [org1] = await db.insert(schema.organizations).values({
    name: 'Tavonza Global Hospitality',
    ownerId: users.owner1.id,
    slug: 'tavonza-global',
  }).returning();
  if (!org1) throw new Error('Failed to create org1');

  // 2. Organization 2 (Apex Hospitality Group)
  const [org2] = await db.insert(schema.organizations).values({
    name: 'Apex Hospitality Group',
    ownerId: users.owner2.id,
    slug: 'apex-hospitality',
  }).returning();
  if (!org2) throw new Error('Failed to create org2');

  // 3. Restaurant 1 (Tavonza Fine Dining & Lounge)
  const [restaurant1] = await db.insert(schema.restaurants).values({
    organizationId: org1.id,
    name: 'Tavonza Fine Dining & Lounge',
    slug: 'tavonza-fine-dining',
    description: 'Award-winning contemporary cuisine and craft cocktail lounge',
    logoUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400',
    isActive: true,
  }).returning();
  if (!restaurant1) throw new Error('Failed to create restaurant1');

  // 4. Restaurant 2 (Apex Gourmet Burger Bar)
  const [restaurant2] = await db.insert(schema.restaurants).values({
    organizationId: org2.id,
    name: 'Apex Gourmet Burger Bar',
    slug: 'apex-burger-bar',
    description: 'Artisanal smash burgers, truffle fries, and handcrafted milkshakes',
    logoUrl: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=400',
    isActive: true,
  }).returning();
  if (!restaurant2) throw new Error('Failed to create restaurant2');

  // 5. Branch 1: Downtown Flagship HQ (Tavonza Primary)
  const [branch1] = await db.insert(schema.branches).values({
    id: DEFAULT_BRANCH_ID,
    restaurantId: restaurant1.id,
    name: 'Downtown Flagship HQ',
    address: {
      line1: '742 Evergreen Terrace',
      city: 'Metropolis',
      state: 'NY',
      postalCode: '10001',
      country: 'US',
      lat: 40.7128,
      lng: -74.006,
    },
    phone: '+1 (555) 234-5678',
    timezone: 'America/New_York',
    isActive: true,
  }).returning();
  if (!branch1) throw new Error('Failed to create branch1');

  // 6. Branch 2: Uptown Waterfront Lounge (Tavonza Secondary)
  const [branch2] = await db.insert(schema.branches).values({
    restaurantId: restaurant1.id,
    name: 'Uptown Waterfront Lounge',
    address: {
      line1: '12 Harbor Blvd',
      city: 'Metropolis',
      state: 'NY',
      postalCode: '10002',
      country: 'US',
    },
    phone: '+1 (555) 987-6543',
    timezone: 'America/New_York',
    isActive: true,
  }).returning();
  if (!branch2) throw new Error('Failed to create branch2');

  // 7. Branch 3: Apex Midtown Flagship (Apex Restaurant Primary)
  const [branch3] = await db.insert(schema.branches).values({
    restaurantId: restaurant2.id,
    name: 'Apex Midtown Flagship',
    address: {
      line1: '88 Madison Ave',
      city: 'Metropolis',
      state: 'NY',
      postalCode: '10016',
      country: 'US',
    },
    phone: '+1 (555) 345-6789',
    timezone: 'America/New_York',
    isActive: true,
  }).returning();
  if (!branch3) throw new Error('Failed to create branch3');

  // 8. Branch Settings (All 3 branches)
  await db.insert(schema.branchSettings).values([
    {
      branchId: branch1.id,
      orderAcceptanceMode: 'WAITER_APPROVAL',
      currency: 'USD',
      taxPercent: 8.0,
      serviceChargePct: 5.0,
      tipEnabled: true,
      allowSplitBill: true,
      allowMultipleGuestSessions: true,
      requireOtpPerGuest: false,
      allowGuestCheckoutWithoutAccount: true,
      autoCloseIdleSessionMins: 120,
      reservationsEnabled: true,
      waitlistEnabled: true,
    },
    {
      branchId: branch2.id,
      orderAcceptanceMode: 'AUTO_ACCEPT',
      currency: 'USD',
      taxPercent: 8.0,
      serviceChargePct: 5.0,
      tipEnabled: true,
      allowSplitBill: true,
      allowMultipleGuestSessions: true,
      requireOtpPerGuest: false,
      allowGuestCheckoutWithoutAccount: true,
      autoCloseIdleSessionMins: 120,
      reservationsEnabled: true,
      waitlistEnabled: true,
    },
    {
      branchId: branch3.id,
      orderAcceptanceMode: 'AUTO_ACCEPT',
      currency: 'USD',
      taxPercent: 8.5,
      serviceChargePct: 3.0,
      tipEnabled: true,
      allowSplitBill: true,
      allowMultipleGuestSessions: true,
      requireOtpPerGuest: false,
      allowGuestCheckoutWithoutAccount: true,
      autoCloseIdleSessionMins: 90,
      reservationsEnabled: true,
      waitlistEnabled: true,
    },
  ]);

  // 9. Branch Operating Hours
  await db.insert(schema.branchOperatingHours).values([
    { branchId: branch1.id, dayOfWeek: 1, openTime: '10:00', closeTime: '23:00' },
    { branchId: branch1.id, dayOfWeek: 2, openTime: '10:00', closeTime: '23:00' },
    { branchId: branch1.id, dayOfWeek: 3, openTime: '10:00', closeTime: '23:00' },
    { branchId: branch1.id, dayOfWeek: 4, openTime: '10:00', closeTime: '23:30' },
    { branchId: branch1.id, dayOfWeek: 5, openTime: '10:00', closeTime: '01:00' },
    { branchId: branch1.id, dayOfWeek: 6, openTime: '09:00', closeTime: '01:00' },
    { branchId: branch1.id, dayOfWeek: 0, openTime: '09:00', closeTime: '22:00' },
    { branchId: branch2.id, dayOfWeek: 5, openTime: '16:00', closeTime: '02:00' },
    { branchId: branch2.id, dayOfWeek: 6, openTime: '16:00', closeTime: '02:00' },
    { branchId: branch3.id, dayOfWeek: 1, openTime: '11:00', closeTime: '22:00' },
    { branchId: branch3.id, dayOfWeek: 6, openTime: '11:00', closeTime: '23:00' },
  ]);

  // 10. Branch Holiday Schedule
  await db.insert(schema.branchHolidays).values([
    {
      branchId: branch1.id,
      date: '2026-12-24',
      isClosed: false,
      label: 'Christmas Eve Gala',
      openTime: '16:00',
      closeTime: '23:00',
    },
    {
      branchId: branch1.id,
      date: '2026-12-25',
      isClosed: true,
      label: 'Christmas Day (Closed)',
    },
    {
      branchId: branch3.id,
      date: '2027-01-01',
      isClosed: false,
      label: "New Year's Day Brunch",
      openTime: '11:00',
      closeTime: '20:00',
    },
  ]);

  // 11. Staff Assignments to Branches
  const managerPermissions = [
    'MANAGE_MENU', 'MANAGE_TABLES', 'MANAGE_STAFF', 'MANAGE_RESERVATIONS',
    'VIEW_ORDERS', 'UPDATE_ORDER_STATUS', 'MANAGE_PAYMENTS', 'APPLY_DISCOUNTS',
    'VIEW_REPORTS', 'MANAGE_BRANCH_SETTINGS',
  ];

  const [managerAssignment1] = await db.insert(schema.staffAssignments).values({
    staffId: staff.manager1.id,
    branchId: branch1.id,
    role: 'BRANCH_MANAGER',
    permissions: managerPermissions,
    isActive: true,
  }).returning();

  await db.insert(schema.staffAssignments).values({
    staffId: staff.manager1.id,
    branchId: branch2.id,
    role: 'BRANCH_MANAGER',
    permissions: managerPermissions,
    isActive: true,
  });

  await db.insert(schema.staffAssignments).values({
    staffId: staff.manager2.id,
    branchId: branch3.id,
    role: 'BRANCH_MANAGER',
    permissions: managerPermissions,
    isActive: true,
  });

  const [waiterAssignment1] = await db.insert(schema.staffAssignments).values({
    staffId: staff.waiter1.id,
    branchId: branch1.id,
    role: 'WAITER',
    permissions: ['VIEW_ORDERS', 'UPDATE_ORDER_STATUS', 'MANAGE_TABLES'],
    isActive: true,
  }).returning();

  const [waiterAssignment2] = await db.insert(schema.staffAssignments).values({
    staffId: staff.waiter2.id,
    branchId: branch2.id,
    role: 'WAITER',
    permissions: ['VIEW_ORDERS', 'UPDATE_ORDER_STATUS', 'MANAGE_TABLES'],
    isActive: true,
  }).returning();

  const [kitchenAssignment1] = await db.insert(schema.staffAssignments).values({
    staffId: staff.kitchen1.id,
    branchId: branch1.id,
    role: 'KITCHEN_STAFF',
    permissions: ['VIEW_ORDERS', 'UPDATE_ORDER_STATUS'],
    isActive: true,
  }).returning();

  await db.insert(schema.staffAssignments).values({
    staffId: staff.kitchen2.id,
    branchId: branch2.id,
    role: 'KITCHEN_STAFF',
    permissions: ['VIEW_ORDERS', 'UPDATE_ORDER_STATUS'],
    isActive: true,
  });

  const [bartenderAssignment1] = await db.insert(schema.staffAssignments).values({
    staffId: staff.bartender1.id,
    branchId: branch1.id,
    role: 'BARTENDER',
    permissions: ['VIEW_ORDERS', 'UPDATE_ORDER_STATUS'],
    isActive: true,
  }).returning();

  const [cashierAssignment1] = await db.insert(schema.staffAssignments).values({
    staffId: staff.cashier1.id,
    branchId: branch1.id,
    role: 'CASHIER',
    permissions: ['MANAGE_PAYMENTS', 'VIEW_ORDERS', 'APPLY_DISCOUNTS'],
    isActive: true,
  }).returning();

  await db.insert(schema.staffAssignments).values({
    staffId: staff.cashier2.id,
    branchId: branch2.id,
    role: 'CASHIER',
    permissions: ['MANAGE_PAYMENTS', 'VIEW_ORDERS', 'APPLY_DISCOUNTS'],
    isActive: true,
  });

  await db.insert(schema.staffAssignments).values({
    staffId: staff.host1.id,
    branchId: branch1.id,
    role: 'HOST',
    permissions: ['MANAGE_RESERVATIONS', 'MANAGE_TABLES'],
    isActive: true,
  });

  if (!managerAssignment1 || !waiterAssignment1 || !waiterAssignment2 ||
      !kitchenAssignment1 || !bartenderAssignment1 || !cashierAssignment1) {
    throw new Error('Failed to configure staff assignments');
  }

  return {
    org1,
    org2,
    restaurant1,
    restaurant2,
    branch1,
    branch2,
    branch3,
    managerAssignment1,
    waiterAssignment1,
    waiterAssignment2,
    kitchenAssignment1,
    bartenderAssignment1,
    cashierAssignment1,
  };
}
