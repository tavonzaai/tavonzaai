import { Injectable, Inject } from '@nestjs/common';
import { eq, sql, lte } from 'drizzle-orm';
import {
  DRIZZLE,
  type DrizzleDatabase,
  suppliers,
  inventoryCategories,
  inventoryItems,
} from '@tavonza/database';
import { DrizzleQueryBuilder } from '../../../../common/database';
import type {
  SupplierEntity,
  InventoryCategoryEntity,
  InventoryItemEntity,
  InventoryUnit,
} from '../../domain/entities/inventory.entity';
import {
  ResourceNotFoundException,
  InternalOperationException,
} from '../../../../common/errors/app.exception';

@Injectable()
export class DrizzleInventoryRepository {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDatabase) {}

  // ── Suppliers ─────────────────────────────────────────────────────────

  async createSupplier(data: {
    branchId: string;
    name: string;
    contactName?: string;
    email?: string;
    phone?: string;
    address?: string;
  }): Promise<SupplierEntity> {
    const [created] = await this.db
      .insert(suppliers)
      .values({
        branchId: data.branchId,
        name: data.name,
        contactName: data.contactName ?? null,
        email: data.email ?? null,
        phone: data.phone ?? null,
        address: data.address ?? null,
        isActive: true,
      })
      .returning();

    if (!created) throw new InternalOperationException('Failed to create supplier');
    return this.mapSupplier(created);
  }

  async findSuppliersByBranch(branchId: string): Promise<SupplierEntity[]> {
    const qb = new DrizzleQueryBuilder<typeof suppliers>(this.db, suppliers)
      .filterExact({ branchId })
      .softDelete({ column: suppliers.isActive, activeValue: true })
      .sort('name', 'asc');

    const rows = await qb.executePlain();
    return rows.map((r) => this.mapSupplier(r));
  }

  async findSupplierById(id: string): Promise<SupplierEntity | null> {
    const [row] = await this.db
      .select()
      .from(suppliers)
      .where(eq(suppliers.id, id))
      .limit(1);

    return row ? this.mapSupplier(row) : null;
  }

  async updateSupplier(
    id: string,
    updates: Partial<{
      name: string;
      contactName: string | null;
      email: string | null;
      phone: string | null;
      address: string | null;
    }>,
  ): Promise<SupplierEntity> {
    const [updated] = await this.db
      .update(suppliers)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(suppliers.id, id))
      .returning();
    if (!updated) throw new ResourceNotFoundException('Supplier', id);
    return this.mapSupplier(updated);
  }

  async softDeleteSupplier(id: string): Promise<SupplierEntity> {
    const [deleted] = await this.db
      .update(suppliers)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(suppliers.id, id))
      .returning();
    if (!deleted) throw new ResourceNotFoundException('Supplier', id);
    return this.mapSupplier(deleted);
  }

  // ── Categories ────────────────────────────────────────────────────────

  async createCategory(data: {
    branchId: string;
    name: string;
    description?: string;
  }): Promise<InventoryCategoryEntity> {
    const [created] = await this.db
      .insert(inventoryCategories)
      .values({
        branchId: data.branchId,
        name: data.name,
        description: data.description ?? null,
      })
      .returning();

    if (!created) throw new InternalOperationException('Failed to create inventory category');
    return this.mapCategory(created);
  }

  async findCategoriesByBranch(branchId: string): Promise<InventoryCategoryEntity[]> {
    const qb = new DrizzleQueryBuilder<typeof inventoryCategories>(this.db, inventoryCategories)
      .filterExact({ branchId })
      .sort('name', 'asc');

    const rows = await qb.executePlain();
    return rows.map((r) => this.mapCategory(r));
  }

  async findCategoryById(id: string): Promise<InventoryCategoryEntity | null> {
    const [row] = await this.db
      .select()
      .from(inventoryCategories)
      .where(eq(inventoryCategories.id, id))
      .limit(1);
    return row ? this.mapCategory(row) : null;
  }

  async updateCategory(
    id: string,
    updates: Partial<{
      name: string;
      description: string | null;
    }>,
  ): Promise<InventoryCategoryEntity> {
    const [updated] = await this.db
      .update(inventoryCategories)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(inventoryCategories.id, id))
      .returning();
    if (!updated) throw new ResourceNotFoundException('InventoryCategory', id);
    return this.mapCategory(updated);
  }

  async deleteCategory(id: string): Promise<InventoryCategoryEntity> {
    const [deleted] = await this.db
      .delete(inventoryCategories)
      .where(eq(inventoryCategories.id, id))
      .returning();
    if (!deleted) throw new ResourceNotFoundException('InventoryCategory', id);
    return this.mapCategory(deleted);
  }

  // ── Inventory Items ───────────────────────────────────────────────────

  async createItem(data: {
    branchId: string;
    supplierId: string;
    categoryId: string;
    name: string;
    sku?: string;
    unit: InventoryUnit;
    currentStock?: number;
    lowStockThreshold?: number;
    costPerUnit?: number;
  }): Promise<InventoryItemEntity> {
    const [created] = await this.db
      .insert(inventoryItems)
      .values({
        branchId: data.branchId,
        supplierId: data.supplierId,
        categoryId: data.categoryId,
        name: data.name,
        sku: data.sku ?? null,
        unit: data.unit,
        currentStock: data.currentStock ?? 0,
        lowStockThreshold: data.lowStockThreshold ?? null,
        costPerUnit: data.costPerUnit ?? null,
        isActive: true,
      })
      .returning();

    if (!created) throw new InternalOperationException('Failed to create inventory item');
    return this.mapItem(created);
  }

  async findItemsByBranch(branchId: string, lowStockOnly = false): Promise<InventoryItemEntity[]> {
    const qb = new DrizzleQueryBuilder<typeof inventoryItems>(this.db, inventoryItems)
      .filterExact({ branchId })
      .softDelete({ column: inventoryItems.isActive, activeValue: true })
      .sort('name', 'asc');

    if (lowStockOnly) {
      qb.where(lte(inventoryItems.currentStock, sql`coalesce(${inventoryItems.lowStockThreshold}, 0)`));
    }

    const rows = await qb.executePlain();
    return rows.map((r) => this.mapItem(r));
  }

  async findItemById(id: string): Promise<InventoryItemEntity | null> {
    const [row] = await this.db
      .select()
      .from(inventoryItems)
      .where(eq(inventoryItems.id, id))
      .limit(1);

    return row ? this.mapItem(row) : null;
  }

  async updateItem(
    id: string,
    updates: Partial<{
      name: string;
      sku: string | null;
      unit: InventoryUnit;
      lowStockThreshold: number | null;
      costPerUnit: number | null;
    }>,
  ): Promise<InventoryItemEntity> {
    const [updated] = await this.db
      .update(inventoryItems)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(inventoryItems.id, id))
      .returning();
    if (!updated) throw new ResourceNotFoundException('InventoryItem', id);
    return this.mapItem(updated);
  }

  async softDeleteItem(id: string): Promise<InventoryItemEntity> {
    const [deleted] = await this.db
      .update(inventoryItems)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(inventoryItems.id, id))
      .returning();
    if (!deleted) throw new ResourceNotFoundException('InventoryItem', id);
    return this.mapItem(deleted);
  }

  async adjustStock(id: string, delta: number): Promise<InventoryItemEntity> {
    const [updated] = await this.db
      .update(inventoryItems)
      .set({
        currentStock: sql`${inventoryItems.currentStock} + ${delta}`,
        updatedAt: new Date(),
      })
      .where(eq(inventoryItems.id, id))
      .returning();

    if (!updated) throw new ResourceNotFoundException('InventoryItem', id);
    return this.mapItem(updated);
  }

  // ── Mapping ───────────────────────────────────────────────────────────

  private mapSupplier(row: typeof suppliers.$inferSelect): SupplierEntity {
    return {
      id: row.id,
      branchId: row.branchId,
      name: row.name,
      contactName: row.contactName,
      email: row.email,
      phone: row.phone,
      address: row.address,
      isActive: row.isActive ?? true,
      createdAt: row.createdAt ?? new Date(),
      updatedAt: row.updatedAt ?? new Date(),
    };
  }

  private mapCategory(row: typeof inventoryCategories.$inferSelect): InventoryCategoryEntity {
    return {
      id: row.id,
      name: row.name,
      description: row.description,
      branchId: row.branchId,
      createdAt: row.createdAt ?? new Date(),
      updatedAt: row.updatedAt ?? new Date(),
    };
  }

  private mapItem(row: typeof inventoryItems.$inferSelect): InventoryItemEntity {
    return {
      id: row.id,
      branchId: row.branchId,
      supplierId: row.supplierId,
      categoryId: row.categoryId,
      name: row.name,
      sku: row.sku,
      unit: row.unit as InventoryUnit,
      currentStock: row.currentStock ?? 0,
      lowStockThreshold: row.lowStockThreshold,
      costPerUnit: row.costPerUnit,
      isActive: row.isActive ?? true,
      createdAt: row.createdAt ?? new Date(),
      updatedAt: row.updatedAt ?? new Date(),
    };
  }
}
