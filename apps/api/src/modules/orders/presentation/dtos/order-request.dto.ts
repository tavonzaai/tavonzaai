// ============================================================================
// Order Presentation — Request DTOs (Incoming Data)
// ============================================================================

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsInt,
  Min,
  IsOptional,
  IsArray,
  IsUUID,
  ValidateNested,
  IsNumber,
  IsIn,
} from 'class-validator';
import { Type } from 'class-transformer';

export class AddOnItemDto {
  @ApiProperty({ example: 'Extra Aged Cheddar', description: 'Name of the add-on modifier' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: 1.50, description: 'Price of the add-on modifier' })
  @IsNumber()
  @Min(0)
  price!: number;
}

// ─── Add to Cart ──────────────────────────────────────────────────────
// Figma: "Add To Cart" button on item detail screen

export class AddToCartDto {
  @ApiProperty({
    description: 'UUID of the menu item to add',
    example: '4455110d-8720-41ab-bc92-d667c4c36001',
  })
  @IsUUID()
  menuItemId!: string;

  @ApiProperty({
    example: 1,
    minimum: 1,
    description: 'Quantity of items to add (default: 1)',
  })
  @IsInt()
  @Min(1)
  quantity!: number;

  @ApiPropertyOptional({
    example: 'Extra crispy fries and sauce on the side',
    description: 'Special culinary instructions or dietary notes for the kitchen',
  })
  @IsOptional()
  @IsString()
  specialInstructions?: string;

  @ApiPropertyOptional({
    type: [AddOnItemDto],
    description: 'Selected add-ons and toppings',
    example: [
      { name: 'Extra Cheddar', price: 1.50 },
      { name: 'Truffle Sauce', price: 2.00 },
    ],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AddOnItemDto)
  addOns?: AddOnItemDto[];
}

// ─── Update Cart Item ─────────────────────────────────────────────────
// Figma: Quantity change on Order Summary screen

export class UpdateCartItemDto {
  @ApiPropertyOptional({
    example: 2,
    minimum: 1,
    description: 'New quantity for this line item',
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  quantity?: number;

  @ApiPropertyOptional({
    example: 'No onions please',
    description: 'Updated special preparation instructions',
  })
  @IsOptional()
  @IsString()
  specialInstructions?: string;
}

// ─── Submit Order ─────────────────────────────────────────────────────
// Figma: "Place Order" button

export class SubmitOrderDto {
  @ApiProperty({
    description: 'UUID of the draft order to submit',
    example: '8877332f-4512-40bc-8012-d881e6e58003',
  })
  @IsUUID()
  orderId!: string;
}

// ─── Update Order Status (Waiter) ─────────────────────────────────────
// Figma: "Mark as Served", accept order, etc.

export const ALLOWED_ORDER_STATUSES = [
  'DRAFT',
  'SUBMITTED',
  'ACCEPTED',
  'PREPARING',
  'READY',
  'SERVED',
  'REJECTED',
  'CANCELLED',
] as const;

export class UpdateOrderStatusDto {
  @ApiProperty({
    description: 'Target order status according to the order lifecycle state machine',
    enum: ALLOWED_ORDER_STATUSES,
    example: 'ACCEPTED',
  })
  @IsString()
  @IsNotEmpty()
  @IsIn(ALLOWED_ORDER_STATUSES)
  status!: string;
}
