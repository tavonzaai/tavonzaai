import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ShiftService } from '../application/shift.service';
import {
  CreateShiftDto,
  ClockInDto,
  ClockOutDto,
  WorkShiftResponseDto,
} from './http/dto/shift.dto';
import { ApiStandardErrors } from '../../../common/swagger';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';

@ApiTags('Operations | Work Shifts & Attendance')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('shifts')
export class ShiftController {
  constructor(private readonly shiftService: ShiftService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: '[Manager] Schedule a new work shift for a staff member',
    description: 'Creates a shift slot assigned to a staff assignment in a branch for a specific calendar date and time interval.',
  })
  @ApiCreatedResponse({ type: WorkShiftResponseDto, description: 'Shift scheduled successfully' })
  @ApiStandardErrors(400, 401, 403, 500)
  async createShift(@Body() dto: CreateShiftDto): Promise<any> {
    return this.shiftService.createShift(dto);
  }

  @Get('branch/:branchId')
  @ApiOperation({
    summary: '[Manager/Staff] Get all shifts for a branch',
    description: 'Lists all scheduled work shifts for the branch, optionally filtered by calendar date (YYYY-MM-DD).',
  })
  @ApiParam({ name: 'branchId', type: String, description: 'Branch UUID', example: 'ce7b4318-5e2e-4fcd-a459-0e1bc80a6f27' })
  @ApiQuery({ name: 'date', required: false, type: String, description: 'Filter by date (YYYY-MM-DD)', example: '2026-10-04' })
  @ApiOkResponse({ type: [WorkShiftResponseDto], description: 'List of branch work shifts' })
  @ApiStandardErrors(400, 401, 500)
  async getBranchShifts(
    @Param('branchId') branchId: string,
    @Query('date') date?: string,
  ): Promise<any> {
    return this.shiftService.getBranchShifts(branchId, date);
  }

  @Get('staff/:staffAssignmentId')
  @ApiOperation({
    summary: '[Staff] Get all shifts for a specific staff assignment',
    description: 'Retrieves scheduled work shifts assigned to a specific staff member assignment.',
  })
  @ApiParam({ name: 'staffAssignmentId', type: String, description: 'Staff Assignment UUID', example: '778899aa-bbcc-ddee-ff00-112233445566' })
  @ApiQuery({ name: 'date', required: false, type: String, description: 'Filter by date (YYYY-MM-DD)', example: '2026-10-04' })
  @ApiOkResponse({ type: [WorkShiftResponseDto], description: 'List of staff shifts' })
  @ApiStandardErrors(400, 401, 500)
  async getStaffShifts(
    @Param('staffAssignmentId') staffAssignmentId: string,
    @Query('date') date?: string,
  ): Promise<any> {
    return this.shiftService.getStaffShifts(staffAssignmentId, date);
  }

  @Get(':id')
  @ApiOperation({
    summary: '[Manager/Staff] Get shift details by ID',
    description: 'Returns complete shift information including scheduled times, check-in, check-out, and notes.',
  })
  @ApiParam({ name: 'id', type: String, description: 'Shift UUID', example: '11223344-5566-7788-99aa-bbccddeeff22' })
  @ApiOkResponse({ type: WorkShiftResponseDto, description: 'Work shift details' })
  @ApiStandardErrors(400, 401, 404, 500)
  async getShift(@Param('id') id: string): Promise<any> {
    return this.shiftService.getShiftById(id);
  }

  @Patch(':id/clock-in')
  @ApiOperation({
    summary: '[Staff] Record staff clock-in timestamp',
    description: 'Records attendance clock-in timestamp for the active shift.',
  })
  @ApiParam({ name: 'id', type: String, description: 'Shift UUID', example: '11223344-5566-7788-99aa-bbccddeeff22' })
  @ApiOkResponse({ type: WorkShiftResponseDto, description: 'Shift updated with clock-in' })
  @ApiStandardErrors(400, 401, 404, 500)
  async clockIn(@Param('id') id: string, @Body() dto: ClockInDto): Promise<any> {
    return this.shiftService.clockIn(id, dto);
  }

  @Patch(':id/clock-out')
  @ApiOperation({
    summary: '[Staff] Record staff clock-out timestamp and mark shift completed',
    description: 'Records attendance clock-out timestamp and calculates final working hours.',
  })
  @ApiParam({ name: 'id', type: String, description: 'Shift UUID', example: '11223344-5566-7788-99aa-bbccddeeff22' })
  @ApiOkResponse({ type: WorkShiftResponseDto, description: 'Shift updated with clock-out' })
  @ApiStandardErrors(400, 401, 404, 500)
  async clockOut(@Param('id') id: string, @Body() dto: ClockOutDto): Promise<any> {
    return this.shiftService.clockOut(id, dto);
  }

  @Patch(':id/cancel')
  @ApiOperation({
    summary: '[Manager] Cancel a scheduled shift',
    description: 'Cancels a shift and updates its operational state to INACTIVE.',
  })
  @ApiParam({ name: 'id', type: String, description: 'Shift UUID', example: '11223344-5566-7788-99aa-bbccddeeff22' })
  @ApiOkResponse({ type: WorkShiftResponseDto, description: 'Shift cancelled' })
  @ApiStandardErrors(400, 401, 403, 404, 500)
  async cancelShift(
    @Param('id') id: string,
    @Body('reason') reason?: string,
  ): Promise<any> {
    return this.shiftService.cancelShift(id, reason);
  }

  @Delete(':id')
  @ApiOperation({
    summary: '[Manager] Soft delete (cancel) a scheduled shift',
    description: 'Deactivates and cancels a scheduled shift.',
  })
  @ApiParam({ name: 'id', type: String, description: 'Shift UUID', example: '11223344-5566-7788-99aa-bbccddeeff22' })
  @ApiOkResponse({ type: WorkShiftResponseDto, description: 'Shift deleted/cancelled' })
  @ApiStandardErrors(400, 401, 403, 404, 500)
  async deleteShift(
    @Param('id') id: string,
    @Body('reason') reason?: string,
  ): Promise<any> {
    return this.shiftService.cancelShift(id, reason);
  }
}
