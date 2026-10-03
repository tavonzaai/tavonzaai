import {
  Controller,
  Get,
  Post,
  Patch,
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
import { TableService } from '../../application/services/table.service';
import {
  CreateTableDto,
  UpdateTableDto,
  TableResponseDto,
  CreateReservationDto,
  ReservationResponseDto,
} from './dto/table.dto';
import type { ReservationStatus } from '../../domain/entities/table.entity';

@ApiTags('Tables & Areas')
@Controller('tables')
export class TableController {
  constructor(private readonly tableService: TableService) {}

  // ── Public QR Code Resolution ─────────────────────────────────────────

  @Get('resolve-qr/:token')
  @ApiOperation({ summary: 'Resolve an opaque QR code token to table & branch information' })
  @ApiOkResponse({ type: TableResponseDto })
  async resolveQr(
    @Param('token') token: string,
  ): Promise<TableResponseDto> {
    return this.tableService.resolveQrToken(token);
  }

  // ── Authenticated Table Management ────────────────────────────────────

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new table in a branch' })
  @ApiCreatedResponse({ type: TableResponseDto })
  async create(@Body() dto: CreateTableDto): Promise<TableResponseDto> {
    return this.tableService.create(dto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'List all tables in a branch' })
  @ApiQuery({ name: 'branchId', required: true, type: String })
  @ApiOkResponse({ type: [TableResponseDto] })
  async listByBranch(
    @Query('branchId', new ParseUUIDPipe()) branchId: string,
  ): Promise<TableResponseDto[]> {
    return this.tableService.findByBranch(branchId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get table details by ID' })
  @ApiOkResponse({ type: TableResponseDto })
  async getById(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<TableResponseDto> {
    return this.tableService.findById(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Update table properties or service status' })
  @ApiOkResponse({ type: TableResponseDto })
  async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateTableDto,
  ): Promise<TableResponseDto> {
    return this.tableService.update(id, dto);
  }

  @Post(':id/regenerate-qr')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Rotate and regenerate the opaque QR token for a table' })
  @ApiOkResponse({ type: TableResponseDto })
  async regenerateQr(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<TableResponseDto> {
    return this.tableService.regenerateQr(id);
  }

  // ── Reservations ──────────────────────────────────────────────────────

  @Post('reservations')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new table reservation' })
  @ApiCreatedResponse({ type: ReservationResponseDto })
  async createReservation(
    @Body() dto: CreateReservationDto,
  ): Promise<ReservationResponseDto> {
    return this.tableService.createReservation(dto);
  }

  @Get('reservations/branch/:branchId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'List reservations for a branch' })
  @ApiOkResponse({ type: [ReservationResponseDto] })
  async listReservations(
    @Param('branchId', new ParseUUIDPipe()) branchId: string,
  ): Promise<ReservationResponseDto[]> {
    return this.tableService.getReservations(branchId);
  }

  @Patch('reservations/:id/status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Update reservation status' })
  @ApiOkResponse({ type: ReservationResponseDto })
  async updateReservationStatus(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body('status') status: ReservationStatus,
  ): Promise<ReservationResponseDto> {
    return this.tableService.updateReservationStatus(id, status);
  }
}
