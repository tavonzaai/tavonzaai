import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { KitchenService } from '../../application/kitchen.service';
import {
  UpdateKitchenItemStatusDto,
  ToggleItemAvailabilityDto,
  KitchenQueryDto,
  KitchenTicketItemResponseDto,
  KitchenActionResponseDto,
} from './dto/kitchen.dto';
import { ApiStandardErrors } from '../../../../common/swagger';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';

@ApiTags('Kitchen & Bar Display System (KDS)')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('kitchen')
export class KitchenController {
  constructor(private readonly kitchenService: KitchenService) {}

  @Get('tickets/:branchId')
  @ApiOperation({
    summary: '[KDS] Get active kitchen tickets for a branch',
    description: 'Retrieves live queue of order line items needing preparation, routed by station (KITCHEN vs. BAR).',
  })
  @ApiParam({
    name: 'branchId',
    type: String,
    description: 'Branch UUID',
    example: 'ce7b4318-5e2e-4fcd-a459-0e1bc80a6f27',
  })
  @ApiOkResponse({
    type: [KitchenTicketItemResponseDto],
    description: 'List of active tickets and items queued for cooking/mixing',
  })
  @ApiStandardErrors(400, 401, 500)
  async getActiveTickets(
    @Param('branchId') branchId: string,
    @Query() query: KitchenQueryDto,
  ): Promise<KitchenTicketItemResponseDto[]> {
    return this.kitchenService.getActiveTickets(branchId, query.station);
  }

  @Patch('items/:itemId/status')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '[KDS] Update preparation status of an individual order item',
    description: 'Transitions line item status (e.g. PREPARING -> READY). Broadcasts live WebSocket event to floor staff.',
  })
  @ApiParam({
    name: 'itemId',
    type: String,
    description: 'Order Line Item UUID',
    example: '9988443e-1122-43bb-a123-f992a7a69004',
  })
  @ApiOkResponse({
    type: KitchenActionResponseDto,
    description: 'Item preparation status updated',
  })
  @ApiStandardErrors(400, 401, 404, 500)
  async updateItemStatus(
    @Param('itemId') itemId: string,
    @Body() dto: UpdateKitchenItemStatusDto,
  ): Promise<KitchenActionResponseDto> {
    await this.kitchenService.updateItemStatus(itemId, dto);
    return { ok: true };
  }

  @Patch('menu-items/:menuItemId/availability')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '[KDS] Toggle 86 / availability for a menu item directly from KDS',
    description: 'Immediately disables or restores dish availability across all customer ordering apps for this branch.',
  })
  @ApiParam({
    name: 'menuItemId',
    type: String,
    description: 'Menu Item UUID',
    example: '4455110d-8720-41ab-bc92-d667c4c36001',
  })
  @ApiOkResponse({
    type: KitchenActionResponseDto,
    description: 'Item availability state toggled',
  })
  @ApiStandardErrors(400, 401, 404, 500)
  async toggleMenuItemAvailability(
    @Param('menuItemId') menuItemId: string,
    @Body() dto: ToggleItemAvailabilityDto,
  ): Promise<KitchenActionResponseDto> {
    await this.kitchenService.toggleMenuItemAvailability(menuItemId, dto);
    return { ok: true };
  }
}
