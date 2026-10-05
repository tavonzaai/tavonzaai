import { Injectable, Inject } from '@nestjs/common';
import { eq, and, sql, lte } from 'drizzle-orm';
import {
  DRIZZLE,
  type DrizzleDatabase,
  suppliers,
  inventoryCategories,
  inventoryItems,
} from '@tavonza/database';
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
    const rows = await this.db
      .select()
      .from(suppliers)
      .where(eq(suppliers.branchId, branchId));

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
    const rows = await this.db
      .select()
      .from(inventoryCategories)
      .where(eq(inventoryCategories.branchId, branchId));

    return rows.map((r) => this.mapCategory(r));
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
    const conditions = [eq(inventoryItems.branchId, branchId), eq(inventoryItems.isActive, true)];

    if (lowStockOnly) {
      conditions.push(lte(inventoryItems.currentStock, sql`coalesce(${inventoryItems.lowStockThreshold}, 0)`));
    }

    const rows = await this.db
      .select()
      .from(inventoryItems)
      .where(and(...conditions));

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
