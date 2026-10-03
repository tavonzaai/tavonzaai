import { Injectable, Inject } from '@nestjs/common';
import { eq } from 'drizzle-orm';
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
      throw new Error('Failed to create branch');
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

  async findBranchesByRestaurantId(restaurantId: string): Promise<Branch[]> {
    const rows = await this.db
      .select()
      .from(branches)
      .where(eq(branches.restaurantId, restaurantId));

    return rows.map((r) => this.mapBranch(r));
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
    const rows = await this.db
      .select()
      .from(branchOperatingHours)
      .where(eq(branchOperatingHours.branchId, branchId));

    return rows.map((r) => ({
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
    const rows = await this.db
      .select()
      .from(branchHolidays)
      .where(eq(branchHolidays.branchId, branchId));

    return rows.map((r) => ({
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
      throw new Error('Failed to create holiday schedule');
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

  async findStaffByBranchId(branchId: string) {
    return this.db
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
      .where(eq(staffAssignments.branchId, branchId));
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
