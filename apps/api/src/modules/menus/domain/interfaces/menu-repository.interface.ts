// ============================================================================
// Menu Domain — Repository Interface (Port)
// ============================================================================
// This is the INTERFACE (port) that the domain defines for persistence.
// The actual implementation (adapter) lives in the infrastructure layer.
//
// WHY an interface?
//   - The domain layer says WHAT data it needs, not HOW it's stored.
//   - The infrastructure layer provides the Prisma implementation.
//   - This makes the domain testable (mock the interface) and swappable
//     (replace Prisma with any other ORM without touching domain code).
//
// PATTERN:
//   domain/interfaces/  → defines the port (this file)
//   infrastructure/     → implements the adapter (PrismaMenuRepository)
// ============================================================================

import { MenuCategory } from "../entities/menu-category.entity";
import { MenuItem } from "../entities/menu-item.entity";

/**
 * Injection token for NestJS dependency injection.
 * Used in: @Inject(MENU_REPOSITORY) in services.
 */
export const MENU_REPOSITORY = Symbol("MENU_REPOSITORY");

export interface IMenuRepository {
  // ── Categories ──────────────────────────────────────────────────────

  /** Get all active categories for a branch, ordered by sortOrder. */
  findCategoriesByBranch(branchId: string): Promise<MenuCategory[]>;

  /** Get a single category by ID. */
  findCategoryById(id: string): Promise<MenuCategory | null>;

  /** Create a menu category. */
  createCategory?(data: { restaurantId: string; name: string; description?: string; displayOrder?: number }): Promise<MenuCategory>;

  /** Update a menu category. */
  updateCategory?(id: string, data: Partial<{ name: string; description: string | null; displayOrder: number; isActive: boolean }>): Promise<MenuCategory | null>;

  /** Soft delete a menu category. */
  softDeleteCategory?(id: string): Promise<MenuCategory | null>;

  // ── Items ───────────────────────────────────────────────────────────

  /** Get all available items for a branch, optionally filtered by category. */
  findItemsByBranch(
    branchId: string,
    filters?: {
      categoryId?: string;
      search?: string;
      isPopular?: boolean;
    },
  ): Promise<MenuItem[]>;

  /** Get a single item by ID (includes add-ons, full detail). */
  findItemById(id: string): Promise<MenuItem | null>;

  /** Create a menu item. */
  createItem?(data: { restaurantId: string; categoryId: string; name: string; description?: string; basePrice: number; imageUrl?: string; isVegetarian?: boolean }): Promise<MenuItem>;

  /** Update a menu item. */
  updateItem?(id: string, data: Partial<{ name: string; description: string | null; basePrice: number; isAvailable: boolean; imageUrl: string | null }>): Promise<MenuItem | null>;

  /** Soft delete a menu item. */
  softDeleteItem?(id: string): Promise<MenuItem | null>;
}
