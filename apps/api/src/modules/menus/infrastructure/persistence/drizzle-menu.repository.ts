// ============================================================================
// Menu Infrastructure — Drizzle Menu Repository
// ============================================================================

import { Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import {
  DRIZZLE,
  type DrizzleDatabase,
  menuCategories,
  menuItems,
  modifierGroups,
  modifiers,
  branches,
} from '@tavonza/database';
import { DrizzleQueryBuilder } from '../../../../common/database';
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

    const qb = new DrizzleQueryBuilder<typeof menuCategories>(this.db, menuCategories)
      .filterExact({ restaurantId })
      .softDelete({ column: menuCategories.isActive, activeValue: true })
      .sort('displayOrder', 'asc');

    const categories = await qb.executePlain();

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

  async createCategory(data: {
    restaurantId: string;
    name: string;
    description?: string;
    displayOrder?: number;
  }): Promise<MenuCategory> {
    const [record] = await this.db
      .insert(menuCategories)
      .values({
        restaurantId: data.restaurantId,
        name: data.name,
        description: data.description,
        displayOrder: data.displayOrder ?? 0,
        isActive: true,
      })
      .returning();
    return this.toDomainCategory(record);
  }

  async updateCategory(
    id: string,
    data: Partial<{
      name: string;
      description: string | null;
      displayOrder: number;
      isActive: boolean;
    }>,
  ): Promise<MenuCategory | null> {
    const [record] = await this.db
      .update(menuCategories)
      .set(data)
      .where(eq(menuCategories.id, id))
      .returning();
    return record ? this.toDomainCategory(record) : null;
  }

  async softDeleteCategory(id: string): Promise<MenuCategory | null> {
    const [record] = await this.db
      .update(menuCategories)
      .set({ isActive: false })
      .where(eq(menuCategories.id, id))
      .returning();
    return record ? this.toDomainCategory(record) : null;
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

    const qb = new DrizzleQueryBuilder<typeof menuItems>(this.db, menuItems)
      .filterExact({
        restaurantId,
        ...(filters?.categoryId ? { categoryId: filters.categoryId } : {}),
      })
      .softDelete({ column: menuItems.isAvailable, activeValue: true })
      .sort('displayOrder', 'asc');

    if (filters?.search) {
      qb.search(filters.search, [menuItems.name, menuItems.description]);
    }

    const items = await qb.executePlain();

    return items.map((item) =>
      this.toDomainItem({
        ...item,
        branchId,
        price: item.basePrice,
        addOns: [],
      }),
    );
  }

  async createItem(data: {
    restaurantId: string;
    categoryId: string;
    name: string;
    description?: string;
    basePrice: number;
    imageUrl?: string;
    isVegetarian?: boolean;
  }): Promise<MenuItem> {
    const [record] = await this.db
      .insert(menuItems)
      .values({
        restaurantId: data.restaurantId,
        categoryId: data.categoryId,
        name: data.name,
        description: data.description,
        basePrice: data.basePrice,
        imageUrl: data.imageUrl,
        isVegetarian: data.isVegetarian ?? false,
        isAvailable: true,
        displayOrder: 0,
      })
      .returning();
    if (!record) {
      throw new Error('Failed to create menu item');
    }
    return this.toDomainItem({ ...record, price: record.basePrice, addOns: [] });
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
  ): Promise<MenuItem | null> {
    const updateData: any = { ...data };
    if (data.basePrice !== undefined) {
      updateData.basePrice = data.basePrice;
    }
    const [record] = await this.db
      .update(menuItems)
      .set(updateData)
      .where(eq(menuItems.id, id))
      .returning();
    return record ? this.toDomainItem({ ...record, price: record.basePrice, addOns: [] }) : null;
  }

  async softDeleteItem(id: string): Promise<MenuItem | null> {
    const [record] = await this.db
      .update(menuItems)
      .set({ isAvailable: false })
      .where(eq(menuItems.id, id))
      .returning();
    return record ? this.toDomainItem({ ...record, price: record.basePrice, addOns: [] }) : null;
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
