import { Injectable, Inject } from '@nestjs/common';
import { and, eq, inArray, isNull, ne, or, sql } from 'drizzle-orm';
import { DrizzleQueryBuilder } from '../../../../common/database';
import { randomBytes } from 'crypto';
import {
  DRIZZLE,
  type DrizzleDatabase,
  tables,
  reservations,
  waiterTableAssignments,
  staff,
  users,
  branches,
  tableSessions,
  orders,
} from '@/database';
import type {
  Table,
  Reservation,
  TableShape,
  TableServiceStatus,
  TableOperationalFlag,
  ReservationStatus,
} from '../../domain/entities/table.entity';
import { InternalOperationException } from '../../../../common/errors/app.exception';

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

    if (!created) throw new InternalOperationException('Failed to create table');
    return this.mapTable(created);
  }

  async findTableById(id: string): Promise<Table | null> {
    const [row] = await this.db
      .select()
      .from(tables)
      .where(eq(tables.id, id))
      .limit(1);

    if (!row) return null;

    const mapped = this.mapTable(row);

    try {
      const [assignment] = await this.db
        .select({
          waiterId: waiterTableAssignments.waiterId,
          sessionStart: waiterTableAssignments.sessionStart,
          sessionEnd: waiterTableAssignments.sessionEnd,
          name: users.name,
        })
        .from(waiterTableAssignments)
        .innerJoin(staff, eq(staff.id, waiterTableAssignments.waiterId))
        .innerJoin(users, eq(users.id, staff.userId))
        .where(
          and(
            eq(waiterTableAssignments.tableId, id),
            eq(waiterTableAssignments.isActive, true),
          ),
        )
        .limit(1);

      if (assignment) {
        mapped.assignedWaiter = {
          waiterId: assignment.waiterId,
          waiterName: assignment.name,
          sessionStart: assignment.sessionStart,
          sessionEnd: assignment.sessionEnd,
        };
      }
    } catch {}

    return mapped;
  }

  /** Opaque QR token only — never resolve by table UUID. Soft-deleted / inactive / out-of-service tables are invisible. */
  async findByQrToken(qrCodeToken: string): Promise<Table | null> {
    const [row] = await this.db
      .select({ table: tables })
      .from(tables)
      .innerJoin(branches, eq(branches.id, tables.branchId))
      .where(
        and(
          eq(tables.qrCodeToken, qrCodeToken),
          eq(tables.isActive, true),
          isNull(tables.deletedAt),
          ne(tables.operationalFlag, 'OUT_OF_SERVICE'),
          eq(branches.isActive, true),
        ),
      )
      .limit(1);

    return row ? this.mapTable(row.table) : null;
  }

  async findTablesByBranch(
    branchId: string,
    options?: {
      search?: string;
      serviceStatus?: TableServiceStatus;
      operationalFlag?: TableOperationalFlag;
      floor?: number;
    },
  ): Promise<Table[]> {
    const qb = DrizzleQueryBuilder.from(this.db, tables)
      .filterExact({
        branchId,
        serviceStatus: options?.serviceStatus,
        operationalFlag: options?.operationalFlag,
        floor: options?.floor,
        isActive: true,
      })
      .filterNull(tables.deletedAt, true);

    if (!options?.operationalFlag) {
      qb.andWhere(ne(tables.operationalFlag, 'OUT_OF_SERVICE'));
    }

    const rows = await qb
      .search(options?.search, [tables.label])
      .sort(tables.label, 'asc')
      .executePlain();

    return rows.map((r) => this.mapTable(r));
  }

  /** Reasons a table cannot be soft-deleted (active dining / unpaid work / waiter coverage). */
  async findDeleteBlockers(tableId: string): Promise<string[]> {
    const blockers: string[] = [];

    const [openSession] = await this.db
      .select({ id: tableSessions.id })
      .from(tableSessions)
      .where(
        and(
          eq(tableSessions.tableId, tableId),
          inArray(tableSessions.status, ['ACTIVE', 'BILL_REQUESTED']),
        ),
      )
      .limit(1);
    if (openSession) {
      blockers.push('An active table session is still open for this table');
    }

    const [openOrder] = await this.db
      .select({ id: orders.id })
      .from(orders)
      .where(
        and(
          eq(orders.tableId, tableId),
          ne(orders.status, 'CANCELLED'),
          ne(orders.status, 'REJECTED'),
          ne(orders.status, 'COMPLETED'),
          or(
            eq(orders.paymentStatus, 'UNPAID'),
            eq(orders.paymentStatus, 'PARTIALLY_PAID'),
            inArray(orders.status, ['DRAFT', 'PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'SERVED']),
          ),
        ),
      )
      .limit(1);
    if (openOrder) {
      blockers.push('This table still has unfinished or unpaid orders');
    }

    const now = new Date();
    const [assignment] = await this.db
      .select({ id: waiterTableAssignments.id })
      .from(waiterTableAssignments)
      .where(
        and(
          eq(waiterTableAssignments.tableId, tableId),
          eq(waiterTableAssignments.isActive, true),
          sql`${waiterTableAssignments.sessionEnd} > ${now}`,
        ),
      )
      .limit(1);
    if (assignment) {
      blockers.push('A waiter is still assigned to this table');
    }

    return blockers;
  }

  async softDeleteTable(id: string): Promise<Table | null> {
    const [updated] = await this.db
      .update(tables)
      .set({
        isActive: false,
        deletedAt: new Date(),
        qrCodeToken: null,
        operationalFlag: 'OUT_OF_SERVICE',
        serviceStatus: 'AVAILABLE',
        updatedAt: new Date(),
      })
      .where(and(eq(tables.id, id), isNull(tables.deletedAt)))
      .returning();

    return updated ? this.mapTable(updated) : null;
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

    if (!created) throw new InternalOperationException('Failed to create reservation');
    return this.mapReservation(created);
  }

  async findReservationsByBranch(
    branchId: string,
    options?: {
      status?: ReservationStatus;
      search?: string;
    },
  ): Promise<Reservation[]> {
    return DrizzleQueryBuilder.from(this.db, reservations)
      .filterExact({
        branchId,
        status: options?.status,
      })
      .search(options?.search, [reservations.guestName, reservations.guestPhone])
      .sort(reservations.reservedFor, 'asc')
      .executePlain((r) => this.mapReservation(r));
  }

  async softDeleteReservation(id: string): Promise<Reservation | null> {
    return this.updateReservationStatus(id, 'CANCELLED');
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
      isActive: row.isActive !== false,
      deletedAt: row.deletedAt ?? null,
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
