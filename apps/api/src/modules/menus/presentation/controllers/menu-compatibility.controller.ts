import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { MenuService } from '../../application/services/menu.service';
import {
  MenuItemListResponseDto,
  MenuItemDetailResponseDto,
} from '../dtos/menu-response.dto';

const DEFAULT_BRANCH_ID = 'ce7b4318-5e2e-4fcd-a459-0e1bc80a6f27';

@ApiTags('Menu Compatibility')
@Controller()
export class MenuCompatibilityController {
  constructor(private readonly menuService: MenuService) {}

  @Get('menu-categories')
  @ApiOperation({ summary: 'Compatibility endpoint for menu categories' })
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
  async getItemDetail(@Param('itemId') itemId: string) {
    const item = await this.menuService.getItemDetail(itemId);
    return {
      success: true,
      data: MenuItemDetailResponseDto.fromEntity(item),
    };
  }
}
