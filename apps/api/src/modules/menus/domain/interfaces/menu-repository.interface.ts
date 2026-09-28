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
}
