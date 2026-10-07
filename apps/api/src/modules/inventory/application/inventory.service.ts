import { Injectable, NotFoundException } from '@nestjs/common';
import { DrizzleInventoryRepository } from '../infrastructure/persistence/drizzle-inventory.repository';
import type {
  CreateSupplierDto,
  UpdateSupplierDto,
  CreateInventoryCategoryDto,
  UpdateInventoryCategoryDto,
  CreateInventoryItemDto,
  UpdateInventoryItemDto,
  AdjustStockDto,
} from '../presentation/http/dto/inventory.dto';
import type {
  SupplierEntity,
  InventoryCategoryEntity,
  InventoryItemEntity,
} from '../domain/entities/inventory.entity';

@Injectable()
export class InventoryService {
  constructor(private readonly inventoryRepo: DrizzleInventoryRepository) {}

  // ── Suppliers ─────────────────────────────────────────────────────────

  async createSupplier(dto: CreateSupplierDto): Promise<SupplierEntity> {
    return this.inventoryRepo.createSupplier(dto);
  }

  async getBranchSuppliers(branchId: string): Promise<SupplierEntity[]> {
    return this.inventoryRepo.findSuppliersByBranch(branchId);
  }

  async getSupplierById(id: string): Promise<SupplierEntity> {
    const supplier = await this.inventoryRepo.findSupplierById(id);
    if (!supplier) throw new NotFoundException(`Supplier ${id} not found`);
    return supplier;
  }

  async updateSupplier(id: string, dto: UpdateSupplierDto): Promise<SupplierEntity> {
    await this.getSupplierById(id);
    return this.inventoryRepo.updateSupplier(id, dto);
  }

  async deleteSupplier(id: string): Promise<SupplierEntity> {
    await this.getSupplierById(id);
    return this.inventoryRepo.softDeleteSupplier(id);
  }

  // ── Categories ────────────────────────────────────────────────────────

  async createCategory(dto: CreateInventoryCategoryDto): Promise<InventoryCategoryEntity> {
    return this.inventoryRepo.createCategory(dto);
  }

  async getBranchCategories(branchId: string): Promise<InventoryCategoryEntity[]> {
    return this.inventoryRepo.findCategoriesByBranch(branchId);
  }

  async getCategoryById(id: string): Promise<InventoryCategoryEntity> {
    const category = await this.inventoryRepo.findCategoryById(id);
    if (!category) throw new NotFoundException(`Inventory category ${id} not found`);
    return category;
  }

  async updateCategory(id: string, dto: UpdateInventoryCategoryDto): Promise<InventoryCategoryEntity> {
    await this.getCategoryById(id);
    return this.inventoryRepo.updateCategory(id, dto);
  }

  async deleteCategory(id: string): Promise<InventoryCategoryEntity> {
    await this.getCategoryById(id);
    return this.inventoryRepo.deleteCategory(id);
  }

  // ── Items ─────────────────────────────────────────────────────────────

  async createItem(dto: CreateInventoryItemDto): Promise<InventoryItemEntity> {
    return this.inventoryRepo.createItem(dto);
  }

  async getBranchItems(branchId: string, lowStockOnly = false): Promise<InventoryItemEntity[]> {
    return this.inventoryRepo.findItemsByBranch(branchId, lowStockOnly);
  }

  async getItemById(id: string): Promise<InventoryItemEntity> {
    const item = await this.inventoryRepo.findItemById(id);
    if (!item) throw new NotFoundException(`Inventory item ${id} not found`);
    return item;
  }

  async updateItem(id: string, dto: UpdateInventoryItemDto): Promise<InventoryItemEntity> {
    await this.getItemById(id);
    return this.inventoryRepo.updateItem(id, dto as any);
  }

  async deleteItem(id: string): Promise<InventoryItemEntity> {
    await this.getItemById(id);
    return this.inventoryRepo.softDeleteItem(id);
  }

  async adjustStock(id: string, dto: AdjustStockDto): Promise<InventoryItemEntity> {
    await this.getItemById(id);
    return this.inventoryRepo.adjustStock(id, dto.delta);
  }

  // ── AI Summary & Reporting ────────────────────────────────────────────

  async getInventorySummary(branchId: string, lowStockOnly = false) {
    const allItems = await this.inventoryRepo.findItemsByBranch(branchId, false);
    const lowStockItems = allItems.filter(
      (item) => item.lowStockThreshold !== null && item.lowStockThreshold !== undefined && item.currentStock <= item.lowStockThreshold
    );

    const itemsToReturn = lowStockOnly ? lowStockItems : allItems;

    return {
      branch_id: branchId,
      total_items: allItems.length,
      low_stock_count: lowStockItems.length,
      items: itemsToReturn.map((item) => ({
        id: item.id,
        sku_code: item.sku ?? '',
        name: item.name,
        on_hand: item.currentStock,
        par_level: item.lowStockThreshold ?? 0,
        unit: item.unit.toLowerCase(),
        status:
          item.lowStockThreshold !== null && item.lowStockThreshold !== undefined && item.currentStock <= item.lowStockThreshold
            ? 'LOW_STOCK'
            : 'HEALTHY',
      })),
    };
  }
}
