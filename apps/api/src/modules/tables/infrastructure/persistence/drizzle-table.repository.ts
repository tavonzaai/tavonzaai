import { Injectable, Inject } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { randomBytes } from 'crypto';
import {
  DRIZZLE,
  type DrizzleDatabase,
  tables,
  reservations,
} from '@tavonza/database';
import type {
  Table,
  Reservation,
  TableShape,
  TableServiceStatus,
  TableOperationalFlag,
  ReservationStatus,
} from '../../domain/entities/table.entity';

@Injectable()
export class DrizzleTableRepository {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDatabase) {}

  // ── Tables ────────────────────────────────────────────────────────────

  async createTable(data: {
    branchId: string;
    label: string;
    capacity: number;
    shape?: TableShape;
    floor?: number;
  }): Promise<Table> {
    const qrCodeToken = this.generateOpaqueToken();

    const [created] = await this.db
      .insert(tables)
      .values({
        branchId: data.branchId,
        label: data.label,
        capacity: data.capacity,
        shape: data.shape ?? 'SQUARE',
        floor: data.floor ?? 1,
        qrCodeToken,
        serviceStatus: 'AVAILABLE',
        operationalFlag: 'NORMAL',
      })
      .returning();

    if (!created) throw new Error('Failed to create table');
    return this.mapTable(created);
  }

  async findTableById(id: string): Promise<Table | null> {
    const [row] = await this.db
      .select()
      .from(tables)
      .where(eq(tables.id, id))
      .limit(1);

    return row ? this.mapTable(row) : null;
  }

  async findByQrToken(qrCodeToken: string): Promise<Table | null> {
    const [row] = await this.db
      .select()
      .from(tables)
      .where(eq(tables.qrCodeToken, qrCodeToken))
      .limit(1);

    return row ? this.mapTable(row) : null;
  }

  async findTablesByBranch(branchId: string): Promise<Table[]> {
    const rows = await this.db
      .select()
      .from(tables)
      .where(eq(tables.branchId, branchId));

    return rows.map((r) => this.mapTable(r));
  }

  async updateTable(
    id: string,
    data: Partial<{
      label: string;
      capacity: number;
      serviceStatus: TableServiceStatus;
      operationalFlag: TableOperationalFlag;
      shape: TableShape;
      floor: number;
    }>,
  ): Promise<Table | null> {
    const [updated] = await this.db
      .update(tables)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(tables.id, id))
      .returning();

    return updated ? this.mapTable(updated) : null;
  }

  async regenerateQrToken(tableId: string): Promise<Table | null> {
    const newToken = this.generateOpaqueToken();

    const [updated] = await this.db
      .update(tables)
      .set({
        qrCodeToken: newToken,
        updatedAt: new Date(),
      })
      .where(eq(tables.id, tableId))
      .returning();

    return updated ? this.mapTable(updated) : null;
  }

  async deleteTable(id: string): Promise<boolean> {
    const result = await this.db
      .delete(tables)
      .where(eq(tables.id, id))
      .returning();

    return result.length > 0;
  }

  // ── Reservations ──────────────────────────────────────────────────────

  async createReservation(data: {
    branchId: string;
    tableId?: string;
    guestName: string;
    guestPhone: string;
    partySize: number;
    reservedFor: Date;
    durationMins?: number;
    specialRequest?: string;
  }): Promise<Reservation> {
    const [created] = await this.db
      .insert(reservations)
      .values({
        branchId: data.branchId,
        tableId: data.tableId ?? null,
        guestName: data.guestName,
        guestPhone: data.guestPhone,
        partySize: data.partySize,
        reservedFor: data.reservedFor,
        durationMins: data.durationMins ?? 90,
        specialRequest: data.specialRequest ?? null,
        status: 'PENDING',
      })
      .returning();

    if (!created) throw new Error('Failed to create reservation');
    return this.mapReservation(created);
  }

  async findReservationsByBranch(branchId: string): Promise<Reservation[]> {
    const rows = await this.db
      .select()
      .from(reservations)
      .where(eq(reservations.branchId, branchId));

    return rows.map((r) => this.mapReservation(r));
  }

  async findReservationById(id: string): Promise<Reservation | null> {
    const [row] = await this.db
      .select()
      .from(reservations)
      .where(eq(reservations.id, id))
      .limit(1);

    return row ? this.mapReservation(row) : null;
  }

  async updateReservationStatus(
    id: string,
    status: ReservationStatus,
  ): Promise<Reservation | null> {
    const [updated] = await this.db
      .update(reservations)
      .set({
        status,
        updatedAt: new Date(),
      })
      .where(eq(reservations.id, id))
      .returning();

    return updated ? this.mapReservation(updated) : null;
  }

  // ── Helpers & Mappers ─────────────────────────────────────────────────

  private generateOpaqueToken(): string {
    return randomBytes(32).toString('hex');
  }

  private mapTable(row: any): Table {
    return {
      id: row.id,
      branchId: row.branchId,
      label: row.label,
      capacity: row.capacity,
      serviceStatus: row.serviceStatus,
      operationalFlag: row.operationalFlag,
      qrCodeToken: row.qrCodeToken,
      shape: row.shape,
      floor: row.floor,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }

  private mapReservation(row: any): Reservation {
    return {
      id: row.id,
      branchId: row.branchId,
      tableId: row.tableId,
      customerId: row.customerId,
      tableSessionId: row.tableSessionId,
      guestName: row.guestName,
      guestPhone: row.guestPhone,
      partySize: row.partySize,
      reservedFor: row.reservedFor,
      durationMins: row.durationMins ?? 90,
      status: row.status,
      specialRequest: row.specialRequest,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }
}
