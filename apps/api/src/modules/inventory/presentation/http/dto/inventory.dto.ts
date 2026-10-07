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

