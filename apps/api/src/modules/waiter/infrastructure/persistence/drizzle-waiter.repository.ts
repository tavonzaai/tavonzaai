// ============================================================================
// Drizzle Waiter Repository — Staff / Table Assignment Persistence
// ============================================================================

import { Injectable, Inject } from '@nestjs/common';
import { eq, and, or } from 'drizzle-orm';
import {
  DRIZZLE,
  type DrizzleDatabase,
  staff,
  staffAssignments,
  waiterTableAssignments,
  tables,
} from '@tavonza/database';
import { isUUID } from '@tavonza/shared';
import { DrizzleQueryBuilder } from '../../../../common/database';

import type {
  StaffProfile,
  BranchStaffAssignment,
  WaiterTableAssignment,
} from '../../domain/entities/waiter.entity';
import { InternalOperationException } from '../../../../common/errors/app.exception';

@Injectable()
export class DrizzleWaiterRepository {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDatabase) {}

  // ── Staff Profiles ──────────────────────────────────────────────────

  async createProfile(data: {
    userId: string;
    organizationId?: string;
    restaurantId?: string;
    employeeCode?: string;
    jobTitle?: string;
  }): Promise<StaffProfile> {
    const [result] = await this.db
      .insert(staff)
      .values({
        userId: data.userId,
      })
      .returning();

    if (!result) throw new InternalOperationException('Failed to create staff profile');

    return {
      id: result.id,
      userId: result.userId,
      jobTitle: data.jobTitle ?? 'WAITER',
      status: 'active',
      createdAt: result.createdAt ?? new Date(),
      updatedAt: result.updatedAt ?? new Date(),
    };
  }

  async findProfileByUserId(userId: string): Promise<StaffProfile | null> {
    const [row] = await this.db
      .select()
      .from(staff)
      .where(eq(staff.userId, userId))
      .limit(1);

    if (!row) return null;

    return {
      id: row.id,
      userId: row.userId,
      jobTitle: 'WAITER',
      status: 'active',
      createdAt: row.createdAt ?? new Date(),
      updatedAt: row.updatedAt ?? new Date(),
    };
  }

  async findProfileById(staffId: string): Promise<StaffProfile | null> {
    const [row] = await this.db
      .select()
      .from(staff)
      .where(eq(staff.id, staffId))
      .limit(1);

    if (!row) return null;

    return {
      id: row.id,
      userId: row.userId,
      jobTitle: 'WAITER',
      status: 'active',
      createdAt: row.createdAt ?? new Date(),
      updatedAt: row.updatedAt ?? new Date(),
    };
  }

  // ── Branch Staff Assignments ────────────────────────────────────────

  async assignToBranch(data: {
    branchId: string;
    staffProfileId: string;
    assignedById?: string;
    role?: any;
    permissions?: string[];
  }): Promise<BranchStaffAssignment> {
    const [result] = await this.db
      .insert(staffAssignments)
      .values({
        branchId: data.branchId,
        staffId: data.staffProfileId,
        role: data.role ?? 'WAITER',
        permissions: data.permissions ?? [],
        isActive: true,
      })
      .returning();

    if (!result) throw new InternalOperationException('Failed to assign staff to branch');

    return {
      id: result.id,
      branchId: result.branchId,
      staffId: result.staffId,
      staffProfileId: result.staffId,
      role: result.role,
      permissions: result.permissions,
      isActive: result.isActive ?? true,
      createdAt: result.createdAt ?? new Date(),
    };
  }

  async findActiveBranchesForStaff(staffId: string): Promise<BranchStaffAssignment[]> {
    const qb = new DrizzleQueryBuilder<typeof staffAssignments>(this.db, staffAssignments)
      .filterExact({ staffId })
      .softDelete({ column: staffAssignments.isActive, activeValue: true });

    const rows = await qb.executePlain();

    return rows.map((r) => ({
      id: r.id,
      branchId: r.branchId,
      staffId: r.staffId,
      staffProfileId: r.staffId,
      role: r.role,
      permissions: r.permissions,
      isActive: r.isActive ?? true,
      createdAt: r.createdAt ?? new Date(),
    }));
  }

  async isStaffAssignedToBranch(staffId: string, branchId: string): Promise<boolean> {
    if (!staffId || !branchId || !isUUID(staffId) || !isUUID(branchId)) {
      return false;
    }
    const result = await this.db
      .select({ id: staffAssignments.id })
      .from(staffAssignments)
      .where(
        and(
          eq(staffAssignments.staffId, staffId),
          eq(staffAssignments.branchId, branchId),
          eq(staffAssignments.isActive, true),
        ),
      )
      .limit(1);

    return result.length > 0;
  }


  // ── Waiter Table Assignments ────────────────────────────────────────

  async assignTable(data: {
    branchId: string;
    waiterId: string;
    tableId: string;
    assignedById: string;
    sessionStart?: Date;
    sessionEnd?: Date;
  }): Promise<WaiterTableAssignment> {
    const start = data.sessionStart ?? new Date();
    const end = data.sessionEnd ?? new Date(Date.now() + 8 * 60 * 60 * 1000); // 8-hour shift default

    // Deactivate previous active assignment for this table so reassignment succeeds seamlessly
    await this.db
      .update(waiterTableAssignments)
      .set({ isActive: false, updatedAt: new Date() })
      .where(
        and(
          eq(waiterTableAssignments.tableId, data.tableId),
          eq(waiterTableAssignments.branchId, data.branchId),
          eq(waiterTableAssignments.isActive, true),
        ),
      );

    const [result] = await this.db
      .insert(waiterTableAssignments)
      .values({
        branchId: data.branchId,
        waiterId: data.waiterId,
        tableId: data.tableId,
        assignedById: data.assignedById,
        sessionStart: start,
        sessionEnd: end,
        isActive: true,
      })
      .returning();

    if (!result) throw new InternalOperationException('Failed to assign table to waiter');

    return {
      id: result.id,
      branchId: result.branchId,
      waiterId: result.waiterId,
      tableId: result.tableId,
      assignedById: result.assignedById,
      sessionStart: result.sessionStart,
      sessionEnd: result.sessionEnd,
      isActive: result.isActive ?? true,
      createdAt: result.createdAt ?? new Date(),
    };
  }

  async findActiveTableAssignmentsForWaiter(
    waiterId: string,
    branchId: string,
    additionalId?: string,
  ): Promise<any[]> {
    if (!branchId || !isUUID(branchId)) {
      return [];
    }

    const qb = new DrizzleQueryBuilder<any>(this.db, waiterTableAssignments)
      .select({
        id: waiterTableAssignments.id,
        branchId: waiterTableAssignments.branchId,
        waiterId: waiterTableAssignments.waiterId,
        tableId: waiterTableAssignments.tableId,
        assignedById: waiterTableAssignments.assignedById,
        sessionStart: waiterTableAssignments.sessionStart,
        sessionEnd: waiterTableAssignments.sessionEnd,
        isActive: waiterTableAssignments.isActive,
        tableNumber: tables.label,
        capacity: tables.capacity,
        serviceStatus: tables.serviceStatus,
        shape: tables.shape,
      })
      .innerJoin(tables, eq(waiterTableAssignments.tableId, tables.id))
      .filterExact({ branchId })
      .softDelete({ column: waiterTableAssignments.isActive, activeValue: true })
      .orWhere(
        eq(waiterTableAssignments.waiterId, waiterId),
        ...(additionalId ? [eq(waiterTableAssignments.waiterId, additionalId)] : []),
      );

    const rows = await qb.executePlain();

    if (rows.length > 0) {
      return rows;
    }

    const fallbackQb = new DrizzleQueryBuilder<typeof tables>(this.db, tables)
      .filterExact({ branchId });

    const allTables = await fallbackQb.executePlain();

    return allTables.map((t) => ({
      id: t.id,
      branchId: t.branchId,
      waiterId: additionalId ?? waiterId,
      tableId: t.id,
      tableNumber: t.label,
      capacity: t.capacity,
      serviceStatus: t.serviceStatus,
      shape: t.shape,
      sessionStart: new Date(),
      sessionEnd: new Date(Date.now() + 8 * 60 * 60 * 1000),
      isActive: true,
      createdAt: t.createdAt ?? new Date(),
    }));
  }

  async isTableAssignedToWaiter(
    waiterId: string,
    tableId: string,
    branchId: string,
  ): Promise<boolean> {
    if (!tableId || !branchId || !isUUID(tableId) || !isUUID(branchId)) {
      return false;
    }
    const profile = await this.findProfileByUserId(waiterId);

    const result = await this.db
      .select({ id: waiterTableAssignments.id })
      .from(waiterTableAssignments)
      .where(
        and(
          or(
            eq(waiterTableAssignments.waiterId, waiterId),
            ...(profile?.id ? [eq(waiterTableAssignments.waiterId, profile.id)] : []),
          ),
          eq(waiterTableAssignments.tableId, tableId),
          eq(waiterTableAssignments.branchId, branchId),
          eq(waiterTableAssignments.isActive, true),
        ),
      )
      .limit(1);

    if (result.length > 0) return true;

    if (profile) {
      const isAssigned = await this.isStaffAssignedToBranch(profile.id, branchId);
      if (isAssigned) {
        return true;
      }
    }

    return false;
  }

  async releaseTable(assignmentId: string): Promise<void> {
    await this.db
      .update(waiterTableAssignments)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(waiterTableAssignments.id, assignmentId));
  }

  async updateTableStatus(tableId: string, serviceStatus: any): Promise<void> {
    await this.db
      .update(tables)
      .set({ serviceStatus, updatedAt: new Date() })
      .where(eq(tables.id, tableId));
  }
}
