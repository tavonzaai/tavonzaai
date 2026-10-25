// ============================================================================
// Drizzle Cart Repository — persistence for customer carts
// ============================================================================

import { Inject, Injectable } from '@nestjs/common';
import { and, desc, eq, inArray, isNull, ne } from 'drizzle-orm';
import {
  DRIZZLE,
  type DrizzleDatabase,
  branches,
  branchSettings,
  carts,
  cartItems,
  guestSessions,
  menuCategories,
  menuItems,
  modifierGroups,
  modifiers,
  tableSessions,
  tables,
} from '@/database';
import type { CatalogItem, CatalogModifier } from '../domain/cart-rules';

export type CartOwner = { customerId: string } | { guestSessionId: string };
export type CartRow = typeof carts.$inferSelect;
export type CartItemRow = typeof cartItems.$inferSelect;
export interface CartCatalogItem extends CatalogItem {
  imageUrl: string | null;
  estimatedPrepTime: number | null;
  categoryName: string | null;
}

/** Defaults applied when a branch has no settings row (matches order totals). */
export const DEFAULT_TAX_PERCENT = 8;
export const DEFAULT_SERVICE_CHARGE_PERCENT = 5;

type Executor = Pick<DrizzleDatabase, 'select' | 'insert' | 'update' | 'delete'>;

@Injectable()
export class DrizzleCartRepository {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDatabase) {}

  get database(): DrizzleDatabase {
    return this.db;
  }

  async getOrCreate(owner: CartOwner, executor: Executor = this.db): Promise<CartRow> {
    const ownerColumn = 'customerId' in owner ? carts.customerId : carts.guestSessionId;
    const ownerId = 'customerId' in owner ? owner.customerId : owner.guestSessionId;

    await executor
      .insert(carts)
      .values('customerId' in owner ? { customerId: owner.customerId } : { guestSessionId: owner.guestSessionId })
      .onConflictDoNothing({ target: ownerColumn });

    const [cart] = await executor.select().from(carts).where(eq(ownerColumn, ownerId)).limit(1);
    return cart!;
  }

  async lockCart(cartId: string, executor: Executor): Promise<CartRow | null> {
    const [cart] = await executor
      .select()
      .from(carts)
      .where(eq(carts.id, cartId))
      .for('update')
      .limit(1);
    return cart ?? null;
  }

  async findItems(cartId: string, executor: Executor = this.db): Promise<CartItemRow[]> {
    return executor
      .select()
      .from(cartItems)
      .where(eq(cartItems.cartId, cartId))
      .orderBy(cartItems.createdAt);
  }

  async findItem(cartId: string, itemId: string, executor: Executor = this.db): Promise<CartItemRow | null> {
    const [row] = await executor
      .select()
      .from(cartItems)
      .where(and(eq(cartItems.id, itemId), eq(cartItems.cartId, cartId)))
      .limit(1);
    return row ?? null;
  }

  async findLineByKey(cartId: string, lineKey: string, executor: Executor = this.db): Promise<CartItemRow | null> {
    const [row] = await executor
      .select()
      .from(cartItems)
      .where(and(eq(cartItems.cartId, cartId), eq(cartItems.lineKey, lineKey)))
      .limit(1);
    return row ?? null;
  }

  async insertItem(
    values: {
      cartId: string;
      menuItemId: string;
      lineKey: string;
      quantity: number;
      modifierIds: string[];
      specialInstructions: string | null;
    },
    executor: Executor = this.db,
  ): Promise<void> {
    await executor.insert(cartItems).values(values);
  }

  async updateItem(
    itemId: string,
    values: Partial<Pick<CartItemRow, 'quantity' | 'lineKey' | 'specialInstructions'>>,
    executor: Executor = this.db,
  ): Promise<void> {
    await executor
      .update(cartItems)
      .set({ ...values, updatedAt: new Date() })
      .where(eq(cartItems.id, itemId));
  }

  async deleteItem(itemId: string, executor: Executor = this.db): Promise<void> {
    await executor.delete(cartItems).where(eq(cartItems.id, itemId));
  }

  async clearItems(cartId: string, executor: Executor = this.db): Promise<void> {
    await executor.delete(cartItems).where(eq(cartItems.cartId, cartId));
    await this.setBranch(cartId, null, executor);
  }

  async setBranch(cartId: string, branchId: string | null, executor: Executor = this.db): Promise<void> {
    await executor
      .update(carts)
      .set({ branchId, updatedAt: new Date() })
      .where(eq(carts.id, cartId));
  }

  async findActiveBranch(branchId: string, executor: Executor = this.db) {
    const [branch] = await executor
      .select({ id: branches.id, restaurantId: branches.restaurantId, isActive: branches.isActive })
      .from(branches)
      .where(eq(branches.id, branchId))
      .limit(1);
    return branch && branch.isActive !== false ? branch : null;
  }

  async findBranchRates(branchId: string, executor: Executor = this.db) {
    const [settings] = await executor
      .select({ taxPercent: branchSettings.taxPercent, serviceChargePct: branchSettings.serviceChargePct })
      .from(branchSettings)
      .where(eq(branchSettings.branchId, branchId))
      .limit(1);
    return {
      taxPercent: typeof settings?.taxPercent === 'number' ? settings.taxPercent : DEFAULT_TAX_PERCENT,
      serviceChargePercent:
        typeof settings?.serviceChargePct === 'number' ? settings.serviceChargePct : DEFAULT_SERVICE_CHARGE_PERCENT,
    };
  }

  /** A table that can take orders: active, not deleted, not out of service, in an active branch. */
  async findOrderableTableByQrToken(qrToken: string, executor: Executor = this.db) {
    const [row] = await executor
      .select({ tableId: tables.id, branchId: tables.branchId })
      .from(tables)
      .innerJoin(branches, eq(branches.id, tables.branchId))
      .where(
        and(
          eq(tables.qrCodeToken, qrToken),
          eq(tables.isActive, true),
          isNull(tables.deletedAt),
          ne(tables.operationalFlag, 'OUT_OF_SERVICE'),
          eq(branches.isActive, true),
        ),
      )
      .limit(1);
    return row ?? null;
  }

  async findOpenTableSession(tableId: string, executor: Executor = this.db) {
    const [row] = await executor
      .select({ id: tableSessions.id })
      .from(tableSessions)
      .where(and(eq(tableSessions.tableId, tableId), inArray(tableSessions.status, ['ACTIVE', 'BILL_REQUESTED'])))
      .orderBy(desc(tableSessions.startedAt))
      .limit(1);
    return row ?? null;
  }

  async findCustomerGuestSession(tableSessionId: string, customerId: string, executor: Executor = this.db) {
    const [row] = await executor
      .select({ id: guestSessions.id })
      .from(guestSessions)
      .where(
        and(
          eq(guestSessions.tableSessionId, tableSessionId),
          eq(guestSessions.customerId, customerId),
          eq(guestSessions.status, 'ACTIVE'),
        ),
      )
      .limit(1);
    return row ?? null;
  }

  async findCatalogItems(ids: string[], executor: Executor = this.db): Promise<Map<string, CartCatalogItem>> {
    if (ids.length === 0) return new Map();
    const rows = await executor
      .select({
        id: menuItems.id,
        name: menuItems.name,
        basePrice: menuItems.basePrice,
        isAvailable: menuItems.isAvailable,
        isStockTracked: menuItems.isStockTracked,
        stockQuantity: menuItems.stockQuantity,
        restaurantId: menuItems.restaurantId,
        imageUrl: menuItems.imageUrl,
        estimatedPrepTime: menuItems.estimatedPrepTime,
        categoryName: menuCategories.name,
      })
      .from(menuItems)
      .leftJoin(menuCategories, eq(menuCategories.id, menuItems.categoryId))
      .where(inArray(menuItems.id, ids));
    return new Map(rows.map((row) => [row.id, { ...row, basePrice: Number(row.basePrice) }]));
  }

  async findModifiersForItems(menuItemIds: string[], executor: Executor = this.db): Promise<CatalogModifier[]> {
    if (menuItemIds.length === 0) return [];
    const rows = await executor
      .select({
        id: modifiers.id,
        name: modifiers.name,
        priceDelta: modifiers.priceDelta,
        isAvailable: modifiers.isAvailable,
        menuItemId: modifierGroups.menuItemId,
        groupName: modifierGroups.name,
      })
      .from(modifiers)
      .innerJoin(modifierGroups, eq(modifierGroups.id, modifiers.modifierGroupId))
      .where(inArray(modifierGroups.menuItemId, menuItemIds));
    return rows;
  }
}
