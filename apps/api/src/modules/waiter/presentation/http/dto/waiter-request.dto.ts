// ============================================================================
// Waiter Request DTOs
// ============================================================================

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsUUID,
  IsNotEmpty,
  IsOptional,
  IsArray,
  IsInt,
  Min,
  ValidateNested,
  IsIn,
  IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';

// ── Assign Table ──────────────────────────────────────────────────────

export class AssignTableDto {
  @ApiProperty({ description: 'Branch ID' })
  @IsUUID()
  branchId!: string;

  @ApiProperty({ description: 'Waiter user ID' })
  @IsUUID()
  waiterId!: string;

  @ApiProperty({ description: 'Table ID to assign' })
  @IsUUID()
  tableId!: string;

  @ApiPropertyOptional({ description: 'Assignment session start timestamp', example: '2026-10-07T09:00:00Z' })
  @IsOptional()
  @IsDateString()
  sessionStart?: string;

  @ApiPropertyOptional({ description: 'Assignment session end timestamp', example: '2026-10-07T17:00:00Z' })
  @IsOptional()
  @IsDateString()
  sessionEnd?: string;

  @ApiPropertyOptional({ description: 'Shift label / operating hours', example: 'Lunch Shift (10:00 AM - 04:00 PM)' })
  @IsOptional()
  @IsString()
  shiftLabel?: string;
}

// ── Reject Order ──────────────────────────────────────────────────────

export class RejectOrderDto {
  @ApiProperty({ description: 'Order ID to reject' })
  @IsUUID()
  orderId!: string;

  @ApiPropertyOptional({
    description: 'Predefined rejection reason code',
    enum: [
      'ITEM_UNAVAILABLE',
      'KITCHEN_CAPACITY',
      'MODIFICATION_IMPOSSIBLE',
      'ALLERGY_CONCERN',
      'RESTAURANT_CLOSING',
      'OTHER',
    ],
    example: 'ITEM_UNAVAILABLE',
  })
  @IsOptional()
  @IsIn([
    'ITEM_UNAVAILABLE',
    'KITCHEN_CAPACITY',
    'MODIFICATION_IMPOSSIBLE',
    'ALLERGY_CONCERN',
    'RESTAURANT_CLOSING',
    'OTHER',
  ])
  reasonCode?:
    | 'ITEM_UNAVAILABLE'
    | 'KITCHEN_CAPACITY'
    | 'MODIFICATION_IMPOSSIBLE'
    | 'ALLERGY_CONCERN'
    | 'RESTAURANT_CLOSING'
    | 'OTHER';

  @ApiPropertyOptional({
    description: 'Predefined rejection reason code (alias for reasonCode)',
    enum: [
      'ITEM_UNAVAILABLE',
      'KITCHEN_CAPACITY',
      'MODIFICATION_IMPOSSIBLE',
      'ALLERGY_CONCERN',
      'RESTAURANT_CLOSING',
      'OTHER',
    ],
    example: 'ITEM_UNAVAILABLE',
  })
  @IsOptional()
  @IsIn([
    'ITEM_UNAVAILABLE',
    'KITCHEN_CAPACITY',
    'MODIFICATION_IMPOSSIBLE',
    'ALLERGY_CONCERN',
    'RESTAURANT_CLOSING',
    'OTHER',
  ])
  rejectionReasonCode?:
    | 'ITEM_UNAVAILABLE'
    | 'KITCHEN_CAPACITY'
    | 'MODIFICATION_IMPOSSIBLE'
    | 'ALLERGY_CONCERN'
    | 'RESTAURANT_CLOSING'
    | 'OTHER';

  @ApiProperty({ description: 'Reason for rejection', example: 'Item out of stock' })
  @IsString()
  @IsNotEmpty()
  reason!: string;
}

// ── Create Order On Behalf ────────────────────────────────────────────

export class OrderItemDto {
  @ApiProperty({ description: 'Menu item ID' })
  @IsUUID()
  menuItemId!: string;

  @ApiProperty({ description: 'Display name (denormalized)' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: '12.99' })
  @IsString()
  unitPrice!: string;

  @ApiProperty({ example: 2 })
  @IsInt()
  @Min(1)
  quantity!: number;

  @ApiPropertyOptional({ example: 'No onions' })
  @IsOptional()
  @IsString()
  specialInstructions?: string;

  @ApiPropertyOptional({ type: 'array', description: 'Selected add-ons' })
  @IsOptional()
  @IsArray()
  addOns?: Array<{ name: string; price: number }>;
}

export class CreateOrderOnBehalfDto {
  @ApiProperty({ description: 'Branch ID' })
  @IsUUID()
  branchId!: string;

  @ApiProperty({ description: 'Table ID' })
  @IsUUID()
  tableId!: string;

  @ApiProperty({ description: 'Active table session ID' })
  @IsUUID()
  tableSessionId!: string;

  @ApiProperty({
    description: 'Customer email or phone. If no account exists, one will be auto-created.',
    example: 'customer@example.com',
  })
  @IsString()
  @IsNotEmpty()
  customerIdentifier!: string;

  @ApiProperty({ type: [OrderItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items!: OrderItemDto[];
}

// ── Create Alert ──────────────────────────────────────────────────────

export class CreateAlertDto {
  @ApiProperty({ description: 'Branch ID' })
  @IsUUID()
  branchId!: string;

  @ApiProperty({ description: 'Table ID' })
  @IsUUID()
  tableId!: string;

  @ApiProperty({ description: 'Active table session ID' })
  @IsUUID()
  tableSessionId!: string;

  @ApiPropertyOptional({ description: 'Customer session ID (if logged in)' })
  @IsOptional()
  @IsUUID()
  customerSessionId?: string;

  @ApiProperty({
    enum: ['call_waiter', 'request_bill', 'need_help', 'custom'],
    description: 'Alert type',
  })
  @IsIn(['call_waiter', 'request_bill', 'need_help', 'custom'])
  type!: string;

  @ApiPropertyOptional({ description: 'Required for type=custom' })
  @IsOptional()
  @IsString()
  message?: string;
}

// ── Waiter Login Context ──────────────────────────────────────────────
// (Reuses LoginDto from identity, exposed here for documentation completeness)

export class WaiterLoginContextDto {
  @ApiProperty({ example: 'waiter@restaurant.com' })
  @IsString()
  email!: string;

  @ApiProperty({ example: 'SecurePass1' })
  @IsString()
  password!: string;
}
