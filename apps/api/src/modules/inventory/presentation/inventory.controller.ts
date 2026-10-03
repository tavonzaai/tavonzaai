import {
  Controller,
  Get,
  Post,
  Patch,
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
} from '@nestjs/swagger';
import { InventoryService } from '../application/inventory.service';
import {
  CreateSupplierDto,
  CreateInventoryCategoryDto,
  CreateInventoryItemDto,
  AdjustStockDto,
} from './http/dto/inventory.dto';

@ApiTags('Operations | Inventory & Suppliers')
@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  // ── Suppliers ─────────────────────────────────────────────────────────

  @Post('suppliers')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a new supplier for a branch' })
  @ApiCreatedResponse({ description: 'Supplier registered' })
  async createSupplier(@Body() dto: CreateSupplierDto) {
    return this.inventoryService.createSupplier(dto);
  }

  @Get('suppliers/branch/:branchId')
  @ApiOperation({ summary: 'List all suppliers for a branch' })
  @ApiOkResponse({ description: 'List of suppliers' })
  async getBranchSuppliers(@Param('branchId') branchId: string) {
    return this.inventoryService.getBranchSuppliers(branchId);
  }

  @Get('suppliers/:id')
  @ApiOperation({ summary: 'Get supplier details by ID' })
  @ApiOkResponse({ description: 'Supplier details' })
  async getSupplier(@Param('id') id: string) {
    return this.inventoryService.getSupplierById(id);
  }

  // ── Categories ────────────────────────────────────────────────────────

  @Post('categories')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create an inventory category' })
  @ApiCreatedResponse({ description: 'Category created' })
  async createCategory(@Body() dto: CreateInventoryCategoryDto) {
    return this.inventoryService.createCategory(dto);
  }

  @Get('categories/branch/:branchId')
  @ApiOperation({ summary: 'List all inventory categories for a branch' })
  @ApiOkResponse({ description: 'List of categories' })
  async getBranchCategories(@Param('branchId') branchId: string) {
    return this.inventoryService.getBranchCategories(branchId);
  }

  // ── Items ─────────────────────────────────────────────────────────────

  @Post('items')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create an inventory item' })
  @ApiCreatedResponse({ description: 'Item created' })
  async createItem(@Body() dto: CreateInventoryItemDto) {
    return this.inventoryService.createItem(dto);
  }

  @Get('items/branch/:branchId')
  @ApiOperation({ summary: 'List inventory items for a branch, optionally filtering by low stock' })
  @ApiOkResponse({ description: 'List of inventory items' })
  async getBranchItems(
    @Param('branchId') branchId: string,
    @Query('lowStockOnly') lowStockOnly?: string
  ) {
    return this.inventoryService.getBranchItems(branchId, lowStockOnly === 'true');
  }

  @Get('items/:id')
  @ApiOperation({ summary: 'Get inventory item details by ID' })
  @ApiOkResponse({ description: 'Item details' })
  async getItem(@Param('id') id: string) {
    return this.inventoryService.getItemById(id);
  }

  @Patch('items/:id/adjust')
  @ApiOperation({ summary: 'Adjust stock level for an inventory item' })
  @ApiOkResponse({ description: 'Item updated with new stock level' })
  async adjustStock(
    @Param('id') id: string,
    @Body() dto: AdjustStockDto
  ) {
    return this.inventoryService.adjustStock(id, dto);
  }

  @Get('summary/branch/:branchId')
  @ApiOperation({ summary: 'Get branch inventory stock summary (used by dashboard and AI tools)' })
  @ApiOkResponse({ description: 'Inventory summary with low-stock counts' })
  async getInventorySummary(
    @Param('branchId') branchId: string,
    @Query('lowStockOnly') lowStockOnly?: string
  ) {
    return this.inventoryService.getInventorySummary(branchId, lowStockOnly === 'true');
  }
}
