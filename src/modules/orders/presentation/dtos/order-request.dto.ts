// ============================================================================
// Order Presentation — Request DTOs (Incoming Data)
// ============================================================================

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsInt,
  Min,
  Max,
  MaxLength,
  IsOptional,
  IsArray,
  ArrayMaxSize,
  IsUUID,
  IsIn,
} from 'class-validator';
import {
  MAX_INSTRUCTIONS_LENGTH,
  MAX_LINE_QUANTITY,
} from '../../domain/cart-rules';

// ─── Add to Cart ──────────────────────────────────────────────────────
// Figma: "Add To Cart" button on item detail screen. Prices are never taken
// from the client; they are resolved from the menu and modifier catalog.

export class AddToCartDto {
  @ApiProperty({
    description: 'UUID of the menu item to add',
    example: '4455110d-8720-41ab-bc92-d667c4c36001',
  })
  @IsUUID()
  menuItemId!: string;

  @ApiProperty({ example: 1, minimum: 1, maximum: MAX_LINE_QUANTITY, description: 'Quantity to add' })
  @IsInt()
  @Min(1)
  @Max(MAX_LINE_QUANTITY)
  quantity!: number;

  @ApiPropertyOptional({
    type: [String],
    description: 'Selected add-on (modifier) ids offered for this menu item',
    example: ['6b1f8e3a-3c55-4a8e-8f7f-3b0e1a9b2c11'],
  })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(30)
  @IsUUID('all', { each: true })
  modifierIds?: string[];

  @ApiPropertyOptional({
    example: 'Extra crispy fries and sauce on the side',
    description: 'Special culinary instructions or dietary notes for the kitchen',
  })
  @IsOptional()
  @IsString()
  @MaxLength(MAX_INSTRUCTIONS_LENGTH)
  specialInstructions?: string;

  @ApiPropertyOptional({
    description:
      'Branch the diner is ordering from (resolved from the table QR). Ignored for seated guest sessions, whose branch comes from the token.',
    example: 'ce7b4318-5e2e-4fcd-a459-0e1bc80a6f27',
  })
  @IsOptional()
  @IsUUID()
  branchId?: string;
}

// ─── Update Cart Item ─────────────────────────────────────────────────
// Figma: Quantity change on Order Summary screen

export class UpdateCartItemDto {
  @ApiPropertyOptional({ example: 2, minimum: 1, maximum: MAX_LINE_QUANTITY, description: 'New quantity' })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(MAX_LINE_QUANTITY)
  quantity?: number;

  @ApiPropertyOptional({
    example: 'No onions please',
    description: 'Updated special preparation instructions (empty string clears them)',
  })
  @IsOptional()
  @IsString()
  @MaxLength(MAX_INSTRUCTIONS_LENGTH)
  specialInstructions?: string;
}

// ─── Place Order (checkout) ───────────────────────────────────────────
// Figma: "Place Order" button

export class PlaceOrderDto {
  @ApiPropertyOptional({
    description:
      'Opaque table QR token. Required for signed-in customers; seated guests use the table from their session.',
    example: '9f2c4e…',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  qrToken?: string;
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
