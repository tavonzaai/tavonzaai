// ============================================================================
// Drizzle Schema — Menu Domain Tables
// ============================================================================
// Drizzle schemas are plain TypeScript — no codegen, no separate schema file.
// The table definitions ARE the source of truth for both types and migrations.
//
// CONVENTION:
//   - Table names: snake_case
//   - Column names: snake_case
//   - Exported table objects: camelCase (menuCategories, menuItems, ...)
//   - Relations defined separately for query builder
// ============================================================================

import {
  pgTable,
  uuid,
  text,
  numeric,
  integer,
  boolean,
  timestamp,
  index,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// ─── Menu Categories ──────────────────────────────────────────────────

export const menuCategories = pgTable(
  'menu_categories',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    branchId: uuid('branch_id').notNull(),
    name: text('name').notNull(),
    description: text('description'),
    imageUrl: text('image_url'),
    sortOrder: integer('sort_order').default(0).notNull(),
    isActive: boolean('is_active').default(true).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    branchActiveIdx: index('menu_categories_branch_active_idx').on(table.branchId, table.isActive),
  }),
);

export const menuCategoriesRelations = relations(menuCategories, ({ many }) => ({
  items: many(menuItems),
}));

// ─── Menu Items ───────────────────────────────────────────────────────

export const menuItems = pgTable(
  'menu_items',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    branchId: uuid('branch_id').notNull(),
    categoryId: uuid('category_id')
      .notNull()
      .references(() => menuCategories.id),
    name: text('name').notNull(),
    description: text('description'),
    price: numeric('price', { precision: 10, scale: 2 }).notNull(),
    imageUrl: text('image_url'),
    prepTime: integer('prep_time'), // minutes
    calories: integer('calories'),
    isVegetarian: boolean('is_vegetarian').default(false).notNull(),
    isVegan: boolean('is_vegan').default(false).notNull(),
    isGlutenFree: boolean('is_gluten_free').default(false).notNull(),
    allergens: text('allergens'), // comma-separated: "Gluten, Dairy, Nuts"
    winePairing: text('wine_pairing'),
    winePairingNote: text('wine_pairing_note'),
    rating: numeric('rating', { precision: 2, scale: 1 }),
    ratingCount: integer('rating_count').default(0).notNull(),
    isAvailable: boolean('is_available').default(true).notNull(),
    isPopular: boolean('is_popular').default(false).notNull(),
    sortOrder: integer('sort_order').default(0).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    branchCategoryIdx: index('menu_items_branch_category_idx').on(
      table.branchId,
      table.categoryId,
      table.isAvailable,
    ),
    branchPopularIdx: index('menu_items_branch_popular_idx').on(table.branchId, table.isPopular),
  }),
);

export const menuItemsRelations = relations(menuItems, ({ one, many }) => ({
  category: one(menuCategories, {
    fields: [menuItems.categoryId],
    references: [menuCategories.id],
  }),
  addOns: many(menuItemAddOns),
}));

// ─── Menu Item Add-Ons ────────────────────────────────────────────────

export const menuItemAddOns = pgTable('menu_item_add_ons', {
  id: uuid('id').defaultRandom().primaryKey(),
  menuItemId: uuid('menu_item_id')
    .notNull()
    .references(() => menuItems.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  price: numeric('price', { precision: 10, scale: 2 }).notNull(),
  isActive: boolean('is_active').default(true).notNull(),
});

export const menuItemAddOnsRelations = relations(menuItemAddOns, ({ one }) => ({
  menuItem: one(menuItems, {
    fields: [menuItemAddOns.menuItemId],
    references: [menuItems.id],
  }),
}));
