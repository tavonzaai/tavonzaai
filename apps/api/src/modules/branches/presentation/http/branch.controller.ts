import {
  Controller,
  Get,
  Post,
  Patch,
  Put,
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
import { BranchService } from '../../application/services/branch.service';
import {
  CreateBranchDto,
  UpdateBranchDto,
  UpdateBranchSettingsDto,
  SetOperatingHoursDto,
  CreateHolidayDto,
  BranchResponseDto,
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
  @ApiOperation({ summary: 'List branches by restaurant ID' })
  @ApiQuery({ name: 'restaurantId', required: true, type: String })
  @ApiOkResponse({ type: [BranchResponseDto] })
  async listByRestaurant(
    @Query('restaurantId', new ParseUUIDPipe()) restaurantId: string,
  ): Promise<BranchResponseDto[]> {
    return this.branchService.findByRestaurantId(restaurantId);
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

  // ── Settings ──────────────────────────────────────────────────────────

  @Get(':id/settings')
  @ApiOperation({ summary: 'Get branch operational settings' })
  async getSettings(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.branchService.getSettings(id);
  }

  @Patch(':id/settings')
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
}
