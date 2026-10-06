import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
} from '@nestjs/swagger';
import { KitchenService } from '../../application/kitchen.service';
import {
  UpdateKitchenItemStatusDto,
  ToggleItemAvailabilityDto,
  KitchenQueryDto,
} from './dto/kitchen.dto';

@ApiTags('Kitchen & Bar Display System (KDS)')
@Controller('kitchen')
export class KitchenController {
  constructor(private readonly kitchenService: KitchenService) {}

  @Get('tickets/:branchId')
  @ApiOperation({ summary: 'Get active kitchen tickets for a branch (optionally filtered by station)' })
  @ApiOkResponse({ description: 'List of active tickets/items to prepare' })
  async getActiveTickets(
    @Param('branchId') branchId: string,
    @Query() query: KitchenQueryDto
  ) {
    return this.kitchenService.getActiveTickets(branchId, query.station);
  }

  @Patch('items/:itemId/status')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update preparation status of an individual order item' })
  @ApiOkResponse({ description: 'Status updated' })
  async updateItemStatus(
    @Param('itemId') itemId: string,
    @Body() dto: UpdateKitchenItemStatusDto
  ) {
    await this.kitchenService.updateItemStatus(itemId, dto);
    return { ok: true };
  }

  @Patch('menu-items/:menuItemId/availability')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Toggle 86 / availability for a menu item directly from KDS' })
  @ApiOkResponse({ description: 'Availability updated' })
  async toggleMenuItemAvailability(
    @Param('menuItemId') menuItemId: string,
    @Body() dto: ToggleItemAvailabilityDto
  ) {
    await this.kitchenService.toggleMenuItemAvailability(menuItemId, dto);
    return { ok: true };
  }
}
