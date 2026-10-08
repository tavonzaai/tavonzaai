// ============================================================================
// Menu Presentation — Response DTOs
// ============================================================================

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MenuCategory } from '../../domain/entities/menu-category.entity';
import { MenuItem } from '../../domain/entities/menu-item.entity';

// ─── Category Response ────────────────────────────────────────────────

export class MenuCategoryResponseDto {
  @ApiProperty({ example: '3fa85f64-5717-4562-b3fc-2c963f66afa6', description: 'Category unique identifier' })
  id!: string;

  @ApiProperty({ example: 'Burgers & Sandwiches', description: 'Category display name' })
  name!: string;

  @ApiPropertyOptional({ example: 'Fresh artisanal patties, handcrafted buns, and savory sauces', description: 'Category description' })
  description!: string | null;

  @ApiPropertyOptional({ example: 'https://cdn.tavonza.ai/demo/categories/burgers.png', description: 'Category image asset URL' })
  imageUrl!: string | null;

  @ApiProperty({ example: 8, description: 'Number of active items available in this category' })
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

export class MenuItemListResponseDto {
  @ApiProperty({ example: '4455110d-8720-41ab-bc92-d667c4c36001', description: 'Menu item unique identifier' })
  id!: string;

  @ApiProperty({ example: 'Tavonza Signature Burger', description: 'Item name' })
  name!: string;

  @ApiPropertyOptional({ example: 'Grilled Angus beef patty, cheddar, caramelized onions, house truffle aioli on brioche', description: 'Item description' })
  description!: string | null;

  @ApiProperty({ example: 14.50, description: 'Current calculated selling price' })
  price!: number;

  @ApiPropertyOptional({ example: 'https://cdn.tavonza.ai/demo/items/signature-burger.png', description: 'Item image URL' })
  imageUrl!: string | null;

  @ApiPropertyOptional({ example: 4.8, description: 'Average customer rating (1.0 to 5.0)' })
  rating!: number | null;

  @ApiProperty({ example: 124, description: 'Number of verified customer ratings' })
  ratingCount!: number;

  @ApiProperty({ example: true, description: 'Whether highlighted as a chef/popular choice' })
  isPopular!: boolean;

  @ApiProperty({ example: true, description: 'Real-time kitchen availability flag (false = 86ed)' })
  isAvailable!: boolean;

  @ApiPropertyOptional({ example: 'Chef Special', description: 'Dietary or promotion badge label' })
  dietBadge!: string | null;

  @ApiProperty({ example: 'Burgers & Sandwiches', description: 'Associated category name' })
  categoryName!: string;

  @ApiProperty({ example: '3fa85f64-5717-4562-b3fc-2c963f66afa6', description: 'Associated category UUID' })
  categoryId!: string;

  @ApiProperty({ example: 14.50, description: 'Base menu price before addons and modifiers' })
  basePrice!: number;

  static fromEntity(entity: MenuItem): MenuItemListResponseDto {
    const dto = new MenuItemListResponseDto();
    dto.id = entity.id;
    dto.name = entity.name;
    dto.description = entity.description;
    dto.price = entity.price;
    dto.basePrice = entity.price;
    dto.imageUrl = entity.imageUrl;
    dto.rating = entity.rating;
    dto.ratingCount = entity.ratingCount;
    dto.isPopular = entity.isPopular;
    dto.isAvailable = entity.isAvailable;
    dto.dietBadge = entity.dietBadge;
    dto.categoryName = entity.categoryName;
    dto.categoryId = entity.categoryId;
    return dto;
  }
}

// ─── Item Response (Full Detail) ──────────────────────────────────────

export class MenuItemAddOnResponseDto {
  @ApiProperty({ example: '5566221e-9831-42bc-cd03-e778d5d47002', description: 'Add-on modifier UUID' })
  id!: string;

  @ApiProperty({ example: 'Extra Aged Cheddar', description: 'Add-on display name' })
  name!: string;

  @ApiProperty({ example: 1.50, description: 'Additional price delta for this add-on' })
  price!: number;
}

export class MenuItemDetailResponseDto {
  @ApiProperty({ example: '4455110d-8720-41ab-bc92-d667c4c36001', description: 'Menu item UUID' })
  id!: string;

  @ApiProperty({ example: 'Tavonza Signature Burger', description: 'Item name' })
  name!: string;

  @ApiPropertyOptional({ example: 'Grilled Angus beef patty, aged cheddar, caramelized onions, house truffle aioli on toasted brioche', description: 'Detailed culinary description' })
  description!: string | null;

  @ApiProperty({ example: 14.50, description: 'Base selling price' })
  price!: number;

  @ApiPropertyOptional({ example: 'https://cdn.tavonza.ai/demo/items/signature-burger.png', description: 'Primary high-res photo URL' })
  imageUrl!: string | null;

  @ApiProperty({ example: '3fa85f64-5717-4562-b3fc-2c963f66afa6', description: 'Category UUID' })
  categoryId!: string;

  @ApiProperty({ example: 'Burgers & Sandwiches', description: 'Category name' })
  categoryName!: string;

  @ApiPropertyOptional({ example: 12, description: 'Average kitchen preparation time in minutes' })
  prepTime!: number | null;

  @ApiPropertyOptional({ example: 680, description: 'Calorie count in kcal' })
  calories!: number | null;

  @ApiPropertyOptional({ example: 'Popular', description: 'Dietary or promo badge' })
  dietBadge!: string | null;

  @ApiPropertyOptional({ example: 'Dairy, Gluten', description: 'Formatted allergen summary string' })
  allergenDisplay!: string | null;

  @ApiProperty({ example: ['Dairy', 'Gluten'], type: [String], description: 'List of verified allergen tags' })
  allergens!: string[];

  @ApiPropertyOptional({ example: 'Cabernet Sauvignon', description: 'Sommelier recommended wine pairing' })
  winePairing!: string | null;

  @ApiPropertyOptional({ example: 'Pairs exceptionally well with full-bodied dry red wines', description: 'Tasting notes for pairing' })
  winePairingNote!: string | null;

  @ApiPropertyOptional({ example: 4.8, description: 'Average customer rating' })
  rating!: number | null;

  @ApiProperty({ example: 124, description: 'Total review count' })
  ratingCount!: number;

  @ApiProperty({ example: true, description: 'Popular flag' })
  isPopular!: boolean;

  @ApiProperty({ example: true, description: 'Kitchen availability status' })
  isAvailable!: boolean;

  @ApiProperty({ type: [MenuItemAddOnResponseDto], description: 'Available customize add-ons and toppings' })
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
