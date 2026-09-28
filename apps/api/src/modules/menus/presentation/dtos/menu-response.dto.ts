// ============================================================================
// Menu Presentation — Response DTOs
// ============================================================================
// DTOs (Data Transfer Objects) define the shape of API responses.
// They are separate from domain entities because:
//   1. The API contract should be stable even if domain internals change.
//   2. We can control exactly what data is exposed (no accidental leaks).
//   3. We can add API-specific fields (e.g. computed display strings).
//
// PATTERN: Domain Entity → DTO → JSON response
//          The controller calls a static `fromEntity()` to convert.
// ============================================================================

import { MenuCategory } from '../../domain/entities/menu-category.entity';
import { MenuItem } from '../../domain/entities/menu-item.entity';

// ─── Category Response ────────────────────────────────────────────────

export class MenuCategoryResponseDto {
  id!: string;
  name!: string;
  description!: string | null;
  imageUrl!: string | null;
  itemCount!: number;

  static fromEntity(entity: MenuCategory): MenuCategoryResponseDto {
    const dto = new MenuCategoryResponseDto();
    dto.id = entity.id;
    dto.name = entity.name;
    dto.description = entity.description;
    dto.imageUrl = entity.imageUrl;
    dto.itemCount = entity.itemCount;
    return dto;
  }
}

// ─── Item Response (List) ─────────────────────────────────────────────
// Used in the menu grid / list view — lighter than full detail.

export class MenuItemListResponseDto {
  id!: string;
  name!: string;
  description!: string | null;
  price!: number;
  imageUrl!: string | null;
  rating!: number | null;
  ratingCount!: number;
  isPopular!: boolean;
  isAvailable!: boolean;
  dietBadge!: string | null;
  categoryName!: string;

  static fromEntity(entity: MenuItem): MenuItemListResponseDto {
    const dto = new MenuItemListResponseDto();
    dto.id = entity.id;
    dto.name = entity.name;
    dto.description = entity.description;
    dto.price = entity.price;
    dto.imageUrl = entity.imageUrl;
    dto.rating = entity.rating;
    dto.ratingCount = entity.ratingCount;
    dto.isPopular = entity.isPopular;
    dto.isAvailable = entity.isAvailable;
    dto.dietBadge = entity.dietBadge;
    dto.categoryName = entity.categoryName;
    return dto;
  }
}

// ─── Item Response (Full Detail) ──────────────────────────────────────
// Used on the "Add to Cart" item detail screen — includes all fields.

export class MenuItemAddOnResponseDto {
  id!: string;
  name!: string;
  price!: number;
}

export class MenuItemDetailResponseDto {
  id!: string;
  name!: string;
  description!: string | null;
  price!: number;
  imageUrl!: string | null;
  categoryId!: string;
  categoryName!: string;
  prepTime!: number | null;
  calories!: number | null;
  dietBadge!: string | null;
  allergenDisplay!: string | null;
  allergens!: string[];
  winePairing!: string | null;
  winePairingNote!: string | null;
  rating!: number | null;
  ratingCount!: number;
  isPopular!: boolean;
  isAvailable!: boolean;
  addOns!: MenuItemAddOnResponseDto[];

  static fromEntity(entity: MenuItem): MenuItemDetailResponseDto {
    const dto = new MenuItemDetailResponseDto();
    dto.id = entity.id;
    dto.name = entity.name;
    dto.description = entity.description;
    dto.price = entity.price;
    dto.imageUrl = entity.imageUrl;
    dto.categoryId = entity.categoryId;
    dto.categoryName = entity.categoryName;
    dto.prepTime = entity.prepTime;
    dto.calories = entity.calories;
    dto.dietBadge = entity.dietBadge;
    dto.allergenDisplay = entity.allergenDisplay;
    dto.allergens = entity.allergens;
    dto.winePairing = entity.winePairing;
    dto.winePairingNote = entity.winePairingNote;
    dto.rating = entity.rating;
    dto.ratingCount = entity.ratingCount;
    dto.isPopular = entity.isPopular;
    dto.isAvailable = entity.isAvailable;
    dto.addOns = entity.addOns.map((a) => ({
      id: a.id,
      name: a.name,
      price: a.price,
    }));
    return dto;
  }
}
