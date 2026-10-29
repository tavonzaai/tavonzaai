import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Permission } from '@/authorization';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';
import { RequirePermissions } from '../../../common/decorators/require-permissions.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import type { JwtPayload } from '../../identity/adapters/jwt.strategy';
import { ApiStandardErrors } from '../../../common/swagger';
import { SubscriptionService } from '../services/subscription.service';

@ApiTags('Control | Subscriptions')
@Controller('subscriptions')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth('access-token')
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  @Get('current')
  @RequirePermissions(Permission.ORGANIZATIONS_READ)
  @ApiOperation({
    summary: '[Admin] Current organization plan',
    description: 'Returns the SaaS plan assigned to the caller organization. Distinct from dine-in payments.',
  })
  @ApiQuery({ name: 'organizationId', required: false, type: String })
  @ApiOkResponse({ description: 'Current plan and subscription period' })
  @ApiStandardErrors(401, 403, 404, 500)
  async current(
    @CurrentUser() user: JwtPayload,
    @Query('organizationId') organizationId?: string,
  ) {
    return this.subscriptionService.getCurrentPlan(user, organizationId);
  }

  @Get('invoices')
  @RequirePermissions(Permission.ORGANIZATIONS_READ)
  @ApiOperation({
    summary: '[Admin] Organization subscription invoices',
    description: 'Platform plan invoices for the organization. Distinct from the dine-in payments ledger.',
  })
  @ApiQuery({ name: 'organizationId', required: false, type: String })
  @ApiOkResponse({ description: 'Subscription invoices' })
  @ApiStandardErrors(401, 403, 500)
  async invoices(
    @CurrentUser() user: JwtPayload,
    @Query('organizationId') organizationId?: string,
  ) {
    return this.subscriptionService.listInvoices(user, organizationId);
  }
}
