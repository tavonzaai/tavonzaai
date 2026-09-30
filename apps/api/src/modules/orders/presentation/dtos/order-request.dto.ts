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
} from 'class-validator';

// ─── Add to Cart ──────────────────────────────────────────────────────
// Figma: "Add To Cart" button on item detail screen

export class AddToCartDto {
  /** ID of the menu item to add. */
  @ApiProperty({ description: 'ID of the menu item to add' })
  @IsUUID()
  menuItemId!: string;

  /** Quantity (default 1). Figma: quantity +/- buttons. */
  @ApiProperty({ example: 1, minimum: 1 })
  @IsInt()
  @Min(1)
  quantity!: number;

  /** Optional note for the kitchen. Figma: "Add a note for the Kitchen..." */
  @ApiPropertyOptional({ example: 'Extra crispy' })
  @IsOptional()
  @IsString()
  specialInstructions?: string;

  /** Selected add-ons. Figma: "+$1.50" checkboxes. */
  @ApiPropertyOptional({ type: 'array' })
  @IsOptional()
  @IsArray()
  addOns?: Array<{ name: string; price: number }>;
}

// ─── Update Cart Item ─────────────────────────────────────────────────
// Figma: Quantity change on Order Summary screen

export class UpdateCartItemDto {
  @ApiPropertyOptional({ example: 2 })
  @IsOptional()
  @IsInt()
  @Min(1)
  quantity?: number;

  @ApiPropertyOptional({ example: 'No sauce' })
  @IsOptional()
  @IsString()
  specialInstructions?: string;
}

// ─── Submit Order ─────────────────────────────────────────────────────
// Figma: "Place Order" button

export class SubmitOrderDto {
  @ApiProperty()
  @IsUUID()
  orderId!: string;
}

// ─── Update Order Status (Waiter) ─────────────────────────────────────
// Figma: "Mark as Served", accept order, etc.

export class UpdateOrderStatusDto {
  /** Target status. Must be a valid transition from the current status. */
  @ApiProperty({ example: 'ACCEPTED' })
  @IsString()
  @IsNotEmpty()
  status!: string;
}
