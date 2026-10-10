import {
  Controller,
  Get,
  Post,
  Patch,
  Put,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
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
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../../../common/guards/permissions.guard';
import { RequirePermissions } from '../../../../common/decorators/require-permissions.decorator';
import { Permission } from '@tavonza/authorization';
import { BranchService } from '../../application/services/branch.service';
import {
  CreateBranchDto,
  UpdateBranchDto,
  UpdateBranchSettingsDto,
  SetOperatingHoursDto,
  CreateHolidayDto,
  BranchResponseDto,
  BranchSettingsResponseDto,
  BranchOperatingHoursResponseDto,
  BranchHolidayResponseDto,
  BranchStaffMemberResponseDto,
  AssignBranchStaffDto,
  CreateBranchStaffDto,
  UpdateBranchStaffDto,
  QueryBranchDto,
} from './dto/branch.dto';
import { ApiStandardErrors } from '../../../../common/swagger';

@ApiTags('Core | Branch Management')
@Controller('branches')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('access-token')
export class BranchController {
  constructor(private readonly branchService: BranchService) {}

  // ── Branches ──────────────────────────────────────────────────────────

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new branch under a restaurant' })
  @ApiCreatedResponse({ description: 'Branch created successfully', type: BranchResponseDto })
  @ApiStandardErrors(400, 401, 403, 409, 500)
  async create(@Body() dto: CreateBranchDto): Promise<BranchResponseDto> {
    return this.branchService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List branches with search, pagination, and optional restaurant filter' })
  @ApiOkResponse({ description: 'List of branches or paginated branch response', type: [BranchResponseDto] })
  @ApiStandardErrors(401, 403, 500)
  async listByRestaurant(
    @Query() query: QueryBranchDto,
  ): Promise<any> {
    if (query.page !== undefined || query.search !== undefined) {
      return this.branchService.findAll(query);
    }
    if (query.restaurantId) {
      return this.branchService.findByRestaurantId(query.restaurantId, query.includeDeleted);
    }
    return this.branchService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get branch details by ID' })
  @ApiParam({ name: 'id', description: 'Branch UUID', example: 'ce7b4318-5e2e-4fcd-a459-0e1bc80a6f27' })
  @ApiOkResponse({ description: 'Branch details', type: BranchResponseDto })
  @ApiStandardErrors(401, 403, 404, 500)
  async getById(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<BranchResponseDto> {
    return this.branchService.findById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update branch details' })
  @ApiParam({ name: 'id', description: 'Branch UUID', example: 'ce7b4318-5e2e-4fcd-a459-0e1bc80a6f27' })
  @ApiOkResponse({ description: 'Branch updated successfully', type: BranchResponseDto })
  @ApiStandardErrors(400, 401, 403, 404, 500)
  async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateBranchDto,
  ): Promise<BranchResponseDto> {
    return this.branchService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete a branch' })
  @ApiParam({ name: 'id', description: 'Branch UUID', example: 'ce7b4318-5e2e-4fcd-a459-0e1bc80a6f27' })
  @ApiOkResponse({ description: 'Branch soft-deleted', type: BranchResponseDto })
  @ApiStandardErrors(401, 403, 404, 500)
  async delete(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<BranchResponseDto> {
    return this.branchService.softDelete(id);
  }

  // ── Settings ──────────────────────────────────────────────────────────

  @Get(':id/settings')
  @ApiOperation({ summary: 'Get branch operational settings' })
  @ApiParam({ name: 'id', description: 'Branch UUID', example: 'ce7b4318-5e2e-4fcd-a459-0e1bc80a6f27' })
  @ApiOkResponse({ description: 'Branch operational settings', type: BranchSettingsResponseDto })
  @ApiStandardErrors(401, 403, 404, 500)
  async getSettings(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.branchService.getSettings(id);
  }

  @Patch(':id/settings')
  @UseGuards(PermissionsGuard)
  @RequirePermissions(Permission.MANAGE_BRANCH_SETTINGS)
  @ApiOperation({ summary: 'Update branch operational settings' })
  @ApiParam({ name: 'id', description: 'Branch UUID', example: 'ce7b4318-5e2e-4fcd-a459-0e1bc80a6f27' })
  @ApiOkResponse({ description: 'Updated branch settings', type: BranchSettingsResponseDto })
  @ApiStandardErrors(400, 401, 403, 404, 500)
  async updateSettings(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateBranchSettingsDto,
  ) {
    return this.branchService.updateSettings(id, dto);
  }

  // ── Operating Hours ───────────────────────────────────────────────────

  @Get(':id/operating-hours')
  @ApiOperation({ summary: 'Get branch weekly operating hours' })
  @ApiParam({ name: 'id', description: 'Branch UUID', example: 'ce7b4318-5e2e-4fcd-a459-0e1bc80a6f27' })
  @ApiOkResponse({ description: 'Weekly operating hours', type: [BranchOperatingHoursResponseDto] })
  @ApiStandardErrors(401, 403, 404, 500)
  async getOperatingHours(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.branchService.getOperatingHours(id);
  }

  @Put(':id/operating-hours')
  @ApiOperation({ summary: 'Set/replace branch weekly operating hours' })
  @ApiParam({ name: 'id', description: 'Branch UUID', example: 'ce7b4318-5e2e-4fcd-a459-0e1bc80a6f27' })
  @ApiOkResponse({ description: 'Updated operating hours', type: [BranchOperatingHoursResponseDto] })
  @ApiStandardErrors(400, 401, 403, 404, 500)
  async setOperatingHours(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: SetOperatingHoursDto,
  ) {
    return this.branchService.setOperatingHours(id, dto);
  }

  // ── Holidays ──────────────────────────────────────────────────────────

  @Get(':id/holidays')
  @ApiOperation({ summary: 'Get branch holiday schedule' })
  @ApiParam({ name: 'id', description: 'Branch UUID', example: 'ce7b4318-5e2e-4fcd-a459-0e1bc80a6f27' })
  @ApiOkResponse({ description: 'Branch holiday calendar', type: [BranchHolidayResponseDto] })
  @ApiStandardErrors(401, 403, 404, 500)
  async getHolidays(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.branchService.getHolidays(id);
  }

  @Post(':id/holidays')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Add a holiday or special schedule to branch' })
  @ApiParam({ name: 'id', description: 'Branch UUID', example: 'ce7b4318-5e2e-4fcd-a459-0e1bc80a6f27' })
  @ApiCreatedResponse({ description: 'Holiday scheduled', type: BranchHolidayResponseDto })
  @ApiStandardErrors(400, 401, 403, 404, 500)
  async addHoliday(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: CreateHolidayDto,
  ) {
    return this.branchService.addHoliday(id, dto);
  }

  // ── Staff ─────────────────────────────────────────────────────────────

  @Get(':id/staff')
  @ApiOperation({ summary: 'Get all staff assigned to this branch with optional role and search filters' })
  @ApiParam({ name: 'id', description: 'Branch UUID', example: 'ce7b4318-5e2e-4fcd-a459-0e1bc80a6f27' })
  @ApiQuery({ name: 'role', required: false, type: String, description: 'Role filter (e.g. WAITER, KITCHEN, MANAGER, ALL)', example: 'WAITER' })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Search staff by name, email or phone', example: 'Jane' })
  @ApiOkResponse({ description: 'List of staff members assigned to branch', type: [BranchStaffMemberResponseDto] })
  @ApiStandardErrors(401, 403, 404, 500)
  async getStaff(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Query('role') role?: string,
    @Query('search') search?: string,
  ) {
    return this.branchService.getStaffByBranch(id, { role, search });
  }

  @Get(':id/staff/:staffId')
  @ApiOperation({ summary: 'Get a single staff member assigned to this branch by ID' })
  @ApiParam({ name: 'id', description: 'Branch UUID', example: 'ce7b4318-5e2e-4fcd-a459-0e1bc80a6f27' })
  @ApiParam({ name: 'staffId', description: 'Staff member UUID or assignment UUID', example: '11223344-5566-7788-9900-aabbccddeeff' })
  @ApiOkResponse({ description: 'Staff member assignment details', type: BranchStaffMemberResponseDto })
  @ApiStandardErrors(401, 403, 404, 500)
  async getStaffMember(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Param('staffId') staffId: string,
  ) {
    return this.branchService.getStaffMember(id, staffId);
  }

  @Post(':id/staff')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new staff member and assign to this branch' })
  @ApiParam({ name: 'id', description: 'Branch UUID', example: 'ce7b4318-5e2e-4fcd-a459-0e1bc80a6f27' })
  @ApiCreatedResponse({ description: 'Staff member created and assigned', type: BranchStaffMemberResponseDto })
  @ApiStandardErrors(400, 401, 403, 404, 409, 500)
  async createStaff(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: CreateBranchStaffDto,
  ) {
    return this.branchService.createStaffForBranch(id, dto);
  }

  @Post(':id/staff/assign')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Assign an existing staff member to this branch' })
  @ApiParam({ name: 'id', description: 'Branch UUID', example: 'ce7b4318-5e2e-4fcd-a459-0e1bc80a6f27' })
  @ApiCreatedResponse({ description: 'Staff assigned successfully', type: BranchStaffMemberResponseDto })
  @ApiStandardErrors(400, 401, 403, 404, 409, 500)
  async assignStaff(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: AssignBranchStaffDto,
  ) {
    return this.branchService.assignStaffToBranch(id, dto);
  }

  @Patch(':id/staff/:staffId')
  @ApiOperation({ summary: 'Update staff assignment details in this branch' })
  @ApiParam({ name: 'id', description: 'Branch UUID', example: 'ce7b4318-5e2e-4fcd-a459-0e1bc80a6f27' })
  @ApiParam({ name: 'staffId', description: 'Staff member UUID or assignment UUID', example: '11223344-5566-7788-9900-aabbccddeeff' })
  @ApiOkResponse({ description: 'Staff assignment updated', type: BranchStaffMemberResponseDto })
  @ApiStandardErrors(400, 401, 403, 404, 500)
  async updateStaff(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Param('staffId') staffId: string,
    @Body() dto: UpdateBranchStaffDto,
  ) {
    return this.branchService.updateStaff(id, staffId, dto);
  }

  @Delete(':id/staff/:staffId')
  @ApiOperation({ summary: 'Deactivate / soft delete staff assignment in this branch' })
  @ApiParam({ name: 'id', description: 'Branch UUID', example: 'ce7b4318-5e2e-4fcd-a459-0e1bc80a6f27' })
  @ApiParam({ name: 'staffId', description: 'Staff member UUID or assignment UUID', example: '11223344-5566-7788-9900-aabbccddeeff' })
  @ApiOkResponse({
    description: 'Staff member deactivated',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Staff member deactivated' },
      },
    },
  })
  @ApiStandardErrors(401, 403, 404, 500)
  async deleteStaff(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Param('staffId') staffId: string,
  ) {
    return this.branchService.softDeleteStaff(id, staffId);
  }
}
