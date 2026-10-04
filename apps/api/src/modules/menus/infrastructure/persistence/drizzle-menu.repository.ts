// ============================================================================
// Menu Infrastructure — Drizzle Menu Repository
// ============================================================================

import { Inject, Injectable } from '@nestjs/common';
import { and, eq, ilike, or } from 'drizzle-orm';
import {
  DRIZZLE,
  type DrizzleDatabase,
  menuCategories,
  menuItems,
  modifierGroups,
  modifiers,
  branches,
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
    const restaurantId = await this.resolveRestaurantId(branchId);

    const categories = await this.db
      .select()
      .from(menuCategories)
      .where(
        and(
          eq(menuCategories.restaurantId, restaurantId),
          eq(menuCategories.isActive, true),
        ),
      )
      .orderBy(menuCategories.displayOrder);

    return categories.map((c) =>
      this.toDomainCategory({
        ...c,
        branchId,
        sortOrder: c.displayOrder ?? 0,
        itemCount: 0,
      }),
    );
  }

  async findCategoryById(id: string): Promise<MenuCategory | null> {
    const [category] = await this.db
      .select()
      .from(menuCategories)
      .where(eq(menuCategories.id, id))
      .limit(1);

    if (!category) return null;

    return this.toDomainCategory({
      ...category,
      branchId: '',
      sortOrder: category.displayOrder ?? 0,
      itemCount: 0,
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
    const restaurantId = await this.resolveRestaurantId(branchId);

    const conditions = [
      eq(menuItems.restaurantId, restaurantId),
      eq(menuItems.isAvailable, true),
    ];

    if (filters?.categoryId) {
      conditions.push(eq(menuItems.categoryId, filters.categoryId));
    }
    if (filters?.search) {
      conditions.push(
        or(
          ilike(menuItems.name, `%${filters.search}%`),
          ilike(menuItems.description, `%${filters.search}%`),
        )!,
      );
    }

    const items = await this.db
      .select()
      .from(menuItems)
      .where(and(...conditions))
      .orderBy(menuItems.displayOrder);

    return items.map((item) =>
      this.toDomainItem({
        ...item,
        branchId,
        price: item.basePrice,
        addOns: [],
      }),
    );
  }

  async findItemById(id: string): Promise<MenuItem | null> {
    const [item] = await this.db
      .select()
      .from(menuItems)
      .where(eq(menuItems.id, id))
      .limit(1);

    if (!item) return null;

    // Fetch modifiers for this item
    const groups = await this.db
      .select()
      .from(modifierGroups)
      .where(eq(modifierGroups.menuItemId, id));

    let addOns: MenuItemAddOn[] = [];
    if (groups.length > 0) {
      const groupIds = groups.map((g) => g.id);
      const mods = await this.db
        .select()
        .from(modifiers)
        .where(eq(modifiers.isAvailable, true));

      addOns = mods
        .filter((m) => groupIds.includes(m.modifierGroupId))
        .map((m) => ({
          id: m.id,
          name: m.name,
          price: m.priceDelta ?? 0,
        }));
    }

    return this.toDomainItem({
      ...item,
      branchId: '',
      price: item.basePrice,
      addOns,
    });
  }

  private async resolveRestaurantId(branchId: string): Promise<string> {
    const [branch] = await this.db
      .select({ restaurantId: branches.restaurantId })
      .from(branches)
      .where(eq(branches.id, branchId))
      .limit(1);

    return branch?.restaurantId ?? branchId;
  }

  private toDomainCategory(record: any): MenuCategory {
    const props: MenuCategoryProps = {
      id: record.id,
      branchId: record.branchId,
      name: record.name,
      description: record.description,
      imageUrl: record.imageUrl ?? null,
      sortOrder: record.sortOrder ?? 0,
      isActive: record.isActive ?? true,
      itemCount: record.itemCount ?? 0,
    };
    return new MenuCategory(props);
  }

  private toDomainItem(record: any): MenuItem {
    const addOns: MenuItemAddOn[] = (record.addOns ?? []).map((a: any) => ({
      id: a.id,
      name: a.name,
      price: Number(a.price),
    }));

    const props: MenuItemProps = {
      id: record.id,
      branchId: record.branchId,
      categoryId: record.categoryId,
      categoryName: record.categoryName ?? '',
      name: record.name,
      description: record.description,
      price: Number(record.price),
      imageUrl: record.imageUrl,
      prepTime: record.prepTime ?? 15,
      calories: record.calories ?? null,
      isVegetarian: record.isVegetarian ?? false,
      isVegan: record.isVegan ?? false,
      isGlutenFree: record.isGlutenFree ?? false,
      allergens: record.allergens ?? null,
      winePairing: record.winePairing ?? null,
      winePairingNote: record.winePairingNote ?? null,
      rating: record.rating ? Number(record.rating) : null,
      ratingCount: record.ratingCount ?? 0,
      isAvailable: record.isAvailable ?? true,
      isPopular: record.isPopular ?? false,
      addOns,
    };
    return new MenuItem(props);
  }
}
