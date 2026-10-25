// ============================================================================
// Drizzle Waiter Repository — Staff / Table Assignment Persistence
// ============================================================================

import { Injectable, Inject } from '@nestjs/common';
import { eq, and, or, inArray } from 'drizzle-orm';
import {
  DRIZZLE,
  type DrizzleDatabase,
  staff,
  staffAssignments,
  waiterTableAssignments,
  tables,
  users,
} from '@/database';
import { isUUID } from '@/common/shared';
import { DrizzleQueryBuilder } from '../../../common/database';

import type {
  StaffProfile,
  BranchStaffAssignment,
} from '../domain/waiter.entity';
import { InternalOperationException } from '../../../common/errors/app.exception';

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
    tableId?: string;
    tableIds?: string[];
    assignedById: string;
    sessionStart?: Date;
    sessionEnd?: Date;
  }): Promise<any> {
    const start = data.sessionStart ?? new Date();
    const end = data.sessionEnd ?? new Date(Date.now() + 8 * 60 * 60 * 1000); // 8-hour shift default

    // Collect all target table IDs
    const targetTableIds: string[] = [];
    if (data.tableId && isUUID(data.tableId)) {
      targetTableIds.push(data.tableId);
    }
    if (Array.isArray(data.tableIds)) {
      for (const tid of data.tableIds) {
        if (isUUID(tid) && !targetTableIds.includes(tid)) {
          targetTableIds.push(tid);
        }
      }
    }

    if (targetTableIds.length === 0) {
      throw new InternalOperationException('At least one valid table UUID must be provided for assignment');
    }

    // Resolve waiter staff profile and user record
    let resolvedStaffId = data.waiterId;
    let resolvedUserId = data.waiterId;
    let resolvedWaiterName = 'Staff Member';

    const staffRow = await this.db
      .select({
        staffId: staff.id,
        userId: users.id,
        name: users.name,
      })
      .from(staff)
      .innerJoin(users, eq(staff.userId, users.id))
      .where(or(eq(staff.userId, data.waiterId), eq(staff.id, data.waiterId)))
      .limit(1);

    if (staffRow.length > 0 && staffRow[0]) {
      resolvedStaffId = staffRow[0].staffId;
      resolvedUserId = staffRow[0].userId;
      resolvedWaiterName = staffRow[0].name;
    }

    // Deactivate previous active assignments for these tables so reassignment succeeds seamlessly
    await this.db
      .update(waiterTableAssignments)
      .set({ isActive: false, updatedAt: new Date() })
      .where(
        and(
          inArray(waiterTableAssignments.tableId, targetTableIds),
          eq(waiterTableAssignments.branchId, data.branchId),
          eq(waiterTableAssignments.isActive, true),
        ),
      );

    // Insert new assignments for all target tables
    const insertValues = targetTableIds.map((tId) => ({
      branchId: data.branchId,
      waiterId: resolvedStaffId,
      tableId: tId,
      assignedById: data.assignedById,
      sessionStart: start,
      sessionEnd: end,
      isActive: true,
    }));

    const insertedResults = await this.db
      .insert(waiterTableAssignments)
      .values(insertValues)
      .returning();

    // Query all currently active assignments for this waiter in this branch with full table details
    const activeAssignments = await this.db
      .select({
        assignmentId: waiterTableAssignments.id,
        tableId: tables.id,
        label: tables.label,
        capacity: tables.capacity,
        serviceStatus: tables.serviceStatus,
        operationalFlag: tables.operationalFlag,
        floor: tables.floor,
        shape: tables.shape,
        sessionStart: waiterTableAssignments.sessionStart,
        sessionEnd: waiterTableAssignments.sessionEnd,
        assignedAt: waiterTableAssignments.createdAt,
      })
      .from(waiterTableAssignments)
      .innerJoin(tables, eq(waiterTableAssignments.tableId, tables.id))
      .where(
        and(
          eq(waiterTableAssignments.branchId, data.branchId),
          eq(waiterTableAssignments.waiterId, resolvedStaffId),
          eq(waiterTableAssignments.isActive, true),
        ),
      );

    const assignedTables = activeAssignments.map((a) => ({
      id: a.tableId,
      label: a.label,
      tableNumber: a.label,
      capacity: a.capacity,
      serviceStatus: a.serviceStatus ?? 'AVAILABLE',
      operationalFlag: a.operationalFlag ?? 'NORMAL',
      floor: a.floor ?? 1,
      shape: a.shape ?? 'SQUARE',
      assignmentId: a.assignmentId,
      sessionStart: a.sessionStart,
      sessionEnd: a.sessionEnd,
      isActive: true,
    }));

    const primaryAssignment = insertedResults[0];
    const primaryTable = assignedTables.find((t) => t.id === targetTableIds[0]) || assignedTables[0];

    return {
      id: primaryAssignment ? primaryAssignment.id : (activeAssignments[0]?.assignmentId ?? ''),
      branchId: data.branchId,
      waiterId: resolvedUserId,
      waiterName: resolvedWaiterName,
      tableId: primaryTable?.id ?? targetTableIds[0],
      tableNumber: primaryTable?.label ?? '',
      capacity: primaryTable?.capacity ?? 4,
      serviceStatus: primaryTable?.serviceStatus ?? 'AVAILABLE',
      assignedTables,
      assignedCount: assignedTables.length,
      isActive: true,
      assignedAt: primaryAssignment?.createdAt ?? new Date(),
      sessionStart: start,
      sessionEnd: end,
    };
  }

  async unassignTable(data: {
    branchId: string;
    waiterId?: string;
    tableId?: string;
    tableIds?: string[];
    assignmentId?: string;
  }): Promise<any> {
    const conditions: any[] = [
      eq(waiterTableAssignments.branchId, data.branchId),
      eq(waiterTableAssignments.isActive, true),
    ];

    if (data.assignmentId && isUUID(data.assignmentId)) {
      conditions.push(eq(waiterTableAssignments.id, data.assignmentId));
    } else if (data.tableId && isUUID(data.tableId)) {
      conditions.push(eq(waiterTableAssignments.tableId, data.tableId));
    } else if (Array.isArray(data.tableIds) && data.tableIds.length > 0) {
      conditions.push(inArray(waiterTableAssignments.tableId, data.tableIds));
    }

    if (data.waiterId && isUUID(data.waiterId)) {
      const profile = await this.findProfileByUserId(data.waiterId);
      conditions.push(
        or(
          eq(waiterTableAssignments.waiterId, data.waiterId),
          ...(profile ? [eq(waiterTableAssignments.waiterId, profile.id)] : []),
        ),
      );
    }

    await this.db
      .update(waiterTableAssignments)
      .set({ isActive: false, updatedAt: new Date() })
      .where(and(...conditions));

    if (data.waiterId) {
      return this.findActiveTableAssignmentsForWaiter(data.waiterId, data.branchId);
    }
    return { success: true };
  }

  async findAssignmentsForBranch(branchId: string, waiterId?: string): Promise<any[]> {
    if (!branchId || !isUUID(branchId)) return [];

    let waiterStaffId: string | undefined;
    if (waiterId && isUUID(waiterId)) {
      const profile = await this.findProfileByUserId(waiterId);
      waiterStaffId = profile?.id ?? waiterId;
    }

    const conditions: any[] = [
      eq(waiterTableAssignments.branchId, branchId),
      eq(waiterTableAssignments.isActive, true),
    ];

    if (waiterStaffId) {
      conditions.push(
        or(
          eq(waiterTableAssignments.waiterId, waiterStaffId),
          eq(waiterTableAssignments.waiterId, waiterId!),
        ),
      );
    }

    const rows = await this.db
      .select({
        id: waiterTableAssignments.id,
        branchId: waiterTableAssignments.branchId,
        waiterStaffId: waiterTableAssignments.waiterId,
        waiterUserId: users.id,
        waiterName: users.name,
        tableId: tables.id,
        tableLabel: tables.label,
        capacity: tables.capacity,
        serviceStatus: tables.serviceStatus,
        operationalFlag: tables.operationalFlag,
        floor: tables.floor,
        shape: tables.shape,
        sessionStart: waiterTableAssignments.sessionStart,
        sessionEnd: waiterTableAssignments.sessionEnd,
        assignedAt: waiterTableAssignments.createdAt,
        isActive: waiterTableAssignments.isActive,
      })
      .from(waiterTableAssignments)
      .innerJoin(tables, eq(waiterTableAssignments.tableId, tables.id))
      .innerJoin(staff, eq(waiterTableAssignments.waiterId, staff.id))
      .innerJoin(users, eq(staff.userId, users.id))
      .where(and(...conditions));

    return rows.map((r) => ({
      id: r.id,
      branchId: r.branchId,
      waiterId: r.waiterUserId || r.waiterStaffId,
      waiterName: r.waiterName,
      tableId: r.tableId,
      tableNumber: r.tableLabel,
      capacity: r.capacity,
      serviceStatus: r.serviceStatus ?? 'AVAILABLE',
      operationalFlag: r.operationalFlag ?? 'NORMAL',
      floor: r.floor ?? 1,
      shape: r.shape ?? 'SQUARE',
      sessionStart: r.sessionStart,
      sessionEnd: r.sessionEnd,
      assignedAt: r.assignedAt,
      isActive: r.isActive ?? true,
    }));
  }

  async findActiveTableAssignmentsForWaiter(
    waiterId: string,
    branchId: string,
    additionalId?: string,
  ): Promise<any[]> {
    if (!branchId || !isUUID(branchId)) {
      return [];
    }

    // Resolve waiter name and staff profile
    let waiterName = 'Waiter';
    let profileStaffId = additionalId;
    const staffRow = await this.db
      .select({
        staffId: staff.id,
        name: users.name,
      })
      .from(staff)
      .innerJoin(users, eq(staff.userId, users.id))
      .where(or(eq(staff.userId, waiterId), eq(staff.id, waiterId)))
      .limit(1);

    if (staffRow.length > 0 && staffRow[0]) {
      profileStaffId = staffRow[0].staffId;
      waiterName = staffRow[0].name;
    }

    const rows = await this.db
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
        floor: tables.floor,
        operationalFlag: tables.operationalFlag,
      })
      .from(waiterTableAssignments)
      .innerJoin(tables, eq(waiterTableAssignments.tableId, tables.id))
      .where(
        and(
          eq(waiterTableAssignments.branchId, branchId),
          eq(waiterTableAssignments.isActive, true),
          or(
            eq(waiterTableAssignments.waiterId, waiterId),
            ...(profileStaffId ? [eq(waiterTableAssignments.waiterId, profileStaffId)] : []),
          ),
        ),
      );

    if (rows.length > 0) {
      const assignedTables = rows.map((r) => ({
        id: r.tableId,
        label: r.tableNumber,
        tableNumber: r.tableNumber,
        capacity: r.capacity,
        serviceStatus: r.serviceStatus ?? 'AVAILABLE',
        operationalFlag: r.operationalFlag ?? 'NORMAL',
        floor: r.floor ?? 1,
        shape: r.shape ?? 'SQUARE',
        assignmentId: r.id,
        sessionStart: r.sessionStart,
        sessionEnd: r.sessionEnd,
        isActive: true,
      }));

      return rows.map((r) => ({
        ...r,
        waiterName,
        assignedTables,
        assignedCount: assignedTables.length,
      }));
    }

    return [];
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
