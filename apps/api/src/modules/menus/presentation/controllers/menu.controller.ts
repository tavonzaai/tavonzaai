// ============================================================================
// Menu Presentation — MenuController
// ============================================================================

import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
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
import { ApiStandardErrors } from '../../../../common/swagger';

@ApiTags('Customer | Menus')
@Controller('menus')
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

  /**
   * GET /menus/:branchId/categories
   * Figma Screen: Menu — horizontal category chips
   */
  @Get(':branchId/categories')
  @ApiOperation({
    summary: '[Customer] Get active menu categories for branch',
    description: 'Returns all active categories (e.g. Burgers, Dessert, Mexican) configured for the specified branch.',
  })
  @ApiParam({
    name: 'branchId',
    type: String,
    description: 'Branch UUID',
    example: 'ce7b4318-5e2e-4fcd-a459-0e1bc80a6f27',
  })
  @ApiOkResponse({
    type: [MenuCategoryResponseDto],
    description: 'List of active menu categories with item counts',
  })
  @ApiStandardErrors(400, 404, 500)
  async getCategories(
    @Param('branchId') branchId: string,
  ): Promise<MenuCategoryResponseDto[]> {
    const categories = await this.menuService.getCategories(branchId);
    return categories.map(MenuCategoryResponseDto.fromEntity);
  }

  /**
   * GET /menus/:branchId/items
   * Figma Screen: Menu — item cards grid + "See More All Items"
   */
  @Get(':branchId/items')
  @ApiOperation({
    summary: '[Customer] Get menu items with category, search, and popularity filters',
    description: 'Returns menu items available at the branch, with optional category filtering, text search, and popular flag.',
  })
  @ApiParam({
    name: 'branchId',
    type: String,
    description: 'Branch UUID',
    example: 'ce7b4318-5e2e-4fcd-a459-0e1bc80a6f27',
  })
  @ApiQuery({
    name: 'categoryId',
    required: false,
    type: String,
    description: 'Optional category UUID filter',
    example: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description: 'Optional search text to filter item names and descriptions',
    example: 'burger',
  })
  @ApiQuery({
    name: 'popular',
    required: false,
    type: Boolean,
    description: 'Filter only popular/recommended items ("true" or "false")',
    example: true,
  })
  @ApiOkResponse({
    type: [MenuItemListResponseDto],
    description: 'List of matching menu items',
  })
  @ApiStandardErrors(400, 404, 500)
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
   * Figma Screen: "Add to Cart" item detail
   */
  @Get('items/:itemId')
  @ApiOperation({
    summary: '[Customer] Get menu item detail with add-ons and nutritional info',
    description: 'Returns full item detail including available modifiers/toppings, allergens, calories, and wine pairing.',
  })
  @ApiParam({
    name: 'itemId',
    type: String,
    description: 'Menu Item UUID',
    example: '4455110d-8720-41ab-bc92-d667c4c36001',
  })
  @ApiOkResponse({
    type: MenuItemDetailResponseDto,
    description: 'Comprehensive menu item specifications and add-ons',
  })
  @ApiStandardErrors(400, 404, 500)
  async getItemDetail(
    @Param('itemId') itemId: string,
  ): Promise<MenuItemDetailResponseDto> {
    const item = await this.menuService.getItemDetail(itemId);
    return MenuItemDetailResponseDto.fromEntity(item);
  }

  // ── Category Management Endpoints ─────────────────────────────────────

  @Post('categories')
  @ApiOperation({ summary: '[Manager] Create menu category' })
  @ApiCreatedResponse({
    description: 'Menu category successfully created',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: { $ref: '#/components/schemas/MenuCategoryResponseDto' },
      },
    },
  })
  @ApiStandardErrors(400, 401, 403, 500)
  async createCategory(@Body() dto: CreateMenuCategoryDto) {
    const category = await this.menuService.createCategory(dto);
    return {
      success: true,
      data: MenuCategoryResponseDto.fromEntity(category),
    };
  }

  @Patch('categories/:id')
  @ApiOperation({ summary: '[Manager] Update menu category' })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'Category UUID',
    example: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  })
  @ApiOkResponse({
    description: 'Menu category successfully updated',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: { $ref: '#/components/schemas/MenuCategoryResponseDto' },
      },
    },
  })
  @ApiStandardErrors(400, 401, 403, 404, 500)
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
  @ApiOperation({ summary: '[Manager] Soft delete menu category' })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'Category UUID',
    example: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  })
  @ApiOkResponse({
    description: 'Menu category soft-deleted successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Category soft-deleted successfully' },
        data: { $ref: '#/components/schemas/MenuCategoryResponseDto' },
      },
    },
  })
  @ApiStandardErrors(400, 401, 403, 404, 500)
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
  @ApiOperation({ summary: '[Manager] Create menu item' })
  @ApiCreatedResponse({
    description: 'Menu item created successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: { $ref: '#/components/schemas/MenuItemDetailResponseDto' },
      },
    },
  })
  @ApiStandardErrors(400, 401, 403, 500)
  async createItem(@Body() dto: CreateMenuItemDto) {
    const item = await this.menuService.createItem(dto);
    return {
      success: true,
      data: MenuItemDetailResponseDto.fromEntity(item),
    };
  }

  @Patch('items/:itemId')
  @ApiOperation({ summary: '[Manager] Update menu item' })
  @ApiParam({
    name: 'itemId',
    type: String,
    description: 'Menu Item UUID',
    example: '4455110d-8720-41ab-bc92-d667c4c36001',
  })
  @ApiOkResponse({
    description: 'Menu item updated successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: { $ref: '#/components/schemas/MenuItemDetailResponseDto' },
      },
    },
  })
  @ApiStandardErrors(400, 401, 403, 404, 500)
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
  @ApiOperation({ summary: '[Manager] Soft delete menu item' })
  @ApiParam({
    name: 'itemId',
    type: String,
    description: 'Menu Item UUID',
    example: '4455110d-8720-41ab-bc92-d667c4c36001',
  })
  @ApiOkResponse({
    description: 'Menu item soft-deleted successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Menu item soft-deleted successfully' },
        data: { $ref: '#/components/schemas/MenuItemDetailResponseDto' },
      },
    },
  })
  @ApiStandardErrors(400, 401, 403, 404, 500)
  async deleteItem(@Param('itemId') itemId: string) {
    const item = await this.menuService.softDeleteItem(itemId);
    return {
      success: true,
      message: 'Menu item soft-deleted successfully',
      data: MenuItemDetailResponseDto.fromEntity(item),
    };
  }
}
