import { daysAgo, isoDate, uid } from './constants';
import type { FloorContext } from './floor';
import type { IdentityContext } from './identity';
import { one, schema, type Tx } from './types';

export const seedOperations = async (
  tx: Tx,
  id: IdentityContext,
  floor: FloorContext,
  now: Date,
) => {
  // 1. Work Shifts for today and yesterday
  const shiftTodayStart = new Date(now);
  shiftTodayStart.setHours(9, 0, 0, 0);
  const shiftTodayEnd = new Date(now);
  shiftTodayEnd.setHours(17, 0, 0, 0);

  const activeStaff = [id.manager, id.waiters.david, id.waiters.sara, id.waiters.mike, id.cashier, id.kitchen];

  for (const [i, s] of activeStaff.entries()) {
    await tx.insert(schema.workShifts).values({
      id: uid(50, i + 1),
      branchId: id.branchId,
      staffAssignmentId: s.assignmentId,
      name: `${s.name} - Morning Shift`,
      startTime: shiftTodayStart,
      endTime: shiftTodayEnd,
      durationMin: 480,
      date: isoDate(now),
      status: 'ACTIVE',
      checkInAt: shiftTodayStart,
      createdById: id.manager.staffId,
    });
  }

  // 2. Reservations
  const table8 = floor['T-08'];
  const table4 = floor['T-04'];

  const tonight = new Date(now);
  tonight.setHours(20, 0, 0, 0);

  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(19, 30, 0, 0);

  await tx.insert(schema.reservations).values([
    {
      id: uid(51, 1),
      branchId: id.branchId,
      tableId: table8?.tableId,
      customerId: id.customers.sarah.customerId,
      guestName: 'Sarah Jenkins VIP Party',
      guestPhone: '+1 (555) 345-6789',
      partySize: 6,
      reservedFor: tonight,
      durationMins: 120,
      status: 'CONFIRMED',
      specialRequest: 'Window seating preferred, celebrating promotion',
    },
    {
      id: uid(51, 2),
      branchId: id.branchId,
      tableId: table4?.tableId,
      guestName: 'Robert California',
      guestPhone: '+1 (555) 987-6543',
      partySize: 4,
      reservedFor: tomorrow,
      durationMins: 90,
      status: 'PENDING',
      specialRequest: 'Quiet table for business meeting',
    },
    {
      id: uid(51, 3),
      branchId: id.branchId,
      guestName: 'Andy Bernard',
      guestPhone: '+1 (555) 222-3333',
      partySize: 2,
      reservedFor: daysAgo(now, 1, 19),
      durationMins: 90,
      status: 'NO_SHOW',
    },
  ]);

  // 3. Suppliers & Inventory
  const supplier = one(
    await tx
      .insert(schema.suppliers)
      .values({
        id: uid(52, 1),
        branchId: id.branchId,
        name: 'Fresh Farms Organic',
        contactName: 'John Miller',
        email: 'orders@freshfarms.example',
        phone: '+1 (555) 888-9999',
        address: '100 Farmer Way, Ruralville',
        isActive: true,
      })
      .returning(),
    'supplier',
  );

  const [invMeats, invProduce, invBar] = await tx
    .insert(schema.inventoryCategories)
    .values([
      { id: uid(53, 1), branchId: id.branchId, name: 'Produce & Meats', description: 'Raw meat, poultry and seafood' },
      { id: uid(53, 2), branchId: id.branchId, name: 'Dry Goods & Dairy', description: 'Cheese, potatoes and pantry items' },
      { id: uid(53, 3), branchId: id.branchId, name: 'Bar Supplies', description: 'Spirits, mixers and garnishes' },
    ])
    .returning();

  if (!invMeats || !invProduce || !invBar) throw new Error('Failed to create inventory categories');

  await tx.insert(schema.inventoryItems).values([
    {
      id: uid(54, 1),
      branchId: id.branchId,
      supplierId: supplier.id,
      categoryId: invMeats.id,
      name: 'Prime Angus Beef',
      sku: 'MEAT-BEEF-001',
      unit: 'KG',
      currentStock: 25.5,
      lowStockThreshold: 10.0,
      costPerUnit: 18.5,
      isActive: true,
    },
    {
      id: uid(54, 2),
      branchId: id.branchId,
      supplierId: supplier.id,
      categoryId: invMeats.id,
      name: 'Atlantic Salmon Fillet',
      sku: 'FISH-SALMON-002',
      unit: 'KG',
      currentStock: 3.5, // LOW STOCK (Threshold 5.0) -> triggers low stock alert!
      lowStockThreshold: 5.0,
      costPerUnit: 16.0,
      isActive: true,
    },
    {
      id: uid(54, 3),
      branchId: id.branchId,
      supplierId: supplier.id,
      categoryId: invProduce.id,
      name: 'Idaho Potatoes',
      sku: 'VEG-POTA-003',
      unit: 'KG',
      currentStock: 65.0,
      lowStockThreshold: 15.0,
      costPerUnit: 1.5,
      isActive: true,
    },
    {
      id: uid(54, 4),
      branchId: id.branchId,
      supplierId: supplier.id,
      categoryId: invBar.id,
      name: 'Kentucky Bourbon (750ml)',
      sku: 'BAR-BOURBON-004',
      unit: 'PIECE',
      currentStock: 14.0,
      lowStockThreshold: 4.0,
      costPerUnit: 22.0,
      isActive: true,
    },
  ]);

  console.log('📋 Seeded work shifts, 3 reservations, and inventory items (including low-stock trigger)');
};
