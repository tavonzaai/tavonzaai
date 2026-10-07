import { Injectable, Inject } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import {
  DRIZZLE,
  type DrizzleDatabase,
  workShifts,
} from '@tavonza/database';
import { DrizzleQueryBuilder } from '../../../../common/database';
import type { WorkShiftEntity } from '../../domain/entities/shift.entity';
import {
  InternalOperationException,
  ResourceNotFoundException,
} from '../../../../common/errors/app.exception';

@Injectable()
export class DrizzleShiftRepository {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDatabase) {}

  async createShift(data: {
    branchId: string;
    staffAssignmentId: string;
    name: string;
    startTime: Date;
    endTime: Date;
    durationMin?: number;
    date: string;
    note?: string;
    createdById: string;
  }): Promise<WorkShiftEntity> {
    const [created] = await this.db
      .insert(workShifts)
      .values({
        branchId: data.branchId,
        staffAssignmentId: data.staffAssignmentId,
        name: data.name,
        startTime: data.startTime,
        endTime: data.endTime,
        durationMin: data.durationMin ?? 480,
        date: data.date,
        note: data.note ?? null,
        createdById: data.createdById,
        status: 'ACTIVE',
      })
      .returning();

    if (!created) throw new InternalOperationException('Failed to create work shift');
    return this.mapShift(created);
  }

  async findById(id: string): Promise<WorkShiftEntity | null> {
    const [row] = await this.db
      .select()
      .from(workShifts)
      .where(eq(workShifts.id, id))
      .limit(1);

    return row ? this.mapShift(row) : null;
  }

  async findByBranch(branchId: string, date?: string): Promise<WorkShiftEntity[]> {
    const qb = new DrizzleQueryBuilder<typeof workShifts>(this.db, workShifts)
      .filterExact({ branchId, date })
      .softDelete({ column: workShifts.status, activeValue: 'ACTIVE' })
      .sort('startTime', 'asc');

    const rows = await qb.executePlain();
    return rows.map((r) => this.mapShift(r));
  }

  async findByStaffAssignment(staffAssignmentId: string, date?: string): Promise<WorkShiftEntity[]> {
    const qb = new DrizzleQueryBuilder<typeof workShifts>(this.db, workShifts)
      .filterExact({ staffAssignmentId, date })
      .softDelete({ column: workShifts.status, activeValue: 'ACTIVE' })
      .sort('startTime', 'asc');

    const rows = await qb.executePlain();
    return rows.map((r) => this.mapShift(r));
  }

  async updateShift(
    id: string,
    updates: Partial<{
      status: WorkShiftEntity['status'];
      checkInAt: Date | null;
      checkOutAt: Date | null;
      note: string | null;
    }>
  ): Promise<WorkShiftEntity> {
    const [updated] = await this.db
      .update(workShifts)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(workShifts.id, id))
      .returning();

    if (!updated) throw new ResourceNotFoundException('WorkShift', id);
    return this.mapShift(updated);
  }

  private mapShift(row: typeof workShifts.$inferSelect): WorkShiftEntity {
    return {
      id: row.id,
      branchId: row.branchId,
      staffAssignmentId: row.staffAssignmentId,
      name: row.name,
      startTime: row.startTime,
      endTime: row.endTime,
      durationMin: row.durationMin ?? 480,
      date: row.date,
      status: row.status as WorkShiftEntity['status'],
      checkInAt: row.checkInAt,
      checkOutAt: row.checkOutAt,
      note: row.note,
      createdById: row.createdById,
      createdAt: row.createdAt ?? new Date(),
      updatedAt: row.updatedAt ?? new Date(),
    };
  }
}
