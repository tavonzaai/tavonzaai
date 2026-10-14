// ============================================================================
// Operations Seeder Module (Reservations, Shifts, Suppliers, Inventory)
// ============================================================================
import { DrizzleDatabase } from '../../client';
import * as schema from '../../schema';

export async function seedOperations(
  db: DrizzleDatabase,
  branches: {
    branch1: typeof schema.branches.$inferSelect;
    branch2: typeof schema.branches.$inferSelect;
    branch3: typeof schema.branches.$inferSelect;
  },
  tables: {
    t2: typeof schema.tables.$inferSelect;
    t5: typeof schema.tables.$inferSelect;
    p3: typeof schema.tables.$inferSelect;
  },
  hierarchy: {
    waiterAssignment1: typeof schema.staffAssignments.$inferSelect;
    waiterAssignment2: typeof schema.staffAssignments.$inferSelect;
    kitchenAssignment1: typeof schema.staffAssignments.$inferSelect;
    bartenderAssignment1: typeof schema.staffAssignments.$inferSelect;
    cashierAssignment1: typeof schema.staffAssignments.$inferSelect;
  },
  staff: {
    manager1: typeof schema.staff.$inferSelect;
  },
  now: Date
) {
  console.log('📅 Scheduling Reservations, Shifts & Inventory Catalog...');

  // 1. Reservations
  await db.insert(schema.reservations).values([
    {
      branchId: branches.branch1.id,
      tableId: tables.p3.id,
      guestName: 'Eleanor Vance',
      guestPhone: '+1 (555) 777-1234',
      partySize: 4,
      reservedFor: new Date(now.getTime() + 4 * 3600 * 1000),
      durationMins: 120,
      status: 'CONFIRMED',
      specialRequest: 'Patio table with outdoor heater preferred',
    },
    {
      branchId: branches.branch1.id,
      tableId: tables.t2.id,
      guestName: 'Arthur Dent',
      guestPhone: '+1 (555) 777-5678',
      partySize: 2,
      reservedFor: new Date(now.getTime() + 26 * 3600 * 1000),
      durationMins: 90,
      status: 'PENDING',
      specialRequest: 'Quiet anniversary table',
    },
    {
      branchId: branches.branch1.id,
      tableId: tables.t5.id,
      guestName: 'John Doe',
      guestPhone: '+1 (555) 888-9900',
      partySize: 2,
      reservedFor: new Date(now.getTime() - 20 * 60 * 1000),
      durationMins: 90,
      status: 'SEATED',
    },
    {
      branchId: branches.branch1.id,
      guestName: 'Robert Langdon',
      guestPhone: '+1 (555) 999-0011',
      partySize: 6,
      reservedFor: new Date(now.getTime() - 48 * 3600 * 1000),
      status: 'CANCELLED',
    },
  ]);

  // 2. Work Shifts & Attendance Logs
  const todayDateStr = now.toISOString().split('T')[0]!;
  await db.insert(schema.workShifts).values([
    {
      branchId: branches.branch1.id,
      staffAssignmentId: hierarchy.waiterAssignment1.id,
      name: 'Morning / Lunch Service',
      startTime: new Date(now.getTime() - 4 * 3600 * 1000),
      endTime: new Date(now.getTime() + 4 * 3600 * 1000),
      date: todayDateStr,
      status: 'ACTIVE',
      checkInAt: new Date(now.getTime() - 4 * 3600 * 1000 + 5 * 60 * 1000),
      createdById: staff.manager1.id,
    },
    {
      branchId: branches.branch1.id,
      staffAssignmentId: hierarchy.kitchenAssignment1.id,
      name: 'All-Day Kitchen Brigade',
      startTime: new Date(now.getTime() - 5 * 3600 * 1000),
      endTime: new Date(now.getTime() + 5 * 3600 * 1000),
      date: todayDateStr,
      status: 'ACTIVE',
      checkInAt: new Date(now.getTime() - 5 * 3600 * 1000 + 10 * 60 * 1000),
      createdById: staff.manager1.id,
    },
    {
      branchId: branches.branch1.id,
      staffAssignmentId: hierarchy.bartenderAssignment1.id,
      name: 'Evening Bar & Lounge',
      startTime: new Date(now.getTime() - 2 * 3600 * 1000),
      endTime: new Date(now.getTime() + 6 * 3600 * 1000),
      date: todayDateStr,
      status: 'ACTIVE',
      checkInAt: new Date(now.getTime() - 2 * 3600 * 1000 + 2 * 60 * 1000),
      createdById: staff.manager1.id,
    },
    {
      branchId: branches.branch1.id,
      staffAssignmentId: hierarchy.cashierAssignment1.id,
      name: 'Main POS Register Shift',
      startTime: new Date(now.getTime() - 3 * 3600 * 1000),
      endTime: new Date(now.getTime() + 5 * 3600 * 1000),
      date: todayDateStr,
      status: 'ACTIVE',
      checkInAt: new Date(now.getTime() - 3 * 3600 * 1000 + 1 * 60 * 1000),
      createdById: staff.manager1.id,
    },
    {
      branchId: branches.branch2.id,
      staffAssignmentId: hierarchy.waiterAssignment2.id,
      name: 'Uptown Evening Service',
      startTime: new Date(now.getTime() - 1 * 3600 * 1000),
      endTime: new Date(now.getTime() + 7 * 3600 * 1000),
      date: todayDateStr,
      status: 'ACTIVE',
      checkInAt: new Date(now.getTime() - 1 * 3600 * 1000 + 4 * 60 * 1000),
      createdById: staff.manager1.id,
    },
  ]);

  // 3. Suppliers
  const [supplierFarms, supplierBeverage, supplierMeats] = await db.insert(schema.suppliers).values([
    {
      branchId: branches.branch1.id,
      name: 'Fresh Farms Organic',
      contactName: 'John Miller',
      email: 'orders@freshfarms.example',
      phone: '+1 (555) 888-9999',
      address: '100 Farmer Way, Ruralville, NY',
      isActive: true,
    },
    {
      branchId: branches.branch1.id,
      name: 'Empire Beverage & Spirits',
      contactName: 'Marco Rossi',
      email: 'sales@empirebev.example',
      phone: '+1 (555) 777-6655',
      address: '45 Industrial Pkwy, Queens, NY',
      isActive: true,
    },
    {
      branchId: branches.branch3.id,
      name: 'Prime Meats Wholesale',
      contactName: 'Frank Underwood',
      email: 'orders@primemeats.example',
      phone: '+1 (555) 234-9988',
      address: '22 Meatpacking District, NY',
      isActive: true,
    },
  ]).returning();

  if (!supplierFarms || !supplierBeverage || !supplierMeats) {
    throw new Error('Failed to create suppliers');
  }

  // 4. Inventory Categories
  const [invCatMeat, invCatProduce, invCatBar] = await db.insert(schema.inventoryCategories).values([
    {
      branchId: branches.branch1.id,
      name: 'Meats & Poultry',
      description: 'Prime cut steaks, burger blends and poultry',
    },
    {
      branchId: branches.branch1.id,
      name: 'Produce & Dry Goods',
      description: 'Fresh vegetables, oils, and dry goods',
    },
    {
      branchId: branches.branch1.id,
      name: 'Bar Spirits & Wines',
      description: 'Bourbon, mezcal, wines, and craft syrups',
    },
  ]).returning();

  if (!invCatMeat || !invCatProduce || !invCatBar) {
    throw new Error('Failed to create inventory categories');
  }

  // 5. Inventory Items
  await db.insert(schema.inventoryItems).values([
    {
      branchId: branches.branch1.id,
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
      branchId: branches.branch1.id,
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
      branchId: branches.branch1.id,
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
      branchId: branches.branch1.id,
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
}
