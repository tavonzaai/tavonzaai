// ============================================================================
// Database Purge / Cleaner Module
// ============================================================================
import { DrizzleDatabase } from '../client';
import * as schema from '../schema';

export async function purgeDatabase(db: DrizzleDatabase): Promise<void> {
  console.log('🧹 Purging existing operational data in reverse foreign key order...');
  await db.delete(schema.userRoles);
  await db.delete(schema.rolePermissions);
  await db.delete(schema.roles);
  await db.delete(schema.permissions);
  await db.delete(schema.outboxEvents);
  await db.delete(schema.notifications);
  await db.delete(schema.auditLogs);
  await db.delete(schema.orderItemStatusChangeLogs);
  await db.delete(schema.statusChangeLogs);
  await db.delete(schema.orderReviews);
  await db.delete(schema.paymentAllocations);
  await db.delete(schema.payments);
  await db.delete(schema.orderItems);
  await db.delete(schema.orders);
  await db.delete(schema.cartItems);
  await db.delete(schema.carts);
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
  await db.delete(schema.refreshTokens);
  await db.delete(schema.authSessions);
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
  console.log('✓ Database cleaned cleanly.');
}
