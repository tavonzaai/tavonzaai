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
