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
  CreateBranchStaffDto,
  UpdateBranchStaffDto,
  QueryBranchDto,
} from './dto/branch.dto';

@ApiTags('Branches')
@Controller('branches')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('access-token')
export class BranchController {
  constructor(private readonly branchService: BranchService) {}

  // ── Branches ──────────────────────────────────────────────────────────

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new branch under a restaurant' })
  @ApiCreatedResponse({ type: BranchResponseDto })
  async create(@Body() dto: CreateBranchDto): Promise<BranchResponseDto> {
    return this.branchService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List branches with search, pagination, and optional restaurant filter' })
  @ApiOkResponse({ type: [BranchResponseDto] })
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
  @ApiOkResponse({ type: BranchResponseDto })
  async getById(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<BranchResponseDto> {
    return this.branchService.findById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update branch details' })
  @ApiOkResponse({ type: BranchResponseDto })
  async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateBranchDto,
  ): Promise<BranchResponseDto> {
    return this.branchService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete a branch' })
  @ApiOkResponse({ type: BranchResponseDto })
  async delete(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<BranchResponseDto> {
    return this.branchService.softDelete(id);
  }

  // ── Settings ──────────────────────────────────────────────────────────

  @Get(':id/settings')
  @ApiOperation({ summary: 'Get branch operational settings' })
  async getSettings(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.branchService.getSettings(id);
  }

  @Patch(':id/settings')
  @UseGuards(PermissionsGuard)
  @RequirePermissions(Permission.MANAGE_BRANCH_SETTINGS)
  @ApiOperation({ summary: 'Update branch operational settings' })
  async updateSettings(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateBranchSettingsDto,
  ) {
    return this.branchService.updateSettings(id, dto);
  }

  // ── Operating Hours ───────────────────────────────────────────────────

  @Get(':id/operating-hours')
  @ApiOperation({ summary: 'Get branch weekly operating hours' })
  async getOperatingHours(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.branchService.getOperatingHours(id);
  }

  @Put(':id/operating-hours')
  @ApiOperation({ summary: 'Set/replace branch weekly operating hours' })
  async setOperatingHours(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: SetOperatingHoursDto,
  ) {
    return this.branchService.setOperatingHours(id, dto);
  }

  // ── Holidays ──────────────────────────────────────────────────────────

  @Get(':id/holidays')
  @ApiOperation({ summary: 'Get branch holiday schedule' })
  async getHolidays(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.branchService.getHolidays(id);
  }

  @Post(':id/holidays')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Add a holiday or special schedule to branch' })
  async addHoliday(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: CreateHolidayDto,
  ) {
    return this.branchService.addHoliday(id, dto);
  }

  // ── Staff ─────────────────────────────────────────────────────────────

  @Get(':id/staff')
  @ApiOperation({ summary: 'Get all staff assigned to this branch with optional role and search filters' })
  @ApiQuery({ name: 'role', required: false, type: String })
  @ApiQuery({ name: 'search', required: false, type: String })
  async getStaff(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Query('role') role?: string,
    @Query('search') search?: string,
  ) {
    return this.branchService.getStaffByBranch(id, { role, search });
  }

  @Get(':id/staff/:staffId')
  @ApiOperation({ summary: 'Get a single staff member assigned to this branch by ID' })
  async getStaffMember(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Param('staffId') staffId: string,
  ) {
    return this.branchService.getStaffMember(id, staffId);
  }

  @Post(':id/staff')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new staff member and assign to this branch' })
  async createStaff(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: CreateBranchStaffDto,
  ) {
    return this.branchService.createStaffForBranch(id, dto);
  }

  @Post(':id/staff/assign')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Assign a staff member to this branch' })
  async assignStaff(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: { staffId: string; role: any; permissions?: string[] },
  ) {
    return this.branchService.assignStaffToBranch(id, dto);
  }

  @Patch(':id/staff/:staffId')
  @ApiOperation({ summary: 'Update staff assignment details in this branch' })
  async updateStaff(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Param('staffId') staffId: string,
    @Body() dto: UpdateBranchStaffDto,
  ) {
    return this.branchService.updateStaff(id, staffId, dto);
  }

  @Delete(':id/staff/:staffId')
  @ApiOperation({ summary: 'Deactivate / soft delete staff assignment in this branch' })
  async deleteStaff(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Param('staffId') staffId: string,
  ) {
    return this.branchService.softDeleteStaff(id, staffId);
  }
}
