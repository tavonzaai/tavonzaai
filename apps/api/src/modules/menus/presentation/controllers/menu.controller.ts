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

import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiOkResponse } from '@nestjs/swagger';
import { MenuService } from '../../application/services/menu.service';
import {
  MenuCategoryResponseDto,
  MenuItemListResponseDto,
  MenuItemDetailResponseDto,
} from '../dtos/menu-response.dto';
import {
  CreateMenuCategoryDto,
  UpdateMenuCategoryDto,
  CreateMenuItemDto,
  UpdateMenuItemDto,
} from '../dtos/menu-mutation.dto';

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

  // ── Category Management Endpoints ─────────────────────────────────────

  @Post('categories')
  @ApiOperation({ summary: 'Create menu category' })
  async createCategory(@Body() dto: CreateMenuCategoryDto) {
    const category = await this.menuService.createCategory(dto);
    return {
      success: true,
      data: MenuCategoryResponseDto.fromEntity(category),
    };
  }

  @Patch('categories/:id')
  @ApiOperation({ summary: 'Update menu category' })
  async updateCategory(
    @Param('id') id: string,
    @Body() dto: UpdateMenuCategoryDto,
  ) {
    const category = await this.menuService.updateCategory(id, dto);
    return {
      success: true,
      data: MenuCategoryResponseDto.fromEntity(category),
    };
  }

  @Delete('categories/:id')
  @ApiOperation({ summary: 'Soft delete menu category' })
  async deleteCategory(@Param('id') id: string) {
    const category = await this.menuService.softDeleteCategory(id);
    return {
      success: true,
      message: 'Category soft-deleted successfully',
      data: MenuCategoryResponseDto.fromEntity(category),
    };
  }

  // ── Item Management Endpoints ─────────────────────────────────────────

  @Post('items')
  @ApiOperation({ summary: 'Create menu item' })
  async createItem(@Body() dto: CreateMenuItemDto) {
    const item = await this.menuService.createItem(dto);
    return {
      success: true,
      data: MenuItemDetailResponseDto.fromEntity(item),
    };
  }

  @Patch('items/:itemId')
  @ApiOperation({ summary: 'Update menu item' })
  async updateItem(
    @Param('itemId') itemId: string,
    @Body() dto: UpdateMenuItemDto,
  ) {
    const item = await this.menuService.updateItem(itemId, dto);
    return {
      success: true,
      data: MenuItemDetailResponseDto.fromEntity(item),
    };
  }

  @Delete('items/:itemId')
  @ApiOperation({ summary: 'Soft delete menu item' })
  async deleteItem(@Param('itemId') itemId: string) {
    const item = await this.menuService.softDeleteItem(itemId);
    return {
      success: true,
      message: 'Menu item soft-deleted successfully',
      data: MenuItemDetailResponseDto.fromEntity(item),
    };
  }
}

