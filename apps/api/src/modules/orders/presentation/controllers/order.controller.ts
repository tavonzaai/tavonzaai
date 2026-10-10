// ============================================================================
// Order Presentation — OrderController
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
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { OrderService } from '../../application/services/order.service';
import { OrderStatus } from '../../domain/enums/order-status.enum';
import {
  AddToCartDto,
  UpdateCartItemDto,
  UpdateOrderStatusDto,
  ALLOWED_ORDER_STATUSES,
} from '../dtos/order-request.dto';
import {
  CartResponseDto,
  OrderTrackingResponseDto,
  OrderListResponseDto,
  OrderDetailResponseDto,
} from '../dtos/order-response.dto';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../../../../common/guards/optional-jwt-auth.guard';
import { PermissionsGuard } from '../../../../common/guards/permissions.guard';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';
import { RequirePermissions } from '../../../../common/decorators/require-permissions.decorator';
import { Permission } from '@tavonza/authorization';
import type { JwtPayload } from '../../../identity/infrastructure/adapters/jwt.strategy';
import { ApiStandardErrors } from '../../../../common/swagger';

@ApiTags('Customer | Orders')
@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  // ══════════════════════════════════════════════════════════════════════
  // CUSTOMER ENDPOINTS
  // ══════════════════════════════════════════════════════════════════════

  /**
   * GET /orders/cart
   * Gets or creates the current cart for the authenticated guest/table session.
   */
  @Get('cart')
  @UseGuards(OptionalJwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: '[Customer] Get current cart from session or parameters',
    description: 'Retrieves or auto-initializes the active DRAFT cart for the current dining table and guest session.',
  })
  @ApiQuery({
    name: 'branchId',
    required: false,
    type: String,
    description: 'Branch UUID (optional if embedded in session token)',
    example: 'ce7b4318-5e2e-4fcd-a459-0e1bc80a6f27',
  })
  @ApiQuery({
    name: 'tableId',
    required: false,
    type: String,
    description: 'Table UUID (optional if embedded in session token)',
    example: '5298804e-5847-4e5a-bdba-73a8f06d9ed2',
  })
  @ApiOkResponse({
    type: CartResponseDto,
    description: 'Active draft cart state with itemized line totals and charges',
  })
  @ApiStandardErrors(400, 404, 500)
  async getCartFromSession(
    @CurrentUser() user?: JwtPayload,
    @Query('branchId') qBranchId?: string,
    @Query('tableId') qTableId?: string,
  ): Promise<CartResponseDto> {
    const branchId = user?.branchId || qBranchId;
    const tableId = (user as any)?.tableId || qTableId;
    if (!branchId || !tableId) {
      throw new BadRequestException('branchId and tableId are required');
    }
    const guestSessionId = (user as any)?.guestSessionId;
    const tableSessionId = (user as any)?.tableSessionId;
    const order = await this.orderService.getOrCreateCart(
      branchId,
      tableId,
      guestSessionId,
      tableSessionId,
    );
    return CartResponseDto.fromEntity(order);
  }

  /**
   * GET /orders/cart/:branchId/:tableId
   * Figma: Cart icon / Order Summary screen
   */
  @Get('cart/:branchId/:tableId')
  @UseGuards(OptionalJwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: '[Customer] Get current cart for table by path parameters',
    description: 'Direct table-based cart lookup. Returns existing DRAFT order or creates a new one.',
  })
  @ApiParam({
    name: 'branchId',
    type: String,
    description: 'Branch UUID',
    example: 'ce7b4318-5e2e-4fcd-a459-0e1bc80a6f27',
  })
  @ApiParam({
    name: 'tableId',
    type: String,
    description: 'Table UUID',
    example: '5298804e-5847-4e5a-bdba-73a8f06d9ed2',
  })
  @ApiOkResponse({
    type: CartResponseDto,
    description: 'Active draft cart',
  })
  @ApiStandardErrors(400, 404, 500)
  async getCart(
    @Param('branchId') branchId: string,
    @Param('tableId') tableId: string,
    @CurrentUser() user?: JwtPayload,
  ): Promise<CartResponseDto> {
    const guestSessionId = (user as any)?.guestSessionId;
    const tableSessionId = (user as any)?.tableSessionId;
    const effectiveBranchId = user?.branchId || branchId;
    const effectiveTableId = (user as any)?.tableId || tableId;
    const order = await this.orderService.getOrCreateCart(
      effectiveBranchId,
      effectiveTableId,
      guestSessionId,
      tableSessionId,
    );
    return CartResponseDto.fromEntity(order);
  }

  /**
   * GET /orders/me
   * Figma: Orders tab on Customer Dashboard
   */
  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: '[Customer] Get my session orders',
    description: 'Lists all orders submitted during the current customer / guest dining session.',
  })
  @ApiQuery({
    name: 'branchId',
    required: false,
    type: String,
    description: 'Branch UUID filter',
    example: 'ce7b4318-5e2e-4fcd-a459-0e1bc80a6f27',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ALLOWED_ORDER_STATUSES,
    description: 'Filter by order status',
    example: 'SUBMITTED',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description: 'Search string by order number or item name',
    example: 'ORD-84',
  })
  @ApiOkResponse({
    type: [OrderListResponseDto],
    description: 'Array of orders matching session criteria',
  })
  @ApiStandardErrors(400, 401, 500)
  async getMyOrders(
    @CurrentUser() user: JwtPayload,
    @Query('branchId') qBranchId?: string,
    @Query('status') status?: string,
    @Query('search') search?: string,
  ): Promise<OrderListResponseDto[]> {
    const branchId = user?.branchId || qBranchId;
    if (!branchId) return [];

    const guestSessionId = (user as any)?.guestSessionId;
    const tableSessionId = (user as any)?.tableSessionId;
    const orders = await this.orderService.getOrdersByBranch(branchId, {
      status: status as OrderStatus | undefined,
      search,
      guestSessionId,
      tableSessionId,
    });
    return orders.map(OrderListResponseDto.fromEntity);
  }

  /**
   * POST /orders/cart/:orderId/items
   * Figma: "Add To Cart" button on item detail screen
   */
  @Post('cart/:orderId/items')
  @ApiOperation({
    summary: '[Customer] Add item to cart',
    description: 'Appends a dish to the draft order with selected addons and special culinary notes.',
  })
  @ApiParam({
    name: 'orderId',
    type: String,
    description: 'Draft Order UUID',
    example: '8877332f-4512-40bc-8012-d881e6e58003',
  })
  @ApiCreatedResponse({
    type: CartResponseDto,
    description: 'Updated cart contents and recalculated totals',
  })
  @ApiStandardErrors(400, 404, 500)
  async addToCart(
    @Param('orderId') orderId: string,
    @Body() dto: AddToCartDto,
  ): Promise<CartResponseDto> {
    const order = await this.orderService.addToCart({
      orderId,
      menuItemId: dto.menuItemId,
      name: '',
      unitPrice: 0,
      quantity: dto.quantity,
      specialInstructions: dto.specialInstructions,
      addOns: dto.addOns,
    });
    return CartResponseDto.fromEntity(order);
  }

  /**
   * PATCH /orders/cart/:orderId/items/:itemId
   * Figma: Quantity +/- on Order Summary screen
   */
  @Patch('cart/:orderId/items/:itemId')
  @ApiOperation({
    summary: '[Customer] Update cart item quantity or instructions',
    description: 'Modifies the quantity or special instructions of a specific item in the draft cart.',
  })
  @ApiParam({
    name: 'orderId',
    type: String,
    description: 'Order UUID',
    example: '8877332f-4512-40bc-8012-d881e6e58003',
  })
  @ApiParam({
    name: 'itemId',
    type: String,
    description: 'Order Line Item UUID',
    example: '9988443e-1122-43bb-a123-f992a7a69004',
  })
  @ApiOkResponse({
    type: CartResponseDto,
    description: 'Updated cart contents',
  })
  @ApiStandardErrors(400, 404, 500)
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
   * Figma: Remove item from cart
   */
  @Delete('cart/:orderId/items/:itemId')
  @ApiOperation({
    summary: '[Customer] Remove item from cart',
    description: 'Removes a line item completely from the active cart and recomputes tax and service fees.',
  })
  @ApiParam({
    name: 'orderId',
    type: String,
    description: 'Order UUID',
    example: '8877332f-4512-40bc-8012-d881e6e58003',
  })
  @ApiParam({
    name: 'itemId',
    type: String,
    description: 'Order Line Item UUID',
    example: '9988443e-1122-43bb-a123-f992a7a69004',
  })
  @ApiOkResponse({
    type: CartResponseDto,
    description: 'Cart after item removal',
  })
  @ApiStandardErrors(400, 404, 500)
  async removeCartItem(
    @Param('orderId') orderId: string,
    @Param('itemId') itemId: string,
  ): Promise<CartResponseDto> {
    const order = await this.orderService.removeCartItem(orderId, itemId);
    return CartResponseDto.fromEntity(order);
  }

  /**
   * POST /orders/:orderId/submit
   * Figma: "Place Order" button
   */
  @Post(':orderId/submit')
  @ApiOperation({
    summary: '[Customer] Place order (submit cart to waiter queue)',
    description: 'Transitions order from DRAFT to SUBMITTED state. Broadcasts realtime notification to floor staff.',
  })
  @ApiParam({
    name: 'orderId',
    type: String,
    description: 'Order UUID',
    example: '8877332f-4512-40bc-8012-d881e6e58003',
  })
  @ApiOkResponse({
    type: OrderTrackingResponseDto,
    description: 'Submitted order with initial tracking milestone',
  })
  @ApiStandardErrors(400, 404, 409, 500)
  async submitOrder(
    @Param('orderId') orderId: string,
  ): Promise<OrderTrackingResponseDto> {
    const order = await this.orderService.submitOrder(orderId);
    return OrderTrackingResponseDto.fromEntity(order);
  }

  /**
   * GET /orders/:orderId/track
   * Figma: "Track Your Order" screen
   */
  @Get(':orderId/track')
  @ApiOperation({
    summary: '[Customer] Track order lifecycle status and progress',
    description: 'Returns real-time status and timeline progression (Submitted -> Accepted -> In Kitchen -> Ready -> Served).',
  })
  @ApiParam({
    name: 'orderId',
    type: String,
    description: 'Order UUID',
    example: '8877332f-4512-40bc-8012-d881e6e58003',
  })
  @ApiOkResponse({
    type: OrderTrackingResponseDto,
    description: 'Order tracking timeline data',
  })
  @ApiStandardErrors(400, 404, 500)
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
   * GET /orders/branch/:branchId
   */
  @Get('branch/:branchId')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions(Permission.ORDERS_READ)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: '[Waiter/Manager] Get orders by branch with status and search filters',
    description: 'Returns list of orders across tables in the branch for operational monitoring and status management.',
  })
  @ApiParam({
    name: 'branchId',
    type: String,
    description: 'Branch UUID',
    example: 'ce7b4318-5e2e-4fcd-a459-0e1bc80a6f27',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ALLOWED_ORDER_STATUSES,
    description: 'Filter by lifecycle status',
    example: 'SUBMITTED',
  })
  @ApiQuery({
    name: 'tableId',
    required: false,
    type: String,
    description: 'Filter by specific table UUID',
    example: '5298804e-5847-4e5a-bdba-73a8f06d9ed2',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description: 'Search string',
    example: 'ORD-84',
  })
  @ApiOkResponse({
    type: [OrderListResponseDto],
    description: 'List of matching branch orders',
  })
  @ApiStandardErrors(400, 401, 403, 500)
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
   */
  @Get(':orderId')
  @ApiOperation({
    summary: '[Customer/Waiter] Get order detail by order ID',
    description: 'Returns complete order specifications including all line items, modifiers, status timestamps, and bill totals.',
  })
  @ApiParam({
    name: 'orderId',
    type: String,
    description: 'Order UUID',
    example: '8877332f-4512-40bc-8012-d881e6e58003',
  })
  @ApiOkResponse({
    type: OrderDetailResponseDto,
    description: 'Complete order detail',
  })
  @ApiStandardErrors(400, 404, 500)
  async getOrderDetail(
    @Param('orderId') orderId: string,
  ): Promise<OrderDetailResponseDto> {
    const order = await this.orderService.getOrderStatus(orderId);
    return OrderDetailResponseDto.fromEntity(order);
  }

  /**
   * PATCH /orders/:orderId/status
   */
  @Patch(':orderId/status')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions(Permission.ORDERS_UPDATE)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: '[Waiter] Update order lifecycle status',
    description: 'Validates and executes lifecycle state transition (e.g. ACCEPTED, PREPARING, READY, SERVED, REJECTED).',
  })
  @ApiParam({
    name: 'orderId',
    type: String,
    description: 'Order UUID',
    example: '8877332f-4512-40bc-8012-d881e6e58003',
  })
  @ApiOkResponse({
    type: OrderDetailResponseDto,
    description: 'Order after status progression',
  })
  @ApiStandardErrors(400, 401, 403, 404, 500)
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

  /**
   * DELETE /orders/:orderId
   */
  @Delete(':orderId')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions(Permission.ORDERS_UPDATE)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: '[Staff] Cancel (soft delete) order',
    description: 'Cancels an active order, transitions state to CANCELLED, and releases any pending kitchen tickets.',
  })
  @ApiParam({
    name: 'orderId',
    type: String,
    description: 'Order UUID',
    example: '8877332f-4512-40bc-8012-d881e6e58003',
  })
  @ApiOkResponse({
    type: OrderDetailResponseDto,
    description: 'Cancelled order record',
  })
  @ApiStandardErrors(400, 401, 403, 404, 500)
  async cancelOrder(
    @Param('orderId') orderId: string,
  ): Promise<OrderDetailResponseDto> {
    const order = await this.orderService.updateOrderStatus(orderId, 'CANCELLED');
    return OrderDetailResponseDto.fromEntity(order);
  }
}
