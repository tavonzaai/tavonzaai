import { Injectable, Inject } from '@nestjs/common';
import { eq, and, or } from 'drizzle-orm';
import { DrizzleQueryBuilder } from '../../../../common/database';
import * as argon2 from 'argon2';
import {
  DRIZZLE,
  type DrizzleDatabase,
  branches,
  branchSettings,
  branchOperatingHours,
  branchHolidays,
  staff,
  staffAssignments,
  users,
} from '@tavonza/database';
import type {
  Branch,
  BranchSettings,
  BranchOperatingHours,
  BranchHoliday,
} from '../../domain/entities/branch.entity';
import {
  ResourceConflictException,
  InternalOperationException,
} from '../../../../common/errors/app.exception';

@Injectable()
export class DrizzleBranchRepository {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDatabase) {}

  // ── Branches ──────────────────────────────────────────────────────────

  async createBranch(data: {
    restaurantId: string;
    name: string;
    address: any;
    phone?: string;
    timezone?: string;
  }): Promise<Branch> {
    const [created] = await this.db
      .insert(branches)
      .values({
        restaurantId: data.restaurantId,
        name: data.name,
        address: data.address,
        phone: data.phone,
        timezone: data.timezone ?? 'UTC',
      })
      .returning();

    if (!created) {
      throw new InternalOperationException('Failed to create branch record');
    }

    // Automatically create default branch settings
    await this.db.insert(branchSettings).values({
      branchId: created.id,
    });

    return this.mapBranch(created);
  }

  async findBranchById(id: string): Promise<Branch | null> {
    const [row] = await this.db
      .select()
      .from(branches)
      .where(eq(branches.id, id))
      .limit(1);

    return row ? this.mapBranch(row) : null;
  }

  async findAllBranches(options?: {
    restaurantId?: string;
    search?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    includeDeleted?: boolean;
  }): Promise<{ data: Branch[]; meta: any }> {
    const builder = DrizzleQueryBuilder.from(this.db, branches)
      .paginate({ page: options?.page, limit: options?.limit })
      .filterExact({ restaurantId: options?.restaurantId })
      .search(options?.search, [branches.name, branches.phone])
      .softDelete({
        column: branches.isActive,
        activeValue: true,
        includeDeleted: options?.includeDeleted,
      })
      .sort(options?.sortBy, options?.sortOrder, branches.createdAt);

    return builder.execute((r) => this.mapBranch(r));
  }

  async findBranchesByRestaurantId(restaurantId: string, includeDeleted = false): Promise<Branch[]> {
    return DrizzleQueryBuilder.from(this.db, branches)
      .filterExact({ restaurantId })
      .softDelete({
        column: branches.isActive,
        activeValue: true,
        includeDeleted,
      })
      .sort(branches.createdAt, 'desc')
      .executePlain((r) => this.mapBranch(r));
  }

  async softDeleteBranch(id: string): Promise<Branch | null> {
    return this.updateBranch(id, { isActive: false });
  }

  async updateBranch(
    id: string,
    data: Partial<{
      name: string;
      address: any;
      phone: string | null;
      timezone: string;
      isActive: boolean;
    }>,
  ): Promise<Branch | null> {
    const [updated] = await this.db
      .update(branches)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(branches.id, id))
      .returning();

    return updated ? this.mapBranch(updated) : null;
  }

  // ── Branch Settings ───────────────────────────────────────────────────

  async findSettingsByBranchId(branchId: string): Promise<BranchSettings | null> {
    const [row] = await this.db
      .select()
      .from(branchSettings)
      .where(eq(branchSettings.branchId, branchId))
      .limit(1);

    return row ? this.mapSettings(row) : null;
  }

  async updateSettings(
    branchId: string,
    data: Partial<Omit<BranchSettings, 'id' | 'branchId' | 'createdAt' | 'updatedAt'>>,
  ): Promise<BranchSettings | null> {
    const [updated] = await this.db
      .update(branchSettings)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(branchSettings.branchId, branchId))
      .returning();

    return updated ? this.mapSettings(updated) : null;
  }

  // ── Operating Hours ───────────────────────────────────────────────────

  async findOperatingHours(branchId: string): Promise<BranchOperatingHours[]> {
    return DrizzleQueryBuilder.from(this.db, branchOperatingHours)
      .filterExact({ branchId })
      .sort(branchOperatingHours.dayOfWeek, 'asc')
      .executePlain((r) => ({
        id: r.id,
        branchId: r.branchId,
        dayOfWeek: r.dayOfWeek,
        openTime: r.openTime,
        closeTime: r.closeTime,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
      }));
  }

  async replaceOperatingHours(
    branchId: string,
    hours: Array<{ dayOfWeek: number; openTime: string; closeTime: string }>,
  ): Promise<BranchOperatingHours[]> {
    await this.db
      .delete(branchOperatingHours)
      .where(eq(branchOperatingHours.branchId, branchId));

    if (hours.length === 0) return [];

    const inserted = await this.db
      .insert(branchOperatingHours)
      .values(
        hours.map((h) => ({
          branchId,
          dayOfWeek: h.dayOfWeek,
          openTime: h.openTime,
          closeTime: h.closeTime,
        })),
      )
      .returning();

    return inserted.map((r) => ({
      id: r.id,
      branchId: r.branchId,
      dayOfWeek: r.dayOfWeek,
      openTime: r.openTime,
      closeTime: r.closeTime,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    }));
  }

  // ── Holidays ──────────────────────────────────────────────────────────

  async findHolidays(branchId: string): Promise<BranchHoliday[]> {
    return DrizzleQueryBuilder.from(this.db, branchHolidays)
      .filterExact({ branchId })
      .sort(branchHolidays.date, 'asc')
      .executePlain((r) => ({
        id: r.id,
        branchId: r.branchId,
        date: r.date,
        isClosed: r.isClosed ?? true,
        label: r.label,
        openTime: r.openTime,
        closeTime: r.closeTime,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
      }));
  }

  async createHoliday(data: {
    branchId: string;
    date: string;
    isClosed?: boolean;
    label?: string;
    openTime?: string;
    closeTime?: string;
  }): Promise<BranchHoliday> {
    const [created] = await this.db
      .insert(branchHolidays)
      .values({
        branchId: data.branchId,
        date: data.date,
        isClosed: data.isClosed ?? true,
        label: data.label,
        openTime: data.openTime,
        closeTime: data.closeTime,
      })
      .returning();

    if (!created) {
      throw new InternalOperationException('Failed to create holiday schedule');
    }

    return {
      id: created.id,
      branchId: created.branchId,
      date: created.date,
      isClosed: created.isClosed ?? true,
      label: created.label,
      openTime: created.openTime,
      closeTime: created.closeTime,
      createdAt: created.createdAt,
      updatedAt: created.updatedAt,
    };
  }

  // ── Mappers ───────────────────────────────────────────────────────────

  private mapBranch(row: any): Branch {
    return {
      id: row.id,
      restaurantId: row.restaurantId,
      name: row.name,
      address: row.address,
      phone: row.phone,
      timezone: row.timezone ?? 'UTC',
      isActive: row.isActive ?? true,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }

  private mapSettings(row: any): BranchSettings {
    return {
      id: row.id,
      branchId: row.branchId,
      orderAcceptanceMode: row.orderAcceptanceMode,
      backupAccepterRoles: row.backupAccepterRoles,
      hideUnavailableItems: row.hideUnavailableItems ?? false,
      allowMultipleGuestSessions: row.allowMultipleGuestSessions ?? true,
      requireOtpPerGuest: row.requireOtpPerGuest ?? true,
      allowSplitBill: row.allowSplitBill ?? true,
      allowGuestCheckoutWithoutAccount: row.allowGuestCheckoutWithoutAccount ?? true,
      autoCloseIdleSessionMins: row.autoCloseIdleSessionMins,
      currency: row.currency ?? 'USD',
      taxPercent: row.taxPercent ?? 0,
      serviceChargePct: row.serviceChargePct ?? 0,
      tipEnabled: row.tipEnabled ?? true,
      reservationsEnabled: row.reservationsEnabled ?? true,
      waitlistEnabled: row.waitlistEnabled ?? true,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }

  // ── Staff Assignments ──────────────────────────────────────────────────

  async findStaffByBranchId(branchId: string, filters?: { role?: string; search?: string }) {
    const roleFilter = filters?.role && filters.role !== 'ALL' ? (filters.role.toUpperCase() as any) : undefined;
    return DrizzleQueryBuilder.from(this.db, staffAssignments)
      .innerJoin(staff, eq(staff.id, staffAssignments.staffId))
      .innerJoin(users, eq(users.id, staff.userId))
      .filterExact({
        branchId,
        role: roleFilter,
        isActive: true,
      })
      .search(filters?.search, [users.name, users.email, users.contactNo])
      .select({
        id: staffAssignments.id,
        staffId: staffAssignments.staffId,
        branchId: staffAssignments.branchId,
        role: staffAssignments.role,
        permissions: staffAssignments.permissions,
        isActive: staffAssignments.isActive,
        assignedAt: staffAssignments.createdAt,
        name: users.name,
        email: users.email,
        phone: users.contactNo,
      })
      .sort(staffAssignments.createdAt, 'desc')
      .executePlain();
  }

  async updateStaffAssignment(
    branchId: string,
    staffIdOrAssignmentId: string,
    updates: Partial<{ role: any; permissions: string[]; isActive: boolean }>,
  ) {
    const [updated] = await this.db
      .update(staffAssignments)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(staffAssignments.branchId, branchId),
          or(
            eq(staffAssignments.id, staffIdOrAssignmentId),
            eq(staffAssignments.staffId, staffIdOrAssignmentId),
          ),
        ),
      )
      .returning();

    return updated || null;
  }

  async findStaffMemberById(branchId: string, staffIdOrAssignmentId: string) {
    const [result] = await this.db
      .select({
        id: staffAssignments.id,
        staffId: staffAssignments.staffId,
        branchId: staffAssignments.branchId,
        role: staffAssignments.role,
        permissions: staffAssignments.permissions,
        isActive: staffAssignments.isActive,
        assignedAt: staffAssignments.createdAt,
        name: users.name,
        email: users.email,
        phone: users.contactNo,
      })
      .from(staffAssignments)
      .innerJoin(staff, eq(staff.id, staffAssignments.staffId))
      .innerJoin(users, eq(users.id, staff.userId))
      .where(
        and(
          eq(staffAssignments.branchId, branchId),
          or(
            eq(staffAssignments.id, staffIdOrAssignmentId),
            eq(staffAssignments.staffId, staffIdOrAssignmentId)
          )
        )
      )
      .limit(1);

    return result || null;
  }

  async createStaffAndAssignment(data: {
    branchId: string;
    name: string;
    email: string;
    password: string;
    phone?: string;
    role: any;
    permissions?: string[];
  }) {
    const emailNormalized = data.email.trim().toLowerCase();

    // 1. Check if user already exists
    const [existingUser] = await this.db
      .select()
      .from(users)
      .where(eq(users.email, emailNormalized))
      .limit(1);

    let userId = existingUser?.id;

    if (!userId) {
      const cleanPhone = data.phone?.trim() || null;
      if (cleanPhone) {
        const [existingPhone] = await this.db
          .select()
          .from(users)
          .where(eq(users.contactNo, cleanPhone))
          .limit(1);
        if (existingPhone) {
          throw new ResourceConflictException(`Phone number "${cleanPhone}" is already in use by another user.`, {
            errorMessages: [{ path: 'phone', message: 'This phone number is already in use.' }],
          });
        }
      }

      const passwordHash = await argon2.hash(data.password);
      const [newUser] = await this.db
        .insert(users)
        .values({
          name: data.name.trim(),
          email: emailNormalized,
          password: passwordHash,
          contactNo: cleanPhone,
          role: 'STAFF',
          status: 'ACTIVE',
        })
        .returning();
      if (!newUser) throw new InternalOperationException('Failed to create user record');
      userId = newUser.id;
    }

    // 2. Check if staff entity exists for this user
    const [existingStaff] = await this.db
      .select()
      .from(staff)
      .where(eq(staff.userId, userId))
      .limit(1);

    let staffId = existingStaff?.id;
    if (!staffId) {
      const [newStaff] = await this.db
        .insert(staff)
        .values({
          userId,
        })
        .returning();
      if (!newStaff) throw new InternalOperationException('Failed to create staff record');
      staffId = newStaff.id;
    }

    // 3. Assign staff to branch
    const [assignment] = await this.db
      .insert(staffAssignments)
      .values({
        branchId: data.branchId,
        staffId,
        role: data.role,
        permissions: data.permissions ?? [],
        isActive: true,
      })
      .onConflictDoUpdate({
        target: [staffAssignments.staffId, staffAssignments.branchId],
        set: {
          role: data.role,
          permissions: data.permissions ?? [],
          isActive: true,
          updatedAt: new Date(),
        },
      })
      .returning();

    if (!assignment) throw new InternalOperationException('Failed to assign staff to branch');

    return {
      id: assignment.id,
      staffId,
      branchId: data.branchId,
      role: assignment.role,
      permissions: assignment.permissions,
      isActive: assignment.isActive,
      assignedAt: assignment.createdAt,
      name: data.name.trim(),
      email: emailNormalized,
      phone: data.phone,
    };
  }

  async assignStaff(data: {
    branchId: string;
    staffId: string;
    role: any;
    permissions?: string[];
  }) {
    const [created] = await this.db
      .insert(staffAssignments)
      .values({
        branchId: data.branchId,
        staffId: data.staffId,
        role: data.role,
        permissions: data.permissions ?? [],
      })
      .onConflictDoUpdate({
        target: [staffAssignments.staffId, staffAssignments.branchId],
        set: {
          role: data.role,
          permissions: data.permissions ?? [],
          isActive: true,
          updatedAt: new Date(),
        },
      })
      .returning();

    return created;
  }
}
