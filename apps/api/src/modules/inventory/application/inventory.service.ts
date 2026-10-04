import { Injectable, NotFoundException } from '@nestjs/common';
import { DrizzleInventoryRepository } from '../infrastructure/persistence/drizzle-inventory.repository';
import type {
  CreateSupplierDto,
  CreateInventoryCategoryDto,
  CreateInventoryItemDto,
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

  // ── Categories ────────────────────────────────────────────────────────

  async createCategory(dto: CreateInventoryCategoryDto): Promise<InventoryCategoryEntity> {
    return this.inventoryRepo.createCategory(dto);
  }

  async getBranchCategories(branchId: string): Promise<InventoryCategoryEntity[]> {
    return this.inventoryRepo.findCategoriesByBranch(branchId);
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
