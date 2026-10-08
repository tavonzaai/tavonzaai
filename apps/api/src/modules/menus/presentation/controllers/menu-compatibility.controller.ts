import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiOkResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { MenuService } from '../../application/services/menu.service';
import {
  MenuItemListResponseDto,
  MenuItemDetailResponseDto,
} from '../dtos/menu-response.dto';
import { ApiStandardErrors } from '../../../../common/swagger';

const DEFAULT_BRANCH_ID = 'ce7b4318-5e2e-4fcd-a459-0e1bc80a6f27';

@ApiTags('Menu Compatibility')
@Controller()
export class MenuCompatibilityController {
  constructor(private readonly menuService: MenuService) {}

  @Get('menu-categories')
  @ApiOperation({
    summary: 'Compatibility endpoint for menu categories',
    description: 'Legacy endpoint returning categories under a branch or restaurant wrapper',
  })
  @ApiQuery({ name: 'restaurantId', required: false, type: String, example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  @ApiQuery({ name: 'branchId', required: false, type: String, example: 'ce7b4318-5e2e-4fcd-a459-0e1bc80a6f27' })
  @ApiOkResponse({
    description: 'Wrapped menu category list',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'array',
          items: { $ref: '#/components/schemas/MenuCategoryResponseDto' },
        },
      },
    },
  })
  @ApiStandardErrors(400, 500)
  async getCategories(
    @Query('restaurantId') restaurantId?: string,
    @Query('branchId') branchId?: string,
  ) {
    const activeBranchId = branchId || restaurantId || DEFAULT_BRANCH_ID;
    const categories = await this.menuService.getCategories(activeBranchId);
    return {
      success: true,
      data: categories.map((c) => ({
        id: c.id,
        restaurantId: activeBranchId,
        name: c.name,
        description: c.description,
        displayOrder: 0,
        isActive: true,
        itemCount: c.itemCount,
      })),
    };
  }

  @Get('menu-categories/:id')
  @ApiOperation({ summary: 'Compatibility endpoint for single menu category' })
  @ApiParam({ name: 'id', type: String, example: '3fa85f64-5717-4562-b3fc-2c963f66afa6' })
  @ApiOkResponse({
    description: 'Wrapped single menu category or null',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: { $ref: '#/components/schemas/MenuCategoryResponseDto' },
      },
    },
  })
  @ApiStandardErrors(400, 404, 500)
  async getCategoryById(@Param('id') id: string) {
    const categories = await this.menuService.getCategories(DEFAULT_BRANCH_ID);
    const found = categories.find((c) => c.id === id);
    return {
      success: true,
      data: found
        ? {
            id: found.id,
            restaurantId: DEFAULT_BRANCH_ID,
            name: found.name,
            description: found.description,
            displayOrder: 0,
            isActive: true,
          }
        : null,
    };
  }

  @Get('menu-items')
  @ApiOperation({ summary: 'Compatibility endpoint for menu items with search and category filter' })
  @ApiQuery({ name: 'restaurantId', required: false, type: String, example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  @ApiQuery({ name: 'branchId', required: false, type: String, example: 'ce7b4318-5e2e-4fcd-a459-0e1bc80a6f27' })
  @ApiQuery({ name: 'categoryId', required: false, type: String, example: '3fa85f64-5717-4562-b3fc-2c963f66afa6' })
  @ApiQuery({ name: 'searchTerm', required: false, type: String, example: 'burger' })
  @ApiQuery({ name: 'search', required: false, type: String, example: 'burger' })
  @ApiQuery({ name: 'popular', required: false, type: Boolean, example: true })
  @ApiOkResponse({
    description: 'Wrapped menu items list',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'array',
          items: { $ref: '#/components/schemas/MenuItemListResponseDto' },
        },
      },
    },
  })
  @ApiStandardErrors(400, 500)
  async getItems(
    @Query('restaurantId') restaurantId?: string,
    @Query('branchId') branchId?: string,
    @Query('categoryId') categoryId?: string,
    @Query('searchTerm') searchTerm?: string,
    @Query('search') search?: string,
    @Query('popular') popular?: string,
  ) {
    const activeBranchId = branchId || restaurantId || DEFAULT_BRANCH_ID;
    const items = await this.menuService.getItemsByBranch(activeBranchId, {
      categoryId: categoryId === 'all' ? undefined : categoryId,
      search: searchTerm || search,
      isPopular: popular === 'true' ? true : undefined,
    });
    return {
      success: true,
      data: items.map(MenuItemListResponseDto.fromEntity),
    };
  }

  @Get('menu-items/:itemId')
  @ApiOperation({ summary: 'Compatibility endpoint for single menu item' })
  @ApiParam({ name: 'itemId', type: String, example: '4455110d-8720-41ab-bc92-d667c4c36001' })
  @ApiOkResponse({
    description: 'Wrapped single menu item detail',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: { $ref: '#/components/schemas/MenuItemDetailResponseDto' },
      },
    },
  })
  @ApiStandardErrors(400, 404, 500)
  async getItemDetail(@Param('itemId') itemId: string) {
    const item = await this.menuService.getItemDetail(itemId);
    return {
      success: true,
      data: MenuItemDetailResponseDto.fromEntity(item),
    };
  }
}
