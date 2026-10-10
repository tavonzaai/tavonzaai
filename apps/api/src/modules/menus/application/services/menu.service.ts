// ============================================================================
// Menu Application — MenuService
// ============================================================================
// The application service coordinates use cases. It:
//   1. Receives calls from the presentation layer (controller)
//   2. Uses the repository port (interface) to access data
//   3. Returns domain entities (never Prisma models)
//
// IMPORTANT: The service injects the INTERFACE, not the Prisma implementation.
//            NestJS wires the concrete implementation via the module providers.
//
// This maps to the Figma customer screens:
//   - Menu screen: getCategories(), getItemsByBranch()
//   - Item Detail screen: getItemDetail()
//   - See More All Items: getItemsByBranch(branchId, { categoryId })
// ============================================================================

import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  MENU_REPOSITORY,
  IMenuRepository,
} from '../../domain/interfaces/menu-repository.interface';
import { MenuCategory } from '../../domain/entities/menu-category.entity';
import { MenuItem } from '../../domain/entities/menu-item.entity';

@Injectable()
export class MenuService {
  constructor(
    @Inject(MENU_REPOSITORY)
    private readonly menuRepository: IMenuRepository,
  ) {}

  // ── Use Cases ─────────────────────────────────────────────────────────

  /**
   * Get all active menu categories for a branch.
   * Figma: Horizontal category chips on the Menu screen
   * (Burgers, Dessert, Mexican, ...)
   */
  async getCategories(branchId: string): Promise<MenuCategory[]> {
    return this.menuRepository.findCategoriesByBranch(branchId);
  }

  /**
   * Get menu items for a branch, with optional filters.
   * Figma: Menu screen item cards + "See More All Items" screen
   */
  async getItemsByBranch(
    branchId: string,
    filters?: {
      categoryId?: string;
      search?: string;
      isPopular?: boolean;
    },
  ): Promise<MenuItem[]> {
    return this.menuRepository.findItemsByBranch(branchId, filters);
  }

  /**
   * Get full item detail (including add-ons, nutritional info, etc.)
   * Figma: "Add to Cart" item detail screen
   */
  async getItemDetail(itemId: string): Promise<MenuItem> {
    const item = await this.menuRepository.findItemById(itemId);
    if (!item) {
      throw new NotFoundException(`Menu item ${itemId} not found`);
    }
    return item;
  }

  // ── Category CRUD ──────────────────────────────────────────────────────

  async createCategory(data: {
    restaurantId: string;
    name: string;
    description?: string;
    displayOrder?: number;
  }): Promise<MenuCategory> {
    if (!this.menuRepository.createCategory) {
      throw new Error('createCategory is not supported');
    }
    return this.menuRepository.createCategory(data);
  }

  async updateCategory(
    id: string,
    data: Partial<{
      name: string;
      description: string | null;
      displayOrder: number;
      isActive: boolean;
    }>,
  ): Promise<MenuCategory> {
    if (!this.menuRepository.updateCategory) {
      throw new Error('updateCategory is not supported');
    }
    const updated = await this.menuRepository.updateCategory(id, data);
    if (!updated) {
      throw new NotFoundException(`Menu category ${id} not found`);
    }
    return updated;
  }

  async softDeleteCategory(id: string): Promise<MenuCategory> {
    if (!this.menuRepository.softDeleteCategory) {
      throw new Error('softDeleteCategory is not supported');
    }
    const deleted = await this.menuRepository.softDeleteCategory(id);
    if (!deleted) {
      throw new NotFoundException(`Menu category ${id} not found`);
    }
    return deleted;
  }

  // ── Item CRUD ──────────────────────────────────────────────────────────

  async createItem(data: {
    restaurantId: string;
    categoryId: string;
    name: string;
    description?: string;
    basePrice: number;
    imageUrl?: string;
    isVegetarian?: boolean;
  }): Promise<MenuItem> {
    if (!this.menuRepository.createItem) {
      throw new Error('createItem is not supported');
    }
    return this.menuRepository.createItem(data);
  }

  async updateItem(
    id: string,
    data: Partial<{
      name: string;
      description: string | null;
      basePrice: number;
      isAvailable: boolean;
      imageUrl: string | null;
    }>,
  ): Promise<MenuItem> {
    if (!this.menuRepository.updateItem) {
      throw new Error('updateItem is not supported');
    }
    const updated = await this.menuRepository.updateItem(id, data);
    if (!updated) {
      throw new NotFoundException(`Menu item ${id} not found`);
    }
    return updated;
  }

  async softDeleteItem(id: string): Promise<MenuItem> {
    if (!this.menuRepository.softDeleteItem) {
      throw new Error('softDeleteItem is not supported');
    }
    const deleted = await this.menuRepository.softDeleteItem(id);
    if (!deleted) {
      throw new NotFoundException(`Menu item ${id} not found`);
    }
    return deleted;
  }
}

