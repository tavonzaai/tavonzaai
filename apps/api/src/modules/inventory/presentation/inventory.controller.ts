import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiParam,
  ApiQuery,
  ApiSecurity,
} from '@nestjs/swagger';
import { InventoryService } from '../application/inventory.service';
import {
  CreateSupplierDto,
  UpdateSupplierDto,
  CreateInventoryCategoryDto,
  UpdateInventoryCategoryDto,
  CreateInventoryItemDto,
  UpdateInventoryItemDto,
  AdjustStockDto,
  SupplierResponseDto,
  InventoryCategoryResponseDto,
  InventoryItemResponseDto,
  InventorySummaryResponseDto,
} from './http/dto/inventory.dto';
import { ApiStandardErrors } from '../../../common/swagger';

@ApiTags('Operations | Inventory & Suppliers')
@ApiSecurity('access-token')
@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  // ── Suppliers ─────────────────────────────────────────────────────────

  @Post('suppliers')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a new supplier for a branch' })
  @ApiCreatedResponse({ description: 'Supplier registered', type: SupplierResponseDto })
  @ApiStandardErrors(400, 401, 403, 409, 500)
  async createSupplier(@Body() dto: CreateSupplierDto) {
    return this.inventoryService.createSupplier(dto);
  }

  @Get('suppliers/branch/:branchId')
  @ApiOperation({ summary: 'List all suppliers for a branch' })
  @ApiParam({ name: 'branchId', description: 'Branch UUID', example: 'ce7b4318-5e2e-4fcd-a459-0e1bc80a6f27' })
  @ApiOkResponse({ description: 'List of suppliers', type: [SupplierResponseDto] })
  @ApiStandardErrors(401, 403, 404, 500)
  async getBranchSuppliers(@Param('branchId') branchId: string) {
    return this.inventoryService.getBranchSuppliers(branchId);
  }

  @Get('suppliers/:id')
  @ApiOperation({ summary: 'Get supplier details by ID' })
  @ApiParam({ name: 'id', description: 'Supplier UUID', example: '33445566-7788-99aa-bbcc-ddeeff001122' })
  @ApiOkResponse({ description: 'Supplier details', type: SupplierResponseDto })
  @ApiStandardErrors(401, 403, 404, 500)
  async getSupplier(@Param('id') id: string) {
    return this.inventoryService.getSupplierById(id);
  }

  @Patch('suppliers/:id')
  @ApiOperation({ summary: 'Update supplier details' })
  @ApiParam({ name: 'id', description: 'Supplier UUID', example: '33445566-7788-99aa-bbcc-ddeeff001122' })
  @ApiOkResponse({ description: 'Supplier updated', type: SupplierResponseDto })
  @ApiStandardErrors(400, 401, 403, 404, 500)
  async updateSupplier(
    @Param('id') id: string,
    @Body() dto: UpdateSupplierDto,
  ) {
    return this.inventoryService.updateSupplier(id, dto);
  }

  @Delete('suppliers/:id')
  @ApiOperation({ summary: 'Soft delete a supplier' })
  @ApiParam({ name: 'id', description: 'Supplier UUID', example: '33445566-7788-99aa-bbcc-ddeeff001122' })
  @ApiOkResponse({
    description: 'Supplier soft-deleted',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Supplier soft-deleted' },
      },
    },
  })
  @ApiStandardErrors(401, 403, 404, 500)
  async deleteSupplier(@Param('id') id: string) {
    return this.inventoryService.deleteSupplier(id);
  }

  // ── Categories ────────────────────────────────────────────────────────

  @Post('categories')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create an inventory category' })
  @ApiCreatedResponse({ description: 'Category created', type: InventoryCategoryResponseDto })
  @ApiStandardErrors(400, 401, 403, 409, 500)
  async createCategory(@Body() dto: CreateInventoryCategoryDto) {
    return this.inventoryService.createCategory(dto);
  }

  @Get('categories/branch/:branchId')
  @ApiOperation({ summary: 'List all inventory categories for a branch' })
  @ApiParam({ name: 'branchId', description: 'Branch UUID', example: 'ce7b4318-5e2e-4fcd-a459-0e1bc80a6f27' })
  @ApiOkResponse({ description: 'List of categories', type: [InventoryCategoryResponseDto] })
  @ApiStandardErrors(401, 403, 404, 500)
  async getBranchCategories(@Param('branchId') branchId: string) {
    return this.inventoryService.getBranchCategories(branchId);
  }

  @Get('categories/:id')
  @ApiOperation({ summary: 'Get category details by ID' })
  @ApiParam({ name: 'id', description: 'Category UUID', example: '44556677-8899-00aa-bbcc-ddeeff001122' })
  @ApiOkResponse({ description: 'Category details', type: InventoryCategoryResponseDto })
  @ApiStandardErrors(401, 403, 404, 500)
  async getCategory(@Param('id') id: string) {
    return this.inventoryService.getCategoryById(id);
  }

  @Patch('categories/:id')
  @ApiOperation({ summary: 'Update an inventory category' })
  @ApiParam({ name: 'id', description: 'Category UUID', example: '44556677-8899-00aa-bbcc-ddeeff001122' })
  @ApiOkResponse({ description: 'Category updated', type: InventoryCategoryResponseDto })
  @ApiStandardErrors(400, 401, 403, 404, 500)
  async updateCategory(
    @Param('id') id: string,
    @Body() dto: UpdateInventoryCategoryDto,
  ) {
    return this.inventoryService.updateCategory(id, dto);
  }

  @Delete('categories/:id')
  @ApiOperation({ summary: 'Delete an inventory category' })
  @ApiParam({ name: 'id', description: 'Category UUID', example: '44556677-8899-00aa-bbcc-ddeeff001122' })
  @ApiOkResponse({
    description: 'Category deleted',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Category deleted' },
      },
    },
  })
  @ApiStandardErrors(401, 403, 404, 500)
  async deleteCategory(@Param('id') id: string) {
    return this.inventoryService.deleteCategory(id);
  }

  // ── Items ─────────────────────────────────────────────────────────────

  @Post('items')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create an inventory item' })
  @ApiCreatedResponse({ description: 'Item created', type: InventoryItemResponseDto })
  @ApiStandardErrors(400, 401, 403, 409, 500)
  async createItem(@Body() dto: CreateInventoryItemDto) {
    return this.inventoryService.createItem(dto);
  }

  @Get('items/branch/:branchId')
  @ApiOperation({ summary: 'List inventory items for a branch, optionally filtering by low stock' })
  @ApiParam({ name: 'branchId', description: 'Branch UUID', example: 'ce7b4318-5e2e-4fcd-a459-0e1bc80a6f27' })
  @ApiQuery({ name: 'lowStockOnly', required: false, type: Boolean, description: 'Filter only items below or at low-stock threshold', example: false })
  @ApiOkResponse({ description: 'List of inventory items', type: [InventoryItemResponseDto] })
  @ApiStandardErrors(401, 403, 404, 500)
  async getBranchItems(
    @Param('branchId') branchId: string,
    @Query('lowStockOnly') lowStockOnly?: string
  ) {
    return this.inventoryService.getBranchItems(branchId, lowStockOnly === 'true');
  }

  @Get('items/:id')
  @ApiOperation({ summary: 'Get inventory item details by ID' })
  @ApiParam({ name: 'id', description: 'Item UUID', example: '55667788-8899-00aa-bbcc-ddeeff001122' })
  @ApiOkResponse({ description: 'Item details', type: InventoryItemResponseDto })
  @ApiStandardErrors(401, 403, 404, 500)
  async getItem(@Param('id') id: string) {
    return this.inventoryService.getItemById(id);
  }

  @Patch('items/:id')
  @ApiOperation({ summary: 'Update an inventory item' })
  @ApiParam({ name: 'id', description: 'Item UUID', example: '55667788-8899-00aa-bbcc-ddeeff001122' })
  @ApiOkResponse({ description: 'Item updated', type: InventoryItemResponseDto })
  @ApiStandardErrors(400, 401, 403, 404, 500)
  async updateItem(
    @Param('id') id: string,
    @Body() dto: UpdateInventoryItemDto,
  ) {
    return this.inventoryService.updateItem(id, dto);
  }

  @Delete('items/:id')
  @ApiOperation({ summary: 'Soft delete an inventory item' })
  @ApiParam({ name: 'id', description: 'Item UUID', example: '55667788-8899-00aa-bbcc-ddeeff001122' })
  @ApiOkResponse({
    description: 'Item soft-deleted',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Item soft-deleted' },
      },
    },
  })
  @ApiStandardErrors(401, 403, 404, 500)
  async deleteItem(@Param('id') id: string) {
    return this.inventoryService.deleteItem(id);
  }

  @Patch('items/:id/adjust')
  @ApiOperation({ summary: 'Adjust stock level for an inventory item' })
  @ApiParam({ name: 'id', description: 'Item UUID', example: '55667788-8899-00aa-bbcc-ddeeff001122' })
  @ApiOkResponse({ description: 'Item updated with new stock level', type: InventoryItemResponseDto })
  @ApiStandardErrors(400, 401, 403, 404, 500)
  async adjustStock(
    @Param('id') id: string,
    @Body() dto: AdjustStockDto
  ) {
    return this.inventoryService.adjustStock(id, dto);
  }

  @Get('summary/branch/:branchId')
  @ApiOperation({ summary: 'Get branch inventory stock summary (used by dashboard and AI tools)' })
  @ApiParam({ name: 'branchId', description: 'Branch UUID', example: 'ce7b4318-5e2e-4fcd-a459-0e1bc80a6f27' })
  @ApiQuery({ name: 'lowStockOnly', required: false, type: Boolean, description: 'Only count low stock items', example: false })
  @ApiOkResponse({ description: 'Inventory summary with low-stock counts', type: InventorySummaryResponseDto })
  @ApiStandardErrors(401, 403, 404, 500)
  async getInventorySummary(
    @Param('branchId') branchId: string,
    @Query('lowStockOnly') lowStockOnly?: string
  ) {
    return this.inventoryService.getInventorySummary(branchId, lowStockOnly === 'true');
  }
}

