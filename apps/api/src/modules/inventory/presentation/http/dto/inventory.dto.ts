import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';
import type { InventoryUnit } from '../../../domain/entities/inventory.entity';

const INVENTORY_UNITS: InventoryUnit[] = [
  'KG',
  'GRAM',
  'LITER',
  'ML',
  'PIECE',
  'BOX',
  'PACKET',
];

export class CreateSupplierDto {
  @ApiProperty({ description: 'Branch ID' })
  @IsUUID()
  branchId!: string;

  @ApiProperty({ description: 'Supplier business name', example: 'Sysco Food Services' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiPropertyOptional({ description: 'Contact person name', example: 'John Miller' })
  @IsOptional()
  @IsString()
  contactName?: string;

  @ApiPropertyOptional({ description: 'Email address' })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiPropertyOptional({ description: 'Phone number' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ description: 'Physical address' })
  @IsOptional()
  @IsString()
  address?: string;
}

export class CreateInventoryCategoryDto {
  @ApiProperty({ description: 'Branch ID' })
  @IsUUID()
  branchId!: string;

  @ApiProperty({ description: 'Category name', example: 'Meat & Poultry' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiPropertyOptional({ description: 'Description' })
  @IsOptional()
  @IsString()
  description?: string;
}

export class CreateInventoryItemDto {
  @ApiProperty({ description: 'Branch ID' })
  @IsUUID()
  branchId!: string;

  @ApiProperty({ description: 'Supplier ID' })
  @IsUUID()
  supplierId!: string;

  @ApiProperty({ description: 'Category ID' })
  @IsUUID()
  categoryId!: string;

  @ApiProperty({ description: 'Item name', example: 'Beef Patty (200g)' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiPropertyOptional({ description: 'Stock Keeping Unit SKU', example: 'BEEF-PATTY-200' })
  @IsOptional()
  @IsString()
  sku?: string;

  @ApiProperty({ enum: INVENTORY_UNITS, example: 'KG' })
  @IsEnum(INVENTORY_UNITS)
  unit!: InventoryUnit;

  @ApiPropertyOptional({ description: 'Initial stock level', example: 50.0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  currentStock?: number;

  @ApiPropertyOptional({ description: 'Low stock notification threshold', example: 10.0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  lowStockThreshold?: number;

  @ApiPropertyOptional({ description: 'Cost per unit', example: 12.5 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  costPerUnit?: number;
}

export class AdjustStockDto {
  @ApiProperty({ description: 'Stock delta to apply (+ for restock, - for usage/waste)', example: 10.5 })
  @IsNumber()
  delta!: number;

  @ApiPropertyOptional({ description: 'Reason for adjustment', example: 'Weekly delivery received' })
  @IsOptional()
  @IsString()
  reason?: string;
}

export class UpdateSupplierDto {
  @ApiPropertyOptional({ description: 'Supplier business name' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: 'Contact person name' })
  @IsOptional()
  @IsString()
  contactName?: string;

  @ApiPropertyOptional({ description: 'Email address' })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiPropertyOptional({ description: 'Phone number' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ description: 'Physical address' })
  @IsOptional()
  @IsString()
  address?: string;
}

export class UpdateInventoryCategoryDto {
  @ApiPropertyOptional({ description: 'Category name' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: 'Description' })
  @IsOptional()
  @IsString()
  description?: string;
}

export class UpdateInventoryItemDto {
  @ApiPropertyOptional({ description: 'Item name' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: 'Stock Keeping Unit SKU' })
  @IsOptional()
  @IsString()
  sku?: string;

  @ApiPropertyOptional({ enum: INVENTORY_UNITS })
  @IsOptional()
  @IsEnum(INVENTORY_UNITS)
  unit?: InventoryUnit;

  @ApiPropertyOptional({ description: 'Low stock notification threshold' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  lowStockThreshold?: number;

  @ApiPropertyOptional({ description: 'Cost per unit' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  costPerUnit?: number;
}

// ── Response DTOs ─────────────────────────────────────────────────────

export class SupplierResponseDto {
  @ApiProperty({ example: '33445566-7788-99aa-bbcc-ddeeff001122', description: 'Supplier UUID' })
  id!: string;

  @ApiProperty({ example: 'ce7b4318-5e2e-4fcd-a459-0e1bc80a6f27', description: 'Branch UUID' })
  branchId!: string;

  @ApiProperty({ example: 'Sysco Food Services', description: 'Supplier business name' })
  name!: string;

  @ApiPropertyOptional({ example: 'John Miller', description: 'Contact representative' })
  contactName?: string | null;

  @ApiPropertyOptional({ example: 'orders@sysco.example.com', description: 'Contact email' })
  email?: string | null;

  @ApiPropertyOptional({ example: '+15551234567', description: 'Contact phone' })
  phone?: string | null;

  @ApiPropertyOptional({ example: '100 Distribution Way, Suite 400', description: 'Warehouse physical address' })
  address?: string | null;

  @ApiProperty({ example: '2026-10-01T12:00:00.000Z', description: 'Record creation timestamp' })
  createdAt!: Date;

  @ApiProperty({ example: '2026-10-01T12:00:00.000Z', description: 'Record update timestamp' })
  updatedAt!: Date;
}

export class InventoryCategoryResponseDto {
  @ApiProperty({ example: '44556677-8899-00aa-bbcc-ddeeff001122', description: 'Inventory category UUID' })
  id!: string;

  @ApiProperty({ example: 'ce7b4318-5e2e-4fcd-a459-0e1bc80a6f27', description: 'Branch UUID' })
  branchId!: string;

  @ApiProperty({ example: 'Meat & Poultry', description: 'Category name' })
  name!: string;

  @ApiPropertyOptional({ example: 'Raw proteins, poultry, and beef cuts', description: 'Category description' })
  description?: string | null;

  @ApiProperty({ example: '2026-10-01T12:00:00.000Z', description: 'Creation timestamp' })
  createdAt!: Date;

  @ApiProperty({ example: '2026-10-01T12:00:00.000Z', description: 'Update timestamp' })
  updatedAt!: Date;
}

export class InventoryItemResponseDto {
  @ApiProperty({ example: '55667788-8899-00aa-bbcc-ddeeff001122', description: 'Inventory item UUID' })
  id!: string;

  @ApiProperty({ example: 'ce7b4318-5e2e-4fcd-a459-0e1bc80a6f27', description: 'Branch UUID' })
  branchId!: string;

  @ApiProperty({ example: '33445566-7788-99aa-bbcc-ddeeff001122', description: 'Supplier UUID' })
  supplierId!: string;

  @ApiProperty({ example: '44556677-8899-00aa-bbcc-ddeeff001122', description: 'Category UUID' })
  categoryId!: string;

  @ApiProperty({ example: 'Beef Patty (200g)', description: 'Item name' })
  name!: string;

  @ApiPropertyOptional({ example: 'BEEF-PATTY-200', description: 'Stock Keeping Unit SKU' })
  sku?: string | null;

  @ApiProperty({ example: 'KG', enum: INVENTORY_UNITS, description: 'Measurement unit' })
  unit!: string;

  @ApiProperty({ example: 45.5, description: 'Current stock balance on hand' })
  currentStock!: number;

  @ApiProperty({ example: 10.0, description: 'Low stock re-order alert threshold' })
  lowStockThreshold!: number;

  @ApiProperty({ example: 12.50, description: 'Cost per unit in branch currency' })
  costPerUnit!: number;

  @ApiProperty({ example: false, description: 'True if currentStock <= lowStockThreshold' })
  isLowStock!: boolean;

  @ApiProperty({ example: '2026-10-01T12:00:00.000Z', description: 'Creation timestamp' })
  createdAt!: Date;

  @ApiProperty({ example: '2026-10-08T14:40:00.000Z', description: 'Last adjusted timestamp' })
  updatedAt!: Date;
}

export class InventorySummaryResponseDto {
  @ApiProperty({ example: 64, description: 'Total tracked inventory items' })
  totalItems!: number;

  @ApiProperty({ example: 3, description: 'Count of items currently below low-stock threshold' })
  lowStockCount!: number;

  @ApiProperty({ example: 8, description: 'Total registered suppliers' })
  totalSuppliers!: number;

  @ApiProperty({ example: 6, description: 'Total inventory categories' })
  totalCategories!: number;
}


