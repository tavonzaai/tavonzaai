import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../../../common/guards/permissions.guard';
import { RequirePermissions } from '../../../../common/decorators/require-permissions.decorator';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';
import { Permission } from '@tavonza/authorization';
import type { JwtPayload } from '../../../identity/infrastructure/adapters/jwt.strategy';
import { AnalyticsService } from '../../application/analytics.service';
import { ApiStandardErrors } from '../../../../common/swagger';

@ApiTags('Control | Analytics')
@Controller('analytics')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth('access-token')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('overview')
  @RequirePermissions(Permission.REPORTS_READ)
  @ApiOperation({ summary: 'Organization / branch operational overview for Admin dashboard' })
  @ApiQuery({ name: 'organizationId', required: false, type: String })
  @ApiQuery({ name: 'branchId', required: false, type: String })
  @ApiOkResponse({ description: 'Dashboard KPI snapshot' })
  @ApiStandardErrors(401, 403, 500)
  async overview(
    @CurrentUser() user: JwtPayload,
    @Query('organizationId') organizationId?: string,
    @Query('branchId') branchId?: string,
  ) {
    return this.analyticsService.getOverview(user, { organizationId, branchId });
  }

  @Get('branch-dashboard')
  @RequirePermissions(Permission.REPORTS_READ)
  @ApiOperation({
    summary: 'Branch KPI snapshot for manager dashboard / reports',
    description:
      'Aggregated analytics for a single branch. Frontends must use this instead of loading all orders/tables to compute KPIs.',
  })
  @ApiQuery({ name: 'branchId', required: true, type: String })
  @ApiOkResponse({ description: 'Branch dashboard KPI snapshot' })
  @ApiStandardErrors(401, 403, 500)
  async branchDashboard(
    @CurrentUser() user: JwtPayload,
    @Query('branchId') branchId: string,
  ) {
    return this.analyticsService.getBranchDashboard(user, { branchId });
  }

  @Get('waiter-dashboard')
  @RequirePermissions(Permission.ORDERS_READ)
  @ApiOperation({
    summary: 'Waiter dashboard KPIs (assigned tables only)',
    description: 'Pending/preparing/ready counts scoped to the waiter table assignments.',
  })
  @ApiQuery({ name: 'branchId', required: true, type: String })
  @ApiOkResponse({ description: 'Waiter KPI snapshot' })
  @ApiStandardErrors(400, 401, 403, 500)
  async waiterDashboard(
    @CurrentUser() user: JwtPayload,
    @Query('branchId') branchId: string,
  ) {
    return this.analyticsService.getWaiterDashboard(user, { branchId });
  }

  @Get('cashier-dashboard')
  @RequirePermissions(Permission.ORDERS_READ)
  @ApiOperation({
    summary: 'Cashier dashboard KPIs',
    description: 'Today revenue, unpaid balance, refunds — do not aggregate from GET /orders.',
  })
  @ApiQuery({ name: 'branchId', required: true, type: String })
  @ApiOkResponse({ description: 'Cashier KPI snapshot' })
  @ApiStandardErrors(400, 401, 403, 500)
  async cashierDashboard(
    @CurrentUser() user: JwtPayload,
    @Query('branchId') branchId: string,
  ) {
    return this.analyticsService.getCashierDashboard(user, { branchId });
  }

  @Get('kitchen-dashboard')
  @RequirePermissions(Permission.ORDERS_READ)
  @ApiOperation({
    summary: 'Kitchen dashboard KPIs',
    description: 'Queue counts (new/preparing/ready/overdue) without loading every order row.',
  })
  @ApiQuery({ name: 'branchId', required: true, type: String })
  @ApiOkResponse({ description: 'Kitchen KPI snapshot' })
  @ApiStandardErrors(400, 401, 403, 500)
  async kitchenDashboard(
    @CurrentUser() user: JwtPayload,
    @Query('branchId') branchId: string,
  ) {
    return this.analyticsService.getKitchenDashboard(user, { branchId });
  }

  @Get('bartender-dashboard')
  @RequirePermissions(Permission.ORDERS_READ)
  @ApiOperation({ summary: 'Bartender dashboard KPIs (bar station queue)' })
  @ApiQuery({ name: 'branchId', required: true, type: String })
  @ApiOkResponse({ description: 'Bartender KPI snapshot' })
  @ApiStandardErrors(400, 401, 403, 500)
  async bartenderDashboard(
    @CurrentUser() user: JwtPayload,
    @Query('branchId') branchId: string,
  ) {
    return this.analyticsService.getBartenderDashboard(user, { branchId });
  }

  @Get('customer-dashboard')
  @ApiOperation({
    summary: 'Customer home KPIs',
    description: 'Open/completed order counts for the authenticated customer.',
  })
  @ApiOkResponse({ description: 'Customer KPI snapshot' })
  @ApiStandardErrors(401, 500)
  async customerDashboard(@CurrentUser() user: JwtPayload) {
    return this.analyticsService.getCustomerDashboard(user);
  }

  @Get('reports/branch-performance')
  @RequirePermissions(Permission.REPORTS_READ)
  @ApiOperation({ summary: 'Per-branch order and revenue totals' })
  @ApiQuery({ name: 'organizationId', required: false, type: String })
  @ApiOkResponse({ description: 'Branch performance rows' })
  @ApiStandardErrors(401, 403, 500)
  async branchPerformance(
    @CurrentUser() user: JwtPayload,
    @Query('organizationId') organizationId?: string,
  ) {
    return this.analyticsService.getBranchPerformance(user, { organizationId });
  }
}
