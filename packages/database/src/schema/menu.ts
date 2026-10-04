import {
  pgTable,
  uuid,
  varchar,
  text,
  boolean,
  timestamp,
  integer,
  doublePrecision,
  index
} from 'drizzle-orm/pg-core';
import { restaurants } from './hierarchy';

export const menuCategories = pgTable('menu_categories', {
  id: uuid('id').defaultRandom().primaryKey(),
  restaurantId: uuid('restaurant_id').notNull().references(() => restaurants.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  displayOrder: integer('display_order').default(0),
  isActive: boolean('is_active').default(true)
}, (table) => ({
  restaurantIdx: index('menu_categories_restaurant_idx').on(table.restaurantId)
}));

export const menuItems = pgTable('menu_items', {
  id: uuid('id').defaultRandom().primaryKey(),
  restaurantId: uuid('restaurant_id').notNull().references(() => restaurants.id, { onDelete: 'cascade' }),
  categoryId: uuid('category_id').notNull().references(() => menuCategories.id, { onDelete: 'restrict' }),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  imageUrl: text('image_url'),
  basePrice: doublePrecision('base_price').notNull(),
  isAvailable: boolean('is_available').default(true),
  isVegetarian: boolean('is_vegetarian').default(false),
  spiceLevel: integer('spice_level'),
  displayOrder: integer('display_order').default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow()
}, (table) => ({
  restaurantIdx: index('menu_items_restaurant_idx').on(table.restaurantId),
  categoryIdx: index('menu_items_category_idx').on(table.categoryId)
}));

export const modifierGroups = pgTable('modifier_groups', {
  id: uuid('id').defaultRandom().primaryKey(),
  menuItemId: uuid('menu_item_id').notNull().references(() => menuItems.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 255 }).notNull(),
  isRequired: boolean('is_required').default(false),
  minSelect: integer('min_select').default(0),
  maxSelect: integer('max_select').default(1)
}, (table) => ({
  menuItemIdx: index('modifier_groups_menu_item_idx').on(table.menuItemId)
}));

export const modifiers = pgTable('modifiers', {
  id: uuid('id').defaultRandom().primaryKey(),
  modifierGroupId: uuid('modifier_group_id').notNull().references(() => modifierGroups.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 255 }).notNull(),
  priceDelta: doublePrecision('price_delta').default(0),
  isAvailable: boolean('is_available').default(true)
}, (table) => ({
  modifierGroupIdx: index('modifiers_modifier_group_idx').on(table.modifierGroupId)
}));
