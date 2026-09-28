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
}
