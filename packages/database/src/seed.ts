import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(__dirname, '../../../.env') });
config();

import { drizzle } from 'drizzle-orm/node-postgres';
import { eq as drizzleOrmEq } from 'drizzle-orm';
import { Pool } from 'pg';
import * as schema from './schema';

// Verified Argon2id password hashes:
const SUPERADMIN_HASH = '$argon2id$v=19$m=65536,p=4,t=3$18N3tRXK/GC0Ozhb18sYow$jnqpKklyFXTy6KbTm+GZIJlw+67tMK8edrD8nhZYLwA'; // SuperAdmin@1234
const OWNER_HASH      = '$argon2id$v=19$m=65536,p=4,t=3$TMEkugrsrGzIK/EXRJT8aQ$jKN9rfcenCaEAxrgJGPnomLcyRP7z70GsODVFS0QEX8'; // Owner@1234
const MANAGER_HASH    = '$argon2id$v=19$m=65536,p=4,t=3$vN2/ffOGgFgpdkc/ldKWCg$34M5mZ/9G3vK+CWIdWGus9V54JDFrs6jgmzKAYfQWgo'; // Manager@1234
const WAITER_HASH     = '$argon2id$v=19$m=65536,p=4,t=3$c0hP1AzgorMwvVdiAlbWoA$XCcQ75wlaCXI9HBWtMRsz7IQ/ohHnJHFhz09mrCzIk8'; // Waiter@1234
const CASHIER_HASH    = '$argon2id$v=19$m=65536,p=4,t=3$N+smfOv/2C7f4IxLkj//cQ$p2wRhV/ZlY/t8j2VajXyeII5WKLEhwuTkaDaBwOpAbk'; // Cashier@1234
const KITCHEN_HASH    = '$argon2id$v=19$m=65536,p=4,t=3$M1QFcCaN5w11y463r11sUA$QE1aokqs+Lc52Px0Fc5cRRSzkD93abkohhf5MYdL3Bw'; // Kitchen@1234
const BARTENDER_HASH  = '$argon2id$v=19$m=65536,p=4,t=3$S68sVVcm9b562kd7arcDFA$wCRAVf1hEM8haoLtoNoWSgAWIj6ahZMgIM+sfTGAXkY'; // Bartender@1234
const HOST_HASH       = '$argon2id$v=19$m=65536,p=4,t=3$B45VMrMZZGDFyaq3sz2iew$d/d8gqk6I2AMjiomjxo7wjeERk9EjtURdSRCXG9xNUs'; // Host@1234
const CUSTOMER_HASH   = '$argon2id$v=19$m=65536,p=4,t=3$9xEReGfA9T3slHzmViaBSg$kz6uShvGNyojbnI1zxHzWMWhfoG5FHQluhh0OdC+CaY'; // Customer@1234

export const DEFAULT_BRANCH_ID = 'ce7b4318-5e2e-4fcd-a459-0e1bc80a6f27';

const runSeed = async () => {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not defined');
  }

  console.log('⏳ Connecting to database for seeding...');
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(pool, { schema });

  try {
    console.log('🌱 Starting comprehensive Tavonza AI multi-tenant database seed...');

    // ── 0. Clean Existing Tables (in reverse dependency order) ───────────────
    console.log('🧹 Purging existing operational data...');
    await db.delete(schema.notifications);
    await db.delete(schema.auditLogs);
    await db.delete(schema.orderItemStatusChangeLogs);
    await db.delete(schema.statusChangeLogs);
    await db.delete(schema.orderReviews);
    await db.delete(schema.paymentAllocations);
    await db.delete(schema.payments);
    await db.delete(schema.orderItems);
    await db.delete(schema.orders);
    await db.delete(schema.discounts);
    await db.delete(schema.passwordResetOtps);
    await db.delete(schema.tableAuthOtps);
    await db.delete(schema.guestSessions);
    await db.delete(schema.tableSessions);
    await db.delete(schema.waiterTableAssignments);
    await db.delete(schema.reservations);
    await db.delete(schema.workShifts);
    await db.delete(schema.inventoryItems);
    await db.delete(schema.inventoryCategories);
    await db.delete(schema.suppliers);
    await db.delete(schema.staffAssignments);
    await db.delete(schema.staff);
    await db.delete(schema.customers);
    await db.delete(schema.owners);
    await db.delete(schema.admins);
    await db.delete(schema.modifiers);
    await db.delete(schema.modifierGroups);
    await db.delete(schema.menuItems);
    await db.delete(schema.menuCategories);
    await db.delete(schema.tables);
    await db.delete(schema.branchOperatingHours);
    await db.delete(schema.branchHolidays);
    await db.delete(schema.branchSettings);
    await db.delete(schema.branches);
    await db.delete(schema.restaurants);
    await db.delete(schema.organizations);
    await db.delete(schema.users);

    const now = new Date();

    // ── 1. Users Roster & Roles ─────────────────────────────────────────────
    console.log('👤 Provisioning user personas and RBAC roles...');

    // 1A. Super Admin User (Super Admin Portal on port 3102)
    const [superAdminUser] = await db.insert(schema.users).values({
      email: 'superadmin@tavonza.ai',
      name: 'Alexander Cross',
      password: SUPERADMIN_HASH,
      role: 'SUPER_ADMIN',
      status: 'ACTIVE',
      isEmailVerified: true,
      contactNo: '+1 (555) 000-0001',
    }).returning();
    if (!superAdminUser) throw new Error('Failed to create superAdminUser');

    await db.insert(schema.admins).values({
      userId: superAdminUser.id,
      intro: 'Tavonza SaaS Global Super Administrator',
    });

    // 1B. Organization Owner (Admin console on port 3102)
    const [ownerUser] = await db.insert(schema.users).values({
      email: 'owner@tavonza.ai',
      name: 'Victoria Vance',
      password: OWNER_HASH,
      role: 'ADMIN',
      status: 'ACTIVE',
      isEmailVerified: true,
      contactNo: '+1 (555) 000-0002',
    }).returning();
    if (!ownerUser) throw new Error('Failed to create ownerUser');

    await db.insert(schema.owners).values({
      userId: ownerUser.id,
    });

    // 1C. Branch Manager (Manager Portal on port 3103)
    const [managerUser] = await db.insert(schema.users).values({
      email: 'manager@tavonza.ai',
      name: 'Marcus Vance',
      password: MANAGER_HASH,
      role: 'STAFF',
      status: 'ACTIVE',
      isEmailVerified: true,
      contactNo: '+1 (555) 111-2233',
    }).returning();
    if (!managerUser) throw new Error('Failed to create managerUser');

    const [managerStaff] = await db.insert(schema.staff).values({
      userId: managerUser.id,
    }).returning();
    if (!managerStaff) throw new Error('Failed to create managerStaff');

    // 1D. Waiter (Waiter Portal on port 3101)
    const [waiterUser] = await db.insert(schema.users).values({
      email: 'waiter@tavonza.ai',
      name: 'David Chen',
      password: WAITER_HASH,
      role: 'STAFF',
      status: 'ACTIVE',
      isEmailVerified: true,
      contactNo: '+1 (555) 222-3344',
    }).returning();
    if (!waiterUser) throw new Error('Failed to create waiterUser');

    const [waiterStaff] = await db.insert(schema.staff).values({
      userId: waiterUser.id,
    }).returning();
    if (!waiterStaff) throw new Error('Failed to create waiterStaff');

    // 1E. Kitchen Chef (Kitchen KDS Display on port 3105)
    const [kitchenUser] = await db.insert(schema.users).values({
      email: 'kitchen@tavonza.ai',
      name: 'Chef Gordon Ramsay',
      password: KITCHEN_HASH,
      role: 'STAFF',
      status: 'ACTIVE',
      isEmailVerified: true,
      contactNo: '+1 (555) 333-4455',
    }).returning();
    if (!kitchenUser) throw new Error('Failed to create kitchenUser');

    const [kitchenStaff] = await db.insert(schema.staff).values({
      userId: kitchenUser.id,
    }).returning();
    if (!kitchenStaff) throw new Error('Failed to create kitchenStaff');

    // 1F. Bartender (Bar KDS Display on port 3105)
    const [bartenderUser] = await db.insert(schema.users).values({
      email: 'bartender@tavonza.ai',
      name: 'Alex Rivera',
      password: BARTENDER_HASH,
      role: 'STAFF',
      status: 'ACTIVE',
      isEmailVerified: true,
      contactNo: '+1 (555) 444-5566',
    }).returning();
    if (!bartenderUser) throw new Error('Failed to create bartenderUser');

    const [bartenderStaff] = await db.insert(schema.staff).values({
      userId: bartenderUser.id,
    }).returning();
    if (!bartenderStaff) throw new Error('Failed to create bartenderStaff');

    // 1G. Cashier (Cashier POS Terminal on port 3104)
    const [cashierUser] = await db.insert(schema.users).values({
      email: 'cashier@tavonza.ai',
      name: 'Emma Watson',
      password: CASHIER_HASH,
      role: 'STAFF',
      status: 'ACTIVE',
      isEmailVerified: true,
      contactNo: '+1 (555) 555-6677',
    }).returning();
    if (!cashierUser) throw new Error('Failed to create cashierUser');

    const [cashierStaff] = await db.insert(schema.staff).values({
      userId: cashierUser.id,
    }).returning();
    if (!cashierStaff) throw new Error('Failed to create cashierStaff');

    // 1H. Host (Host table seating & greeting)
    const [hostUser] = await db.insert(schema.users).values({
      email: 'host@tavonza.ai',
      name: 'Sophia Loren',
      password: HOST_HASH,
      role: 'STAFF',
      status: 'ACTIVE',
      isEmailVerified: true,
      contactNo: '+1 (555) 666-7788',
    }).returning();
    if (!hostUser) throw new Error('Failed to create hostUser');

    const [hostStaff] = await db.insert(schema.staff).values({
      userId: hostUser.id,
    }).returning();
    if (!hostStaff) throw new Error('Failed to create hostStaff');

    // 1I. Registered Customer (Customer QR App on port 3100)
    const [customerUser] = await db.insert(schema.users).values({
      email: 'customer@tavonza.ai',
      name: 'Sarah Jenkins',
      password: CUSTOMER_HASH,
      role: 'CUSTOMER',
      status: 'ACTIVE',
      isEmailVerified: true,
      contactNo: '+1 (555) 777-8899',
    }).returning();
    if (!customerUser) throw new Error('Failed to create customerUser');

    const [customerEntity] = await db.insert(schema.customers).values({
      userId: customerUser.id,
      loyaltyPoints: 150,
      defaultAddress: { line1: '123 Park Avenue', city: 'Metropolis', country: 'US' },
    }).returning();
    if (!customerEntity) throw new Error('Failed to create customerEntity');

    // 1J. Additional Registered Customer for Reviews & Orders
    const [customerUser2] = await db.insert(schema.users).values({
      email: 'john.doe@example.com',
      name: 'John Doe',
      password: CUSTOMER_HASH,
      role: 'CUSTOMER',
      status: 'ACTIVE',
      isEmailVerified: true,
      contactNo: '+1 (555) 888-9900',
    }).returning();
    if (!customerUser2) throw new Error('Failed to create customerUser2');

    const [customerEntity2] = await db.insert(schema.customers).values({
      userId: customerUser2.id,
      loyaltyPoints: 40,
    }).returning();
    if (!customerEntity2) throw new Error('Failed to create customerEntity2');

    // ── 2. Multi-Tenant Hierarchy ───────────────────────────────────────────
    console.log('🏢 Provisioning Organization, Restaurant and Branches...');

    // 2A. Organization
    const [org] = await db.insert(schema.organizations).values({
      name: 'Tavonza Global Hospitality',
      ownerId: ownerUser.id,
      slug: 'tavonza-global',
    }).returning();
    if (!org) throw new Error('Failed to create org');

    // 2B. Restaurant
    const [restaurant] = await db.insert(schema.restaurants).values({
      organizationId: org.id,
      name: 'Tavonza Fine Dining & Lounge',
      slug: 'tavonza-fine-dining',
      description: 'Award-winning contemporary cuisine and craft cocktail lounge',
      logoUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400',
      isActive: true,
    }).returning();
    if (!restaurant) throw new Error('Failed to create restaurant');

    // 2C. Primary Branch (Downtown HQ)
    const [branch] = await db.insert(schema.branches).values({
      id: DEFAULT_BRANCH_ID,
      restaurantId: restaurant.id,
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
    if (!branch) throw new Error('Failed to create primary branch');

    // 2D. Secondary Branch (Uptown Waterfront Lounge - for testing multi-branch switching)
    const [secondaryBranch] = await db.insert(schema.branches).values({
      restaurantId: restaurant.id,
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
    if (!secondaryBranch) throw new Error('Failed to create secondary branch');

    // 2E. Branch Settings (Primary Branch)
    await db.insert(schema.branchSettings).values({
      branchId: branch.id,
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
    });

    // Secondary Branch Settings
    await db.insert(schema.branchSettings).values({
      branchId: secondaryBranch.id,
      orderAcceptanceMode: 'AUTO_ACCEPT',
      currency: 'USD',
      taxPercent: 8.0,
      serviceChargePct: 5.0,
      allowSplitBill: true,
      allowMultipleGuestSessions: true,
    });

    // 2F. Branch Operating Hours (7 Days Weekly)
    await db.insert(schema.branchOperatingHours).values([
      { branchId: branch.id, dayOfWeek: 1, openTime: '10:00', closeTime: '23:00' }, // Monday
      { branchId: branch.id, dayOfWeek: 2, openTime: '10:00', closeTime: '23:00' }, // Tuesday
      { branchId: branch.id, dayOfWeek: 3, openTime: '10:00', closeTime: '23:00' }, // Wednesday
      { branchId: branch.id, dayOfWeek: 4, openTime: '10:00', closeTime: '23:30' }, // Thursday
      { branchId: branch.id, dayOfWeek: 5, openTime: '10:00', closeTime: '01:00' }, // Friday
      { branchId: branch.id, dayOfWeek: 6, openTime: '09:00', closeTime: '01:00' }, // Saturday
      { branchId: branch.id, dayOfWeek: 0, openTime: '09:00', closeTime: '22:00' }, // Sunday
    ]);

    // 2G. Branch Holiday Schedule
    await db.insert(schema.branchHolidays).values([
      {
        branchId: branch.id,
        date: '2026-12-24',
        isClosed: false,
        label: 'Christmas Eve Gala',
        openTime: '16:00',
        closeTime: '23:00',
      },
      {
        branchId: branch.id,
        date: '2026-12-25',
        isClosed: true,
        label: 'Christmas Day (Closed)',
      },
    ]);

    // ── 3. Staff Assignments & Capability Permissions ───────────────────────
    console.log('🛡️ Configuring Staff Assignments & granular capability grants...');

    // 3A. Manager at Downtown HQ (Full manager permissions)
    const [managerAssignment] = await db.insert(schema.staffAssignments).values({
      staffId: managerStaff.id,
      branchId: branch.id,
      role: 'BRANCH_MANAGER',
      permissions: [
        'MANAGE_MENU',
        'MANAGE_TABLES',
        'MANAGE_STAFF',
        'MANAGE_RESERVATIONS',
        'VIEW_ORDERS',
        'UPDATE_ORDER_STATUS',
        'MANAGE_PAYMENTS',
        'APPLY_DISCOUNTS',
        'VIEW_REPORTS',
        'MANAGE_BRANCH_SETTINGS',
      ],
      isActive: true,
    }).returning();
    if (!managerAssignment) throw new Error('Failed to create manager assignment');

    // 3B. Manager also assigned to Uptown Waterfront Lounge (Enables branch switching test)
    await db.insert(schema.staffAssignments).values({
      staffId: managerStaff.id,
      branchId: secondaryBranch.id,
      role: 'BRANCH_MANAGER',
      permissions: [
        'MANAGE_MENU',
        'MANAGE_TABLES',
        'VIEW_ORDERS',
        'UPDATE_ORDER_STATUS',
        'VIEW_REPORTS',
      ],
      isActive: true,
    });

    // 3C. Waiter at Downtown HQ
    const [waiterAssignment] = await db.insert(schema.staffAssignments).values({
      staffId: waiterStaff.id,
      branchId: branch.id,
      role: 'WAITER',
      permissions: ['VIEW_ORDERS', 'UPDATE_ORDER_STATUS', 'MANAGE_TABLES'],
      isActive: true,
    }).returning();
    if (!waiterAssignment) throw new Error('Failed to create waiter assignment');

    // 3D. Kitchen Chef at Downtown HQ
    const [kitchenAssignment] = await db.insert(schema.staffAssignments).values({
      staffId: kitchenStaff.id,
      branchId: branch.id,
      role: 'KITCHEN_STAFF',
      permissions: ['VIEW_ORDERS', 'UPDATE_ORDER_STATUS'],
      isActive: true,
    }).returning();
    if (!kitchenAssignment) throw new Error('Failed to create kitchen assignment');

    // 3E. Bartender at Downtown HQ
    const [bartenderAssignment] = await db.insert(schema.staffAssignments).values({
      staffId: bartenderStaff.id,
      branchId: branch.id,
      role: 'BARTENDER',
      permissions: ['VIEW_ORDERS', 'UPDATE_ORDER_STATUS'],
      isActive: true,
    }).returning();
    if (!bartenderAssignment) throw new Error('Failed to create bartender assignment');

    // 3F. Cashier at Downtown HQ
    const [cashierAssignment] = await db.insert(schema.staffAssignments).values({
      staffId: cashierStaff.id,
      branchId: branch.id,
      role: 'CASHIER',
      permissions: ['MANAGE_PAYMENTS', 'VIEW_ORDERS', 'APPLY_DISCOUNTS'],
      isActive: true,
    }).returning();
    if (!cashierAssignment) throw new Error('Failed to create cashier assignment');

    // 3G. Host at Downtown HQ
    await db.insert(schema.staffAssignments).values({
      staffId: hostStaff.id,
      branchId: branch.id,
      role: 'HOST',
      permissions: ['MANAGE_RESERVATIONS', 'MANAGE_TABLES'],
      isActive: true,
    });

    // ── 4. Tables, Physical Space & Opaque QR Tokens ────────────────────────
    console.log('🪑 Provisioning Floor layouts, Tables, and Opaque QR Tokens...');

    // Floor 1 (Main Dining & Bar), Floor 2 (Rooftop Patio)
    // Covers all 7 TableServiceStatus & 4 TableOperationalFlag
    const createdTables = await db.insert(schema.tables).values([
      // Floor 1: Main Dining
      {
        branchId: branch.id,
        label: 'T-01',
        capacity: 4,
        shape: 'SQUARE',
        floor: 1,
        serviceStatus: 'ORDERING',
        operationalFlag: 'NORMAL',
        qrCodeToken: 'qr_tok_dt_t01',
      },
      {
        branchId: branch.id,
        label: 'T-02',
        capacity: 2,
        shape: 'CIRCLE',
        floor: 1,
        serviceStatus: 'AVAILABLE',
        operationalFlag: 'NORMAL',
        qrCodeToken: 'qr_tok_dt_t02',
      },
      {
        branchId: branch.id,
        label: 'T-03',
        capacity: 4,
        shape: 'RECTANGLE',
        floor: 1,
        serviceStatus: 'PREPARING',
        operationalFlag: 'NORMAL',
        qrCodeToken: 'qr_tok_dt_t03',
      },
      {
        branchId: branch.id,
        label: 'T-04',
        capacity: 6,
        shape: 'RECTANGLE',
        floor: 1,
        serviceStatus: 'PAYMENT_PENDING',
        operationalFlag: 'NORMAL',
        qrCodeToken: 'qr_tok_dt_t04',
      },
      {
        branchId: branch.id,
        label: 'T-05',
        capacity: 2,
        shape: 'SQUARE',
        floor: 1,
        serviceStatus: 'OCCUPIED',
        operationalFlag: 'NORMAL',
        qrCodeToken: 'qr_tok_dt_t05',
      },
      {
        branchId: branch.id,
        label: 'T-06',
        capacity: 8,
        shape: 'RECTANGLE',
        floor: 1,
        serviceStatus: 'SERVING',
        operationalFlag: 'NORMAL',
        qrCodeToken: 'qr_tok_dt_t06',
      },

      // Floor 2: Rooftop / Patio
      {
        branchId: branch.id,
        label: 'P-01',
        capacity: 4,
        shape: 'CIRCLE',
        floor: 2,
        serviceStatus: 'AVAILABLE',
        operationalFlag: 'NORMAL',
        qrCodeToken: 'qr_tok_dt_p01',
      },
      {
        branchId: branch.id,
        label: 'P-02',
        capacity: 4,
        shape: 'HEXAGON',
        floor: 2,
        serviceStatus: 'CLOSING',
        operationalFlag: 'NORMAL',
        qrCodeToken: 'qr_tok_dt_p02',
      },
      {
        branchId: branch.id,
        label: 'P-03',
        capacity: 6,
        shape: 'RECTANGLE',
        floor: 2,
        serviceStatus: 'AVAILABLE',
        operationalFlag: 'RESERVED',
        qrCodeToken: 'qr_tok_dt_p03',
      },
      {
        branchId: branch.id,
        label: 'P-04',
        capacity: 2,
        shape: 'SQUARE',
        floor: 2,
        serviceStatus: 'AVAILABLE',
        operationalFlag: 'CLEANING',
        qrCodeToken: 'qr_tok_dt_p04',
      },
      {
        branchId: branch.id,
        label: 'P-05',
        capacity: 4,
        shape: 'CIRCLE',
        floor: 2,
        serviceStatus: 'AVAILABLE',
        operationalFlag: 'OUT_OF_SERVICE',
        qrCodeToken: 'qr_tok_dt_p05',
      },

      // Floor 1: Bar Counter
      {
        branchId: branch.id,
        label: 'BAR-01',
        capacity: 1,
        shape: 'CIRCLE',
        floor: 1,
        serviceStatus: 'OCCUPIED',
        operationalFlag: 'NORMAL',
        qrCodeToken: 'qr_tok_dt_bar01',
      },
    ]).returning();

    const [t1, t2, t3, t4, t5, t6, , , p3] = createdTables;
    if (!t1 || !t2 || !t3 || !t4 || !t5 || !t6 || !p3) {
      throw new Error('Failed to create tables');
    }

    // Secondary Branch Table (for multi-branch verification)
    await db.insert(schema.tables).values({
      branchId: secondaryBranch.id,
      label: 'W-01',
      capacity: 4,
      shape: 'CIRCLE',
      floor: 1,
      serviceStatus: 'AVAILABLE',
      operationalFlag: 'NORMAL',
      qrCodeToken: 'qr_tok_uw_w01',
    });

    // ── 5. Active Waiter Table Assignments ──────────────────────────────────
    console.log('📋 Assigning tables to Waiter shift window...');
    const sessionStart = new Date(now.getTime() - 24 * 3600 * 1000);
    const sessionEnd = new Date(now.getTime() + 30 * 24 * 3600 * 1000);

    const waiterAssignmentsMap = new Map<string, string>();
    for (const t of createdTables) {
      const [assignment] = await db.insert(schema.waiterTableAssignments).values({
        branchId: branch.id,
        tableId: t.id,
        waiterId: waiterStaff.id,
        assignedById: managerStaff.id,
        sessionStart,
        sessionEnd,
        isActive: true,
      }).returning();
      if (assignment) {
        waiterAssignmentsMap.set(t.id, assignment.id);
      }
    }

    // ── 6. Table Sessions & Multi-Guest Sessions ────────────────────────────
    console.log('👥 Establishing Table Sessions & Guest Sessions...');

    // 6A. Table 1: Active Session (Sarah Jenkins dining)
    const [tableSession1] = await db.insert(schema.tableSessions).values({
      branchId: branch.id,
      tableId: t1.id,
      joinCode: 'JOIN101',
      partySize: 2,
      status: 'ACTIVE',
      openedByStaffId: waiterStaff.id,
      startedAt: new Date(now.getTime() - 30 * 60 * 1000),
    }).returning();
    if (!tableSession1) throw new Error('Failed to create tableSession1');

    const [guestSession1] = await db.insert(schema.guestSessions).values({
      tableSessionId: tableSession1.id,
      customerId: customerEntity.id,
      displayName: 'Sarah Jenkins',
      contact: 'customer@tavonza.ai',
      isHostGuest: true,
      otpVerifiedAt: new Date(now.getTime() - 29 * 60 * 1000),
      status: 'ACTIVE',
    }).returning();
    if (!guestSession1) throw new Error('Failed to create guestSession1');

    // 6B. Table 3: Active Session (In-kitchen prep)
    const [tableSession3] = await db.insert(schema.tableSessions).values({
      branchId: branch.id,
      tableId: t3.id,
      joinCode: 'JOIN103',
      partySize: 3,
      status: 'ACTIVE',
      openedByStaffId: waiterStaff.id,
      startedAt: new Date(now.getTime() - 45 * 60 * 1000),
    }).returning();
    if (!tableSession3) throw new Error('Failed to create tableSession3');

    const [guestSession3Host] = await db.insert(schema.guestSessions).values({
      tableSessionId: tableSession3.id,
      displayName: 'Alex Morgan',
      contact: 'alex@example.com',
      isHostGuest: true,
      otpVerifiedAt: new Date(now.getTime() - 44 * 60 * 1000),
      status: 'ACTIVE',
    }).returning();
    if (!guestSession3Host) throw new Error('Failed to create guestSession3Host');

    const [guestSession3Guest] = await db.insert(schema.guestSessions).values({
      tableSessionId: tableSession3.id,
      displayName: 'Sam Wilson',
      contact: 'sam@example.com',
      isHostGuest: false,
      otpVerifiedAt: new Date(now.getTime() - 40 * 60 * 1000),
      status: 'ACTIVE',
    }).returning();
    if (!guestSession3Guest) throw new Error('Failed to create guestSession3Guest');

    // 6C. Table 4: Multi-Guest Split-Bill Session (Bill Requested)
    const [tableSession4] = await db.insert(schema.tableSessions).values({
      branchId: branch.id,
      tableId: t4.id,
      joinCode: 'JOIN104',
      partySize: 3,
      status: 'BILL_REQUESTED',
      openedByStaffId: waiterStaff.id,
      startedAt: new Date(now.getTime() - 90 * 60 * 1000),
    }).returning();
    if (!tableSession4) throw new Error('Failed to create tableSession4');

    const [guestSession4Host] = await db.insert(schema.guestSessions).values({
      tableSessionId: tableSession4.id,
      displayName: 'Michael Scott',
      contact: 'michael@dunder.example',
      isHostGuest: true,
      otpVerifiedAt: new Date(now.getTime() - 88 * 60 * 1000),
      status: 'ACTIVE',
    }).returning();
    if (!guestSession4Host) throw new Error('Failed to create guestSession4Host');

    const [guestSession4Dwight] = await db.insert(schema.guestSessions).values({
      tableSessionId: tableSession4.id,
      displayName: 'Dwight Schrute',
      contact: 'dwight@dunder.example',
      isHostGuest: false,
      otpVerifiedAt: new Date(now.getTime() - 85 * 60 * 1000),
      status: 'ACTIVE',
    }).returning();
    if (!guestSession4Dwight) throw new Error('Failed to create guestSession4Dwight');

    const [guestSession4Jim] = await db.insert(schema.guestSessions).values({
      tableSessionId: tableSession4.id,
      displayName: 'Jim Halpert',
      contact: 'jim@dunder.example',
      isHostGuest: false,
      otpVerifiedAt: new Date(now.getTime() - 80 * 60 * 1000),
      status: 'ACTIVE',
    }).returning();
    if (!guestSession4Jim) throw new Error('Failed to create guestSession4Jim');

    // 6D. Table 5: Occupied Seated Session
    const [tableSession5] = await db.insert(schema.tableSessions).values({
      branchId: branch.id,
      tableId: t5.id,
      joinCode: 'JOIN105',
      partySize: 2,
      status: 'ACTIVE',
      startedAt: new Date(now.getTime() - 10 * 60 * 1000),
    }).returning();
    if (!tableSession5) throw new Error('Failed to create tableSession5');

    const [guestSession5] = await db.insert(schema.guestSessions).values({
      tableSessionId: tableSession5.id,
      customerId: customerEntity2.id,
      displayName: 'John Doe',
      isHostGuest: true,
      otpVerifiedAt: new Date(now.getTime() - 9 * 60 * 1000),
      status: 'ACTIVE',
    }).returning();
    if (!guestSession5) throw new Error('Failed to create guestSession5');

    // 6E. Table 6: Serving Session
    const [tableSession6] = await db.insert(schema.tableSessions).values({
      branchId: branch.id,
      tableId: t6.id,
      joinCode: 'JOIN106',
      partySize: 4,
      status: 'ACTIVE',
      openedByStaffId: waiterStaff.id,
      startedAt: new Date(now.getTime() - 60 * 60 * 1000),
    }).returning();
    if (!tableSession6) throw new Error('Failed to create tableSession6');

    const [guestSession6] = await db.insert(schema.guestSessions).values({
      tableSessionId: tableSession6.id,
      displayName: 'Emily Blunt',
      contact: 'emily@example.com',
      isHostGuest: true,
      otpVerifiedAt: new Date(now.getTime() - 58 * 60 * 1000),
      status: 'ACTIVE',
    }).returning();
    if (!guestSession6) throw new Error('Failed to create guestSession6');

    // ── 7. Menu Catalog, Dishes, Modifiers & Station Types ───────────────────
    console.log('🍽️ Cataloging Menu categories, items, and modifier groups...');

    const [catStarters] = await db.insert(schema.menuCategories).values({
      restaurantId: restaurant.id,
      name: 'Starters & Small Plates',
      description: 'Artisanal appetizers crafted for sharing',
      displayOrder: 1,
      isActive: true,
    }).returning();

    const [catMains] = await db.insert(schema.menuCategories).values({
      restaurantId: restaurant.id,
      name: "Chef's Signature Mains",
      description: 'Prime cut steaks, fresh wild seafood and signature burgers',
      displayOrder: 2,
      isActive: true,
    }).returning();

    const [catPastas] = await db.insert(schema.menuCategories).values({
      restaurantId: restaurant.id,
      name: 'Pastas & Risotto',
      description: 'Handcrafted pasta and slow-simmered risottos',
      displayOrder: 3,
      isActive: true,
    }).returning();

    const [catCocktails] = await db.insert(schema.menuCategories).values({
      restaurantId: restaurant.id,
      name: 'Artisanal Cocktails',
      description: 'Handcrafted spirits, house-infused syrups, and smoked bitters',
      displayOrder: 4,
      isActive: true,
    }).returning();

    const [catBeverages] = await db.insert(schema.menuCategories).values({
      restaurantId: restaurant.id,
      name: 'Wine, Beer & Refreshments',
      description: 'Fine vintages, craft draughts, and organic soft drinks',
      displayOrder: 5,
      isActive: true,
    }).returning();

    const [catDesserts] = await db.insert(schema.menuCategories).values({
      restaurantId: restaurant.id,
      name: 'Desserts & Sweets',
      description: 'Indulgent European desserts and artisanal gelatos',
      displayOrder: 6,
      isActive: true,
    }).returning();

    if (!catStarters || !catMains || !catPastas || !catCocktails || !catBeverages || !catDesserts) {
      throw new Error('Failed to create menu categories');
    }

    // 7B. Menu Items
    const [
      itemCalamari,
      itemFries,
      ,
      itemBurger,
      itemSteak,
      itemSalmon,
      itemPizza,
      itemTagliatelle,
      ,
      itemOldFashioned,
      itemMezcalita,
      itemWine,
      itemBeer,
      itemLavaCake,
    ] = await db.insert(schema.menuItems).values([
      // Starters (KITCHEN)
      {
        restaurantId: restaurant.id,
        categoryId: catStarters.id,
        name: 'Crispy Calamari',
        description: 'Tender Monterey squid with spicy lemon herb aioli',
        imageUrl: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=600',
        basePrice: 16.0,
        isAvailable: true,
        isVegetarian: false,
        spiceLevel: 1,
        displayOrder: 1,
      },
      {
        restaurantId: restaurant.id,
        categoryId: catStarters.id,
        name: 'Truffle Parmesan Fries',
        description: 'Crispy Idaho russet potatoes with white truffle oil & aged parmesan',
        imageUrl: 'https://images.unsplash.com/photo-1576107232684-1279f3908594?w=600',
        basePrice: 12.0,
        isAvailable: true,
        isVegetarian: true,
        spiceLevel: 0,
        displayOrder: 2,
      },
      {
        restaurantId: restaurant.id,
        categoryId: catStarters.id,
        name: 'Heirloom Tomato Bruschetta',
        description: 'Grilled sourdough, balsamic glaze, fresh basil & buffalo mozzarella',
        imageUrl: 'https://images.unsplash.com/photo-1572695157366-5e585ab2b69f?w=600',
        basePrice: 11.5,
        isAvailable: true,
        isVegetarian: true,
        spiceLevel: 0,
        displayOrder: 3,
      },

      // Mains (KITCHEN)
      {
        restaurantId: restaurant.id,
        categoryId: catMains.id,
        name: 'Potato Corn Burger',
        description: 'Crispy spiced potato patty with sweet corn, chipotle sauce & brioche',
        imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600',
        basePrice: 26.0,
        isAvailable: true,
        isVegetarian: true,
        spiceLevel: 1,
        displayOrder: 1,
      },
      {
        restaurantId: restaurant.id,
        categoryId: catMains.id,
        name: 'Prime Ribeye Steak 14oz',
        description: 'USDA Prime dry-aged ribeye served with roasted garlic & herb butter',
        imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600',
        basePrice: 38.0,
        isAvailable: true,
        isVegetarian: false,
        spiceLevel: 0,
        displayOrder: 2,
      },
      {
        restaurantId: restaurant.id,
        categoryId: catMains.id,
        name: 'Pan-Seared Alaskan Salmon',
        description: 'Wild salmon fillet served over lemon herb risotto & asparagus',
        imageUrl: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=600',
        basePrice: 28.5,
        isAvailable: true,
        isVegetarian: false,
        spiceLevel: 0,
        displayOrder: 3,
      },
      {
        restaurantId: restaurant.id,
        categoryId: catMains.id,
        name: 'Wood-Fired Margherita Pizza',
        description: 'San Marzano tomatoes, Fior di latte mozzarella, fresh basil & EVOO',
        imageUrl: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=600',
        basePrice: 19.0,
        isAvailable: true,
        isVegetarian: true,
        spiceLevel: 0,
        displayOrder: 4,
      },

      // Pastas (KITCHEN)
      {
        restaurantId: restaurant.id,
        categoryId: catPastas.id,
        name: 'Wild Mushroom Truffle Tagliatelle',
        description: 'Handmade pasta, chanterelle mushrooms, black truffle emulsion & pecorino',
        imageUrl: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=600',
        basePrice: 24.0,
        isAvailable: true,
        isVegetarian: true,
        spiceLevel: 0,
        displayOrder: 1,
      },
      {
        restaurantId: restaurant.id,
        categoryId: catPastas.id,
        name: 'Maine Lobster Ravioli',
        description: 'Stuffed with fresh lobster meat in a saffron lobster reduction',
        imageUrl: 'https://images.unsplash.com/photo-1587740908075-9e245070dfaa?w=600',
        basePrice: 32.0,
        isAvailable: true,
        isVegetarian: false,
        spiceLevel: 0,
        displayOrder: 2,
      },

      // Cocktails (BAR)
      {
        restaurantId: restaurant.id,
        categoryId: catCocktails.id,
        name: 'Smoked Bourbon Old Fashioned',
        description: 'Aged Kentucky bourbon, Angostura bitters, demerara & smoked orange peel',
        imageUrl: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=600',
        basePrice: 16.0,
        isAvailable: true,
        isVegetarian: true,
        spiceLevel: 0,
        displayOrder: 1,
      },
      {
        restaurantId: restaurant.id,
        categoryId: catCocktails.id,
        name: 'Passionfruit Mezcalita',
        description: 'Oaxacan mezcal, passionfruit puree, fresh lime & tajin chili rim',
        imageUrl: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=600',
        basePrice: 15.0,
        isAvailable: true,
        isVegetarian: true,
        spiceLevel: 1,
        displayOrder: 2,
      },

      // Beverages (BAR)
      {
        restaurantId: restaurant.id,
        categoryId: catBeverages.id,
        name: 'Napa Valley Cabernet Sauvignon',
        description: 'Full-bodied red with notes of dark blackberry, cassis & cedar',
        imageUrl: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=600',
        basePrice: 15.0,
        isAvailable: true,
        isVegetarian: true,
        spiceLevel: 0,
        displayOrder: 1,
      },
      {
        restaurantId: restaurant.id,
        categoryId: catBeverages.id,
        name: 'Peroni Nastro Azzurro Draught',
        description: 'Crisp, refreshing Italian premium lager (Pint)',
        imageUrl: 'https://images.unsplash.com/photo-1608270192799-a6813fb82559?w=600',
        basePrice: 8.0,
        isAvailable: true,
        isVegetarian: true,
        spiceLevel: 0,
        displayOrder: 2,
      },

      // Desserts (KITCHEN)
      {
        restaurantId: restaurant.id,
        categoryId: catDesserts.id,
        name: 'Belgian Chocolate Lava Cake',
        description: 'Warm molten dark chocolate center served with Madagascar vanilla gelato',
        imageUrl: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=600',
        basePrice: 12.0,
        isAvailable: true,
        isVegetarian: true,
        spiceLevel: 0,
        displayOrder: 1,
      },
    ]).returning();

    if (!itemBurger || !itemSteak || !itemSalmon || !itemOldFashioned || !itemFries || !itemPizza || !itemTagliatelle || !itemMezcalita || !itemWine || !itemBeer || !itemCalamari || !itemLavaCake) {
      throw new Error('Failed to create menu items');
    }

    // 7C. Modifier Groups & Modifiers
    // Burger Modifiers
    const [modGroupPatty] = await db.insert(schema.modifierGroups).values({
      menuItemId: itemBurger.id,
      name: 'Patty Style',
      isRequired: false,
      minSelect: 0,
      maxSelect: 1,
    }).returning();
    if (modGroupPatty) {
      await db.insert(schema.modifiers).values([
        { modifierGroupId: modGroupPatty.id, name: 'Single Patty', priceDelta: 0.0 },
        { modifierGroupId: modGroupPatty.id, name: 'Double Patty', priceDelta: 4.0 },
      ]);
    }

    const [modGroupCheese] = await db.insert(schema.modifierGroups).values({
      menuItemId: itemBurger.id,
      name: 'Cheese Selection',
      isRequired: false,
      minSelect: 0,
      maxSelect: 1,
    }).returning();
    if (modGroupCheese) {
      await db.insert(schema.modifiers).values([
        { modifierGroupId: modGroupCheese.id, name: 'Sharp Cheddar', priceDelta: 0.0 },
        { modifierGroupId: modGroupCheese.id, name: 'Aged Swiss', priceDelta: 1.0 },
        { modifierGroupId: modGroupCheese.id, name: 'Vegan Cheddar', priceDelta: 1.5 },
      ]);
    }

    // Steak Modifiers (Required cooking temperature)
    const [modGroupTemp] = await db.insert(schema.modifierGroups).values({
      menuItemId: itemSteak.id,
      name: 'Cooking Temperature',
      isRequired: true,
      minSelect: 1,
      maxSelect: 1,
    }).returning();
    if (modGroupTemp) {
      await db.insert(schema.modifiers).values([
        { modifierGroupId: modGroupTemp.id, name: 'Rare', priceDelta: 0.0 },
        { modifierGroupId: modGroupTemp.id, name: 'Medium Rare', priceDelta: 0.0 },
        { modifierGroupId: modGroupTemp.id, name: 'Medium', priceDelta: 0.0 },
        { modifierGroupId: modGroupTemp.id, name: 'Medium Well', priceDelta: 0.0 },
        { modifierGroupId: modGroupTemp.id, name: 'Well Done', priceDelta: 0.0 },
      ]);
    }

    // Cocktail Modifiers
    const [modGroupIce] = await db.insert(schema.modifierGroups).values({
      menuItemId: itemOldFashioned.id,
      name: 'Ice Style',
      isRequired: false,
      minSelect: 0,
      maxSelect: 1,
    }).returning();
    if (modGroupIce) {
      await db.insert(schema.modifiers).values([
        { modifierGroupId: modGroupIce.id, name: 'Large Clear Rock', priceDelta: 0.0 },
        { modifierGroupId: modGroupIce.id, name: 'Crushed Ice', priceDelta: 0.0 },
        { modifierGroupId: modGroupIce.id, name: 'Neat (No Ice)', priceDelta: 0.0 },
      ]);
    }

    // ── 8. Discounts & Promo Codes ───────────────────────────────────────────
    console.log('🏷️ Provisioning Promotional discounts...');
    await db.insert(schema.discounts).values([
      {
        code: 'WELCOME10',
        type: 'PERCENTAGE',
        value: 10.0,
        isActive: true,
        validFrom: new Date(now.getTime() - 86400000),
        validUntil: new Date(now.getTime() + 30 * 86400000),
      },
      {
        code: 'FLAT5',
        type: 'FIXED_AMOUNT',
        value: 5.0,
        isActive: true,
        validFrom: new Date(now.getTime() - 86400000),
        validUntil: new Date(now.getTime() + 30 * 86400000),
      },
      {
        code: 'VIP20',
        type: 'PERCENTAGE',
        value: 20.0,
        isActive: true,
        validFrom: new Date(now.getTime() - 86400000),
        validUntil: new Date(now.getTime() + 30 * 86400000),
      },
      {
        code: 'EXPIRED50',
        type: 'PERCENTAGE',
        value: 50.0,
        isActive: false,
        validFrom: new Date(now.getTime() - 60 * 86400000),
        validUntil: new Date(now.getTime() - 1 * 86400000),
      },
    ]);

    // ── 9. Orders & Line Items (Covering All Lifecycle States with Exact Math)
    console.log('🧾 Creating Orders & Items across all lifecycle states...');

    // Helper to calculate exact tax, service charge, and total
    const calcOrderTotals = (subtotal: number) => {
      const taxAmount = Math.round(subtotal * 0.08 * 100) / 100;
      const serviceCharge = Math.round(subtotal * 0.05 * 100) / 100;
      const totalAmount = Math.round((subtotal + taxAmount + serviceCharge) * 100) / 100;
      return { subtotal, taxAmount, serviceCharge, totalAmount };
    };

    // 9A. ORD-1001 on T-01: status PENDING (Awaiting Waiter Approval)
    // Items: 2x Burger ($52) + 1x Fries ($12) = $64.00
    const o1Totals = calcOrderTotals(64.0);
    const [order1] = await db.insert(schema.orders).values({
      orderNumber: 'ORD-1001',
      branchId: branch.id,
      tableId: t1.id,
      customerId: customerEntity.id,
      tableSessionId: tableSession1.id,
      guestSessionId: guestSession1.id,
      waiterAssignmentId: waiterAssignmentsMap.get(t1.id),
      channel: 'QR_SELF_ORDER',
      status: 'PENDING',
      subtotal: o1Totals.subtotal,
      taxAmount: o1Totals.taxAmount,
      serviceCharge: o1Totals.serviceCharge,
      totalAmount: o1Totals.totalAmount,
      paymentStatus: 'UNPAID',
      acceptanceMode: 'WAITER_APPROVAL',
      guestName: 'Sarah Jenkins',
      specialInstructions: 'Extra napkins and chipotle aioli on the side please',
    }).returning();
    if (!order1) throw new Error('Failed to create order1');

    await db.insert(schema.orderItems).values([
      {
        orderId: order1.id,
        productId: itemBurger.id,
        productNameSnapshot: itemBurger.name,
        unitPrice: 26.0,
        quantity: 2,
        subtotal: 52.0,
        stationType: 'KITCHEN',
        status: 'PENDING',
      },
      {
        orderId: order1.id,
        productId: itemFries.id,
        productNameSnapshot: itemFries.name,
        unitPrice: 12.0,
        quantity: 1,
        subtotal: 12.0,
        stationType: 'KITCHEN',
        status: 'PENDING',
      },
    ]);

    // 9B. ORD-1002 on T-03: status PREPARING (Cooking in Kitchen & Bar)
    // Items: 1x Steak ($38) + 1x Salmon ($28.50) + 2x Old Fashioned ($32) = $98.50
    const o2Totals = calcOrderTotals(98.5);
    const [order2] = await db.insert(schema.orders).values({
      orderNumber: 'ORD-1002',
      branchId: branch.id,
      tableId: t3.id,
      tableSessionId: tableSession3.id,
      guestSessionId: guestSession3Host.id,
      waiterAssignmentId: waiterAssignmentsMap.get(t3.id),
      channel: 'QR_SELF_ORDER',
      status: 'PREPARING',
      acceptedById: waiterStaff.id,
      acceptedAt: new Date(now.getTime() - 25 * 60 * 1000),
      subtotal: o2Totals.subtotal,
      taxAmount: o2Totals.taxAmount,
      serviceCharge: o2Totals.serviceCharge,
      totalAmount: o2Totals.totalAmount,
      paymentStatus: 'UNPAID',
      guestName: 'Alex Morgan',
    }).returning();
    if (!order2) throw new Error('Failed to create order2');

    await db.insert(schema.orderItems).values([
      {
        orderId: order2.id,
        productId: itemSteak.id,
        productNameSnapshot: itemSteak.name,
        unitPrice: 38.0,
        quantity: 1,
        subtotal: 38.0,
        stationType: 'KITCHEN',
        status: 'PREPARING',
        preparingAt: new Date(now.getTime() - 20 * 60 * 1000),
      },
      {
        orderId: order2.id,
        productId: itemSalmon.id,
        productNameSnapshot: itemSalmon.name,
        unitPrice: 28.5,
        quantity: 1,
        subtotal: 28.5,
        stationType: 'KITCHEN',
        status: 'PREPARING',
        preparingAt: new Date(now.getTime() - 20 * 60 * 1000),
      },
      {
        orderId: order2.id,
        productId: itemOldFashioned.id,
        productNameSnapshot: itemOldFashioned.name,
        unitPrice: 16.0,
        quantity: 2,
        subtotal: 32.0,
        stationType: 'BAR',
        status: 'PREPARING',
        preparingAt: new Date(now.getTime() - 20 * 60 * 1000),
      },
    ]);

    // 9C. ORD-1003 on T-06: status READY (Plated & ready for Waiter pickup)
    // Items: 1x Tagliatelle ($24) + 1x Mezcalita ($15) = $39.00
    const o3Totals = calcOrderTotals(39.0);
    const [order3] = await db.insert(schema.orders).values({
      orderNumber: 'ORD-1003',
      branchId: branch.id,
      tableId: t6.id,
      tableSessionId: tableSession6.id,
      guestSessionId: guestSession6.id,
      waiterAssignmentId: waiterAssignmentsMap.get(t6.id),
      channel: 'DINE_IN',
      status: 'READY',
      acceptedById: waiterStaff.id,
      acceptedAt: new Date(now.getTime() - 35 * 60 * 1000),
      subtotal: o3Totals.subtotal,
      taxAmount: o3Totals.taxAmount,
      serviceCharge: o3Totals.serviceCharge,
      totalAmount: o3Totals.totalAmount,
      paymentStatus: 'UNPAID',
      guestName: 'Emily Blunt',
    }).returning();
    if (!order3) throw new Error('Failed to create order3');

    await db.insert(schema.orderItems).values([
      {
        orderId: order3.id,
        productId: itemTagliatelle.id,
        productNameSnapshot: itemTagliatelle.name,
        unitPrice: 24.0,
        quantity: 1,
        subtotal: 24.0,
        stationType: 'KITCHEN',
        status: 'READY',
        preparingAt: new Date(now.getTime() - 30 * 60 * 1000),
        readyAt: new Date(now.getTime() - 5 * 60 * 1000),
      },
      {
        orderId: order3.id,
        productId: itemMezcalita.id,
        productNameSnapshot: itemMezcalita.name,
        unitPrice: 15.0,
        quantity: 1,
        subtotal: 15.0,
        stationType: 'BAR',
        status: 'READY',
        preparingAt: new Date(now.getTime() - 30 * 60 * 1000),
        readyAt: new Date(now.getTime() - 8 * 60 * 1000),
      },
    ]);

    // 9D. ORD-1004 on T-04: status SERVED (Multi-Guest Tab, Ready for Cashier Checkout)
    // Items: Steak ($38) + Steak ($38) + Salmon ($28.50) + 3x Cocktails ($48) + 2x Lava Cake ($24) + Calamari ($16) = $192.50
    const o4Totals = calcOrderTotals(192.5);
    const [order4] = await db.insert(schema.orders).values({
      orderNumber: 'ORD-1004',
      branchId: branch.id,
      tableId: t4.id,
      tableSessionId: tableSession4.id,
      guestSessionId: guestSession4Host.id,
      waiterAssignmentId: waiterAssignmentsMap.get(t4.id),
      channel: 'QR_SELF_ORDER',
      status: 'SERVED',
      acceptedById: waiterStaff.id,
      acceptedAt: new Date(now.getTime() - 75 * 60 * 1000),
      subtotal: o4Totals.subtotal,
      taxAmount: o4Totals.taxAmount,
      serviceCharge: o4Totals.serviceCharge,
      totalAmount: o4Totals.totalAmount,
      paymentStatus: 'PARTIALLY_PAID',
      amountPaid: 45.0,
      guestName: 'Michael Scott',
    }).returning();
    if (!order4) throw new Error('Failed to create order4');

    const [, order4ItemSteak2] = await db.insert(schema.orderItems).values([
      // Michael ordered Steak
      {
        orderId: order4.id,
        productId: itemSteak.id,
        productNameSnapshot: itemSteak.name,
        unitPrice: 38.0,
        quantity: 1,
        subtotal: 38.0,
        stationType: 'KITCHEN',
        status: 'SERVED',
        servedAt: new Date(now.getTime() - 30 * 60 * 1000),
      },
      // Dwight ordered Steak
      {
        orderId: order4.id,
        productId: itemSteak.id,
        productNameSnapshot: itemSteak.name,
        unitPrice: 38.0,
        quantity: 1,
        subtotal: 38.0,
        stationType: 'KITCHEN',
        status: 'SERVED',
        servedAt: new Date(now.getTime() - 30 * 60 * 1000),
      },
      // Jim ordered Salmon
      {
        orderId: order4.id,
        productId: itemSalmon.id,
        productNameSnapshot: itemSalmon.name,
        unitPrice: 28.5,
        quantity: 1,
        subtotal: 28.5,
        stationType: 'KITCHEN',
        status: 'SERVED',
        servedAt: new Date(now.getTime() - 30 * 60 * 1000),
      },
      // 3x Cocktails shared
      {
        orderId: order4.id,
        productId: itemOldFashioned.id,
        productNameSnapshot: itemOldFashioned.name,
        unitPrice: 16.0,
        quantity: 3,
        subtotal: 48.0,
        stationType: 'BAR',
        status: 'SERVED',
        servedAt: new Date(now.getTime() - 40 * 60 * 1000),
      },
      // 2x Desserts
      {
        orderId: order4.id,
        productId: itemLavaCake.id,
        productNameSnapshot: itemLavaCake.name,
        unitPrice: 12.0,
        quantity: 2,
        subtotal: 24.0,
        stationType: 'KITCHEN',
        status: 'SERVED',
        servedAt: new Date(now.getTime() - 20 * 60 * 1000),
      },
      // 1x Calamari starter
      {
        orderId: order4.id,
        productId: itemCalamari.id,
        productNameSnapshot: itemCalamari.name,
        unitPrice: 16.0,
        quantity: 1,
        subtotal: 16.0,
        stationType: 'KITCHEN',
        status: 'SERVED',
        servedAt: new Date(now.getTime() - 55 * 60 * 1000),
      },
    ]).returning();

    // 9E. ORD-1005 on T-04: status CONFIRMED (Second round of beers)
    // Items: 2x Beer ($16.00) = $16.00
    const o5Totals = calcOrderTotals(16.0);
    const [order5] = await db.insert(schema.orders).values({
      orderNumber: 'ORD-1005',
      branchId: branch.id,
      tableId: t4.id,
      tableSessionId: tableSession4.id,
      guestSessionId: guestSession4Dwight.id,
      waiterAssignmentId: waiterAssignmentsMap.get(t4.id),
      channel: 'QR_SELF_ORDER',
      status: 'CONFIRMED',
      acceptanceMode: 'AUTO_ACCEPT',
      acceptedById: waiterStaff.id,
      acceptedAt: new Date(now.getTime() - 15 * 60 * 1000),
      subtotal: o5Totals.subtotal,
      taxAmount: o5Totals.taxAmount,
      serviceCharge: o5Totals.serviceCharge,
      totalAmount: o5Totals.totalAmount,
      paymentStatus: 'UNPAID',
      guestName: 'Dwight Schrute',
    }).returning();
    if (!order5) throw new Error('Failed to create order5');

    await db.insert(schema.orderItems).values([
      {
        orderId: order5.id,
        productId: itemBeer.id,
        productNameSnapshot: itemBeer.name,
        unitPrice: 8.0,
        quantity: 2,
        subtotal: 16.0,
        stationType: 'BAR',
        status: 'PENDING',
      },
    ]);

    // 9F. ORD-1006 on T-02: status COMPLETED (Historical settled order)
    // Items: 1x Pizza ($19) + 1x Calamari ($16) + 1x Wine ($15) = $50.00
    const o6Totals = calcOrderTotals(50.0);
    const [order6] = await db.insert(schema.orders).values({
      orderNumber: 'ORD-1006',
      branchId: branch.id,
      tableId: t2.id,
      customerId: customerEntity2.id,
      waiterAssignmentId: waiterAssignmentsMap.get(t2.id),
      channel: 'DINE_IN',
      status: 'COMPLETED',
      acceptedById: waiterStaff.id,
      acceptedAt: new Date(now.getTime() - 180 * 60 * 1000),
      subtotal: o6Totals.subtotal,
      taxAmount: o6Totals.taxAmount,
      serviceCharge: o6Totals.serviceCharge,
      tipAmount: 8.0,
      totalAmount: o6Totals.totalAmount,
      amountPaid: Math.round((o6Totals.totalAmount + 8.0) * 100) / 100,
      paymentStatus: 'PAID',
      guestName: 'John Doe',
    }).returning();
    if (!order6) throw new Error('Failed to create order6');

    const [order6ItemPizza, order6ItemCalamari, order6ItemWine] = await db.insert(schema.orderItems).values([
      {
        orderId: order6.id,
        productId: itemPizza.id,
        productNameSnapshot: itemPizza.name,
        unitPrice: 19.0,
        quantity: 1,
        subtotal: 19.0,
        stationType: 'KITCHEN',
        status: 'SERVED',
        servedAt: new Date(now.getTime() - 140 * 60 * 1000),
      },
      {
        orderId: order6.id,
        productId: itemCalamari.id,
        productNameSnapshot: itemCalamari.name,
        unitPrice: 16.0,
        quantity: 1,
        subtotal: 16.0,
        stationType: 'KITCHEN',
        status: 'SERVED',
        servedAt: new Date(now.getTime() - 150 * 60 * 1000),
      },
      {
        orderId: order6.id,
        productId: itemWine.id,
        productNameSnapshot: itemWine.name,
        unitPrice: 15.0,
        quantity: 1,
        subtotal: 15.0,
        stationType: 'BAR',
        status: 'SERVED',
        servedAt: new Date(now.getTime() - 160 * 60 * 1000),
      },
    ]).returning();

    // 9G. ORD-1007 on T-05: status REJECTED (Rejected by Waiter due to Kitchen Capacity)
    // Items: 1x Steak ($38.00)
    const o7Totals = calcOrderTotals(38.0);
    const [order7] = await db.insert(schema.orders).values({
      orderNumber: 'ORD-1007',
      branchId: branch.id,
      tableId: t5.id,
      tableSessionId: tableSession5.id,
      guestSessionId: guestSession5.id,
      waiterAssignmentId: waiterAssignmentsMap.get(t5.id),
      channel: 'QR_SELF_ORDER',
      status: 'REJECTED',
      rejectedById: waiterStaff.id,
      rejectedAt: new Date(now.getTime() - 8 * 60 * 1000),
      rejectionReasonCode: 'KITCHEN_CAPACITY',
      rejectionReason: 'Kitchen currently at maximum rush capacity. Please retry in 15 minutes.',
      subtotal: o7Totals.subtotal,
      taxAmount: o7Totals.taxAmount,
      serviceCharge: o7Totals.serviceCharge,
      totalAmount: o7Totals.totalAmount,
      paymentStatus: 'UNPAID',
      guestName: 'John Doe',
    }).returning();
    if (!order7) throw new Error('Failed to create order7');

    await db.insert(schema.orderItems).values([
      {
        orderId: order7.id,
        productId: itemSteak.id,
        productNameSnapshot: itemSteak.name,
        unitPrice: 38.0,
        quantity: 1,
        subtotal: 38.0,
        stationType: 'KITCHEN',
        status: 'CANCELLED',
        unavailableReason: 'Kitchen at maximum rush capacity',
      },
    ]);

    // 9H. ORD-1008 on T-01: status CANCELLED (Cancelled pre-preparation)
    // Items: 1x Calamari ($16.00)
    const o8Totals = calcOrderTotals(16.0);
    const [order8] = await db.insert(schema.orders).values({
      orderNumber: 'ORD-1008',
      branchId: branch.id,
      tableId: t1.id,
      tableSessionId: tableSession1.id,
      guestSessionId: guestSession1.id,
      waiterAssignmentId: waiterAssignmentsMap.get(t1.id),
      channel: 'QR_SELF_ORDER',
      status: 'CANCELLED',
      subtotal: o8Totals.subtotal,
      taxAmount: o8Totals.taxAmount,
      serviceCharge: o8Totals.serviceCharge,
      totalAmount: o8Totals.totalAmount,
      paymentStatus: 'UNPAID',
      specialInstructions: 'Customer changed mind before kitchen confirmed',
    }).returning();
    if (!order8) throw new Error('Failed to create order8');

    await db.insert(schema.orderItems).values([
      {
        orderId: order8.id,
        productId: itemCalamari.id,
        productNameSnapshot: itemCalamari.name,
        unitPrice: 16.0,
        quantity: 1,
        subtotal: 16.0,
        stationType: 'KITCHEN',
        status: 'CANCELLED',
      },
    ]);

    // ── 10. Billing, Payments & Split-Bill Allocations ───────────────────────
    console.log('💳 Generating Settled Payments & Split-Bill Allocations...');

    // Payment 1: Full Card Settlement for Order 1006 (Total: $56.50 + $8 tip)
    const [payment1] = await db.insert(schema.payments).values({
      orderId: order6.id,
      scope: 'ORDER',
      amount: order6.totalAmount,
      tipAmount: 8.0,
      method: 'CARD',
      status: 'PAID',
      transactionRef: 'ch_live_test_card_1006',
      paidAt: new Date(now.getTime() - 110 * 60 * 1000),
      settledById: cashierStaff.id,
      collectedById: cashierStaff.id,
    }).returning();
    if (!payment1) throw new Error('Failed to create payment1');
    if (order6ItemPizza && order6ItemCalamari && order6ItemWine) {
      // Pro-rata allocations satisfying sum(allocations) === payment.amount ($56.50)
      await db.insert(schema.paymentAllocations).values([
        { paymentId: payment1.id, orderId: order6.id, orderItemId: order6ItemPizza.id, amount: 21.47 },
        { paymentId: payment1.id, orderId: order6.id, orderItemId: order6ItemCalamari.id, amount: 18.08 },
        { paymentId: payment1.id, orderId: order6.id, orderItemId: order6ItemWine.id, amount: 16.95 },
      ]);
    }

    // Payment 2: Cash Settlement for Dwight's split on Table 4 ($45.00 cash)
    const [payment2] = await db.insert(schema.payments).values({
      orderId: order4.id,
      tableSessionId: tableSession4.id,
      payerGuestSessionId: guestSession4Dwight.id,
      scope: 'GUEST_SESSION',
      amount: 45.0,
      tipAmount: 5.0,
      method: 'CASH',
      status: 'PAID',
      transactionRef: 'cash_reg_tx_002',
      paidAt: new Date(now.getTime() - 10 * 60 * 1000),
      settledById: cashierStaff.id,
      collectedById: cashierStaff.id,
    }).returning();
    if (!payment2) throw new Error('Failed to create payment2');
    if (order4ItemSteak2) {
      await db.insert(schema.paymentAllocations).values([
        { paymentId: payment2.id, orderId: order4.id, orderItemId: order4ItemSteak2.id, amount: 45.0 },
      ]);
    }

    // Payment 3: Online Stripe PaymentIntent (matches STRIPE.md architecture)
    await db.insert(schema.payments).values({
      orderId: order2.id,
      tableSessionId: tableSession3.id,
      payerGuestSessionId: guestSession3Host.id,
      scope: 'ORDER',
      amount: order2.totalAmount,
      tipAmount: 15.0,
      method: 'ONLINE_GATEWAY',
      status: 'UNPAID',
      transactionRef: 'pi_3Mv_test_online_gateway_intent',
    });

    // ── 11. Reservations ─────────────────────────────────────────────────────
    console.log('📅 Scheduling Branch Table Reservations...');
    await db.insert(schema.reservations).values([
      {
        branchId: branch.id,
        tableId: p3.id,
        guestName: 'Eleanor Vance',
        guestPhone: '+1 (555) 777-1234',
        partySize: 4,
        reservedFor: new Date(now.getTime() + 4 * 3600 * 1000), // Today evening
        durationMins: 120,
        status: 'CONFIRMED',
        specialRequest: 'Patio table with outdoor heater preferred',
      },
      {
        branchId: branch.id,
        tableId: t2.id,
        guestName: 'Arthur Dent',
        guestPhone: '+1 (555) 777-5678',
        partySize: 2,
        reservedFor: new Date(now.getTime() + 26 * 3600 * 1000), // Tomorrow
        durationMins: 90,
        status: 'PENDING',
        specialRequest: 'Quiet anniversary table',
      },
      {
        branchId: branch.id,
        tableId: t5.id,
        guestName: 'John Doe',
        guestPhone: '+1 (555) 888-9900',
        partySize: 2,
        reservedFor: new Date(now.getTime() - 20 * 60 * 1000),
        durationMins: 90,
        status: 'SEATED',
      },
      {
        branchId: branch.id,
        guestName: 'Robert Langdon',
        guestPhone: '+1 (555) 999-0011',
        partySize: 6,
        reservedFor: new Date(now.getTime() - 48 * 3600 * 1000),
        status: 'CANCELLED',
      },
    ]);

    // ── 12. Work Shifts & Staff Attendance ───────────────────────────────────
    console.log('⏰ Scheduling Work Shifts & Attendance logs...');
    const todayDateStr = now.toISOString().split('T')[0]!;
    await db.insert(schema.workShifts).values([
      {
        branchId: branch.id,
        staffAssignmentId: waiterAssignment.id,
        name: 'Morning / Lunch Service',
        startTime: new Date(now.getTime() - 4 * 3600 * 1000),
        endTime: new Date(now.getTime() + 4 * 3600 * 1000),
        date: todayDateStr,
        status: 'ACTIVE',
        checkInAt: new Date(now.getTime() - 4 * 3600 * 1000 + 5 * 60 * 1000),
        createdById: managerStaff.id,
      },
      {
        branchId: branch.id,
        staffAssignmentId: kitchenAssignment.id,
        name: 'All-Day Kitchen Brigade',
        startTime: new Date(now.getTime() - 5 * 3600 * 1000),
        endTime: new Date(now.getTime() + 5 * 3600 * 1000),
        date: todayDateStr,
        status: 'ACTIVE',
        checkInAt: new Date(now.getTime() - 5 * 3600 * 1000 + 10 * 60 * 1000),
        createdById: managerStaff.id,
      },
      {
        branchId: branch.id,
        staffAssignmentId: bartenderAssignment.id,
        name: 'Evening Bar & Lounge',
        startTime: new Date(now.getTime() - 2 * 3600 * 1000),
        endTime: new Date(now.getTime() + 6 * 3600 * 1000),
        date: todayDateStr,
        status: 'ACTIVE',
        checkInAt: new Date(now.getTime() - 2 * 3600 * 1000 + 2 * 60 * 1000),
        createdById: managerStaff.id,
      },
      {
        branchId: branch.id,
        staffAssignmentId: cashierAssignment.id,
        name: 'Main POS Register Shift',
        startTime: new Date(now.getTime() - 3 * 3600 * 1000),
        endTime: new Date(now.getTime() + 5 * 3600 * 1000),
        date: todayDateStr,
        status: 'ACTIVE',
        checkInAt: new Date(now.getTime() - 3 * 3600 * 1000 + 1 * 60 * 1000),
        createdById: managerStaff.id,
      },
    ]);

    // ── 13. Suppliers & Inventory (With Low-Stock Alert trigger) ─────────────
    console.log('📦 Setting up Suppliers & Inventory (with low-stock alert item)...');
    const [supplierFarms] = await db.insert(schema.suppliers).values({
      branchId: branch.id,
      name: 'Fresh Farms Organic',
      contactName: 'John Miller',
      email: 'orders@freshfarms.example',
      phone: '+1 (555) 888-9999',
      address: '100 Farmer Way, Ruralville, NY',
      isActive: true,
    }).returning();
    if (!supplierFarms) throw new Error('Failed to create supplierFarms');

    const [supplierBeverage] = await db.insert(schema.suppliers).values({
      branchId: branch.id,
      name: 'Empire Beverage & Spirits',
      contactName: 'Marco Rossi',
      email: 'sales@empirebev.example',
      phone: '+1 (555) 777-6655',
      address: '45 Industrial Pkwy, Queens, NY',
      isActive: true,
    }).returning();
    if (!supplierBeverage) throw new Error('Failed to create supplierBeverage');

    const [invCatMeat] = await db.insert(schema.inventoryCategories).values({
      branchId: branch.id,
      name: 'Meats & Poultry',
      description: 'Prime cut steaks, burger blends and poultry',
    }).returning();

    const [invCatProduce] = await db.insert(schema.inventoryCategories).values({
      branchId: branch.id,
      name: 'Produce & Dry Goods',
      description: 'Fresh vegetables, oils, and dry goods',
    }).returning();

    const [invCatBar] = await db.insert(schema.inventoryCategories).values({
      branchId: branch.id,
      name: 'Bar Spirits & Wines',
      description: 'Bourbon, mezcal, wines, and craft syrups',
    }).returning();

    if (!invCatMeat || !invCatProduce || !invCatBar) {
      throw new Error('Failed to create inventory categories');
    }

    await db.insert(schema.inventoryItems).values([
      {
        branchId: branch.id,
        supplierId: supplierFarms.id,
        categoryId: invCatMeat.id,
        name: 'Prime Angus Beef (Ribeye)',
        sku: 'MEAT-BEEF-001',
        unit: 'KG',
        currentStock: 28.5,
        lowStockThreshold: 10.0,
        costPerUnit: 18.5,
        isActive: true,
      },
      {
        branchId: branch.id,
        supplierId: supplierFarms.id,
        categoryId: invCatProduce.id,
        name: 'Idaho Russet Potatoes',
        sku: 'VEG-POTA-002',
        unit: 'KG',
        currentStock: 65.0,
        lowStockThreshold: 20.0,
        costPerUnit: 1.25,
        isActive: true,
      },
      {
        branchId: branch.id,
        supplierId: supplierBeverage.id,
        categoryId: invCatBar.id,
        name: 'Kentucky Straight Bourbon',
        sku: 'BAR-BOUR-003',
        unit: 'PIECE',
        currentStock: 18.0,
        lowStockThreshold: 5.0,
        costPerUnit: 24.0,
        isActive: true,
      },
      // Low Stock Item: Truffle Oil (Stock 1.2 < Threshold 2.5) -> Triggers Alert!
      {
        branchId: branch.id,
        supplierId: supplierFarms.id,
        categoryId: invCatProduce.id,
        name: 'Italian White Truffle Oil',
        sku: 'OIL-TRUF-004',
        unit: 'LITER',
        currentStock: 1.2,
        lowStockThreshold: 2.5,
        costPerUnit: 48.0,
        isActive: true,
      },
    ]);

    // ── 14. Persistent Notifications Subsystem ──────────────────────────────
    console.log('🔔 Populating Role-Targeted & User-Targeted Persistent Notifications...');
    await db.insert(schema.notifications).values([
      // Waiter notifications
      {
        branchId: branch.id,
        targetRole: 'WAITER',
        type: 'ORDER_READY',
        title: 'Order Ready for Service',
        message: 'Table T-06: Wild Mushroom Tagliatelle & Mezcalita are ready for pickup.',
        entityType: 'Order',
        entityId: order3.id,
        isRead: false,
        metadata: { tableNumber: 'T-06', orderNumber: 'ORD-1003' },
      },
      {
        branchId: branch.id,
        targetRole: 'WAITER',
        type: 'WAITER_CALL',
        title: 'Customer Requested Assistance',
        message: 'Table T-04: Guest requested water refill & extra napkins.',
        entityType: 'Table',
        entityId: t4.id,
        isRead: false,
        metadata: { tableNumber: 'T-04' },
      },
      {
        branchId: branch.id,
        targetRole: 'WAITER',
        type: 'ORDER_CREATED',
        title: 'New Order Received',
        message: 'Table T-01 placed Order ORD-1001 awaiting your approval.',
        entityType: 'Order',
        entityId: order1.id,
        isRead: true,
        readAt: new Date(now.getTime() - 20 * 60 * 1000),
      },

      // Kitchen notification
      {
        branchId: branch.id,
        targetRole: 'KITCHEN_STAFF',
        type: 'ORDER_CREATED',
        title: 'New Kitchen Ticket',
        message: 'Order ORD-1002 has 2 signature mains queued for cooking.',
        entityType: 'Order',
        entityId: order2.id,
        isRead: false,
      },

      // Bartender notification
      {
        branchId: branch.id,
        targetRole: 'BARTENDER',
        type: 'ORDER_CREATED',
        title: 'New Bar Ticket',
        message: 'Order ORD-1002 has 2 Smoked Old Fashioned cocktails queued.',
        entityType: 'Order',
        entityId: order2.id,
        isRead: false,
      },

      // Cashier notifications
      {
        branchId: branch.id,
        targetRole: 'CASHIER',
        type: 'BILL_REQUESTED',
        title: 'Bill Settlement Requested',
        message: `Table T-04 requested the bill. Remaining balance: $${Math.round((order4.totalAmount - (order4.amountPaid || 0)) * 100) / 100}.`,
        entityType: 'Order',
        entityId: order4.id,
        isRead: false,
        metadata: { tableNumber: 'T-04', orderNumber: 'ORD-1004', balance: 172.53 },
      },
      {
        branchId: branch.id,
        targetRole: 'CASHIER',
        type: 'PAYMENT_RECEIVED',
        title: 'Payment Confirmed',
        message: 'Card payment of $56.50 (+ $8 tip) settled for Order ORD-1006.',
        entityType: 'Order',
        entityId: order6.id,
        isRead: true,
        readAt: new Date(now.getTime() - 100 * 60 * 1000),
      },

      // Manager notifications
      {
        branchId: branch.id,
        targetRole: 'BRANCH_MANAGER',
        type: 'LOW_STOCK_ALERT',
        title: 'Low Inventory Warning',
        message: 'Italian White Truffle Oil is below threshold (1.2 / 2.5 L remaining).',
        entityType: 'InventoryItem',
        isRead: false,
      },
      {
        branchId: branch.id,
        targetRole: 'BRANCH_MANAGER',
        type: 'DAILY_SUMMARY',
        title: 'Shift Opening Confirmed',
        message: 'Morning shift opening roster verified for Downtown HQ.',
        isRead: true,
        readAt: new Date(now.getTime() - 200 * 60 * 1000),
      },
    ]);

    // ── 15. Customer Reviews & Ratings ───────────────────────────────────────
    console.log('⭐ Recording Customer Order Reviews & Ratings...');
    await db.insert(schema.orderReviews).values([
      {
        orderId: order6.id,
        customerId: customerEntity2.id,
        rating: 5,
        comment: 'Best wood-fired pizza and wine pairing in the city! QR ordering was super fast.',
        isApproved: true,
      },
      {
        orderId: order4.id,
        customerId: customerEntity.id,
        rating: 5,
        comment: 'Prime ribeye was cooked to absolute perfection. Loved the smoked cocktail!',
        isApproved: false, // Pending manager moderation queue
      },
    ]);

    // ── 16. Authentication & Password Reset OTPs ─────────────────────────────
    console.log('🔑 Provisioning Table Auth & Password Reset test OTPs...');
    await db.insert(schema.tableAuthOtps).values([
      {
        contact: 'customer@tavonza.ai',
        tableId: t1.id,
        tableSessionId: tableSession1.id,
        purpose: 'TABLE_AUTH',
        otp: '12345',
        expiresAt: new Date(now.getTime() + 24 * 3600 * 1000),
        verified: true,
      },
      {
        contact: '+1 (555) 777-8899',
        tableId: t2.id,
        purpose: 'TABLE_AUTH',
        otp: '54321',
        expiresAt: new Date(now.getTime() + 24 * 3600 * 1000),
        verified: false, // For testing live OTP verification flow
      },
    ]);

    await db.insert(schema.passwordResetOtps).values([
      {
        email: 'customer@tavonza.ai',
        otp: '12345',
        type: 'password_reset',
        expiresAt: new Date(now.getTime() + 24 * 3600 * 1000),
      },
    ]);

    // ── 17. Audit Logs & Status Change Logs ──────────────────────────────────
    console.log('📝 Logging Status transitions and operational audit entries...');
    await db.insert(schema.statusChangeLogs).values([
      {
        orderId: order2.id,
        previousStatus: 'PENDING',
        newStatus: 'PREPARING',
        changedById: waiterUser.id,
        note: 'Order approved and routed to Kitchen and Bar production stations',
      },
      {
        orderId: order3.id,
        previousStatus: 'PREPARING',
        newStatus: 'READY',
        changedById: kitchenUser.id,
        note: 'Dishes and drinks prepared, plated, and staged at pass for pickup',
      },
      {
        orderId: order6.id,
        previousStatus: 'SERVED',
        newStatus: 'COMPLETED',
        changedById: cashierUser.id,
        note: 'Payment settled in full and receipt issued',
      },
      {
        orderId: order7.id,
        previousStatus: 'PENDING',
        newStatus: 'REJECTED',
        changedById: waiterUser.id,
        note: 'Order rejected due to kitchen peak capacity rush',
      },
    ]);

    // Order item timeline logs
    const [steakItemOrder2] = await db.select().from(schema.orderItems).where(drizzleOrmEq(schema.orderItems.orderId, order2.id));
    if (steakItemOrder2) {
      await db.insert(schema.orderItemStatusChangeLogs).values([
        {
          orderItemId: steakItemOrder2.id,
          previousStatus: 'PENDING',
          newStatus: 'PREPARING',
          changedById: kitchenUser.id,
          note: 'Started preparation on grill',
        },
      ]);
    }

    await db.insert(schema.auditLogs).values([
      {
        branchId: branch.id,
        actorId: managerUser.id,
        action: 'BRANCH_SETTINGS_UPDATED',
        entityType: 'BranchSettings',
        entityId: branch.id,
        metadata: { update: 'Taxes, tip policy, and split-bill flags verified' },
      },
      {
        branchId: branch.id,
        actorId: waiterUser.id,
        action: 'ORDER_ACCEPTED',
        entityType: 'Order',
        entityId: order2.id,
        metadata: { orderNumber: 'ORD-1002' },
      },
      {
        branchId: branch.id,
        actorId: cashierUser.id,
        action: 'PAYMENT_SETTLED',
        entityType: 'Payment',
        entityId: payment1.id,
        metadata: { method: 'CARD', amount: 56.5, tip: 8.0 },
      },
    ]);

    console.log('\n=================================================================');
    console.log('✅ COMPLETE DATABASE SEEDING FINISHED WITH 100% INTEGRITY!');
    console.log('=================================================================');
    console.log('🏢 MULTI-TENANT TEST BRANCHES:');
    console.log(`  1. Primary Branch: ${branch.name} (ID: ${branch.id})`);
    console.log(`  2. Secondary Branch: ${secondaryBranch.name} (ID: ${secondaryBranch.id})`);
    console.log('-----------------------------------------------------------------');
    console.log('🔑 ALL USER PERSONAS & CREDENTIALS:');
    console.log('  • Super Admin:     superadmin@tavonza.ai   Password: SuperAdmin@1234');
    console.log('  • Restaurant Owner: owner@tavonza.ai        Password: Owner@1234');
    console.log('  • Branch Manager:  manager@tavonza.ai      Password: Manager@1234');
    console.log('  • Waiter:          waiter@tavonza.ai       Password: Waiter@1234');
    console.log('  • Kitchen Chef:    kitchen@tavonza.ai      Password: Kitchen@1234');
    console.log('  • Bartender:       bartender@tavonza.ai    Password: Bartender@1234');
    console.log('  • Cashier:         cashier@tavonza.ai      Password: Cashier@1234');
    console.log('  • Host:            host@tavonza.ai         Password: Host@1234');
    console.log('  • Customer:        customer@tavonza.ai     Password: Customer@1234');
    console.log('-----------------------------------------------------------------');
    console.log('📱 DIRECT CUSTOMER QR URLS (Port 3100):');
    console.log('  • Table T-01 (Ordering):    http://localhost:3100/?qr=qr_tok_dt_t01');
    console.log('  • Table T-02 (Available):   http://localhost:3100/?qr=qr_tok_dt_t02');
    console.log('  • Table T-03 (Preparing):   http://localhost:3100/?qr=qr_tok_dt_t03');
    console.log('  • Table T-04 (Bill Split):  http://localhost:3100/?qr=qr_tok_dt_t04');
    console.log('  • Table T-06 (Serving):     http://localhost:3100/?qr=qr_tok_dt_t06');
    console.log('  • Table P-01 (Patio):       http://localhost:3100/?qr=qr_tok_dt_p01');
    console.log('=================================================================\n');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
};

runSeed();
