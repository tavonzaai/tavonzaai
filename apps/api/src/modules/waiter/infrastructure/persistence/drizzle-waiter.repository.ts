// ============================================================================
// Drizzle Waiter Repository — Staff / Table Assignment Persistence
// ============================================================================

import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { eq, and, lte, gte } from 'drizzle-orm';
import {
  DRIZZLE,
  type DrizzleDatabase,
  staff,
  staffAssignments,
  waiterTableAssignments,
  tables,
} from '@tavonza/database';
import type {
  StaffProfile,
  BranchStaffAssignment,
  WaiterTableAssignment,
} from '../../domain/entities/waiter.entity';

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

    if (!result) throw new Error('Failed to create staff profile');

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

    if (!result) throw new Error('Failed to assign staff to branch');

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
    const rows = await this.db
      .select()
      .from(staffAssignments)
      .where(
        and(
          eq(staffAssignments.staffId, staffId),
          eq(staffAssignments.isActive, true),
        ),
      );

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

    // Validate no active assignment overlaps for this table in this branch
    const overlapping = await this.db
      .select({ id: waiterTableAssignments.id })
      .from(waiterTableAssignments)
      .where(
        and(
          eq(waiterTableAssignments.tableId, data.tableId),
          eq(waiterTableAssignments.branchId, data.branchId),
          eq(waiterTableAssignments.isActive, true),
          lte(waiterTableAssignments.sessionStart, end),
          gte(waiterTableAssignments.sessionEnd, start),
        ),
      )
      .limit(1);

    if (overlapping.length > 0) {
      throw new BadRequestException(
        'Table is already assigned to an active waiter for this shift window',
      );
    }

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

    if (!result) throw new Error('Failed to assign table to waiter');

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
  ): Promise<WaiterTableAssignment[]> {
    const rows = await this.db
      .select()
      .from(waiterTableAssignments)
      .where(
        and(
          eq(waiterTableAssignments.waiterId, waiterId),
          eq(waiterTableAssignments.branchId, branchId),
          eq(waiterTableAssignments.isActive, true),
        ),
      );

    return rows.map((r) => ({
      id: r.id,
      branchId: r.branchId,
      waiterId: r.waiterId,
      tableId: r.tableId,
      assignedById: r.assignedById,
      sessionStart: r.sessionStart,
      sessionEnd: r.sessionEnd,
      isActive: r.isActive ?? true,
      createdAt: r.createdAt ?? new Date(),
    }));
  }

  async isTableAssignedToWaiter(
    waiterId: string,
    tableId: string,
    branchId: string,
  ): Promise<boolean> {
    const result = await this.db
      .select({ id: waiterTableAssignments.id })
      .from(waiterTableAssignments)
      .where(
        and(
          eq(waiterTableAssignments.waiterId, waiterId),
          eq(waiterTableAssignments.tableId, tableId),
          eq(waiterTableAssignments.branchId, branchId),
          eq(waiterTableAssignments.isActive, true),
        ),
      )
      .limit(1);

    return result.length > 0;
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
