// ============================================================================
// Waiter Controller — REST endpoints for waiter operations
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
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiParam,
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
  RejectOrderDto,
} from './dto/waiter-request.dto';
import {
  TableAssignmentDto,
  WaiterOrderSummaryDto,
  WaiterOrderDetailDto,
  CreateOrderOnBehalfResponseDto,
  CustomerAlertDto,
  WaiterMessageDto,
} from './dto/waiter-response.dto';
import { ApiStandardErrors } from '../../../../common/swagger';

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
  @ApiOperation({
    summary: '[Waiter] Get my assigned tables for today',
    description: 'Retrieves all dining tables assigned to the authenticated waiter for the active branch and shift.',
  })
  @ApiOkResponse({ type: [TableAssignmentDto], description: 'List of assigned tables' })
  @ApiQuery({
    name: 'branchId',
    required: true,
    type: String,
    description: 'Branch UUID',
    example: 'ce7b4318-5e2e-4fcd-a459-0e1bc80a6f27',
  })
  @ApiStandardErrors(400, 401, 403, 500)
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
  @ApiOperation({
    summary: '[Manager] Assign a table to a waiter',
    description: 'Assigns a specific dining table to a waiter staff member for shift monitoring.',
  })
  @ApiCreatedResponse({ type: TableAssignmentDto, description: 'Table assignment created' })
  @ApiStandardErrors(400, 401, 403, 404, 500)
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
   * GET /waiter/orders
   * Lists orders for waiter's assigned tables with filters: scope, status, search, tableId.
   */
  @Get()
  @RequirePermissions(Permission.ORDERS_READ)
  @ApiOperation({
    summary: '[Waiter] Get orders at my tables with search & filters',
    description: 'Fetches orders placed across the waiter tables, with support for status filtering and text search.',
  })
  @ApiOkResponse({ type: [WaiterOrderSummaryDto], description: 'List of orders' })
  @ApiQuery({ name: 'branchId', required: false, type: String, example: 'ce7b4318-5e2e-4fcd-a459-0e1bc80a6f27' })
  @ApiQuery({ name: 'scope', required: false, type: String, example: 'my_tables' })
  @ApiQuery({ name: 'status', required: false, type: String, example: 'SUBMITTED' })
  @ApiQuery({ name: 'tableId', required: false, type: String, example: '5298804e-5847-4e5a-bdba-73a8f06d9ed2' })
  @ApiQuery({ name: 'search', required: false, type: String, example: 'ORD-84' })
  @ApiStandardErrors(400, 401, 403, 500)
  async getOrders(
    @CurrentUser() user: JwtPayload,
    @Query('branchId') qBranchId?: string,
    @Query('scope') scope?: string,
    @Query('status') status?: string,
    @Query('tableId') tableId?: string,
    @Query('search') search?: string,
  ): Promise<WaiterOrderSummaryDto[]> {
    const branchId = user.branchId || qBranchId;
    if (!branchId) throw new BadRequestException('Branch ID is required');
    return this.waiterService.getOrders(user.sub, branchId, {
      scope,
      status,
      tableId,
      search,
    });
  }

  /**
   * GET /waiter/orders/pending
   */
  @Get('pending')
  @RequirePermissions(Permission.ORDERS_READ)
  @ApiOperation({
    summary: '[Waiter] Get pending (unaccepted) orders at my tables',
    description: 'Queue of submitted orders awaiting staff review and acceptance.',
  })
  @ApiOkResponse({ type: [WaiterOrderSummaryDto], description: 'List of pending orders' })
  @ApiQuery({ name: 'branchId', required: true, type: String, example: 'ce7b4318-5e2e-4fcd-a459-0e1bc80a6f27' })
  @ApiStandardErrors(400, 401, 403, 500)
  async getPendingOrders(
    @CurrentUser() user: JwtPayload,
    @Query('branchId') branchId: string,
  ): Promise<WaiterOrderSummaryDto[]> {
    return this.waiterService.getPendingOrders(user.sub, branchId);
  }

  /**
   * GET /waiter/orders/active
   */
  @Get('active')
  @RequirePermissions(Permission.ORDERS_READ)
  @ApiOperation({
    summary: '[Waiter] Get active orders at my tables',
    description: 'Lists active orders in ACCEPTED, PREPARING, and READY states for live floor tracking.',
  })
  @ApiOkResponse({ type: [WaiterOrderSummaryDto], description: 'List of active orders' })
  @ApiQuery({ name: 'branchId', required: true, type: String, example: 'ce7b4318-5e2e-4fcd-a459-0e1bc80a6f27' })
  @ApiStandardErrors(400, 401, 403, 500)
  async getActiveOrders(
    @CurrentUser() user: JwtPayload,
    @Query('branchId') branchId: string,
  ): Promise<WaiterOrderSummaryDto[]> {
    return this.waiterService.getActiveOrders(user.sub, branchId);
  }

  /**
   * GET /waiter/orders/:id
   */
  @Get(':id')
  @RequirePermissions(Permission.ORDERS_READ)
  @ApiOperation({
    summary: '[Waiter] Get full order detail with items',
    description: 'Returns comprehensive order breakdown including modifiers, status history, and totals.',
  })
  @ApiParam({ name: 'id', type: String, description: 'Order UUID', example: '8877332f-4512-40bc-8012-d881e6e58003' })
  @ApiOkResponse({ type: WaiterOrderDetailDto, description: 'Detailed order entity' })
  @ApiStandardErrors(400, 401, 403, 404, 500)
  async getOrderDetail(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<WaiterOrderDetailDto> {
    return this.waiterService.getOrderDetail(id, user.sub);
  }

  /**
   * POST /waiter/orders/:id/accept
   */
  @Post(':id/accept')
  @HttpCode(HttpStatus.OK)
  @RequirePermissions(Permission.ORDERS_ACCEPT)
  @ApiOperation({
    summary: '[Waiter] Accept a customer order',
    description: 'Transitions SUBMITTED order to ACCEPTED and auto-dispatches line items to kitchen and bar stations.',
  })
  @ApiParam({ name: 'id', type: String, description: 'Order UUID', example: '8877332f-4512-40bc-8012-d881e6e58003' })
  @ApiOkResponse({ type: WaiterMessageDto, description: 'Order accepted' })
  @ApiStandardErrors(400, 401, 403, 404, 500)
  async acceptOrder(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<WaiterMessageDto> {
    await this.waiterService.acceptOrder(id, user.sub);
    return { message: 'Order accepted and sent to kitchen' };
  }

  /**
   * POST /waiter/orders/:id/reject
   */
  @Post(':id/reject')
  @HttpCode(HttpStatus.OK)
  @RequirePermissions(Permission.ORDERS_REJECT)
  @ApiOperation({
    summary: '[Waiter] Reject a customer order with a reason',
    description: 'Rejects order, notifying the table customer with reason and restoring cart for re-selection.',
  })
  @ApiParam({ name: 'id', type: String, description: 'Order UUID', example: '8877332f-4512-40bc-8012-d881e6e58003' })
  @ApiOkResponse({ type: WaiterMessageDto, description: 'Order rejected' })
  @ApiStandardErrors(400, 401, 403, 404, 500)
  async rejectOrder(
    @Param('id') id: string,
    @Body() body: RejectOrderDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<WaiterMessageDto> {
    const reasonCode = body.reasonCode || body.rejectionReasonCode || 'OTHER';
    await this.waiterService.rejectOrder(
      { orderId: id, reason: body.reason, reasonCode, rejectionReasonCode: reasonCode },
      user.sub,
    );
    return { message: 'Order rejected' };
  }

  /**
   * POST /waiter/orders/:id/serve
   */
  @Post(':id/serve')
  @HttpCode(HttpStatus.OK)
  @RequirePermissions(Permission.ORDERS_SERVE)
  @ApiOperation({
    summary: '[Waiter] Mark an order as served',
    description: 'Marks a READY order as SERVED once brought to the dining table.',
  })
  @ApiParam({ name: 'id', type: String, description: 'Order UUID', example: '8877332f-4512-40bc-8012-d881e6e58003' })
  @ApiOkResponse({ type: WaiterMessageDto, description: 'Order served' })
  @ApiStandardErrors(400, 401, 403, 404, 500)
  async serveOrder(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<WaiterMessageDto> {
    await this.waiterService.serveOrder(id, user.sub);
    return { message: 'Order marked as served' };
  }

  /**
   * POST /waiter/orders
   */
  @Post()
  @RequirePermissions(Permission.ORDERS_CREATE)
  @ApiOperation({
    summary: '[Waiter] Create order on behalf of customer',
    description: 'Allows waiter to punch in an order directly for a customer table, auto-creating a guest profile if needed.',
  })
  @ApiCreatedResponse({ type: CreateOrderOnBehalfResponseDto, description: 'Order created on behalf of customer' })
  @ApiStandardErrors(400, 401, 403, 500)
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
   */
  @Get()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions(Permission.ALERTS_READ)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: '[Waiter] Get all pending alerts at my branch',
    description: 'Lists all unhandled or active table call-waiter and assistance requests for the branch.',
  })
  @ApiOkResponse({ type: [CustomerAlertDto], description: 'List of alerts' })
  @ApiQuery({ name: 'branchId', required: true, type: String, example: 'ce7b4318-5e2e-4fcd-a459-0e1bc80a6f27' })
  @ApiStandardErrors(400, 401, 403, 500)
  async getMyAlerts(
    @CurrentUser() user: JwtPayload,
    @Query('branchId') branchId: string,
  ): Promise<CustomerAlertDto[]> {
    return this.waiterService.getMyAlerts(user.sub, branchId);
  }

  /**
   * PATCH /waiter/alerts/:id/acknowledge
   */
  @Patch(':id/acknowledge')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions(Permission.ALERTS_ACKNOWLEDGE)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: '[Waiter] Acknowledge a customer alert',
    description: 'Marks an alert as acknowledged, indicating a waiter is responding to the table.',
  })
  @ApiParam({ name: 'id', type: String, description: 'Alert UUID', example: 'aa112233-4455-6677-8899-00aabbccddee' })
  @ApiOkResponse({ type: WaiterMessageDto, description: 'Alert acknowledged' })
  @ApiStandardErrors(400, 401, 403, 404, 500)
  async acknowledgeAlert(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<WaiterMessageDto> {
    await this.waiterService.acknowledgeAlert(id, user.sub);
    return { message: 'Alert acknowledged' };
  }

  /**
   * PATCH /waiter/alerts/:id/resolve
   */
  @Patch(':id/resolve')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions(Permission.ALERTS_RESOLVE)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: '[Waiter] Resolve a customer alert',
    description: 'Marks the customer assistance request as completed and resolved.',
  })
  @ApiParam({ name: 'id', type: String, description: 'Alert UUID', example: 'aa112233-4455-6677-8899-00aabbccddee' })
  @ApiOkResponse({ type: WaiterMessageDto, description: 'Alert resolved' })
  @ApiStandardErrors(400, 401, 403, 404, 500)
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
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: '[Customer] Send an alert to your waiter',
    description: 'Submits an alert (call_waiter, request_bill, need_help, or custom) to floor staff.',
  })
  @ApiCreatedResponse({ type: CustomerAlertDto, description: 'Alert dispatched' })
  @ApiStandardErrors(400, 404, 500)
  async createAlert(@Body() dto: CreateAlertDto): Promise<CustomerAlertDto> {
    return this.waiterService.createAlert(dto);
  }
}
