import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
} from 'class-validator';
import type {
  KitchenItemStatus,
  KitchenStationType,
} from '../../../domain/entities/kitchen-ticket.entity';

const KITCHEN_ITEM_STATUSES: KitchenItemStatus[] = [
  'PENDING',
  'PREPARING',
  'READY',
  'SERVED',
  'UNAVAILABLE',
  'CANCELLED',
];

const KITCHEN_STATIONS: KitchenStationType[] = ['KITCHEN', 'BAR'];

export class UpdateKitchenItemStatusDto {
  @ApiProperty({ enum: KITCHEN_ITEM_STATUSES, example: 'READY', description: 'Updated line item preparation state' })
  @IsEnum(KITCHEN_ITEM_STATUSES)
  status!: KitchenItemStatus;

  @ApiPropertyOptional({ description: 'Optional explanation if item is marked UNAVAILABLE', example: 'Out of stock' })
  @IsOptional()
  @IsString()
  unavailableReason?: string;
}

export class ToggleItemAvailabilityDto {
  @ApiProperty({ description: 'Real-time 86 availability toggle', example: false })
  @IsBoolean()
  isAvailable!: boolean;
}

export class KitchenQueryDto {
  @ApiPropertyOptional({ enum: KITCHEN_STATIONS, description: 'Filter tickets by station type: KITCHEN or BAR', example: 'KITCHEN' })
  @IsOptional()
  @IsEnum(KITCHEN_STATIONS)
  station?: KitchenStationType;
}

// ── Response DTOs ─────────────────────────────────────────────────────

export class KitchenTicketItemResponseDto {
  @ApiProperty({ example: '9988443e-1122-43bb-a123-f992a7a69004', description: 'Order line item UUID' })
  id!: string;

  @ApiProperty({ example: '8877332f-4512-40bc-8012-d881e6e58003', description: 'Order UUID' })
  orderId!: string;

  @ApiProperty({ example: 'ORD-84920', description: 'Order display number' })
  orderNumber!: string;

  @ApiPropertyOptional({ example: 'Table 08', description: 'Table label' })
  tableLabel?: string | null;

  @ApiProperty({ example: 'Tavonza Signature Burger', description: 'Dish/Drink item name' })
  productName!: string;

  @ApiProperty({ example: 2, description: 'Quantity to prepare' })
  quantity!: number;

  @ApiProperty({ enum: ['KITCHEN', 'BAR'], example: 'KITCHEN', description: 'Preparation station' })
  stationType!: string;

  @ApiProperty({ enum: KITCHEN_ITEM_STATUSES, example: 'PREPARING', description: 'Item preparation status' })
  status!: string;

  @ApiPropertyOptional({ example: 'Extra crispy fries', description: 'Customer culinary instructions' })
  specialInstructions?: string | null;

  @ApiPropertyOptional({ example: 'ce7b4318-5e2e-4fcd-a459-0e1bc80a6f27', description: 'Branch UUID' })
  branchId?: string;

  @ApiPropertyOptional({ example: '8877332f-4512-40bc-8012-d881e6e58003', description: 'Table session UUID' })
  tableSessionId?: string | null;

  @ApiProperty({ example: '2026-10-08T14:35:00.000Z', description: 'Timestamp when item was sent to kitchen' })
  createdAt!: Date;
}

export class KitchenActionResponseDto {
  @ApiProperty({ example: true, description: 'Operation success flag' })
  ok!: boolean;
}
