import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { OutboxService } from '@tavonza/database';
import { DrizzleTableRepository } from '../../infrastructure/persistence/drizzle-table.repository';
import type {
  CreateTableDto,
  UpdateTableDto,
  TableResponseDto,
  CreateReservationDto,
  ReservationResponseDto,
} from '../../presentation/http/dto/table.dto';
import type { Table, Reservation, ReservationStatus, TableServiceStatus } from '../../domain/entities/table.entity';

@Injectable()
export class TableService {
  constructor(
    private readonly tableRepo: DrizzleTableRepository,
    private readonly outboxService: OutboxService,
  ) {}

  // ── Tables ────────────────────────────────────────────────────────────

  async create(dto: CreateTableDto): Promise<TableResponseDto> {
    const table = await this.tableRepo.createTable({
      branchId: dto.branchId,
      label: dto.label,
      capacity: dto.capacity,
      shape: dto.shape,
      floor: dto.floor,
    });

    return this.toTableResponseDto(table);
  }

  async findById(id: string): Promise<TableResponseDto> {
    const table = await this.tableRepo.findTableById(id);
    if (!table) {
      throw new NotFoundException(`Table with ID "${id}" not found`);
    }
    return this.toTableResponseDto(table);
  }

  async findByBranch(branchId: string): Promise<TableResponseDto[]> {
    const tables = await this.tableRepo.findTablesByBranch(branchId);
    return tables.map((t) => this.toTableResponseDto(t));
  }

  async resolveQrToken(token: string): Promise<TableResponseDto> {
    const table = await this.tableRepo.findByQrToken(token);
    if (!table) {
      throw new NotFoundException('Invalid or expired QR code token');
    }
    return this.toTableResponseDto(table);
  }

  async regenerateQr(tableId: string): Promise<TableResponseDto> {
    const table = await this.tableRepo.regenerateQrToken(tableId);
    if (!table) {
      throw new NotFoundException(`Table with ID "${tableId}" not found`);
    }
    return this.toTableResponseDto(table);
  }

  async update(id: string, dto: UpdateTableDto): Promise<TableResponseDto> {
    const table = await this.tableRepo.findTableById(id);
    if (!table) {
      throw new NotFoundException(`Table with ID "${id}" not found`);
    }

    const updated = await this.tableRepo.updateTable(id, dto);
    if (!updated) {
      throw new NotFoundException(`Failed to update table`);
    }

    return this.toTableResponseDto(updated);
  }

  async softDelete(id: string): Promise<TableResponseDto> {
    const table = await this.tableRepo.findTableById(id);
    if (!table) {
      throw new NotFoundException(`Table with ID "${id}" not found`);
    }

    const updated = await this.tableRepo.softDeleteTable(id);
    if (!updated) {
      throw new NotFoundException(`Failed to soft-delete table "${id}"`);
    }

    return this.toTableResponseDto(updated);
  }

  async updateServiceStatus(
    tableId: string,
    status: TableServiceStatus,
    activeSessionId?: string | null,
  ): Promise<TableResponseDto> {
    const table = await this.tableRepo.updateTable(tableId, { serviceStatus: status });
    if (!table) {
      throw new NotFoundException(`Table with ID "${tableId}" not found`);
    }

    await this.outboxService.publishEvent({
      aggregateType: 'TABLE',
      aggregateId: table.id,
      eventType: 'TableStatusChanged',
      branchId: table.branchId,
      payload: {
        tableId: table.id,
        tableLabel: table.label,
        branchId: table.branchId,
        serviceStatus: table.serviceStatus,
        operationalFlag: table.operationalFlag,
        activeSessionId: activeSessionId ?? null,
        updatedAt: new Date().toISOString(),
      },
    });

    return this.toTableResponseDto(table);
  }

  // ── Reservations ──────────────────────────────────────────────────────

  async createReservation(dto: CreateReservationDto): Promise<ReservationResponseDto> {
    const reservation = await this.tableRepo.createReservation({
      branchId: dto.branchId,
      tableId: dto.tableId,
      guestName: dto.guestName,
      guestPhone: dto.guestPhone,
      partySize: dto.partySize,
      reservedFor: new Date(dto.reservedFor),
      durationMins: dto.durationMins,
      specialRequest: dto.specialRequest,
    });

    return this.toReservationResponseDto(reservation);
  }

  async getReservations(branchId: string): Promise<ReservationResponseDto[]> {
    const reservations = await this.tableRepo.findReservationsByBranch(branchId);
    return reservations.map((r) => this.toReservationResponseDto(r));
  }

  async getReservationById(id: string): Promise<ReservationResponseDto> {
    const reservation = await this.tableRepo.findReservationById(id);
    if (!reservation) {
      throw new NotFoundException(`Reservation with ID "${id}" not found`);
    }
    return this.toReservationResponseDto(reservation);
  }

  async softDeleteReservation(id: string): Promise<ReservationResponseDto> {
    const reservation = await this.tableRepo.findReservationById(id);
    if (!reservation) {
      throw new NotFoundException(`Reservation with ID "${id}" not found`);
    }

    const updated = await this.tableRepo.softDeleteReservation(id);
    if (!updated) {
      throw new NotFoundException(`Failed to cancel reservation`);
    }

    return this.toReservationResponseDto(updated);
  }

  async updateReservationStatus(
    id: string,
    status: ReservationStatus,
  ): Promise<ReservationResponseDto> {
    const reservation = await this.tableRepo.findReservationById(id);
    if (!reservation) {
      throw new NotFoundException(`Reservation with ID "${id}" not found`);
    }

    const updated = await this.tableRepo.updateReservationStatus(id, status);
    if (!updated) {
      throw new NotFoundException(`Failed to update reservation`);
    }

    return this.toReservationResponseDto(updated);
  }

  // ── Mappers ───────────────────────────────────────────────────────────

  private toTableResponseDto(table: Table): TableResponseDto {
    return {
      id: table.id,
      branchId: table.branchId,
      label: table.label,
      capacity: table.capacity,
      serviceStatus: table.serviceStatus,
      operationalFlag: table.operationalFlag,
      qrCodeToken: table.qrCodeToken,
      shape: table.shape,
      floor: table.floor,
      createdAt: table.createdAt,
      updatedAt: table.updatedAt,
    };
  }

  private toReservationResponseDto(r: Reservation): ReservationResponseDto {
    return {
      id: r.id,
      branchId: r.branchId,
      tableId: r.tableId,
      guestName: r.guestName,
      guestPhone: r.guestPhone,
      partySize: r.partySize,
      reservedFor: r.reservedFor,
      durationMins: r.durationMins,
      status: r.status,
      specialRequest: r.specialRequest,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    };
  }
}
