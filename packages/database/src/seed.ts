import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(__dirname, '../../../.env') });
config();

import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

// Verified Argon2 hashes:
const MANAGER_HASH = '$argon2id$v=19$m=65536,p=4,t=3$vN2/ffOGgFgpdkc/ldKWCg$34M5mZ/9G3vK+CWIdWGus9V54JDFrs6jgmzKAYfQWgo'; // Manager@1234
const CUSTOMER_HASH = '$argon2id$v=19$m=65536,p=4,t=3$9xEReGfA9T3slHzmViaBSg$kz6uShvGNyojbnI1zxHzWMWhfoG5FHQluhh0OdC+CaY'; // Customer@1234
const WAITER_HASH = '$argon2id$v=19$m=65536,p=4,t=3$c0hP1AzgorMwvVdiAlbWoA$XCcQ75wlaCXI9HBWtMRsz7IQ/ohHnJHFhz09mrCzIk8'; // Waiter@1234
const CASHIER_HASH = '$argon2id$v=19$m=65536,p=4,t=3$N+smfOv/2C7f4IxLkj//cQ$p2wRhV/ZlY/t8j2VajXyeII5WKLEhwuTkaDaBwOpAbk'; // Cashier@1234
const KITCHEN_HASH = '$argon2id$v=19$m=65536,p=4,t=3$M1QFcCaN5w11y463r11sUA$QE1aokqs+Lc52Px0Fc5cRRSzkD93abkohhf5MYdL3Bw'; // Kitchen@1234
const OWNER_HASH = '$argon2id$v=19$m=65536,p=4,t=3$TMEkugrsrGzIK/EXRJT8aQ$jKN9rfcenCaEAxrgJGPnomLcyRP7z70GsODVFS0QEX8'; // Owner@1234

export const DEFAULT_BRANCH_ID = 'ce7b4318-5e2e-4fcd-a459-0e1bc80a6f27';

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
    await db.delete(schema.paymentAllocations);
    await db.delete(schema.payments);
    await db.delete(schema.orderReviews);
    await db.delete(schema.orderItems);
    await db.delete(schema.orders);
    await db.delete(schema.discounts);
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
    await db.delete(schema.tables);
    await db.delete(schema.menuItems);
    await db.delete(schema.menuCategories);
    await db.delete(schema.branchOperatingHours);
    await db.delete(schema.branchHolidays);
    await db.delete(schema.branchSettings);
    await db.delete(schema.branches);
    await db.delete(schema.restaurants);
    await db.delete(schema.organizations);
    await db.delete(schema.users);

    // 1. Platform Admin / Owner User
    const [ownerUser] = await db.insert(schema.users).values({
      email: 'owner@tavonza.ai',
      name: 'Platform Owner',
      password: OWNER_HASH,
      role: 'ADMIN',
      status: 'ACTIVE',
    }).returning();
    if (!ownerUser) throw new Error('Failed to create owner user');

    await db.insert(schema.admins).values({
      userId: ownerUser.id,
      intro: 'System Super Administrator',
    });

    await db.insert(schema.owners).values({
      userId: ownerUser.id,
    });

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

    // 4. Branch (using fixed UUID to match frontend DEFAULT_BRANCH_ID)
    const [branch] = await db.insert(schema.branches).values({
      id: DEFAULT_BRANCH_ID,
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

    // 5b. Branch Operating Hours (7 Days Weekly)
    await db.insert(schema.branchOperatingHours).values([
      { branchId: branch.id, dayOfWeek: 1, openTime: '09:00', closeTime: '22:00' }, // Monday
      { branchId: branch.id, dayOfWeek: 2, openTime: '09:00', closeTime: '22:00' }, // Tuesday
      { branchId: branch.id, dayOfWeek: 3, openTime: '09:00', closeTime: '22:00' }, // Wednesday
      { branchId: branch.id, dayOfWeek: 4, openTime: '09:00', closeTime: '22:00' }, // Thursday
      { branchId: branch.id, dayOfWeek: 5, openTime: '09:00', closeTime: '23:00' }, // Friday
      { branchId: branch.id, dayOfWeek: 6, openTime: '08:30', closeTime: '23:30' }, // Saturday
      { branchId: branch.id, dayOfWeek: 0, openTime: '09:00', closeTime: '21:30' }, // Sunday
    ]);

    // 6. Branch Manager User & Assignment
    const [managerUser] = await db.insert(schema.users).values({
      email: 'manager@tavonza.ai',
      name: 'Marcus Vance',
      password: MANAGER_HASH,
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

    const [customerEntity] = await db.insert(schema.customers).values({
      userId: customerUser.id,
      loyaltyPoints: 120,
    }).returning();
    if (!customerEntity) throw new Error('Failed to create customer entity');

    // 8. Waiter User
    const [waiterUser] = await db.insert(schema.users).values({
      email: 'waiter@tavonza.ai',
      name: 'David Chen',
      password: WAITER_HASH,
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
      permissions: ['VIEW_ORDERS', 'UPDATE_ORDER_STATUS', 'MANAGE_TABLES'],
      isActive: true,
    });

    // 9. Cashier User
    const [cashierUser] = await db.insert(schema.users).values({
      email: 'cashier@tavonza.ai',
      name: 'Emma Watson',
      password: CASHIER_HASH,
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
      permissions: ['MANAGE_PAYMENTS', 'VIEW_ORDERS', 'APPLY_DISCOUNTS'],
      isActive: true,
    });

    // 10. Kitchen Staff User
    const [kitchenUser] = await db.insert(schema.users).values({
      email: 'kitchen@tavonza.ai',
      name: 'Chef Gordon',
      password: KITCHEN_HASH,
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
    const createdTables = await db.insert(schema.tables).values([
      { branchId: branch.id, label: 'T-01', capacity: 4, shape: 'SQUARE', serviceStatus: 'OCCUPIED' },
      { branchId: branch.id, label: 'T-02', capacity: 2, shape: 'CIRCLE', serviceStatus: 'AVAILABLE' },
      { branchId: branch.id, label: 'T-03', capacity: 4, shape: 'RECTANGLE', serviceStatus: 'PREPARING' },
      { branchId: branch.id, label: 'T-04', capacity: 6, shape: 'RECTANGLE', serviceStatus: 'PAYMENT_PENDING' },
      { branchId: branch.id, label: 'T-05', capacity: 4, shape: 'CIRCLE', serviceStatus: 'AVAILABLE' },
    ]).returning();

    const [t1, , t3, t4] = createdTables;
    if (!t1 || !t3 || !t4) throw new Error('Failed to create tables');

    // 12. Active Waiter Table Assignments
    const now = new Date();
    const sessionStart = new Date(now.getTime() - 24 * 3600 * 1000);
    const sessionEnd = new Date(now.getTime() + 30 * 24 * 3600 * 1000);

    for (const t of createdTables) {
      await db.insert(schema.waiterTableAssignments).values({
        branchId: branch.id,
        tableId: t.id,
        waiterId: waiterStaff.id,
        assignedById: managerStaff.id,
        sessionStart,
        sessionEnd,
        isActive: true,
      });
    }

    // 13. Table Sessions and Guest Sessions
    // Table 1 Session (Active, party of 2)
    const [tableSession1] = await db.insert(schema.tableSessions).values({
      branchId: branch.id,
      tableId: t1.id,
      partySize: 2,
      status: 'ACTIVE',
      openedByStaffId: waiterStaff.id,
      startedAt: new Date(now.getTime() - 45 * 60 * 1000),
    }).returning();
    if (!tableSession1) throw new Error('Failed to create tableSession1');

    const [guestSession1] = await db.insert(schema.guestSessions).values({
      tableSessionId: tableSession1.id,
      customerId: customerEntity.id,
      displayName: 'Sarah Jenkins',
      isHostGuest: true,
      status: 'ACTIVE',
    }).returning();
    if (!guestSession1) throw new Error('Failed to create guestSession1');

    // Table 3 Session (Active, party of 4)
    const [tableSession3] = await db.insert(schema.tableSessions).values({
      branchId: branch.id,
      tableId: t3.id,
      partySize: 4,
      status: 'ACTIVE',
      openedByStaffId: waiterStaff.id,
      startedAt: new Date(now.getTime() - 60 * 60 * 1000),
    }).returning();
    if (!tableSession3) throw new Error('Failed to create tableSession3');

    const [guestSession3] = await db.insert(schema.guestSessions).values({
      tableSessionId: tableSession3.id,
      displayName: 'Alex Guest',
      isHostGuest: true,
      status: 'ACTIVE',
    }).returning();
    if (!guestSession3) throw new Error('Failed to create guestSession3');

    // Table 4 Session (Bill Requested / Payment Pending)
    const [tableSession4] = await db.insert(schema.tableSessions).values({
      branchId: branch.id,
      tableId: t4.id,
      partySize: 3,
      status: 'BILL_REQUESTED',
      openedByStaffId: waiterStaff.id,
      startedAt: new Date(now.getTime() - 90 * 60 * 1000),
    }).returning();
    if (!tableSession4) throw new Error('Failed to create tableSession4');

    const [guestSession4] = await db.insert(schema.guestSessions).values({
      tableSessionId: tableSession4.id,
      displayName: 'Michael Scott',
      isHostGuest: true,
      status: 'ACTIVE',
    }).returning();
    if (!guestSession4) throw new Error('Failed to create guestSession4');

    // 14. Menu Categories & Items
    const [catBurgers] = await db.insert(schema.menuCategories).values({
      restaurantId: restaurant.id,
      name: 'Burgers & Mains',
    }).returning();
    if (!catBurgers) throw new Error('Failed to create catBurgers');

    const [catDrinks] = await db.insert(schema.menuCategories).values({
      restaurantId: restaurant.id,
      name: 'Drinks & Beverages',
    }).returning();
    if (!catDrinks) throw new Error('Failed to create catDrinks');

    const [itemBurger, itemSalmon, itemSteak, itemCocktail] = await db.insert(schema.menuItems).values([
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
    ]).returning();
    if (!itemBurger || !itemSalmon || !itemSteak || !itemCocktail) {
      throw new Error('Failed to create menu items');
    }

    // 15. Discounts
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
    ]);

    // 16. Orders and Order Items
    // Order #1001 on T-01: status PENDING (Awaiting Waiter Approval)
    const [order1] = await db.insert(schema.orders).values({
      orderNumber: 'ORD-1001',
      branchId: branch.id,
      tableId: t1.id,
      customerId: customerEntity.id,
      tableSessionId: tableSession1.id,
      guestSessionId: guestSession1.id,
      channel: 'DINE_IN',
      status: 'PENDING',
      subtotal: 52.0,
      taxAmount: 4.16,
      serviceCharge: 2.60,
      totalAmount: 58.76,
      paymentStatus: 'UNPAID',
      acceptanceMode: 'WAITER_APPROVAL',
      guestName: 'Sarah Jenkins',
      specialInstructions: 'Extra napkins please',
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
    ]);

    // Order #1002 on T-03: status PREPARING (In Kitchen / Bar prep)
    const [order2] = await db.insert(schema.orders).values({
      orderNumber: 'ORD-1002',
      branchId: branch.id,
      tableId: t3.id,
      tableSessionId: tableSession3.id,
      guestSessionId: guestSession3.id,
      channel: 'DINE_IN',
      status: 'PREPARING',
      acceptedById: waiterStaff.id,
      acceptedAt: new Date(now.getTime() - 25 * 60 * 1000),
      subtotal: 86.99,
      taxAmount: 6.96,
      serviceCharge: 4.35,
      totalAmount: 98.30,
      paymentStatus: 'UNPAID',
      guestName: 'Alex Guest',
    }).returning();
    if (!order2) throw new Error('Failed to create order2');

    await db.insert(schema.orderItems).values([
      {
        orderId: order2.id,
        productId: itemSalmon.id,
        productNameSnapshot: itemSalmon.name,
        unitPrice: 24.99,
        quantity: 1,
        subtotal: 24.99,
        stationType: 'KITCHEN',
        status: 'PREPARING',
        preparingAt: new Date(now.getTime() - 20 * 60 * 1000),
      },
      {
        orderId: order2.id,
        productId: itemSteak.id,
        productNameSnapshot: itemSteak.name,
        unitPrice: 34.0,
        quantity: 1,
        subtotal: 34.0,
        stationType: 'KITCHEN',
        status: 'PREPARING',
        preparingAt: new Date(now.getTime() - 20 * 60 * 1000),
      },
      {
        orderId: order2.id,
        productId: itemCocktail.id,
        productNameSnapshot: itemCocktail.name,
        unitPrice: 14.0,
        quantity: 2,
        subtotal: 28.0,
        stationType: 'BAR',
        status: 'PREPARING',
        preparingAt: new Date(now.getTime() - 20 * 60 * 1000),
      },
    ]);

    // Order #1003 on T-04: status READY (Ready to be served / Cashier checkout)
    const [order3] = await db.insert(schema.orders).values({
      orderNumber: 'ORD-1003',
      branchId: branch.id,
      tableId: t4.id,
      tableSessionId: tableSession4.id,
      guestSessionId: guestSession4.id,
      channel: 'DINE_IN',
      status: 'READY',
      acceptedById: waiterStaff.id,
      acceptedAt: new Date(now.getTime() - 40 * 60 * 1000),
      subtotal: 40.0,
      taxAmount: 3.20,
      serviceCharge: 2.0,
      totalAmount: 45.20,
      paymentStatus: 'UNPAID',
      guestName: 'Michael Scott',
    }).returning();
    if (!order3) throw new Error('Failed to create order3');

    await db.insert(schema.orderItems).values([
      {
        orderId: order3.id,
        productId: itemBurger.id,
        productNameSnapshot: itemBurger.name,
        unitPrice: 26.0,
        quantity: 1,
        subtotal: 26.0,
        stationType: 'KITCHEN',
        status: 'READY',
        preparingAt: new Date(now.getTime() - 35 * 60 * 1000),
        readyAt: new Date(now.getTime() - 10 * 60 * 1000),
      },
      {
        orderId: order3.id,
        productId: itemCocktail.id,
        productNameSnapshot: itemCocktail.name,
        unitPrice: 14.0,
        quantity: 1,
        subtotal: 14.0,
        stationType: 'BAR',
        status: 'READY',
        preparingAt: new Date(now.getTime() - 35 * 60 * 1000),
        readyAt: new Date(now.getTime() - 15 * 60 * 1000),
      },
    ]);

    // 17. Suppliers & Inventory Items
    const [supplier] = await db.insert(schema.suppliers).values({
      branchId: branch.id,
      name: 'Fresh Farms Organic',
      contactName: 'John Miller',
      email: 'orders@freshfarms.example',
      phone: '+1 (555) 888-9999',
      address: '100 Farmer Way, Ruralville',
      isActive: true,
    }).returning();
    if (!supplier) throw new Error('Failed to create supplier');

    const [invCategory] = await db.insert(schema.inventoryCategories).values({
      branchId: branch.id,
      name: 'Produce & Meats',
      description: 'Raw meat, poultry, seafood and fresh vegetables',
    }).returning();
    if (!invCategory) throw new Error('Failed to create invCategory');

    await db.insert(schema.inventoryItems).values([
      {
        branchId: branch.id,
        supplierId: supplier.id,
        categoryId: invCategory.id,
        name: 'Prime Angus Beef',
        sku: 'MEAT-BEEF-001',
        unit: 'KG',
        currentStock: 25.5,
        lowStockThreshold: 10.0,
        costPerUnit: 18.5,
        isActive: true,
      },
      {
        branchId: branch.id,
        supplierId: supplier.id,
        categoryId: invCategory.id,
        name: 'Atlantic Salmon Fillet',
        sku: 'FISH-SALMON-002',
        unit: 'KG',
        currentStock: 12.0,
        lowStockThreshold: 5.0,
        costPerUnit: 16.0,
        isActive: true,
      },
      {
        branchId: branch.id,
        supplierId: supplier.id,
        categoryId: invCategory.id,
        name: 'Idaho Potatoes',
        sku: 'VEG-POTA-003',
        unit: 'KG',
        currentStock: 50.0,
        lowStockThreshold: 15.0,
        costPerUnit: 1.5,
        isActive: true,
      },
    ]);

    console.log('✅ Database seeded successfully!');
    console.log('───────────────────────────────────────────────────────');
    console.log('🏢 BRANCH INFO:');
    console.log(`  Name: ${branch.name}  ID: ${branch.id}`);
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
