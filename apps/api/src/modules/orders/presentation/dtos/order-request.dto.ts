// ============================================================================
// Order Presentation — Request DTOs (Incoming Data)
// ============================================================================
// Request DTOs validate and type the data coming INTO the API.
// They are separate from domain entities because:
//   1. Not all entity fields should be settable by the client
//   2. Validation decorators are a presentation concern, not domain
//
// NOTE: For production, add class-validator decorators (@IsString, @IsNumber, etc.)
//       and use ValidationPipe in main.ts for automatic validation.
// ============================================================================

// ─── Add to Cart ──────────────────────────────────────────────────────
// Figma: "Add To Cart" button on item detail screen

export class AddToCartDto {
  /** ID of the menu item to add. */
  menuItemId!: string;

  /** Quantity (default 1). Figma: quantity +/- buttons. */
  quantity!: number;

  /** Optional note for the kitchen. Figma: "Add a note for the Kitchen..." */
  specialInstructions?: string;

  /** Selected add-ons. Figma: "+$1.50" checkboxes. */
  addOns?: Array<{ name: string; price: number }>;
}

// ─── Update Cart Item ─────────────────────────────────────────────────
// Figma: Quantity change on Order Summary screen

export class UpdateCartItemDto {
  quantity?: number;
  specialInstructions?: string;
}

// ─── Submit Order ─────────────────────────────────────────────────────
// Figma: "Place Order" button

export class SubmitOrderDto {
  orderId!: string;
}

// ─── Update Order Status (Waiter) ─────────────────────────────────────
// Figma: "Mark as Served", accept order, etc.

export class UpdateOrderStatusDto {
  /** Target status. Must be a valid transition from the current status. */
  status!: string;
}
