import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiCreatedResponse,
} from '@nestjs/swagger';
import { ShiftService } from '../application/shift.service';
import {
  CreateShiftDto,
  ClockInDto,
  ClockOutDto,
} from './http/dto/shift.dto';

@ApiTags('Operations | Work Shifts & Attendance')
@Controller('shifts')
export class ShiftController {
  constructor(private readonly shiftService: ShiftService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Schedule a new work shift for a staff member' })
  @ApiCreatedResponse({ description: 'Shift created successfully' })
  async createShift(@Body() dto: CreateShiftDto) {
    return this.shiftService.createShift(dto);
  }

  @Get('branch/:branchId')
  @ApiOperation({ summary: 'Get all shifts for a branch, optionally filtered by date' })
  @ApiOkResponse({ description: 'List of branch shifts' })
  async getBranchShifts(
    @Param('branchId') branchId: string,
    @Query('date') date?: string
  ) {
    return this.shiftService.getBranchShifts(branchId, date);
  }

  @Get('staff/:staffAssignmentId')
  @ApiOperation({ summary: 'Get all shifts for a specific staff assignment' })
  @ApiOkResponse({ description: 'List of staff shifts' })
  async getStaffShifts(
    @Param('staffAssignmentId') staffAssignmentId: string,
    @Query('date') date?: string
  ) {
    return this.shiftService.getStaffShifts(staffAssignmentId, date);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get shift details by ID' })
  @ApiOkResponse({ description: 'Shift details' })
  async getShift(@Param('id') id: string) {
    return this.shiftService.getShiftById(id);
  }

  @Patch(':id/clock-in')
  @ApiOperation({ summary: 'Record staff clock-in timestamp' })
  @ApiOkResponse({ description: 'Shift updated with clock-in' })
  async clockIn(@Param('id') id: string, @Body() dto: ClockInDto) {
    return this.shiftService.clockIn(id, dto);
  }

  @Patch(':id/clock-out')
  @ApiOperation({ summary: 'Record staff clock-out timestamp and mark shift completed' })
  @ApiOkResponse({ description: 'Shift updated with clock-out' })
  async clockOut(@Param('id') id: string, @Body() dto: ClockOutDto) {
    return this.shiftService.clockOut(id, dto);
  }

  @Patch(':id/cancel')
  @ApiOperation({ summary: 'Cancel a scheduled shift' })
  @ApiOkResponse({ description: 'Shift cancelled' })
  async cancelShift(
    @Param('id') id: string,
    @Body('reason') reason?: string
  ) {
    return this.shiftService.cancelShift(id, reason);
  }
}
