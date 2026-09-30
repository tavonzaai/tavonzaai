// ============================================================================
// Menu Presentation — MenuController
// ============================================================================
// The controller is the HTTP entry point. It:
//   1. Defines routes and HTTP methods
//   2. Extracts parameters from the request (params, query, body)
//   3. Calls the application service
//   4. Converts domain entities to DTOs for the response
//
// RULE: Controllers must NOT contain business logic.
//       They only handle HTTP concerns (routing, param extraction, response shaping).
//
// ENDPOINTS (mapped from Figma customer flow):
//   GET /menus/:branchId/categories     → Menu screen category chips
//   GET /menus/:branchId/items          → Menu screen item grid
//   GET /menus/items/:itemId            → Item detail ("Add to Cart" screen)
// ============================================================================

import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiOkResponse } from '@nestjs/swagger';
import { MenuService } from '../../application/services/menu.service';
import {
  MenuCategoryResponseDto,
  MenuItemListResponseDto,
  MenuItemDetailResponseDto,
} from '../dtos/menu-response.dto';

@ApiTags('Customer | Menus')
@Controller('menus')
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

  /**
   * GET /menus/:branchId/categories
   *
   * Figma Screen: Menu — horizontal category chips
   * Returns all active categories for a branch (Burgers, Dessert, Mexican...)
   */
  @Get(':branchId/categories')
  @ApiOperation({ summary: '[Customer] Get active menu categories for branch' })
  @ApiOkResponse({ type: [MenuCategoryResponseDto] })
  async getCategories(
    @Param('branchId') branchId: string,
  ): Promise<MenuCategoryResponseDto[]> {
    const categories = await this.menuService.getCategories(branchId);
    return categories.map(MenuCategoryResponseDto.fromEntity);
  }

  /**
   * GET /menus/:branchId/items?categoryId=xxx&search=xxx&popular=true
   *
   * Figma Screen: Menu — item cards grid + "See More All Items"
   * Supports filtering by category, search text, and popular flag.
   */
  @Get(':branchId/items')
  @ApiOperation({ summary: '[Customer] Get menu items with category, search, and popularity filters' })
  @ApiOkResponse({ type: [MenuItemListResponseDto] })
  async getItems(
    @Param('branchId') branchId: string,
    @Query('categoryId') categoryId?: string,
    @Query('search') search?: string,
    @Query('popular') popular?: string,
  ): Promise<MenuItemListResponseDto[]> {
    const items = await this.menuService.getItemsByBranch(branchId, {
      categoryId,
      search,
      isPopular: popular === 'true' ? true : undefined,
    });
    return items.map(MenuItemListResponseDto.fromEntity);
  }

  /**
   * GET /menus/items/:itemId
   *
   * Figma Screen: "Add to Cart" item detail
   * Returns full item detail including add-ons, nutritional info,
   * allergens, wine pairing, prep time, calories, etc.
   */
  @Get('items/:itemId')
  @ApiOperation({ summary: '[Customer] Get menu item detail with add-ons and nutritional info' })
  @ApiOkResponse({ type: MenuItemDetailResponseDto })
  async getItemDetail(
    @Param('itemId') itemId: string,
  ): Promise<MenuItemDetailResponseDto> {
    const item = await this.menuService.getItemDetail(itemId);
    return MenuItemDetailResponseDto.fromEntity(item);
  }
}
