// ============================================================================
// Menu Infrastructure — Drizzle Menu Repository
// ============================================================================
// Implements the menu repository interface using Drizzle ORM.
//
// KEY DRIZZLE PATTERNS:
//   1. Relational queries: db.query.menuItems.findMany({ with: { ... } })
//   2. Filter builder:     eq(), and(), ilike() from drizzle-orm
//   3. Type-safe tables:   menuItems, menuCategories from schema
//
// This is the ONLY file in the menus module that imports Drizzle/DB.
// ============================================================================

import { Inject, Injectable } from '@nestjs/common';
import { and, eq, ilike, or } from 'drizzle-orm';
import {
  DRIZZLE,
  type DrizzleDatabase,
  menuCategories,
  menuItems,
  menuItemAddOns,
} from '@tavonza/database';
import { IMenuRepository } from '../../domain/interfaces/menu-repository.interface';
import {
  MenuCategory,
  type MenuCategoryProps,
} from '../../domain/entities/menu-category.entity';
import {
  MenuItem,
  type MenuItemProps,
  type MenuItemAddOn,
} from '../../domain/entities/menu-item.entity';

@Injectable()
export class DrizzleMenuRepository implements IMenuRepository {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDatabase) {}

  // ── Categories ──────────────────────────────────────────────────────

  async findCategoriesByBranch(branchId: string): Promise<MenuCategory[]> {
    // Use relational query to include item count
    const results = await this.db.query.menuCategories.findMany({
      where: and(
        eq(menuCategories.branchId, branchId),
        eq(menuCategories.isActive, true),
      ),
      orderBy: menuCategories.sortOrder,
      with: {
        items: {
          columns: { id: true },
          where: eq(menuItems.isAvailable, true),
        },
      },
    });

    return results.map((r) =>
      this.toDomainCategory({
        ...r,
        itemCount: r.items.length,
      }),
    );
  }

  async findCategoryById(id: string): Promise<MenuCategory | null> {
    const result = await this.db.query.menuCategories.findFirst({
      where: eq(menuCategories.id, id),
      with: {
        items: {
          columns: { id: true },
          where: eq(menuItems.isAvailable, true),
        },
      },
    });

    if (!result) return null;

    return this.toDomainCategory({
      ...result,
      itemCount: result.items.length,
    });
  }

  // ── Items ───────────────────────────────────────────────────────────

  async findItemsByBranch(
    branchId: string,
    filters?: {
      categoryId?: string;
      search?: string;
      isPopular?: boolean;
    },
  ): Promise<MenuItem[]> {
    // Build dynamic where conditions
    const conditions = [
      eq(menuItems.branchId, branchId),
      eq(menuItems.isAvailable, true),
    ];

    if (filters?.categoryId) {
      conditions.push(eq(menuItems.categoryId, filters.categoryId));
    }
    if (filters?.isPopular !== undefined) {
      conditions.push(eq(menuItems.isPopular, filters.isPopular));
    }
    if (filters?.search) {
      conditions.push(
        or(
          ilike(menuItems.name, `%${filters.search}%`),
          ilike(menuItems.description, `%${filters.search}%`),
        )!,
      );
    }

    const results = await this.db.query.menuItems.findMany({
      where: and(...conditions),
      orderBy: menuItems.sortOrder,
      with: {
        category: { columns: { name: true } },
        addOns: { where: eq(menuItemAddOns.isActive, true) },
      },
    });

    return results.map((r) => this.toDomainItem(r));
  }

  async findItemById(id: string): Promise<MenuItem | null> {
    const result = await this.db.query.menuItems.findFirst({
      where: eq(menuItems.id, id),
      with: {
        category: { columns: { name: true } },
        addOns: { where: eq(menuItemAddOns.isActive, true) },
      },
    });

    if (!result) return null;
    return this.toDomainItem(result);
  }

  // ── Mappers (DB Record → Domain Entity) ─────────────────────────────

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private toDomainCategory(record: any): MenuCategory {
    const props: MenuCategoryProps = {
      id: record.id,
      branchId: record.branchId,
      name: record.name,
      description: record.description,
      imageUrl: record.imageUrl,
      sortOrder: record.sortOrder,
      isActive: record.isActive,
      itemCount: record.itemCount ?? 0,
    };
    return new MenuCategory(props);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private toDomainItem(record: any): MenuItem {
    const addOns: MenuItemAddOn[] = (record.addOns ?? []).map(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (a: any) => ({
        id: a.id,
        name: a.name,
        price: Number(a.price),
      }),
    );

    const props: MenuItemProps = {
      id: record.id,
      branchId: record.branchId,
      categoryId: record.categoryId,
      categoryName: record.category?.name ?? '',
      name: record.name,
      description: record.description,
      price: Number(record.price),
      imageUrl: record.imageUrl,
      prepTime: record.prepTime,
      calories: record.calories,
      isVegetarian: record.isVegetarian,
      isVegan: record.isVegan,
      isGlutenFree: record.isGlutenFree,
      allergens: record.allergens,
      winePairing: record.winePairing,
      winePairingNote: record.winePairingNote,
      rating: record.rating ? Number(record.rating) : null,
      ratingCount: record.ratingCount,
      isAvailable: record.isAvailable,
      isPopular: record.isPopular,
      addOns,
    };
    return new MenuItem(props);
  }
}
