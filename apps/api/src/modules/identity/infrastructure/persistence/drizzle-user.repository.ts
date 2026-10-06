// ============================================================================
// Drizzle User Repository — Identity Persistence
// ============================================================================

import { Injectable, Inject } from '@nestjs/common';
import { eq, or, and, gt, ilike, desc, asc, sql, inArray } from 'drizzle-orm';
import { DRIZZLE, schema } from '@tavonza/database';

type DrizzleDb = any;

@Injectable()
export class DrizzleUserRepository {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDb) {}

  // ── Users ──────────────────────────────────────────────────────────────

  async findByEmail(email: string) {
    const result = await this.db
      .select()
      .from(schema.users)
      .where(eq(schema.users.email, email))
      .limit(1);
    return result[0] ?? null;
  }

  async findByEmailOrPhone(identifier: string) {
    const trimmed = identifier.trim();
    const result = await this.db
      .select()
      .from(schema.users)
      .where(or(eq(schema.users.email, trimmed.toLowerCase()), eq(schema.users.contactNo, trimmed)))
      .limit(1);
    return result[0] ?? null;
  }

  async findById(id: string) {
    const result = await this.db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, id))
      .limit(1);
    return result[0] ?? null;
  }

  async findByIdWithRelations(id: string) {
    const user = await this.findById(id);
    if (!user) return null;

    let customer = null;
    try {
      const custRows = await this.db
        .select()
        .from(schema.customers)
        .where(eq(schema.customers.userId, id))
        .limit(1);
      customer = custRows[0] ?? null;
    } catch {
      customer = null;
    }

    const assignments = await this.findStaffAssignments(id);

    return {
      ...user,
      customer,
      assignments,
    };
  }

  async create(data: {
    email: string;
    passwordHash: string;
    name: string;
    contactNo?: string;
    role?: any;
    avatar?: string;
  }) {
    const result = await this.db
      .insert(schema.users)
      .values({
        email: data.email,
        password: data.passwordHash,
        name: data.name,
        contactNo: data.contactNo ?? null,
        avatar: data.avatar ?? null,
        role: data.role ?? 'CUSTOMER',
      })
      .returning();
    
    // Auto-create customer profile
    if (data.role === 'CUSTOMER' || !data.role) {
      await this.db.insert(schema.customers).values({
        userId: result[0].id,
      });
    }

    return result[0];
  }

  async updateProfile(userId: string, data: {
    name?: string;
    contactNo?: string | null;
    avatar?: string | null;
    fcmToken?: string | null;
  }) {
    const updateSet: Record<string, any> = {
      updatedAt: new Date(),
    };

    if (data.name !== undefined) updateSet.name = data.name;
    if (data.contactNo !== undefined) updateSet.contactNo = data.contactNo;
    if (data.avatar !== undefined) updateSet.avatar = data.avatar;
    if (data.fcmToken !== undefined) updateSet.fcmToken = data.fcmToken;

    const result = await this.db
      .update(schema.users)
      .set(updateSet)
      .where(eq(schema.users.id, userId))
      .returning();

    return result[0] ?? null;
  }

  async updateCustomerProfile(userId: string, data: {
    defaultAddress?: any;
    loyaltyPoints?: number;
  }) {
    const existing = await this.db
      .select()
      .from(schema.customers)
      .where(eq(schema.customers.userId, userId))
      .limit(1);

    if (existing[0]) {
      const updateSet: Record<string, any> = {
        updatedAt: new Date(),
      };
      if (data.defaultAddress !== undefined) updateSet.defaultAddress = data.defaultAddress;
      if (data.loyaltyPoints !== undefined) updateSet.loyaltyPoints = data.loyaltyPoints;

      const result = await this.db
        .update(schema.customers)
        .set(updateSet)
        .where(eq(schema.customers.userId, userId))
        .returning();
      return result[0];
    } else {
      const result = await this.db
        .insert(schema.customers)
        .values({
          userId,
          defaultAddress: data.defaultAddress ?? null,
          loyaltyPoints: data.loyaltyPoints ?? 0,
        })
        .returning();
      return result[0];
    }
  }

  async findMany(filters: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
    status?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) {
    const conditions: any[] = [];

    if (filters.role && filters.role.trim()) {
      conditions.push(eq(schema.users.role, filters.role.trim().toUpperCase() as any));
    }

    if (filters.status && filters.status.trim()) {
      conditions.push(eq(schema.users.status, filters.status.trim().toUpperCase() as any));
    }

    if (filters.search && filters.search.trim()) {
      const term = `%${filters.search.trim()}%`;
      conditions.push(
        or(
          ilike(schema.users.name, term),
          ilike(schema.users.email, term),
          ilike(schema.users.contactNo, term),
        ),
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const countQuery = this.db
      .select({ total: sql<number>`cast(count(*) as integer)` })
      .from(schema.users);
    const countRes = whereClause ? await countQuery.where(whereClause) : await countQuery;
    const total = Number(countRes[0]?.total ?? 0);

    const page = Math.max(1, Number(filters.page ?? 1));
    const limit = Math.max(1, Math.min(100, Number(filters.limit ?? 10)));
    const offset = (page - 1) * limit;

    let orderByColumn: any = schema.users.createdAt;
    if (filters.sortBy === 'name') orderByColumn = schema.users.name;
    else if (filters.sortBy === 'email') orderByColumn = schema.users.email;
    else if (filters.sortBy === 'updatedAt') orderByColumn = schema.users.updatedAt;

    const orderClause = filters.sortOrder?.toLowerCase() === 'asc'
      ? asc(orderByColumn)
      : desc(orderByColumn);

    const selectQuery = this.db
      .select({
        id: schema.users.id,
        email: schema.users.email,
        name: schema.users.name,
        contactNo: schema.users.contactNo,
        role: schema.users.role,
        avatar: schema.users.avatar,
        status: schema.users.status,
        createdAt: schema.users.createdAt,
        updatedAt: schema.users.updatedAt,
      })
      .from(schema.users);

    const userRecords = whereClause
      ? await selectQuery.where(whereClause).orderBy(orderClause).limit(limit).offset(offset)
      : await selectQuery.orderBy(orderClause).limit(limit).offset(offset);

    const userIds = userRecords.map((u: any) => u.id);
    const customerMap = new Map<string, any>();
    if (userIds.length > 0) {
      try {
        const custRows = await this.db
          .select()
          .from(schema.customers)
          .where(inArray(schema.customers.userId, userIds));
        for (const c of custRows) {
          customerMap.set(c.userId, c);
        }
      } catch {
        // Continue if customers query fails
      }
    }

    const data = userRecords.map((u: any) => ({
      ...u,
      phone: u.contactNo ?? null,
      customer: customerMap.get(u.id) ?? null,
    }));

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPage: Math.ceil(total / limit) || 1,
      },
    };
  }

  async updateStatus(userId: string, newStatus?: string) {
    let statusToSet = newStatus?.toUpperCase();
    if (!statusToSet) {
      const existing = await this.findById(userId);
      if (!existing) return null;
      statusToSet = existing.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    }

    const result = await this.db
      .update(schema.users)
      .set({ status: statusToSet as any, updatedAt: new Date() })
      .where(eq(schema.users.id, userId))
      .returning();

    return result[0] ?? null;
  }

  async createAdmin(data: {
    email: string;
    passwordHash: string;
    name: string;
    contactNo?: string;
    avatar?: string;
  }) {
    const result = await this.db
      .insert(schema.users)
      .values({
        email: data.email,
        password: data.passwordHash,
        name: data.name,
        contactNo: data.contactNo ?? null,
        avatar: data.avatar ?? null,
        role: 'ADMIN',
      })
      .returning();

    await this.db.insert(schema.admins).values({
      userId: result[0].id,
    });

    return result[0];
  }

  async updatePassword(userId: string, passwordHash: string): Promise<void> {
    await this.db
      .update(schema.users)
      .set({ password: passwordHash, updatedAt: new Date() })
      .where(eq(schema.users.id, userId));
  }

  // ── OTP Codes ──────────────────────────────────────────────────────────

  async createPasswordResetOtp(email: string, code: string, expiresAt: Date) {
    const result = await this.db
      .insert(schema.passwordResetOtps)
      .values({
        email,
        otp: code,
        expiresAt,
      })
      .returning();
    return result[0];
  }

  async findValidPasswordResetOtp(email: string) {
    const result = await this.db
      .select()
      .from(schema.passwordResetOtps)
      .where(
        and(
          eq(schema.passwordResetOtps.email, email),
          gt(schema.passwordResetOtps.expiresAt, new Date())
        )
      )
      .orderBy(schema.passwordResetOtps.createdAt)
      .limit(1);
    return result[0] ?? null;
  }

  // ── Staff Assignments ──────────────────────────────────────────────────

  async findStaffAssignments(userId: string) {
    try {
      const results = await this.db
        .select({
          id: schema.staffAssignments.id,
          branchId: schema.staffAssignments.branchId,
          branchName: schema.branches.name,
          role: schema.staffAssignments.role,
          permissions: schema.staffAssignments.permissions,
          isActive: schema.staffAssignments.isActive,
        })
        .from(schema.staff)
        .innerJoin(schema.staffAssignments, eq(schema.staffAssignments.staffId, schema.staff.id))
        .innerJoin(schema.branches, eq(schema.branches.id, schema.staffAssignments.branchId))
        .where(and(eq(schema.staff.userId, userId), eq(schema.staffAssignments.isActive, true)));
      return results;
    } catch {
      return [];
    }
  }
}
