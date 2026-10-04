// ============================================================================
// Order Presentation — OrderController
// ============================================================================
// Two groups of endpoints:
//
// CUSTOMER ENDPOINTS:
//   GET    /orders/cart/:branchId/:tableId    → Get/create cart
//   POST   /orders/cart/:orderId/items        → Add item to cart
//   PATCH  /orders/cart/:orderId/items/:itemId → Update cart item
//   DELETE /orders/cart/:orderId/items/:itemId → Remove cart item
//   POST   /orders/:orderId/submit            → Place order
//   GET    /orders/:orderId/track             → Track order status
//
// WAITER ENDPOINTS:
//   GET    /orders/branch/:branchId           → List orders
//   GET    /orders/:orderId                   → Order detail
//   PATCH  /orders/:orderId/status            → Update status
//
// NOTE: In production, customer vs waiter endpoints would be
//       separated by authorization guards. Kept together here
//       for simplicity in the walkthrough.
// ============================================================================

import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiOkResponse, ApiCreatedResponse } from '@nestjs/swagger';
import { OrderService } from '../../application/services/order.service';
import { OrderStatus } from '../../domain/enums/order-status.enum';
import {
  AddToCartDto,
  UpdateCartItemDto,
  UpdateOrderStatusDto,
} from '../dtos/order-request.dto';
import {
  CartResponseDto,
  OrderTrackingResponseDto,
  OrderListResponseDto,
  OrderDetailResponseDto,
} from '../dtos/order-response.dto';

@ApiTags('Customer | Orders')
@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  // ══════════════════════════════════════════════════════════════════════
  // CUSTOMER ENDPOINTS
  // ══════════════════════════════════════════════════════════════════════

  /**
   * GET /orders/cart/:branchId/:tableId
   *
   * Figma: Cart icon / Order Summary screen
   * Gets the current cart (DRAFT order) for this table.
   * Creates one if it doesn't exist.
   */
  @Get('cart/:branchId/:tableId')
  @ApiOperation({ summary: '[Customer] Get current cart for table' })
  @ApiOkResponse({ type: CartResponseDto })
  async getCart(
    @Param('branchId') branchId: string,
    @Param('tableId') tableId: string,
  ): Promise<CartResponseDto> {
    const order = await this.orderService.getOrCreateCart(branchId, tableId);
    return CartResponseDto.fromEntity(order);
  }

  /**
   * POST /orders/cart/:orderId/items
   *
   * Figma: "Add To Cart" button on item detail screen
   * Body: { menuItemId, quantity, specialInstructions?, addOns? }
   */
  @Post('cart/:orderId/items')
  @ApiOperation({ summary: '[Customer] Add item to cart' })
  @ApiCreatedResponse({ type: CartResponseDto })
  async addToCart(
    @Param('orderId') orderId: string,
    @Body() dto: AddToCartDto,
  ): Promise<CartResponseDto> {
    const order = await this.orderService.addToCart({
      orderId,
      menuItemId: dto.menuItemId,
      name: '', // Will be resolved from menu item in production
      unitPrice: 0, // Will be resolved from menu item in production
      quantity: dto.quantity,
      specialInstructions: dto.specialInstructions,
      addOns: dto.addOns,
    });
    return CartResponseDto.fromEntity(order);
  }

  /**
   * PATCH /orders/cart/:orderId/items/:itemId
   *
   * Figma: Quantity +/- on Order Summary screen
   */
  @Patch('cart/:orderId/items/:itemId')
  @ApiOperation({ summary: '[Customer] Update cart item quantity or instructions' })
  @ApiOkResponse({ type: CartResponseDto })
  async updateCartItem(
    @Param('orderId') orderId: string,
    @Param('itemId') itemId: string,
    @Body() dto: UpdateCartItemDto,
  ): Promise<CartResponseDto> {
    const order = await this.orderService.updateCartItem(orderId, itemId, dto);
    return CartResponseDto.fromEntity(order);
  }

  /**
   * DELETE /orders/cart/:orderId/items/:itemId
   *
   * Figma: Remove item from cart
   */
  @Delete('cart/:orderId/items/:itemId')
  @ApiOperation({ summary: '[Customer] Remove item from cart' })
  @ApiOkResponse({ type: CartResponseDto })
  async removeCartItem(
    @Param('orderId') orderId: string,
    @Param('itemId') itemId: string,
  ): Promise<CartResponseDto> {
    const order = await this.orderService.removeCartItem(orderId, itemId);
    return CartResponseDto.fromEntity(order);
  }

  /**
   * POST /orders/:orderId/submit
   *
   * Figma: "Place Order" button
   * Transitions order from DRAFT → SUBMITTED.
   * After this, the waiter can see and accept the order.
   */
  @Post(':orderId/submit')
  @ApiOperation({ summary: '[Customer] Place order (submit cart to waiter queue)' })
  @ApiOkResponse({ type: OrderTrackingResponseDto })
  async submitOrder(
    @Param('orderId') orderId: string,
  ): Promise<OrderTrackingResponseDto> {
    const order = await this.orderService.submitOrder(orderId);
    return OrderTrackingResponseDto.fromEntity(order);
  }

  /**
   * GET /orders/:orderId/track
   *
   * Figma: "Track Your Order" screen
   * Returns order status with timeline:
   *   ✅ Order Received (Completed)
   *   🔄 Preparing (In progress...)
   *   ⬜ Ready
   *   ⬜ Served
   */
  @Get(':orderId/track')
  @ApiOperation({ summary: '[Customer] Track order lifecycle status and progress' })
  @ApiOkResponse({ type: OrderTrackingResponseDto })
  async trackOrder(
    @Param('orderId') orderId: string,
  ): Promise<OrderTrackingResponseDto> {
    const order = await this.orderService.getOrderStatus(orderId);
    return OrderTrackingResponseDto.fromEntity(order);
  }

  // ══════════════════════════════════════════════════════════════════════
  // WAITER ENDPOINTS
  // ══════════════════════════════════════════════════════════════════════

  /**
   * GET /orders/branch/:branchId?status=SUBMITTED&tableId=xxx
   *
   * Figma (Waiter): Home → Pending Orders, Orders tab
   * Lists orders for a branch, with optional status/table filters.
   */
  @Get('branch/:branchId')
  @ApiOperation({ summary: '[Waiter/Manager] Get orders by branch with status and search filters' })
  @ApiOkResponse({ type: [OrderListResponseDto] })
  async getOrdersByBranch(
    @Param('branchId') branchId: string,
    @Query('status') status?: string,
    @Query('tableId') tableId?: string,
    @Query('search') search?: string,
  ): Promise<OrderListResponseDto[]> {
    const orders = await this.orderService.getOrdersByBranch(branchId, {
      status: status as OrderStatus | undefined,
      tableId,
      search,
    });
    return orders.map(OrderListResponseDto.fromEntity);
  }

  /**
   * GET /orders/:orderId
   *
   * Figma (Waiter): Table Details → expanded order card
   * Returns full order detail with items and all metadata.
   */
  @Get(':orderId')
  @ApiOperation({ summary: '[Customer/Waiter] Get order detail by order ID' })
  @ApiOkResponse({ type: OrderDetailResponseDto })
  async getOrderDetail(
    @Param('orderId') orderId: string,
  ): Promise<OrderDetailResponseDto> {
    const order = await this.orderService.getOrderStatus(orderId);
    return OrderDetailResponseDto.fromEntity(order);
  }

  /**
   * PATCH /orders/:orderId/status
   *
   * Figma (Waiter): "Mark as Served", accept order, etc.
   * Body: { status: "ACCEPTED" | "PREPARING" | "READY" | "SERVED" }
   *
   * The domain state machine validates the transition.
   * Invalid transitions return a 400 with helpful error message.
   */
  @Patch(':orderId/status')
  @ApiOperation({ summary: '[Waiter] Update order lifecycle status' })
  @ApiOkResponse({ type: OrderDetailResponseDto })
  async updateOrderStatus(
    @Param('orderId') orderId: string,
    @Body() dto: UpdateOrderStatusDto,
  ): Promise<OrderDetailResponseDto> {
    const order = await this.orderService.updateOrderStatus(
      orderId,
      dto.status as OrderStatus,
    );
    return OrderDetailResponseDto.fromEntity(order);
  }
}
