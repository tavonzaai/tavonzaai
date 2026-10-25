import {
  Controller,
  Get,
  Post,
  Patch,
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
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';
import { RequirePermissions } from '../../../../common/decorators/require-permissions.decorator';
import { Permission } from '@/authorization';
import type { JwtPayload } from '../../../identity/infrastructure/adapters/jwt.strategy';
import { BranchAccessService } from '../../../authorization/application/services/branch-access.service';
import { TableService } from '../../application/services/table.service';
import {
  CreateTableDto,
  UpdateTableDto,
  TableResponseDto,
  CreateReservationDto,
  UpdateReservationStatusDto,
  ReservationResponseDto,
} from './dto/table.dto';
import { ApiStandardErrors } from '../../../../common/swagger';

@ApiTags('Operations | Tables & Areas')
@Controller('tables')
export class TableController {
  constructor(
    private readonly tableService: TableService,
    private readonly branchAccess: BranchAccessService,
  ) {}

  // ── Public QR Code Resolution ─────────────────────────────────────────

  @Get('resolve-qr/:token')
  @ApiOperation({ summary: 'Resolve an opaque QR code token to table & branch information' })
  @ApiParam({ name: 'token', description: 'Opaque QR scan token string', example: 'qr_tok_live_998877665544332211' })
  @ApiOkResponse({ description: 'Table details resolved from QR code', type: TableResponseDto })
  @ApiStandardErrors(400, 404, 500)
  async resolveQr(
    @Param('token') token: string,
  ): Promise<TableResponseDto> {
    return this.tableService.resolveQrToken(token);
  }

  // ── Authenticated Table Management ────────────────────────────────────

  @Post()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions(Permission.TABLES_UPDATE)
  @ApiBearerAuth('access-token')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new table in a branch' })
  @ApiCreatedResponse({ description: 'Table created successfully', type: TableResponseDto })
  @ApiStandardErrors(400, 401, 403, 409, 500)
  async create(
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreateTableDto,
  ): Promise<TableResponseDto> {
    await this.branchAccess.assertAccess(user, dto.branchId);
    return this.tableService.create(dto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions(Permission.TABLES_READ)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'List all tables in a branch' })
  @ApiQuery({ name: 'branchId', required: true, type: String, description: 'Branch UUID', example: 'ce7b4318-5e2e-4fcd-a459-0e1bc80a6f27' })
  @ApiOkResponse({ description: 'List of tables', type: [TableResponseDto] })
  @ApiStandardErrors(400, 401, 403, 500)
  async listByBranch(
    @CurrentUser() user: JwtPayload,
    @Query('branchId', new ParseUUIDPipe()) branchId: string,
  ): Promise<TableResponseDto[]> {
    await this.branchAccess.assertAccess(user, branchId);
    return this.tableService.findByBranch(branchId);
  }

  @Get('branch/:branchId')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions(Permission.TABLES_READ)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'List all tables in a branch' })
  @ApiParam({ name: 'branchId', description: 'Branch UUID', example: 'ce7b4318-5e2e-4fcd-a459-0e1bc80a6f27' })
  @ApiOkResponse({ description: 'List of tables', type: [TableResponseDto] })
  @ApiStandardErrors(400, 401, 403, 500)
  async listByBranchPath(
    @CurrentUser() user: JwtPayload,
    @Param('branchId', new ParseUUIDPipe()) branchId: string,
  ): Promise<TableResponseDto[]> {
    await this.branchAccess.assertAccess(user, branchId);
    return this.tableService.findByBranch(branchId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions(Permission.TABLES_READ)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get table details by ID' })
  @ApiParam({ name: 'id', description: 'Table UUID', example: 'e7b1a2c3-d4e5-6789-0123-456789abcdef' })
  @ApiOkResponse({ description: 'Table details', type: TableResponseDto })
  @ApiStandardErrors(401, 403, 404, 500)
  async getById(
    @CurrentUser() user: JwtPayload,
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<TableResponseDto> {
    const table = await this.tableService.findById(id);
    await this.branchAccess.assertAccess(user, table.branchId);
    return table;
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions(Permission.TABLES_UPDATE)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Update table properties or service status' })
  @ApiParam({ name: 'id', description: 'Table UUID', example: 'e7b1a2c3-d4e5-6789-0123-456789abcdef' })
  @ApiOkResponse({ description: 'Table updated successfully', type: TableResponseDto })
  @ApiStandardErrors(400, 401, 403, 404, 500)
  async update(
    @CurrentUser() user: JwtPayload,
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateTableDto,
  ): Promise<TableResponseDto> {
    const existing = await this.tableService.findById(id);
    await this.branchAccess.assertAccess(user, existing.branchId);
    return this.tableService.update(id, dto);
  }

  @Post(':id/regenerate-qr')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions(Permission.TABLES_UPDATE)
  @ApiBearerAuth('access-token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Rotate and regenerate the opaque QR token for a table' })
  @ApiParam({ name: 'id', description: 'Table UUID', example: 'e7b1a2c3-d4e5-6789-0123-456789abcdef' })
  @ApiOkResponse({ description: 'Table updated with regenerated QR token', type: TableResponseDto })
  @ApiStandardErrors(401, 403, 404, 500)
  async regenerateQr(
    @CurrentUser() user: JwtPayload,
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<TableResponseDto> {
    const existing = await this.tableService.findById(id);
    await this.branchAccess.assertAccess(user, existing.branchId);
    return this.tableService.regenerateQr(id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions(Permission.TABLES_UPDATE)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Soft delete a table (revokes QR; blocked while in use)' })
  @ApiParam({ name: 'id', description: 'Table UUID', example: 'e7b1a2c3-d4e5-6789-0123-456789abcdef' })
  @ApiOkResponse({ description: 'Table soft-deleted', type: TableResponseDto })
  @ApiStandardErrors(401, 403, 404, 409, 500)
  async delete(
    @CurrentUser() user: JwtPayload,
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<TableResponseDto> {
    const existing = await this.tableService.findById(id);
    await this.branchAccess.assertAccess(user, existing.branchId);
    return this.tableService.softDelete(id);
  }

  // ── Reservations ──────────────────────────────────────────────────────

  @Post('reservations')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new table reservation' })
  @ApiCreatedResponse({ description: 'Reservation created successfully', type: ReservationResponseDto })
  @ApiStandardErrors(400, 401, 403, 409, 500)
  async createReservation(
    @Body() dto: CreateReservationDto,
  ): Promise<ReservationResponseDto> {
    return this.tableService.createReservation(dto);
  }

  @Get('reservations/branch/:branchId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'List reservations for a branch' })
  @ApiParam({ name: 'branchId', description: 'Branch UUID', example: 'ce7b4318-5e2e-4fcd-a459-0e1bc80a6f27' })
  @ApiOkResponse({ description: 'List of reservations', type: [ReservationResponseDto] })
  @ApiStandardErrors(401, 403, 404, 500)
  async listReservations(
    @Param('branchId', new ParseUUIDPipe()) branchId: string,
  ): Promise<ReservationResponseDto[]> {
    return this.tableService.getReservations(branchId);
  }

  @Get('reservations/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get reservation details by ID' })
  @ApiParam({ name: 'id', description: 'Reservation UUID', example: 'fa01b2c3-d4e5-6789-0123-456789abcdef' })
  @ApiOkResponse({ description: 'Reservation details', type: ReservationResponseDto })
  @ApiStandardErrors(401, 403, 404, 500)
  async getReservationById(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<ReservationResponseDto> {
    return this.tableService.getReservationById(id);
  }

  @Patch('reservations/:id/status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Update reservation status' })
  @ApiParam({ name: 'id', description: 'Reservation UUID', example: 'fa01b2c3-d4e5-6789-0123-456789abcdef' })
  @ApiOkResponse({ description: 'Reservation status updated', type: ReservationResponseDto })
  @ApiStandardErrors(400, 401, 403, 404, 500)
  async updateReservationStatus(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateReservationStatusDto,
  ): Promise<ReservationResponseDto> {
    return this.tableService.updateReservationStatus(id, dto.status);
  }

  @Delete('reservations/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Soft delete / cancel reservation' })
  @ApiParam({ name: 'id', description: 'Reservation UUID', example: 'fa01b2c3-d4e5-6789-0123-456789abcdef' })
  @ApiOkResponse({ description: 'Reservation cancelled', type: ReservationResponseDto })
  @ApiStandardErrors(401, 403, 404, 500)
  async deleteReservation(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<ReservationResponseDto> {
    return this.tableService.softDeleteReservation(id);
  }
}
