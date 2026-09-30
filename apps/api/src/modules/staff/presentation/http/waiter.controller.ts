// ============================================================================
// Waiter Controller — REST endpoints for waiter operations
// ============================================================================
//
// All endpoints require:
//   - JWT bearer token (role='waiter')
//   - permissions checked at application service layer (table ownership scope)
//
// Swagger group: 'Waiter | Tables' / 'Waiter | Orders' / 'Waiter | Alerts'
// ============================================================================

import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiForbiddenResponse,
  ApiBadRequestResponse,
  ApiQuery,
} from '@nestjs/swagger';
import { WaiterService } from '../../application/services/waiter.service';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../../../common/guards/permissions.guard';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';
import { RequirePermissions } from '../../../../common/decorators/require-permissions.decorator';
import { Permission } from '@tavonza/authorization';
import type { JwtPayload } from '../../../identity/infrastructure/adapters/jwt.strategy';
import {
  AssignTableDto,
  CreateOrderOnBehalfDto,
  CreateAlertDto,
} from './dto/waiter-request.dto';
import {
  TableAssignmentDto,
  WaiterOrderSummaryDto,
  WaiterOrderDetailDto,
  CreateOrderOnBehalfResponseDto,
  CustomerAlertDto,
  WaiterMessageDto,
} from './dto/waiter-response.dto';

// ─── Waiter | Tables ──────────────────────────────────────────────────────────

@ApiTags('Waiter | Tables')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('waiter/tables')
export class WaiterTablesController {
  constructor(private readonly waiterService: WaiterService) {}

  /**
   * GET /waiter/tables
   * Returns all tables assigned to this waiter for today's shift in the given branch.
   */
  @Get()
  @RequirePermissions(Permission.TABLES_READ)
  @ApiOperation({ summary: '[Waiter] Get my assigned tables for today' })
  @ApiOkResponse({ type: [TableAssignmentDto] })
  @ApiQuery({ name: 'branchId', required: true, type: String })
  async getMyTables(
    @CurrentUser() user: JwtPayload,
    @Query('branchId') branchId: string,
  ): Promise<TableAssignmentDto[]> {
    return this.waiterService.getMyTables(user.sub, branchId);
  }

  /**
   * POST /waiter/tables/assign
   * Manager assigns a table to a waiter for today's shift.
   */
  @Post('assign')
  @RequirePermissions(Permission.TABLES_UPDATE)
  @ApiOperation({ summary: '[Manager] Assign a table to a waiter' })
  @ApiCreatedResponse({ type: TableAssignmentDto })
  async assignTable(
    @CurrentUser() user: JwtPayload,
    @Body() dto: AssignTableDto,
  ): Promise<TableAssignmentDto> {
    return this.waiterService.assignTable(dto, user.sub);
  }
}

// ─── Waiter | Orders ──────────────────────────────────────────────────────────

@ApiTags('Waiter | Orders')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('waiter/orders')
export class WaiterOrdersController {
  constructor(private readonly waiterService: WaiterService) {}

  /**
   * GET /waiter/orders/pending
   * Lists all SUBMITTED orders at waiter's assigned tables — the incoming queue.
   */
  @Get('pending')
  @RequirePermissions(Permission.ORDERS_READ)
  @ApiOperation({ summary: '[Waiter] Get pending (unaccepted) orders at my tables' })
  @ApiOkResponse({ type: [WaiterOrderSummaryDto] })
  @ApiQuery({ name: 'branchId', required: true, type: String })
  async getPendingOrders(
    @CurrentUser() user: JwtPayload,
    @Query('branchId') branchId: string,
  ): Promise<WaiterOrderSummaryDto[]> {
    return this.waiterService.getPendingOrders(user.sub, branchId);
  }

  /**
   * GET /waiter/orders/active
   * Lists accepted, in-kitchen, and ready-to-serve orders at waiter's tables.
   */
  @Get('active')
  @RequirePermissions(Permission.ORDERS_READ)
  @ApiOperation({ summary: '[Waiter] Get active (accepted → in-kitchen → ready) orders at my tables' })
  @ApiOkResponse({ type: [WaiterOrderSummaryDto] })
  @ApiQuery({ name: 'branchId', required: true, type: String })
  async getActiveOrders(
    @CurrentUser() user: JwtPayload,
    @Query('branchId') branchId: string,
  ): Promise<WaiterOrderSummaryDto[]> {
    return this.waiterService.getActiveOrders(user.sub, branchId);
  }

  /**
   * GET /waiter/orders/:id
   * Full order detail including line items.
   */
  @Get(':id')
  @RequirePermissions(Permission.ORDERS_READ)
  @ApiOperation({ summary: '[Waiter] Get full order detail with items' })
  @ApiOkResponse({ type: WaiterOrderDetailDto })
  @ApiNotFoundResponse({ description: 'Order not found' })
  @ApiForbiddenResponse({ description: 'Table not assigned to this waiter' })
  async getOrderDetail(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<WaiterOrderDetailDto> {
    return this.waiterService.getOrderDetail(id, user.sub);
  }

  /**
   * POST /waiter/orders/:id/accept
   * Accept a SUBMITTED order → transitions to ACCEPTED → auto-sent to kitchen.
   */
  @Post(':id/accept')
  @HttpCode(HttpStatus.OK)
  @RequirePermissions(Permission.ORDERS_ACCEPT)
  @ApiOperation({ summary: '[Waiter] Accept a customer order (moves to kitchen queue)' })
  @ApiOkResponse({ type: WaiterMessageDto })
  @ApiBadRequestResponse({ description: 'Order not in SUBMITTED status' })
  @ApiForbiddenResponse({ description: 'Table not assigned to this waiter' })
  async acceptOrder(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<WaiterMessageDto> {
    await this.waiterService.acceptOrder(id, user.sub);
    return { message: 'Order accepted and sent to kitchen' };
  }

  /**
   * POST /waiter/orders/:id/reject
   * Reject a SUBMITTED order with a reason.
   */
  @Post(':id/reject')
  @HttpCode(HttpStatus.OK)
  @RequirePermissions(Permission.ORDERS_REJECT)
  @ApiOperation({ summary: '[Waiter] Reject a customer order with a reason' })
  @ApiOkResponse({ type: WaiterMessageDto })
  @ApiBadRequestResponse({ description: 'Order not in SUBMITTED status or missing reason' })
  @ApiForbiddenResponse({ description: 'Table not assigned to this waiter' })
  async rejectOrder(
    @Param('id') id: string,
    @Body() body: { reason: string },
    @CurrentUser() user: JwtPayload,
  ): Promise<WaiterMessageDto> {
    await this.waiterService.rejectOrder({ orderId: id, reason: body.reason }, user.sub);
    return { message: 'Order rejected' };
  }

  /**
   * POST /waiter/orders/:id/serve
   * Mark a READY order as SERVED. One-time, irreversible.
   */
  @Post(':id/serve')
  @HttpCode(HttpStatus.OK)
  @RequirePermissions(Permission.ORDERS_SERVE)
  @ApiOperation({ summary: '[Waiter] Mark an order as served (READY → SERVED, one-time action)' })
  @ApiOkResponse({ type: WaiterMessageDto })
  @ApiBadRequestResponse({ description: 'Order not in READY status' })
  @ApiForbiddenResponse({ description: 'Table not assigned to this waiter' })
  async serveOrder(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<WaiterMessageDto> {
    await this.waiterService.serveOrder(id, user.sub);
    return { message: 'Order marked as served' };
  }

  /**
   * POST /waiter/orders
   * Waiter creates an order on behalf of a customer.
   * If the customer email/phone doesn't exist, an account is auto-created (password=1234).
   */
  @Post()
  @RequirePermissions(Permission.ORDERS_CREATE)
  @ApiOperation({
    summary: '[Waiter] Create order on behalf of customer (auto-creates account if needed)',
  })
  @ApiCreatedResponse({ type: CreateOrderOnBehalfResponseDto })
  @ApiForbiddenResponse({ description: 'Table not assigned to this waiter' })
  async createOrderOnBehalf(
    @Body() dto: CreateOrderOnBehalfDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<CreateOrderOnBehalfResponseDto> {
    return this.waiterService.createOrderOnBehalf(dto, user.sub);
  }
}

// ─── Waiter | Alerts ──────────────────────────────────────────────────────────

@ApiTags('Waiter | Alerts')
@Controller('waiter/alerts')
export class WaiterAlertsController {
  constructor(private readonly waiterService: WaiterService) {}

  /**
   * GET /waiter/alerts
   * Returns all pending/acknowledged alerts at waiter's branch.
   */
  @Get()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions(Permission.ALERTS_READ)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: '[Waiter] Get all pending alerts at my branch' })
  @ApiOkResponse({ type: [CustomerAlertDto] })
  @ApiQuery({ name: 'branchId', required: true, type: String })
  async getMyAlerts(
    @CurrentUser() user: JwtPayload,
    @Query('branchId') branchId: string,
  ): Promise<CustomerAlertDto[]> {
    return this.waiterService.getMyAlerts(user.sub, branchId);
  }

  /**
   * PATCH /waiter/alerts/:id/acknowledge
   * Waiter acknowledges they've seen the alert.
   */
  @Patch(':id/acknowledge')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions(Permission.ALERTS_ACKNOWLEDGE)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: '[Waiter] Acknowledge a customer alert' })
  @ApiOkResponse({ type: WaiterMessageDto })
  @ApiNotFoundResponse({ description: 'Alert not found' })
  async acknowledgeAlert(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<WaiterMessageDto> {
    await this.waiterService.acknowledgeAlert(id, user.sub);
    return { message: 'Alert acknowledged' };
  }

  /**
   * PATCH /waiter/alerts/:id/resolve
   * Waiter marks the alert as resolved (handled).
   */
  @Patch(':id/resolve')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions(Permission.ALERTS_RESOLVE)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: '[Waiter] Resolve a customer alert' })
  @ApiOkResponse({ type: WaiterMessageDto })
  @ApiNotFoundResponse({ description: 'Alert not found' })
  async resolveAlert(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<WaiterMessageDto> {
    await this.waiterService.resolveAlert(id, user.sub);
    return { message: 'Alert resolved' };
  }
}

// ─── Customer | Alerts (create) ──────────────────────────────────────────────

@ApiTags('Customer | Alerts')
@Controller('alerts')
export class CustomerAlertsController {
  constructor(private readonly waiterService: WaiterService) {}

  /**
   * POST /alerts
   * Customer sends an alert from their session (call_waiter, request_bill, etc.)
   * No auth required — customer session context is provided in the body.
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: '[Customer] Send an alert to your waiter (call_waiter, request_bill, etc.)' })
  @ApiCreatedResponse({ type: CustomerAlertDto })
  @ApiBadRequestResponse({ description: 'Invalid alert type or missing message for custom type' })
  async createAlert(@Body() dto: CreateAlertDto): Promise<CustomerAlertDto> {
    return this.waiterService.createAlert(dto);
  }
}
