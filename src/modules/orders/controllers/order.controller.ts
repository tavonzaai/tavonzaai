// ============================================================================
// Order Presentation — OrderController
// ============================================================================
// Customer cart endpoints live on CartController (`/cart`). Checkout is
// POST /orders with an Idempotency-Key. Staff endpoints require permission
// plus live branch access via BranchAccessService.
// ============================================================================

import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiHeader,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { Permission } from '@/authorization';
import { OrderService } from '../services/order.service';
import { CheckoutService } from '../services/checkout.service';
import { CustomerPrincipalService } from '../../identity/services/customer-principal.service';
import { BranchAccessService } from '../../authorization/services/branch-access.service';
import { OrderStatus } from '../domain/order-status.enum';
import { PlaceOrderDto, UpdateOrderStatusDto, ALLOWED_ORDER_STATUSES } from '../dto/order-request.dto';
import {
  OrderTrackingResponseDto,
  OrderListResponseDto,
  OrderDetailResponseDto,
} from '../dto/order-response.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { RequirePermissions } from '../../../common/decorators/require-permissions.decorator';
import type { JwtPayload } from '../../identity/adapters/jwt.strategy';
import { ApiStandardErrors } from '../../../common/swagger';
import { isCustomerPayload } from '../../identity/services/customer-principal.service';

@ApiTags('Orders')
@Controller('orders')
export class OrderController {
  constructor(
    private readonly orderService: OrderService,
    private readonly checkoutService: CheckoutService,
    private readonly principals: CustomerPrincipalService,
    private readonly branchAccess: BranchAccessService,
  ) {}

  // ══════════════════════════════════════════════════════════════════════
  // CUSTOMER ENDPOINTS
  // ══════════════════════════════════════════════════════════════════════

  /**
   * POST /orders — checkout the diner's server-side cart into a SUBMITTED order.
   * Requires Idempotency-Key. Cart items are cleared only after the order persists.
   */
  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: '[Customer] Place order from my cart',
    description:
      'Creates a SUBMITTED order from the authenticated diner\'s cart. ' +
      'Revalidates prices and stock, deducts inventory, then clears the cart in one transaction. ' +
      'Replaying the same Idempotency-Key returns the original order.',
  })
  @ApiHeader({
    name: 'Idempotency-Key',
    required: true,
    description: '16–100 characters: letters, digits, "-" or "_"',
  })
  @ApiOkResponse({ type: OrderTrackingResponseDto })
  @ApiStandardErrors(400, 401, 403, 409, 422, 500)
  async placeOrder(
    @CurrentUser() user: JwtPayload,
    @Body() dto: PlaceOrderDto,
    @Headers('idempotency-key') idempotencyKey?: string,
  ): Promise<OrderTrackingResponseDto> {
    const principal = await this.principals.resolve(user);
    const { order } = await this.checkoutService.placeOrder(principal, {
      idempotencyKey,
      qrToken: dto.qrToken,
    });
    return OrderTrackingResponseDto.fromEntity(order);
  }

  /**
   * GET /orders/me — orders placed by this diner only.
   */
  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: '[Customer] Get my orders',
    description: 'Lists orders owned by the authenticated customer account or guest session.',
  })
  @ApiQuery({ name: 'branchId', required: false, type: String })
  @ApiQuery({ name: 'status', required: false, enum: ALLOWED_ORDER_STATUSES })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiOkResponse({ type: [OrderListResponseDto] })
  @ApiStandardErrors(400, 401, 403, 500)
  async getMyOrders(
    @CurrentUser() user: JwtPayload,
    @Query('branchId') branchId?: string,
    @Query('status') status?: string,
    @Query('search') search?: string,
  ): Promise<OrderListResponseDto[]> {
    const principal = await this.principals.resolve(user);
    const orders = await this.orderService.getOrdersForCustomer(principal, {
      status: status as OrderStatus | undefined,
      search,
      branchId,
    });
    return orders.map(OrderListResponseDto.fromEntity);
  }

  /**
   * GET /orders/:orderId/track — owner or staff with branch access.
   */
  @Get(':orderId/track')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: '[Customer/Staff] Track order status' })
  @ApiParam({ name: 'orderId', type: String })
  @ApiOkResponse({ type: OrderTrackingResponseDto })
  @ApiStandardErrors(400, 401, 403, 404, 500)
  async trackOrder(
    @CurrentUser() user: JwtPayload,
    @Param('orderId') orderId: string,
  ): Promise<OrderTrackingResponseDto> {
    const order = await this.resolveReadableOrder(user, orderId);
    return OrderTrackingResponseDto.fromEntity(order);
  }

  // ══════════════════════════════════════════════════════════════════════
  // WAITER / STAFF ENDPOINTS
  // ══════════════════════════════════════════════════════════════════════

  @Get('branch/:branchId')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions(Permission.ORDERS_READ)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: '[Staff] Get orders by branch' })
  @ApiParam({ name: 'branchId', type: String })
  @ApiQuery({ name: 'status', required: false, enum: ALLOWED_ORDER_STATUSES })
  @ApiQuery({ name: 'tableId', required: false, type: String })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiOkResponse({ type: [OrderListResponseDto] })
  @ApiStandardErrors(400, 401, 403, 500)
  async getOrdersByBranch(
    @CurrentUser() user: JwtPayload,
    @Param('branchId', ParseUUIDPipe) branchId: string,
    @Query('status') status?: string,
    @Query('tableId') tableId?: string,
    @Query('search') search?: string,
  ): Promise<OrderListResponseDto[]> {
    await this.branchAccess.assertAccess(user, branchId);
    const orders = await this.orderService.getOrdersByBranch(
      branchId,
      {
        status: status as OrderStatus | undefined,
        tableId,
        search,
      },
      user,
    );
    return orders.map(OrderListResponseDto.fromEntity);
  }

  @Get(':orderId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: '[Customer/Staff] Get order detail' })
  @ApiParam({ name: 'orderId', type: String })
  @ApiOkResponse({ type: OrderDetailResponseDto })
  @ApiStandardErrors(400, 401, 403, 404, 500)
  async getOrderDetail(
    @CurrentUser() user: JwtPayload,
    @Param('orderId') orderId: string,
  ): Promise<OrderDetailResponseDto> {
    const order = await this.resolveReadableOrder(user, orderId);
    return OrderDetailResponseDto.fromEntity(order);
  }

  @Patch(':orderId/status')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions(Permission.ORDERS_UPDATE)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: '[Staff] Update order lifecycle status' })
  @ApiParam({ name: 'orderId', type: String })
  @ApiOkResponse({ type: OrderDetailResponseDto })
  @ApiStandardErrors(400, 401, 403, 404, 500)
  async updateOrderStatus(
    @CurrentUser() user: JwtPayload,
    @Param('orderId') orderId: string,
    @Body() dto: UpdateOrderStatusDto,
  ): Promise<OrderDetailResponseDto> {
    const existing = await this.orderService.getOrderForStaff(user, orderId);
    const order = await this.orderService.updateOrderStatus(
      existing.id,
      dto.status as OrderStatus,
    );
    return OrderDetailResponseDto.fromEntity(order);
  }

  @Delete(':orderId')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions(Permission.ORDERS_UPDATE)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: '[Staff] Cancel order' })
  @ApiParam({ name: 'orderId', type: String })
  @ApiOkResponse({ type: OrderDetailResponseDto })
  @ApiStandardErrors(400, 401, 403, 404, 500)
  async cancelOrder(
    @CurrentUser() user: JwtPayload,
    @Param('orderId') orderId: string,
  ): Promise<OrderDetailResponseDto> {
    const existing = await this.orderService.getOrderForStaff(user, orderId);
    const order = await this.orderService.updateOrderStatus(existing.id, 'CANCELLED');
    return OrderDetailResponseDto.fromEntity(order);
  }

  /** Customer ownership or staff branch access; unknown orders look the same as unauthorized. */
  private async resolveReadableOrder(user: JwtPayload, orderId: string) {
    if (isCustomerPayload(user)) {
      const principal = await this.principals.resolve(user);
      return this.orderService.getOrderForCustomer(principal, orderId);
    }
    return this.orderService.getOrderForStaff(user, orderId);
  }
}
