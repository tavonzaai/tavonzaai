// ============================================================================
// Drizzle Waiter Repository — Staff / Table Assignment Persistence
// ============================================================================

import { Injectable, Inject } from '@nestjs/common';
import { eq, and } from 'drizzle-orm';
import { DRIZZLE } from '@tavonza/database';
import {
  staffProfiles,
  branchStaffAssignments,
  waiterTableAssignments,
} from '@tavonza/database';
import type {
  StaffProfile,
  BranchStaffAssignment,
  WaiterTableAssignment,
} from '../../domain/entities/waiter.entity';

type DrizzleDb = any;

@Injectable()
export class DrizzleWaiterRepository {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDb) {}

  // ── Staff Profiles ──────────────────────────────────────────────────

  async createProfile(data: {
    userId: string;
    organizationId: string;
    restaurantId: string;
    employeeCode?: string;
    jobTitle?: string;
  }): Promise<StaffProfile> {
    const result = await this.db
      .insert(staffProfiles)
      .values({
        userId: data.userId,
        organizationId: data.organizationId,
        restaurantId: data.restaurantId,
        employeeCode: data.employeeCode ?? null,
        jobTitle: data.jobTitle ?? 'Waiter',
        status: 'active',
      })
      .returning();
    return result[0];
  }

  async findProfileByUserId(userId: string): Promise<StaffProfile | null> {
    const result = await this.db
      .select()
      .from(staffProfiles)
      .where(eq(staffProfiles.userId, userId))
      .limit(1);
    return result[0] ?? null;
  }

  // ── Branch Staff Assignments ────────────────────────────────────────

  async assignToBranch(data: {
    branchId: string;
    staffProfileId: string;
    assignedById: string;
  }): Promise<BranchStaffAssignment> {
    const result = await this.db
      .insert(branchStaffAssignments)
      .values({
        branchId: data.branchId,
        staffProfileId: data.staffProfileId,
        assignedById: data.assignedById,
        isActive: true,
      })
      .returning();
    return result[0];
  }

  async findActiveBranchesForStaff(staffProfileId: string): Promise<BranchStaffAssignment[]> {
    return this.db
      .select()
      .from(branchStaffAssignments)
      .where(
        and(
          eq(branchStaffAssignments.staffProfileId, staffProfileId),
          eq(branchStaffAssignments.isActive, true),
        ),
      );
  }

  async isStaffAssignedToBranch(staffProfileId: string, branchId: string): Promise<boolean> {
    const result = await this.db
      .select({ id: branchStaffAssignments.id })
      .from(branchStaffAssignments)
      .where(
        and(
          eq(branchStaffAssignments.staffProfileId, staffProfileId),
          eq(branchStaffAssignments.branchId, branchId),
          eq(branchStaffAssignments.isActive, true),
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
    shiftDate: string;
  }): Promise<WaiterTableAssignment> {
    const result = await this.db
      .insert(waiterTableAssignments)
      .values({
        branchId: data.branchId,
        waiterId: data.waiterId,
        tableId: data.tableId,
        assignedById: data.assignedById,
        shiftDate: data.shiftDate,
        isActive: true,
      })
      .returning();
    return result[0];
  }

  async findActiveTableAssignmentsForWaiter(
    waiterId: string,
    branchId: string,
    shiftDate?: string,
  ): Promise<WaiterTableAssignment[]> {
    const conditions: any[] = [
      eq(waiterTableAssignments.waiterId, waiterId),
      eq(waiterTableAssignments.branchId, branchId),
      eq(waiterTableAssignments.isActive, true),
    ];

    if (shiftDate) {
      conditions.push(eq(waiterTableAssignments.shiftDate, shiftDate));
    }

    return this.db
      .select()
      .from(waiterTableAssignments)
      .where(and(...conditions));
  }

  async isTableAssignedToWaiter(
    waiterId: string,
    tableId: string,
    branchId: string,
  ): Promise<boolean> {
    const today = (new Date().toISOString().split('T')[0]) as string;
    const result = await this.db
      .select({ id: waiterTableAssignments.id })
      .from(waiterTableAssignments)
      .where(
        and(
          eq(waiterTableAssignments.waiterId, waiterId),
          eq(waiterTableAssignments.tableId, tableId),
          eq(waiterTableAssignments.branchId, branchId),
          eq(waiterTableAssignments.isActive, true),
          eq(waiterTableAssignments.shiftDate, today),
        ),
      )
      .limit(1);
    return result.length > 0;
  }

  async releaseTable(assignmentId: string): Promise<void> {
    await this.db
      .update(waiterTableAssignments)
      .set({ isActive: false, releasedAt: new Date() })
      .where(eq(waiterTableAssignments.id, assignmentId));
  }
}
