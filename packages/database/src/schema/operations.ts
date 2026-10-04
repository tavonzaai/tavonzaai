import {
  pgTable,
  uuid,
  varchar,
  text,
  boolean,
  timestamp,
  date,
  integer,
  doublePrecision,
  index,
  unique
} from 'drizzle-orm/pg-core';
import { shiftSlotStatusEnum, inventoryUnitEnum } from './enums';
import { branches } from './hierarchy';
import { staffAssignments, staff } from './users';

export const workShifts = pgTable('work_shifts', {
  id: uuid('id').defaultRandom().primaryKey(),
  branchId: uuid('branch_id').notNull().references(() => branches.id, { onDelete: 'cascade' }),
  staffAssignmentId: uuid('staff_assignment_id').notNull().references(() => staffAssignments.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 100 }).notNull(),
  startTime: timestamp('start_time', { withTimezone: true }).notNull(),
  endTime: timestamp('end_time', { withTimezone: true }).notNull(),
  durationMin: integer('duration_min').default(480),
  date: date('date').notNull(),
  status: shiftSlotStatusEnum('status').default('ACTIVE'),
  checkInAt: timestamp('check_in_at', { withTimezone: true }),
  checkOutAt: timestamp('check_out_at', { withTimezone: true }),
  note: text('note'),
  createdById: uuid('created_by_id').notNull().references(() => staff.id, { onDelete: 'restrict' }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow()
}, (table) => ({
  staffShiftUnique: unique('work_shifts_staff_shift_unique').on(table.staffAssignmentId, table.date, table.startTime),
  branchIdx: index('work_shifts_branch_idx').on(table.branchId),
  branchDateIdx: index('work_shifts_branch_date_idx').on(table.branchId, table.date),
  branchStatusIdx: index('work_shifts_branch_status_idx').on(table.branchId, table.status),
  staffDateIdx: index('work_shifts_staff_date_idx').on(table.staffAssignmentId, table.date)
}));

export const suppliers = pgTable('suppliers', {
  id: uuid('id').defaultRandom().primaryKey(),
  branchId: uuid('branch_id').notNull().references(() => branches.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 255 }).notNull(),
  contactName: varchar('contact_name', { length: 255 }),
  email: varchar('email', { length: 255 }),
  phone: varchar('phone', { length: 50 }),
  address: text('address'), // using text/jsonb based on schema
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow()
}, (table) => ({
  branchIdx: index('suppliers_branch_idx').on(table.branchId),
  branchActiveIdx: index('suppliers_branch_active_idx').on(table.branchId, table.isActive)
}));

export const inventoryCategories = pgTable('inventory_categories', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  branchId: uuid('branch_id').notNull().references(() => branches.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow()
}, (table) => ({
  branchIdx: index('inventory_categories_branch_idx').on(table.branchId)
}));

export const inventoryItems = pgTable('inventory_items', {
  id: uuid('id').defaultRandom().primaryKey(),
  branchId: uuid('branch_id').notNull().references(() => branches.id, { onDelete: 'cascade' }),
  supplierId: uuid('supplier_id').notNull().references(() => suppliers.id, { onDelete: 'restrict' }),
  categoryId: uuid('category_id').notNull().references(() => inventoryCategories.id, { onDelete: 'restrict' }),
  name: varchar('name', { length: 255 }).notNull(),
  sku: varchar('sku', { length: 100 }),
  unit: inventoryUnitEnum('unit').notNull(),
  currentStock: doublePrecision('current_stock').default(0),
  lowStockThreshold: doublePrecision('low_stock_threshold'),
  costPerUnit: doublePrecision('cost_per_unit'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow()
}, (table) => ({
  branchIdx: index('inventory_items_branch_idx').on(table.branchId),
  supplierIdx: index('inventory_items_supplier_idx').on(table.supplierId),
  branchActiveIdx: index('inventory_items_branch_active_idx').on(table.branchId, table.isActive)
}));
