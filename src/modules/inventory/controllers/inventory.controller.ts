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
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiParam,
  ApiQuery,
  ApiSecurity,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { InventoryService } from '../services/inventory.service';
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
} from '../dto/inventory.dto';
import { ApiStandardErrors } from '../../../common/swagger';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';
import { RequirePermissions } from '../../../common/decorators/require-permissions.decorator';
import { Permission } from '@/authorization';

@ApiTags('Operations | Inventory & Suppliers')
@ApiSecurity('access-token')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  // ── Suppliers ─────────────────────────────────────────────────────────

  @Post('suppliers')
  @HttpCode(HttpStatus.CREATED)
  @RequirePermissions(Permission.SUPPLIERS_WRITE)
  @ApiOperation({
    summary: 'Register a new supplier for a branch',
    description: 'Requires suppliers:write permission. Enrolls vendor contact info and payment terms.',
  })
  @ApiCreatedResponse({ description: 'Supplier registered', type: SupplierResponseDto })
  @ApiStandardErrors(400, 401, 403, 409, 500)
  async createSupplier(@Body() dto: CreateSupplierDto) {
    return this.inventoryService.createSupplier(dto);
  }

  @Get('suppliers/branch/:branchId')
  @RequirePermissions(Permission.SUPPLIERS_READ)
  @ApiOperation({
    summary: 'List all suppliers for a branch',
    description: 'Requires suppliers:read permission. Lists all registered branch vendors.',
  })
  @ApiParam({ name: 'branchId', description: 'Branch UUID', example: 'ce7b4318-5e2e-4fcd-a459-0e1bc80a6f27' })
  @ApiOkResponse({ description: 'List of suppliers', type: [SupplierResponseDto] })
  @ApiStandardErrors(401, 403, 404, 500)
  async getBranchSuppliers(@Param('branchId') branchId: string) {
    return this.inventoryService.getBranchSuppliers(branchId);
  }

  @Get('suppliers/:id')
  @RequirePermissions(Permission.SUPPLIERS_READ)
  @ApiOperation({
    summary: 'Get supplier details by ID',
    description: 'Requires suppliers:read permission. Retrieves detailed vendor information.',
  })
  @ApiParam({ name: 'id', description: 'Supplier UUID', example: '33445566-7788-99aa-bbcc-ddeeff001122' })
  @ApiOkResponse({ description: 'Supplier details', type: SupplierResponseDto })
  @ApiStandardErrors(401, 403, 404, 500)
  async getSupplier(@Param('id') id: string) {
    return this.inventoryService.getSupplierById(id);
  }

  @Patch('suppliers/:id')
  @RequirePermissions(Permission.SUPPLIERS_WRITE)
  @ApiOperation({
    summary: 'Update supplier details',
    description: 'Requires suppliers:write permission. Modifies supplier contact or terms.',
  })
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
  @RequirePermissions(Permission.SUPPLIERS_WRITE)
  @ApiOperation({
    summary: 'Soft delete a supplier',
    description: 'Requires suppliers:write permission. Deactivates supplier record.',
  })
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
  @RequirePermissions(Permission.INVENTORY_WRITE)
  @ApiOperation({
    summary: 'Create an inventory category',
    description: 'Requires inventory:write permission. Creates category (e.g. Dairy, Produce).',
  })
  @ApiCreatedResponse({ description: 'Category created', type: InventoryCategoryResponseDto })
  @ApiStandardErrors(400, 401, 403, 409, 500)
  async createCategory(@Body() dto: CreateInventoryCategoryDto) {
    return this.inventoryService.createCategory(dto);
  }

  @Get('categories/branch/:branchId')
  @RequirePermissions(Permission.INVENTORY_READ)
  @ApiOperation({
    summary: 'List all inventory categories for a branch',
    description: 'Requires inventory:read permission. Returns categories configured for the branch.',
  })
  @ApiParam({ name: 'branchId', description: 'Branch UUID', example: 'ce7b4318-5e2e-4fcd-a459-0e1bc80a6f27' })
  @ApiOkResponse({ description: 'List of categories', type: [InventoryCategoryResponseDto] })
  @ApiStandardErrors(401, 403, 404, 500)
  async getBranchCategories(@Param('branchId') branchId: string) {
    return this.inventoryService.getBranchCategories(branchId);
  }

  @Get('categories/:id')
  @RequirePermissions(Permission.INVENTORY_READ)
  @ApiOperation({
    summary: 'Get category details by ID',
    description: 'Requires inventory:read permission. Returns category detail.',
  })
  @ApiParam({ name: 'id', description: 'Category UUID', example: '44556677-8899-00aa-bbcc-ddeeff001122' })
  @ApiOkResponse({ description: 'Category details', type: InventoryCategoryResponseDto })
  @ApiStandardErrors(401, 403, 404, 500)
  async getCategory(@Param('id') id: string) {
    return this.inventoryService.getCategoryById(id);
  }

  @Patch('categories/:id')
  @RequirePermissions(Permission.INVENTORY_UPDATE)
  @ApiOperation({
    summary: 'Update an inventory category',
    description: 'Requires inventory:update permission. Updates inventory category name or description.',
  })
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
  @RequirePermissions(Permission.INVENTORY_DELETE)
  @ApiOperation({
    summary: 'Delete an inventory category',
    description: 'Requires inventory:delete permission. Deletes category.',
  })
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
  @RequirePermissions(Permission.INVENTORY_WRITE)
  @ApiOperation({
    summary: 'Create an inventory item',
    description: 'Requires inventory:write permission. Registers ingredient/stock item with reorder thresholds.',
  })
  @ApiCreatedResponse({ description: 'Item created', type: InventoryItemResponseDto })
  @ApiStandardErrors(400, 401, 403, 409, 500)
  async createItem(@Body() dto: CreateInventoryItemDto) {
    return this.inventoryService.createItem(dto);
  }

  @Get('items/branch/:branchId')
  @RequirePermissions(Permission.INVENTORY_READ)
  @ApiOperation({
    summary: 'List inventory items for a branch, optionally filtering by low stock',
    description: 'Requires inventory:read permission. Lists stock items with current quantities.',
  })
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
  @RequirePermissions(Permission.INVENTORY_READ)
  @ApiOperation({
    summary: 'Get inventory item details by ID',
    description: 'Requires inventory:read permission. Retrieves detailed stock specifications.',
  })
  @ApiParam({ name: 'id', description: 'Item UUID', example: '55667788-8899-00aa-bbcc-ddeeff001122' })
  @ApiOkResponse({ description: 'Item details', type: InventoryItemResponseDto })
  @ApiStandardErrors(401, 403, 404, 500)
  async getItem(@Param('id') id: string) {
    return this.inventoryService.getItemById(id);
  }

  @Patch('items/:id')
  @RequirePermissions(Permission.INVENTORY_UPDATE)
  @ApiOperation({
    summary: 'Update an inventory item',
    description: 'Requires inventory:update permission. Updates item metadata and thresholds.',
  })
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
  @RequirePermissions(Permission.INVENTORY_DELETE)
  @ApiOperation({
    summary: 'Soft delete an inventory item',
    description: 'Requires inventory:delete permission. Soft-deletes inventory item.',
  })
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
  @RequirePermissions(Permission.INVENTORY_UPDATE)
  @ApiOperation({
    summary: 'Adjust stock level for an inventory item',
    description: 'Requires inventory:update permission. Logs stock count adjustment with audit reason.',
  })
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
  @RequirePermissions(Permission.INVENTORY_READ)
  @ApiOperation({
    summary: 'Get branch inventory stock summary (used by dashboard and AI tools)',
    description: 'Requires inventory:read permission. Computes stock count stats and critical alerts.',
  })
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

